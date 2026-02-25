# Data Attribute Selector Audit — HTML & LESS Scope

Research for renaming bare data attribute selectors across `demo/`, `includes/`, and `src/css/`.

---

## 1. `data-animate` → `data-animation`

### LESS (src/css/)
| File | Line | Context |
|------|------|---------|
| `src/css/battersea-animation.less` | 6 | `[data-animate] {` |

### HTML (demo/)
**Used on nearly every section across all 33 demo pages plus index.html.**
691 total occurrences across 33 files (includes both live HTML and code examples).

Files with counts:
| File | Count |
|------|-------|
| `demo/index.html` | 53 |
| `demo/components/animation.html` | 57 |
| `demo/components/accordion.html` | 21 |
| `demo/components/audioplayer.html` | 16 |
| `demo/components/breadcrumbs.html` | 19 |
| `demo/components/counter.html` | 15 |
| `demo/components/datatable.html` | 23 |
| `demo/components/dragdrop.html` | 17 |
| `demo/components/flipbox.html` | 12 |
| `demo/components/formelements.html` | 23 |
| `demo/components/formvalidation.html` | 24 |
| `demo/components/graph.html` | 30 |
| `demo/components/header.html` | 17 |
| `demo/components/horizontalnav.html` | 15 |
| `demo/components/imagegallery.html` | 21 |
| `demo/components/mini-quiz.html` | 30 |
| `demo/components/multislider.html` | 15 |
| `demo/components/nestedprogress.html` | 16 |
| `demo/components/pagenav.html` | 20 |
| `demo/components/pagination.html` | 21 |
| `demo/components/parallax.html` | 15 |
| `demo/components/popup.html` | 15 |
| `demo/components/profilegrid.html` | 13 |
| `demo/components/progressbar.html` | 16 |
| `demo/components/slider.html` | 15 |
| `demo/components/smoothscroll.html` | 15 |
| `demo/components/tabs.html` | 21 |
| `demo/components/timeline.html` | 21 |
| `demo/components/tooltip.html` | 15 |
| `demo/components/verticalnav.html` | 30 |
| `demo/components/videobg.html` | 16 |
| `demo/components/videoplayer.html` | 15 |
| `demo/components/accessibility.html` | 19 |

### includes/
No occurrences.

**Note:** Most occurrences are `data-animate="fade-up"` on section/div elements. The animation.html page also references `data-animate-children` and `data-ticker-speed` sub-attributes, plus code examples showing the attribute. The sub-attributes (`data-animate-children`) would need renaming too if the prefix changes.

---

## 2. `data-audio` (bare) → `data-audio-player`

### LESS (src/css/)
No bare `[data-audio]` selector. Only a comment reference:
| File | Line | Context |
|------|------|---------|
| `src/css/battersea-audioplayer.less` | 242 | `// Accent colour override via data-audio-color` (comment only) |

### HTML (demo/)
Live bare `data-audio` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/audioplayer.html` | 85 | `<div data-audio` |
| `demo/components/audioplayer.html` | 97 | `<div data-audio` |
| `demo/components/audioplayer.html` | 112 | `<div data-audio` |
| `demo/components/audioplayer.html` | 129 | `<div data-audio` |

Code examples / documentation references to bare `data-audio`:
| File | Line | Context |
|------|------|---------|
| `demo/components/audioplayer.html` | 214 | `<td><code>data-audio</code></td>` |
| `demo/components/audioplayer.html` | 285 | `<pre><code>&lt;div data-audio data-audio-src=...` |
| `demo/components/audioplayer.html` | 350 | `<pre><code>&lt;div data-audio` |
| `demo/components/audioplayer.html` | 362 | `<pre><code>&lt;div data-audio` |
| `demo/components/audioplayer.html` | 377 | `<pre><code>&lt;div data-audio` |
| `demo/components/audioplayer.html` | 391 | `document.querySelector('[data-audio]')` |

### includes/
No occurrences.

---

## 3. `data-backtotop` (bare) → `data-back-to-top`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Appears once per demo page (33 pages + index). All are the same pattern: `<div data-backtotop></div>`

| File | Line |
|------|------|
| `demo/index.html` | 940 |
| `demo/components/accordion.html` | 802 |
| `demo/components/accessibility.html` | 397 |
| `demo/components/animation.html` | 540 |
| `demo/components/audioplayer.html` | 474 |
| `demo/components/breadcrumbs.html` | 413 |
| `demo/components/counter.html` | 238 |
| `demo/components/datatable.html` | 724 |
| `demo/components/dragdrop.html` | 461 |
| `demo/components/flipbox.html` | 193 |
| `demo/components/formelements.html` | 727 |
| `demo/components/formvalidation.html` | 748 |
| `demo/components/graph.html` | 913 |
| `demo/components/header.html` | 582 |
| `demo/components/horizontalnav.html` | 604 |
| `demo/components/imagegallery.html` | 611 |
| `demo/components/mini-quiz.html` | 843 |
| `demo/components/multislider.html` | 568 |
| `demo/components/nestedprogress.html` | 450 |
| `demo/components/pagenav.html` | 458 |
| `demo/components/pagination.html` | 640 |
| `demo/components/parallax.html` | 407 |
| `demo/components/popup.html` | 471 |
| `demo/components/profilegrid.html` | 626 |
| `demo/components/progressbar.html` | 465 |
| `demo/components/slider.html` | 533 |
| `demo/components/smoothscroll.html` | 469 |
| `demo/components/tabs.html` | 590 |
| `demo/components/timeline.html` | 584 |
| `demo/components/tooltip.html` | 432 |
| `demo/components/verticalnav.html` | 1157 |
| `demo/components/videobg.html` | 442 |
| `demo/components/videoplayer.html` | 472 |

### includes/
No occurrences.

---

## 4. `data-breadcrumb` → `data-breadcrumbs`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Appears once per demo page (33 pages) as `<div data-breadcrumb></div>`, plus extra uses on breadcrumbs.html.

Standard placement (one per page):
| File | Line |
|------|------|
| `demo/components/accordion.html` | 56 |
| `demo/components/accessibility.html` | 56 |
| `demo/components/animation.html` | 56 |
| `demo/components/audioplayer.html` | 56 |
| `demo/components/breadcrumbs.html` | 56 |
| `demo/components/counter.html` | 27 |
| `demo/components/datatable.html` | 56 |
| `demo/components/dragdrop.html` | 56 |
| `demo/components/flipbox.html` | 27 |
| `demo/components/formelements.html` | 132 |
| `demo/components/formvalidation.html` | 128 |
| `demo/components/graph.html` | 56 |
| `demo/components/horizontalnav.html` | 67 |
| `demo/components/imagegallery.html` | 56 |
| `demo/components/mini-quiz.html` | 56 |
| `demo/components/multislider.html` | 56 |
| `demo/components/nestedprogress.html` | 56 |
| `demo/components/pagenav.html` | 56 |
| `demo/components/pagination.html` | 112 |
| `demo/components/parallax.html` | 56 |
| `demo/components/popup.html` | 56 |
| `demo/components/profilegrid.html` | 56 |
| `demo/components/progressbar.html` | 56 |
| `demo/components/slider.html` | 56 |
| `demo/components/smoothscroll.html` | 56 |
| `demo/components/tabs.html` | 56 |
| `demo/components/timeline.html` | 56 |
| `demo/components/tooltip.html` | 56 |
| `demo/components/verticalnav.html` | 104 |
| `demo/components/videobg.html` | 56 |
| `demo/components/videoplayer.html` | 56 |

Additional live HTML on breadcrumbs.html (with separator sub-attribute):
| File | Line | Context |
|------|------|---------|
| `demo/components/breadcrumbs.html` | 91 | `<div data-breadcrumb data-breadcrumb-separator="/">` |
| `demo/components/breadcrumbs.html` | 100 | `<div data-breadcrumb data-breadcrumb-separator="&#8250;">` |
| `demo/components/breadcrumbs.html` | 109 | `<div data-breadcrumb data-breadcrumb-separator="&#8594;">` |

Code examples / documentation on breadcrumbs.html:
| File | Line | Context |
|------|------|---------|
| `demo/components/breadcrumbs.html` | 176 | `<td><code>data-breadcrumb</code></td>` |
| `demo/components/breadcrumbs.html` | 261 | `<pre><code>&lt;div data-breadcrumb&gt;` |
| `demo/components/breadcrumbs.html` | 272 | `&lt;div data-breadcrumb data-breadcrumb-separator="/"&gt;` |
| `demo/components/breadcrumbs.html` | 275 | `&lt;div data-breadcrumb data-breadcrumb-separator=...` |
| `demo/components/breadcrumbs.html` | 278 | `&lt;div data-breadcrumb data-breadcrumb-separator=...` |

### includes/
No occurrences.

---

## 5. `data-table` (bare) → `data-datatable`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Live bare `data-table` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/datatable.html` | 85 | `<div data-table data-table-sortable="true" ...>` |
| `demo/components/datatable.html` | 117 | `<div data-table data-table-sortable="true" ...>` |
| `demo/components/datatable.html` | 158 | `<div data-table` (multiline) |
| `demo/components/datatable.html` | 175 | `<div data-table` (JSON data) |
| `demo/components/datatable.html` | 191 | `<div data-table` (CSV data) |
| `demo/components/datatable.html` | 207 | `<div data-table` (selectable/resizable) |

Code examples / documentation:
| File | Line | Context |
|------|------|---------|
| `demo/components/datatable.html` | 326 | `<td><code>data-table</code></td>` |
| `demo/components/datatable.html` | 486 | `<pre><code>&lt;div data-table data-table-sortable=...` |
| `demo/components/datatable.html` | 510 | `<pre><code>&lt;div data-table` |
| `demo/components/datatable.html` | 531 | `<pre><code>&lt;div data-table` |
| `demo/components/datatable.html` | 546 | `<pre><code>&lt;div data-table` |
| `demo/components/datatable.html` | 561 | `<pre><code>&lt;div data-table` |
| `demo/components/datatable.html` | 583 | `document.querySelector('[data-table]')` |

### includes/
No occurrences.

---

## 6. `data-quiz` (bare) → `data-mini-quiz`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Live bare `data-quiz` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/mini-quiz.html` | 85 | `<div data-quiz data-quiz-title="Quick True/False">` |
| `demo/components/mini-quiz.html` | 133 | `<div data-quiz` (inline JSON) |
| `demo/components/mini-quiz.html` | 187 | `<div data-quiz` (external JSON) |
| `demo/components/mini-quiz.html` | 201 | `<div data-quiz` (CSV data) |
| `demo/components/mini-quiz.html` | 219 | `<div data-quiz` (shuffle) |
| `demo/components/mini-quiz.html` | 294 | `<div data-quiz data-quiz-title="Solar System">` |
| `demo/components/mini-quiz.html` | 313 | `<div data-quiz` (matching pairs) |
| `demo/components/mini-quiz.html` | 337 | `<div data-quiz data-quiz-title="Animal Classification">` |
| `demo/components/mini-quiz.html` | 360 | `<div data-quiz` (mixed drag JSON) |
| `demo/components/mini-quiz.html` | 373 | `<div data-quiz` (require-attempt) |

Code examples / documentation:
| File | Line | Context |
|------|------|---------|
| `demo/components/mini-quiz.html` | 490 | `<td><code>data-quiz</code></td>` |
| `demo/components/mini-quiz.html` | 661 | `<pre><code>&lt;div data-quiz data-quiz-title=...` |
| `demo/components/mini-quiz.html` | 680 | `<pre><code>&lt;div data-quiz` |
| `demo/components/mini-quiz.html` | 706 | `<pre><code>&lt;div data-quiz` |

### includes/
No occurrences.

---

## 7. `data-multislider` (bare) → `data-multi-slider`

### LESS (src/css/)
| File | Line | Context |
|------|------|---------|
| `src/css/battersea-slider-multi-item.less` | 5 | `[data-multislider] {` |
| `src/css/battersea-slider-multi-item.less` | 9 | `[data-multislider-track] {` |
| `src/css/battersea-slider-multi-item.less` | 14 | `[data-multislider-item] {` |
| `src/css/battersea-slider-multi-item.less` | 19 | `[data-multislider-prev],` |
| `src/css/battersea-slider-multi-item.less` | 20 | `[data-multislider-next] {` |
| `src/css/battersea-slider-multi-item.less` | 47 | `[data-multislider-prev] {` |
| `src/css/battersea-slider-multi-item.less` | 56 | `[data-multislider-next] {` |

### HTML (demo/)
Live bare `data-multislider` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/multislider.html` | 85 | `<div data-multislider data-multislider-items="4" ...>` |
| `demo/components/multislider.html` | 140 | `<div data-multislider data-multislider-items="3" ...>` |
| `demo/components/multislider.html` | 185 | `<div data-multislider data-multislider-items="3" ... data-multislider-autoplay="true" ...>` |

Structural sub-attributes on child elements (also need renaming):
- `data-multislider-track`: lines 86, 141, 186
- `data-multislider-item`: lines 87, 92, 97, 102, 107, 112, 117, 122, 142, 147, 152, 157, 162, 167, 187, 192, 197, 202, 207, 212
- `data-multislider-prev`: lines 128, 173, 218
- `data-multislider-next`: lines 129, 174, 219

Code examples / documentation (extensive — lines 299-496 contain attribute tables and code snippets).

### includes/
No occurrences.

---

## 8. `data-progress-nested` → `data-nested-progress`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Live bare `data-progress-nested` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/nestedprogress.html` | 86 | `<div data-progress-nested` |
| `demo/components/nestedprogress.html` | 101 | `<div data-progress-nested` |
| `demo/components/nestedprogress.html` | 117 | `<div data-progress-nested` |
| `demo/components/nestedprogress.html` | 134 | `<div data-progress-nested` |

Code examples / documentation:
| File | Line | Context |
|------|------|---------|
| `demo/components/nestedprogress.html` | 219 | `<td><code>data-progress-nested</code></td>` |
| `demo/components/nestedprogress.html` | 292 | `<pre><code>&lt;div data-progress-nested` |
| `demo/components/nestedprogress.html` | 309 | `<pre><code>&lt;div data-progress-nested` |
| `demo/components/nestedprogress.html` | 327 | `<pre><code>&lt;div data-progress-nested` |
| `demo/components/nestedprogress.html` | 346 | `&lt;div data-progress-nested` |
| `demo/components/nestedprogress.html` | 355 | `&lt;div data-progress-nested` |

### includes/
No occurrences.

**Note:** Sub-attributes `data-progress-circles`, `data-progress-title`, `data-progress-legend`, `data-progress-duration` share the `data-progress-` prefix with the ProgressBar component. Renaming `data-progress-nested` to `data-nested-progress` would also mean renaming its sub-attributes (e.g. `data-progress-circles` → `data-nested-progress-circles`), or establishing a new prefix convention.

---

## 9. `data-pagenav` (bare) → `data-page-nav`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Appears once per demo page (34 pages including index) as `<div data-pagenav data-pagenav-mode="pages" ...></div>`, plus extra uses on pagenav.html.

Standard placement (one per page):
| File | Line |
|------|------|
| `demo/index.html` | 936 |
| `demo/components/accordion.html` | 784 |
| `demo/components/accessibility.html` | 380 |
| `demo/components/animation.html` | 523 |
| `demo/components/audioplayer.html` | 457 |
| `demo/components/breadcrumbs.html` | 395 |
| `demo/components/counter.html` | 230 |
| `demo/components/datatable.html` | 707 |
| `demo/components/dragdrop.html` | 443 |
| `demo/components/flipbox.html` | 185 |
| `demo/components/formelements.html` | 710 |
| `demo/components/formvalidation.html` | 731 |
| `demo/components/graph.html` | 896 |
| `demo/components/header.html` | 565 |
| `demo/components/horizontalnav.html` | 587 |
| `demo/components/imagegallery.html` | 593 |
| `demo/components/mini-quiz.html` | 826 |
| `demo/components/multislider.html` | 551 |
| `demo/components/nestedprogress.html` | 433 |
| `demo/components/pagination.html` | 623 |
| `demo/components/parallax.html` | 390 |
| `demo/components/popup.html` | 454 |
| `demo/components/profilegrid.html` | 608 |
| `demo/components/progressbar.html` | 448 |
| `demo/components/slider.html` | 516 |
| `demo/components/smoothscroll.html` | 452 |
| `demo/components/tabs.html` | 573 |
| `demo/components/timeline.html` | 567 |
| `demo/components/tooltip.html` | 415 |
| `demo/components/verticalnav.html` | 1139 |
| `demo/components/videobg.html` | 425 |
| `demo/components/videoplayer.html` | 455 |

Additional live HTML on pagenav.html:
| File | Line | Context |
|------|------|---------|
| `demo/components/pagenav.html` | 84 | `<div data-pagenav data-pagenav-mode="pages" ...>` |
| `demo/components/pagenav.html` | 93 | `<div data-pagenav data-pagenav-mode="category" ...>` |
| `demo/components/pagenav.html` | 102 | `<div data-pagenav data-pagenav-mode="categories">` |
| `demo/components/pagenav.html` | 111 | `<div data-pagenav data-pagenav-show-title="false">` |
| `demo/components/pagenav.html` | 440 | `<div data-pagenav ...>` (page's own nav) |

Code examples / documentation on pagenav.html:
| File | Line | Context |
|------|------|---------|
| `demo/components/pagenav.html` | 184 | `<td><code>data-pagenav</code></td>` |
| `demo/components/pagenav.html` | 307 | `<pre><code>&lt;div data-pagenav&gt;` |
| `demo/components/pagenav.html` | 317 | `<pre><code>&lt;div data-pagenav data-pagenav-mode=...` |
| `demo/components/pagenav.html` | 327 | `<pre><code>&lt;div data-pagenav` |
| `demo/components/pagenav.html` | 340 | `<pre><code>&lt;div data-pagenav data-pagenav-show-title=...` |

### includes/
No occurrences.

---

## 10. `data-progress` (bare) → `data-progress-bar`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Live bare `data-progress` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/progressbar.html` | 86 | `<div data-progress data-progress-type="horizontal" ...>` |
| `demo/components/progressbar.html` | 87 | `<div data-progress data-progress-type="horizontal" ...>` |
| `demo/components/progressbar.html` | 88 | `<div data-progress data-progress-type="horizontal" ...>` |
| `demo/components/progressbar.html` | 89 | `<div data-progress data-progress-type="horizontal" ...>` |
| `demo/components/progressbar.html` | 101 | `<div data-progress data-progress-type="horizontal" ...>` |
| `demo/components/progressbar.html` | 102 | `<div data-progress data-progress-type="horizontal" ...>` |
| `demo/components/progressbar.html` | 103 | `<div data-progress data-progress-type="horizontal" ...>` |
| `demo/components/progressbar.html` | 115 | `<div data-progress data-progress-type="circular" ...>` |
| `demo/components/progressbar.html` | 116 | `<div data-progress data-progress-type="circular" ...>` |
| `demo/components/progressbar.html` | 117 | `<div data-progress data-progress-type="circular" ...>` |
| `demo/components/progressbar.html` | 118 | `<div data-progress data-progress-type="circular" ...>` |
| `demo/components/progressbar.html` | 130 | `<div data-progress data-progress-type="circular" ...>` |
| `demo/components/progressbar.html` | 131 | `<div data-progress data-progress-type="circular" ...>` |
| `demo/components/progressbar.html` | 132 | `<div data-progress data-progress-type="circular" ...>` |
| `demo/index.html` | 667 | `<div data-progress data-progress-animated="true" ...>` |
| `demo/index.html` | 674 | `<div data-progress data-progress-animated="true" ...>` |
| `demo/index.html` | 681 | `<div data-progress data-progress-animated="true" ...>` |
| `demo/index.html` | 688 | `<div data-progress data-progress-animated="true" ...>` |

Code examples / documentation:
| File | Line | Context |
|------|------|---------|
| `demo/components/progressbar.html` | 212 | `<td><code>data-progress</code></td>` |
| `demo/components/progressbar.html` | 266-281 | Code example blocks |
| `demo/components/progressbar.html` | 304-322 | Code example blocks |
| `demo/components/progressbar.html` | 333-346 | Code example blocks |
| `demo/components/progressbar.html` | 357-362 | Code example block |
| `demo/components/progressbar.html` | 374 | `[data-progress] .battersea-progress__fill {` (CSS example) |
| `demo/components/progressbar.html` | 379 | `[data-progress] .battersea-progress__track {` (CSS example) |
| `demo/components/progressbar.html` | 385 | `[data-progress] .battersea-progress__percent {` (CSS example) |
| `demo/components/progressbar.html` | 392 | `[data-progress] .battersea-progress__circle-fill {` (CSS example) |

### includes/
No occurrences.

**Note:** The sub-attributes `data-progress-type`, `data-progress-value`, `data-progress-label`, etc. share the same `data-progress-` prefix as the NestedProgress sub-attributes. Renaming `data-progress` (bare) to `data-progress-bar` means the sub-attributes become `data-progress-bar-type`, `data-progress-bar-value`, etc. — or a new naming scheme is needed.

---

## 11. `data-smoothscroll` (bare) → `data-smooth-scroll`

### LESS (src/css/)
No occurrences.

### HTML (demo/)
Appears once per demo page (34 pages including index), plus extra uses on smoothscroll.html.

Standard placement (one per page):
| File | Line |
|------|------|
| `demo/index.html` | 1055 |
| `demo/components/accordion.html` | 792 |
| `demo/components/accessibility.html` | 388 |
| `demo/components/animation.html` | 531 |
| `demo/components/audioplayer.html` | 465 |
| `demo/components/breadcrumbs.html` | 403 |
| `demo/components/counter.html` | 235 |
| `demo/components/datatable.html` | 715 |
| `demo/components/dragdrop.html` | 451 |
| `demo/components/flipbox.html` | 190 |
| `demo/components/formelements.html` | 718 |
| `demo/components/formvalidation.html` | 739 |
| `demo/components/graph.html` | 904 |
| `demo/components/header.html` | 573 |
| `demo/components/horizontalnav.html` | 595 |
| `demo/components/imagegallery.html` | 601 |
| `demo/components/mini-quiz.html` | 834 |
| `demo/components/multislider.html` | 559 |
| `demo/components/nestedprogress.html` | 441 |
| `demo/components/pagenav.html` | 448 |
| `demo/components/pagination.html` | 631 |
| `demo/components/parallax.html` | 398 |
| `demo/components/popup.html` | 462 |
| `demo/components/profilegrid.html` | 616 |
| `demo/components/progressbar.html` | 456 |
| `demo/components/slider.html` | 524 |
| `demo/components/smoothscroll.html` | 460 |
| `demo/components/tabs.html` | 581 |
| `demo/components/timeline.html` | 575 |
| `demo/components/tooltip.html` | 423 |
| `demo/components/verticalnav.html` | 1147 |
| `demo/components/videobg.html` | 433 |
| `demo/components/videoplayer.html` | 463 |

Code examples / documentation on smoothscroll.html:
| File | Line | Context |
|------|------|---------|
| `demo/components/smoothscroll.html` | 120 | `<pre><code>&lt;div data-smoothscroll` |
| `demo/components/smoothscroll.html` | 206 | `<td><code>data-smoothscroll</code></td>` |
| `demo/components/smoothscroll.html` | 318 | `&lt;div data-smoothscroll` |
| `demo/components/smoothscroll.html` | 337 | `&lt;div data-smoothscroll` |
| `demo/components/smoothscroll.html` | 352 | `<pre><code>&lt;div data-smoothscroll` |
| `demo/components/smoothscroll.html` | 366 | `document.querySelector('[data-smoothscroll]')` |
| `demo/components/smoothscroll.html` | 387-396 | Multiple `data-smoothscroll` code examples |

### includes/
No occurrences.

---

## 12. `data-videobg` (bare) → `data-video-bg`

### LESS (src/css/)
| File | Line | Context |
|------|------|---------|
| `src/css/battersea-videobg.less` | 6 | `[data-videobg] {` |

### HTML (demo/)
Live bare `data-videobg` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/videobg.html` | 85 | `<div data-videobg` |
| `demo/components/videobg.html` | 98 | `<div data-videobg` |
| `demo/components/videobg.html` | 116 | `<div data-videobg` |
| `demo/components/videobg.html` | 134 | `<div data-videobg` |

Code examples / documentation:
| File | Line | Context |
|------|------|---------|
| `demo/components/videobg.html` | 222 | `<td><code>data-videobg</code></td>` |
| `demo/components/videobg.html` | 257 | `<pre><code>&lt;div data-videobg` |
| `demo/components/videobg.html` | 266 | `<pre><code>&lt;div data-videobg` |
| `demo/components/videobg.html` | 302 | `<pre><code>&lt;section data-videobg` |
| `demo/components/videobg.html` | 328 | `&lt;div data-videobg` |
| `demo/components/videobg.html` | 346 | `<pre><code>&lt;div data-videobg` |
| `demo/components/videobg.html` | 367 | `<pre><code>&lt;div data-videobg` |

### includes/
No occurrences.

---

## 13. `data-video` (bare) → `data-video-player`

### LESS (src/css/)
No occurrences (no `[data-video]` selector in any LESS file).

### HTML (demo/)
Live bare `data-video` attributes on elements:
| File | Line | Context |
|------|------|---------|
| `demo/components/videoplayer.html` | 86 | `data-video` (on `<div>`) |
| `demo/components/videoplayer.html` | 99 | `data-video` (on `<div>`) |
| `demo/components/videoplayer.html` | 115 | `data-video` (on `<div>`) |

Code examples / documentation:
| File | Line | Context |
|------|------|---------|
| `demo/components/videoplayer.html` | 200 | `<td><code>data-video</code></td>` |
| `demo/components/videoplayer.html` | 277 | `<pre><code>&lt;div data-video data-video-src=...` |
| `demo/components/videoplayer.html` | 348 | `data-video-src="path/to/clip.mp4"&gt;` |
| `demo/components/videoplayer.html` | 360 | `data-video-src=...` |
| `demo/components/videoplayer.html` | 375 | `data-video-src=...` |
| `demo/components/videoplayer.html` | 389 | `document.querySelector('[data-video]')` |

### includes/
No occurrences.

---

## Summary

| # | Old Attribute | New Attribute | LESS Files | HTML Live | HTML Docs/Code | Total Files |
|---|--------------|---------------|------------|-----------|----------------|-------------|
| 1 | `data-animate` | `data-animation` | 1 | 33 demo + index | 1 (animation.html) | 34 |
| 2 | `data-audio` | `data-audio-player` | 0 | 1 (audioplayer.html) | 1 (audioplayer.html) | 1 |
| 3 | `data-backtotop` | `data-back-to-top` | 0 | 33 demo + index | 0 | 34 |
| 4 | `data-breadcrumb` | `data-breadcrumbs` | 0 | 33 demo (31 standard + breadcrumbs.html extras) | 1 (breadcrumbs.html) | 31 |
| 5 | `data-table` | `data-datatable` | 0 | 1 (datatable.html) | 1 (datatable.html) | 1 |
| 6 | `data-quiz` | `data-mini-quiz` | 0 | 1 (mini-quiz.html) | 1 (mini-quiz.html) | 1 |
| 7 | `data-multislider` | `data-multi-slider` | 1 | 1 (multislider.html) | 1 (multislider.html) | 2 |
| 8 | `data-progress-nested` | `data-nested-progress` | 0 | 1 (nestedprogress.html) | 1 (nestedprogress.html) | 1 |
| 9 | `data-pagenav` | `data-page-nav` | 0 | 34 demo + index (+4 extra on pagenav.html) | 1 (pagenav.html) | 34 |
| 10 | `data-progress` | `data-progress-bar` | 0 | 2 (progressbar.html + index.html) | 1 (progressbar.html) | 2 |
| 11 | `data-smoothscroll` | `data-smooth-scroll` | 0 | 34 demo + index | 1 (smoothscroll.html) | 34 |
| 12 | `data-videobg` | `data-video-bg` | 1 | 1 (videobg.html) | 1 (videobg.html) | 2 |
| 13 | `data-video` | `data-video-player` | 0 | 1 (videoplayer.html) | 1 (videoplayer.html) | 1 |

### Highest impact (appear on every demo page):
- `data-animate` — 691 occurrences across 34 files
- `data-smoothscroll` — 34 files (one instance per page + extras on smoothscroll.html)
- `data-backtotop` — 34 files (one instance per page)
- `data-pagenav` — 34 files (one instance per page + extras on pagenav.html)
- `data-breadcrumb` — 31 files (one instance per page + extras on breadcrumbs.html)

### LESS files needing changes:
- `src/css/battersea-animation.less` — `[data-animate]` on line 6
- `src/css/battersea-slider-multi-item.less` — `[data-multislider]` and sub-selectors (7 occurrences)
- `src/css/battersea-videobg.less` — `[data-videobg]` on line 6

### No matches found in `includes/` directory for any of the 13 attributes.

### Sub-attribute naming concerns:
1. **data-progress / data-progress-nested** share the `data-progress-` prefix for sub-attributes. Renaming both will require careful prefix management.
2. **data-multislider** has structural child selectors (`-track`, `-item`, `-prev`, `-next`) in both HTML and LESS that all need renaming.
3. **data-animate** has `data-animate-children` sub-attribute that would need renaming to `data-animation-children`.

---

*Generated: 22 February 2026*
