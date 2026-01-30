# Battersea Library v2.1.0 - Release Notes

**Release Date:** January 28, 2026  
**Status:** Production Ready

## ðŸŽ‰ What's New

### New Component: SmoothScroll

A powerful scroll-to-section navigation component with visual dots and intelligent header detection.

**Key Features:**
- âœ¨ Visual navigation dots positioned on page side (left or right)
- ðŸŽ¯ **Dynamic Header Detection** - Automatically adjusts to headers that change size
- ðŸ”„ Real-time target recalculation during scroll animation
- ðŸ“ Section detection using IntersectionObserver
- ðŸ’¨ Cubic ease-out for smooth, natural deceleration
- âŒ¨ï¸ Full keyboard accessibility (Tab, Enter, Arrow keys)
- ðŸ“± Responsive (auto-hides on mobile by default)
- ðŸŽ¨ Highly customizable via CSS variables

**Technical Highlights:**
- Uses `getComputedStyle()` to read CSS target values (handles transitions)
- Recalculates scroll target on every animation frame
- Supports headers that shrink/grow during scroll
- Works with ANY HTML element (not just `<section>`)
- Dispatches custom events for integration

---

## ðŸ”§ Component Updates

### Tooltip Component (v2.0.0 â†’ v2.0.1)
- Added `data-tooltip-class` attribute for custom styling
- Allows SmoothScroll to apply custom classes to its tooltips
- Maintains backward compatibility

**New Usage:**
```html
<button data-tooltip="Text" 
        data-tooltip-class="custom-style">
</button>
```

---

## ðŸ“¦ Complete Component List (13 Total)

1. **Tooltips** (v2.0.1) - Hover/focus tooltips with 4 positions + custom classes
2. **Slider** (v2.0.5) - Carousel with true infinite loop
3. **Tabs** (v2.0.2) - Tabbed content interface
4. **Accordion** (v2.0.0) - Collapsible sections with smooth animations
5. **Popup/Modal** (v2.0.0) - Overlay dialogs
6. **Animation** (v2.0.6) - Scroll-triggered animations
7. **Counter** (v2.0.0) - Animated number counting
8. **ProgressBar** (v2.0.0) - Horizontal and circular progress
9. **NestedProgress** (v2.0.5) - Multi-layer circular progress
10. **MultiSlider** (v2.0.7) - Multi-item carousel with infinite loop
11. **Parallax** (v2.0.0) - Parallax scrolling backgrounds
12. **Flipbox** (v2.0.0) - 3D flip animations
13. **SmoothScroll** (v2.1.0) â­ **NEW**

---

## ðŸŽ¨ CSS Updates

### New CSS Variables

```css
/* SmoothScroll Navigation Dots */
--battersea-scroll-dot-size: 12px
--battersea-scroll-dot-active-size: 16px
--battersea-scroll-dot-color: rgba(0,0,0,0.3)
--battersea-scroll-dot-active-color: var(--battersea-primary)
--battersea-scroll-dot-hover-color: rgba(0,0,0,0.6)
--battersea-scroll-spacing: 20px
--battersea-scroll-offset: 50px

/* SmoothScroll Tooltips */
--battersea-scroll-tooltip-bg: rgba(0,0,0,0.85)
--battersea-scroll-tooltip-text: #fff
--battersea-scroll-tooltip-padding: 6px 12px
--battersea-scroll-tooltip-radius: 6px
--battersea-scroll-tooltip-font-size: 13px
```

---

## ðŸ“š Usage Example

### Basic Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="battersea-library.css">
</head>
<body>
  <!-- Fixed header that shrinks on scroll -->
  <header id="main-header" style="position: fixed; height: 80px;">
    Site Header
  </header>

  <!-- SmoothScroll Navigation -->
  <div data-smoothscroll 
       data-smoothscroll-header-selector="#main-header"
       data-smoothscroll-position="right"
       data-smoothscroll-duration="1000"
       data-smoothscroll-easing="ease-out">
  </div>

  <!-- Sections (can be ANY element) -->
  <section data-scroll-section data-scroll-title="ðŸ  Home">
    <h1>Welcome</h1>
  </section>

  <div data-scroll-section data-scroll-title="âš™ï¸ Features">
    <h2>Our Features</h2>
  </div>

  <article data-scroll-section data-scroll-title="ðŸ“ž Contact">
    <h2>Get in Touch</h2>
  </article>

  <!-- Scripts -->
  <script src="battersea-utils.js"></script>
  <script src="battersea-core.js"></script>
  <script src="battersea-tooltip.js"></script>
  <script src="battersea-smoothscroll.js"></script>
</body>
</html>
```

### Dynamic Header Example

```html
<style>
  #header {
    position: fixed;
    height: 120px;
    transition: height 0.3s ease;
  }
  
  #header.shrink {
    height: 60px;
  }
</style>

<script>
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.pageYOffset > 100) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  });
</script>

<!-- SmoothScroll automatically adjusts to header size changes -->
<div data-smoothscroll 
     data-smoothscroll-header-selector="#header">
</div>
```

---

## ðŸ” Technical Deep Dive

### How Dynamic Header Detection Works

**The Challenge:**
Headers often shrink during scroll (e.g., 120px â†’ 60px). Traditional fixed offset calculations break when headers change size.

**The Solution:**

1. **CSS Target Reading**
   - Uses `getComputedStyle().height` instead of `offsetHeight`
   - Reads CSS target value, not mid-transition rendered height
   - Handles CSS transitions smoothly

2. **Real-time Recalculation**
   - Recalculates scroll target on **every animation frame**
   - Adjusts destination as header shrinks/grows during scroll
   - Ensures pixel-perfect alignment

3. **IntersectionObserver Updates**
   - Detects header size changes via throttled scroll monitoring
   - Reconnects observer with new rootMargin when header changes
   - Maintains accurate section detection

### Easing Functions

All easing functions upgraded to cubic for smoother motion:

```javascript
// ease-out (default) - Natural deceleration
return 1 - Math.pow(1 - t, 3);

// ease-in - Smooth acceleration
return t * t * t;

// ease-in-out - Both
return t < 0.5 
  ? 4 * t * t * t 
  : 1 - Math.pow(-2 * t + 2, 3) / 2;
```

---

## ðŸ“Š File Changes

### New Files
- `battersea-smoothscroll.js` (14.7 KB)
- `demo-smoothscroll.html` (9.9 KB)
- `demo-smoothscroll-dynamic.html` (12 KB)

### Modified Files
- `battersea-tooltip.js` (v2.0.0 â†’ v2.0.1)
- `battersea-library.less` (+180 lines)
- `battersea-library.css` (+180 lines)
- `README.md` (+80 lines)

### Total Library Size
- **All Components:** ~120 KB (JS) + 17 KB (CSS)
- **SmoothScroll Only:** 14.7 KB + ~2 KB CSS
- **Gzipped:** ~40 KB total

---

## ðŸ§ª Testing

### Browser Compatibility
- âœ… Chrome 90+
- âœ… Firefox 88+
- âœ… Safari 14+
- âœ… Edge 90+

### Features Tested
- âœ… Dynamic header detection (shrinking/growing headers)
- âœ… Real-time scroll target recalculation
- âœ… Keyboard navigation (Tab, Enter, Arrow keys)
- âœ… Touch/mobile support
- âœ… Multiple instances on same page
- âœ… Integration with other components
- âœ… Custom CSS variables
- âœ… Event dispatching
- âœ… Responsive behavior
- âœ… Accessibility (ARIA labels, focus indicators)

---

## ðŸš€ Migration Guide

### From v2.0.0 to v2.1.0

**No Breaking Changes!** This is a backward-compatible release.

**To Add SmoothScroll:**

1. Include the new script:
```html
<script src="battersea-smoothscroll.js"></script>
```

2. Add the navigation container:
```html
<div data-smoothscroll></div>
```

3. Mark your sections:
```html
<section data-scroll-section data-scroll-title="Title">
  Content
</section>
```

**To Update Tooltips (Optional):**

If you want custom tooltip classes:
```html
<!-- Old -->
<button data-tooltip="Text">Hover</button>

<!-- New (optional) -->
<button data-tooltip="Text" data-tooltip-class="custom">
  Hover
</button>
```

---

## ðŸŽ¯ Next Steps

### Planned for v2.2.0
1. **Header Component** - Adaptive navigation with scroll-shrink
2. **SmoothScroll Enhancements**:
   - Connecting line between dots
   - Progress indicator
   - Mini-map preview
   - Deep linking (URL hash support)

### Future Considerations
- DataTable with sorting/filtering
- ImageGallery with lightbox
- FormValidation
- DragDrop for reordering

---

## ðŸ“„ License

MIT License - Free to use in personal and commercial projects

---

## ðŸ™ Acknowledgments

Built with â¤ï¸ using vanilla JavaScript and modern web standards.

Special thanks to all contributors and users of Battersea Library.

---

**Happy Building! ðŸš€**
