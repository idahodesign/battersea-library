# Battersea Library - TODO

**Last Updated:** 21 February 2026
**Current Version:** 2.20.0
**Status:** Multi-host deployment configured, live on GitHub Pages and Uundi

---

## 🎯 Immediate Priorities

### ✅ Completed
- [x] Set up Git and GitHub Desktop
- [x] Create GitHub repository
- [x] Reorganise file structure (src/, demos/, includes/, docs/)
- [x] Create homepage (demo/index.html)
- [x] Create include system (header, nav, footer)
- [x] Create example demo page (accordion.html)
- [x] Enable GitHub Pages
- [x] Deploy live site
- [x] **Consolidate demo folders** - `demos/` → `demo/` with redirects (Feb 2026)
- [x] **Create environment config** - `battersea-env-config.js` for multi-host paths
- [x] **Set up SSH for GitHub** - Push without authentication prompts
- [x] **Deploy to Uundi** - Secondary testing environment
- [x] **Archive old uundi demo folder** - Moved to Archive/
- [x] **Add SmoothScroll to demo pages** - Index and Accordion pages now have section navigation dots
- [x] **Fix Header logo warning** - Dynamic logo detection via MutationObserver
- [x] **Add mobile menu to Header** - Full-screen overlay with drill-down sub-navigation panels (v2.3.0)
- [x] **Clean up Project Files** - Removed demos/ folder, backup LESS, unused CSS, outdated docs, .DS_Store files; gitignored compiled CSS; untracked local-only files
- [x] **VerticalNav Component** - Sidebar navigation with simple, collapsible, flyout, hover-to-expand, off-canvas panel (v2.5.0 - v2.5.2)
- [x] **ImageGallery** - Lightbox with thumbnails (v2.4.0)
- [x] **Accessibility Component** - Font size adjustment tool with dropdown slider in pre-header (v2.6.0)
- [x] **Create all demo pages** - All 18 component demo pages complete (Feb 2026):
  - [x] accessibility.html
  - [x] animation.html
  - [x] counter.html
  - [x] flipbox.html
  - [x] header.html
  - [x] horizontalnav.html
  - [x] multislider.html
  - [x] nestedprogress.html
  - [x] parallax.html
  - [x] popup.html
  - [x] progressbar.html
  - [x] slider.html
  - [x] smoothscroll.html
  - [x] tabs.html
  - [x] tooltip.html
- [x] **Updated demo-nav.html** - All 18 pages organised into 6 navigation categories (Feb 2026)
- [x] **Smooth anchor scrolling** - Pages with hash anchors (e.g. `tabs.html#demos`) now scroll smoothly instead of jumping. Also works when clicking in-page anchor links. Added to battersea-core.js (v2.7.0)
- [x] Video player - in page video with stylable controls (v2.9.0)
- [x] Audio player - In page audio player with stylable controls (v2.8.0)
- [x] Profile grid - Grid of staff photos with hover overlays, filterable tag pills, and detailed lightbox panels with photo, name, title, position, company, university, bio, phone, email, website, social links (v2.10.0)
- [x] DragDrop - Reorderable items, move things from one container to another and remember what choices were made so they can be displayed on another page (v2.11.0)
- [x] Timeline - Vertical/horizontal timeline with scroll-reveal, alternating layout, date badges, icon markers (v2.12.0)
- [x] DataTable - Sortable, filterable tables with pagination, column resizing, row selection, CSV export (v2.13.0)
- [x] NavData service - Auto-generated JSON navigation data from the primary menu DOM (v2.14.0)
- [x] FormValidation - Real-time form validation with password strength, custom rules and AJAX submission (v2.15.0)
- [x] Breadcrumbs - Auto-generated breadcrumb trail from the site navigation menu (v2.16.0)
- [x] PageNav - Prev/next page navigation with three modes: sequential, within category, between categories (v2.17.0)
- [x] MiniQuiz - Interactive quiz with boolean, single-choice, multi-select questions, timer, hide-until-click, JSON/CSV data loading (v2.18.0)
- [x] VideoBackground - Looping background video with mobile poster fallback and configurable overlay (v2.19.0)
- [x] Graph Phase 1 - SVG chart component with line, column, and pie charts, CSV/JSON data sources, animation, tooltips, legends (v2.20.0)

### 🔨 In Progress

### 📋 Next Up

- [ ] Graph Phase 2 - Additional graph types: multiline, multibar, multicolumn, radiating column, bar (horizontal), donut graph.
- [ ] Form element validation for file select element (allowed file types and maximum file size). 
- [ ] New advanced form elements - date picker, time picker, colour swatch, toggle, slide, 
- [ ] Transparent header - Setting that makes the the headers background transparent until it sticks to the top of the browser window when it's background fades in. Its transparency returns when the user scrolls black to the top of the site. When set to transparent the header floats above the first content of the site. This will effect the smooth scroll compoent because it usually offsets the content to allow for the header height.
- [ ] Back to top button - A button fades in as you scroll down the page clicking it scrolles smoothly to the top of the page.
- [ ] MiniQuiz v2 - Drag-and-drop ordering of HTML elements, drag-and-drop grouping of HTML elements, optional prevent navigation from page until the quiz has been attempted
- [ ] Pagination

---

## 📚 Documentation Tasks

- [x] Create a README.md
- [x] Add "Live Demo" link to README.md
- [x] Create LICENSE file (MIT recommended)
- [x] Add CONTRIBUTING.md for potential contributors
- [x] Create CHANGELOG.md for version history

---

## 🎨 Enhancement Ideas

### Homepage
- [ ] Add screenshots/GIFs of components in action
- [ ] Create animated hero section
- [ ] Add "Quick Start" section
- [ ] Add social media meta tags for link previews

### Demo Pages
- [ ] Add "Copy Code" buttons to code snippets
- [ ] Add live code editors (optional)
- [ ] Add component comparison table
- [ ] Create unified demo page with all components

### Components
- [ ] Review all components for consistency
- [ ] Ensure all follow same naming conventions
- [ ] Test all components on mobile
- [ ] Add accessibility audit

---

## 🐛 Known Issues

- [x] config.codekit3 keeps appearing in Git changes
- [ ] (Add any bugs you discover here)

---

## 🚀 Future Features (v2.3+)

### Planned Components


### Infrastructure
- [ ] Set up automated LESS compilation
- [ ] Add build process (optional)
- [ ] Create npm package
- [ ] Add unit tests
- [ ] Set up CI/CD pipeline

---

## 📝 Notes

### Working With This File
- Update this file as you complete tasks
- Move completed items to "Completed" section
- Add new tasks as they come up
- Use this in any chat by referencing: "Check TODO.md"

### Priority System
- 🔥 **High Priority** - Needed for current version
- 🎯 **Medium Priority** - Improve user experience
- 💡 **Low Priority** - Nice to have

---

## 🎓 Learning Goals

- [x] Master Git workflow (branches, pull requests)
- [ ] Learn more about accessibility best practices
- [ ] Explore advanced CSS animations
- [ ] Study component design patterns

---

**Quick Links:**
- Repository: https://github.com/idahodesign/battersea-library
- Live Demo (GitHub Pages): https://idahodesign.github.io/battersea-library/demo/
- Live Demo (Uundi/Testing): https://uundi.david-haworth.com/demo/
- Issues: (Create GitHub Issues when needed)
