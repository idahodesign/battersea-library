# Changelog

All notable changes to Battersea Library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.1] - 2026-02-05

### Added
- **Environment Configuration** - `battersea-env-config.js` for multi-host deployment
- **SSH Authentication** - Configured for GitHub pushes without password prompts
- **Uundi Deployment** - Secondary testing environment at uundi.david-haworth.com

### Changed
- **Demo folder restructure** - Renamed `demos/` to `demo/` as primary folder
- **Redirect system** - `demos/` now contains redirects for backwards compatibility
- **Navigation paths** - Updated to use root-based paths with environment detection
- **Documentation** - Updated CLAUDE.md, TODO.md, and PROJECT-INSTRUCTIONS.md

### Infrastructure
- Multi-host support: Same codebase works on GitHub Pages and Uundi
- FTP deployment workflow documented for Fetch app

---

## [2.2.0] - 2026-01-28

### Added
- **Header Component** - Adaptive navigation with shrink-on-scroll functionality
- **Horizontal Navigation Component** - Multi-level dropdown menus (up to 4 levels)
- Pre-header bar support with device-specific visibility
- Mobile logo swapping functionality
- Two header layout modes (right-align, centre-stack)
- Integration events between Header and SmoothScroll components

### Changed
- Reorganised project structure (src/, demos/, includes/, docs/)
- Updated documentation with Header component details
- Moved to professional repository structure

### Documentation
- Added HEADER-DOCUMENTATION.md
- Created comprehensive demo pages
- Added navigation menu include system

---

## [2.1.0] - 2026-01-28

### Added
- **SmoothScroll Component** - Scroll-to-section navigation with visual dots
- Dynamic header detection (auto-adjusts to headers that change size)
- Real-time target recalculation during scroll animation
- Section detection using IntersectionObserver
- Cubic ease-out easing for smooth, natural deceleration
- Full keyboard accessibility (Tab, Enter, Arrow keys)
- Responsive with auto-hide on mobile
- Custom tooltip styling support

### Changed
- **Tooltip Component** updated to v2.0.1
- Added `data-tooltip-class` attribute for custom styling

### Documentation
- Added RELEASE-v2.1.0.md
- Added UPGRADE-v2.1.0.md
- Updated README.md with SmoothScroll documentation

---

## [2.0.0] - 2026-01-15

### Added
Initial release of Battersea Library with 12 components:

#### Components
- **Tooltip** - Hover/focus tooltips with 4 positions
- **Slider** - Image/content carousel with true infinite loop
- **Tabs** - Tabbed content interface
- **Accordion** - Collapsible content sections
- **Popup/Modal** - Overlay dialogs
- **Animation** - Scroll-triggered animations with parent-child cascading
- **Counter** - Animated number counting on scroll
- **ProgressBar** - Horizontal and circular progress indicators
- **NestedProgress** - Multi-layer circular progress visualisation
- **MultiSlider** - Multi-item carousel with infinite loop
- **Parallax** - Parallax scrolling backgrounds
- **Flipbox** - 3D flip card animations

#### Core Features
- Auto-initialisation system
- Component registration and lifecycle management
- MutationObserver for dynamic content
- Comprehensive utility library
- Event cleanup and memory management
- Custom event dispatching with `battersea:` prefix

#### Styling
- LESS/CSS modular system
- CSS custom properties for theming
- Responsive design (mobile < 768px, tablet 768-1023px, desktop ≥ 1024px)
- Smooth transitions and animations

#### Accessibility
- ARIA labels throughout
- Keyboard navigation support
- Semantic HTML
- Focus management
- Screen reader friendly

#### Documentation
- Comprehensive README.md
- Component usage examples
- API documentation
- Browser compatibility guide

---

## Version History Summary

- **2.2.1** - Multi-host deployment, demo folder consolidation
- **2.2.0** - Header & Horizontal Navigation components
- **2.1.0** - SmoothScroll component with dynamic header detection
- **2.0.0** - Initial release with 12 core components

---

## Upgrade Guides

For detailed upgrade instructions, see:
- [Upgrade to v2.1.0](docs/UPGRADE-v2_1_0.md)
- [Upgrade to v2.2.0](docs/UPGRADE-v2_2_0.md) *(coming soon)*

---

## Links

- [GitHub Repository](https://github.com/idahodesign/battersea-library)
- [Live Demo (GitHub Pages)](https://idahodesign.github.io/battersea-library/demo/)
- [Live Demo (Uundi)](https://uundi.david-haworth.com/demo/)
- [Documentation](https://github.com/idahodesign/battersea-library/tree/main/docs)
