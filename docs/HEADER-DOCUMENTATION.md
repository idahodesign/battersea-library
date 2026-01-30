# Battersea Library - Header Component Documentation

## Added to README.md (v2.2.0)

---

## 13. Header

**New in v2.2.0** - Adaptive header with shrink-on-scroll, pre-header bar, and logo swapping.

### Features
- **Sticky positioning** - Fixed to top of page while scrolling
- **Shrink animation** - Smoothly reduces height on scroll (desktop/tablet only)
- **Pre-header bar** - Optional secondary content area above header
- **Logo swapping** - Switch logos for mobile devices
- **Two layout modes** - Right-align or center-stack
- **Mobile optimized** - No shrinking on mobile devices
- **Auto-height calculation** - Header height from logo or manual override
- **Event dispatching** - Integration with SmoothScroll and other components

### HTML Structure

```html
<!-- Pre-Header Bar (optional) -->
<div class="battersea-header-pre" 
     data-pre-mobile="show"
     data-pre-tablet="show" 
     data-pre-desktop="show"
     data-pre-height="40">
  <!-- Secondary menu, contact info, alerts, etc. -->
  <div>Call us: (555) 123-4567</div>
</div>

<!-- Main Header -->
<header class="battersea-header" 
        data-header
        data-sticky="true"
        data-shrink="true"
        data-shrink-offset="100"
        data-shrink-height="60"
        data-layout="right-align"
        data-logo-mobile="logo-mobile.svg"
        data-transition-speed="0.3">
  
  <!-- Branding Area -->
  <div class="battersea-header__brand">
    <a href="/">
      <img src="logo.svg" alt="Site Logo" class="battersea-header__logo">
    </a>
  </div>
  
  <!-- Navigation Placeholder (for future nav components) -->
  <nav class="battersea-header__nav">
    <!-- Navigation component will be inserted here -->
  </nav>
  
</header>
```

### Main Header Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-header` | - | required | Initialize component |
| `data-sticky` | boolean | false | Fix header to top on scroll |
| `data-shrink` | boolean | false | Enable shrink animation (requires sticky) |
| `data-shrink-offset` | number | 100 | Scroll distance (px) before shrinking |
| `data-shrink-height` | number | 60 | Target height (px) when shrunk |
| `data-layout` | string | right-align | Layout mode: `right-align` or `center-stack` |
| `data-logo-mobile` | string | null | Path to mobile logo image |
| `data-transition-speed` | number | 0.3 | Animation duration in seconds |
| `data-header-height` | number | 0 | Manual height override (0 = auto) |
| `data-mobile-logo-height` | number | 0 | Mobile logo height (0 = auto) |

### Pre-Header Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-pre-mobile` | string | show | Display on mobile: `show` or `hide` |
| `data-pre-tablet` | string | show | Display on tablet: `show` or `hide` |
| `data-pre-desktop` | string | show | Display on desktop: `show` or `hide` |
| `data-pre-height` | number | 40 | Fixed height in pixels |

### Layout Modes

**Right-Align (default)**
```
[Logo/Brand]                    [Nav Menu Items]
```
- Logo on left, navigation on right
- Horizontal flex layout
- Best for traditional websites

**Center-Stack**
```
           [Logo/Brand]
        [Nav Menu Items]
```
- Logo centered on top
- Navigation centered below
- Best for landing pages

### Custom Events

The header dispatches four custom events:

```javascript
const header = document.querySelector('[data-header]');

// Header became sticky (dispatched on init if sticky=true)
header.addEventListener('battersea:headerSticky', (e) => {
  console.log('Height:', e.detail.height);
});

// Header shrunk on scroll
header.addEventListener('battersea:headerShrink', (e) => {
  console.log('Shrunk to:', e.detail.shrunkHeight);
});

// Header expanded (scrolled back up)
header.addEventListener('battersea:headerExpand', (e) => {
  console.log('Expanded to:', e.detail.height);
});

// Header height changed (for scroll offset calculations)
header.addEventListener('battersea:headerResize', (e) => {
  console.log('New height:', e.detail.height);
  console.log('Is shrunk:', e.detail.isShrunk);
  console.log('Is sticky:', e.detail.isSticky);
});
```

### Integration with SmoothScroll

The header automatically dispatches `battersea:headerResize` events that the SmoothScroll component can listen to for dynamic offset calculation:

```javascript
// SmoothScroll will automatically detect the header
<div data-smoothscroll 
     data-header-selector="[data-header]"
     data-offset-mode="dynamic">
  <!-- Sections -->
</div>
```

The SmoothScroll component recalculates scroll positions when:
- Header shrinks â†’ Adjusts scroll targets
- Header expands â†’ Recalculates positions
- Provides pixel-perfect alignment

### Responsive Behavior

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: â‰¥ 1024px

**Mobile Adaptations:**
- Logo swaps to mobile version (if specified)
- Pre-header visibility controlled per device
- Shrink animation disabled (keeps full height)
- Different padding values

**Logo Swapping:**
- Fade + scale transition effect
- Triggered at 768px breakpoint
- Automatic height recalculation
- Smooth animation (configurable speed)

### CSS Variables

Customize the header appearance with CSS variables:

```css
:root {
  --battersea-header-bg: #ffffff;
  --battersea-header-text: #333;
  --battersea-header-border: #e0e0e0;
  --battersea-header-transition: 0.3s;
  --battersea-header-z-index: 1000;
  --battersea-pre-header-bg: #f5f5f5;
  --battersea-pre-header-text: #666;
}
```

### CSS Classes

**State Classes (automatically applied):**
- `.battersea-header--sticky` - Header is fixed to top
- `.battersea-header--shrunk` - Header is in shrunk state
- `.battersea-header--shrink-enabled` - Shrink animation enabled
- `.battersea-header--right-align` - Right-align layout mode
- `.battersea-header--center-stack` - Center-stack layout mode

**Element Classes:**
- `.battersea-header__brand` - Logo/branding container
- `.battersea-header__logo` - Logo image element
- `.battersea-header__nav` - Navigation container (placeholder)

**Pre-Header Classes:**
- `.battersea-header-pre` - Pre-header container
- `.battersea-header-pre--hidden` - Pre-header hidden (on scroll)
- `.battersea-header-pre--hidden-mobile` - Hidden on mobile
- `.battersea-header-pre--hidden-tablet` - Hidden on tablet
- `.battersea-header-pre--hidden-desktop` - Hidden on desktop

### Technical Details

**Shrink Animation:**
- Uses `requestAnimationFrame` for smooth scroll detection
- GPU-accelerated transforms for logo scaling
- Disabled on mobile devices (maintains full height)
- Configurable offset and target height
- Smooth transitions with customizable speed

**Pre-Header Behavior:**
- Slides up (translateY -100%) when scrolled past 10px
- Opacity fade for smooth visual effect
- Does not affect main header positioning
- Independently configurable per device
- **Header positioning:** When sticky, the header initially positions itself below the pre-header (top: pre-header height). When the pre-header slides up on scroll, the header smoothly transitions to top: 0, preventing any overlap.

**Height Calculation:**
- Auto-calculated from logo dimensions + padding
- Manual override available via `data-header-height`
- Dispatches events on height changes
- Real-time updates on logo swap

**Logo Scaling:**
- Proportional to height reduction
- Minimum scale: 0.7 (prevents too-small logos)
- Transform origin: left center (right-align) or center (center-stack)
- Smooth fade + scale transition

### Examples

**Basic Sticky Header:**
```html
<header class="battersea-header" 
        data-header
        data-sticky="true">
  <div class="battersea-header__brand">
    <img src="logo.svg" class="battersea-header__logo" alt="Logo">
  </div>
  <nav class="battersea-header__nav"></nav>
</header>
```

**Full Featured Header:**
```html
<!-- Pre-header -->
<div class="battersea-header-pre" 
     data-pre-height="50"
     data-pre-mobile="hide">
  <div>Free shipping on orders over $50!</div>
</div>

<!-- Main header -->
<header class="battersea-header" 
        data-header
        data-sticky="true"
        data-shrink="true"
        data-shrink-offset="150"
        data-shrink-height="70"
        data-layout="center-stack"
        data-logo-mobile="logo-mobile.svg"
        data-transition-speed="0.4">
  
  <div class="battersea-header__brand">
    <a href="/">
      <img src="logo-desktop.svg" 
           class="battersea-header__logo" 
           alt="Company Logo"
           style="height: 60px;">
    </a>
  </div>
  
  <nav class="battersea-header__nav">
    <!-- Navigation component -->
  </nav>
</header>
```

**Get Current Height Programmatically:**
```javascript
const header = document.querySelector('[data-header]');
const instance = Battersea.getInstance(header);

// Get current height
const height = instance.getHeight();
console.log('Header height:', height);

// Listen for changes
header.addEventListener('battersea:headerResize', (e) => {
  console.log('New height:', e.detail.height);
});
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance

- Uses `requestAnimationFrame` for scroll detection
- GPU-accelerated CSS transforms
- Debounced resize handlers
- Minimal DOM manipulation
- No layout thrashing

### Accessibility

- Semantic HTML5 `<header>` element
- Proper heading hierarchy (user-controlled)
- Keyboard navigation support (in nav components)
- Focus indicators (in nav components)
- ARIA labels where appropriate

### Future Navigation Components

The header provides an empty `.battersea-header__nav` container ready for these upcoming navigation components:

1. **HorizontalNav** - Multi-level dropdown menus
2. **VerticalNav** - Slide-in drawer (left/right)
3. **OverlayNav** - Full-screen menu with backdrop
4. **MobileNav** - Hamburger menu with animations

All navigation components will integrate seamlessly with the header structure.

### Troubleshooting

**Header not shrinking:**
- Ensure `data-sticky="true"` is set (shrink requires sticky)
- Check if you're on desktop/tablet (shrink disabled on mobile)
- Verify scroll position exceeds `data-shrink-offset` value

**Pre-header not hiding:**
- Pre-header hides after scrolling 10px
- Check device visibility settings (`data-pre-mobile`, etc.)
- Verify CSS is loaded correctly

**Logo not swapping:**
- Provide valid path in `data-logo-mobile`
- Check browser console for image load errors
- Breakpoint is 768px (resize window to test)

**Height calculation incorrect:**
- Ensure logo has loaded before initialization
- Use `data-header-height` for manual override
- Check CSS padding/margin on header element

---

## Version History

### v2.2.0 (Latest)
- âœ¨ **NEW:** Header component with shrink-on-scroll
- âœ¨ **NEW:** Pre-header bar support
- âœ¨ **NEW:** Mobile logo swapping
- âœ¨ **NEW:** Two layout modes (right-align, center-stack)
- âœ¨ **NEW:** Integration with SmoothScroll via events
- ðŸ”§ Updated CSS with header styles
- ðŸ“š Added comprehensive header documentation
- ðŸŽ¨ New demo page: `demo-header.html`
