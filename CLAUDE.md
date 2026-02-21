# Battersea Library - Claude Code Context

> This file provides context for Claude Code sessions. Keep it updated as the project evolves.

## Project Overview

**Battersea Library** is a lightweight, modular JavaScript component library built with vanilla JavaScript (no dependencies).

- **Current Version:** 2.25.0
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
│   ├── js/           # 36 JavaScript files (includes env-config, nav-data)
│   └── css/          # LESS source (compiled CSS is gitignored)
├── demo/             # Demo folder
├── includes/         # Reusable HTML partials (header, nav, footer)
├── docs/             # Component documentation
├── assets/           # Images and video
├── CLAUDE.md         # This file - Claude Code context
├── TODO.md           # Active task tracking
├── CHANGELOG.md      # Version history
└── config.codekit3   # CodeKit build config (gitignored)
```

### Components (33 total)
1. Accessibility - Font size adjustment tool with dropdown slider
2. Accordion - Collapsible sections
3. Animation - Scroll-triggered animations
4. AudioPlayer - Custom audio player with stylable controls
5. Breadcrumbs - Auto-generated breadcrumb trail from navigation menu via NavData
6. Counter - Animated number counting
7. DataTable - Sortable, filterable tables with pagination, column resizing, row selection, CSV export
8. DragDrop - Reorderable lists and multi-container sorting with localStorage persistence
9. Flipbox - 3D flip cards
10. FormElements - Advanced form inputs: toggle switch, range slider, date picker, time picker, colour swatch
11. FormValidation - Real-time form validation with password strength, visibility toggle, file upload validation with styled drop zone, custom rules and AJAX submission
12. Header - Adaptive header with transparent mode, shrink-on-scroll
13. HorizontalNav - Multi-level dropdown menus
14. ImageGallery - Lightbox with masonry grid, zoom, and video
15. MiniQuiz - Interactive quiz with boolean, single-choice, and multi-select questions, timer, and scoring
16. MultiSlider - Multi-item carousel
17. NavData - Core navigation data service with JSON model, sequential refs, and breadcrumb API
18. NestedProgress - Multi-layer circular progress
19. PageNav - Prev/next page navigation with three modes (sequential, within category, between categories)
20. Parallax - Parallax backgrounds
21. Popup - Modal dialogs
22. ProfileGrid - Staff photo grid with hover overlays, filter pills, and detailed lightbox
23. ProgressBar - Horizontal/circular progress
24. Slider - Image/content carousel
25. SmoothScroll - Scroll-to-section navigation
26. Tabs - Tabbed interface
27. Timeline - Vertical/horizontal timeline with scroll-reveal, alternating layout, date badges, icon markers
28. Tooltip - Hover/focus tooltips
29. VerticalNav - Sidebar navigation (simple, collapsible, flyout, hover-to-expand, off-canvas)
30. VideoBackground - Looping background video with mobile poster fallback and configurable overlay
31. VideoPlayer - Custom video player with overlay controls, fullscreen, seek bar and auto-hiding controls
32. Graph - SVG charts: line, column, stacked column, bar, stacked bar, pie, donut, and radial with data loading, animation, tooltips, and legends
33. BackToTop - Scroll-to-top button that fades in as you scroll down the page

### Core Files (required for all components)
- `battersea-utils.js` - Shared utilities
- `battersea-core.js` - Auto-initialization system
- `battersea-env-config.js` - Environment detection for multi-host deployment
- `battersea-nav-data.js` - Navigation data service (JSON model, sequential refs, breadcrumbs)

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
- 32 components fully functional
- **Demo folder consolidation** (Feb 2026): `demos/` → `demo/` (old redirects removed)
- **Project file cleanup** (Feb 2026): Removed redundant files, gitignored compiled CSS
- **Multi-host deployment**: Same codebase works on GitHub Pages and Uundi
- **SSH setup** for GitHub pushes
- **VerticalNav v2.5.2** (Feb 2026): Hover-to-expand, off-canvas panel, stacking context fixes
- **Accessibility v2.6.0** (Feb 2026): Font size adjustment component with dropdown slider
- **All 18 demo pages complete** (Feb 2026): Every component now has a dedicated demo page
- **Demo navigation v2.6.1** (Feb 2026): Reorganised into 6 categories with all 18 pages linked
- **ProgressBar fixes v2.6.1** (Feb 2026): Circular rendering fix, animation quality improvements
- **Slider/MultiSlider arrow fix v2.6.1** (Feb 2026): Corrupted UTF-8 chevrons replaced with unicode escapes
- **AudioPlayer v2.8.0** (Feb 2026): Custom audio player with stylable controls, seek bar, volume, keyboard navigation
- **VideoPlayer v2.9.0** (Feb 2026): Custom video player with overlay controls, fullscreen, auto-hiding controls bar
- **ProfileGrid v2.10.0** (Feb 2026): Staff photo grid with hover overlays, filter pills, and detailed lightbox panels
- **DragDrop v2.11.0** (Feb 2026): Reorderable lists and multi-container sorting with localStorage persistence, touch support, display mode
- **Timeline v2.12.0** (Feb 2026): Vertical/horizontal timelines with scroll-reveal, alternating layout, date badges, icon markers
- **DataTable v2.13.0** (Feb 2026): Sortable, filterable tables with pagination, column resizing, row selection, CSV export
- **NavData v2.14.0** (Feb 2026): Core navigation data service parsing nav DOM into JSON with sequential refs and breadcrumbs
- **FormValidation v2.15.0** (Feb 2026): Real-time form validation with password strength, custom rules and AJAX submission
- **Breadcrumbs v2.16.0** (Feb 2026): Auto-generated breadcrumb trail from navigation menu, added to all demo pages
- **PageNav v2.17.0** (Feb 2026): Prev/next page navigation with three modes, added to all demo pages
- **MiniQuiz v2.18.0** (Feb 2026): Interactive quiz with boolean, single-choice, multi-select, timer, hide-until-click, JSON/CSV data loading
- **VideoBackground v2.19.0** (Feb 2026): Looping background video with mobile poster fallback and configurable overlay
- **Graph v2.20.0** (Feb 2026): SVG charts Phase 1 -- line, column, and pie with CSV/JSON data, animation, tooltips, legends
- **Graph Phase 2 v2.21.0** (Feb 2026): Four new chart types -- stacked column, stacked bar, donut, and radial bar
- **Graph fixes v2.21.1** (Feb 2026): Clickable segment links, constant-width pie/donut gaps, smooth stacked animation, segment gap attribute
- **FormValidation file upload v2.22.0** (Feb 2026): File type and size validation rules, styled drag-and-drop upload area, single and multi-file support
- **FormElements v2.23.0** (Feb 2026): Advanced form inputs -- toggle switch, range slider, date picker (custom calendar + native), time picker (24h/12h), colour swatch (preset grid + full picker)
- **Transparent header v2.24.0** (Feb 2026): Optional transparent background mode for Header component, fades in on scroll, works alongside sticky and shrink
- **BackToTop v2.25.0** (Feb 2026): Circular button with chevron arrow, fades in on scroll, smooth scroll to top, added to all demo pages
- **Homepage hero banner** (Feb 2026): Background image on hero section with transparent header, 40% white overlay
- **Transparent header fixes** (Feb 2026): Content slides under header correctly (margin-top on sibling), pre-header sticky with z-index 101, accessibility panel z-index fix

### In Progress
- See `TODO.md` for current tasks

### Next Priorities
1. Component documentation for each component
2. Accessibility audit
3. Mobile testing

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

### Testing workflow
- If possible create http://localhost:8080/demo/ and test locally
- Final test ftps to Uundi: https://uundi.david-haworth.com/demo/
- Once approaved move to Git Workflow

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
| VerticalNav docs | `docs/VERTICALNAV-DOCUMENTATION.md` |
| ImageGallery docs | `docs/IMAGEGALLERY-DOCUMENTATION.md` |
| ProfileGrid docs | `docs/PROFILEGRID-DOCUMENTATION.md` |
| Timeline docs | `docs/TIMELINE-DOCUMENTATION.md` |
| Graph docs | `docs/GRAPH-DOCUMENTATION.md` |

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
- `demo/` is the demo folder
- Both hosts use the same codebase - no separate versions needed

### Archived Files
Old/deprecated files are in `/Battersea-library/Archive/` (outside git folder)

---

*Last updated: 21 February 2026*
