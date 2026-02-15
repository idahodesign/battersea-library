# Battersea Library - ProfileGrid Component Documentation

## Added in v2.10.0

---

## ProfileGrid

**New in v2.10.0** - Staff photo grid with hover overlays, filterable tag pills, and detailed lightbox panels.

### Features
- **Responsive grid** - 4 columns desktop, 3 tablet, 2 mobile (configurable)
- **Hover overlays** - Name and title fade in over each photo on hover
- **Detailed lightbox** - Click any card to open a side-by-side panel with full contact details
- **Rich bio content** - Bio lives in a hidden HTML container, supports paragraphs, links, lists
- **Configurable filters** - Two-row pill filter: pick a category, then pick a value
- **Social link icons** - Inline SVGs for LinkedIn, Twitter/X, Instagram, Facebook, GitHub; generic fallback for others
- **Graceful fallbacks** - Missing attributes are skipped silently, no empty rows or errors
- **Themeable** - CSS custom properties for all visual elements

### HTML Structure

```html
<!-- Basic Grid -->
<div data-profile-grid data-profile-grid-columns="4">
  <div data-profile-item
       data-profile-name="Jane Smith"
       data-profile-title="Designer"
       data-profile-email="jane@example.com">
    <img src="photo.jpg" alt="Jane Smith">
  </div>
</div>

<!-- With Filters -->
<div data-profile-grid
     data-profile-grid-columns="4"
     data-profile-grid-filter="position,company,university">
  <div data-profile-item
       data-profile-name="Jane Smith"
       data-profile-title="Senior Designer"
       data-profile-position="Director"
       data-profile-company="Acme Corp"
       data-profile-university="Central Saint Martins"
       data-profile-phone="+44 20 7946 0123"
       data-profile-email="jane@acme.com"
       data-profile-website="https://janesmith.com"
       data-profile-social='[{"platform":"linkedin","url":"https://linkedin.com/in/jane"}]'>
    <img src="photo.jpg" alt="Jane Smith">
    <div data-profile-bio>
      <p>First paragraph of bio with <a href="#">links</a>.</p>
      <p>Second paragraph.</p>
    </div>
  </div>
</div>
```

### Grid Container Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-profile-grid` | - | required | Initialises the component |
| `data-profile-grid-columns` | Number | `4` | Number of columns on desktop |
| `data-profile-grid-filter` | Comma-separated field names | none | Which fields to generate filter pills for |

### Profile Item Attributes

All attributes are optional except `data-profile-item` itself.

| Attribute | Description |
|-----------|-------------|
| `data-profile-name` | Person's full name (shown on hover and in lightbox) |
| `data-profile-title` | Job title (shown on hover and in lightbox) |
| `data-profile-position` | Role or position level (e.g. Director, Engineer) |
| `data-profile-company` | Company or organisation name |
| `data-profile-university` | University or educational institution |
| `data-profile-phone` | Phone number (rendered as a clickable `tel:` link) |
| `data-profile-email` | Email address (rendered as a clickable `mailto:` link) |
| `data-profile-website` | Website URL (opens in new tab) |
| `data-profile-social` | JSON array of social links: `[{"platform":"linkedin","url":"..."}]` |

### Bio Content

The bio lives in a hidden `<div data-profile-bio>` container inside each profile item. It can contain any HTML: paragraphs, links, lists, emphasis. The container is hidden in the grid by CSS and its `innerHTML` is cloned into the lightbox when the profile is opened.

```html
<div data-profile-item data-profile-name="Jane Smith">
  <img src="photo.jpg" alt="Jane Smith">
  <div data-profile-bio>
    <p>First paragraph.</p>
    <p>Second paragraph with a <a href="https://example.com">link</a>.</p>
  </div>
</div>
```

### Social Link Platforms

These platforms are recognised and get their own SVG icon:

| Platform value | Icon |
|---------------|------|
| `linkedin` | LinkedIn logo |
| `twitter` | X/Twitter logo |
| `instagram` | Instagram logo |
| `facebook` | Facebook logo |
| `github` | GitHub logo |

Any other platform value shows a generic link icon with the platform name as text.

```html
data-profile-social='[
  {"platform":"linkedin","url":"https://linkedin.com/in/jane"},
  {"platform":"github","url":"https://github.com/jane"},
  {"platform":"portfolio","url":"https://jane.design"}
]'
```

### Filter System

The filter is configured via `data-profile-grid-filter` on the container. Pass a comma-separated list of field names that match your `data-profile-*` attributes.

```html
data-profile-grid-filter="position,company,university"
```

This generates a two-row filter bar:
- **Row 1**: "All" pill plus a pill for each category (Position, Company, University)
- **Row 2**: Appears when a category is selected, showing pills for each unique value in that field

Selecting a value pill filters the grid to show only matching people. Clicking "All" resets everything.

### Lightbox Layout

- **Desktop**: Photo on the left (40%), details on the right (60%)
- **Mobile** (below 768px): Photo on top, details below

The lightbox is appended to `<body>` to avoid stacking context issues with CSS transforms.

Close the lightbox via:
- The X button (top right)
- Clicking the dark overlay behind the panel
- Pressing Escape

### CSS Custom Properties

```css
:root {
  --battersea-profile-gap: 20px;
  --battersea-profile-radius: 8px;
  --battersea-profile-overlay-bg: rgba(0, 0, 0, 0.6);
  --battersea-profile-overlay-text: #fff;
  --battersea-profile-lightbox-bg: #fff;
  --battersea-profile-lightbox-max-width: 900px;
  --battersea-profile-lightbox-overlay: rgba(0, 0, 0, 0.7);
  --battersea-profile-lightbox-radius: 12px;
  --battersea-profile-filter-bg: #f0f0f0;
  --battersea-profile-filter-active: #667eea;
  --battersea-profile-filter-text: #333;
  --battersea-profile-filter-active-text: #fff;
}
```

### Custom Events

| Event | Detail | Description |
|-------|--------|-------------|
| `battersea:profileOpen` | `{ item, name }` | Fired when a profile lightbox opens |
| `battersea:profileClose` | - | Fired when the lightbox closes |

```javascript
const grid = document.querySelector('[data-profile-grid]');

grid.addEventListener('battersea:profileOpen', (e) => {
  console.log('Opened:', e.detail.name);
});

grid.addEventListener('battersea:profileClose', () => {
  console.log('Closed');
});
```

### Required Files

```html
<!-- CSS -->
<link rel="stylesheet" href="battersea-library.css">

<!-- Core JS (required) -->
<script src="battersea-utils.js"></script>
<script src="battersea-core.js"></script>

<!-- Component -->
<script src="battersea-profilegrid.js"></script>
```

### Responsive Breakpoints

| Breakpoint | Columns | Lightbox layout |
|-----------|---------|-----------------|
| Desktop (1024px+) | Configurable (default 4) | Side by side |
| Tablet (768-1023px) | 3 | Side by side |
| Mobile (below 768px) | 2 | Stacked |

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 15+ (requires `aspect-ratio` support)
- Edge 90+
