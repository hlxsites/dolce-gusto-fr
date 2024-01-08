import { loadCSS } from '../../scripts/aem.js';

export async function createCarousel(...slides) {
  await loadCSS('/blocks/carousel/carousel.css');

  const carouselRoot = document.createElement('div');
  const slidesContainer = document.createElement('div');

  slides.forEach((item) => item.classList.add('slide'));

  slidesContainer.classList.add('slides-container');
  carouselRoot.classList.add('carousel-root');

  slidesContainer.append(...slides);

  const overlay = document.createRange().createContextualFragment(`
    <div class="controls-container">
      <button class="change-slide-button" name="previous"></button>
      <button class="change-slide-button" name="next"></button>
      <div class="selector-buttons">
        ${slides.map((item, i) => `
          <button class="selector ${i === 0 ? 'active' : ''}" name="Select slide ${i}"></button>
        `).join('\n')}
      </div>
    </div>
  `);

  carouselRoot.append(overlay);
  carouselRoot.append(slidesContainer);

  return carouselRoot;
}

export default function decorate(block) {
  block.replaceWith(createCarousel(...block.querySelectorAll(':scope > div > div')));
}
