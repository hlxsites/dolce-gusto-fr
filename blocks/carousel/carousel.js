import { loadCSS } from '../../scripts/aem.js';

function setActiveButton(activeSlideNumber, buttons) {
  buttons.forEach((button) => button.classList.remove('active'));
  buttons[activeSlideNumber].classList.add('active');
}

function goToSlide(slideNumber, slidesContainer, slides, buttons) {
  slidesContainer.scrollTo(slideNumber * slides[0].clientWidth, 0);
  setActiveButton(slideNumber, buttons);
}

function findActiveSlide(slidesContainer, slides) {
  const activeElement = slidesContainer.querySelector('.active');
  return slides.indexOf(activeElement);
}

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

  const selectorButtons = [...overlay.querySelectorAll('.selector-buttons > button')];

  slidesContainer.addEventListener('scroll', () => {
    const activeElement = Math.round(slidesContainer.scrollLeft / slides[0].clientWidth);
    if (!slides[activeElement].classList.contains('active')) {
      slides.forEach((slide) => slide.classList.remove('active'));
      slides[activeElement].classList.add('active');
      setActiveButton(activeElement, selectorButtons);
    }
  }, { passive: true });

  overlay.querySelectorAll('.selector-buttons > button').forEach((button, i, buttons) => {
    button.addEventListener('click', () => {
      goToSlide(i, slidesContainer, slides, buttons);
    });
  });

  overlay.querySelector('button[name="previous"]').addEventListener('click', () => {
    const currentSlide = findActiveSlide(slidesContainer, slides);
    const nextSlide = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;
    goToSlide(nextSlide, slidesContainer, slides, selectorButtons);
  });

  overlay.querySelector('button[name="next"]').addEventListener('click', () => {
    const currentSlide = findActiveSlide(slidesContainer, slides);
    const nextSlide = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
    goToSlide(nextSlide, slidesContainer, slides, selectorButtons);
  });

  carouselRoot.append(overlay);
  carouselRoot.append(slidesContainer);

  return carouselRoot;
}

export default function decorate(block) {
  block.replaceWith(createCarousel(...block.querySelectorAll(':scope > div > div')));
}
