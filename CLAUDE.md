# Battersea Library - Claude Code Context

> This file provides context for Claude Code sessions. Keep it updated as the project evolves.

## Project Overview

**Battersea Library** is a lightweight, modular JavaScript component library built with vanilla JavaScript (no dependencies).

- **Current Version:** 2.2.0
- **Repository:** https://github.com/idahodesign/battersea-library
- **Live Demos:**
  - GitHub Pages: https://idahodesign.github.io/battersea-library/demo/
  - Uundi: https://uundi.david-haworth.com/demo/
- **License:** MIT

---

## Quick Reference

### Project Structure
```
battersea-library/
├── src/
│   ├── js/           # 18 JavaScript files (includes env-config)
│   └── css/          # LESS source and compiled CSS
├── demo/             # PRIMARY demo folder
├── demos/            # Redirect folder (backwards compatibility)
├── includes/         # Reusable HTML partials (header, nav, footer)
├── docs/             # Component documentation
├── assets/           # Images and video
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
- `battersea-env-config.js` - Environment detection for multi-host deployment

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
- Demo pages: `[component].html` in `/demo/components/`
- Documentation: `[COMPONENT]-DOCUMENTATION.md` in `/docs/`

---

## Current Status

### Completed
- Repository structure and GitHub Pages deployment
- Homepage with component showcase
- Include system for reusable HTML
- 15 components fully functional
- **Demo folder consolidation** (Feb 2026): `demos/` → `demo/` with redirects
- **Multi-host deployment**: Same codebase works on GitHub Pages and Uundi
- **SSH setup** for GitHub pushes

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
- Use `demo/components/accordion.html` as template
- Update navigation in `includes/demo-nav.html`
- Test on Uundi before committing to Git

### Adding New Components
1. Create `src/js/battersea-[name].js` following existing patterns
2. Create `src/css/battersea-[name].less`
3. Register with core: `window.Battersea.register(...)`
4. Add demo page in `demo/components/`
5. Update this file's component list
6. Update `CHANGELOG.md`

### Git Workflow
- Commit messages: descriptive, present tense
- Branch for features if needed
- Push to main for deployment to GitHub Pages
- **SSH is configured** - can push directly without authentication prompts

### Deployment
- **GitHub Pages**: Auto-deploys from main branch
- **Uundi (VentraIP/cPanel)**: Use Fetch app for FTP uploads
  - Host: `ftp.david-haworth.com`
  - Protocol: FTP with TLS/SSL
  - Path: `/public_html/uundi/`

---

## Key Files to Reference

| Need | File |
|------|------|
| Current tasks | `TODO.md` |
| Version history | `CHANGELOG.md` |
| Component patterns | `src/js/battersea-accordion.js` (good example) |
| Demo page template | `demo/components/accordion.html` |
| Header docs | `docs/HEADER-DOCUMENTATION.md` |

---

## Notes for Claude Code Sessions

- This project uses CodeKit3 for LESS compilation (config.codekit3)
- The include system requires a local server to test (fetch doesn't work with file://)
- GitHub Pages auto-deploys from main branch
- When creating demo pages, follow the exact structure of accordion.html

### Environment Configuration
The `battersea-env-config.js` script auto-detects the hosting environment:
- **GitHub Pages**: Adds `/battersea-library` prefix to paths
- **Uundi/localhost**: No prefix needed
- Navigation links with `data-nav-link` attribute are automatically fixed

### Folder Structure Note
- `demo/` is the PRIMARY demo folder
- `demos/` contains redirect files only (for backwards compatibility with old URLs)
- Both hosts use the same codebase - no separate versions needed

### Archived Files
Old/deprecated files are in `/Battersea-library/Archive/` (outside git folder)

---

*Last updated: 5 February 2026*
