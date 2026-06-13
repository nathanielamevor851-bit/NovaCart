# NovaCart - E-Commerce Platform

A modern, responsive e-commerce website built with vanilla HTML, CSS, and JavaScript. NovaCart provides a complete shopping experience with product catalog, cart management, wishlist functionality, and persistent data storage using browser LocalStorage.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [File Documentation](#file-documentation)
- [JavaScript API](#javascript-api)
- [Contributing](#contributing)
- [License](#license)

## Overview

NovaCart is an online shopping platform designed to provide users with an intuitive and seamless e-commerce experience. The application is fully responsive, works across all devices (mobile, tablet, desktop), and stores user data locally in the browser using LocalStorage.

**Key Highlights:**
- Zero backend dependencies - runs entirely in the browser
- Data persistence using LocalStorage
- Modern, intuitive UI with smooth interactions
- Fully responsive design
- Fast loading with optimized assets

## Features

✅ **Product Catalog** - Browse through products with detailed information and pricing
✅ **Shopping Cart** - Add/remove items, adjust quantities, view total price
✅ **Wishlist** - Save products for later viewing
✅ **Responsive Design** - Optimized for mobile, tablet, and desktop
✅ **Product Search** - Find products quickly with search functionality
✅ **User Authentication** - Login/Signup page for user accounts
✅ **Modern UI** - Clean, professional interface with smooth animations
✅ **Contact Page** - Get in touch with customer support
✅ **FAQ Section** - Common questions and answers
✅ **Price Formatting** - Display prices in GHS currency
✅ **Mobile Navigation** - Hamburger menu for mobile devices
✅ **Data Persistence** - Cart and wishlist data saved locally

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | Latest | Page structure and semantic markup |
| CSS3 | Latest | Styling, animations, and responsive design |
| JavaScript (ES6+) | Latest | Interactivity and DOM manipulation |
| Font Awesome | 6.4.0 | Icons throughout the application |
| LocalStorage API | Native | Data persistence |

## Project Structure

```
NovaCart/
│
├── index.html              # Home/landing page
├── products.html           # Product catalog page
├── cart.html               # Shopping cart page
├── wishlist.html           # Saved items/wishlist page
├── about.html              # About the company
├── contact.html            # Contact form
├── account.html            # Login/Signup page
├── signup.html             # User registration page
│
├── CSS/
│   ├── style.css           # Main stylesheet with all styling
│   └── mediaquery.css      # Responsive design breakpoints
│
├── javascript/
│   └── main.js             # Core application logic & functionality
│
├── Images/                 # Product images and assets
│   └── *.avif              # Image files in AVIF format
│
├── Videos/                 # Video assets (if any)│
├── Audios/                 # Audio assets (if any)
│
├── fonts/
│   └── css/
│       └── all.css         # Font Awesome icons stylesheet
│       └── webfonts/       # Font files
│
└── README.md               # Project documentation (this file)
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required
- No installation needed - just open the HTML files

### Installation

1. **Clone or download the repository:**
   ```bash
   git clone https://github.com/yourusername/NovaCart.git
   cd NovaCart
   ```

2. **Open in browser:**
   ```bash
   # Option 1: Double-click index.html
   # Option 2: Use a local server
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

3. **Start browsing:**
   - Open `index.html` in your web browser
   - Navigate through pages using the sidebar menu
   - Click the hamburger menu on mobile devices

## Usage Guide

### Browsing Products

1. Click on **Products** in the navigation menu
2. View the product catalog with images, prices, and descriptions
3. Use the **Search bar** to find specific products

### Adding to Cart

1. On any product, click **"Add to Cart"** button
2. The cart badge updates automatically
3. Proceed to **Cart** page to review

### Wishlist Management

1. Click **"Add to Wishlist"** on any product
2. View saved items in the **Wishlist** page
3. Move items to cart or remove them

### Checkout

1. Go to **Cart** page
2. Review items and adjust quantities
3. Click **"Proceed to Checkout"** button
4. Complete payment process (if payment gateway integrated)

### User Account

1. Navigate to **Login/Signup** page
2. Create new account or log in with credentials
3. Your profile and order history saved

## File Documentation

### HTML Files

| File | Purpose |
|------|---------|
| `index.html` | Home page with hero section and featured products |
| `products.html` | Full product catalog with grid layout |
| `cart.html` | Shopping cart with item management |
| `wishlist.html` | Saved items and product comparison |
| `about.html` | Company information and mission |
| `contact.html` | Contact form and customer support |
| `account.html` | User login and account management |
| `signup.html` | New user registration form |

### CSS Files

| File | Purpose |
|------|---------|
| `CSS/style.css` | Main stylesheet with all component styles |
| `CSS/mediaquery.css` | Mobile-first responsive design rules |

### JavaScript Files

| File | Purpose |
|------|---------|
| `javascript/main.js` | Core app logic: cart, wishlist, storage management |

## JavaScript API

The application exposes several utility functions for managing cart and wishlist:

### Storage Management

```javascript
// Load items from storage
const cartItems = loadList('nc_cart_items');
const wishlistItems = loadList('nc_wishlist_items');

// Save items to storage
saveList('nc_cart_items', cartItems);
```

### Product Operations

```javascript
// Add product to cart
addToCart(product);

// Add product to wishlist
addToWishlist(product);

// Remove from cart
removeFromCart(productId);

// Update cart quantity
changeCartQuantity(productId, delta); // delta: -1 or +1
```

### UI Updates

```javascript
// Update header badges (cart/wishlist count)
updateHeaderBadges();

// Render cart page
renderCartPage();

// Render wishlist page
renderWishlistPage();
```

### Utility Functions

```javascript
// Format numbers as currency
formatMoney(amount); // Returns: GH¢1,234.56

// Parse price strings to numbers
parsePrice('GH¢1,234.56'); // Returns: 1234.56

// Convert text to URL-friendly slug
slugify('Product Name'); // Returns: product-name
```

## Data Structure

### Product Object

```javascript
{
  id: 'string',           // Unique product identifier
  title: 'string',        // Product name
  price: 'number',        // Current price
  oldPrice: 'number',     // Original price (optional)
  description: 'string',  // Product description
  image: {
    src: 'string',        // Image URL
    alt: 'string'         // Alt text for accessibility
  }
}
```

### Cart Item Object

```javascript
{
  ...product,             // All product properties
  quantity: number        // Number of items in cart
}
```

## LocalStorage Keys

- `nc_cart_items` - Stores shopping cart items
- `nc_wishlist_items` - Stores wishlist items

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes** with clear, descriptive commits
4. **Test thoroughly** on different devices and browsers
5. **Submit a Pull Request** with a clear description

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Follow consistent indentation (2 spaces)
- Use modern JavaScript (ES6+) features
- Ensure mobile responsiveness

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Supported |
| Firefox | Latest | ✅ Supported |
| Safari | Latest | ✅ Supported |
| Edge | Latest | ✅ Supported |
| IE | 11 | ❌ Not Supported |

## Performance

- Optimized images in AVIF format
- CSS and JS minification ready
- LocalStorage for fast data access
- Lazy loading compatible
- No external dependencies (except Font Awesome)

## Future Enhancements

- [ ] Payment gateway integration
- [ ] User authentication backend
- [ ] Product filtering and sorting
- [ ] Review and ratings system
- [ ] Inventory management
- [ ] Order tracking
- [ ] Email notifications
- [ ] Admin dashboard

## Troubleshooting

### Cart data not persisting
- **Issue:** Cart items disappear after refresh
- **Solution:** Check if LocalStorage is enabled in browser settings
- **Check:** `localStorage.getItem('nc_cart_items')`

### Images not loading
- **Issue:** Product images show broken image icon
- **Solution:** Verify image paths in HTML files
- **Check:** Ensure Images folder contains required files

### Responsive design issues
- **Issue:** Layout breaks on mobile
- **Solution:** Check mediaquery.css for correct breakpoints
- **Device:** Test with Chrome DevTools mobile emulator

## Performance Tips

1. **Optimize images** - Use AVIF or WebP formats
2. **Minify CSS/JS** - Reduce file sizes for faster loading
3. **Lazy load images** - Load images only when visible
4. **Use CDN** - Serve static assets from CDN
5. **Cache assets** - Implement service worker for offline support

## Security Notes

⚠️ **Important:** This is a frontend-only application. Sensitive data like:
- User passwords
- Payment information
- Personal data

...should never be stored in LocalStorage. Always use a secure backend for sensitive operations.

## License

This project is open source and available under the MIT License.

## Author

**Nathaniel** - Initial creation and maintenance

## Contact & Support

- 📧 **Email:** [your-email@example.com]
- 🌐 **Website:** [your-website.com]
- 💬 **Support:** Use the Contact page in the application

## Acknowledgments

- Font Awesome for beautiful icons
- The web development community for inspiration and best practices

---

**Last Updated:** 2026
**Version:** 1.0.0