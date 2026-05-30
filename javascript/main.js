/* ============================================================
   NOVACART — shared UI + cart/wishlist persistence
   ============================================================ */

(function () {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const STORAGE_KEYS = {
    cart: 'nc_cart_items',
    wishlist: 'nc_wishlist_items',
  };

  const moneyFormatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sidebar = $('#sidebar');
  const menuToggle = $('#menuToggle');

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function parsePrice(value) {
    const numeric = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function formatMoney(value) {
    return moneyFormatter.format(Number(value) || 0);
  }

  function loadList(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getProductFromCard(card) {
    if (!card) return null;

    const title = card.querySelector('h3')?.textContent?.trim() || 'Product';
    const priceText = card.querySelector('.new-price')?.textContent || card.querySelector('.price')?.textContent || '';
    const oldPriceText = card.querySelector('.old-price')?.textContent || '';
    const image = card.querySelector('img');

    const product = {
      id: card.dataset.productId || slugify(`${title}-${image?.getAttribute('src') || ''}`),
      title,
      price: parsePrice(priceText),
      oldPrice: parsePrice(oldPriceText),
      description: card.querySelector('p')?.textContent?.trim() || '',
      image: {
        src: image?.getAttribute('src') || '',
        alt: image?.getAttribute('alt') || title,
      },
    };

    return product;
  }

  function updateHeaderBadges() {
    const wishlistCount = loadList(STORAGE_KEYS.wishlist).length;
    const cartCount = loadList(STORAGE_KEYS.cart).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    $$('.header-actions a').forEach((link) => {
      const badge = link.querySelector('.nav-badge');
      if (badge) badge.remove();
    });

    const links = $$('.header-actions a');
    const wishlistLink = links.find((link) => link.getAttribute('href') === 'wishlist.html');
    const cartLink = links.find((link) => link.getAttribute('href') === 'cart.html');

    addBadge(wishlistLink, wishlistCount);
    addBadge(cartLink, cartCount);
  }

  function addBadge(anchor, count) {
    if (!anchor || !count) return;

    const badge = document.createElement('span');
    badge.className = 'nav-badge';
    badge.textContent = count > 9 ? '9+' : String(count);
    anchor.appendChild(badge);
  }

  function flashButton(button, label, className) {
    if (!button) return;

    const originalLabel = button.textContent;
    const originalClass = button.className;

    button.textContent = label;
    if (className) button.classList.add(className);

    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.className = originalClass;
    }, 1200);
  }

  function addToCart(product) {
    if (!product) return;

    const cart = loadList(STORAGE_KEYS.cart);
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    saveList(STORAGE_KEYS.cart, cart);
    updateHeaderBadges();
    renderCartPage();
  }

  function addToWishlist(product) {
    if (!product) return;

    const wishlist = loadList(STORAGE_KEYS.wishlist);
    const exists = wishlist.some((item) => item.id === product.id);

    if (!exists) {
      wishlist.push(product);
      saveList(STORAGE_KEYS.wishlist, wishlist);
      updateHeaderBadges();
      renderWishlistPage();
    }
  }

  function removeFromCart(productId) {
    const cart = loadList(STORAGE_KEYS.cart).filter((item) => item.id !== productId);
    saveList(STORAGE_KEYS.cart, cart);
    updateHeaderBadges();
    renderCartPage();
  }

  function changeCartQuantity(productId, delta) {
    const cart = loadList(STORAGE_KEYS.cart)
      .map((item) => {
        if (item.id !== productId) return item;
        const quantity = (Number(item.quantity) || 1) + delta;
        return { ...item, quantity };
      })
      .filter((item) => (Number(item.quantity) || 1) > 0);

    saveList(STORAGE_KEYS.cart, cart);
    updateHeaderBadges();
    renderCartPage();
  }

  function removeFromWishlist(productId) {
    const wishlist = loadList(STORAGE_KEYS.wishlist).filter((item) => item.id !== productId);
    saveList(STORAGE_KEYS.wishlist, wishlist);
    updateHeaderBadges();
    renderWishlistPage();
  }

  function moveWishlistItemToCart(productId) {
    const wishlist = loadList(STORAGE_KEYS.wishlist);
    const product = wishlist.find((item) => item.id === productId);
    if (!product) return;

    addToCart(product);
    removeFromWishlist(productId);
  }

  function renderCartPage() {
    const mount = $('#cartMount');
    const summary = $('#cartSummary');
    if (!mount || !summary) return;

    const items = loadList(STORAGE_KEYS.cart);

    if (!items.length) {
      mount.innerHTML = `
        <section class="empty-state">
          <div class="empty-state-icon"><i class="fa-solid fa-cart-shopping"></i></div>
          <h2>Your cart is empty</h2>
          <p>Browse products and add the items you want to compare, save, and checkout later.</p>
          <a class="btn btn-primary" href="products.html">Start shopping</a>
        </section>
      `;

      summary.innerHTML = `
        <h3>Order Summary</h3>
        <p class="summary-line">0 items</p>
        <p class="summary-total">GH¢0.00</p>
      `;
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    mount.innerHTML = items.map((item) => {
      const qty = Number(item.quantity) || 1;
      const itemTotal = (Number(item.price) || 0) * qty;

      return `
        <article class="saved-card cart-line-item" data-id="${item.id}">
          <div class="saved-card-media">
            <img src="${item.image?.src || ''}" alt="${item.image?.alt || item.title}">
          </div>

          <div class="saved-card-body">
            <div class="saved-card-head">
              <div>
                <h3>${item.title}</h3>
                <p>${item.description || 'Added from the products page.'}</p>
              </div>
              <button type="button" class="icon-button" data-action="remove-cart" data-id="${item.id}" aria-label="Remove ${item.title}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <div class="saved-card-meta">
              <span class="saved-price">${formatMoney(item.price)}</span>
              ${item.oldPrice ? `<span class="saved-old-price">${formatMoney(item.oldPrice)}</span>` : ''}
            </div>

            <div class="cart-controls">
              <div class="qty-controls" aria-label="Quantity controls">
                <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                <span class="qty-value">${qty}</span>
                <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
              </div>

              <div class="line-total">
                <span>Item total</span>
                <strong>${formatMoney(itemTotal)}</strong>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    summary.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Items</span><strong>${totalItems}</strong></div>
      <div class="summary-row"><span>Subtotal</span><strong>${formatMoney(subtotal)}</strong></div>
      <div class="summary-row"><span>Delivery</span><strong>Calculated at checkout</strong></div>
      <div class="summary-total-wrap">
        <span>Total</span>
        <strong class="summary-total">${formatMoney(subtotal)}</strong>
      </div>
      <button type="button" class="btn btn-primary checkout-btn">Proceed to Checkout</button>
      <a href="products.html" class="btn btn-secondary summary-link">Continue shopping</a>
    `;
  }

  function renderWishlistPage() {
    const mount = $('#wishlistMount');
    const summary = $('#wishlistSummary');
    if (!mount || !summary) return;

    const items = loadList(STORAGE_KEYS.wishlist);

    if (!items.length) {
      mount.innerHTML = `
        <section class="empty-state">
          <div class="empty-state-icon"><i class="fa-solid fa-heart"></i></div>
          <h2>Your wishlist is empty</h2>
          <p>Save products here to compare later or move them straight into your cart.</p>
          <a class="btn btn-primary" href="products.html">Browse products</a>
        </section>
      `;

      summary.innerHTML = `
        <h3>Saved Items</h3>
        <p class="summary-line">0 products</p>
        <p class="summary-total">Ready to fill</p>
      `;
      return;
    }

    const totalValue = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    mount.innerHTML = items.map((item) => `
      <article class="saved-card wishlist-line-item" data-id="${item.id}">
        <div class="saved-card-media">
          <img src="${item.image?.src || ''}" alt="${item.image?.alt || item.title}">
        </div>

        <div class="saved-card-body">
          <div class="saved-card-head">
            <div>
              <h3>${item.title}</h3>
              <p>${item.description || 'Saved from the products page.'}</p>
            </div>
            <button type="button" class="icon-button" data-action="remove-wishlist" data-id="${item.id}" aria-label="Remove ${item.title}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="saved-card-meta">
            <span class="saved-price">${formatMoney(item.price)}</span>
            ${item.oldPrice ? `<span class="saved-old-price">${formatMoney(item.oldPrice)}</span>` : ''}
          </div>

          <div class="wishlist-actions">
            <button type="button" class="btn btn-primary" data-action="move-to-cart" data-id="${item.id}">Move to cart</button>
            <button type="button" class="btn btn-secondary" data-action="remove-wishlist" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </article>
    `).join('');

    summary.innerHTML = `
      <h3>Wishlist Summary</h3>
      <div class="summary-row"><span>Saved items</span><strong>${items.length}</strong></div>
      <div class="summary-row"><span>Total saved value</span><strong>${formatMoney(totalValue)}</strong></div>
      <a href="products.html" class="btn btn-primary summary-link">Add more items</a>
    `;
  }

  function initSharedButtons() {
    document.addEventListener('click', (event) => {
      const cartButton = event.target.closest('.btn-cart');
      const wishlistButton = event.target.closest('.btn-wishlist');
      const buyButton = event.target.closest('.btn-buy');

      if (cartButton) {
        const product = getProductFromCard(cartButton.closest('article'));
        if (product) {
          addToCart(product);
          flashButton(cartButton, 'Added to cart', 'is-success');
        }
      }

      if (wishlistButton) {
        const product = getProductFromCard(wishlistButton.closest('article'));
        if (product) {
          addToWishlist(product);
          flashButton(wishlistButton, 'Wishlisted', 'is-success');
        }
      }

      if (buyButton) {
        const product = getProductFromCard(buyButton.closest('article'));
        if (product) {
          window.location.href = 'cart.html';
        }
      }
    });
  }

  function initCartWishlistDelegation() {
    const cartMount = $('#cartMount');
    if (cartMount) {
      cartMount.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const { action, id } = button.dataset;
        if (action === 'increase') changeCartQuantity(id, 1);
        if (action === 'decrease') changeCartQuantity(id, -1);
        if (action === 'remove-cart') removeFromCart(id);
      });
    }

    const wishlistMount = $('#wishlistMount');
    if (wishlistMount) {
      wishlistMount.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const { action, id } = button.dataset;
        if (action === 'remove-wishlist') removeFromWishlist(id);
        if (action === 'move-to-cart') moveWishlistItemToCart(id);
      });
    }
  }

  function initSidebar() {
    if (!sidebar) return;

    $$('.sidebar-nav a').forEach((anchor) => {
      anchor.setAttribute('data-tooltip', anchor.textContent.trim());
    });

    menuToggle?.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        return;
      }

      sidebar.classList.toggle('collapsed');
      updateMainOffsets();
    });

    document.addEventListener('click', (event) => {
      if (
        window.innerWidth <= 900 &&
        sidebar.classList.contains('active') &&
        !sidebar.contains(event.target) &&
        !menuToggle?.contains(event.target)
      ) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  function updateMainOffsets() {
    const main = $('.main-content');
    if (!main || !sidebar) return;

    if (sidebar.classList.contains('collapsed')) {
      main.style.marginLeft = '85px';
      main.style.width = 'calc(100% - 85px)';
    } else {
      main.style.marginLeft = '';
      main.style.width = '';
    }
  }

  function setActiveLink() {
    const current = location.pathname.split('/').pop() || 'index.html';
    $$('.sidebar-nav a').forEach((anchor) => {
      const href = anchor.getAttribute('href');
      anchor.classList.toggle('active', href === current);
    });
  }

  function initHeaderScroll() {
    const header = $('.top-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20
        ? '0 10px 30px rgba(0, 0, 0, 0.25)'
        : 'none';
    }, { passive: true });
  }

  function initSearch() {
    const form = $('.search-bar');
    const input = $('.search-input');
    if (!form || !input) return;

    const filterCards = () => {
      const query = input.value.trim().toLowerCase();
      const cards = $$('.category-card, .top-products-card, .new-arrivals-card, .best-sales-card');
      if (!cards.length) return;

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const match = !query || text.includes(query);
        card.style.display = match ? '' : 'none';
      });
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      filterCards();
    });

    input.addEventListener('input', filterCards);
  }

  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const style = document.createElement('style');
    style.textContent = `
      .reveal {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const targets = $$('.category-card, .top-products-card, .new-arrivals-card, .best-sales-card, .footer-brand, .footer-links, .footer-contact, .footer-social, .payment-method, .saved-card, .summary-card, .page-hero');
    targets.forEach((node) => node.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    $$('.reveal').forEach((node, index) => {
      node.style.transitionDelay = `${(index % 6) * 60}ms`;
      observer.observe(node);
    });
  }

  function initScrollTopButton() {
    const button = $('#scrollTopBtn');
    if (!button) return;

    const updateVisibility = () => {
      button.style.display = window.scrollY > 300 ? 'flex' : 'none';
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initNewsletter() {
    const form = $('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) {
        alert('Please enter your email.');
        return;
      }

      alert('Thank you for subscribing!');
      input.value = '';
    });
  }

  function updateYear() {
    const footer = $('.footer-bottom p');
    if (!footer) return;
    footer.textContent = footer.textContent.replace(/\d{4}/, String(new Date().getFullYear()));
  }

  function optimizeImages() {
    $$('img').forEach((img, index) => {
      if (index > 1) img.loading = 'lazy';
      img.decoding = 'async';
    });
  }

  function initResizeHandler() {
    let ticking = false;

    window.addEventListener('resize', () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        if (window.innerWidth > 900) {
          sidebar?.classList.remove('active');
          document.body.style.overflow = '';
        }

        updateMainOffsets();
        ticking = false;
      });
    });
  }

  function initCheckoutButton() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.checkout-btn');
      if (!button) return;

      const cart = loadList(STORAGE_KEYS.cart);
      if (!cart.length) {
        alert('Your cart is empty.');
        return;
      }

      alert('Checkout flow is ready to connect to your payment page.');
    });
  }

  function init() {
    initSidebar();
    setActiveLink();
    initHeaderScroll();
    initSearch();
    initScrollAnimations();
    initScrollTopButton();
    initNewsletter();
    initResizeHandler();
    initSharedButtons();
    initCartWishlistDelegation();
    initCheckoutButton();
    updateYear();
    optimizeImages();
    updateHeaderBadges();
    renderCartPage();
    renderWishlistPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
