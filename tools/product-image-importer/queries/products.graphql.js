// eslint-disable-next-line import/prefer-default-export
export const allImagesQuery = `
query { 
  categories(
    pageSize: 100
    currentPage: 1
  ) {
    total_count
    items {
      products {
        total_count
        items {
          name
          sku
          image {
            url
          }
        }
      }
      uid
      name
      children_count
      children {
        products {
          total_count
          items {
            name
            sku
            image {
              url
            }
          }
        }
        uid
        name
        children_count
        children {
          products {
            total_count
            items {
              name
              sku
              image {
                url
              }
            }
          }
          id
          uid
          name
        }
      }
    }
  }
}
`;
