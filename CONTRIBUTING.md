# Contributing to NovaCart

Thank you for your interest in contributing to NovaCart! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report issues professionally
- No harassment or discrimination

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/NovaCart.git
cd NovaCart
```

### 2. Create a Feature Branch

```bash
# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Examples:
# git checkout -b feature/add-product-filters
# git checkout -b feature/improve-mobile-ui
# git checkout -b bugfix/cart-calculation-error
```

### 3. Make Your Changes

Follow the code style guidelines:

**JavaScript:**
```javascript
// Use meaningful variable names
const userCartItems = loadList(STORAGE_KEYS.cart);

// Add comments for complex logic
function calculateTotal(items) {
  // Multiply price by quantity for each item
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}

// Use const/let, avoid var
const x = 10; // Good
let counter = 0; // Good
var name = 'John'; // Avoid
```

**CSS:**
```css
/* Use clear class names */
.product-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

/* Comment complex selectors */
/* Mobile navigation hamburger menu */
.menu-toggle {
  display: none;
  /* ... */
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
}
```

**HTML:**
```html
<!-- Use semantic HTML -->
<article class="product-card">
  <img src="..." alt="Product description">
  <h3>Product Name</h3>
  <p>Description</p>
</article>

<!-- Include data attributes when needed -->
<button data-product-id="123" data-action="add-to-cart">
  Add to Cart
</button>
```

## Code Style Guide

### JavaScript

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Variable naming:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Functions:** camelCase for names, descriptive action verbs

```javascript
// Good examples
const MAX_ITEMS = 100;
function addProductToCart(product) { }
const cartItems = [];
let itemCount = 0;
```

### CSS

- **Indentation:** 2 spaces
- **Class naming:** kebab-case
- **ID naming:** camelCase
- **Property order:** Group related properties

```css
/* Good example */
.product-card {
  /* Display */
  display: flex;
  flex-direction: column;
  
  /* Spacing */
  margin: 1rem;
  padding: 1rem;
  gap: 0.5rem;
  
  /* Colors */
  background: #fff;
  border: 1px solid #ddd;
  
  /* Text */
  font-size: 1rem;
  line-height: 1.5;
  
  /* Effects */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
```

### HTML

- **Indentation:** 2 spaces
- **Class naming:** kebab-case
- **Use semantic elements:** `<article>`, `<nav>`, `<button>` instead of `<div>`
- **Alt text:** Always include for images
- **Accessibility:** Use ARIA labels when needed

```html
<!-- Good example -->
<article class="product-card" data-product-id="123">
  <img src="image.avif" alt="Product name description">
  <h3>Product Name</h3>
  <button data-action="add-to-cart" aria-label="Add to cart">
    <i class="fas fa-cart-plus"></i>
  </button>
</article>
```

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, missing semicolons, etc.)
- **refactor:** Code refactoring without feature changes
- **perf:** Performance improvements
- **test:** Adding or updating tests
- **chore:** Build, dependency, or CI changes

### Examples

```bash
git commit -m "feat(cart): add quantity validation for cart items"
git commit -m "fix(wishlist): prevent duplicate items in wishlist"
git commit -m "docs(readme): add setup instructions"
git commit -m "style(css): fix indentation in style.css"
git commit -m "refactor(main.js): simplify price formatting logic"
```

## Testing

### What to Test

1. **Functionality**
   - Add/remove items from cart
   - Add/remove items from wishlist
   - Update item quantities
   - Page navigation
   - Form submissions

2. **Compatibility**
   - Chrome, Firefox, Safari, Edge
   - Mobile (320px), Tablet (768px), Desktop (1024px+)
   - Touch and click events

3. **Data Persistence**
   - Items save in LocalStorage
   - Refresh page - items persist
   - Clear localStorage - items gone
   - Multiple tabs - data syncs

### Testing Checklist

- [ ] Feature works on desktop
- [ ] Feature works on tablet (768px width)
- [ ] Feature works on mobile (320px width)
- [ ] No console errors or warnings
- [ ] Images load correctly
- [ ] Navigation works properly
- [ ] Cart/wishlist persist after refresh
- [ ] Responsive design intact

## Pull Request Process

### 1. Push Your Changes

```bash
git add .
git commit -m "feat(feature-name): description"
git push origin feature/your-feature-name
```

### 2. Create Pull Request

- Go to GitHub
- Click "New Pull Request"
- Select your branch
- Fill in the PR template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Style/refactor
- [ ] Performance improvement

## Related Issues
Fixes #(issue number)

## Testing Done
- [ ] Desktop
- [ ] Mobile
- [ ] Tablet
- [ ] Data persistence
- [ ] No console errors

## Screenshots (if applicable)
- Before: ...
- After: ...

## Checklist
- [ ] Code follows style guide
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Tested on multiple devices
```

### 3. Code Review

Maintainers will review your PR:
- Provide feedback if changes needed
- Request modifications
- Approve and merge

## Issues & Bug Reports

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
Clear and concise description

**Steps to reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
Visual evidence if applicable

**Environment**
- Browser: Chrome 120
- Device: Desktop/Mobile
- OS: Windows/macOS/Linux
```

### Feature Requests

```markdown
**Is your feature related to a problem?**
Description

**Describe the solution you'd like**
How it should work

**Describe alternatives considered**
Other approaches

**Additional context**
Any other info
```

## Development Tips

### Useful Browser DevTools

```javascript
// View cart items
localStorage.getItem('nc_cart_items')

// View wishlist items
localStorage.getItem('nc_wishlist_items')

// Clear all data
localStorage.clear()

// Test cart function
addToCart({
  id: 'test-1',
  title: 'Test Product',
  price: 99.99,
  image: { src: 'test.jpg', alt: 'Test' }
})
```

### File Size Limits

- JavaScript: Keep main.js under 50KB
- CSS: Keep stylesheets under 100KB combined
- Images: Use AVIF or WebP format
- Use lazy loading for images

### Performance Guidelines

- Minimize DOM manipulations
- Debounce resize events
- Lazy load images
- Cache selectors
- Avoid inline styles

## Documentation Requirements

- Update README.md for new features
- Add JSDoc comments for JavaScript functions
- Comment complex CSS selectors
- Document breaking changes
- Update CHANGELOG.md if exists

### JSDoc Example

```javascript
/**
 * Adds a product to the shopping cart
 * @param {Object} product - The product to add
 * @param {string} product.id - Unique product identifier
 * @param {string} product.title - Product name
 * @param {number} product.price - Product price
 * @param {Object} product.image - Product image info
 * @returns {boolean} True if added successfully
 */
function addToCart(product) {
  // implementation
}
```

## Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes for major contributions

## Questions?

- Open a GitHub Discussion
- Create an Issue with your question
- Check existing Issues/Discussions first

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to NovaCart!** 

Every contribution helps make this project better.

**Last Updated:** 2026
**Contributing Version:** 1.0.0
