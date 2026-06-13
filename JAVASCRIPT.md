# NovaCart JavaScript Code Documentation

Complete reference for all JavaScript functions, utilities, and implementation details.

## Table of Contents

1. [Global Configuration](#global-configuration)
2. [Utility Functions](#utility-functions)
3. [Cart Management](#cart-management)
4. [Wishlist Management](#wishlist-management)
5. [UI Rendering](#ui-rendering)
6. [Event Handling](#event-handling)
7. [Authentication](#authentication)
8. [Initialization](#initialization)

## Global Configuration

### Constants

```javascript
// LocalStorage keys for data persistence
const STORAGE_KEYS = {
  cart: 'nc_cart_items',        // Shopping cart array
  wishlist: 'nc_wishlist_items' // Saved items array
};

// Currency formatter (Ghana Cedi)
const moneyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
```

### DOM Helpers

```javascript
// Select single element
const element = $('.class-name');
const element = $('#id-name');

// Select multiple elements
const elements = $$('.product-card');
```

## Utility Functions

### slugify(value)
Converts text to URL-friendly slug format.

```javascript
slugify('Product Name') // Returns: 'product-name'
slugify('Price: $99.99') // Returns: 'price-9999'
```

### parsePrice(value)
Extracts numeric value from price strings.

```javascript
parsePrice('GH¢1,234.56') // Returns: 1234.56
parsePrice('99.99') // Returns: 99.99
parsePrice('invalid') // Returns: 0
```

### formatMoney(value)
Formats numbers as currency strings.

```javascript
formatMoney(1234.56) // Returns: 'GH¢1,234.56'
formatMoney(99) // Returns: 'GH¢99.00'
```

### loadList(key)
Loads data from browser LocalStorage.

```javascript
const cartItems = loadList(STORAGE_KEYS.cart);
// Returns: [{id, title, price, quantity, ...}, ...]
// Returns: [] if key doesn't exist or JSON parse fails
```

### saveList(key, value)
Saves data to browser LocalStorage.

```javascript
saveList(STORAGE_KEYS.cart, cartItems);
```

### getProductFromCard(card)
Extracts product data from product card DOM element.

**Expected HTML Structure:**
```html
<div class="product-card" data-product-id="123">
  <img src="image.jpg" alt="Product">
  <h3>Product Name</h3>
  <p class="new-price">GH¢99.99</p>
  <p class="old-price">GH¢149.99</p>
  <p>Description</p>
</div>
```

**Returns:**
```javascript
{
  id: 'product-123',
  title: 'Product Name',
  price: 99.99,
  oldPrice: 149.99,
  description: 'Description text',
  image: {
    src: 'image.jpg',
    alt: 'Product'
  }
}
```

### updateHeaderBadges()
Updates cart/wishlist badge counts in header navigation.

```javascript
updateHeaderBadges();
// Updates badges showing:
// - Cart: total quantity of items
// - Wishlist: number of saved items
```

### addBadge(anchor, count)
Creates and appends a badge element to a navigation link.

```javascript
const link = document.querySelector('a[href="cart.html"]');
addBadge(link, 5); // Shows "5"
addBadge(link, 15); // Shows "9+" (capped at 9)
```

### flashButton(button, label, className)
Temporarily changes button text/style for feedback.

```javascript
flashButton(addButton, 'Added to cart', 'success');
// After 1.2 seconds, button reverts to original state
```

## Cart Management

### addToCart(product)
Adds product to shopping cart or increments quantity if already exists.

```javascript
addToCart({
  id: '123',
  title: 'Product Name',
  price: 99.99,
  oldPrice: 149.99,
  description: 'Details',
  image: { src: 'image.jpg', alt: 'Product' }
});

// If product already in cart, quantity increases by 1
// If new product, added with quantity: 1
```

**Flow:**
1. Load cart from LocalStorage
2. Check if product already exists
3. Update quantity or add new product
4. Save to LocalStorage
5. Update header badges
6. Re-render cart page

### removeFromCart(productId)
Removes product from cart completely.

```javascript
removeFromCart('product-123');
```

### changeCartQuantity(productId, delta)
Adjusts product quantity in cart.

```javascript
// Increase quantity by 1
changeCartQuantity('product-123', 1);

// Decrease quantity by 1
changeCartQuantity('product-123', -1);

// Auto-removes if quantity drops to 0
```

**Parameters:**
- `productId` (string): ID of product
- `delta` (number): Change amount (-1, +1, etc.)

### Cart Data Structure

```javascript
// Single cart item
{
  id: 'unique-id',
  title: 'Product Name',
  price: 99.99,
  oldPrice: 149.99,
  description: 'Product description',
  image: {
    src: 'path/to/image.avif',
    alt: 'Alt text'
  },
  quantity: 2  // Number of items
}

// Full cart array
localStorage['nc_cart_items'] = JSON.stringify([
  { ...cartItem1 },
  { ...cartItem2 },
  // ...
]);
```

## Wishlist Management

### addToWishlist(product)
Saves product to wishlist (prevents duplicates).

```javascript
addToWishlist(product);
// Only adds if product not already in wishlist
```

### removeFromWishlist(productId)
Removes product from wishlist.

```javascript
removeFromWishlist('product-123');
```

### moveWishlistItemToCart(productId)
Moves product from wishlist to cart (removes from wishlist).

```javascript
moveWishlistItemToCart('product-123');
// Adds to cart, then removes from wishlist
```

## UI Rendering

### renderCartPage()
Renders the shopping cart page with all items and summary.

**Displays:**
- All cart items with images, prices, quantities
- Quantity adjustment buttons (+/-)
- Remove item buttons
- Order summary (items count, subtotal, total)
- Empty state message if no items

**When Called:**
- When adding item to cart
- When removing item from cart
- When changing quantity
- On cart page load

**Empty State Template:**
```html
<section class="empty-state">
  <i class="fa-solid fa-cart-shopping"></i>
  <h2>Your cart is empty</h2>
  <p>Browse products...</p>
  <a class="btn btn-primary" href="products.html">Start shopping</a>
</section>
```

### renderWishlistPage()
Renders the wishlist page with all saved items.

**Displays:**
- All wishlist items
- Item prices and old prices
- "Move to cart" and "Remove" buttons
- Wishlist summary (items count, total value)
- Empty state message if no items

**When Called:**
- When adding item to wishlist
- When removing from wishlist
- On wishlist page load

## Event Handling

### initSharedButtons()
Handles click events on product action buttons.

**Buttons Handled:**
- `.btn-cart` - "Add to Cart" button
- `.btn-wishlist` - "Add to Wishlist" button
- `.btn-buy` - "Buy Now" button

**Behavior:**
```javascript
// Add to Cart button
- Extracts product data
- Calls addToCart()
- Flashes button with "Added to cart" message

// Add to Wishlist button
- Extracts product data
- Calls addToWishlist()
- Flashes button with "Wishlisted" message

// Buy Now button
- Redirects to cart.html
```

### initCartWishlistDelegation()
Handles events in cart and wishlist pages using event delegation.

**Cart Page Actions:**
- `data-action="increase"` - Increase item quantity
- `data-action="decrease"` - Decrease item quantity
- `data-action="remove-cart"` - Remove from cart

**Wishlist Page Actions:**
- `data-action="remove-wishlist"` - Remove from wishlist
- `data-action="move-to-cart"` - Move item to cart

### initSidebar()
Manages mobile/desktop sidebar navigation.

**Features:**
- Mobile: Toggle sidebar on/off
- Desktop: Collapse/expand sidebar
- Auto-close on mobile when clicking outside
- Update main content margins

### initSearch()
Implements product search functionality.

**Features:**
- Real-time search as user types
- Searches product cards by text content
- Shows/hides matching products
- Form submission support

### initHeaderScroll()
Adds shadow to header on scroll.

**Behavior:**
- No shadow at top of page
- Shadow appears when scrolled > 20px
- Shadow removed when back at top

### initScrollTopButton()
"Back to top" button functionality.

**Features:**
- Hidden until user scrolls > 300px
- Click to smoothly scroll to top
- Passive event listener for performance

### initNewsletter()
Newsletter form submission.

**Features:**
- Email validation
- Success message on submit
- Clears input field
- Form submission prevention

### initResizeHandler()
Handles window resize events efficiently.

**Features:**
- Uses requestAnimationFrame for performance
- Prevents header blur on mobile resize
- Closes sidebar on larger screens
- Debounces resize updates

## Authentication

### initAuthForms()
Initializes login and signup form handlers.

### initLoginForm()
Sets up login form validation and submission.

**Validation Rules:**
- Email: Valid email format required
- Password: Minimum 6 characters

**Features:**
- Real-time validation on blur
- Error messages
- Loading state during submission
- Simulated API call (1.5 seconds)
- Redirect to index.html on success

### initSignupForm()
Sets up signup form validation and submission.

**Validation Rules:**
- Name: Required, non-empty
- Email: Valid email format
- Password: Minimum 8 characters
- Confirm: Must match password
- Terms: Must be checked

**Features:**
- Password strength indicator
- Real-time validation
- Confirm password matching
- Error messages
- Loading state
- Redirect to account.html on success

### initPasswordToggle()
Toggle password visibility in auth forms.

**Features:**
- Shows/hides password characters
- Changes icon (eye/eye-slash)
- Keyboard accessible

### Form Validation Functions

```javascript
// Validate email format
validateEmail(email) // Returns: boolean

// Validate password length
validatePassword(password, minLength = 6) // Returns: boolean

// Show field error
showFieldError(input, message) // Updates UI with error

// Clear field error
clearFieldError(input) // Removes error styling

// Update password strength indicator
updatePasswordStrength(password) // Shows strength bar
```

## Initialization

### init()
Main initialization function - sets up all features.

**Called On:**
- Page load (DOMContentLoaded or immediately if already loaded)

**Initializes:**
1. Sidebar navigation
2. Active link highlighting
3. Header scroll effects
4. Product search
5. Scroll animations (fade-in)
6. Scroll to top button
7. Newsletter form
8. Resize handler
9. Product action buttons
10. Cart/wishlist delegation
11. Checkout button
12. Auth forms
13. Year in footer
14. Image lazy loading
15. Header badges
16. Cart page
17. Wishlist page

**Order Matters:**
- Some functions depend on DOM being fully loaded
- Event listeners set up before page interactions
- Data loaded from storage early

## Usage Examples

### Add Product to Cart

```javascript
// Method 1: From product card element
const card = document.querySelector('.product-card');
const product = getProductFromCard(card);
addToCart(product);

// Method 2: With product object
addToCart({
  id: 'prod-123',
  title: 'Laptop',
  price: 1200,
  image: { src: 'laptop.jpg', alt: 'Laptop' }
});
```

### Get Cart Total

```javascript
const cart = loadList(STORAGE_KEYS.cart);
const total = cart.reduce((sum, item) => {
  return sum + (item.price * item.quantity);
}, 0);
console.log(formatMoney(total));
```

### Clear Cart

```javascript
saveList(STORAGE_KEYS.cart, []);
updateHeaderBadges();
renderCartPage();
```

### Search Products Programmatically

```javascript
const query = 'laptop';
const cards = $$('.product-card');
cards.forEach(card => {
  const text = card.textContent.toLowerCase();
  card.style.display = text.includes(query) ? '' : 'none';
});
```

## Best Practices

### 1. Always Validate Input
```javascript
// Good
if (!product || !product.id) return;

// Avoid
addToCart(product); // May crash if product is null
```

### 2. Cache DOM Selectors
```javascript
// Good
const cartBtn = $('[data-action="cart"]');
cartBtn.addEventListener('click', handler);

// Avoid
document.querySelector('[data-action="cart"]').addEventListener(...);
document.querySelector('[data-action="cart"]').style.color = 'red';
```

### 3. Use Event Delegation
```javascript
// Good: Single listener handles many elements
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (btn) handleAction(btn);
});

// Avoid: Listener for each element
$$('.btn-add').forEach(btn => {
  btn.addEventListener('click', handler);
});
```

### 4. Handle Errors Gracefully
```javascript
function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return []; // Fallback to empty array
  }
}
```

## Performance Considerations

1. **LocalStorage Operations**
   - Serialize/parse JSON on every save/load
   - Keep data structures small
   - Don't save unnecessary properties

2. **DOM Updates**
   - Use `innerHTML` for bulk rendering (cart, wishlist)
   - Use event delegation instead of individual listeners
   - Cache element references

3. **Event Listeners**
   - Use passive listeners for scroll events
   - Debounce/throttle resize and scroll
   - Clean up listeners when elements removed

4. **Image Optimization**
   - Use lazy loading for images below fold
   - Use AVIF/WebP formats
   - Set `decoding="async"` on all images

---

**Last Updated:** 2026
**JavaScript Documentation Version:** 1.0.0
