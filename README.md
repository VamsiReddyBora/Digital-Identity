# Clean & Lightweight Developer Portfolio

A fast, responsive, modern developer portfolio website built with semantic HTML5, pure CSS3, and vanilla JavaScript. Zero frameworks, zero build steps, and zero external runtime dependencies.

![Portfolio Preview](screenshot.png)

## ✨ Highlights

- **⚡ Blazing Fast & Lightweight**: Zero build steps. Loads instantly with a total weight under 50KB (uncompressed).
- **🌗 Dark & Light Theme**: Built-in system preference detection with toggle button and `localStorage` persistence.
- **📱 Fully Responsive**: Thoughtful mobile-first layouts using CSS Grid and Flexbox across mobile, tablet, and desktop screens.
- **🎨 Modern Aesthetics**: Refined typography, glassmorphic blurred navbar, glowing accents, and subtle micro-interactions.
- **🔍 Filterable Projects**: Filter projects by categories (Full Stack, Frontend, Tools & AI) with smooth CSS transitions.
- **📋 1-Click Copy Email**: Convenient copy email button with real-time toast feedback.
- **📬 Interactive Contact Form**: Client-side validation and simulated message dispatch with responsive state indicators.
- **♿ Accessible & SEO-friendly**: Semantic HTML5 landmark tags, `:focus-visible` outline rings, and Open Graph metadata.

## 🚀 Getting Started

### 1. View Directly
Simply open `index.html` in any modern web browser:
- On Windows: Double-click `index.html` or run `start index.html` in PowerShell.

### 2. Run with Local Development Server
To serve locally with live reload or preview:

**Using Python:**
```bash
python -m http.server 3000
```

**Using Node.js (npx):**
```bash
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Directory Structure

```text
├── index.html        # Main semantic markup & metadata
├── css/
│   └── style.css     # CSS custom properties, responsive layout, animations
├── js/
│   └── main.js       # Theme switcher, scrollspy, filter, toast & copy handlers
└── README.md         # Documentation & deployment guide
```

## 🛠️ Customization

1. **Personal Information**: Open `index.html` and update the name, titles, bio, social profile links, and email.
2. **Projects**: Modify the cards inside `.projects-grid` in `index.html` with your own project titles, descriptions, and repositories.
3. **Colors & Theming**: Open `css/style.css` and tweak the `:root` and `[data-theme="light"]` CSS custom properties to change the accent colors (`--accent`, `--accent-gradient`).

## 🌐 Free Deployment Options

- **GitHub Pages**: Go to your repository settings -> Pages -> Set branch to `main` and folder to `/root`.
- **Vercel / Netlify / Cloudflare Pages**: Simply drag-and-drop the directory or connect your GitHub repository for instant global CDN deployment.
