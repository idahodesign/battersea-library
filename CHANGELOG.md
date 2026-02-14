# Changelog

All notable changes to Battersea Library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.9.0] - 2026-02-14

### Added
- **Video Player Component** (v1.0.0) — Fully custom video player with stylable controls
  - Play/pause button in controls bar and large centred overlay on video
  - Seek/progress bar with click-to-jump and drag-to-scrub
  - Volume slider with mute toggle and three volume state icons
  - Current time and duration display
  - Optional poster image via `data-video-poster`
  - Optional title overlay via `data-video-title`
  - Auto-hiding controls bar (fades out after 3s, configurable via `data-video-controls`)
  - Fullscreen support with Fullscreen API and vendor prefixes
  - Per-instance accent colour via `data-video-color`
  - Supports MP4, WebM, OGG formats
  - Full keyboard navigation (Space/Enter play, arrows seek/volume, F fullscreen, M mute, Escape exit)
  - Touch support (tap overlay to play/pause, controls appear on tap)
  - ARIA roles and labels on all interactive controls
  - Responsive layout (volume slider hidden below 480px)
  - Custom events: `battersea:videoPlay`, `battersea:videoPause`, `battersea:videoSeek`, `battersea:videoVolumeChange`, `battersea:videoMute`, `battersea:videoEnded`, `battersea:videoFullscreen`
- **Video Player demo page** — `demo/components/videoplayer.html` with three live examples
- **Navigation updated** — Video Player added to Content category in demo nav
- **Component count** — 19 → 20 on homepage and stats

---

## [2.8.0] - 2026-02-14

### Added
- **Audio Player Component** (v1.0.0) — Fully custom audio player with stylable controls
  - Play/pause button with CSS-only icons (no icon fonts or SVG files)
  - Seek/progress bar with click-to-jump and drag-to-scrub
  - Volume slider with mute toggle and three volume state icons
  - Current time and duration display
  - Track title and artist info (optional)
  - Per-instance accent colour via `data-audio-color`
  - Supports MP3, WAV, OGG, AAC formats
  - Full keyboard navigation (arrow keys for seek and volume)
  - ARIA roles and labels on all interactive controls
  - Responsive layout (volume slider hidden on very small screens)
  - Handles mobile autoplay restrictions gracefully
  - Custom events: `battersea:audioPlay`, `battersea:audioPause`, `battersea:audioSeek`, `battersea:audioVolumeChange`, `battersea:audioMute`, `battersea:audioEnded`
- **Audio Player demo page** — `demo/components/audioplayer.html` with three live examples
- **Navigation updated** — Audio Player added to Content category in demo nav

---

## [2.7.0] - 2026-02-11

### Added
- **Smooth anchor scrolling** — Built into `battersea-core.js` so it works on every page automatically
  - Pages loaded with a hash anchor (e.g. `tabs.html#demos`) now scroll smoothly to the target instead of jumping
  - Clicking in-page anchor links (`<a href="#section">`) also scrolls smoothly
  - 500ms ease-out cubic animation for a quick, natural feel
  - Automatically accounts for sticky header height
  - Updates the URL hash via `history.pushState` without triggering a jump
  - Only intercepts same-page links — cross-page anchors are left alone

---

## [2.6.1] - 2026-02-10

### Added
- **All remaining demo pages** — 14 new component demo pages, completing the full set of 18
  - counter, flipbox, header, horizontalnav, multislider, nestedprogress, parallax, popup, progressbar, slider, smoothscroll, tooltip (new)
  - animation, tabs (created earlier in the session)
  - Each page follows the standard template: hero, live demos, features, configuration, usage examples, browser support
- **Updated demo navigation** — `demo-nav.html` reorganised into 6 categories:
  - Navigation (Header, Horizontal Navigation, Vertical Navigation)
  - Content (Image Gallery, Parallax, Slider, MultiSlider)
  - Interactive (Accordion, Counter, Flipbox, Popup, Tabs, Tooltip)
  - Data Display (Progress Bar, Nested Progress)
  - Utilities (Accessibility, Animation, SmoothScroll)

### Fixed
- **Slider/MultiSlider arrow duplication** — CSS `::before` pseudo-elements in `battersea-slider.less` and `battersea-slider-multi-item.less` had corrupted UTF-8 chevron characters (`Ã¢â‚¬Â¹`); replaced with encoding-safe CSS unicode escapes (`\2039` / `\203A`)
- **Circular progress bars not rendering** — `createCircular()` in `battersea-progressbar.js` was using `parentElement.offsetWidth` which returned 0 before layout, causing negative SVG radius values; now uses the specified `data-progress-size` directly with explicit pixel dimensions on the SVG
- **Progress bar animation quality** — Replaced `setInterval` with `requestAnimationFrame` for smooth frame-synced animation; removed conflicting CSS `transition: width 0.3s ease` from `.battersea-progress-fill`; horizontal bars use ease-out cubic, circular bars use ease-in-out cubic with longer duration (1800ms) for a satisfying sweep effect

---

## [2.6.0] - 2026-02-09

### Added
- **Accessibility Component** (v1.1.0) - Font size adjustment tool
  - Small "Aa" trigger button in the pre-header bar (replaces old scroll link)
  - Slim panel slides down from pre-header with frosted glass effect
  - Range slider with small "a" and large "A" labels (80%–200%, step 10%)
  - Sets `font-size` on `<html>` element to scale all `rem`-based sizes
  - Click outside to close and auto-save; Escape key support
  - Persists user preference via localStorage
  - Configurable via data attributes: `data-accessibility-min`, `data-accessibility-max`, `data-accessibility-step`
  - Custom event: `battersea:fontSizeChange`
  - New files: `battersea-accessibility.js`, `battersea-accessibility.less`
- **Accessibility demo page** (`demo/components/accessibility.html`)
  - Live demo, key features, configuration options, how it works FAQ, browser support
  - Added to navigation under Utilities dropdown
- **Homepage component card** for Accessibility added to component grid (17 total)

### Fixed
- **Include system race condition** — Nav include now loads after header include (was parallel, causing nav placeholder to not exist yet)
- **Missing `return` in `loadInclude()`** — `Promise.all` was resolving immediately without waiting for fetches; added `return fetch()` in all demo pages
- **Removed redundant nav loader** from `demo-header-component.html` — had hardcoded GitHub Pages path that 404ed on localhost; pages handle their own nav loading

---

## [2.5.2] - 2026-02-09

### Added
- **VerticalNav Hover-to-Expand** - Collapsible mode now supports two patterns
  - Use `<a>` links as parent items: group expands on hover, link stays clickable for navigation
  - Use `<button class="battersea-vnav__group-toggle">`: click-to-expand (original behaviour)
  - Both patterns work side-by-side in the same nav
  - Chevron indicator auto-added to links with child groups (`.battersea-vnav__link--has-group`)
  - Hover delay uses existing `data-vertical-nav-flyout-hover-delay` setting
- **VerticalNav Off-Canvas Panel** - Slide-in navigation from left or right
  - Configurable via `data-vertical-nav-offcanvas="true"` and `data-vertical-nav-offcanvas-direction="left|right"`
  - Works at all screen sizes (not just mobile)
  - Semi-transparent backdrop with click-to-close
  - External toggle routes to off-canvas when enabled (hamburger always visible)
  - Body scroll lock when panel is open
  - ESC key closes the panel
  - Custom events: `battersea:vnavOffCanvasOpen`, `battersea:vnavOffCanvasClose`
  - CSS variables: `--battersea-vnav-offcanvas-shadow`, `--battersea-vnav-offcanvas-backdrop`
- **Demo page updated** with hover-to-expand, click-to-expand, and off-canvas sections

### Changed
- Flyout-to-collapsible mobile fallback now uses hover-expand (keeps links clickable) instead of creating button toggles

### Fixed
- Off-canvas panel now covers full viewport height (moved nav to `<body>` to escape parent `transform` stacking contexts from scroll animations)
- Off-canvas nav no longer peeks out from screen edges when closed
- External toggle (hamburger/X) now stays visible above the off-canvas panel when open (moved to `<body>` with `position: fixed` and `z-index: 1001`)

---

## [2.5.1] - 2026-02-08

### Added
- **VerticalNav Mobile Overlay** - Full-screen mobile menu with drill-down panels
  - Matches the Header component's mobile menu pattern
  - Panel-based navigation with slide transitions
  - Back button to drill up through levels
  - Body scroll lock when overlay is open
  - Focus trap for accessibility (Tab cycles within overlay)
  - Lazy panel building (first open)
  - Custom events: `battersea:vnavMobileOpen`, `battersea:vnavMobileClose`
- **External Toggle Support** - Place a hamburger button anywhere on the page
  - Link any button to a nav using `data-vertical-nav-toggle-target` and `data-vertical-nav-id`
  - Hamburger-to-X animation (matching Header component)
  - ARIA attributes managed automatically
  - `.battersea-vnav__external-toggle` class with 3-span hamburger structure
- **Mobile overlay CSS variables** for theming (`--battersea-vnav-mobile-bg`, `--battersea-vnav-mobile-text`, etc.)
- **Desktop nav hidden on mobile** when mobile overlay is enabled (`.battersea-vnav--mobile` class)
- **Demo page updated** with Mobile Overlay & External Toggle section

---

## [2.5.0] - 2026-02-08

### Added
- **VerticalNav Component** - Sidebar navigation with three configurable modes
  - Simple list mode for clean documentation-style sidebars
  - Collapsible groups mode with smooth accordion-style expand/collapse
  - Multi-level flyout mode with hover-activated sub-menus and edge detection
  - Optional sidebar toggle (collapse/expand to narrow strip)
  - Active page detection with active-trail highlighting
  - Auto-opens parent groups containing the active page link
  - Single or multiple groups open simultaneously (configurable)
  - Keyboard navigation (arrow keys, Enter/Space, Escape)
  - Responsive: flyout mode falls back to collapsible on mobile
  - CSS custom properties for full theming control
  - Custom events: `battersea:vnavInit`, `battersea:vnavGroupOpen`, `battersea:vnavGroupClose`, `battersea:vnavFlyoutOpen`, `battersea:vnavFlyoutClose`, `battersea:vnavToggle`
- **VerticalNav demo page** at `demo/components/verticalnav.html`
- **Navigation update** - Added Vertical Navigation link under Navigation menu
- **Project cleanup** - Removed redundant files, gitignored compiled CSS

---

## [2.4.0] - 2026-02-08

### Added
- **ImageGallery Component** - Lightbox gallery with masonry layout, zoom, and video support
  - CSS `column-count` masonry grid with configurable columns and gap
  - Fullscreen lightbox overlay with prev/next navigation
  - Click-to-zoom with drag-to-pan for detailed image viewing
  - HTML5 video support with native player controls in lightbox
  - Optional titles and captions per gallery item
  - Keyboard navigation (arrows, Escape, +/- zoom, 0 reset)
  - Touch swipe support for mobile navigation
  - Responsive grid (4 cols desktop, 3 tablet, 2 mobile, 1 small)
  - ARIA labels, focus management, and screen reader support
  - CSS custom properties for full theming control
  - Custom events: `battersea:galleryOpen`, `battersea:galleryClose`, `battersea:galleryChange`
- **ImageGallery demo page** at `demo/components/imagegallery.html`
- **Navigation update** - Added Image Gallery link under Content menu

---

## [2.2.2] - 2026-02-05

### Added
- **SmoothScroll integration** - Added SmoothScroll navigation to demo site pages
  - Index page now has section navigation dots (Home, Features, Components, Getting Started, Testimonials, Browser Support, FAQ, Stats)
  - Accordion demo page has section navigation dots (Introduction, Live Demos, Features, Configuration, Usage Examples, Accessibility, Browser Support)
- **Dynamic logo detection** - Header component now detects logo elements loaded via async includes

### Changed
- **Header component** (v2.2.1) - Added `setupLogoObserver()` method that uses MutationObserver to detect when logo is loaded dynamically via the include system, eliminating the console warning about missing logo elements

### Fixed
- Resolved "[Header] Logo element not found" console warning that occurred when header content was loaded asynchronously via includes

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

- **2.7.0** - Smooth anchor scrolling in battersea-core.js
- **2.6.1** - All 18 demo pages, updated nav, slider/progress bar fixes
- **2.6.0** - Accessibility component with font size slider
- **2.5.2** - VerticalNav hover-to-expand, off-canvas panel, stacking context fixes
- **2.5.1** - VerticalNav mobile overlay and external toggle support
- **2.5.0** - VerticalNav component with simple, collapsible, and flyout modes
- **2.4.0** - ImageGallery component with lightbox, masonry layout, zoom, and video support
- **2.2.2** - SmoothScroll integration on demo pages, Header dynamic logo detection
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
