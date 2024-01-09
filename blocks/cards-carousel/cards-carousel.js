import { createCarousel } from '../carousel/carousel.js';

export default async function decorate(block) {
  const cards = [...block.querySelectorAll(':scope > div > div')];

  cards.forEach((card) => {
    // make links to buttons
    card.querySelector('a').classList.add('button', 'primary');

    // add mobile and desktop classes to hide images
    const pictures = [...card.querySelectorAll('picture')];
    if (pictures.length === 2) {
      pictures[0].closest('p').classList.add('desktop-image', 'picture-wrapper');
      pictures[1].closest('p').classList.add('mobile-image', 'picture-wrapper');
    }

    // handle wide variant
    if (block.classList.contains('wide')) {
      // wrap text elements
      const wrapper = document.createElement('div');
      wrapper.classList.add('wrapper');
      wrapper.append(...card.querySelectorAll(':scope > *:not(.picture-wrapper)'));
      card.append(wrapper);
      // make full width
      block.closest('.cards-carousel-wrapper').classList.add('full-width');
      block.closest('.section').classList.add('full-width');
    }
  });

  const carousel = await createCarousel(cards);
  block.append(carousel);
}
