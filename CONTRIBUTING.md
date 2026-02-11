# Contributing to Battersea Library

Thanks for wanting to contribute. Here's everything you need to know to get started.

---

## Getting Set Up

1. Fork and clone the repository
2. Run a local server — the include system uses `fetch()`, so `file://` won't work:
   ```bash
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080/demo/` in your browser

The library uses [CodeKit 3](https://codekitapp.com/) for LESS compilation during development. If you don't have CodeKit, you can use the LESS.js runtime compiler that's already included in the demo pages — it compiles in the browser, so no build step is needed for local development.

---

## Project Structure

```
src/js/battersea-utils.js      # Shared utility functions (required)
src/js/battersea-core.js       # Auto-initialisation and component registry (required)
src/js/battersea-[name].js     # One file per component
src/css/battersea-[name].less  # One LESS file per component
src/css/battersea-variables.less  # Shared LESS variables
demo/components/[name].html    # Demo page per component
docs/[NAME]-DOCUMENTATION.md   # Component documentation
```

---

## Creating a New Component

Every component follows the same pattern. Here's the skeleton:

```javascript
(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('MyComponent requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class MyComponent {
    constructor(el) {
      this.el = el;
      this.events = [];
      this.init();
    }

    init() {
      // Parse data attributes
      // Set up DOM
      // Bind events
    }

    destroy() {
      // Remove event listeners
      this.events.forEach(event => event.remove());
      this.events = [];
      // Clean up DOM changes
    }
  }

  window.Battersea.register('myComponent', MyComponent, '[data-my-component]');

})(window, document);
```

### The rules

- **Vanilla JavaScript only** — no frameworks, no dependencies
- **IIFE wrapper** — every component file is wrapped in an immediately invoked function expression
- **Data attributes for configuration** — users shouldn't need to write JavaScript to use a component
- **`destroy()` method is required** — clean up event listeners and DOM changes
- **Custom events use the `battersea:` prefix** — e.g. `battersea:myComponentChange`
- **Track event listeners** — push them to `this.events` using `Utils.addEvent()` so they can be cleaned up in `destroy()`

### Naming conventions

| What | Pattern | Example |
|------|---------|---------|
| JS file | `battersea-[name].js` | `battersea-flipbox.js` |
| LESS file | `battersea-[name].less` | `battersea-flipbox.less` |
| Data attribute | `data-[name]` | `data-flipbox` |
| Registration | `window.Battersea.register('name', ...)` | `register('flipbox', ...)` |
| Custom events | `battersea:[name]Event` | `battersea:flipboxFlip` |
| CSS class prefix | `battersea-[name]` | `battersea-flipbox` |

---

## Creating a Demo Page

Use `demo/components/accordion.html` as your template. Every demo page follows the same structure:

1. **Hero section** — component name and one-line description
2. **Live demos** — working examples with different configurations
3. **Features** — card grid highlighting key capabilities
4. **Configuration** — table of data attributes and options
5. **Usage examples** — code snippets in an accordion
6. **Accessibility** — what keyboard and screen reader support is included
7. **Browser support** — compatibility table

After creating the page, add it to `includes/demo-nav.html` under the appropriate category.

---

## CSS / LESS Guidelines

- One LESS file per component
- Use variables from `battersea-variables.less` where possible
- Support CSS custom properties for runtime theming
- Responsive breakpoints: mobile (`< 768px`), tablet (`768-1023px`), desktop (`>= 1024px`)
- Use UK English in class names where relevant (e.g. `colour` not `color` in comments, though CSS property names obviously stay as-is)

---

## Accessibility

Every component should include:

- **Keyboard navigation** — all interactive elements reachable and operable via keyboard
- **ARIA attributes** — roles, labels, and states where appropriate
- **Focus management** — visible focus indicators, logical tab order
- **Semantic HTML** — use the right elements (`button` for actions, `a` for navigation)

---

## Commit Messages

Write clear, descriptive commit messages in the present tense:

```
Add ProfileGrid component with lightbox panel (v2.8.0)
Fix accordion nested click propagation issue
Update demo navigation with new component links
```

---

## Submitting Changes

1. Create a branch for your work
2. Make your changes
3. Test locally on `http://localhost:8080/demo/`
4. Test on mobile if your changes affect layout
5. Submit a pull request with a clear description of what you've done and why

---

## Questions?

Open an issue on [GitHub](https://github.com/idahodesign/battersea-library/issues) and we'll get back to you.
