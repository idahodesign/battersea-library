# Battersea Library - ImageGallery Component Documentation

## Added in v2.4.0

---

## 7. ImageGallery

**New in v2.4.0** - Lightbox gallery with masonry layout, zoom, video support, and keyboard navigation.

### Features
- **Masonry grid** - CSS column-count layout that handles images of different sizes
- **Fullscreen lightbox** - Click any thumbnail to view at full size in an overlay
- **Zoom and pan** - Click to zoom, drag to pan around the image
- **Video support** - HTML5 video items with native player controls
- **Optional titles and captions** - Info bar with per-item metadata
- **Keyboard navigation** - Arrow keys, Escape, plus/minus zoom
- **Touch support** - Swipe to navigate, pinch-friendly
- **Responsive grid** - Adapts column count across breakpoints
- **Themeable** - CSS custom properties for all visual elements

### HTML Structure

```html
<!-- Basic Gallery -->
<div data-image-gallery data-image-gallery-columns="4" data-image-gallery-gap="10">
  <div data-gallery-item>
    <img src="photo-1.jpg" alt="Description">
  </div>
  <div data-gallery-item>
    <img src="photo-2.jpg" alt="Description">
  </div>
</div>

<!-- Gallery with Titles and Captions -->
<div data-image-gallery data-image-gallery-columns="3">
  <div data-gallery-item
    data-gallery-title="Morning Light"
    data-gallery-caption="Taken at sunrise near the river.">
    <img src="morning.jpg" alt="Morning light">
  </div>
</div>

<!-- Separate Thumbnail and Full-Size -->
<div data-image-gallery>
  <div data-gallery-item data-gallery-src="full-size.jpg">
    <img src="thumbnail.jpg" alt="Description">
  </div>
</div>

<!-- Video Item -->
<div data-image-gallery>
  <div data-gallery-item
    data-gallery-type="video"
    data-gallery-video-src="clip.mp4"
    data-gallery-poster="poster.jpg"
    data-gallery-title="Time Lapse">
    <img src="poster.jpg" alt="Video thumbnail">
  </div>
</div>
```

### Container Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-image-gallery` | - | required | Initialise the gallery component |
| `data-image-gallery-columns` | number | 4 | Number of columns in the masonry grid |
| `data-image-gallery-gap` | number | 10 | Gap between items in pixels |

### Item Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-gallery-item` | - | required | Marks element as a gallery item |
| `data-gallery-title` | string | - | Optional title shown in lightbox info bar |
| `data-gallery-caption` | string | - | Optional caption shown below the title |
| `data-gallery-src` | URL | thumbnail src | Full-size image URL for lightbox |
| `data-gallery-type` | string | image | Media type: `image` or `video` |
| `data-gallery-video-src` | URL | - | Video source URL (required for video items) |
| `data-gallery-poster` | URL | - | Poster image for video items |

### Custom Events

The gallery dispatches three custom events on the container element:

```javascript
const gallery = document.querySelector('[data-image-gallery]');

// Lightbox opened
gallery.addEventListener('battersea:galleryOpen', (e) => {
  console.log('Opened index:', e.detail.index);
  console.log('Item element:', e.detail.item);
});

// Navigated to a different item
gallery.addEventListener('battersea:galleryChange', (e) => {
  console.log('Now viewing:', e.detail.index);
  console.log('Direction:', e.detail.direction); // 'next' or 'prev'
});

// Lightbox closed
gallery.addEventListener('battersea:galleryClose', () => {
  console.log('Gallery closed');
});
```

### Keyboard Shortcuts

When the lightbox is open:

| Key | Action |
|-----|--------|
| `Escape` | Close lightbox |
| `Left Arrow` | Previous item |
| `Right Arrow` | Next item |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |

In the thumbnail grid:

| Key | Action |
|-----|--------|
| `Tab` | Navigate between thumbnails |
| `Enter` / `Space` | Open lightbox at selected thumbnail |

### Responsive Behaviour

**Breakpoints (column count):**
- Desktop (1024px+): Uses configured column count (default 4)
- Tablet (768px - 1023px): 3 columns
- Mobile (481px - 767px): 2 columns
- Small (480px and below): 1 column

The responsive breakpoints apply automatically. The `data-image-gallery-columns` attribute sets the desktop column count, and the grid adapts from there.

### CSS Variables

Customise the gallery appearance with CSS custom properties:

```css
:root {
  /* Grid */
  --battersea-gallery-columns: 4;
  --battersea-gallery-gap: 10px;
  --battersea-gallery-radius: 6px;

  /* Lightbox overlay */
  --battersea-gallery-overlay-bg: rgba(0, 0, 0, 0.92);

  /* Navigation arrows and controls */
  --battersea-gallery-arrow-bg: rgba(255, 255, 255, 0.15);
  --battersea-gallery-arrow-color: #fff;

  /* Info bar (title, caption, counter) */
  --battersea-gallery-info-bg: rgba(0, 0, 0, 0.6);
  --battersea-gallery-info-color: #fff;
}
```

### CSS Classes

**Overlay and lightbox (dynamically created):**
- `.battersea-gallery-overlay` - Fixed fullscreen overlay (z-index 9999)
- `.battersea-gallery-overlay.active` - Overlay is visible
- `.battersea-gallery-lightbox` - Lightbox container
- `.battersea-gallery-close` - Close button (top-right)
- `.battersea-gallery-media-wrap` - Image/video container with zoom support
- `.battersea-gallery-media` - The actual image or video element
- `.battersea-gallery-prev` / `.battersea-gallery-next` - Navigation arrows
- `.battersea-gallery-info` - Info bar container
- `.battersea-gallery-title` - Title text
- `.battersea-gallery-caption` - Caption text
- `.battersea-gallery-counter` - Item counter (e.g. "3 / 12")
- `.battersea-gallery-zoom-controls` - Zoom button group
- `.battersea-gallery-zoom-in` / `.battersea-gallery-zoom-out` / `.battersea-gallery-zoom-reset` - Zoom buttons

**State classes:**
- `.battersea-gallery-media-wrap--zoomed` - Image is zoomed in
- `.battersea-gallery-media-wrap--panning` - User is dragging to pan
- `.battersea-gallery-media-wrap--video` - Current item is a video

### Zoom Behaviour

- **Click to zoom**: Click the image to toggle between fit-to-screen and 2x zoom
- **Zoom controls**: Use the +/- buttons or keyboard shortcuts for incremental zoom (0.5x steps)
- **Pan**: When zoomed, click and drag to pan around the image
- **Reset**: Click the reset button or press `0` to return to fit-to-screen
- **Zoom range**: 1x (fit) to 4x maximum
- **Video**: Zoom is disabled for video items (controls are hidden)

### Video Support

Gallery items can be HTML5 video. The component supports `.mp4`, `.webm`, and `.ogg` formats.

**How it works:**
- Video items display a play icon overlay on the thumbnail in the grid
- In the lightbox, video plays with native browser controls
- When navigating away from a video, it pauses automatically
- When the lightbox closes, any playing video is paused
- Zoom controls are hidden for video items

**Supported formats:**
- MP4 (video/mp4) - Widest browser support
- WebM (video/webm)
- OGG (video/ogg)

The format is detected automatically from the file extension.

### Examples

**Basic Image Gallery:**
```html
<div data-image-gallery data-image-gallery-columns="4">
  <div data-gallery-item>
    <img src="photo-1.jpg" alt="Woodland path">
  </div>
  <div data-gallery-item>
    <img src="photo-2.jpg" alt="Hilltop view">
  </div>
  <div data-gallery-item>
    <img src="photo-3.jpg" alt="River at dusk">
  </div>
</div>
```

**Portfolio Gallery with Captions:**
```html
<div data-image-gallery data-image-gallery-columns="3" data-image-gallery-gap="16">
  <div data-gallery-item
    data-gallery-title="Project Alpha"
    data-gallery-caption="Brand identity and web design for a tech startup."
    data-gallery-src="projects/alpha-full.jpg">
    <img src="projects/alpha-thumb.jpg" alt="Project Alpha">
  </div>
  <div data-gallery-item
    data-gallery-title="Project Beta"
    data-gallery-caption="E-commerce platform redesign.">
    <img src="projects/beta.jpg" alt="Project Beta">
  </div>
</div>
```

**Mixed Media Gallery:**
```html
<div data-image-gallery data-image-gallery-columns="3">
  <div data-gallery-item data-gallery-title="Landscape">
    <img src="landscape.jpg" alt="Open landscape">
  </div>
  <div data-gallery-item
    data-gallery-type="video"
    data-gallery-video-src="timelapse.mp4"
    data-gallery-poster="timelapse-poster.jpg"
    data-gallery-title="Time Lapse"
    data-gallery-caption="24 hours in 30 seconds.">
    <img src="timelapse-poster.jpg" alt="Time lapse video">
  </div>
  <div data-gallery-item data-gallery-title="Portrait">
    <img src="portrait.jpg" alt="Portrait shot">
  </div>
</div>
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance

- CSS `column-count` for masonry layout (no JavaScript layout calculations)
- Lazy loading support via `loading="lazy"` on thumbnail images
- Images load in lightbox on demand (not preloaded)
- Video uses `preload="metadata"` to minimise initial load
- CSS transitions for smooth animations (GPU-accelerated)
- Event cleanup on destroy

### Accessibility

- Gallery items are focusable with `tabindex="0"` and `role="button"`
- Lightbox overlay has `role="dialog"` and `aria-modal="true"`
- All buttons have descriptive `aria-label` attributes
- Focus moves to close button when lightbox opens
- Focus returns to the thumbnail when lightbox closes
- Full keyboard navigation (Tab, Enter, Escape, arrow keys)
- Alt text from thumbnails carries through to lightbox images

### Troubleshooting

**Images not displaying in masonry grid:**
- Ensure each item has the `data-gallery-item` attribute
- Check that images have valid `src` paths
- Verify the gallery container has `data-image-gallery`

**Lightbox not opening:**
- Check browser console for JavaScript errors
- Ensure `battersea-utils.js` and `battersea-core.js` are loaded before `battersea-imagegallery.js`
- Verify `battersea-imagegallery.less` is imported in `battersea-library.less`

**Video not playing:**
- Ensure `data-gallery-type="video"` is set on the item
- Provide a valid `data-gallery-video-src` URL
- Check that the video format is supported (MP4 recommended)
- Look for CORS errors in the browser console if video is on a different domain

**Zoom not working:**
- Zoom is disabled for video items (by design)
- Click on the image itself, not the overlay background
- Check that the media element loaded successfully

---

## Version History

### v2.4.0
- New: ImageGallery component with masonry layout
- New: Fullscreen lightbox with prev/next navigation
- New: Click-to-zoom with drag-to-pan
- New: HTML5 video support
- New: Optional titles and captions
- New: Keyboard and touch navigation
- New: CSS custom properties for theming
- New: Custom events for integration

---

## Files

- **JavaScript:** `src/js/battersea-imagegallery.js`
- **Styles:** `src/css/battersea-imagegallery.less`
- **Demo:** `demo/components/imagegallery.html`
- **Variables:** CSS custom properties in `src/css/battersea-variables-enhanced.less`
