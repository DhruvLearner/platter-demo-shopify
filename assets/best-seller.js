class BestSellerList extends HTMLElement {
  
  mobileVisibleCount = 4;

  connectedCallback() {
    this.initVariables();
    this.setupShowMore();
    this.setupScrollbar();
  }

  initVariables() {
    this.mobileVisibleCount = Number(this.dataset.mobileVisibleCount) || 4;
  }

  setupShowMore() {
    const grid = /** @type {HTMLUListElement} */ (this.querySelector('[data-product-grid]'));
    const button = /** @type {HTMLButtonElement} */ (this.querySelector('[data-show-more]'));
    const cards = /** @type {HTMLElement[]} */ ([...grid.children]);
    const hiddenCards = cards.slice(this.mobileVisibleCount);

    if (hiddenCards.length === 0) {
      button.remove();
      return;
    }

    const lastVisibleCard = /** @type {HTMLElement} */ (cards[this.mobileVisibleCount - 1]);
    const collapse = () => {
      grid.style.setProperty('--grid-height', `${lastVisibleCard.offsetTop + lastVisibleCard.offsetHeight}px`);
    };

    const resizeObserver = new ResizeObserver(collapse);
    resizeObserver.observe(grid);

    button.addEventListener('click', () => {
      resizeObserver.disconnect();
      hiddenCards.forEach((card) => card.classList.remove('tw:max-md:invisible'));
      grid.style.setProperty('--grid-height', `${grid.scrollHeight}px`);
      grid.addEventListener('transitionend', () => grid.style.setProperty('--grid-height', 'none'), { once: true });
      button.hidden = true;
    });
  }

  setupScrollbar() {
    const grid = /** @type {HTMLElement} */ (this.querySelector('[data-product-grid]'));
    const track = /** @type {HTMLElement} */ (this.querySelector('[data-scrollbar]'));
    const thumb = /** @type {HTMLElement} */ (this.querySelector('[data-scrollbar-thumb]'));

    // How many pixels the row scrolls for each pixel the thumb moves
    const scrollRatio = () => (grid.scrollWidth - grid.clientWidth) / (track.clientWidth - thumb.offsetWidth);
    const moveThumb = () => {
      thumb.style.left = `${grid.scrollLeft / scrollRatio()}px`;
    };

    grid.addEventListener('scroll', moveThumb);
    window.addEventListener('resize', moveThumb);

    let lastX = 0;

    thumb.addEventListener('pointerdown', (event) => {
      lastX = event.clientX;
      thumb.setPointerCapture(event.pointerId);
    });

    thumb.addEventListener('pointermove', (event) => {
      if (thumb.hasPointerCapture(event.pointerId)) {
        grid.scrollLeft += (event.clientX - lastX) * scrollRatio();
        lastX = event.clientX;
      }
    });
  }
}

if (!customElements.get('best-seller-list')) {
  customElements.define('best-seller-list', BestSellerList);
}
