import { createCarousel } from '../carousel/carousel.js';

export default async function decorate(block) {
  [...block.children].forEach((child) => {
    const desktopImage = child.children[0];
    const mobileImage = child.children[1];
    const link = child.children[2].querySelector('a');

    desktopImage.classList.add('desktop-image');
    mobileImage.classList.add('mobile-image');

    link.innerHTML = '';
    link.append(desktopImage, mobileImage);
    child.replaceWith(link);
  });

  const carousel = await createCarousel([...block.querySelectorAll(':scope > *')]);

  block.append(carousel);
}
