# Battersea Library

A lightweight, modular JavaScript component library. No dependencies. Fully accessible. Infinitely themeable.

**[Live Demo](https://idahodesign.github.io/battersea-library/demo/)** | **[Changelog](CHANGELOG.md)**

---

## What is it?

Battersea Library is a collection of 18 production-ready UI components built with vanilla JavaScript and LESS/CSS. Everything is configured through data attributes in your HTML — no JavaScript setup needed. Drop the files in, add the markup, and it works.

---

## Components

**Navigation** — Header, Horizontal Navigation, Vertical Navigation

**Content** — Image Gallery, Parallax, Slider, MultiSlider

**Interactive** — Accordion, Counter, Flipbox, Popup, Tabs, Tooltip

**Data Display** — Progress Bar, Nested Progress

**Utilities** — Accessibility, Animation, SmoothScroll

---

## Quick Start

### 1. Include the files

```html
<!-- CSS (compiled from LESS) -->
<link rel="stylesheet" href="src/css/battersea-library-min.css">

<!-- Core (required) -->
<script src="src/js/battersea-utils.js"></script>
<script src="src/js/battersea-core.js"></script>

<!-- Components (include only what you need) -->
<script src="src/js/battersea-accordion.js"></script>
<script src="src/js/battersea-tabs.js"></script>
```

### 2. Add the markup

```html
<div data-accordion>
  <div data-accordion-item class="active">
    <div data-accordion-header>Section One</div>
    <div data-accordion-content>
      <div>Your content here.</div>
    </div>
  </div>
  <div data-accordion-item>
    <div data-accordion-header>Section Two</div>
    <div data-accordion-content>
      <div>More content here.</div>
    </div>
  </div>
</div>
```

That's it. The component initialises automatically when the page loads.

---

## How It Works

Every component follows the same pattern:

- **Data attributes** for configuration — no JavaScript config objects needed
- **Auto-initialisation** on page load via `battersea-core.js`
- **Custom events** using the `battersea:` prefix for integration with your own code
- **CSS custom properties** for theming without touching source files

Components are registered with `window.Battersea.register()` and initialised automatically for any matching elements in the DOM. New elements added dynamically are picked up by a MutationObserver.

---

## Theming

The library uses LESS variables for its default theme. You can override them at build time, or use CSS custom properties for runtime changes.

For development with runtime theming, include LESS.js and configure variables directly:

```html
<link rel="stylesheet/less" type="text/css" href="src/css/battersea-library.less">
<script>
  less = {
    globalVars: {
      'primary-color': '#667eea',
      'secondary-color': '#764ba2',
      'accent-color': '#4ecdc4'
    }
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/less@4.2.0"></script>
```

---

## Project Structure

```
battersea-library/
├── src/
│   ├── js/           # Component scripts + core utilities
│   └── css/          # LESS source files
├── demo/             # Demo site with all 18 component pages
├── includes/         # Reusable HTML partials (header, nav, footer)
├── docs/             # Component documentation
└── assets/           # Images and video
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

Uses standard DOM APIs and CSS transitions. No polyfills required.

---

## Contributing

We'd love contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get involved.

---

## Licence

MIT. See [LICENSE](LICENSE) for the full text.
