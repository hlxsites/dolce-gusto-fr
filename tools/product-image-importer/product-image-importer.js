/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import https from 'https';
import { allImagesQuery } from './queries/products.graphql.js';

async function performMonolithGraphQLQuery(query) {
  const GRAPHQL_ENDPOINT = 'https://www.dolce-gusto.fr/graphql';

  const headers = {
    'Content-Type': 'application/json',
    Store: 'default',
  };

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ').replace(/\s\s+/g, ' '),
    }),
  });

  if (!response.ok) {
    console.error(response.status);
    return null;
  }

  return response.json();
}

const imageFolder = './product-images';

const iterateChildCategories = (categories, images) => {
  categories?.forEach((category) => {
    category.products?.items.forEach((product) => {
      images[product.sku] = product.image.url;
    });

    iterateChildCategories(category.children, images);
  });
};

const getImages = async () => {
  const response = await performMonolithGraphQLQuery(allImagesQuery);

  if (!response) {
    console.error('Error fetching products');
    return [];
  }

  const images = [];

  iterateChildCategories(response.data.categories.items, images);

  return images;
};

/**
 * Download file from url and store it at fileName
 * @param {String} url Url that should be downloaded
 * @param {String} fileName Path where file should be stored
 */
const downloadFile = async (url, fileName) => new Promise((resolve, reject) => {
  https.get(url, (response) => {
    const code = response.statusCode ?? 0;

    if (code >= 400) {
      return reject(new Error(response.statusMessage));
    }

    if (code > 300 && code < 400 && !!response.headers.location) {
      return resolve(downloadFile(response.headers.location, fileName));
    }

    const fileWriter = fs
      .createWriteStream(fileName)
      .on('finish', () => {
        resolve({});
      });

    response.pipe(fileWriter);

    return null;
  }).on('error', (error) => {
    reject(error);
  });
});

(async () => {
  const imageMap = await getImages();

  // Create image folder if it does not exist yet
  if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder);
  }

  const imagePaths = Object.entries(imageMap).map(([key, value]) => ({ sku: key, image: value }));

  console.log(`Will download ${imagePaths.length} items`);

  // Download all image urls as files and store in imageFolder
  for (const { sku, image } of imagePaths) {
    // Get extension from filename
    const filename = image.split('/').pop();
    const extension = filename.split('.').pop();

    try {
      await downloadFile(image, `${imageFolder}/${sku}.${extension}`);
      console.log(`Downloaded ${image} for ${sku}`);
    } catch (err) {
      console.error('Could not download file', image, err);
    }

    // Throttle downloads to not run into any rate limiting
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }
})();
