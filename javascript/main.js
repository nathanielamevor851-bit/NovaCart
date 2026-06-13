    /**
     * ============================================================
     * NOVACART E-COMMERCE APPLICATION
     * ============================================================
     * 
     * A complete e-commerce solution providing:
     * - Shopping cart management with LocalStorage persistence
     * - Wishlist/saved items functionality
     * - Product catalog browsing and filtering
     * - User authentication forms
     * - Responsive UI with mobile navigation
     * - Real-time data synchronization
     * 
     * Architecture: IIFE (Immediately Invoked Function Expression)
     * to maintain private scope and avoid global namespace pollution.
     * 
     * @version 1.0.0
     * @author NovaCart Team
     * ============================================================
     */

    (function () {
      'use strict';

      /**
       * DOM selection helper - selects single element
       * @param {string} selector - CSS selector
       * @param {Element} context - Search context (default: document)
       * @returns {Element|null} The first matching element or null
       */
      const $ = (selector, context = document) => context.querySelector(selector);

      /**
       * DOM selection helper - selects multiple elements
       * @param {string} selector - CSS selector
       * @param {Element} context - Search context (default: document)
       * @returns {Array} Array of matching elements
       */
      const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

      /**
       * LocalStorage configuration
       * Stores cart and wishlist data in browser's local storage
       * for persistence across browser sessions
       */
      const STORAGE_KEYS = {
        cart: 'nc_cart_items',        // Array of products in cart
        wishlist: 'nc_wishlist_items', // Array of saved products
      };

      /**
       * Currency formatter for GHS (Ghana Cedi)
       * Uses Intl.NumberFormat for proper locale-aware formatting
       * Formats numbers as: GH¢1,234.56
       */
      const moneyFormatter = new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // Cache frequently accessed DOM elements
      const sidebar = $('#sidebar');
      const menuToggle = $('#menuToggle');

      /**
       * Convert text to URL-friendly slug format
       * Removes special characters and replaces spaces with hyphens
       * @param {string} value - Text to slugify
       * @returns {string} Slugified text (lowercase, hyphenated)
       * @example
       * slugify('Product Name') // Returns: 'product-name'
       * slugify('Price: $99.99') // Returns: 'price-9999'
       */
      function slugify(value) {
        return value
          .toLowerCase()           // Convert to lowercase
          .trim()                  // Remove whitespace
          .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphen
          .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
      }

      /**
       * Parse price string to numeric value
       * Extracts numbers from formatted currency strings
       * @param {string|number} value - Price string or number (e.g., 'GH¢1,234.56')
       * @returns {number} Numeric price value or 0 if invalid
       * @example
       * parsePrice('GH¢1,234.56') // Returns: 1234.56
       * parsePrice('99.99') // Returns: 99.99
       * parsePrice('invalid') // Returns: 0
       */
      function parsePrice(value) {
        // Remove all non-numeric characters except decimal point
        const numeric = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
        // Return number if valid, otherwise return 0
        return Number.isFinite(numeric) ? numeric : 0;
      }

      /**
       * Format number as currency string
       * Uses the predefined moneyFormatter for locale-aware formatting
       * @param {number} value - Amount to format
       * @returns {string} Formatted currency string (e.g., 'GH¢1,234.56')
       * @example
       * formatMoney(1234.56) // Returns: 'GH¢1,234.56'
       */
      function formatMoney(value) {
        return moneyFormatter.format(Number(value) || 0);
      }

      /**
       * Load items from browser LocalStorage
       * Safely parses JSON data with error handling
       * @param {string} key - Storage key to retrieve
       * @returns {Array} Parsed array of items or empty array if error
       * @example
       * const cartItems = loadList(STORAGE_KEYS.cart);
       */
      function loadList(key) {
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : [];
        } catch {
          // If JSON parse fails, return empty array
          return [];
        }
      }

      /**
       * Save items to browser LocalStorage
       * Converts array to JSON string for storage
       * @param {string} key - Storage key to use
       * @param {Array} value - Array of items to save
       * @example
       * saveList(STORAGE_KEYS.cart, cartItems);
       */
      function saveList(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      }

      /**
       * Extract product data from product card DOM element
       * Parses HTML structure to create product object
       * Fallback to default values if data is missing
       * 
       * Expected HTML structure:
       * <div class="product-card" data-product-id="123">
       *   <img src="..." alt="...">
       *   <h3>Title</h3>
       *   <p class="new-price">GH¢99.99</p>
       *   <p class="old-price">GH¢149.99</p>
       *   <p>Description</p>
       * </div>
       * 
       * @param {Element} card - Product card DOM element
       * @returns {Object|null} Product object or null if card is invalid
       * @example
       * const product = getProductFromCard(document.querySelector('.product-card'));
       * // Returns: {
       * //   id: 'product-123',
       * //   title: 'Product Name',
       * //   price: 99.99,
       * //   oldPrice: 149.99,
       * //   description: 'Product details',
       * //   image: { src: '...', alt: '...' }
       * // }
       */
      function getProductFromCard(card) {
        if (!card) return null;

        // Extract data from card DOM structure
        const title = card.querySelector('h3')?.textContent?.trim() || 'Product';
        const priceText = card.querySelector('.new-price')?.textContent || card.querySelector('.price')?.textContent || '';
        const oldPriceText = card.querySelector('.old-price')?.textContent || '';
        const image = card.querySelector('img');

        // Build product object
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

      /**
       * Update header navigation badges
       * Displays count of items in cart and wishlist
       * Cart count includes total quantity (sum of item quantities)
       * Wishlist count is number of distinct items saved
       */
      function updateHeaderBadges() {
        // Load current cart and wishlist items
        const wishlistCount = loadList(STORAGE_KEYS.wishlist).length;
        // Sum quantities for cart items (user may have 2x same product)
        const cartCount = loadList(STORAGE_KEYS.cart).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

        // Remove existing badges
        $$('.header-actions a').forEach((link) => {
          const badge = link.querySelector('.nav-badge');
          if (badge) badge.remove();
        });

        // Find wishlist and cart links
        const links = $$('.header-actions a');
        const wishlistLink = links.find((link) => link.getAttribute('href') === 'wishlist.html');
        const cartLink = links.find((link) => link.getAttribute('href') === 'cart.html');

        // Add badges if counts > 0
        addBadge(wishlistLink, wishlistCount);
        addBadge(cartLink, cartCount);
      }

      /**
       * Add badge element to navigation link
       * Shows count of items, displays "9+" for counts over 9
       * @param {Element} anchor - Navigation link element
       * @param {number} count - Item count to display
       */
      function addBadge(anchor, count) {
        if (!anchor || !count) return;

        const badge = document.createElement('span');
        badge.className = 'nav-badge';
        // Cap display at "9+" for visual consistency
        badge.textContent = count > 9 ? '9+' : String(count);
        anchor.appendChild(badge);
      }

      /**
       * Temporarily flash button with feedback message
       * Used for "Added to cart" / "Wishlisted" confirmations
       * Automatically reverts after 1.2 seconds
       * @param {Element} button - Button element to flash
       * @param {string} label - Temporary text to display
       * @param {string} className - CSS class to add during flash
       * @example
       * flashButton(addBtn, 'Added!', 'success');
       */
      function flashButton(button, label, className) {
        if (!button) return;

        // Store original state
        const originalLabel = button.textContent;
        const originalClass = button.className;

        // Apply temporary state
        button.textContent = label;
        if (className) button.classList.add(className);

        // Revert after 1.2 seconds
        window.setTimeout(() => {
          button.textContent = originalLabel;
          button.className = originalClass;
        }, 1200);
      }

      /**
       * ============================================================
       * SHOPPING CART MANAGEMENT
       * ============================================================
       */

      /**
       * Add product to shopping cart
       * If product already in cart, increments quantity instead
       * @param {Object} product - Product to add to cart
       * @example
       * addToCart({ id: '123', title: 'Product', price: 99.99, ... });
       */
      function addToCart(product) {
        if (!product) return;

        const cart = loadList(STORAGE_KEYS.cart);
        // Check if product already in cart
        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
          // Increase quantity if already exists
          existing.quantity = (Number(existing.quantity) || 1) + 1;
        } else {
          // Add new product with quantity 1
          cart.push({ ...product, quantity: 1 });
        }

        // Persist and update UI
        saveList(STORAGE_KEYS.cart, cart);
        updateHeaderBadges();
        renderCartPage();
      }

      /**
       * Remove product from cart completely
       * @param {string} productId - ID of product to remove
       */
      function removeFromCart(productId) {
        const cart = loadList(STORAGE_KEYS.cart).filter((item) => item.id !== productId);
        saveList(STORAGE_KEYS.cart, cart);
        updateHeaderBadges();
        renderCartPage();
      }

      /**
       * Adjust quantity of product in cart
       * Removes product from cart if quantity drops to 0 or below
       * @param {string} productId - ID of product
       * @param {number} delta - Change amount (typically -1 or +1)
       * @example
       * changeCartQuantity('product-123', 1);  // Increase by 1
       * changeCartQuantity('product-123', -1); // Decrease by 1
       */
      function changeCartQuantity(productId, delta) {
        const cart = loadList(STORAGE_KEYS.cart)
          // Update quantity for matching product
          .map((item) => {
            if (item.id !== productId) return item;
            const quantity = (Number(item.quantity) || 1) + delta;
            return { ...item, quantity };
          })
          // Remove items with 0 or negative quantity
          .filter((item) => (Number(item.quantity) || 1) > 0);

        saveList(STORAGE_KEYS.cart, cart);
        updateHeaderBadges();
        renderCartPage();
      }

      /**
       * ============================================================
       * WISHLIST MANAGEMENT
       * ============================================================
       */

      /**
       * Add product to wishlist (saved items)
       * Prevents duplicate items from being added
       * @param {Object} product - Product to save
       */
      function addToWishlist(product) {
        if (!product) return;

        const wishlist = loadList(STORAGE_KEYS.wishlist);
        // Check if product already in wishlist
        const exists = wishlist.some((item) => item.id === product.id);

        if (!exists) {
          wishlist.push(product);
          saveList(STORAGE_KEYS.wishlist, wishlist);
          updateHeaderBadges();
          renderWishlistPage();
        }
      }

      /**
       * Remove product from wishlist
       * @param {string} productId - ID of product to remove
       */
      function removeFromWishlist(productId) {
        const wishlist = loadList(STORAGE_KEYS.wishlist).filter((item) => item.id !== productId);
        saveList(STORAGE_KEYS.wishlist, wishlist);
        updateHeaderBadges();
        renderWishlistPage();
      }

      /**
       * Move product from wishlist to cart
       * Removes from wishlist after adding to cart
       * @param {string} productId - ID of product to move
       */
      function moveWishlistItemToCart(productId) {
        const wishlist = loadList(STORAGE_KEYS.wishlist);
        const product = wishlist.find((item) => item.id === productId);
        if (!product) return;

        addToCart(product);
        removeFromWishlist(productId);
      }

      /**
       * ============================================================
       * PAGE RENDERING FUNCTIONS
       * ============================================================
       */

      /**
       * Render shopping cart page
       * Displays all cart items with quantity controls and totals
       * Shows empty state message if no items in cart
       */
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

      /* ============================================================
        AUTHENTICATION FORM HANDLERS
        ============================================================ */

      function initAuthForms() {
        initLoginForm();
        initSignupForm();
        initPasswordToggle();
      }

      function initPasswordToggle() {
        $$('.toggle-password').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.dataset.target;
            const input = $(`#${targetId}`);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.querySelector('i').classList.toggle('fa-eye');
            btn.querySelector('i').classList.toggle('fa-eye-slash');
          });
        });
      }

      function initLoginForm() {
        const form = $('#loginForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (validateLoginForm()) {
            submitLoginForm(form);
          }
        });

        // Real-time validation on blur
        form.querySelectorAll('input').forEach((input) => {
          input.addEventListener('blur', () => validateField(input));
          input.addEventListener('focus', () => clearFieldError(input));
        });
      }

      function initSignupForm() {
        const form = $('#signupForm');
        if (!form) return;

        // Real-time password strength check
        const passwordInput = form.querySelector('input[name="password"]');
        if (passwordInput) {
          passwordInput.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
          });
        }

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (validateSignupForm()) {
            submitSignupForm(form);
          }
        });

        // Real-time validation on blur
        form.querySelectorAll('input').forEach((input) => {
          input.addEventListener('blur', () => validateField(input));
          input.addEventListener('focus', () => clearFieldError(input));
        });

        // Match password fields
        const confirmInput = form.querySelector('input[name="confirm_password"]');
        if (confirmInput) {
          confirmInput.addEventListener('blur', () => {
            if (confirmInput.value && passwordInput.value !== confirmInput.value) {
              showFieldError(confirmInput, 'Passwords do not match');
            }
          });
        }
      }

      function validateLoginForm() {
        const form = $('#loginForm');
        let isValid = true;

        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="password"]');

        if (!validateEmail(emailInput.value)) {
          showFieldError(emailInput, 'Please enter a valid email address');
          isValid = false;
        }

        if (!validatePassword(passwordInput.value)) {
          showFieldError(passwordInput, 'Password must be at least 6 characters');
          isValid = false;
        }

        return isValid;
      }

      function validateSignupForm() {
        const form = $('#signupForm');
        let isValid = true;

        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="password"]');
        const confirmInput = form.querySelector('input[name="confirm_password"]');
        const termsInput = form.querySelector('input[name="terms"]');

        if (!nameInput.value.trim()) {
          showFieldError(nameInput, 'Please enter your full name');
          isValid = false;
        }

        if (!validateEmail(emailInput.value)) {
          showFieldError(emailInput, 'Please enter a valid email address');
          isValid = false;
        }

        if (!validatePassword(passwordInput.value)) {
          showFieldError(passwordInput, 'Password must be at least 8 characters');
          isValid = false;
        }

        if (passwordInput.value !== confirmInput.value) {
          showFieldError(confirmInput, 'Passwords do not match');
          isValid = false;
        }

        if (!termsInput.checked) {
          showFieldError(termsInput, 'You must agree to the terms');
          isValid = false;
        }

        return isValid;
      }

      function validateField(input) {
        const name = input.name;
        let isValid = true;

        if (name === 'email') {
          if (!validateEmail(input.value)) {
            showFieldError(input, 'Please enter a valid email address');
            isValid = false;
          }
        } else if (name === 'password') {
          const minLength = input.form.id === 'signupForm' ? 8 : 6;
          if (!validatePassword(input.value, minLength)) {
            showFieldError(input, `Password must be at least ${minLength} characters`);
            isValid = false;
          }
        } else if (name === 'name') {
          if (!input.value.trim()) {
            showFieldError(input, 'Please enter your full name');
            isValid = false;
          }
        }

        return isValid;
      }

      function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      }

      function validatePassword(password, minLength = 6) {
        return password.length >= minLength;
      }

      function showFieldError(input, message) {
        clearFieldError(input);
        input.classList.add('error');

        let errorElement = input.parentElement.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
          errorElement = input.closest('.form-group').querySelector('.error-message');
        }

        if (errorElement) {
          errorElement.textContent = message;
          errorElement.classList.add('show');
        }
      }

      function clearFieldError(input) {
        input.classList.remove('error');
        let errorElement = input.parentElement.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
          errorElement = input.closest('.form-group').querySelector('.error-message');
        }
        if (errorElement) {
          errorElement.classList.remove('show');
        }
      }

      function updatePasswordStrength(password) {
        const strengthBar = $('.strength-bar');
        if (!strengthBar) return;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        strengthBar.classList.remove('weak', 'medium', 'strong');

        if (strength === 0 || strength === 1) {
          strengthBar.classList.add('weak');
        } else if (strength === 2 || strength === 3) {
          strengthBar.classList.add('medium');
        } else if (strength === 4) {
          strengthBar.classList.add('strong');
        }
      }

      function submitLoginForm(form) {
        const btn = form.querySelector('.auth-btn');
        const originalText = btn.innerHTML;

        btn.classList.add('loading');
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
          btn.classList.remove('loading');
          btn.disabled = false;

          // Show success message
          const successMsg = document.createElement('div');
          successMsg.className = 'success-message show';
          successMsg.textContent = 'Login successful! Redirecting...';
          form.insertBefore(successMsg, form.firstChild);

          setTimeout(() => {
            // In production, redirect to dashboard
            window.location.href = 'index.html';
          }, 1500);
        }, 1500);
      }

      function submitSignupForm(form) {
        const btn = form.querySelector('.auth-btn');
        const originalText = btn.innerHTML;

        btn.classList.add('loading');
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
          btn.classList.remove('loading');
          btn.disabled = false;

          // Show success message
          const successMsg = document.createElement('div');
          successMsg.className = 'success-message show';
          successMsg.textContent = 'Account created successfully! Redirecting...';
          form.insertBefore(successMsg, form.firstChild);

          setTimeout(() => {
            // In production, redirect to dashboard
            window.location.href = 'account.html';
          }, 1500);
        }, 1500);
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
        initAuthForms();
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
    }());  
