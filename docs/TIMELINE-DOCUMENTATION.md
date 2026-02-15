# Battersea Library - Timeline Component Documentation

## Added in v2.12.0

---

## Timeline

**New in v2.12.0** - Vertical and horizontal timelines with scroll-reveal animations, snap-to-centre highlighting, and a content panel for horizontal mode.

### Features
- **Dual layout** - Vertical or horizontal, set with a single data attribute
- **Alternating** - Vertical timelines can zigzag left and right of a centre line
- **Scroll reveal** - Vertical items animate via the Animation component; horizontal items reveal with a staggered entrance
- **Snap-to-centre** - Horizontal items snap to the centre of the track; the active item highlights while others dim
- **Content panel** - Horizontal mode shows the active item's full content in a panel below the track
- **Intro text** - Horizontal cards can show a short intro (`data-timeline-intro`) with full content in the panel
- **Date badges** - Optional date or label shown as a coloured pill on each card
- **Icon markers** - Each point on the line can show an emoji, number, or text
- **Images** - Cards can include images alongside titles and descriptions
- **Navigation arrows** - Horizontal mode has prev/next buttons and keyboard arrow support
- **Mobile fallback** - Horizontal collapses to vertical on mobile, with full content shown inline
- **Themeable** - CSS custom properties for all visual elements

### HTML Structure

```html
<!-- Vertical Alternating -->
<div data-timeline data-timeline-direction="vertical" data-timeline-alternate="true">
  <div data-timeline-item data-timeline-date="2024" data-timeline-icon="🎯">
    <img src="image.jpg" alt="" data-timeline-image>
    <h3>Event Title</h3>
    <p>Description of what happened.</p>
  </div>

  <div data-timeline-item data-timeline-date="2025">
    <h3>Another Event</h3>
    <p>More details here.</p>
  </div>
</div>

<!-- Vertical Single Column -->
<div data-timeline data-timeline-direction="vertical" data-timeline-alternate="false">
  <div data-timeline-item data-timeline-date="Phase 1">
    <h3>Step One</h3>
    <p>Description.</p>
  </div>
</div>

<!-- Horizontal with Intro and Panel -->
<div data-timeline data-timeline-direction="horizontal">
  <div data-timeline-item data-timeline-date="Step 1" data-timeline-intro="Short intro text">
    <h3>Title</h3>
    <p>Full description shown in the panel below when this item is active.</p>
  </div>

  <div data-timeline-item data-timeline-date="Step 2" data-timeline-intro="Another intro">
    <h3>Design</h3>
    <img src="mockup.jpg" alt="Design mockup" data-timeline-image>
    <p>Detailed content for the panel.</p>
  </div>
</div>
```

### Container Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-timeline` | - | required | Initialises the timeline component |
| `data-timeline-direction` | `vertical` / `horizontal` | `vertical` | Layout direction. Horizontal falls back to vertical on mobile |
| `data-timeline-alternate` | `true` / `false` | `true` | Alternate items left/right on vertical desktop layouts |

### Item Attributes

| Attribute | Element | Description |
|-----------|---------|-------------|
| `data-timeline-item` | Item wrapper | Marks an element as a timeline entry (required) |
| `data-timeline-date` | Item wrapper | Date or label text shown as a badge. Omit for undated items |
| `data-timeline-icon` | Item wrapper | Custom content for the marker on the line (emoji, number, text). Omit for a plain dot |
| `data-timeline-intro` | Item wrapper | Short intro text shown on horizontal cards. Full content appears in the panel below when active |
| `data-timeline-image` | `<img>` | Marks an image inside the item for card display |

### Horizontal Mode Behaviour

**Desktop (768px+)**:
- Items are displayed in a scrollable horizontal track with CSS scroll-snap
- Spacer elements at the start and end allow the first and last items to scroll to the centre
- The item closest to the centre of the track is highlighted (scaled up, full opacity) while others dim
- A content panel below the track fades in the active item's full content (everything inside the `data-timeline-item`)
- Cards show the title and `data-timeline-intro` text; the panel shows the complete content
- Navigation arrows and keyboard arrow keys move one item at a time

**Mobile (below 768px)**:
- Falls back to vertical layout with line on the left
- The content panel is hidden
- Full content is shown inline in each card
- Navigation arrows and spacers are hidden

### Vertical Mode Behaviour

**Desktop (768px+) — Alternating**:
- Items alternate left and right of a centred line
- Left items animate in with `fade-right`, right items with `fade-left` (via the Animation component)
- Cards have a small arrow pointing towards the line

**Desktop (768px+) — Single Column**:
- All items appear on the right of a left-aligned line
- Items animate in with `fade-up`

**Mobile (below 768px)**:
- Both alternating and single-column collapse to a single column with line on the left

### CSS Custom Properties

```css
:root {
  /* Line */
  --battersea-timeline-line-color: #ddd;
  --battersea-timeline-line-width: 3px;

  /* Spacing */
  --battersea-timeline-gap: 40px;
  --battersea-timeline-gap-h: 30px;

  /* Markers */
  --battersea-timeline-marker-bg: #667eea;
  --battersea-timeline-marker-border: #fff;
  --battersea-timeline-marker-size: 20px;
  --battersea-timeline-marker-icon-size: 36px;

  /* Cards */
  --battersea-timeline-card-bg: #fff;
  --battersea-timeline-card-radius: 8px;
  --battersea-timeline-card-padding: 20px 24px;
  --battersea-timeline-card-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --battersea-timeline-card-max-width: 420px;
  --battersea-timeline-card-width: 300px;

  /* Date badges */
  --battersea-timeline-date-bg: #667eea;
  --battersea-timeline-date-text: #fff;

  /* Typography */
  --battersea-timeline-title-color: #222;
  --battersea-timeline-text-color: #555;

  /* Navigation arrows */
  --battersea-timeline-nav-bg: rgba(0, 0, 0, 0.5);
  --battersea-timeline-nav-color: #fff;

  /* Content panel */
  --battersea-timeline-panel-bg: #fff;
  --battersea-timeline-panel-padding: 24px 30px;
}
```

### Custom Events

| Event | Detail | Description |
|-------|--------|-------------|
| `battersea:timelineReady` | `{ direction, itemCount }` | Fired when the component has initialised |
| `battersea:timelineItemActive` | `{ index }` | Fired when a horizontal item becomes the active (centred) item |
| `battersea:timelineScroll` | `{ direction }` | Fired when horizontal navigation arrows are clicked |

```javascript
const timeline = document.querySelector('[data-timeline]');

timeline.addEventListener('battersea:timelineReady', (e) => {
  console.log('Direction:', e.detail.direction);
  console.log('Items:', e.detail.itemCount);
});

timeline.addEventListener('battersea:timelineItemActive', (e) => {
  console.log('Active item:', e.detail.index);
});

timeline.addEventListener('battersea:timelineScroll', (e) => {
  console.log('Scrolled:', e.detail.direction);
});
```

### Required Files

```html
<!-- CSS -->
<link rel="stylesheet" href="battersea-library.css">

<!-- Core JS (required) -->
<script src="battersea-utils.js"></script>
<script src="battersea-core.js"></script>

<!-- Animation (required for vertical scroll-reveal) -->
<script src="battersea-animation.js"></script>

<!-- Component -->
<script src="battersea-timeline.js"></script>
```

### DOM Structure (after initialisation)

**Vertical:**
```
.battersea-timeline.battersea-timeline--vertical
  .battersea-timeline__line
  .battersea-timeline__track
    .battersea-timeline__item [data-animate="fade-right"]
      .battersea-timeline__marker
      .battersea-timeline__card
        .battersea-timeline__date
        [original item content]
    ...
```

**Horizontal:**
```
.battersea-timeline.battersea-timeline--horizontal
  .battersea-timeline__track-wrapper
    .battersea-timeline__line
    .battersea-timeline__track
      .battersea-timeline__spacer--start
      .battersea-timeline__item.battersea-timeline__item--active
        .battersea-timeline__marker
        .battersea-timeline__card
          .battersea-timeline__date
          h3
          .battersea-timeline__intro
          .battersea-timeline__full-content (hidden on desktop)
      ...
      .battersea-timeline__spacer--end
    .battersea-timeline__nav--prev
    .battersea-timeline__nav--next
  .battersea-timeline__panel (shows active item's full content)
```

### Responsive Breakpoints

| Breakpoint | Vertical | Horizontal |
|-----------|----------|------------|
| Desktop (768px+) | Alternating or single-column | Snap-scroll with panel |
| Mobile (below 768px) | Single column, line on left | Falls back to vertical layout |

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Older browsers without IntersectionObserver support will show all horizontal items immediately without the entrance animation.
