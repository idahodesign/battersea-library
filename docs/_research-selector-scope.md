# Selector Rename Scope -- JS References

Research into every place each bare data attribute selector is referenced in JS files under `src/js/`.

Searched for: `querySelector`, `querySelectorAll`, `getAttribute`, `setAttribute`, `hasAttribute`, `removeAttribute`, `closest`, `matches`, `dataset`, `Utils.getData`, `Battersea.register`, and string literals / comments.

---

## 1. `data-animate` (changing to `data-animation`)

**File: `battersea-animation.js`**

| Line | Type | Code |
|------|------|------|
| 63 | getData | `this.animation = Utils.getData(el, 'animate');` |
| 71 | console.warn string | `console.warn('Animation element missing data-animate attribute');` |
| 97 | getData (child check) | `if (!Utils.getData(child, 'animate')) {` |
| 108 | getData (child check) | `if (!Utils.getData(child, 'animate')) {` |
| 124 | getData (child check) | `if (!Utils.getData(child, 'animate')) {` |
| 243 | getData (child check) | `if (!Utils.getData(child, 'animate')) {` |
| 263 | getData (child check) | `const hasOwnAnimation = Utils.getData(el, 'animate');` |
| 293 | register selector | `window.Battersea.register('animation', Animation, '[data-animate]');` |
| 7-42 | comments (multiple) | JSDoc examples referencing `data-animate` |
| 105 | comment | `// Default behavior: hide all children without data-animate` |
| 264 | comment | `// Skip elements with their own data-animate (they'll animate themselves)` |

**CROSS-REFERENCE -- File: `battersea-timeline.js`**

| Line | Type | Code |
|------|------|------|
| 160 | setAttribute | `wrapper.setAttribute('data-animate', animType);` |
| 162 | setAttribute | `wrapper.setAttribute('data-animate', 'fade-up');` |
| 5 | comment | `Vertical: uses the Animation component for scroll-reveal (data-animate)` |
| 273 | comment | `// Vertical mode uses the Animation component (via data-animate attributes)` |

---

## 2. `data-audio` (changing to `data-audio-player`)

**File: `battersea-audioplayer.js`**

| Line | Type | Code |
|------|------|------|
| 571 | register selector | `window.Battersea.register('audioPlayer', AudioPlayer, '[data-audio]');` |
| 9 | comment | `<div data-audio data-audio-src="track.mp3"></div>` |

No cross-references in other JS files.

---

## 3. `data-backtotop` (changing to `data-back-to-top`)

**File: `battersea-backtotop.js`**

| Line | Type | Code |
|------|------|------|
| 139 | register selector | `window.Battersea.register('backtotop', BackToTop, '[data-backtotop]');` |
| 9-12 | comments | JSDoc examples referencing `data-backtotop` |
| 16-18 | comments | Attribute descriptions referencing `data-backtotop-threshold`, etc. |

No cross-references in other JS files.

---

## 4. `data-breadcrumb` (changing to `data-breadcrumbs`)

**File: `battersea-breadcrumbs.js`**

| Line | Type | Code |
|------|------|------|
| 105 | register selector | `window.Battersea.register('breadcrumbs', Breadcrumbs, '[data-breadcrumb]');` |
| 12-13 | comments | JSDoc examples referencing `data-breadcrumb` |

No cross-references in other JS files.

---

## 5. `data-table` (changing to `data-datatable`)

**File: `battersea-datatable.js`**

| Line | Type | Code |
|------|------|------|
| 985 | register selector | `window.Battersea.register('dataTable', DataTable, '[data-table]');` |
| 15 | comment | `<div data-table data-table-sortable="true">` |
| 23 | comment | `<div data-table data-table-data='[...]'></div>` |
| 26 | comment | `<div data-table data-table-data="data/inventory.json"></div>` |
| 29 | comment | `<div data-table data-table-csv="data/employees.csv"></div>` |

No cross-references in other JS files.

---

## 6. `data-quiz` (changing to `data-mini-quiz`)

**File: `battersea-mini-quiz.js`**

| Line | Type | Code |
|------|------|------|
| 1930 | register selector | `window.Battersea.register('miniQuiz', MiniQuiz, '[data-quiz]');` |

No cross-references in other JS files.

---

## 7. `data-multislider` (changing to `data-multi-slider`)

**File: `battersea-multislider.js`**

| Line | Type | Code |
|------|------|------|
| 297 | register selector | `window.Battersea.register('multislider', MultiSlider, '[data-multislider]');` |
| 8 | comment | `<div data-multislider data-multislider-items="4" ...>` |

No cross-references in other JS files.

---

## 8. `data-progress-nested` (changing to `data-nested-progress`)

**File: `battersea-nestedprogress.js`**

| Line | Type | Code |
|------|------|------|
| 233 | register selector | `window.Battersea.register('nestedprogress', NestedProgress, '[data-progress-nested]');` |
| 8 | comment | `<div data-progress-nested data-progress-circles='[` |

No cross-references in other JS files.

---

## 9. `data-pagenav` (changing to `data-page-nav`)

**File: `battersea-pagenav.js`**

| Line | Type | Code |
|------|------|------|
| 170 | register selector | `window.Battersea.register('pageNav', PageNav, '[data-pagenav]');` |
| 12-13 | comments | JSDoc examples referencing `data-pagenav` |

No cross-references in other JS files.

---

## 10. `data-progress` (changing to `data-progress-bar`)

**File: `battersea-progressbar.js`**

| Line | Type | Code |
|------|------|------|
| 210 | register selector | `window.Battersea.register('progressbar', ProgressBar, '[data-progress]');` |
| 7 | comment | `<div data-progress data-progress-value="75" ...></div>` |
| 10 | comment | `<div data-progress data-progress-type="circular" ...></div>` |

No cross-references in other JS files.

---

## 11. `data-smoothscroll` (changing to `data-smooth-scroll`)

**File: `battersea-smoothscroll.js`**

| Line | Type | Code |
|------|------|------|
| 453 | register selector | `window.Battersea.register('smoothscroll', SmoothScroll, '[data-smoothscroll]');` |
| 8-14 | comments | JSDoc examples referencing `data-smoothscroll` |
| 22-27 | comments | Attribute descriptions referencing `data-smoothscroll-*` |

No cross-references in other JS files.

---

## 12. `data-videobg` (changing to `data-video-bg`)

**File: `battersea-videobg.js`**

| Line | Type | Code |
|------|------|------|
| 178 | register selector | `window.Battersea.register('videoBg', VideoBg, '[data-videobg]');` |
| 31 | console.warn string | `console.warn('VideoBackground: no data-videobg-src provided');` |

No cross-references in other JS files.

---

## 13. `data-video` (changing to `data-video-player`)

**File: `battersea-videoplayer.js`**

| Line | Type | Code |
|------|------|------|
| 798 | register selector | `window.Battersea.register('videoPlayer', VideoPlayer, '[data-video]');` |
| 9 | comment | `<div data-video data-video-src="clip.mp4"></div>` |
| 63 | console.warn string | `console.warn('VideoPlayer: data-video-src is required');` |

No cross-references in other JS files.

---

## Summary

| # | Old Selector | New Selector | JS files affected | Cross-refs |
|---|---|---|---|---|
| 1 | `data-animate` | `data-animation` | battersea-animation.js | **battersea-timeline.js** (setAttribute x2) |
| 2 | `data-audio` | `data-audio-player` | battersea-audioplayer.js | None |
| 3 | `data-backtotop` | `data-back-to-top` | battersea-backtotop.js | None |
| 4 | `data-breadcrumb` | `data-breadcrumbs` | battersea-breadcrumbs.js | None |
| 5 | `data-table` | `data-datatable` | battersea-datatable.js | None |
| 6 | `data-quiz` | `data-mini-quiz` | battersea-mini-quiz.js | None |
| 7 | `data-multislider` | `data-multi-slider` | battersea-multislider.js | None |
| 8 | `data-progress-nested` | `data-nested-progress` | battersea-nestedprogress.js | None |
| 9 | `data-pagenav` | `data-page-nav` | battersea-pagenav.js | None |
| 10 | `data-progress` | `data-progress-bar` | battersea-progressbar.js | None |
| 11 | `data-smoothscroll` | `data-smooth-scroll` | battersea-smoothscroll.js | None |
| 12 | `data-videobg` | `data-video-bg` | battersea-videobg.js | None |
| 13 | `data-video` | `data-video-player` | battersea-videoplayer.js | None |

### Key finding

Only **one cross-component dependency** exists: `battersea-timeline.js` programmatically sets `data-animate` on wrapper elements (lines 160, 162) so the Animation component picks them up. When renaming `data-animate` to `data-animation`, the timeline file must also be updated.

All other selectors are self-contained within their own component file (register call + comments + getData calls). No other JS files query or set these attributes.

### How `battersea-core.js` uses selectors

The core file does NOT hardcode any component selectors. It receives the selector string via `register()` and uses `Utils.qsa(component.selector)` to find elements. Changing the selector string in the register call is sufficient for core.

---

*Generated: 22 February 2026*
