# Battersea Library - VerticalNav Component Documentation

## Added in v2.5.0 | Updated in v2.5.2

---

## VerticalNav

**New in v2.5.0** - Sidebar navigation with three configurable modes, mobile overlay, off-canvas panel, and full keyboard support.

### Features
- **Three modes** - Simple list, collapsible groups, or multi-level flyout
- **Hover-to-expand** - Collapsible links expand on hover, stay clickable for navigation
- **Click-to-expand** - Button toggles for traditional accordion-style groups
- **Off-canvas panel** - Slide-in from left or right with backdrop, works at any screen size
- **Mobile overlay** - Full-screen menu with drill-down panels on mobile
- **External toggle** - Place a hamburger button anywhere on the page
- **Sidebar toggle** - Collapse/expand the nav to a narrow strip
- **Active page detection** - Highlights the current page and opens parent groups
- **Keyboard navigation** - Arrow keys, Enter, Space, Escape
- **Responsive** - Flyout mode falls back to collapsible on mobile
- **Themeable** - CSS custom properties for all visual elements

---

### HTML Structure

**Simple List:**
```html
<nav data-vertical-nav data-vertical-nav-mode="simple" aria-label="Sidebar">
  <ul class="battersea-vnav">
    <li class="battersea-vnav__item">
      <a href="/intro" class="battersea-vnav__link">Introduction</a>
    </li>
    <li class="battersea-vnav__item">
      <a href="/api" class="battersea-vnav__link">API Reference</a>
    </li>
  </ul>
</nav>
```

**Collapsible - Hover-to-Expand (Clickable Links):**
```html
<nav data-vertical-nav data-vertical-nav-mode="collapsible" aria-label="Sidebar">
  <ul class="battersea-vnav">
    <li class="battersea-vnav__item">
      <a href="/components" class="battersea-vnav__link">Components</a>
      <ul class="battersea-vnav__group">
        <li class="battersea-vnav__item">
          <a href="/accordion" class="battersea-vnav__link">Accordion</a>
        </li>
        <li class="battersea-vnav__item">
          <a href="/tabs" class="battersea-vnav__link">Tabs</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

When an `<a>` link has a child `<ul class="battersea-vnav__group">`, the component automatically adds hover-to-expand behaviour. The link stays clickable for navigation; hovering expands the group.

**Collapsible - Click-to-Expand (Button Toggles):**
```html
<nav data-vertical-nav data-vertical-nav-mode="collapsible" aria-label="Sidebar">
  <ul class="battersea-vnav">
    <li class="battersea-vnav__item">
      <button class="battersea-vnav__group-toggle">Components</button>
      <ul class="battersea-vnav__group">
        <li class="battersea-vnav__item">
          <a href="/accordion" class="battersea-vnav__link">Accordion</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

Use `<button class="battersea-vnav__group-toggle">` when the parent item doesn't need to link anywhere. Clicking the button toggles the group open and closed.

**Flyout Mode:**
```html
<nav data-vertical-nav data-vertical-nav-mode="flyout" aria-label="Site navigation">
  <ul class="battersea-vnav">
    <li class="battersea-vnav__item">
      <a href="/products" class="battersea-vnav__link">Products</a>
      <ul>
        <li class="battersea-vnav__item">
          <a href="/widgets" class="battersea-vnav__link">Widgets</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

In flyout mode, use plain `<ul>` for sub-menus. The component automatically adds the `.battersea-vnav__flyout` class and positioning. Flyouts appear on hover and auto-detect viewport edges.

**Off-Canvas Panel:**
```html
<!-- External toggle (in header or toolbar) -->
<button class="battersea-vnav__external-toggle"
        data-vertical-nav-toggle-target="sidebar"
        aria-label="Open sidebar menu" aria-expanded="false">
  <span></span><span></span><span></span>
</button>

<!-- Off-canvas nav -->
<nav data-vertical-nav
     data-vertical-nav-mode="collapsible"
     data-vertical-nav-id="sidebar"
     data-vertical-nav-offcanvas="true"
     data-vertical-nav-offcanvas-direction="left"
     aria-label="Sidebar">
  <ul class="battersea-vnav">
    <!-- nav items -->
  </ul>
</nav>
```

The off-canvas panel slides in from the left or right with a semi-transparent backdrop. It works at all screen sizes (not just mobile). Click the backdrop, press Escape, or click the toggle to close.

**External Toggle (Mobile Overlay):**
```html
<!-- Toggle button placed anywhere -->
<button class="battersea-vnav__external-toggle"
        data-vertical-nav-toggle-target="mySidebar"
        aria-label="Open sidebar menu" aria-expanded="false">
  <span></span><span></span><span></span>
</button>

<!-- The nav it controls -->
<nav data-vertical-nav
     data-vertical-nav-mode="collapsible"
     data-vertical-nav-id="mySidebar"
     aria-label="Sidebar">
  <ul class="battersea-vnav">
    <!-- nav items -->
  </ul>
</nav>
```

Without off-canvas enabled, the external toggle opens a full-screen mobile overlay with drill-down navigation on screens below 768px.

---

### Data Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-vertical-nav` | - | required | Initialises the vertical navigation component |
| `data-vertical-nav-mode` | `simple` / `collapsible` / `flyout` | `simple` | Sets the navigation style |
| `data-vertical-nav-multiple` | `true` / `false` | `false` | Allow multiple groups open at once (collapsible mode) |
| `data-vertical-nav-toggle` | `true` / `false` | `false` | Show a toggle button to collapse/expand the sidebar |
| `data-vertical-nav-toggle-label` | string | `Menu` | Label text shown next to the toggle icon |
| `data-vertical-nav-id` | string | - | Unique ID for external toggle targeting |
| `data-vertical-nav-mobile-overlay` | `true` / `false` | `true` | Enable the mobile overlay menu |
| `data-vertical-nav-collapsed` | `true` / `false` | `false` | Start in collapsed state |
| `data-vertical-nav-animation-speed` | milliseconds | `300` | Animation duration for transitions |
| `data-vertical-nav-flyout-hover-delay` | milliseconds | `200` | Delay before closing flyout or hover-expand groups on mouse leave |
| `data-vertical-nav-offcanvas` | `true` / `false` | `false` | Enable off-canvas slide-in panel mode |
| `data-vertical-nav-offcanvas-direction` | `left` / `right` | `left` | Which side the off-canvas panel slides in from |

### External Toggle Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-vertical-nav-toggle-target` | string | ID matching a nav's `data-vertical-nav-id` |

---

### Custom Events

The component dispatches events on the `<nav>` element:

```javascript
const nav = document.querySelector('[data-vertical-nav]');

// Component initialised
nav.addEventListener('battersea:vnavInit', (e) => {
  console.log('Nav ready:', e.detail.nav);
});

// Collapsible group opened/closed
nav.addEventListener('battersea:vnavGroupOpen', (e) => {
  console.log('Group opened:', e.detail.item);
});
nav.addEventListener('battersea:vnavGroupClose', (e) => {
  console.log('Group closed:', e.detail.item);
});

// Flyout shown/hidden
nav.addEventListener('battersea:vnavFlyoutOpen', (e) => {
  console.log('Flyout opened:', e.detail.flyout);
});
nav.addEventListener('battersea:vnavFlyoutClose', (e) => {
  console.log('Flyout closed:', e.detail.flyout);
});

// Sidebar toggled
nav.addEventListener('battersea:vnavToggle', (e) => {
  console.log('Collapsed:', e.detail.isCollapsed);
});

// Mobile overlay opened/closed
nav.addEventListener('battersea:vnavMobileOpen', (e) => {
  console.log('Mobile menu opened');
});
nav.addEventListener('battersea:vnavMobileClose', (e) => {
  console.log('Mobile menu closed');
});

// Off-canvas opened/closed
nav.addEventListener('battersea:vnavOffCanvasOpen', (e) => {
  console.log('Off-canvas opened');
});
nav.addEventListener('battersea:vnavOffCanvasClose', (e) => {
  console.log('Off-canvas closed');
});
```

---

### Keyboard Shortcuts

**In the nav (all modes):**

| Key | Action |
|-----|--------|
| `Arrow Down` | Move to next focusable item |
| `Arrow Up` | Move to previous focusable item |
| `Enter` / `Space` | Toggle group or follow link |
| `Escape` | Close off-canvas, mobile overlay, or all open groups/flyouts |

**Flyout mode additional keys:**

| Key | Action |
|-----|--------|
| `Arrow Right` | Open flyout and focus first child |
| `Arrow Left` | Close flyout and return focus to parent |

---

### CSS Variables

Customise the component appearance with CSS custom properties:

```css
:root {
  /* Layout */
  --battersea-vnav-width: 260px;
  --battersea-vnav-indent: 16px;

  /* Colours */
  --battersea-vnav-bg: #ffffff;
  --battersea-vnav-text: #8C8693;
  --battersea-vnav-hover-bg: #f5f5f5;
  --battersea-vnav-active-bg: #667eea;
  --battersea-vnav-active-text: #ffffff;
  --battersea-vnav-border: #dddddd;
  --battersea-vnav-group-bg: rgba(0, 0, 0, 0.02);

  /* Animation */
  --battersea-vnav-animation-speed: 0.3s;

  /* Mobile overlay */
  --battersea-vnav-mobile-bg: #ffffff;
  --battersea-vnav-mobile-text: #333333;
  --battersea-vnav-mobile-border: #e0e0e0;

  /* Off-canvas */
  --battersea-vnav-offcanvas-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  --battersea-vnav-offcanvas-backdrop: rgba(0, 0, 0, 0.5);
}
```

---

### CSS Classes

**Nav structure:**

| Class | Element | Description |
|-------|---------|-------------|
| `.battersea-vnav` | `<ul>` | The nav list container |
| `.battersea-vnav__item` | `<li>` | Each navigation item |
| `.battersea-vnav__link` | `<a>` | Navigation link |
| `.battersea-vnav__group-toggle` | `<button>` | Collapsible group toggle button (click-to-expand) |
| `.battersea-vnav__group` | `<ul>` | Collapsible sub-list |
| `.battersea-vnav__flyout` | `<ul>` | Flyout sub-menu (auto-added in flyout mode) |

**Auto-added classes:**

| Class | Element | Description |
|-------|---------|-------------|
| `.battersea-vnav__link--has-group` | `<a>` | Added to links that have a child group (hover-to-expand) |
| `.battersea-vnav__item--has-group` | `<li>` | Item has a collapsible child group |
| `.battersea-vnav__item--has-flyout` | `<li>` | Item has a flyout child menu |
| `.battersea-vnav__item--hover-expand` | `<li>` | Item uses hover-to-expand pattern |
| `.battersea-vnav__item--open` | `<li>` | Group is currently expanded |
| `.battersea-vnav__item--flyout-open` | `<li>` | Flyout is currently visible |
| `.active` | `<a>` | Current page link |
| `.active-trail` | `<li>` | Parent items of the active page link |

**Toggle and overlay:**

| Class | Element | Description |
|-------|---------|-------------|
| `.battersea-vnav__toggle` | `<button>` | Internal sidebar toggle button (auto-created) |
| `.battersea-vnav__external-toggle` | `<button>` | External hamburger toggle (3 spans for animation) |
| `.battersea-vnav__external-toggle--active` | `<button>` | Hamburger animated to X (menu is open) |
| `.battersea-vnav__mobile-overlay` | `<div>` | Full-screen mobile overlay container (auto-created) |
| `.battersea-vnav__offcanvas-backdrop` | `<div>` | Semi-transparent backdrop behind off-canvas panel (auto-created) |

**State classes on nav element:**

| Class | Description |
|-------|-------------|
| `.battersea-vnav-initialized` | Component has been initialised |
| `.battersea-vnav--collapsed` | Sidebar is in collapsed state |
| `.battersea-vnav--mobile` | Mobile breakpoint active (nav hidden, overlay available) |
| `.battersea-vnav--mobile-open` | Mobile overlay is open |
| `.battersea-vnav--offcanvas` | Off-canvas mode is enabled |
| `.battersea-vnav--offcanvas-left` | Off-canvas slides from left |
| `.battersea-vnav--offcanvas-right` | Off-canvas slides from right |
| `.battersea-vnav--offcanvas-open` | Off-canvas panel is visible |

---

### Responsive Behaviour

**Breakpoint:** 768px

- **Desktop (768px+):** All three modes work as configured. External toggle hidden (unless off-canvas enabled).
- **Mobile (below 768px):** Flyout mode falls back to collapsible with hover-to-expand. Desktop nav hidden; external toggle opens full-screen overlay with drill-down panels.
- **Off-canvas mode:** Works at all screen sizes. External toggle always visible regardless of breakpoint.

---

### Off-Canvas Technical Notes

The off-canvas nav and backdrop are moved to `<body>` during initialisation to avoid CSS `transform` containing-block issues. Parent elements with CSS transforms (e.g. from scroll animations) create new containing blocks that break `position: fixed`.

When the off-canvas opens, external toggle buttons are also temporarily moved to `<body>` with `position: fixed` so they remain clickable above the panel. On close, everything is restored to its original DOM position.

The `destroy()` method restores all elements to their original positions.

---

### Mobile Overlay Behaviour

- **Lazy build:** Mobile nav panels are built on first open, not at initialisation
- **Drill-down:** Items with children show a chevron; tapping slides to a sub-panel
- **Back button:** Each sub-panel has a back button to slide up a level
- **Body scroll lock:** Page scrolling is disabled while the overlay is open
- **Focus trap:** Tab key cycles within the overlay for accessibility
- **Spacer:** Content is pushed below the header so the overlay doesn't cover the site header

---

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

### Accessibility

- `<nav>` element with `aria-label` for landmark identification
- Toggle buttons have `aria-expanded` managed automatically
- Flyout links have `aria-haspopup="true"` and `aria-expanded`
- Mobile overlay has `role="dialog"` and `aria-modal="true"`
- Focus trap in mobile overlay (Tab cycles within menu)
- Focus management: focus moves to menu on open, returns to toggle on close
- Full keyboard navigation (arrow keys, Enter/Space, Escape)
- Semantic HTML: `<nav>`, `<ul>`, `<li>`, `<a>`, `<button>`

---

### Troubleshooting

**Nav items not collapsing/expanding:**
- Ensure the nav has `data-vertical-nav-mode="collapsible"` (default is `simple`)
- For click-to-expand, use `<button class="battersea-vnav__group-toggle">` as the parent element
- For hover-to-expand, use `<a class="battersea-vnav__link">` with a child `<ul class="battersea-vnav__group">`

**Off-canvas panel doesn't cover full viewport:**
- This is caused by a parent element with a CSS `transform`. The component moves the nav to `<body>` automatically to fix this. If you're manually positioning the nav, ensure no ancestor has `transform`, `will-change`, `filter`, or `perspective` set.

**External toggle hidden behind off-canvas panel:**
- The component handles this automatically by moving the toggle to `<body>` when the off-canvas opens. If the toggle remains hidden, check for CSS `overflow: hidden` on ancestor elements.

**Flyout sub-menus appearing on wrong side:**
- The component auto-detects viewport edges and flips flyouts to the left when there isn't enough space on the right. This detection runs each time a flyout opens.

**Mobile overlay not appearing:**
- Check that `data-vertical-nav-mobile-overlay` is not set to `false`
- The mobile overlay only appears below 768px (or when triggered via external toggle on mobile)
- If off-canvas is enabled, the mobile overlay is disabled (off-canvas replaces it)

**Hamburger icon not animating to X:**
- Ensure the toggle button has class `battersea-vnav__external-toggle` and contains exactly three `<span>` elements
- The `--active` class is added automatically by the component

---

## Version History

### v2.5.0
- New: VerticalNav component with simple, collapsible, and flyout modes
- New: Sidebar toggle, active page detection, keyboard navigation
- New: CSS custom properties for theming
- New: Custom events for integration

### v2.5.1
- New: Mobile overlay with drill-down panels
- New: External toggle support (hamburger in header)
- New: Mobile CSS variables

### v2.5.2
- New: Hover-to-expand pattern for collapsible mode (links stay clickable)
- New: Off-canvas panel (slide-in from left or right)
- New: Off-canvas CSS variables and custom events
- Fixed: Off-canvas panel covers full viewport height (moved to `<body>`)
- Fixed: External toggle stays above off-canvas panel when open
- Changed: Flyout-to-collapsible mobile fallback uses hover-expand

---

## Files

- **JavaScript:** `src/js/battersea-verticalnav.js`
- **Styles:** `src/css/battersea-nav-vertical.less`
- **Demo:** `demo/components/verticalnav.html`
- **Variables:** CSS custom properties in `src/css/battersea-variables-enhanced.less`
