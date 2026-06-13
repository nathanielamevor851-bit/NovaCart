# NovaCart - Quick Reference Guide

Fast lookup guide for common tasks and API functions.

## Quick Navigation

- [DOM Selectors](#dom-selectors)
- [Cart Functions](#cart-functions)
- [Wishlist Functions](#wishlist-functions)
- [Utility Functions](#utility-functions)
- [Data Access](#data-access)
- [Common Tasks](#common-tasks)
- [Code Snippets](#code-snippets)

## DOM Selectors

```javascript
// Single element
$('.class-name')        // First element with class
$('#id-name')          // Element with ID
$('[data-id="123"]')   // Element with data attribute
$('.parent .child')    // Descendant selector

// Multiple elements
$$('.product-card')    // All elements with class
$$('button[data-action]') // All buttons with data attribute

// Context-specific
$('.item', parentEl)   // Within parent element
$$('.product', container) // Multiple within container
```

## Cart Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `addToCart(product)` | Add/increment product in cart | `addToCart(product)` |
| `removeFromCart(id)` | Remove product from cart | `removeFromCart('123')` |
| `changeCartQuantity(id, delta)` | Adjust quantity ±1 | `changeCartQuantity('123', 1)` |
| `renderCartPage()` | Render cart UI | `renderCartPage()` |

## Wishlist Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `addToWishlist(product)` | Save product to wishlist | `addToWishlist(product)` |
| `removeFromWishlist(id)` | Remove from wishlist | `removeFromWishlist('123')` |
| `moveWishlistItemToCart(id)` | Move to cart & remove | `moveWishlistItemToCart('123')` |
| `renderWishlistPage()` | Render wishlist UI | `renderWishlistPage()` |

## Utility Functions

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `slugify(text)` | Text to slug | "Product Name" | "product-name" |
| `parsePrice(str)` | String to number | "GH¢99.99" | 99.99 |
| `formatMoney(num)` | Number to currency | 1234.56 | "GH¢1,234.56" |
| `flashButton(btn, label)` | Temp button feedback | button, "Added!" | Changes for 1.2s |
| `updateHeaderBadges()` | Update cart/wishlist counts | - | Updates header |

## Data Access

### Load Data
```javascript
// Get cart items
const cart = loadList(STORAGE_KEYS.cart);

// Get wishlist items
const wishlist = loadList(STORAGE_KEYS.wishlist);

// Result: Array of items
[
  { id, title, price, quantity, ... },
  // ...
]
```

### Save Data
```javascript
// After modifying
saveList(STORAGE_KEYS.cart, updatedCart);
saveList(STORAGE_KEYS.wishlist, updatedWishlist);
```

### Clear Data
```javascript
// Empty cart
saveList(STORAGE_KEYS.cart, []);

// Empty wishlist
saveList(STORAGE_KEYS.wishlist, []);

// Refresh UI
updateHeaderBadges();
renderCartPage();
renderWishlistPage();
```

## Common Tasks

### Task: Get Product Data from Element

```javascript
const card = document.querySelector('.product-card');
const product = getProductFromCard(card);
console.log(product);
// {
//   id: '...',
//   title: '...',
//   price: 99.99,
//   image: { src: '...', alt: '...' }
// }
```

### Task: Calculate Cart Total

```javascript
const cart = loadList(STORAGE_KEYS.cart);
const total = cart.reduce((sum, item) => {
  return sum + (item.price * item.quantity);
}, 0);
console.log(formatMoney(total)); // 'GH¢999.99'
```

### Task: Count Items in Cart

```javascript
const cart = loadList(STORAGE_KEYS.cart);

// Total items (sum of quantities)
const totalQty = cart.reduce((sum, item) => {
  return sum + (item.quantity || 1);
}, 0);

// Number of unique products
const uniqueProducts = cart.length;
```

### Task: Find Product in Cart

```javascript
const cart = loadList(STORAGE_KEYS.cart);
const product = cart.find(item => item.id === 'product-123');

if (product) {
  console.log(`Found: ${product.title}`);
  console.log(`Quantity: ${product.quantity}`);
}
```

### Task: Check if Product is in Wishlist

```javascript
const wishlist = loadList(STORAGE_KEYS.wishlist);
const exists = wishlist.some(item => item.id === 'product-123');

if (exists) {
  console.log('Already saved to wishlist');
}
```

### Task: Apply Discount to Cart

```javascript
const cart = loadList(STORAGE_KEYS.cart);
const discountPercent = 10;

const subtotal = cart.reduce((sum, item) => {
  return sum + (item.price * item.quantity);
}, 0);

const discount = subtotal * (discountPercent / 100);
const total = subtotal - discount;

console.log('Subtotal:', formatMoney(subtotal));
console.log('Discount:', formatMoney(discount));
console.log('Total:', formatMoney(total));
```

### Task: Export Cart as CSV

```javascript
const cart = loadList(STORAGE_KEYS.cart);

const csv = [
  'Product,Price,Quantity,Total',
  ...cart.map(item => {
    const total = item.price * item.quantity;
    return `${item.title},${item.price},${item.quantity},${total}`;
  })
].join('\n');

console.log(csv);
```

## Code Snippets

### Listen for Product Addition

```javascript
// Global event listener for add to cart
const originalAddToCart = window.addToCart;
window.addToCart = function(product) {
  originalAddToCart(product);
  console.log(`Added: ${product.title}`);
  
  // Trigger custom event
  window.dispatchEvent(new CustomEvent('product:added', {
    detail: product
  }));
};

// Listen for the event
window.addEventListener('product:added', (e) => {
  console.log('Product added:', e.detail);
});
```

### Auto-save Cart to Server

```javascript
function autoSyncCart() {
  const cart = loadList(STORAGE_KEYS.cart);
  
  // Send to server
  fetch('/api/cart/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart)
  })
  .then(r => r.json())
  .then(data => console.log('Cart synced:', data))
  .catch(err => console.error('Sync error:', err));
}

// Sync every 5 minutes
setInterval(autoSyncCart, 5 * 60 * 1000);
```

### Add Product Programmatically

```javascript
function addProductByName(productName) {
  const cards = $$('.product-card');
  const card = cards.find(c => {
    return c.querySelector('h3')?.textContent?.includes(productName);
  });
  
  if (card) {
    const product = getProductFromCard(card);
    addToCart(product);
    console.log(`Added "${productName}" to cart`);
  } else {
    console.error(`Product "${productName}" not found`);
  }
}

// Usage
addProductByName('Laptop');
```

### Log Cart Contents

```javascript
function logCart() {
  const cart = loadList(STORAGE_KEYS.cart);
  
  console.log('=== SHOPPING CART ===');
  cart.forEach((item, i) => {
    console.log(`${i + 1}. ${item.title}`);
    console.log(`   Price: ${formatMoney(item.price)}`);
    console.log(`   Qty: ${item.quantity}`);
    console.log(`   Total: ${formatMoney(item.price * item.quantity)}`);
  });
  
  const grandTotal = cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  console.log(`\nGrand Total: ${formatMoney(grandTotal)}`);
  console.log('==================');
}

logCart();
```

### Filter Products by Price

```javascript
function getProductsInPriceRange(min, max) {
  const cards = $$('.product-card');
  
  return cards
    .map(card => getProductFromCard(card))
    .filter(product => {
      return product.price >= min && product.price <= max;
    });
}

// Find products between GH¢100 and GH¢500
const affordable = getProductsInPriceRange(100, 500);
console.log(`Found ${affordable.length} products in range`);
```

### Storage Statistics

```javascript
function getStorageStats() {
  const cart = loadList(STORAGE_KEYS.cart);
  const wishlist = loadList(STORAGE_KEYS.wishlist);
  
  const cartSize = JSON.stringify(cart).length;
  const wishlistSize = JSON.stringify(wishlist).length;
  const totalSize = cartSize + wishlistSize;
  
  return {
    cartItems: cart.length,
    cartQuantity: cart.reduce((sum, i) => sum + (i.quantity || 1), 0),
    cartSize: `${(cartSize / 1024).toFixed(2)} KB`,
    wishlistItems: wishlist.length,
    wishlistSize: `${(wishlistSize / 1024).toFixed(2)} KB`,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    storageUsed: localStorage.length + ' items'
  };
}

console.table(getStorageStats());
```

## Browser Console Examples

Run these in browser DevTools console (F12) on the website:

```javascript
// Check cart contents
console.log(loadList('nc_cart_items'));

// Clear cart completely
localStorage.removeItem('nc_cart_items');
location.reload();

// Add test product
addToCart({
  id: 'test-123',
  title: 'Test Product',
  price: 99.99,
  description: 'Test',
  image: { src: '', alt: 'Test' }
});

// Get cart total
loadList('nc_cart_items').reduce((sum, i) => sum + (i.price * i.quantity), 0);

// Get wishlist items
console.log(loadList('nc_wishlist_items'));

// Check if localStorage available
'localStorage' in window && window.localStorage !== null;

// Monitor storage changes
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key, e.newValue);
});
```

## Keyboard Shortcuts (if implemented)

Coming soon - custom keyboard shortcuts for power users.

## FAQ

**Q: How do I add an item to cart programmatically?**
A: `addToCart(product)` where product has id, title, price, and image properties.

**Q: How do I get the cart total?**
A: Use reduce: `cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)`

**Q: How do I clear the entire cart?**
A: `saveList(STORAGE_KEYS.cart, []); updateHeaderBadges();`

**Q: Where is data stored?**
A: Browser's LocalStorage under keys: `nc_cart_items` and `nc_wishlist_items`

**Q: Can I export cart data?**
A: Yes, use `loadList(STORAGE_KEYS.cart)` and export as JSON or CSV.

**Q: What's the maximum cart size?**
A: ~5-10MB per domain in LocalStorage.

## Related Documentation

- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete feature documentation
- [JAVASCRIPT.md](JAVASCRIPT.md) - Detailed JavaScript reference
- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Installation and setup guide

---

**Last Updated:** 2026
**Quick Reference Version:** 1.0.0
