# Battersea Library - Claude Code Context

> This file provides context for Claude Code sessions. Keep it updated as the project evolves.

## Project Overview

**Battersea Library** is a lightweight, modular JavaScript component library built with vanilla JavaScript (no dependencies).

- **Current Version:** 2.2.0
- **Repository:** https://github.com/idahodesign/battersea-library
- **Live Demo:** https://idahodesign.github.io/battersea-library/demos/
- **License:** MIT

---

## Quick Reference

### Project Structure
```
battersea-library/
├── src/
│   ├── js/           # 17 JavaScript component files
│   └── css/          # LESS source and compiled CSS
├── demos/            # Demo pages (index.html + component demos)
├── includes/         # Reusable HTML partials (header, nav, footer)
├── docs/             # Component documentation
├── assets/           # Images and fonts (placeholder)
├── CLAUDE.md         # This file - Claude Code context
├── TODO.md           # Active task tracking
├── CHANGELOG.md      # Version history
└── config.codekit3   # CodeKit build config (gitignored)
```

### Components (15 total)
1. Accordion - Collapsible sections
2. Animation - Scroll-triggered animations
3. Counter - Animated number counting
4. Flipbox - 3D flip cards
5. Header - Adaptive header with shrink-on-scroll
6. HorizontalNav - Multi-level dropdown menus
7. MultiSlider - Multi-item carousel
8. NestedProgress - Multi-layer circular progress
9. Parallax - Parallax backgrounds
10. Popup - Modal dialogs
11. ProgressBar - Horizontal/circular progress
12. Slider - Image/content carousel
13. SmoothScroll - Scroll-to-section navigation
14. Tabs - Tabbed interface
15. Tooltip - Hover/focus tooltips

### Core Files (required for all components)
- `battersea-utils.js` - Shared utilities
- `battersea-core.js` - Auto-initialization system

---

## Coding Standards

### JavaScript Conventions
- Vanilla JS only (no dependencies)
- ES6+ syntax
- Component registration pattern:
  ```javascript
  window.Battersea.register('componentName', ComponentClass, '[data-selector]');
  ```
- Custom events use `battersea:` prefix
- All components support auto-initialization via data attributes

### CSS/LESS Conventions
- One LESS file per component: `battersea-[component].less`
- Variables in `battersea-variables.less`
- Compiled output: `battersea-library.css` and `battersea-library-min.css`
- Responsive breakpoints:
  - Mobile: < 768px
  - Tablet: 768-1023px
  - Desktop: >= 1024px

### HTML Conventions
- Semantic HTML5
- ARIA labels for accessibility
- Data attributes for component configuration
- Include system uses `fetch()` for partials

### File Naming
- JavaScript: `battersea-[component].js`
- CSS/LESS: `battersea-[component].less`
- Demo pages: `[component].html` in `/demos/`
- Documentation: `[COMPONENT]-DOCUMENTATION.md` in `/docs/`

---

## Current Status

### Completed
- Repository structure and GitHub Pages deployment
- Homepage with component showcase
- Include system for reusable HTML
- 15 components fully functional

### In Progress
- See `TODO.md` for current tasks

### Next Priorities
1. Create remaining 13 demo pages
2. Component documentation for each component
3. Accessibility audit
4. Mobile testing

---

## Working With This Project

### Before Starting Work
1. Check `TODO.md` for current priorities
2. Check `CHANGELOG.md` for recent changes
3. Review relevant component code in `src/js/`

### Creating Demo Pages
- Use `demos/components/accordion.html` as template
- Update navigation in `includes/demo-nav.html`
- Test locally before committing

### Adding New Components
1. Create `src/js/battersea-[name].js` following existing patterns
2. Create `src/css/battersea-[name].less`
3. Register with core: `window.Battersea.register(...)`
4. Add demo page in `demos/`
5. Update this file's component list
6. Update `CHANGELOG.md`

### Git Workflow
- Commit messages: descriptive, present tense
- Branch for features if needed
- Push to main for deployment to GitHub Pages

---

## Key Files to Reference

| Need | File |
|------|------|
| Current tasks | `TODO.md` |
| Version history | `CHANGELOG.md` |
| Component patterns | `src/js/battersea-accordion.js` (good example) |
| Demo page template | `demos/components/accordion.html` |
| Header docs | `docs/HEADER-DOCUMENTATION.md` |

---

## Notes for Claude Code Sessions

- This project uses CodeKit3 for LESS compilation (config.codekit3)
- The include system requires a local server to test (fetch doesn't work with file://)
- GitHub Pages auto-deploys from main branch
- When creating demo pages, follow the exact structure of accordion.html

---

*Last updated: February 2026*
