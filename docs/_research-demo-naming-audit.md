# Demo Page Naming Audit

Audit of all HTML files in `demo/components/` for naming consistency across filenames, page titles, data attributes, and structural patterns.

Date: 22 February 2026

---

## 1. Per-Page Audit

### Summary Table

| # | Filename | Page Title | JS File | Registration Selector | Consistent? |
|---|----------|------------|---------|----------------------|-------------|
| 1 | `accessibility.html` | Accessibility Component | `battersea-accessibility.js` | `[data-accessibility]` | YES |
| 2 | `accordion.html` | Accordion Component | `battersea-accordion.js` | `[data-accordion]` | YES |
| 3 | `animation.html` | Animation Component | `battersea-animation.js` | `[data-animate]` | YES |
| 4 | `audioplayer.html` | Audio Player Component | `battersea-audioplayer.js` | `[data-audio]` | PARTIAL - see notes |
| 5 | `breadcrumbs.html` | Breadcrumbs Component | `battersea-breadcrumbs.js` | `[data-breadcrumb]` | PARTIAL - see notes |
| 6 | `counter.html` | Counter Component | `battersea-counter.js` | `[data-counter]` | YES |
| 7 | `datatable.html` | DataTable Component | `battersea-datatable.js` | `[data-table]` | PARTIAL - see notes |
| 8 | `dragdrop.html` | DragDrop Component | `battersea-dragdrop.js` | `[data-drag-drop]` | PARTIAL - see notes |
| 9 | `flipbox.html` | Flipbox Component | `battersea-flipbox.js` | `[data-flipbox]` | YES |
| 10 | `formelements.html` | Form Elements Component | `battersea-form-elements.js` | `[data-form-elements]` | PARTIAL - see notes |
| 11 | `formvalidation.html` | Form Validation Component | `battersea-form-validation.js` | `[data-form-validation]` | PARTIAL - see notes |
| 12 | `graph.html` | Graph Component | `battersea-graph.js` | `[data-graph]` | YES |
| 13 | `header.html` | Header Component | `battersea-header.js` | `[data-header]` | YES |
| 14 | `horizontalnav.html` | HorizontalNav Component | `battersea-horizontalnav.js` | `[data-horizontal-nav]` | PARTIAL - see notes |
| 15 | `imagegallery.html` | Image Gallery Component | `battersea-imagegallery.js` | `[data-image-gallery]` | PARTIAL - see notes |
| 16 | `mini-quiz.html` | Mini Quiz Component | `battersea-mini-quiz.js` | `[data-quiz]` | PARTIAL - see notes |
| 17 | `multislider.html` | MultiSlider Component | `battersea-multislider.js` | `[data-multislider]` | YES |
| 18 | `nestedprogress.html` | NestedProgress Component | `battersea-nestedprogress.js` | `[data-progress-nested]` | PARTIAL - see notes |
| 19 | `pagenav.html` | Page Navigation Component | `battersea-pagenav.js` | `[data-pagenav]` | PARTIAL - see notes |
| 20 | `pagination.html` | Pagination Component | `battersea-pagination.js` | `[data-pagination]` | YES |
| 21 | `parallax.html` | Parallax Component | `battersea-parallax.js` | `[data-parallax]` | YES |
| 22 | `popup.html` | Popup Component | `battersea-popup.js` | `[data-popup]` | YES |
| 23 | `profilegrid.html` | Profile Grid Component | `battersea-profilegrid.js` | `[data-profile-grid]` | PARTIAL - see notes |
| 24 | `progressbar.html` | ProgressBar Component | `battersea-progressbar.js` | `[data-progress]` | PARTIAL - see notes |
| 25 | `slider.html` | Slider Component | `battersea-slider.js` | `[data-slider]` | YES |
| 26 | `smoothscroll.html` | SmoothScroll Component | `battersea-smoothscroll.js` | `[data-smoothscroll]` | YES |
| 27 | `tabs.html` | Tabs Component | `battersea-tabs.js` | `[data-tabs]` | YES |
| 28 | `timeline.html` | Timeline Component | `battersea-timeline.js` | `[data-timeline]` | YES |
| 29 | `tooltip.html` | Tooltip Component | `battersea-tooltip.js` | `[data-tooltip]` | YES |
| 30 | `verticalnav.html` | Vertical Navigation Component | `battersea-verticalnav.js` | `[data-vertical-nav]` | PARTIAL - see notes |
| 31 | `videobg.html` | Video Background Component | `battersea-videobg.js` | `[data-videobg]` | PARTIAL - see notes |
| 32 | `videoplayer.html` | Video Player Component | `battersea-videoplayer.js` | `[data-video]` | PARTIAL - see notes |

---

## 2. Naming Inconsistencies Identified

### A. Filename vs JS File Naming Mismatches

These demo filenames do not directly match the JS file name pattern (`battersea-[name].js`):

| Demo Filename | JS Filename | Mismatch |
|--------------|-------------|----------|
| `formelements.html` | `battersea-form-elements.js` | Demo is one word, JS uses hyphen |
| `formvalidation.html` | `battersea-form-validation.js` | Demo is one word, JS uses hyphen |
| `mini-quiz.html` | `battersea-mini-quiz.js` | Consistent (both hyphenated) |
| `videobg.html` | `battersea-videobg.js` | Consistent, but abbreviation |

### B. Page Title vs Filename Inconsistencies

Most pages follow "ComponentName Component - Battersea Library", but the title naming style varies:

| Filename | Title Format | Notes |
|----------|-------------|-------|
| `audioplayer.html` | "Audio Player Component" | Two words in title, one word filename |
| `breadcrumbs.html` | "Breadcrumbs Component" | Consistent |
| `datatable.html` | "DataTable Component" | PascalCase in title, lowercase filename |
| `dragdrop.html` | "DragDrop Component" | PascalCase in title, lowercase filename |
| `formelements.html` | "Form Elements Component" | Two words in title, one word filename |
| `formvalidation.html` | "Form Validation Component" | Two words in title, one word filename |
| `horizontalnav.html` | "HorizontalNav Component" | PascalCase in title, lowercase filename |
| `imagegallery.html` | "Image Gallery Component" | Two words in title, one word filename |
| `mini-quiz.html` | "Mini Quiz Component" | Two words in title, hyphenated filename |
| `multislider.html` | "MultiSlider Component" | PascalCase in title, lowercase filename |
| `nestedprogress.html` | "NestedProgress Component" | PascalCase in title, lowercase filename |
| `pagenav.html` | "Page Navigation Component" | Two words in title, abbreviated filename |
| `profilegrid.html` | "Profile Grid Component" | Two words in title, one word filename |
| `progressbar.html` | "ProgressBar Component" | PascalCase in title, lowercase filename |
| `smoothscroll.html` | "SmoothScroll Component" | PascalCase in title, lowercase filename |
| `verticalnav.html` | "Vertical Navigation Component" | Full words in title, abbreviated filename |
| `videobg.html` | "Video Background Component" | Full words in title, abbreviated filename |
| `videoplayer.html` | "Video Player Component" | Two words in title, one word filename |

**Pattern observed**: Titles use readable English (spaces, full words), filenames use concatenated lowercase. This is acceptable and common, but there is no single consistent rule for whether the title uses PascalCase (e.g. "DataTable") or spaced words (e.g. "Data Table"). The split is roughly:

- **PascalCase titles**: DataTable, DragDrop, HorizontalNav, MultiSlider, NestedProgress, ProgressBar, SmoothScroll
- **Spaced word titles**: Audio Player, Form Elements, Form Validation, Image Gallery, Mini Quiz, Page Navigation, Profile Grid, Vertical Navigation, Video Background, Video Player

### C. Data Attribute vs Filename Inconsistencies

Several data attributes do not directly match the demo filename:

| Demo Filename | Data Attribute | JS Filename Stem | Notes |
|--------------|---------------|-----------------|-------|
| `audioplayer.html` | `data-audio` | `audioplayer` | Attribute shorter than filename |
| `videoplayer.html` | `data-video` | `videoplayer` | Attribute shorter than filename |
| `videobg.html` | `data-videobg` | `videobg` | Consistent |
| `datatable.html` | `data-table` | `datatable` | Attribute shorter than filename |
| `dragdrop.html` | `data-drag-drop` | `dragdrop` | Attribute hyphenated, filename concatenated |
| `horizontalnav.html` | `data-horizontal-nav` | `horizontalnav` | Attribute hyphenated, filename concatenated |
| `imagegallery.html` | `data-image-gallery` | `imagegallery` | Attribute hyphenated, filename concatenated |
| `nestedprogress.html` | `data-progress-nested` | `nestedprogress` | Different word order + hyphenated |
| `profilegrid.html` | `data-profile-grid` | `profilegrid` | Attribute hyphenated, filename concatenated |
| `progressbar.html` | `data-progress` | `progressbar` | Attribute much shorter than filename |
| `verticalnav.html` | `data-vertical-nav` | `verticalnav` | Attribute hyphenated, filename concatenated |
| `formelements.html` | `data-form-elements` | `form-elements` | Attribute hyphenated, filename concatenated |
| `formvalidation.html` | `data-form-validation` | `form-validation` | Attribute hyphenated, filename concatenated |
| `breadcrumbs.html` | `data-breadcrumb` | `breadcrumbs` | Attribute is singular, filename is plural |
| `mini-quiz.html` | `data-quiz` | `mini-quiz` | Attribute much shorter than filename |
| `pagenav.html` | `data-pagenav` | `pagenav` | Consistent |
| `animation.html` | `data-animate` | `animation` | Attribute is verb, filename is noun |

### D. Hyphenation Inconsistency in Data Attributes

Multi-word data attributes are inconsistent about hyphenation:

- **Hyphenated**: `data-drag-drop`, `data-horizontal-nav`, `data-vertical-nav`, `data-image-gallery`, `data-profile-grid`, `data-progress-nested`, `data-form-validation`, `data-form-elements`
- **Concatenated**: `data-multislider`, `data-smoothscroll`, `data-flipbox`, `data-datatable` (actually `data-table`), `data-videobg`, `data-pagenav`, `data-backtotop`

---

## 3. demo/index.html Component Listing

The homepage lists 32 components in 4 categories. Observations:

### Link Targets
All links use the format `components/[filename].html` and are consistent with actual filenames.

### Display Names on Homepage vs Page Titles

| Homepage Card Name | Page Title Name | Match? |
|-------------------|----------------|--------|
| Header | Header Component | YES |
| Horizontal Nav | HorizontalNav Component | NO - spaced vs PascalCase |
| Vertical Nav | Vertical Navigation Component | NO - abbreviated vs full |
| SmoothScroll | SmoothScroll Component | YES |
| Tabs | Tabs Component | YES |
| Breadcrumbs | Breadcrumbs Component | YES |
| Page Navigation | Page Navigation Component | YES |
| Accordion | Accordion Component | YES |
| Slider | Slider Component | YES |
| MultiSlider | MultiSlider Component | YES |
| Image Gallery | Image Gallery Component | YES |
| Audio Player | Audio Player Component | YES |
| Video Player | Video Player Component | YES |
| Video Background | Video Background Component | YES |
| DataTable | DataTable Component | YES |
| Graph | Graph Component | YES |
| Progress Bar | ProgressBar Component | NO - spaced vs PascalCase |
| Nested Progress | NestedProgress Component | NO - spaced vs PascalCase |
| Counter | Counter Component | YES |
| Tooltip | Tooltip Component | YES |
| Popup/Modal | Popup Component | NO - homepage adds "/Modal" |
| DragDrop | DragDrop Component | YES |
| Timeline | Timeline Component | YES |
| Profile Grid | Profile Grid Component | YES |
| Flipbox | Flipbox Component | YES |
| Animation | Animation Component | YES |
| Parallax | Parallax Component | YES |
| Accessibility | Accessibility Component | YES |
| Form Validation | Form Validation Component | YES |
| Form Elements | Form Elements Component | YES |
| Mini Quiz | Mini Quiz Component | YES |

### Missing from Homepage
The following components have no showcase card on the homepage:
- **Pagination** - has a demo page (`pagination.html`) but not listed on homepage
- **BackToTop** - present on pages via `data-backtotop` but no dedicated demo page or homepage listing

### Components with demo pages but no homepage card
- `pagination.html` - not listed on homepage

### Homepage Component Count
The homepage says "32 Production-Ready Components" but actually lists 31 cards (excluding Pagination). The counter widget also shows 32.

---

## 4. includes/ Folder Naming Patterns

| Include File | Naming Pattern | Notes |
|-------------|---------------|-------|
| `demo-header-component.html` | `demo-` prefix | Contains header brand + nav placeholder |
| `demo-nav.html` | `demo-` prefix | Navigation menu links |
| `demo-footer.html` | `demo-` prefix | Footer HTML + scripts |
| `preHeader.html` | camelCase, no `demo-` prefix | INCONSISTENT with other includes |

**Issue**: `preHeader.html` uses camelCase while all other includes use kebab-case with a `demo-` prefix. Should arguably be `demo-pre-header.html` for consistency.

---

## 5. Demo Navigation (demo-nav.html) vs Demo Pages

The navigation organises pages into 6 categories. All 32 demo pages are linked. The `data-nav-link` values in the nav match the following pattern:

| Nav Link ID | Demo Filename | Match? |
|-------------|---------------|--------|
| `home` | `index.html` | YES |
| `header` | `header.html` | YES |
| `horizontalnav` | `horizontalnav.html` | YES |
| `verticalnav` | `verticalnav.html` | YES |
| `breadcrumbs` | `breadcrumbs.html` | YES |
| `pagenav` | `pagenav.html` | YES |
| `audioplayer` | `audioplayer.html` | YES |
| `videoplayer` | `videoplayer.html` | YES |
| `imagegallery` | `imagegallery.html` | YES |
| `parallax` | `parallax.html` | YES |
| `videobg` | `videobg.html` | YES |
| `slider` | `slider.html` | YES |
| `multislider` | `multislider.html` | YES |
| `profilegrid` | `profilegrid.html` | YES |
| `accordion` | `accordion.html` | YES |
| `counter` | `counter.html` | YES |
| `flipbox` | `flipbox.html` | YES |
| `popup` | `popup.html` | YES |
| `tabs` | `tabs.html` | YES |
| `tooltip` | `tooltip.html` | YES |
| `dragdrop` | `dragdrop.html` | YES |
| `formvalidation` | `formvalidation.html` | YES |
| `formelements` | `formelements.html` | YES |
| `miniquiz` | `mini-quiz.html` | NO - nav link is `miniquiz`, filename uses hyphen |
| `progressbar` | `progressbar.html` | YES |
| `nestedprogress` | `nestedprogress.html` | YES |
| `timeline` | `timeline.html` | YES |
| `datatable` | `datatable.html` | YES |
| `graph` | `graph.html` | YES |
| `pagination` | `pagination.html` | YES |
| `accessibility` | `accessibility.html` | YES |
| `animation` | `animation.html` | YES |
| `smoothscroll` | `smoothscroll.html` | YES |

**Issue**: The `data-nav-link` for Mini Quiz is `miniquiz` (no hyphen) but the filename is `mini-quiz.html` (with hyphen).

---

## 6. HTML Structure Pattern Check

### Standard Demo Page Structure

The majority of demo pages follow this structure:

```
<!DOCTYPE html>
<head>
  <title>[Name] Component - Battersea Library</title>
  <meta description>
  LESS stylesheets
  LESS.js config (verbose)
  less@4.2.0 CDN
  battersea-env-config.js
  Google Fonts import
</head>
<body>
  #site-background div
  #demo-preheader-placeholder
  <header> with data-header attributes (multi-line)
  <div class="content-outer">
    data-breadcrumb div
    Hero section (h1 with component name)
    Live demos section
    Features/configuration section(s)
    Code examples section
    data-pagenav div
  </div>
  data-smoothscroll div
  data-backtotop div
  JS script tags
  Include loader script
</body>
```

### Structural Variations

**Compact head format** (counter.html, flipbox.html):
- These two pages use a more compact `<head>` format with the LESS config on a single line instead of the verbose multi-line format used by all other pages.
- The header element is also on a single line instead of being spread across multiple lines with individual data attributes.

**All other pages** use the verbose multi-line format consistently.

### Common Elements Present on All Demo Pages

| Element | Present on all 32? |
|---------|-------------------|
| `data-breadcrumb` div | YES |
| `data-pagenav` with `data-pagenav-mode="pages"` | YES |
| `data-smoothscroll` div | YES |
| `data-backtotop` div | YES |
| Hero section with h1 | YES |
| `#site-background` div | YES |
| `#demo-preheader-placeholder` div | YES |
| Include loader script | YES |

---

## 7. Key Findings Summary

### Issues to Consider Fixing

1. **Homepage missing Pagination card** - `pagination.html` exists as a demo page and is in the nav, but has no showcase card on the homepage. The homepage claims 32 components but only shows 31 cards.

2. **`preHeader.html` naming** - Uses camelCase while all other includes use kebab-case with `demo-` prefix.

3. **Mini Quiz nav link mismatch** - `data-nav-link="miniquiz"` but filename is `mini-quiz.html`.

4. **Title inconsistency** - Some titles use PascalCase (DataTable, ProgressBar, SmoothScroll) while others use spaced words (Audio Player, Video Player, Profile Grid). No single rule is followed.

5. **Homepage "Popup/Modal" vs page title "Popup"** - The homepage card says "Popup/Modal" but the page title is just "Popup Component".

6. **Horizontal Nav** - Homepage card says "Horizontal Nav" (spaced) but page title says "HorizontalNav Component" (PascalCase).

7. **Progress Bar** - Homepage card says "Progress Bar" (spaced) but page title says "ProgressBar Component" (PascalCase).

8. **Nested Progress** - Homepage card says "Nested Progress" (spaced) but page title says "NestedProgress Component" (PascalCase).

### Things That Are Consistent

- All demo filenames are lowercase (with one exception: `mini-quiz.html` uses a hyphen)
- All page titles end with "Component - Battersea Library"
- All demo pages include the same boilerplate (breadcrumbs, page nav, smooth scroll, back-to-top)
- All nav links point to correct file paths
- JS filenames consistently use `battersea-[name].js` pattern
- All demo pages load the same core scripts and include system

### Non-Issues (Acceptable Patterns)

- Data attributes using hyphens vs filenames being concatenated is a standard HTML convention (data attributes use kebab-case for readability)
- Data attributes being shorter than component names (e.g. `data-audio` vs `audioplayer`) is fine for developer ergonomics
- Two formatting styles in `<head>` (compact vs verbose) is cosmetic only
