# CSS/LESS Naming Consistency Audit

**Date:** 22 February 2026
**Scope:** All 51 LESS files in `src/css/`
**Auditor:** Claude Code

---

## Executive Summary

The library uses three distinct CSS selector strategies:
1. **Data attribute selectors** (older components) -- e.g. `[data-accordion-item]`
2. **BEM-style class naming** (newer components) -- e.g. `.battersea-hnav__link--active`
3. **Flat class naming** (some components) -- e.g. `.battersea-progress-bar`

CSS custom properties (variables) use three different namespace conventions:
1. `--battersea-*` (core variables file and most components)
2. `--datatable-*`, `--form-*`, `--quiz-*`, `--graph-*`, `--pagination-*` (several newer components)
3. Mixed/none (some components hardcode values instead)

There are significant naming inconsistencies across the library that have grown organically as components were added over time.

---

## Component-by-Component Audit

### 1. battersea-variables.less
- **Purpose:** Core CSS custom properties
- **Variable namespace:** `--battersea-*` throughout
- **Issues:**
  - Duplicate declaration: `--battersea-progress-circular-stroke` and `--battersea-progress-circular-fill` appear twice (lines 46-47 and 56-57)
  - Some variables reference `var()` as fallbacks (e.g. `--battersea-slider-dot-active: var(--battersea-primary)`) -- this is risky with LESS compilation

### 2. battersea-variables-enhanced.less
- **Purpose:** LESS variables + CSS custom properties using brand colours
- **LESS variable naming:** `@kebab-case` (e.g. `@primary-color`, `@base-font-family`) -- consistent within this file
- **CSS custom property namespace:** `--battersea-*` -- consistent
- **Issues:**
  - Typo on line 26: `@text-light: rgba(@text-color, 0,7);` -- comma instead of dot (0,7 instead of 0.7)
  - Audio Player, Video Player, DragDrop variables defined here but NOT in `battersea-variables.less` -- the two files are not in sync
  - `battersea-variables.less` (without enhanced) appears to be a standalone fallback file and duplicates many of the same CSS custom properties

### 3. battersea-accordion.less
- **Root selector:** `[data-accordion-item]` (data attribute)
- **BEM:** No -- uses nested data attribute selectors
- **CSS custom properties:** References `--battersea-accordion-*` from variables but mostly uses hardcoded values
- **Class naming:** Only uses `.active` state class
- **Pattern:** Data-attribute-driven, no `battersea-` prefixed classes

### 4. battersea-tabs.less
- **Root selector:** `[data-tabs-nav]`, `[data-tabs-content]`
- **BEM:** No -- uses data attribute selectors
- **CSS custom properties:** References `--battersea-tab-*` variables
- **Class naming:** Only `.active` state class
- **Pattern:** Same as accordion -- data-attribute-driven

### 5. battersea-parallax.less
- **Root selector:** `[data-parallax]`
- **BEM:** No
- **CSS custom properties:** None used
- **Pattern:** Single data-attribute selector, minimal styles

### 6. battersea-flipbox.less
- **Root selector:** `[data-flipbox]`
- **BEM:** No -- but uses `battersea-flipbox-horizontal`, `battersea-flipbox-vertical`, `battersea-flipbox-flipped` as state classes
- **CSS custom properties:** None
- **Inconsistency:** Class names use flat naming (not BEM double-hyphens for modifiers)

### 7. battersea-progress-bars.less
- **Root selector:** `.battersea-progress`
- **BEM:** Partial -- uses flat naming: `.battersea-progress-bar`, `.battersea-progress-fill`, `.battersea-progress-label`, `.battersea-progress-circular`
- **CSS custom properties:** References `--battersea-progress-*`
- **Inconsistency:** Uses hyphens not BEM double-underscores (e.g. `.battersea-progress-bar` not `.battersea-progress__bar`)

### 8. battersea-progress-bars-nested.less
- **Root selector:** `.battersea-progress-nested`
- **BEM:** No -- flat naming: `.battersea-nested-progress-fill`, `.battersea-progress-legend`, `.battersea-progress-legend-item`, `.battersea-progress-legend-color`, `.battersea-progress-legend-label`
- **Inconsistency:** Mixed word order -- `.battersea-progress-nested` vs `.battersea-nested-progress-fill` (prefix position differs)

### 9. battersea-nav-horizontal.less
- **Root selector:** `.battersea-hnav`
- **BEM:** Yes -- full BEM pattern: `.battersea-hnav__item`, `.battersea-hnav__link`, `.battersea-hnav__item--has-dropdown`, `.battersea-hnav__dropdown--visible`
- **CSS custom properties:** Declares own `:root` block with `--battersea-hnav-*` variables
- **Notes:** Excellent BEM implementation. One of the most consistently named components. Declares its own variables inline rather than in the variables file.

### 10. battersea-smooth-scroll.less
- **Root selector:** `.battersea-scroll-nav`
- **BEM:** No -- flat naming: `.battersea-scroll-dot`, `.battersea-scroll-right`, `.battersea-scroll-left`, `.battersea-scroll-hide-mobile`
- **CSS custom properties:** References `--battersea-scroll-*`
- **Inconsistency:** Uses flat hyphen naming rather than BEM

### 11. battersea-popup.less
- **Root selector:** `.battersea-popup-overlay`
- **BEM:** No -- flat naming: `.battersea-popup-wrapper`
- **CSS custom properties:** References `--battersea-popup-*`
- **Also uses:** `[data-popup]` data attribute for the popup itself -- mixed approach

### 12. battersea-counter.less
- **Root selector:** `[data-counter]`
- **BEM:** No -- flat naming: `.battersea-counter-pretext`, `.battersea-counter-posttext`, `.battersea-counter-prefix`, `.battersea-counter-suffix`, `.battersea-counter-number`
- **CSS custom properties:** References `--battersea-text` only
- **Inconsistency:** Uses LESS variable `@secondary-color-l` directly for the counter colour (hardcoded to enhanced variables)

### 13. battersea-animation.less
- **Root selector:** `[data-animate]`
- **BEM:** Partial -- `.battersea-animated`, `.battersea-fade-in`, `.battersea-fade-up`, etc. (flat naming). New ticker tape uses BEM: `.battersea-ticker-char--visible`
- **CSS custom properties:** References `--battersea-animation-*`
- **Inconsistency:** Newer ticker classes use BEM modifier (`--visible`) while older animation classes use flat naming

### 14. battersea-utility.less
- **Root selector:** `.battersea-animated`
- **Minimal file** -- just marker class for animated elements

### 15. battersea-slider.less
- **Root selector:** `[data-slider]` (data attributes) + `.battersea-slider-*` (legacy classes)
- **BEM:** No -- flat naming
- **CSS custom properties:** References `--battersea-slider-*`, `--battersea-primary`
- **Issue:** Contains both old (`.battersea-slider-wrapper`, `.battersea-slider-track`) and new (`[data-slider]`, `[data-slider-track]`) selectors -- dual approach

### 16. battersea-slider-multi-item.less
- **Root selector:** `[data-multislider]`
- **BEM:** No -- data attribute selectors
- **CSS custom properties:** References `--battersea-slider-*` (shared with slider)
- **Pattern:** Consistent with single slider's data-attribute approach

### 17. battersea-tooltips.less
- **Root selector:** `.battersea-tooltip`
- **BEM:** No -- flat naming with hyphenated modifiers: `.battersea-tooltip-top`, `.battersea-tooltip-bottom`, `.battersea-tooltip-show`
- **CSS custom properties:** References `--battersea-tooltip-*`
- **Inconsistency:** Uses single-hyphen modifiers not BEM double-hyphens

### 18. battersea-imagegallery.less
- **Root selector:** `[data-image-gallery]` + `.battersea-gallery-*`
- **BEM:** Partial -- uses BEM double-hyphen modifiers in some places (`.battersea-gallery-media-wrap--zoomed`, `.battersea-gallery-info--hidden`, `.battersea-gallery-zoom-controls--hidden`) but no double-underscore elements
- **CSS custom properties:** References `--battersea-gallery-*`
- **Inconsistency:** Grid uses data attributes, lightbox uses `.battersea-gallery-*` flat classes. Some BEM modifiers mixed with flat naming.

### 19. battersea-header.less
- **Root selector:** `.battersea-header`
- **BEM:** Yes -- `.battersea-header__container`, `.battersea-header__brand`, `.battersea-header__logo`, `.battersea-header__nav`, `.battersea-header--right-align`, `.battersea-header--shrunk`
- **CSS custom properties:** References `--battersea-header-*`. Also declares own `:root` block with `--battersea-mobile-menu-*`
- **Mobile menu BEM:** `.battersea-header__toggle`, `.battersea-header__mobile-overlay`, `.battersea-header__mobile-panel--active`
- **Notes:** Good BEM implementation for the main header. Mobile menu variables use a different namespace (`--battersea-mobile-menu-*` vs the rest using `--battersea-header-*`).

### 20. battersea-nav-vertical.less
- **Root selector:** `[data-vertical-nav]` + `.battersea-vnav`
- **BEM:** Yes -- full BEM: `.battersea-vnav__item`, `.battersea-vnav__link`, `.battersea-vnav__item--has-flyout`, `.battersea-vnav__flyout--visible`, `.battersea-vnav__mobile-panel--active`
- **CSS custom properties:** References `--battersea-vnav-*`
- **Notes:** Excellent BEM implementation, consistent throughout

### 21. battersea-accessibility.less
- **Root selector:** `[data-accessibility]`
- **BEM:** Partial -- uses BEM for the panel: `.battersea-a11y-panel`, `.battersea-a11y-panel__label`, `.battersea-a11y-panel__label--small`
- **CSS custom properties:** None used (hardcoded values)
- **Inconsistency:** Abbreviation `a11y` vs full words used everywhere else. Uses CSS comments (`/* */`) mixed with LESS comments (`//`)

### 22. battersea-audioplayer.less
- **Root selector:** `.battersea-audio`
- **BEM:** Yes -- full BEM using LESS nesting: `&__info`, `&__title`, `&__play`, `&__icon--play`, `&__icon--pause`, `&--error`, `&--dragging-progress`
- **CSS custom properties:** References `--battersea-audio-accent` for colour override
- **Notes:** Good BEM implementation, mostly hardcoded values rather than variables

### 23. battersea-videoplayer.less
- **Root selector:** `.battersea-video`
- **BEM:** Yes -- full BEM: `&__poster`, `&__poster--hidden`, `&__overlay`, `&__controls`, `&__play`, `&__icon--play`, `&--error`, `&--fullscreen`
- **CSS custom properties:** References `--battersea-video-accent`
- **Notes:** Mirror of audioplayer approach -- consistent between the two

### 24. battersea-profilegrid.less
- **Root selector:** `.battersea-profile-filter`, `.battersea-profile-grid__items`, `[data-profile-item]`, `.battersea-profile-overlay`, `.battersea-profile-lightbox`
- **BEM:** Yes -- `.battersea-profile-filter__categories`, `.battersea-profile-filter__pill`, `.battersea-profile-overlay__name`, `.battersea-profile-lightbox__panel`
- **CSS custom properties:** References `--battersea-profile-*` with fallbacks
- **Inconsistency:** Uses CSS comments (`/* */`) throughout instead of LESS comments (`//`)
- **Issue:** Grid items use data attribute `[data-profile-item]` while everything else uses classes

### 25. battersea-dragdrop.less
- **Root selector:** `[data-drag-drop]`, `[data-drag-item]`
- **BEM:** Partial -- `.battersea-dragdrop__ghost`, `.battersea-dragdrop__placeholder`, `.battersea-dragdrop__dragging`, `.battersea-dragdrop__container-label`, `.battersea-dragdrop__display-list`, `.battersea-dragdrop__display-item`
- **CSS custom properties:** References `--battersea-dragdrop-*` with fallbacks
- **Inconsistency:** Core elements use data attributes, generated elements use BEM classes. Uses CSS comments mixed with LESS comments. Uses tabs for indentation (most other files use spaces or mixed).

### 26. battersea-timeline.less
- **Root selector:** `.battersea-timeline`
- **BEM:** Yes -- full BEM: `.battersea-timeline__line`, `.battersea-timeline__item`, `.battersea-timeline__item--left`, `.battersea-timeline__marker`, `.battersea-timeline__card`, `.battersea-timeline--alternate`, `.battersea-timeline--horizontal`
- **CSS custom properties:** References `--battersea-timeline-*` with fallbacks
- **Notes:** Uses CSS comments (`/* */`) throughout. Good BEM implementation.

### 27. battersea-datatable.less
- **Root selector:** `.battersea-datatable`
- **BEM:** Yes -- full BEM using LESS nesting: `&__toolbar`, `&__filter`, `&__th`, `&__th--sortable`, `&__row--selected`, `&__page-btn--active`
- **CSS custom properties:** Declares own `:root` block with `--datatable-*` (NO `battersea-` prefix)
- **Major inconsistency:** Variable namespace breaks the `--battersea-` convention. Uses `--datatable-*` instead.
- **Also:** Adds `.battersea-sr-only` utility class here (screen-reader-only) -- should be in utility file

### 28. battersea-form-validation.less
- **Root selector:** `.battersea-form-field--error`, `.battersea-form-error`, `.battersea-form-message`, `.battersea-form-password-wrapper`, `.battersea-form-strength`, `.battersea-form-file-wrapper`
- **BEM:** Partial -- uses BEM modifiers (`.battersea-form-field--error`, `.battersea-form-message--success`, `.battersea-form-strength--weak`, `.battersea-form-file-dropzone--dragover`) and BEM elements (`.battersea-form-strength__bar`, `.battersea-form-strength__label`)
- **CSS custom properties:** Declares own `:root` block with `--form-*` (NO `battersea-` prefix)
- **Major inconsistency:** Variable namespace breaks convention -- uses `--form-*` instead of `--battersea-form-*`

### 29. battersea-form-elements.less
- **Root selector:** `.battersea-toggle`, `.battersea-slider-input`, `.battersea-datepicker`, `.battersea-timepicker`, `.battersea-colourswatch`
- **BEM:** Yes -- `.battersea-toggle__input`, `.battersea-toggle__track`, `.battersea-toggle--checked`, `.battersea-datepicker__dropdown`, `.battersea-datepicker__day--today`, `.battersea-colourswatch__swatch--selected`
- **CSS custom properties:** Declares own `:root` block with `--form-*` (NO `battersea-` prefix)
- **Major inconsistency:** Variable namespace breaks convention
- **Name conflict potential:** `.battersea-slider-input` could be confused with the main Slider component (`.battersea-slider-*`)
- **Uses CSS comments** (`/* */`) for section headers, LESS comments for inline

### 30. battersea-breadcrumbs.less
- **Root selector:** `.battersea-breadcrumb`
- **BEM:** Yes -- `.battersea-breadcrumb__list`, `.battersea-breadcrumb__item`, `.battersea-breadcrumb__link`, `.battersea-breadcrumb__current`
- **CSS custom properties:** References `--battersea-breadcrumb-*` with fallbacks
- **Notes:** Clean, consistent BEM. Well structured.

### 31. battersea-pagenav.less
- **Root selector:** `.battersea-pagenav`
- **BEM:** Yes -- `.battersea-pagenav__link`, `.battersea-pagenav__link--prev`, `.battersea-pagenav__arrow`, `.battersea-pagenav__text`, `.battersea-pagenav__category`, `.battersea-pagenav__title`, `.battersea-pagenav__label`
- **CSS custom properties:** Inline references with fallbacks (variables NOT defined in variables file -- `--battersea-pagenav-*`)
- **Notes:** Good BEM, but variables are defined implicitly via fallbacks rather than in the variables files

### 32. battersea-mini-quiz.less
- **Root selector:** `.battersea-quiz`
- **BEM:** Yes -- full BEM: `.battersea-quiz__title`, `.battersea-quiz__question`, `.battersea-quiz__option-label--selected`, `.battersea-quiz__drag-item--dragging`, `.battersea-quiz--submitted`, `.battersea-quiz__leave-warning`
- **CSS custom properties:** Declares own `:root` block with `--quiz-*` (NO `battersea-` prefix)
- **Major inconsistency:** Variable namespace breaks convention
- **Notes:** Uses tabs for indentation. Very large file (800+ lines), well structured BEM.

### 33. battersea-videobg.less
- **Root selector:** `[data-videobg]`
- **BEM:** Partial -- `.battersea-videobg__video`, `.battersea-videobg__poster`, `.battersea-videobg__overlay`, `.battersea-videobg__content`
- **CSS custom properties:** None used
- **Notes:** Clean, minimal. Uses tabs for indentation. Container is data attribute, children are BEM classes.

### 34. battersea-graph.less
- **Root selector:** `.battersea-graph`
- **BEM:** Yes -- full BEM: `.battersea-graph__title`, `.battersea-graph__svg`, `.battersea-graph__grid-line--h`, `.battersea-graph__point--hidden`, `.battersea-graph__legend-swatch--circle`, `.battersea-graph--legend-right`
- **CSS custom properties:** Declares own `:root` block with `--graph-*` (NO `battersea-` prefix)
- **Major inconsistency:** Variable namespace breaks convention

### 35. battersea-backtotop.less
- **Root selector:** `.battersea-backtotop`
- **BEM:** Partial -- `.battersea-backtotop__arrow`, `.battersea-backtotop--visible`
- **CSS custom properties:** None (hardcoded values)
- **Notes:** Clean, minimal, consistent naming

### 36. battersea-pagination.less
- **Root selector:** `.battersea-pagination`
- **BEM:** Yes -- full BEM: `.battersea-pagination__row`, `.battersea-pagination__btn`, `.battersea-pagination__btn--active`, `.battersea-pagination__ellipsis`, `.battersea-pagination__input`
- **CSS custom properties:** Declares own `:root` block with `--pagination-*` (NO `battersea-` prefix)
- **Major inconsistency:** Variable namespace breaks convention

---

## Demo-Specific Files (not part of library)

### battersea-demo-site.less
- Aggregator file importing all demo styles

### battersea-demo-extentions.less / battersea-demo-foundation.less / battersea-demo-typography.less
- Use LESS extend pattern (`.ext-*` classes)
- Use LESS variables (`@primary-color`, etc.)
- These are demo site styles, not library component styles
- Note: filename misspelling -- "extentions" should be "extensions"

### battersea-demo-buttons.less / battersea-demo-cards.less / battersea-demo-footer.less / etc.
- Demo-only styles using generic class names (`.btn`, `.feature-card`, `.section-box`, `.demo-footer`)
- `.demo-footer` uses BEM pattern
- Generic class names (`.btn`, `.feature-card`) could conflict with other frameworks
- These are not part of the library itself

---

## Summary of Inconsistencies

### 1. Selector Strategy (Three Approaches)

| Approach | Components |
|----------|-----------|
| **Data attributes only** | Accordion, Tabs, Parallax, Flipbox, Slider, MultiSlider, Counter |
| **BEM classes** | HorizontalNav, Header, VerticalNav, AudioPlayer, VideoPlayer, Breadcrumbs, PageNav, MiniQuiz, Graph, Pagination, DataTable |
| **Mixed (data attrs + classes)** | Popup, ImageGallery, DragDrop, ProfileGrid, VideoBackground, FormElements |
| **Flat classes (no BEM)** | Progress, NestedProgress, SmoothScroll, Tooltip, Animation |

**Recommendation:** Newer components consistently use BEM. Older components use data attributes or flat classes. There is no urgent need to change, but new components should follow BEM.

### 2. CSS Custom Property Namespacing

| Namespace | Components |
|-----------|-----------|
| `--battersea-*` | Variables files, Slider, Tabs, Popup, Accordion, Progress, SmoothScroll, Animation, Header, Audio, Video, DragDrop, Profile, Timeline, Breadcrumbs, PageNav |
| `--datatable-*` | DataTable |
| `--form-*` | FormValidation, FormElements |
| `--quiz-*` | MiniQuiz |
| `--graph-*` | Graph |
| `--pagination-*` | Pagination |
| None (hardcoded) | Accessibility, BackToTop, Counter (mostly), AudioPlayer (mostly), VideoPlayer (mostly) |

**Six components break the `--battersea-` namespace convention.** This is the most significant inconsistency in the library. The non-prefixed variables could clash with other CSS on the page.

### 3. Where Variables Are Declared

| Location | Components |
|----------|-----------|
| `battersea-variables.less` | Core variables (tooltip, slider, tab, popup, accordion, progress, scroll, animation, header, audio, video, dragdrop, profile, graph, breadcrumbs) |
| `battersea-variables-enhanced.less` | Same as above plus brand variables, buttons, gallery, vnav, timeline, profile |
| Component's own `:root` block | HorizontalNav, DataTable, FormValidation, FormElements, MiniQuiz, Graph, Pagination, Header (mobile menu) |
| Inline fallbacks only | PageNav (variables not declared anywhere, used with fallbacks) |

**Issue:** Variables are spread across three locations. Some components declare variables in the variables files, some declare them inline, some do both, and PageNav declares none at all (relying solely on CSS fallback values).

### 4. Comment Style

| Style | Files |
|-------|-------|
| LESS comments (`//`) | Most component files |
| CSS comments (`/* */`) | ProfileGrid, Timeline, DragDrop (some), FormElements (section headers), Accessibility |
| Mixed | Several files |

Minor inconsistency but worth noting for maintainability.

### 5. Indentation

| Style | Files |
|-------|-------|
| Spaces | Most files |
| Tabs | Accordion, DragDrop, MiniQuiz, VideoBackground, Counter |
| Mixed | A few files |

### 6. Naming Oddities

- **Abbreviations used inconsistently:** `vnav` (VerticalNav), `hnav` (HorizontalNav), `a11y` (Accessibility), `videobg` (VideoBackground), but `battersea-audio` (not `audioplayer`), `battersea-video` (not `videoplayer`)
- **Word order:** `.battersea-progress-nested` vs `.battersea-nested-progress-fill` in the same file
- **Potential name clash:** `.battersea-slider-input` (FormElements range slider) vs `.battersea-slider-*` (main Slider component)
- **`.battersea-sr-only`** utility class defined inside `battersea-datatable.less` rather than in the utility file
- **Filename misspelling:** `battersea-demo-extentions.less` (should be "extensions")

### 7. State Class Naming

| Pattern | Components |
|---------|-----------|
| `.active` (no prefix) | Accordion, Tabs, Slider, Popup, ProfileGrid lightbox |
| `--visible` / `--hidden` / `--open` BEM modifier | HorizontalNav, VerticalNav, VideoPlayer, ImageGallery, BackToTop, Timeline |
| `.battersea-*-flipped` (flat) | Flipbox |

---

## Priority Recommendations

### High Priority (risk of bugs/clashes)
1. **Namespace all CSS custom properties with `--battersea-`** -- DataTable, FormValidation, FormElements, MiniQuiz, Graph, and Pagination all use un-namespaced variables that could clash with third-party CSS
2. **Centralise variable declarations** -- either all in the variables files or all inline, not both
3. **Fix the `@text-light` typo** in `battersea-variables-enhanced.less` (comma instead of dot)

### Medium Priority (consistency)
4. Adopt BEM for all new components (already happening naturally)
5. Move `.battersea-sr-only` from datatable to the utility file
6. Standardise comment style (LESS `//` for all)
7. Standardise indentation (spaces for all)

### Low Priority (nice to have)
8. Fix filename misspelling (extentions -> extensions)
9. Standardise abbreviation approach
10. Remove legacy slider classes when safe to do so
11. Resolve the duplicate `--battersea-progress-circular-*` declarations in variables

---

*Audit complete. No files were modified.*
