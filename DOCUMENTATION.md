# NovaCart - Detailed Documentation

Comprehensive technical documentation for NovaCart features, API, and architecture.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Functionality](#core-functionality)
3. [JavaScript API Reference](#javascript-api-reference)
4. [Data Management](#data-management)
5. [UI Components](#ui-components)
6. [HTML Structure](#html-structure)
7. [CSS Architecture](#css-architecture)
8. [Event Handling](#event-handling)
9. [Browser Compatibility](#browser-compatibility)
10. [Performance Optimization](#performance-optimization)

## Architecture Overview

### Application Structure

NovaCart follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────┐
│     HTML Pages (UI Layer)            │
│  - index.html                         │
│  - products.html                      │
│  - cart.html                          │
│  - wishlist.html                      │
│  - etc.                               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│     CSS Styling (Presentation)       │
│  - style.css (main styles)           │
│  - mediaquery.css (responsive)       │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   JavaScript (Business Logic)        │
│  - main.js                           │
│  - Cart management                   │
│  - Wishlist management               │
│  - DOM manipulation                  │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Browser Storage (Data Layer)       │
│  - LocalStorage API                  │
│  - nc_cart_items                     │
│  - nc_wishlist_items                 │
└──────────────────────────────────────┘
```

### Data Flow

```
User Action
   ↓
Event Handler (Click, Submit)
   ↓
Business Logic (add, remove, update)
   ↓
Update LocalStorage
   ↓
Re-render UI
   ↓
Visual Update
```

## Core Functionality

### 1. Shopping Cart

#### Features
- Add products to cart
- Remove items from cart
- Adjust item quantities
- Calculate totals
- Persistent storage
- Real-time badge updates

#### How It Works

```javascript
// Step 1: User clicks "Add to Cart" button
// Step 2: System extracts product data from product card
const product = getProductFromCard(productCard);

// Step 3: Product added to cart
addToCart(product);

// Step 4: LocalStorage updated
saveList(STORAGE_KEYS.cart, updatedCart);

// Step 5: UI badges updated
updateHeaderBadges();

// Step 6: Cart page re-rendered
renderCartPage();
```

#### Data Structure

```javascript
STORAGE_KEYS.cart = 'nc_cart_items'

// Stored as JSON array:
[
  {
    id: 'unique-id-1',
    title: 'Product Name',
    price: 99.99,
    oldPrice: 149.99,
    description: 'Product description',
    image: {
      src: 'Images/product.avif',
      alt: 'Product alt text'
    },
    quantity: 2  // Added by cart system
  },
  // ... more items
]
```

### 2. Wishlist Management

#### Features
- Save products to wishlist
- Remove wishlist items
- Move items to cart
- View wishlist
- Prevent duplicates

#### How It Works

```javascript
// User clicks "Add to Wishlist"
// System checks if product exists
const exists = wishlist.some(item => item.id === product.id);

if (!exists) {
  // Add to wishlist
  wishlist.push(product);
  
  // Save and update UI
  saveList(STORAGE_KEYS.wishlist, wishlist);
  updateHeaderBadges();
}
```

### 3. Data Persistence

#### LocalStorage Implementation

```javascript
// Save data
function saveList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Load data
function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
```

#### Storage Limits

- **Space:** ~5-10MB per domain
- **Format:** JSON text
- **Persistence:** Until user clears browser data
- **Security:** Same-origin policy applies

### 4. Price Handling

#### Currency Formatting

```javascript
const moneyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Usage
formatMoney(1234.56) // Returns: "GH¢1,234.56"
```

#### Price Parsing

```javascript
// Convert formatted price to number
parsePrice('GH¢1,234.56') // Returns: 1234.56
parsePrice('99.99') // Returns: 99.99
parsePrice('invalid') // Returns: 0
```

## JavaScript API Reference

### DOM Selection Helpers

```javascript
/**
 * Select single element
 * @param {string} selector - CSS selector
 * @param {Element} context - Search context (default: document)
 * @returns {Element|null}
 */
const element = $('.class-name');
const element = $('#id-name');
const element = $('[data-id="123"]');

/**
 * Select multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} context - Search context (default: document)
 * @returns {Array}
 */
const elements = $$('.product-card');
```

### Cart Functions

```javascript
/**
 * Add product to cart
 * @param {Object} product - Product object
 * @example
 * addToCart({
 *   id: '123',
 *   title: 'Product Name',
 *   price: 99.99,
 *   image: { src: '...', alt: '...' }
 * });
 */
addToCart(product);

/**
 * Remove product from cart
 * @param {string} productId - Product ID to remove
 * @example
 * removeFromCart('product-123');
 */
removeFromCart(productId);

/**
 * Change item quantity in cart
 * @param {string} productId - Product ID
 * @param {number} delta - Change amount (-1 or +1)
 * @example
 * changeCartQuantity('product-123', 1);  // Increase by 1
 * changeCartQuantity('product-123', -1); // Decrease by 1
 */
changeCartQuantity(productId, delta);
```

### Wishlist Functions

```javascript
/**
 * Add product to wishlist
 * @param {Object} product - Product object
 * @example
 * addToWishlist(product);
 */
addToWishlist(product);

/**
 * Remove product from wishlist
 * @param {string} productId - Product ID
 * @example
 * removeFromWishlist('product-123');
 */
removeFromWishlist(productId);

/**
 * Move product from wishlist to cart
 * @param {string} productId - Product ID
 * @example
 * moveWishlistItemToCart('product-123');
 */
moveWishlistItemToCart(productId);
```

### Utility Functions

```javascript
/**
 * Convert text to URL-friendly slug
 * @param {string} value - Text to slugify
 * @returns {string}
 * @example
 * slugify('Product Name') // Returns: 'product-name'
 * slugify('Price: $99.99') // Returns: 'price-9999'
 */
const slug = slugify('Product Name');

/**
 * Parse price string to number
 * @param {string|number} value - Price value
 * @returns {number}
 * @example
 * parsePrice('GH¢1,234.56') // Returns: 1234.56
 * parsePrice('99') // Returns: 99
 * parsePrice('abc') // Returns: 0
 */
const price = parsePrice('GH¢99.99');

/**
 * Format number as currency
 * @param {number} value - Amount to format
 * @returns {string}
 * @example
 * formatMoney(1234.56) // Returns: 'GH¢1,234.56'
 */
const formatted = formatMoney(1234.56);
```

### Data Access Functions

```javascript
/**
 * Load cart items from storage
 * @returns {Array} Cart items
 */
const cartItems = loadList(STORAGE_KEYS.cart);

/**
 * Load wishlist items from storage
 * @returns {Array} Wishlist items
 */
const wishlistItems = loadList(STORAGE_KEYS.wishlist);

/**
 * Save items to storage
 * @param {string} key - Storage key
 * @param {Array} value - Items to save
 */
saveList(STORAGE_KEYS.cart, updatedItems);
```

### UI Update Functions

```javascript
/**
 * Update badge counts in header
 * Displays number of items in cart and wishlist
 */
updateHeaderBadges();

/**
 * Render/update cart page
 * Displays all cart items and summary
 */
renderCartPage();

/**
 * Render/update wishlist page
 * Displays all saved items
 */
renderWishlistPage();

/**
 * Flash button feedback
 * Temporarily changes button text and style
 * @param {Element} button - Button element
 * @param {string} label - Temporary label
 * @param {string} className - CSS class to add
 */
flashButton(button, 'Added!', 'success');
```

### Product Extraction

```javascript
/**
 * Extract product data from product card element
 * @param {Element} card - Product card DOM element
 * @returns {Object|null} Product object
 * @example
 * const card = document.querySelector('.product-card');
 * const product = getProductFromCard(card);
 */
const product = getProductFromCard(productCard);
```

## Data Management

### LocalStorage Keys

```javascript
STORAGE_KEYS = {
  cart: 'nc_cart_items',      // Shopping cart items
  wishlist: 'nc_wishlist_items' // Saved/wishlist items
};
```

### Data Access Pattern

```javascript
// READ
const items = loadList(key);  // Get from storage
const item = items.find(i => i.id === id);  // Find item

// CREATE
const newItem = { id, title, price, ... };
items.push(newItem);
saveList(key, items);

// UPDATE
item.quantity = 5;
saveList(key, items);

// DELETE
const filtered = items.filter(i => i.id !== id);
saveList(key, filtered);
```

### Error Handling

```javascript
// Safe parsing with error handling
function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Return empty array if parse fails
    return [];
  }
}
```

## UI Components

### Product Card

**HTML Structure:**
```html
<div class="product-card" data-product-id="123">
  <img src="image.avif" alt="Product description">
  <h3>Product Title</h3>
  <p class="new-price">GH¢99.99</p>
  <p class="old-price">GH¢149.99</p>
  <p class="description">Product details</p>
  <button class="add-to-cart-btn">Add to Cart</button>
</div>
```

**Data Extraction:**
```javascript
// System extracts from structure above
{
  id: 'product-123',
  title: 'Product Title',
  price: 99.99,
  oldPrice: 149.99,
  description: 'Product details',
  image: {
    src: 'image.avif',
    alt: 'Product description'
  }
}
```

### Cart Item Display

**Rendered Cart Line Item:**
```html
<article class="saved-card cart-line-item" data-id="product-123">
  <div class="saved-card-media">
    <img src="image.avif" alt="Product">
  </div>
  <div class="saved-card-body">
    <h3>Product Name</h3>
    <span class="saved-price">GH¢99.99</span>
    <div class="cart-controls">
      <button data-action="decrease">-</button>
      <span class="qty-value">2</span>
      <button data-action="increase">+</button>
    </div>
  </div>
</article>
```

### Header Badges

**Navigation Badge:**
```html
<a href="cart.html">
  <i class="fas fa-cart-shopping"></i>
  <span class="nav-badge">3</span>  <!-- Shows item count -->
</a>
```

- Shows total quantity of items
- Updates automatically
- Hidden if count is 0
- Shows "9+" if over 9

### Empty States

**Empty Cart Message:**
```html
<section class="empty-state">
  <div class="empty-state-icon">
    <i class="fa-solid fa-cart-shopping"></i>
  </div>
  <h2>Your cart is empty</h2>
  <p>Browse products and add items...</p>
  <a class="btn btn-primary" href="products.html">Start shopping</a>
</section>
```

## HTML Structure

### Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="CSS/style.css">
  <link rel="stylesheet" href="CSS/mediaquery.css">
  
  <!-- Font Awesome -->
  <link rel="stylesheet" 
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <!-- Sidebar navigation -->
  <aside class="sidebar" id="sidebar">
    <nav class="sidebar-nav">
      <!-- Navigation links -->
    </nav>
  </aside>

  <!-- Main content -->
  <div class="main-content">
    <header class="top-header"></header>
    <!-- Page content here -->
  </div>

  <!-- JavaScript -->
  <script src="javascript/main.js"></script>
</body>
</html>
```

### Navigation Structure

```html
<nav class="sidebar-nav">
  <a href="index.html" class="active">
    <i class="fas fa-house"></i>
    <span class="text">Home</span>
  </a>
  <a href="products.html">
    <i class="fas fa-box"></i>
    <span class="text">Products</span>
  </a>
  <!-- More links... -->
</nav>
```

## CSS Architecture

### CSS Organization

```css
/* ========================= 
   UTILITIES & RESETS
   ========================= */
* { margin: 0; padding: 0; }

/* ========================= 
   TYPOGRAPHY
   ========================= */
body { font-family: Arial, sans-serif; }

/* ========================= 
   LAYOUT
   ========================= */
.container { max-width: 1650px; }

/* ========================= 
   COMPONENTS
   ========================= */
.product-card { /* ... */ }
.button { /* ... */ }

/* ========================= 
   RESPONSIVE DESIGN
   ========================= */
@media (max-width: 768px) {
  /* Mobile styles */
}
```

### Color System

```css
/* Primary Colors */
--cyan: #00d4ff;      /* Accent/Primary */
--dark-blue: #0d1648; /* Background */
--light-gray: #e0e0e0; /* Text */

/* Semantic Colors */
--success: #4caf50;   /* Success states */
--danger: #f44336;    /* Delete/Remove */
--warning: #ff9800;   /* Warnings */
```

### Responsive Breakpoints

```css
/* Mobile First */
/* Base styles for mobile */

/* Tablet - 768px and up */
@media (min-width: 768px) { }

/* Desktop - 1024px and up */
@media (min-width: 1024px) { }

/* Large Desktop - 1440px and up */
@media (min-width: 1440px) { }
```

## Event Handling

### Click Events

```javascript
// Product card actions
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  
  if (btn?.dataset.action === 'add-to-cart') {
    const product = getProductFromCard(btn.closest('.product-card'));
    addToCart(product);
  }
  
  if (btn?.dataset.action === 'add-to-wishlist') {
    const product = getProductFromCard(btn.closest('.product-card'));
    addToWishlist(product);
  }
});
```

### Form Events

```javascript
// Search form submission
const searchForm = $('form[role="search"]');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchForm.querySelector('input').value;
    performSearch(query);
  });
}
```

### Navigation Events

```javascript
// Menu toggle for mobile
const menuToggle = $('#menuToggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}
```

## Browser Compatibility

### Supported Browsers

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 60+ | Full Support | Latest features work |
| Firefox | 55+ | Full Support | Latest features work |
| Safari | 12+ | Full Support | Latest features work |
| Edge | 79+ | Full Support | Latest features work |
| IE | Any | Not Supported | Use modern browser |

### Required APIs

- **LocalStorage** - For data persistence
- **Fetch API** (optional) - For future integrations
- **ES6 Classes** - Modern JavaScript
- **CSS Flexbox** - Layout
- **CSS Grid** (optional) - Advanced layouts

### Fallbacks

```javascript
// Check LocalStorage availability
if (typeof(Storage) !== "undefined") {
  // LocalStorage available
  saveList(key, data);
} else {
  // Fallback: use in-memory storage
  console.warn('LocalStorage not available');
}
```

## Performance Optimization

### Best Practices

1. **Minimize DOM Manipulations**
   ```javascript
   // Bad: Repaints for each item
   items.forEach(item => {
     container.appendChild(createItemElement(item));
   });
   
   // Good: Single reflow
   const fragment = document.createDocumentFragment();
   items.forEach(item => {
     fragment.appendChild(createItemElement(item));
   });
   container.appendChild(fragment);
   ```

2. **Cache DOM Selectors**
   ```javascript
   // Bad: Selects every time
   function updateItems() {
     $('#cart').innerHTML = '...';
     $('#cart').style.display = 'block';
   }
   
   // Good: Cache reference
   const cartEl = $('#cart');
   function updateItems() {
     cartEl.innerHTML = '...';
     cartEl.style.display = 'block';
   }
   ```

3. **Debounce Handlers**
   ```javascript
   function debounce(fn, delay) {
     let timeoutId;
     return (...args) => {
       clearTimeout(timeoutId);
       timeoutId = setTimeout(() => fn(...args), delay);
     };
   }
   
   window.addEventListener('resize',
     debounce(() => updateLayout(), 250)
   );
   ```

4. **Lazy Load Images**
   ```html
   <img src="placeholder.jpg" 
        loading="lazy"
        data-src="actual-image.avif"
        alt="Product">
   ```

---

**Last Updated:** 2026
**Documentation Version:** 1.0.0
