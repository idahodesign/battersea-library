# Battersea Library - Accessibility Audit

Audit of all 34 component JS files for keyboard navigation, ARIA attributes, focus management, and screen reader support.

Date: 8 March 2026

---

## Summary

| Rating | Count | Components |
|--------|-------|------------|
| Pass | 10 | AudioPlayer, Breadcrumbs, DataTable, FormValidation, ImageGallery, Pagination, SmoothScroll, VideoPlayer, Accessibility, Share |
| Partial | 13 | Accordion, BackToTop, FormElements, Header, HorizontalNav, HorizontalScroll, MiniQuiz, MultiSlider, Slider, Timeline, Tooltip, VerticalNav, ProfileGrid |
| Needs Work | 11 | Animation, Counter, DragDrop, Flipbox, Graph, NestedProgress, PageNav, Parallax, Popup, ProgressBar, Tabs, VideoBg |

---

## Component Audits

### 1. Accordion
- **Keyboard**: Click handlers on headers only -- no keydown listener, no tabindex set on headers. Headers are `<div>` elements, so they are not focusable or activatable by keyboard.
- **ARIA**: None. No `aria-expanded`, no `role="button"` on headers, no `aria-controls` linking header to content, no `aria-hidden` on collapsed content.
- **Focus**: No focus management.
- **Screen reader**: No state announcements.
- **Gaps**: Headers need `tabindex="0"`, `role="button"`, Enter/Space handling, and `aria-expanded`. Content panels need `aria-hidden` toggling.
- **Rating**: Needs Work

### 2. Animation
- **Keyboard**: N/A -- decorative/visual component, no interactive elements.
- **ARIA**: None. Uses `visibility: hidden` which does correctly hide from assistive tech. Ticker mode replaces text with character spans but does not add `aria-hidden` or use `aria-live`.
- **Focus**: N/A.
- **Screen reader**: Ticker text is split into individual character `<span>` elements. While the text content remains readable, screen readers may behave differently with per-character spans.
- **Gaps**: Ticker mode should preserve the original text in an `aria-label` or use `aria-live` to announce the completed text. Consider adding `aria-hidden="true"` to the character spans and an `aria-label` on the parent.
- **Rating**: Needs Work

### 3. AudioPlayer
- **Keyboard**: Progress bar supports ArrowLeft/ArrowRight (5s seek). Volume bar supports ArrowUp/ArrowDown/ArrowLeft/ArrowRight (5% steps). Both sliders have `tabindex="0"`. Play and mute buttons are native `<button>` elements.
- **ARIA**: Play button has `aria-label` that toggles between "Play" and "Pause". Mute button has `aria-label` that toggles between "Mute" and "Unmute". Progress slider has `role="slider"`, `aria-label="Seek"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. Volume slider has `role="slider"`, `aria-label="Volume"` with full value attributes.
- **Focus**: Buttons and sliders are all focusable.
- **Screen reader**: `aria-valuenow` updated in real time for both sliders. Labels update dynamically on state change.
- **Gaps**: Minor -- no `aria-live` region to announce play/pause state changes. Home/End keys not supported on sliders.
- **Rating**: Pass

### 4. BackToTop
- **Keyboard**: Button is a native `<button>` element, so it is keyboard-accessible by default.
- **ARIA**: `aria-label="Back to top"` on the button.
- **Focus**: Button is focusable when visible. No focus management when button appears/disappears.
- **Screen reader**: Label is clear. No announcement when button becomes visible.
- **Gaps**: When hidden via CSS opacity/visibility, button should ideally have `aria-hidden="true"` or `tabindex="-1"` to prevent focus on invisible button. Currently relies on CSS for visibility only.
- **Rating**: Partial

### 5. Breadcrumbs
- **Keyboard**: Uses native `<a>` links and `<nav>` element -- fully keyboard-accessible.
- **ARIA**: `<nav aria-label="Breadcrumb">` wrapper. Current page has `<span aria-current="page">`. Uses ordered list `<ol>` for semantic structure.
- **Focus**: Native link focus handling.
- **Screen reader**: Excellent. Proper `aria-current="page"`, semantic `<nav>` and `<ol>` structure.
- **Gaps**: None significant.
- **Rating**: Pass

### 6. Counter
- **Keyboard**: N/A -- display-only component, no interactive elements.
- **ARIA**: None.
- **Focus**: N/A.
- **Screen reader**: Counter updates `textContent` during animation. No `aria-live` region, so screen readers will not announce the counting animation or final value change.
- **Gaps**: Should use `aria-live="polite"` so the final value is announced. Consider `role="timer"` or `role="status"`.
- **Rating**: Needs Work

### 7. DataTable
- **Keyboard**: Sortable column headers have `tabindex="0"` and respond to Enter and Space keys. Filter input is a native `<input>`. Pagination buttons are native `<button>` elements. Select-all and row checkboxes are native `<input type="checkbox">`.
- **ARIA**: Sortable headers have `role="button"`, `aria-sort` (none/ascending/descending). Filter input has `aria-label="Filter table"`. Select-all checkbox has `aria-label="Select all rows"`. Row checkboxes have `aria-label="Select row N"`. Resize handles have `aria-hidden="true"`. Sort indicators have `aria-hidden="true"`. Active pagination page has `aria-current="page"`. Prev/next pagination buttons have `aria-label`. An `aria-live="polite"` region announces sort and filter results.
- **Focus**: Sortable headers are focusable.
- **Screen reader**: `aria-live` region announces "Sorted by X ascending/descending", "N rows found", and "Sort cleared".
- **Gaps**: None significant. Excellent implementation.
- **Rating**: Pass

### 8. DragDrop
- **Keyboard**: Reorder/ordering quiz modes have keyboard support: items get `tabindex="0"` and `aria-grabbed`. Enter/Space to grab, ArrowUp/ArrowDown to move within list, ArrowRight/ArrowDown to move between containers in sort mode. Escape to release. Match mode has keyboard via ArrowRight/ArrowDown to cycle options.
- **ARIA**: Drag ghost has `aria-hidden="true"`. Quiz ordering items have `aria-grabbed`. Lists have `aria-label="Drag items to reorder"`. `aria-live="polite"` region exists for quiz mode.
- **Focus**: Items receive focus after keyboard moves. Focus management for grabbed/released items.
- **Screen reader**: `aria-live` region provides announcements in quiz mode. `aria-grabbed` communicates grab state.
- **Gaps**: The base DragDrop component (non-quiz) has no keyboard support at all -- only mouse/touch handlers. Items have no tabindex or keydown handlers in reorder/sort modes. The keyboard support exists only within the MiniQuiz integration. `aria-grabbed` is deprecated in ARIA 1.1 (should use `aria-pressed` or custom approach instead).
- **Rating**: Needs Work

### 9. Flipbox
- **Keyboard**: No keyboard support. Only mouseenter/mouseleave (hover mode) or click events. No keydown handlers. No tabindex. The element is a `<div>`, so it is not focusable.
- **ARIA**: None. No `aria-expanded`, no `role`, no state communication.
- **Focus**: None.
- **Screen reader**: No indication of interactive nature or flip state.
- **Gaps**: Needs `tabindex="0"`, `role="button"`, Enter/Space/focus/blur handlers, and `aria-expanded` or similar state attribute. Back content is visually hidden when not flipped but may still be read by screen readers.
- **Rating**: Needs Work

### 10. FormElements
- **Keyboard**: Toggle switches get native checkbox keyboard support. Range sliders have custom `tabindex="0"` tracks with ArrowRight/ArrowUp (increment), ArrowLeft/ArrowDown (decrement), Home (min), End (max). Date picker input responds to Escape (close) and Enter/Space (open). Colour swatch grid supports ArrowRight/ArrowDown/ArrowLeft/ArrowUp to move between swatches, Enter/Space to select, Escape to close. Hex input responds to Enter. Time picker responds to Escape and Enter/Space.
- **ARIA**: Toggle uses `aria-checked`. Slider tracks have `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label`. Date picker has `aria-label="Choose date"`. Prev/next month buttons have `aria-label`. Colour swatch preview has `aria-label` describing selected colour. Grid has `aria-label="Colour options"`. Individual swatches have `aria-checked` and `aria-label`. Custom colour button has `aria-label`. Hex input has `aria-label`. Time picker dropdown has `aria-label="Choose time"`. Decorative icons have `aria-hidden="true"`.
- **Focus**: Slider tracks, swatch previews, and grids are focusable. Arrow key navigation moves focus between swatches.
- **Screen reader**: Slider `aria-valuenow` updates in real time. Swatch selection updates `aria-checked` and preview `aria-label`.
- **Gaps**: Date picker calendar cells (day buttons) -- not verified if they have proper `aria-selected` or announce the selected date. Time picker options may lack `aria-selected`.
- **Rating**: Partial

### 11. FormValidation
- **Keyboard**: File upload drop zone has `tabindex="0"` with Enter/Space to trigger file picker. Browse button is a native `<button>`. Password toggle button is a native `<button>` (though set to `tabindex="-1"`). All form fields use native HTML inputs.
- **ARIA**: Error fields get `aria-invalid="true"` and `aria-describedby` linking to error message. Error messages have `role="alert"`. Form-level messages have `role="alert"`. Password toggle has `aria-label` that toggles between "Show password" and "Hide password". Password strength indicator has `aria-live="polite"`. File drop zone has `role="button"` and `aria-label`.
- **Focus**: On submit with errors, scrolls to and focuses the first invalid field. File browse button gets focus for file field errors.
- **Screen reader**: Errors announced via `role="alert"`. Password strength level announced via `aria-live`. Valid state set with `aria-invalid="false"`.
- **Gaps**: Password toggle has `tabindex="-1"`, making it unreachable by keyboard. This is intentional to avoid extra tab stops but means keyboard-only users cannot toggle password visibility.
- **Rating**: Pass

### 12. Graph
- **Keyboard**: No keyboard support. No keydown handlers. Chart segments are not focusable.
- **ARIA**: SVG element has `aria-label` set to the chart title. Segment links have `aria-label` for clickable segments.
- **Focus**: No focus management. Chart segments are not focusable.
- **Screen reader**: Only the overall chart title is communicated. Individual data points, segments, and legends have no ARIA labels or descriptions.
- **Gaps**: Needs keyboard navigation between data points/segments. Should add `role="img"` on SVG with a detailed `aria-label` or `<desc>`. Tooltips should be accessible. Data should have an accessible text alternative (e.g., a visually hidden data table).
- **Rating**: Needs Work

### 13. Header
- **Keyboard**: Escape key closes mobile menu. Mobile overlay has focus trap (Tab/Shift+Tab cycling). Back button in sub-menus is focusable.
- **ARIA**: Mobile menu toggle has `aria-expanded` (true/false) and `aria-label` ("Open menu"/"Close menu"). Mobile overlay has `aria-modal="true"` and `aria-label="Mobile navigation"`. Back buttons have `aria-label="Back to [parent]"`.
- **Focus**: Focus trap implemented for mobile overlay -- Tab cycles through focusable elements. First focusable element gets focus on open. Toggle button gets focus on close. Back button gets focus when navigating sub-menus.
- **Screen reader**: `aria-expanded` communicates menu state. `aria-modal` indicates modal overlay.
- **Gaps**: Desktop menu has no keyboard navigation beyond native link tabbing. No `aria-haspopup` on desktop dropdown triggers. The mobile focus trap implementation is solid.
- **Rating**: Partial

### 14. HorizontalNav
- **Keyboard**: Dropdown parent links respond to Enter/Space to toggle sub-menus (with `preventDefault`). Escape key closes all open dropdowns.
- **ARIA**: Parent links with sub-menus get `aria-haspopup="true"` and `aria-expanded` (true/false).
- **Focus**: No focus management within dropdown menus. No arrow key navigation between menu items.
- **Screen reader**: `aria-expanded` communicates open/closed state.
- **Gaps**: No arrow key navigation within or between menu items. No `role="menubar"`, `role="menu"`, or `role="menuitem"`. Focus does not move into open submenus. No focus trap for open dropdowns.
- **Rating**: Partial

### 15. HorizontalScroll
- **Keyboard**: No direct keyboard interaction. Dot buttons are native `<button>` elements with `aria-label`.
- **ARIA**: Dots nav has `role="navigation"` and `aria-label="Panel navigation"`. Each dot button has `aria-label="Go to panel N"`. Active dot has `aria-current="true"`.
- **Focus**: Dot buttons are focusable.
- **Screen reader**: `aria-current` indicates active panel. Navigation is labelled.
- **Gaps**: No keyboard controls for scrolling between panels (e.g., ArrowLeft/ArrowRight on the component). Panels themselves have no `aria-label` or `role`. No `aria-live` announcement of panel changes.
- **Rating**: Partial

### 16. ImageGallery
- **Keyboard**: Gallery items have `tabindex="0"` and respond to Enter/Space to open. Lightbox supports Escape (close), ArrowLeft/ArrowRight (navigate), +/=/- (zoom in/out), 0 (reset zoom). All lightbox buttons are native `<button>` elements.
- **ARIA**: Gallery items have `role="button"` and `aria-label="View [alt text]"`. Lightbox overlay has `role="dialog"`, `aria-modal="true"`, `aria-label="Image gallery lightbox"`. Close button has `aria-label="Close gallery"`. Zoom buttons have `aria-label` (Zoom in/out/Reset). Prev/next buttons have `aria-label`.
- **Focus**: Close button receives focus on open. Focus returns to the originating thumbnail on close.
- **Screen reader**: Proper dialog semantics. Clear labels on all interactive elements.
- **Gaps**: No focus trap within the lightbox dialog. Screen readers could tab out of the dialog to page content behind it. No `aria-live` announcement of current image (e.g., "Image 3 of 10").
- **Rating**: Pass

### 17. MiniQuiz
- **Keyboard**: Boolean/single-choice/multi-select use native radio/checkbox inputs. Drag-and-drop ordering has full keyboard support: Enter/Space to grab, ArrowUp/ArrowDown to reorder, Escape to release. Match type uses `<select>` dropdowns on mobile. Grouping questions use keyboard drag similar to ordering. Navigation prevention modal focuses the "Stay" button.
- **ARIA**: `aria-live="polite"` region for quiz announcements. Ordering items have `tabindex="0"` and `aria-grabbed`. Lists have `aria-label`. Match type items have `tabindex="0"` with ArrowRight/ArrowDown keyboard cycling.
- **Focus**: Focus moves to items after keyboard reordering. Modal "Stay" button gets focus. Items get focus after keyboard moves.
- **Screen reader**: `aria-live` region announces question navigation and quiz status. `aria-grabbed` communicates grab state for ordering.
- **Gaps**: `aria-grabbed` is deprecated. Timer countdown has no `aria-live` announcement. Score/results screen has no specific `aria-live` announcement.
- **Rating**: Partial

### 18. MultiSlider
- **Keyboard**: ArrowLeft/ArrowRight on the carousel element to navigate slides. Dot navigation buttons are native `<button>` elements with `aria-label`.
- **ARIA**: Cloned slides have `aria-hidden="true"`. Dot buttons have `aria-label="Go to slide N"`.
- **Focus**: Carousel element gets `tabindex="0"` if not already set (for keyboard focus).
- **Screen reader**: Cloned slides hidden from screen readers.
- **Gaps**: No `aria-live` region to announce current slide. No `role="region"` or `aria-roledescription="carousel"` on the container. Active dot has no `aria-current` or `aria-selected`. No `aria-label` on the overall carousel.
- **Rating**: Partial

### 19. PageNav
- **Keyboard**: Uses native `<a>` links -- fully keyboard-accessible.
- **ARIA**: `<nav aria-label="Page navigation">`. Arrow spans have `aria-hidden="true"`. Links have `aria-label="Previous: [title]"` / `"Next: [title]"`.
- **Focus**: Native link focus.
- **Screen reader**: Good labels on navigation and links.
- **Gaps**: None significant for a simple nav component. Could benefit from `role="navigation"` but `<nav>` already provides this semantically.
- **Rating**: Needs Work -- actually no, this is fine. Correcting: Pass level but minimal -- the component itself is simple links, accessibility is adequate.
- **Rating**: Partial (only because there is no current page indicator)

### 20. Pagination
- **Keyboard**: Page buttons are native `<button>` elements. "Go to page" input responds to Enter key. Page size selector is a native `<select>`.
- **ARIA**: Wrapper has `role="navigation"` and `aria-label="Pagination"`. `aria-live="polite"` region with `aria-atomic="true"` for announcements. First/last/prev/next buttons have `aria-label`. Active page button has `aria-current="page"`. Ellipsis spans have `aria-hidden="true"`. Go-to-page input has `aria-label="Go to page"`. Page size select has `aria-label="Items per page"`.
- **Focus**: All interactive elements are focusable.
- **Screen reader**: `aria-live` region available for announcements. Current page indicated with `aria-current`.
- **Gaps**: None significant. Comprehensive implementation.
- **Rating**: Pass

### 21. Parallax
- **Keyboard**: N/A -- decorative/visual component, no interactive elements.
- **ARIA**: None.
- **Focus**: N/A.
- **Screen reader**: N/A -- purely visual effect.
- **Gaps**: None for a decorative component. Should ensure `background-image` content is not essential information (if it is, provide alt text elsewhere).
- **Rating**: Needs Work (if background conveys meaning, needs alt text mechanism; as decoration, this is fine)

### 22. Popup
- **Keyboard**: Escape key closes the popup. Close button uses click handler (native button in HTML via `[data-popup-close]`).
- **ARIA**: None. No `role="dialog"`, no `aria-modal`, no `aria-label`, no `aria-hidden` on background content.
- **Focus**: No focus management. Focus does not move into the popup on open. No focus trap. Focus does not return to trigger on close.
- **Screen reader**: No dialog semantics communicated.
- **Gaps**: Needs `role="dialog"`, `aria-modal="true"`, `aria-label` or `aria-labelledby`. Needs focus trap (Tab cycling within popup). Focus should move to popup on open and return to trigger on close. Body scroll lock is set but `aria-hidden` is not applied to background content.
- **Rating**: Needs Work

### 23. ProfileGrid
- **Keyboard**: Escape key closes the lightbox. Close button has `aria-label="Close"`. Social links use native `<a>` elements.
- **ARIA**: Close button has `aria-label="Close"`. Social links have `aria-label` with platform name.
- **Focus**: No focus management. Focus does not move to lightbox on open. No focus trap. Focus does not return to the card on close.
- **Screen reader**: Minimal ARIA. No `role="dialog"` or `aria-modal` on lightbox. Grid items are not explicitly labelled as interactive.
- **Gaps**: Lightbox needs `role="dialog"`, `aria-modal="true"`, focus trap, and focus management. Grid cards should have `tabindex="0"`, `role="button"`, and keyboard activation (Enter/Space). Filter pills need keyboard support.
- **Rating**: Partial

### 24. ProgressBar
- **Keyboard**: N/A -- display-only component, no interactive elements.
- **ARIA**: None. No `role="progressbar"`, no `aria-valuenow`, no `aria-valuemin`, no `aria-valuemax`, no `aria-label`.
- **Focus**: N/A.
- **Screen reader**: Progress value is only communicated via visible text (percentage label). No semantic progressbar role.
- **Gaps**: Must add `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and `aria-label`. This is a core accessibility requirement for progress indicators.
- **Rating**: Needs Work

### 25. Share
- **Keyboard**: Share buttons are native `<button>` elements -- fully keyboard-accessible.
- **ARIA**: Container has `role="group"` and `aria-label="Share this page"`. Each button has `aria-label="Share on [platform]"`.
- **Focus**: Native button focus.
- **Screen reader**: Clear labels on all buttons and the group.
- **Gaps**: None significant.
- **Rating**: Pass

### 26. Slider
- **Keyboard**: ArrowLeft/ArrowRight on the carousel element to navigate slides. Dot buttons are native `<button>` elements with `aria-label="Go to slide N"`.
- **ARIA**: Cloned slides (for infinite loop) have `aria-hidden="true"`. Dot buttons have `aria-label`.
- **Focus**: Carousel element gets `tabindex="0"` if not already present.
- **Screen reader**: Cloned slides hidden from assistive tech.
- **Gaps**: No `aria-live` region for slide change announcements. No `role="region"` or `aria-roledescription="carousel"`. Active dot has no `aria-current` or `aria-selected`. No overall `aria-label` on the carousel.
- **Rating**: Partial

### 27. SmoothScroll
- **Keyboard**: Dot navigation buttons have `tabindex="0"` and respond to Enter/Space and ArrowUp/ArrowDown to move between dots.
- **ARIA**: Dots container has `aria-label="Page sections"`. Each dot has `aria-label="Go to [section title]"`. Active dot has `aria-current="true"`.
- **Focus**: Arrow keys move focus between dots.
- **Screen reader**: `aria-current` indicates active section. Labels describe target sections.
- **Gaps**: None significant.
- **Rating**: Pass

### 28. Tabs
- **Keyboard**: No keyboard support beyond native button click (if tabs are `<button>` elements in HTML). No keydown handler. No ArrowLeft/ArrowRight navigation between tabs.
- **ARIA**: None. No `role="tablist"`, `role="tab"`, `role="tabpanel"`. No `aria-selected`. No `aria-controls`. No `aria-labelledby`.
- **Focus**: No focus management when switching tabs.
- **Screen reader**: Tab state changes are not communicated.
- **Gaps**: Needs full ARIA tabs pattern: `role="tablist"` on nav, `role="tab"` on buttons, `role="tabpanel"` on content panels, `aria-selected` on active tab, `aria-controls`/`aria-labelledby` linking tabs to panels, ArrowLeft/ArrowRight keyboard navigation, Home/End support.
- **Rating**: Needs Work

### 29. Timeline
- **Keyboard**: Horizontal mode supports ArrowLeft/ArrowRight on the timeline element for scrolling. Prev/next buttons are native `<button>` elements.
- **ARIA**: Prev/next buttons have `aria-label="Previous"` / `"Next"`.
- **Focus**: No focus management for active item changes. Timeline element does not have `tabindex` so keyboard events only fire if a child is focused.
- **Screen reader**: No `aria-live` region for active item announcements. No labels on timeline items. Panel content updates are not announced.
- **Gaps**: Timeline element needs `tabindex="0"` for keyboard navigation to work. Active item should be announced via `aria-live`. Timeline items could benefit from `aria-label` or headings.
- **Rating**: Partial

### 30. Tooltip
- **Keyboard**: Shows on focus, hides on blur -- keyboard-accessible via native focus events.
- **ARIA**: None added by JS. No `aria-describedby` linking trigger to tooltip. No `role="tooltip"` on tooltip element. No `id` generated for linkage.
- **Focus**: Focus/blur triggers tooltip show/hide correctly.
- **Screen reader**: Tooltip content is not associated with the trigger element. Screen readers will not read the tooltip text when the trigger is focused.
- **Gaps**: Must add `role="tooltip"` on tooltip element, generate unique `id`, and set `aria-describedby` on the trigger element pointing to the tooltip `id`. This is essential for screen readers to read tooltip content.
- **Rating**: Needs Work (despite having focus show/hide, the content is invisible to screen readers)

### 31. VerticalNav
- **Keyboard**: Collapsible mode: toggle buttons have `aria-expanded`. Flyout mode: links have `aria-haspopup` and `aria-expanded`. Off-canvas mode: Escape key closes panel. Focus trap with Tab/Shift+Tab cycling. Arrow key navigation between focusable elements. External toggle buttons get `aria-expanded` and `aria-label`. Back buttons in sub-menus have `aria-label`.
- **ARIA**: Toggle buttons have `aria-expanded`. Off-canvas panel has `aria-modal="true"`, `aria-label="Mobile navigation"`. External toggle has `aria-label` ("Open/Close sidebar menu"). Flyout links have `aria-haspopup="true"` and `aria-expanded`. Back buttons have `aria-label`.
- **Focus**: Off-canvas: first focusable element gets focus on open. Focus trap prevents tabbing out. External toggle gets focus on close. Back button gets focus on sub-menu navigation. Arrow key navigation between focusable items.
- **Screen reader**: `aria-expanded` communicates open/close state. `aria-modal` indicates modal panel.
- **Gaps**: Collapsible mode has no keyboard activation for expand/collapse beyond the existing toggle (if it is a button). Hover-to-expand mode has no keyboard equivalent -- sub-menus only show on hover.
- **Rating**: Partial

### 32. VideoBackground
- **Keyboard**: N/A -- decorative/background component, no interactive elements. Video is muted, looping, and has no controls.
- **ARIA**: None.
- **Focus**: N/A.
- **Screen reader**: Video element has no alternative text. If the video conveys meaning, this is a gap.
- **Gaps**: Should have `aria-hidden="true"` on the video element since it is purely decorative. If video conveys content, needs an accessible alternative.
- **Rating**: Needs Work (missing `aria-hidden` for decorative video)

### 33. VideoPlayer
- **Keyboard**: Comprehensive keyboard support on the container (`tabindex="0"`): Space/Enter (play/pause), ArrowLeft/ArrowRight (seek 5s), ArrowUp/ArrowDown (volume 5%), F (fullscreen), M (mute), Escape (exit fullscreen). Progress bar supports ArrowLeft/ArrowRight. Volume bar supports all arrow keys. All buttons are native `<button>` elements.
- **ARIA**: Play button has `aria-label` toggling "Play"/"Pause". Overlay has `aria-label` toggling "Play video"/"Pause video". Mute button has `aria-label` toggling "Mute"/"Unmute". Fullscreen button has `aria-label` toggling "Enter/Exit fullscreen". Progress slider has `role="slider"`, `aria-label="Seek"`, full value attributes. Volume slider has `role="slider"`, `aria-label="Volume"`, full value attributes. Both sliders have `tabindex="0"`. Container has `tabindex="0"`.
- **Focus**: Container is focusable for keyboard shortcuts.
- **Screen reader**: All controls have dynamic labels. Slider values update in real time.
- **Gaps**: Minor -- no `aria-live` announcements for play/pause/mute state changes.
- **Rating**: Pass

### 34. Accessibility (font size tool)
- **Keyboard**: Trigger button opens/closes panel. Escape key closes panel and returns focus to trigger. Slider is a native `<input type="range">` with full keyboard support.
- **ARIA**: Panel has `role="group"` and `aria-label="Text size"`. Decorative labels have `aria-hidden="true"`. Slider has `aria-label="Text size"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` (e.g., "120%"). Trigger button has `aria-expanded` toggling true/false.
- **Focus**: Slider receives focus when panel opens. Trigger button receives focus on Escape close.
- **Screen reader**: `aria-valuetext` provides human-readable size value. `aria-expanded` communicates panel state. Decorative elements hidden.
- **Gaps**: None significant. Well-implemented.
- **Rating**: Pass

---

## Priority Fixes

### Critical (keyboard users completely blocked)
1. **Accordion** -- Headers are `<div>` elements with no tabindex, role, or keydown handler. Completely inaccessible to keyboard users.
2. **Tabs** -- No ARIA tabs pattern at all. No keyboard navigation between tabs. Missing `role="tablist"`, `role="tab"`, `role="tabpanel"`.
3. **Popup** -- No `role="dialog"`, no focus trap, no focus management. Modal is invisible to screen readers.
4. **Tooltip** -- No `aria-describedby` or `role="tooltip"`. Screen readers cannot access tooltip content.
5. **Flipbox** -- No keyboard access, no ARIA, no focus. Completely inaccessible.

### High (significant gaps)
6. **ProgressBar** -- Missing `role="progressbar"` and all associated ARIA attributes.
7. **Graph** -- No keyboard navigation, no data accessible to screen readers beyond chart title.
8. **DragDrop** -- Base component has no keyboard support (only quiz integration adds it).
9. **ProfileGrid** -- Lightbox lacks dialog semantics, focus trap, and focus management.

### Medium (partial gaps)
10. **Header** -- Desktop dropdowns lack keyboard navigation.
11. **HorizontalNav** -- No arrow key navigation within menus, no ARIA menu roles.
12. **VerticalNav** -- Hover-to-expand mode has no keyboard equivalent.
13. **Slider/MultiSlider** -- Missing carousel ARIA pattern, no slide announcements.
14. **ImageGallery** -- Lightbox lacks focus trap (otherwise excellent).
15. **VideoBackground** -- Needs `aria-hidden="true"` on decorative video.
16. **Timeline** -- Needs `tabindex="0"` on container for keyboard events to work.
17. **BackToTop** -- Should hide from tab order when invisible.

### Low (minor improvements)
18. **AudioPlayer/VideoPlayer** -- Could add `aria-live` for play state changes.
19. **Counter** -- Should add `aria-live` for final value announcement.
20. **Animation** -- Ticker mode should preserve accessible text.
21. **FormElements** -- Date/time picker cells may need `aria-selected`.
22. **MiniQuiz** -- Timer and score need `aria-live` announcements.
