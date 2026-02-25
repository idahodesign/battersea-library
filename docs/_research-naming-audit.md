# Battersea Library - Naming Consistency Audit

_Generated: 22 February 2026_

---

## 1. Master Table: All 37 JavaScript Files

### Core Files (4 files, no registration)

| Filename | Class/Object | Global Name | Notes |
|----------|-------------|-------------|-------|
| `battersea-core.js` | (object) | `window.Battersea` | Registration system |
| `battersea-utils.js` | (object) | `window.BatterseaUtils` | Shared utilities |
| `battersea-env-config.js` | (object) | `window.BatterseaConfig` | Environment detection |
| `battersea-nav-data.js` | `NavData` | `window.Battersea.navData` | Self-initialising service, no register() call |

### Component Files (33 files)

| # | Filename | Class Name | Registered Name | Selector | CSS Prefix | Events Prefix |
|---|----------|-----------|----------------|----------|------------|---------------|
| 1 | `battersea-accordion.js` | `Accordion` | `'accordion'` | `[data-accordion]` | `battersea-accordion` | `battersea:accordionToggle` |
| 2 | `battersea-accessibility.js` | `Accessibility` | `'accessibility'` | `[data-accessibility]` | `battersea-a11y-*` | `battersea:a11yOpen`, `battersea:a11yClose`, `battersea:fontSizeChange` |
| 3 | `battersea-animation.js` | `Animation` | `'animation'` | `[data-animate]` | `battersea-animated`, `battersea-ticker-*` | (none) |
| 4 | `battersea-audioplayer.js` | `AudioPlayer` | `'audioPlayer'` | `[data-audio]` | `battersea-audio*` | `battersea:audio*` |
| 5 | `battersea-backtotop.js` | `BackToTop` | `'backtotop'` | `[data-backtotop]` | `battersea-backtotop*` | (none) |
| 6 | `battersea-breadcrumbs.js` | `Breadcrumbs` | `'breadcrumbs'` | `[data-breadcrumb]` | `battersea-breadcrumb*` | (none, listens for `battersea:navdata-ready`) |
| 7 | `battersea-counter.js` | `Counter` | `'counter'` | `[data-counter]` | (none in JS) | (none) |
| 8 | `battersea-datatable.js` | `DataTable` | `'dataTable'` | `[data-table]` | `battersea-datatable*` | `battersea:table*`, `battersea:rowSelect` |
| 9 | `battersea-dragdrop.js` | `DragDrop` | `'dragDrop'` | `[data-drag-drop]` | `battersea-dragdrop*` | `battersea:drag*` |
| 10 | `battersea-flipbox.js` | `Flipbox` | `'flipbox'` | `[data-flipbox]` | `battersea-flipbox-*` | `battersea:flipboxFlip` |
| 11 | `battersea-form-elements.js` | `FormElements` | `'formElements'` | `[data-form-elements]` | `battersea-fe--*`, `battersea-toggle*`, `battersea-slider-input*`, `battersea-datepicker*`, `battersea-timepicker*`, `battersea-colourswatch*` | `battersea:formElementChange` |
| 12 | `battersea-form-validation.js` | `FormValidation` | `'formValidation'` | `[data-form-validation]` | `battersea-form-*` | `battersea:field*`, `battersea:form*` |
| 13 | `battersea-graph.js` | `Graph` | `'graph'` | `[data-graph]` | `battersea-graph*` | `battersea:graphReady`, `battersea:graphRender` |
| 14 | `battersea-header.js` | `Header` | `'header'` | `[data-header]` | `battersea-header*` | `battersea:header*`, `battersea:mobileMenu*` |
| 15 | `battersea-horizontalnav.js` | `HorizontalNav` | `'horizontalnav'` | `[data-horizontal-nav]` | `battersea-hnav*` | `battersea:hnav*` |
| 16 | `battersea-imagegallery.js` | `ImageGallery` | `'imagegallery'` | `[data-image-gallery]` | `battersea-gallery-*` | `battersea:gallery*` |
| 17 | `battersea-mini-quiz.js` | `MiniQuiz` | `'miniQuiz'` | `[data-quiz]` | `battersea-quiz*` | `battersea:quiz*` |
| 18 | `battersea-multislider.js` | `MultiSlider` | `'multislider'` | `[data-multislider]` | `battersea-multislider-*` | `battersea:multisliderChange` |
| 19 | `battersea-nestedprogress.js` | `NestedProgress` | `'nestedprogress'` | `[data-progress-nested]` | `battersea-progress-*` | (none) |
| 20 | `battersea-pagenav.js` | `PageNav` | `'pageNav'` | `[data-pagenav]` | `battersea-pagenav*` | (none, listens for `battersea:navdata-ready`) |
| 21 | `battersea-pagination.js` | `Pagination` | `'pagination'` | `[data-pagination]` | `battersea-pagination*` | `battersea:pagination:change` |
| 22 | `battersea-parallax.js` | `Parallax` | `'parallax'` | `[data-parallax]` | (none in JS) | (none) |
| 23 | `battersea-popup.js` | `Popup` | `'popup'` | `[data-popup]` | `battersea-popup-*` | `battersea:popupOpen`, `battersea:popupClose` |
| 24 | `battersea-profilegrid.js` | `ProfileGrid` | `'profileGrid'` | `[data-profile-grid]` | `battersea-profile-*` | `battersea:profileOpen`, `battersea:profileClose` |
| 25 | `battersea-progressbar.js` | `ProgressBar` | `'progressbar'` | `[data-progress]` | `battersea-progress*` | (none) |
| 26 | `battersea-slider.js` | `Slider` | `'slider'` | `[data-slider]` | `battersea-slider-*` | `battersea:slideChange` |
| 27 | `battersea-smoothscroll.js` | `SmoothScroll` | `'smoothscroll'` | `[data-smoothscroll]` | `battersea-scroll-*` | `battersea:scrollSectionChange` |
| 28 | `battersea-tabs.js` | `Tabs` | `'tabs'` | `[data-tabs]` | (none in JS) | `battersea:tabChange` |
| 29 | `battersea-timeline.js` | `Timeline` | `'timeline'` | `[data-timeline]` | `battersea-timeline*` | `battersea:timeline*` |
| 30 | `battersea-tooltip.js` | `Tooltip` | `'tooltip'` | `[data-tooltip]` | `battersea-tooltip-*` | (none) |
| 31 | `battersea-verticalnav.js` | `VerticalNav` | `'verticalnav'` | `[data-vertical-nav]` | `battersea-vnav*` | `battersea:vnav*` |
| 32 | `battersea-videobg.js` | `VideoBg` | `'videoBg'` | `[data-videobg]` | `battersea-videobg*` | `battersea:videobgInit` |
| 33 | `battersea-videoplayer.js` | `VideoPlayer` | `'videoPlayer'` | `[data-video]` | `battersea-video*` | `battersea:video*` |

---

## 2. Inconsistencies Found

### 2.1 Registration Name Casing

The registered name (first arg to `window.Battersea.register()`) uses two different conventions:

**camelCase (12 components):**
| Registered Name | Component |
|----------------|-----------|
| `'audioPlayer'` | AudioPlayer |
| `'dataTable'` | DataTable |
| `'dragDrop'` | DragDrop |
| `'formElements'` | FormElements |
| `'formValidation'` | FormValidation |
| `'miniQuiz'` | MiniQuiz |
| `'pageNav'` | PageNav |
| `'profileGrid'` | ProfileGrid |
| `'videoBg'` | VideoBg |
| `'videoPlayer'` | VideoPlayer |
| (none -- self-init) | NavData |

**lowercase (21 components):**
| Registered Name | Component |
|----------------|-----------|
| `'accordion'` | Accordion |
| `'accessibility'` | Accessibility |
| `'animation'` | Animation |
| `'backtotop'` | BackToTop |
| `'breadcrumbs'` | Breadcrumbs |
| `'counter'` | Counter |
| `'flipbox'` | Flipbox |
| `'graph'` | Graph |
| `'header'` | Header |
| `'horizontalnav'` | HorizontalNav |
| `'imagegallery'` | ImageGallery |
| `'multislider'` | MultiSlider |
| `'nestedprogress'` | NestedProgress |
| `'pagination'` | Pagination |
| `'parallax'` | Parallax |
| `'popup'` | Popup |
| `'progressbar'` | ProgressBar |
| `'slider'` | Slider |
| `'smoothscroll'` | SmoothScroll |
| `'tabs'` | Tabs |
| `'timeline'` | Timeline |
| `'tooltip'` | Tooltip |
| `'verticalnav'` | VerticalNav |

**Pattern:** Single-word class names always use lowercase. Multi-word class names are inconsistent -- some use camelCase (`'audioPlayer'`), others flatten to lowercase (`'horizontalnav'`, `'imagegallery'`, `'multislider'`, `'nestedprogress'`, `'progressbar'`, `'smoothscroll'`, `'backtotop'`).

---

### 2.2 Selector vs Filename Mismatches

The data attribute selector (third arg to `register()`) does not always match the filename pattern:

| Filename | Expected Selector | Actual Selector | Issue |
|----------|------------------|-----------------|-------|
| `battersea-animation.js` | `[data-animation]` | `[data-animate]` | Shortened/verb form |
| `battersea-audioplayer.js` | `[data-audioplayer]` or `[data-audio-player]` | `[data-audio]` | Shortened |
| `battersea-breadcrumbs.js` | `[data-breadcrumbs]` | `[data-breadcrumb]` | Singular vs plural |
| `battersea-datatable.js` | `[data-datatable]` or `[data-data-table]` | `[data-table]` | Shortened |
| `battersea-mini-quiz.js` | `[data-mini-quiz]` | `[data-quiz]` | Shortened |
| `battersea-nestedprogress.js` | `[data-nested-progress]` | `[data-progress-nested]` | Word order swapped |
| `battersea-progressbar.js` | `[data-progressbar]` or `[data-progress-bar]` | `[data-progress]` | Shortened |
| `battersea-videoplayer.js` | `[data-videoplayer]` or `[data-video-player]` | `[data-video]` | Shortened |

**Components with consistent filename-to-selector mapping (25):**
accordion, accessibility, backtotop, counter, drag-drop, flipbox, form-elements, form-validation, graph, header, horizontal-nav, image-gallery, multislider, pagination, parallax, popup, profile-grid, slider, smoothscroll, tabs, timeline, tooltip, vertical-nav, videobg, pagenav (close enough).

---

### 2.3 Data Attribute Prefix Inconsistencies

Each component's configuration attributes should use a consistent prefix matching the selector. Several components break this pattern:

| Component | Selector Attribute | Config Attribute Prefix | Issue |
|-----------|--------------------|------------------------|-------|
| Animation | `data-animate` | `data-animate-*`, `data-ticker-*` | Mixed prefixes |
| Header | `data-header` | `data-sticky`, `data-shrink`, `data-layout`, `data-transparent`, `data-logo-mobile`, `data-mobile-menu`, `data-mobile-breakpoint`, `data-header-height`, `data-transition-speed`, etc. | Most config attrs lack `header-` prefix |
| Header (pre-header) | (child element) | `data-pre-mobile`, `data-pre-tablet`, `data-pre-desktop`, `data-pre-height` | Uses `pre-` prefix |
| HorizontalNav | `data-horizontal-nav` | `data-nav-hover-delay`, `data-nav-edge-threshold`, `data-nav-mobile-breakpoint`, `data-nav-mobile-mode` | Uses `nav-` prefix not `horizontal-nav-` |
| Tabs | `data-tabs` | `data-tab` (on individual tabs) | Singular on children |
| DragDrop | `data-drag-drop` | `data-drag-drop-mode`, `data-drag-drop-key`, `data-drag-id`, `data-drag-container`, `data-drag-container-label`, `data-drag-drop-max` | Mixed: some use `drag-drop-*`, some use `drag-*` |
| ImageGallery | `data-image-gallery` | `data-image-gallery-columns`, `data-image-gallery-gap`, `data-gallery-type`, `data-gallery-title`, `data-gallery-src`, etc. | Container uses `image-gallery-*`, items use `gallery-*` |
| ProfileGrid | `data-profile-grid` | `data-profile-grid-columns`, `data-profile-grid-filter`, `data-profile-name`, `data-profile-title`, etc. | Container uses `profile-grid-*`, items use `profile-*` |
| Popup | `data-popup` | `data-popup-close-overlay` | Consistent |
| FormValidation | `data-form-validation` | `data-form-ajax`, `data-form-action`, `data-form-method`, `data-form-success-message`, `data-validate`, `data-validate-message` | Container uses `form-*`, fields use `validate-*` |

**Components with consistent attribute prefixing:**
Accordion (`data-accordion-*`), Accessibility (`data-accessibility-*`), AudioPlayer (`data-audio-*`), BackToTop (`data-backtotop-*`), Counter (`data-counter-*`), DataTable (`data-table-*`), Flipbox (`data-flipbox-*`), Graph (`data-graph-*`), MultiSlider (`data-multislider-*`), Pagination (`data-pagination-*`), Parallax (`data-parallax-*`), ProgressBar (`data-progress-*`), Slider (`data-slider-*`), SmoothScroll (`data-smoothscroll-*`), Timeline (`data-timeline-*`), Tooltip (`data-tooltip-*`), VerticalNav (`data-vertical-nav-*`), VideoBg (`data-videobg-*`), VideoPlayer (`data-video-*`), MiniQuiz (`data-quiz-*`), NestedProgress (`data-progress-*`).

---

### 2.4 CSS Class Prefix Inconsistencies

Most components use `battersea-[component]` as their CSS class prefix, but several abbreviate or deviate:

| Component | Expected CSS Prefix | Actual CSS Prefix | Issue |
|-----------|-------------------|-------------------|-------|
| Accessibility | `battersea-accessibility-*` | `battersea-a11y-*` | Abbreviated |
| FormElements | `battersea-form-elements-*` | `battersea-fe--*` (wrapper), `battersea-toggle*`, `battersea-slider-input*`, `battersea-datepicker*`, `battersea-timepicker*`, `battersea-colourswatch*` | Multiple prefixes, `fe` is heavily abbreviated |
| HorizontalNav | `battersea-horizontalnav-*` or `battersea-horizontal-nav-*` | `battersea-hnav*` | Abbreviated |
| ImageGallery | `battersea-imagegallery-*` | `battersea-gallery-*` | Shortened |
| SmoothScroll | `battersea-smoothscroll-*` | `battersea-scroll-*` | Shortened |
| VerticalNav | `battersea-verticalnav-*` | `battersea-vnav*` | Abbreviated |
| NestedProgress | `battersea-nestedprogress-*` | `battersea-progress-*` | Shares prefix with ProgressBar |
| Animation | `battersea-animation-*` | `battersea-animated`, `battersea-ticker-char*`, `battersea-fade-up` etc. | No single consistent prefix |

**Potential prefix collision:**
- ProgressBar and NestedProgress both use `battersea-progress*` CSS classes
- Slider (carousel) uses `battersea-slider-*` and FormElements range slider uses `battersea-slider-input*`

---

### 2.5 Event Naming Inconsistencies

All custom events use the `battersea:` prefix, which is consistent. However, the naming style after the prefix varies:

**Style 1 -- camelCase after prefix (majority):**
`battersea:accordionToggle`, `battersea:slideChange`, `battersea:tabChange`, `battersea:popupOpen`, `battersea:flipboxFlip`, `battersea:multisliderChange`, `battersea:scrollSectionChange`, etc.

**Style 2 -- double-colon namespace (1 component):**
`battersea:pagination:change` -- this is the only component using a second colon as a namespace separator.

**Style 3 -- abbreviated component name in events:**
| Component | Event Examples | Abbreviation |
|-----------|---------------|--------------|
| Accessibility | `battersea:a11yOpen` | `a11y` instead of `accessibility` |
| HorizontalNav | `battersea:hnavInit` | `hnav` instead of `horizontalnav` |
| VerticalNav | `battersea:vnavInit` | `vnav` instead of `verticalnav` |
| Header | `battersea:mobileMenuOpen` | Not prefixed with `header` |
| DataTable | `battersea:tableFilter`, `battersea:rowSelect` | `table` instead of `dataTable`, `rowSelect` lacks component prefix |
| FormValidation | `battersea:fieldInvalid`, `battersea:formValid` | `field*`/`form*` rather than `formValidation*` |

**Components with no custom events (7):**
Animation, BackToTop, Counter, NestedProgress, Parallax, ProgressBar, Tooltip.

---

### 2.6 Filename Hyphenation

Most filenames use a single word after `battersea-`, but four use additional hyphens:

| Filename | Hyphen Count | Registered Name |
|----------|-------------|-----------------|
| `battersea-form-elements.js` | 2 hyphens | `'formElements'` |
| `battersea-form-validation.js` | 2 hyphens | `'formValidation'` |
| `battersea-mini-quiz.js` | 2 hyphens | `'miniQuiz'` |
| `battersea-nav-data.js` | 2 hyphens | (no registration) |

All other component filenames use the pattern `battersea-[singleword].js`, e.g. `battersea-audioplayer.js`, `battersea-datatable.js`, `battersea-horizontalnav.js`.

---

### 2.7 Constructor/Init Pattern

All 33 registered components follow the same pattern:
1. IIFE wrapper: `(function(window, document) { ... })(window, document);`
2. Dependency check: `if (!window.Battersea || !window.BatterseaUtils) { ... }`
3. `const Utils = window.BatterseaUtils;` (or `var Utils`)
4. ES6 `class` with `constructor(el)` calling `this.init()`
5. Registration: `window.Battersea.register('name', ClassName, '[data-selector]');`

**var vs const for Utils reference:**
- Most components use `const Utils = window.BatterseaUtils;`
- Some older-style components use `var Utils = window.BatterseaUtils;` (pagination, datatable, form-validation, form-elements)

**NavData** is the only exception -- it self-initialises and attaches to `window.Battersea.navData` rather than using `register()`.

---

## 3. Summary of Issues

| Category | Count | Severity |
|----------|-------|----------|
| Registration name casing inconsistency | 12 camelCase vs 21 lowercase | Medium -- affects programmatic access |
| Selector not matching filename | 8 components | Low -- working, just inconsistent |
| Data attribute prefix inconsistency | 6 components | Medium -- confusing for developers |
| CSS class abbreviations | 6 components | Low -- cosmetic |
| CSS prefix collisions | 2 pairs | Medium -- could cause style conflicts |
| Event naming style variations | 6 components + 1 double-colon | Low -- all use `battersea:` prefix |
| Filename hyphenation inconsistency | 4 files with extra hyphens | Low -- cosmetic |
| `var` vs `const` for Utils | 4 components use `var` | Low -- functional difference is negligible |

---

## 4. Data Attributes by Component (Full Reference)

### Accordion
- `data-accordion` (selector)
- `data-accordion-multiple`

### Accessibility
- `data-accessibility` (selector)
- `data-accessibility-min`
- `data-accessibility-max`
- `data-accessibility-step`

### Animation
- `data-animate` (selector, also value: fade-in, fade-up, fade-down, fade-left, fade-right, ticker)
- `data-animate-children`
- `data-ticker-speed`

### AudioPlayer
- `data-audio` (selector)
- `data-audio-src`, `data-audio-title`, `data-audio-artist`
- `data-audio-autoplay`, `data-audio-loop`, `data-audio-muted`
- `data-audio-volume`, `data-audio-preload`, `data-audio-color`, `data-audio-progress`

### BackToTop
- `data-backtotop` (selector)
- `data-backtotop-threshold`, `data-backtotop-duration`, `data-backtotop-offset`

### Breadcrumbs
- `data-breadcrumb` (selector)

### Counter
- `data-counter` (selector)
- `data-counter-start`, `data-counter-end`, `data-counter-duration`
- `data-counter-prefix`, `data-counter-suffix`, `data-counter-decimals`, `data-counter-separator`

### DataTable
- `data-table` (selector)
- `data-table-sortable`, `data-table-filterable`, `data-table-page-size`
- `data-table-selectable`, `data-table-resizable`, `data-table-exportable`, `data-table-striped`
- `data-table-csv`, `data-table-data`, `data-table-columns`
- `data-column-key`, `data-column-type`, `data-column-sortable` (on `<th>` elements)

### DragDrop
- `data-drag-drop` (selector)
- `data-drag-drop-mode`, `data-drag-drop-key`, `data-drag-drop-max`
- `data-drag-id`, `data-drag-container`, `data-drag-container-label` (on child elements)

### Flipbox
- `data-flipbox` (selector)
- `data-flipbox-direction`, `data-flipbox-trigger`

### FormElements
- `data-form-elements` (selector)
- Toggle: `data-toggle-on`, `data-toggle-off`
- Slider: `data-slider-min`, `data-slider-max`, `data-slider-step`, `data-slider-value`, `data-slider-label`
- Datepicker: `data-datepicker-native`, `data-datepicker-format`, `data-datepicker-min`, `data-datepicker-max`
- Timepicker: `data-timepicker-format`, `data-timepicker-step`, `data-timepicker-min`, `data-timepicker-max`
- Colour swatch: `data-colourswatch-colours`, `data-colourswatch-picker`, `data-colourswatch-value`

### FormValidation
- `data-form-validation` (selector)
- `data-form-ajax`, `data-form-action`, `data-form-method`
- `data-form-success-message`, `data-form-error-message`
- `data-validate` (on fields), `data-validate-message`, `data-validate-message-[rule]`

### Graph
- `data-graph` (selector)
- `data-graph-type`, `data-graph-csv`, `data-graph-data`, `data-graph-title`, `data-graph-height`
- `data-graph-animated`, `data-graph-animation-delay`, `data-graph-tooltips`
- `data-graph-legend`, `data-graph-legend-position`, `data-graph-swatch-shape`
- `data-graph-x-label`, `data-graph-y-label`
- `data-graph-smooth`, `data-graph-bar-radius`, `data-graph-stack-gap`
- `data-graph-pie-gap`, `data-graph-pie-radius`, `data-graph-pie-stroke`, `data-graph-pie-stroke-width`
- `data-graph-donut-width`, `data-graph-donut-label`, `data-graph-donut-label-value`
- `data-graph-radial-start`, `data-graph-radial-grid`, `data-graph-radial-label-position`
- `data-graph-grid-h`, `data-graph-grid-v`
- `data-graph-colours`

### Header
- `data-header` (selector)
- `data-sticky`, `data-shrink`, `data-shrink-offset`, `data-shrink-height`
- `data-layout`, `data-logo-mobile`, `data-transition-speed`
- `data-header-height`, `data-mobile-logo-height`
- `data-transparent`, `data-mobile-menu`, `data-mobile-breakpoint`
- Pre-header: `data-pre-mobile`, `data-pre-tablet`, `data-pre-desktop`, `data-pre-height`

### HorizontalNav
- `data-horizontal-nav` (selector)
- `data-nav-hover-delay`, `data-nav-edge-threshold`, `data-nav-mobile-breakpoint`, `data-nav-mobile-mode`

### ImageGallery
- `data-image-gallery` (selector)
- `data-image-gallery-columns`, `data-image-gallery-gap`
- Items: `data-gallery-type`, `data-gallery-title`, `data-gallery-caption`, `data-gallery-src`, `data-gallery-video-src`, `data-gallery-poster`

### MiniQuiz
- `data-quiz` (selector)
- `data-quiz-title`, `data-quiz-description`, `data-quiz-timer`
- `data-quiz-hidden`, `data-quiz-results`, `data-quiz-shuffle`, `data-quiz-shuffle-options`, `data-quiz-require-attempt`
- `data-quiz-csv`, `data-quiz-data`
- Questions: `data-quiz-type`, `data-quiz-answer`, `data-quiz-explanation`, `data-quiz-categories`

### MultiSlider
- `data-multislider` (selector)
- `data-multislider-items`, `data-multislider-items-md`, `data-multislider-items-sm`
- `data-multislider-gap`, `data-multislider-autoplay`, `data-multislider-interval`

### NestedProgress
- `data-progress-nested` (selector)
- `data-progress-title`, `data-progress-legend`, `data-progress-duration`, `data-progress-circles`

### PageNav
- `data-pagenav` (selector)

### Pagination
- `data-pagination` (selector)
- `data-pagination-target`, `data-pagination-page-size`, `data-pagination-total-items`
- `data-pagination-mode`, `data-pagination-show-info`, `data-pagination-show-input`
- `data-pagination-show-first-last`, `data-pagination-show-sizes`, `data-pagination-scroll-top`

### Parallax
- `data-parallax` (selector)
- `data-parallax-speed`

### Popup
- `data-popup` (selector, value = popup ID)
- `data-popup-close-overlay`

### ProfileGrid
- `data-profile-grid` (selector)
- `data-profile-grid-columns`, `data-profile-grid-filter`
- Items: `data-profile-name`, `data-profile-title`, `data-profile-position`, `data-profile-company`, `data-profile-university`, `data-profile-phone`, `data-profile-email`, `data-profile-website`, `data-profile-social`

### ProgressBar
- `data-progress` (selector)
- `data-progress-type`, `data-progress-value`, `data-progress-label`
- `data-progress-show-percent`, `data-progress-animated`, `data-progress-size`, `data-progress-stroke`

### Slider
- `data-slider` (selector)
- `data-slider-autoplay`, `data-slider-interval`, `data-slider-transition`
- `data-slider-dots`, `data-slider-arrows`

### SmoothScroll
- `data-smoothscroll` (selector)
- `data-smoothscroll-offset`, `data-smoothscroll-header-selector`, `data-smoothscroll-position`
- `data-smoothscroll-duration`, `data-smoothscroll-easing`, `data-smoothscroll-hide-mobile`
- Sections: `data-scroll-title`

### Tabs
- `data-tabs` (selector)
- `data-tab` (on individual tab triggers)

### Timeline
- `data-timeline` (selector)
- `data-timeline-direction`, `data-timeline-alternate`
- Items: `data-timeline-icon`, `data-timeline-date`, `data-timeline-intro`

### Tooltip
- `data-tooltip` (selector, value = tooltip text)
- `data-tooltip-position`, `data-tooltip-class`

### VerticalNav
- `data-vertical-nav` (selector)
- `data-vertical-nav-mode`, `data-vertical-nav-multiple`, `data-vertical-nav-toggle`
- `data-vertical-nav-toggle-label`, `data-vertical-nav-collapsed`, `data-vertical-nav-animation-speed`
- `data-vertical-nav-flyout-hover-delay`, `data-vertical-nav-id`
- `data-vertical-nav-mobile-overlay`, `data-vertical-nav-offcanvas`, `data-vertical-nav-offcanvas-direction`

### VideoBg
- `data-videobg` (selector)
- `data-videobg-src`, `data-videobg-poster`, `data-videobg-overlay`, `data-videobg-mobile-breakpoint`

### VideoPlayer
- `data-video` (selector)
- `data-video-src`, `data-video-poster`, `data-video-title`
- `data-video-autoplay`, `data-video-loop`, `data-video-muted`
- `data-video-volume`, `data-video-preload`, `data-video-color`
- `data-video-controls`, `data-video-fullscreen`

---

## 5. Custom Events (Full Reference)

| Component | Events |
|-----------|--------|
| Accordion | `battersea:accordionToggle` |
| Accessibility | `battersea:a11yOpen`, `battersea:a11yClose`, `battersea:fontSizeChange` |
| AudioPlayer | `battersea:audioEnded`, `battersea:audioPlay`, `battersea:audioPause`, `battersea:audioSeek`, `battersea:audioVolumeChange`, `battersea:audioMute` |
| DataTable | `battersea:tableFilter`, `battersea:tableSort`, `battersea:tablePageChange`, `battersea:rowSelect`, `battersea:tableExport` |
| DragDrop | `battersea:dragRestore`, `battersea:dragStart`, `battersea:dragEnd`, `battersea:dragSave` |
| Flipbox | `battersea:flipboxFlip` |
| FormElements | `battersea:formElementChange` |
| FormValidation | `battersea:fieldInvalid`, `battersea:fieldValid`, `battersea:formInvalid`, `battersea:formValid`, `battersea:formSubmitted`, `battersea:formError` |
| Graph | `battersea:graphReady`, `battersea:graphRender` |
| Header | `battersea:headerSticky`, `battersea:headerTransparent`, `battersea:headerShrink`, `battersea:headerExpand`, `battersea:headerResize`, `battersea:mobileMenuOpen`, `battersea:mobileMenuClose` |
| HorizontalNav | `battersea:hnavInit`, `battersea:hnavDropdownOpen`, `battersea:hnavDropdownClose`, `battersea:hnavFlyoutOpen`, `battersea:hnavFlyoutClose`, `battersea:hnavAccordionOpen`, `battersea:hnavAccordionClose`, `battersea:hnavMobileMode` |
| ImageGallery | `battersea:galleryOpen`, `battersea:galleryClose`, `battersea:galleryChange` |
| MiniQuiz | `battersea:quizReady`, `battersea:quizAnswer`, `battersea:quizSubmit`, `battersea:quizTimerWarning`, `battersea:quizTimerExpired`, `battersea:quizReveal` |
| MultiSlider | `battersea:multisliderChange` |
| NavData | `battersea:navdata-ready` |
| Pagination | `battersea:pagination:change` |
| Popup | `battersea:popupOpen`, `battersea:popupClose` |
| ProfileGrid | `battersea:profileOpen`, `battersea:profileClose` |
| Slider | `battersea:slideChange` |
| SmoothScroll | `battersea:scrollSectionChange` |
| Tabs | `battersea:tabChange` |
| Timeline | `battersea:timelineReady`, `battersea:timelineItemActive`, `battersea:timelineScroll` |
| VerticalNav | `battersea:vnavInit`, `battersea:vnavGroupOpen`, `battersea:vnavGroupClose`, `battersea:vnavFlyoutOpen`, `battersea:vnavFlyoutClose`, `battersea:vnavToggle`, `battersea:vnavMobileOpen`, `battersea:vnavMobileClose`, `battersea:vnavOffCanvasOpen`, `battersea:vnavOffCanvasClose` |
| VideoBg | `battersea:videobgInit` |
| VideoPlayer | `battersea:videoEnded`, `battersea:videoPlay`, `battersea:videoPause`, `battersea:videoSeek`, `battersea:videoVolumeChange`, `battersea:videoMute`, `battersea:videoFullscreen` |

**No events:** Animation, BackToTop, Breadcrumbs (listener only), Counter, NestedProgress, PageNav (listener only), Parallax, ProgressBar, Tooltip.

---

_End of audit._
