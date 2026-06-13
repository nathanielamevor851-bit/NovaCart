# NovaCart - Setup Guide

Complete step-by-step guide to set up and run NovaCart locally.

## System Requirements

- **Browser:** Chrome, Firefox, Safari, Edge (any modern browser)
- **Operating System:** Windows, macOS, Linux
- **Storage:** ~50MB (including images)
- **Internet:** Required for Font Awesome CDN (optional with offline fallback)

## Installation Methods

### Method 1: Direct File Access (Simplest)

**For Windows:**
1. Download or clone the NovaCart folder
2. Navigate to the folder in File Explorer
3. Double-click `index.html`
4. The website opens in your default browser

**For macOS:**
1. Download or clone the NovaCart folder
2. Open Finder and navigate to the folder
3. Right-click `index.html` → "Open With" → Choose your browser

**For Linux:**
```bash
# Navigate to project directory
cd ~/NovaCart

# Open with default browser
xdg-open index.html

# Or specify browser
firefox index.html
# or
google-chrome index.html
```

### Method 2: Local Development Server (Recommended)

**Using Python 3:**
```bash
# Navigate to project directory
cd ~/NovaCart

# Start local server
python -m http.server 8000

# Open browser to http://localhost:8000
```

**Using Python 2:**
```bash
cd ~/NovaCart
python -m SimpleHTTPServer 8000
# Open http://localhost:8000
```

**Using Node.js (http-server):**
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project
cd ~/NovaCart

# Start server
http-server

# Open browser to http://localhost:8080
```

**Using PHP:**
```bash
cd ~/NovaCart
php -S localhost:8000
# Open http://localhost:8000
```

**Using Ruby:**
```bash
cd ~/NovaCart
ruby -run -ehttpd . -p8000
# Open http://localhost:8000
```

### Method 3: VS Code Live Server

1. Install [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Open the NovaCart folder in VS Code
3. Right-click `index.html` → "Open with Live Server"
4. Browser opens automatically

## Project Setup

### 1. File Structure Verification

Ensure all files are in the correct locations:

```
NovaCart/
├── index.html           ✓ Required
├── products.html        ✓ Required
├── cart.html            ✓ Required
├── wishlist.html        ✓ Required
├── about.html           ✓ Required
├── contact.html         ✓ Required
├── account.html         ✓ Required
├── signup.html          ✓ Required
├── CSS/
│   ├── style.css        ✓ Required
│   └── mediaquery.css   ✓ Required
├── javascript/
│   └── main.js          ✓ Required
└── Images/              ✓ Required (contains product images)
```

### 2. Verify Internet Connectivity (for CDN resources)

Font Awesome icons load from CDN. Ensure:
- Internet connection is active
- CDN link is not blocked by firewall
- If offline, icons may not display (but functionality unaffected)

### 3. Browser LocalStorage Settings

**Enable LocalStorage (usually enabled by default):**

**Chrome/Edge:**
- Press `F12` → Application → Storage → Local Storage
- Should show `file://` or your domain

**Firefox:**
- Press `F12` → Storage → Local Storage
- Should be enabled

**Safari:**
- Develop → Show Web Inspector
- Storage tab should be visible

### 4. Check Console for Errors

1. Open browser Developer Tools (`F12`)
2. Go to **Console** tab
3. Should show no errors (may show Font Awesome CDN warning if offline)
4. Refresh page if needed

## First-Time Setup

### Step 1: Open Homepage
- Navigate to `index.html`
- See hero section, featured products, and navigation menu

### Step 2: Test Navigation
- Click "Products" → See full product catalog
- Click "Cart" → See empty cart message
- Click "Wishlist" → See empty wishlist message
- Click "About" → Read company information
- Click "Contact" → See contact form

### Step 3: Add Products
1. Go to **Products** page
2. Click "Add to Cart" on any product
3. Notice cart badge updates (shows number of items)
4. Go to **Cart** page to see item
5. Adjust quantity or remove item

### Step 4: Test Wishlist
1. Go to **Products** page
2. Click heart icon or "Add to Wishlist"
3. Notice wishlist badge updates
4. Go to **Wishlist** page to see saved item

### Step 5: Verify Data Persistence
1. Add items to cart and wishlist
2. **Refresh the page** (press `F5` or `Ctrl+R`)
3. Items should still be there
4. Open Browser DevTools → Application → Local Storage
5. You should see `nc_cart_items` and `nc_wishlist_items`

## Configuration

### Modify Currency

**File:** `javascript/main.js`
**Line:** ~19

```javascript
const moneyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
```

**To change to USD:**
```javascript
const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
```

### Modify Colors

**File:** `CSS/style.css`

Common colors to customize:
- Primary color: `#00d4ff` (cyan)
- Background: `rgba(13,22,72,0.7)` (dark blue)
- Text: `#e0e0e0` (light gray)

## Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect GitHub repo
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `.` (root)
6. Click "Deploy"

### Deploy to GitHub Pages

1. Push code to GitHub
2. Go to Settings → Pages
3. Select branch: `main` or `master`
4. Select folder: `/ (root)`
5. Click "Save"
6. Site available at `https://username.github.io/NovaCart`

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

## Troubleshooting

### Issue: Images not loading

**Solution 1:** Check image paths
```javascript
// Open DevTools → Console
// Check for 404 errors for images
```

**Solution 2:** Ensure Images folder exists with correct files
```bash
# List images
ls -la Images/
```

**Solution 3:** Use absolute paths if needed
```html
<!-- Instead of: -->
<img src="Images/product.avif">

<!-- Try: -->
<img src="/Images/product.avif">
```

### Issue: LocalStorage not working

**Solution 1:** Enable LocalStorage
- Chrome: DevTools → Application → Storage
- Check "Local Storage" is enabled

**Solution 2:** Check browser privacy settings
- Safari: Preferences → Privacy → Cookies and website data
- Firefox: about:config → dom.storage.enabled

**Solution 3:** Clear and reload
```javascript
// In console
localStorage.clear();
location.reload();
```

### Issue: Font Awesome icons missing

**Solution 1:** Check CDN link in HTML
```html
<!-- Should have Font Awesome link -->
<link rel="stylesheet" 
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

**Solution 2:** Go online (icons load from CDN)

**Solution 3:** Download Font Awesome locally
- Visit fontawesome.com
- Download offline package
- Update links in HTML files

### Issue: Website looks broken on mobile

**Solution:** Check viewport meta tag
```html
<!-- In <head> of HTML files -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Should be present. If missing, add it.

## Performance Optimization

### Optimize Images
```bash
# Convert images to WebP
for file in Images/*.jpg; do
  cwebp "$file" -o "${file%.jpg}.webp"
done
```

### Minify CSS
- Use tools like [CSS Minifier](https://cssminifier.com/)
- Reduce file size by ~40%

### Minify JavaScript
- Use tools like [JS Minifier](https://javascript-minifier.com/)
- Reduce file size by ~30-50%

## Development Workflow

### Making Changes

1. Open project folder in VS Code
2. Edit HTML/CSS/JavaScript files
3. Save changes (`Ctrl+S`)
4. Refresh browser (`F5`)
5. Check DevTools console for errors

### Adding New Products

**In HTML product sections:**
```html
<div class="product-card" data-product-id="unique-id">
  <img src="Images/product.avif" alt="Product Name">
  <h3>Product Name</h3>
  <p class="new-price">GH¢99.99</p>
  <p class="old-price">GH¢149.99</p>
  <p>Product description here</p>
  <button class="add-to-cart-btn">Add to Cart</button>
</div>
```

### Adding New Pages

1. Create new HTML file (e.g., `reviews.html`)
2. Include navigation in all pages
3. Link CSS files (`style.css`, `mediaquery.css`)
4. Include `main.js` script tag
5. Update sidebar navigation

## Support

- Check [README.md](README.md) for project overview
- See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed feature docs
- Open GitHub issues for bugs
- Email: support@novacart.com

---

**Last Updated:** 2026
**Setup Version:** 1.0.0
