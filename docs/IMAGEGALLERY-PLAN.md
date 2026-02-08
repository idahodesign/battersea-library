# ImageGallery Component - Implementation Plan

## Overview
New component: ImageGallery with lightbox, masonry thumbnail grid, zoom, optional titles/captions, and video support. Version bump to 2.4.0.

---

## Files to Create

### 1. `src/js/battersea-imagegallery.js`
Component JavaScript following existing IIFE + class + register pattern.

**Constructor reads data attributes:**
- `data-image-gallery` — initialise
- `data-image-gallery-columns` — column count (default: 4)
- `data-image-gallery-gap` — gap in px (default: 10)

**Gallery items** (`data-gallery-item` children):
- `data-gallery-title` — optional title text
- `data-gallery-caption` — optional caption text
- `data-gallery-src` — full-size image URL (falls back to thumbnail `src`)
- `data-gallery-type` — `"image"` (default) or `"video"`
- `data-gallery-video-src` — video source URL (for video items)
- `data-gallery-poster` — video poster/thumbnail image

**Class structure:**
- `constructor(el)` — parse config, collect items, call init()
- `init()` — set up masonry CSS vars, bind thumbnail click handlers, build lightbox DOM
- `buildLightbox()` — create overlay + lightbox structure, append to `<body>` (same pattern as Popup)
- `open(index)` — show lightbox at given index, lock body scroll, load media
- `close()` — hide lightbox, restore body scroll, pause any video
- `navigate(direction)` — prev/next with wrapping, pause video on leave
- `loadMedia(index)` — load image or video into lightbox container
- `initZoom()` — zoom state management (level, pan position)
- `zoomIn() / zoomOut() / zoomReset()` — zoom controls
- `handlePan(e)` — drag-to-pan when zoomed
- `bindKeyboard()` — Escape to close, arrows to navigate
- `bindTouch()` — swipe left/right to navigate in lightbox
- `destroy()` — remove all events, remove lightbox DOM from body

**Lightbox DOM structure:**
```
.battersea-gallery-overlay (fixed, z-index 9999)
  .battersea-gallery-lightbox
    .battersea-gallery-close (X button, top-right)
    .battersea-gallery-media-wrap
      img.battersea-gallery-media OR video.battersea-gallery-media
    .battersea-gallery-zoom-controls
      button.battersea-gallery-zoom-in (+)
      button.battersea-gallery-zoom-out (-)
      button.battersea-gallery-zoom-reset (fit)
    .battersea-gallery-info
      .battersea-gallery-title
      .battersea-gallery-caption
      .battersea-gallery-counter ("3 / 12")
    button.battersea-gallery-prev (left arrow)
    button.battersea-gallery-next (right arrow)
```

**Custom events:**
- `battersea:galleryOpen` — detail: { index, item }
- `battersea:galleryClose`
- `battersea:galleryChange` — detail: { index, item, direction }

**Registration:**
```js
window.Battersea.register('imagegallery', ImageGallery, '[data-image-gallery]');
```

### 2. `src/css/battersea-imagegallery.less`
Component styles.

**Masonry grid** — CSS `column-count` approach (pure CSS, no JS layout needed):
```less
[data-image-gallery] {
  column-count: var(--battersea-gallery-columns, 4);
  column-gap: var(--battersea-gallery-gap, 10px);
}
[data-gallery-item] {
  break-inside: avoid;
  margin-bottom: var(--battersea-gallery-gap, 10px);
  cursor: pointer;
  overflow: hidden;
  border-radius: var(--battersea-gallery-radius, 6px);
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
}
```

**Responsive breakpoints:**
```less
@media (max-width: 1023px) { column-count: 3; }
@media (max-width: 767px)  { column-count: 2; }
@media (max-width: 480px)  { column-count: 1; }
```

**Lightbox overlay** — follows Popup pattern:
- Fixed fullscreen, dark overlay (rgba(0,0,0,0.9)), flex centred
- Image/video max-width/max-height: 90vw/85vh
- Prev/next arrows: absolute positioned, centred vertically, semi-transparent circles
- Close button: top-right corner
- Info bar: bottom of lightbox with title, caption, counter
- Zoom controls: bottom-right cluster of small buttons
- Fade-in animation via `@keyframes`

**Video items** in grid:
- Play icon overlay (CSS triangle or SVG) centred on thumbnail
- Video poster image shown as thumbnail

**Zoom styles:**
- `.battersea-gallery-media-wrap` gets `overflow: hidden`
- `.battersea-gallery-media--zoomed` — `cursor: grab` (or `grabbing` while dragging)
- Transform applied via inline style for zoom level + translate for pan

### 3. `demo/components/imagegallery.html`
Demo page following accordion.html template structure.

**Text follows MY_VOICE.md guidelines:**
- UK English, no emojis, casual/conversational, "we"/"let's", dashes for asides
- Dry humour where natural

**Sections:**
1. **Hero** — "Image Gallery Component" / "A lightbox gallery with masonry layout, zoom, and video support — the works, really"
2. **Live Demos:**
   - Basic gallery (8 placeholder images from picsum.photos, varied aspect ratios)
   - Gallery with titles and captions
   - Mixed media gallery (images + video using a placeholder/sample video)
   - Compact 2-column gallery
3. **Features** — feature cards (smooth zoom, masonry layout, video support, keyboard navigation, responsive, themeable)
4. **Configuration** — data attributes table
5. **Usage Examples** — code snippets in accordion
6. **Accessibility** — keyboard support details
7. **Browser Support** — same pattern as accordion page

**Placeholder images:** `https://picsum.photos/id/{N}/{width}/{height}` with varied IDs and dimensions for masonry effect.

---

## Files to Modify

### 4. `src/css/battersea-library.less`
Add import before the demo-site import (line 23):
```less
@import "battersea-imagegallery.less";
```

### 5. `src/css/battersea-variables-enhanced.less`
Add ImageGallery CSS custom properties in `:root` block:
```less
// ImageGallery
--battersea-gallery-columns: 4;
--battersea-gallery-gap: 10px;
--battersea-gallery-radius: 6px;
--battersea-gallery-overlay-bg: rgba(0, 0, 0, 0.92);
--battersea-gallery-arrow-bg: rgba(255, 255, 255, 0.15);
--battersea-gallery-arrow-color: #fff;
--battersea-gallery-info-bg: rgba(0, 0, 0, 0.6);
--battersea-gallery-info-color: #fff;
```

### 6. `includes/demo-nav.html`
Add ImageGallery link under "Content" submenu (currently has no dropdown — we'll add one):
```html
<li class="battersea-hnav__item">
  <a href="#" class="battersea-hnav__link">Content</a>
  <ul class="battersea-hnav__dropdown">
    <li class="battersea-hnav__dropdown-item">
      <a href="/demo/components/imagegallery.html" data-nav-link="imagegallery" class="battersea-hnav__dropdown-link">Image Gallery</a>
    </li>
  </ul>
</li>
```

### 7. `TODO.md`
Mark `ImageGallery - Lightbox with thumbnails` as completed.

### 8. `CHANGELOG.md`
Add v2.4.0 entry at top with the new component details.

### 9. `CLAUDE.md`
Add ImageGallery to the components list (16 total) and bump version reference.

---

## Implementation Order

1. **CSS custom properties** — `battersea-variables-enhanced.less`
2. **LESS styles** — `battersea-imagegallery.less` (create)
3. **LESS import** — `battersea-library.less` (add import line)
4. **JavaScript component** — `battersea-imagegallery.js` (create)
5. **Demo page** — `imagegallery.html` (create)
6. **Navigation** — `demo-nav.html` (add link)
7. **Documentation updates** — TODO.md, CHANGELOG.md, CLAUDE.md

---

## Verification

1. Start local server: `python3 -m http.server 8080` from project root
2. Open `http://localhost:8080/demo/components/imagegallery.html`
3. Verify masonry grid renders with varied image heights
4. Click a thumbnail — lightbox opens with image displayed
5. Test prev/next navigation (buttons + arrow keys)
6. Test close (X button, overlay click, Escape key)
7. Test zoom (click image, zoom buttons, drag to pan when zoomed)
8. Test video item — play icon on thumbnail, video plays in lightbox with controls
9. Test titles/captions appear in lightbox info bar
10. Test responsive — resize browser to check column count changes
11. Test keyboard-only navigation (Tab, Enter, Escape, arrows)
12. Check body scroll is locked when lightbox is open
