# Battersea Library

**Version:** 2.1.0  
**License:** MIT  
**Author:** Claude & User

A lightweight, modular JavaScript component library with no dependencies. Built with vanilla JavaScript, CSS (LESS), and a focus on accessibility, performance, and ease of use.

---

## ðŸ“¦ What's Included

Battersea Library provides 13 fully-featured, production-ready components:

1. **Tooltips** - Hover/focus tooltips with 4 positions
2. **Slider** - Image/content carousel with infinite loop
3. **Tabs** - Tabbed content interface
4. **Accordion** - Collapsible content sections
5. **Popup/Modal** - Overlay dialogs
6. **Animation** - Scroll-triggered animations with cascading children
7. **Counter** - Animated number counting on scroll
8. **ProgressBar** - Horizontal and circular progress indicators
9. **NestedProgress** - Multi-layer circular progress visualization
10. **MultiSlider** - Multi-item carousel with infinite loop
11. **Parallax** - Parallax scrolling backgrounds
12. **Flipbox** - 3D flip card animations
13. **SmoothScroll** - Scroll-to-section navigation with dynamic header support ⭐ NEW

---

## ðŸš€ Quick Start

### Installation

Download the library files and include them in your HTML:

```html
<!-- CSS -->
<link rel="stylesheet" href="battersea-library.css">

<!-- JavaScript (in order) -->
<script src="battersea-utils.js"></script>
<script src="battersea-core.js"></script>

<!-- Include only the components you need -->
<script src="battersea-slider.js"></script>
<script src="battersea-tooltip.js"></script>
<!-- ... other components ... -->
```

### Basic Usage

```html
<!-- Simple Slider -->
<div data-slider data-slider-autoplay="true" data-slider-interval="3000">
  <div data-slider-track>
    <div data-slider-item>Slide 1</div>
    <div data-slider-item>Slide 2</div>
    <div data-slider-item>Slide 3</div>
  </div>
  <button data-slider-prev>‹</button>
  <button data-slider-next>›</button>
  <div data-slider-dots></div>
</div>

<!-- Tooltip -->
<button data-tooltip="Hello World!" data-tooltip-position="top">
  Hover me
</button>

<!-- SmoothScroll -->
<div data-smoothscroll data-smoothscroll-header-selector="#header"></div>
<section data-scroll-section data-scroll-title="Home">Content</section>
<section data-scroll-section data-scroll-title="About">Content</section>

<!-- Animation -->
<div data-animate="fade-up" class="delay-3">
  <h2>Animated Heading</h2>
  <p>This will fade up with a delay</p>
</div>
```

The library auto-initializes on page load. No JavaScript code required!

---

## ðŸ“š Component Documentation

### 1. Tooltips

Accessible tooltips that appear on hover or focus.

**HTML:**
```html
<button data-tooltip="Tooltip text" data-tooltip-position="top">
  Hover me
</button>
```

**Attributes:**
- `data-tooltip` - Tooltip text (required)
- `data-tooltip-position` - Position: `top`, `right`, `bottom`, `left` (default: `top`)

**Features:**
- Keyboard accessible
- ARIA labels
- Smooth fade-in/out
- Auto-positioning

---

### 2. Slider

Full-featured image/content carousel with true infinite loop.

**HTML:**
```html
<div data-slider 
     data-slider-autoplay="true" 
     data-slider-interval="5000"
     data-slider-transition="slide"
     data-slider-dots="true"
     data-slider-arrows="true"
     tabindex="0">
  <div data-slider-track>
    <div data-slider-item>Slide 1</div>
    <div data-slider-item>Slide 2</div>
    <div data-slider-item>Slide 3</div>
  </div>
  <button data-slider-prev aria-label="Previous">â€¹</button>
  <button data-slider-next aria-label="Next">â€º</button>
  <div data-slider-dots></div>
</div>
```

**Attributes:**
- `data-slider-autoplay` - Enable autoplay: `true`/`false` (default: `false`)
- `data-slider-interval` - Autoplay interval in ms (default: `5000`)
- `data-slider-transition` - Transition type: `slide`/`fade` (default: `slide`)
- `data-slider-dots` - Show navigation dots: `true`/`false` (default: `true`)
- `data-slider-arrows` - Show arrow buttons: `true`/`false` (default: `true`)

**Features:**
- âœ¨ **True infinite loop** (slide transition only)
- Clone-based seamless sliding
- Keyboard navigation (â† â†’)
- Touch/swipe support
- Autoplay with pause on hover
- Responsive
- Accessible (ARIA labels, keyboard control)

**Events:**
```javascript
slider.addEventListener('battersea:slideChange', (e) => {
  console.log('Current slide:', e.detail.index);
});
```

---

### 3. Tabs

Tabbed content interface with smooth transitions.

**HTML:**
```html
<div data-tabs>
  <div data-tabs-nav>
    <button data-tab-trigger="tab1" class="active">Tab 1</button>
    <button data-tab-trigger="tab2">Tab 2</button>
    <button data-tab-trigger="tab3">Tab 3</button>
  </div>
  
  <div data-tab-content="tab1" class="active">
    Content for Tab 1
  </div>
  <div data-tab-content="tab2">
    Content for Tab 2
  </div>
  <div data-tab-content="tab3">
    Content for Tab 3
  </div>
</div>
```

**Features:**
- Smooth content switching
- Active state management
- Keyboard accessible
- Simple markup

---

### 4. Accordion

Collapsible content sections with smooth animations.

**HTML:**
```html
<div data-accordion data-accordion-multiple="false">
  <div data-accordion-item class="active">
    <div data-accordion-header>Section 1</div>
    <div data-accordion-content>
      <div>Content for section 1</div>
    </div>
  </div>
  
  <div data-accordion-item>
    <div data-accordion-header>Section 2</div>
    <div data-accordion-content>
      <div>Content for section 2</div>
    </div>
  </div>
</div>
```

**Attributes:**
- `data-accordion-multiple` - Allow multiple sections open: `true`/`false` (default: `false`)

**Features:**
- Smooth max-height transitions
- No snapping or jerky animations
- Multiple or single-open modes
- Works with dynamic content

**Events:**
```javascript
accordion.addEventListener('battersea:accordionToggle', (e) => {
  console.log('Section toggled:', e.detail.isOpen);
});
```

---

### 5. Popup/Modal

Overlay dialogs with backdrop and ESC/click-outside to close.

**HTML:**
```html
<button data-popup-trigger="myPopup">Open Popup</button>

<div data-popup="myPopup">
  <div data-popup-content>
    <button data-popup-close>&times;</button>
    <h2>Popup Title</h2>
    <p>Popup content goes here</p>
  </div>
</div>
```

**Features:**
- Click outside to close
- ESC key to close
- Backdrop overlay
- Focus trap
- Smooth fade-in/out

**Events:**
```javascript
popup.addEventListener('battersea:popupOpen', () => {
  console.log('Popup opened');
});

popup.addEventListener('battersea:popupClose', () => {
  console.log('Popup closed');
});
```

---

### 6. Animation

Scroll-triggered animations with parent-child cascading.

**HTML:**
```html
<!-- Basic animation -->
<div data-animate="fade-up">
  Content fades up when scrolled into view
</div>

<!-- With custom delay -->
<div data-animate="fade-in" class="delay-5">
  Fades in with 1.0s total delay (0.5s base + 0.5s custom)
</div>

<!-- Parent with children -->
<div data-animate="fade-up">
  <h2>Parent animates first</h2>
  <p>Child 1 - waits 0.3s after parent</p>
  <p>Child 2 - appears 0.1s after child 1</p>
  <p>Child 3 - appears 0.1s after child 2</p>
</div>
```

**Available Animations:**
- `fade-in` - Fade in
- `fade-up` - Slide up + fade
- `fade-down` - Slide down + fade
- `fade-left` - Slide from right + fade
- `fade-right` - Slide from left + fade

**Delay Classes:**
- `delay-1` through `delay-10` 
- Each unit = 100ms (e.g., `delay-5` = 500ms additional delay)

**Animation Timing:**
1. Element enters viewport
2. Wait 0.5s (base delay)
3. Element animates
4. Children wait 0.3s after parent completes
5. Each child staggers by 0.1s

**Features:**
- IntersectionObserver for performance
- One-time animation (doesn't re-trigger)
- Supports grandchildren
- Custom delay classes
- No double-animation or flicker

---

### 7. Counter

Animated number counting when scrolled into view.

**HTML:**
```html
<div data-counter 
     data-counter-start="0" 
     data-counter-end="1000" 
     data-counter-duration="2000"
     data-counter-suffix=" users">
</div>
```

**Attributes:**
- `data-counter-start` - Starting number (default: `0`)
- `data-counter-end` - Ending number (required)
- `data-counter-duration` - Animation duration in ms (default: `2000`)
- `data-counter-prefix` - Text before number (e.g., `$`)
- `data-counter-suffix` - Text after number (e.g., ` users`)
- `data-counter-decimals` - Decimal places (default: `0`)

**Features:**
- Smooth easing animation
- Decimal support
- Prefix/suffix support
- Triggers on scroll into view

---

### 8. ProgressBar

Horizontal and circular progress indicators.

**HTML:**
```html
<!-- Horizontal -->
<div data-progress 
     data-progress-value="75" 
     data-progress-type="horizontal"
     data-progress-label="Loading...">
</div>

<!-- Circular -->
<div data-progress 
     data-progress-value="60" 
     data-progress-type="circular"
     data-progress-size="150">
</div>
```

**Attributes:**
- `data-progress-value` - Progress value 0-100 (required)
- `data-progress-type` - Type: `horizontal`/`circular` (default: `horizontal`)
- `data-progress-size` - Size in pixels for circular (default: `120`)
- `data-progress-label` - Optional label text

**Features:**
- Responsive circular progress
- Smooth animations
- Customizable colors via CSS variables
- Auto-sizing to parent container

---

### 9. NestedProgress

Multi-layer circular progress visualization.

**HTML:**
```html
<div data-progress-nested
     data-progress-title="Skills"
     data-progress-legend="true"
     data-progress-circles='[
       {"label":"HTML","value":90,"color":"#e34c26"},
       {"label":"CSS","value":85,"color":"#264de4"},
       {"label":"JavaScript","value":80,"color":"#f7df1e"}
     ]'>
</div>
```

**Attributes:**
- `data-progress-circles` - JSON array of circle data (required)
- `data-progress-title` - Center title text
- `data-progress-legend` - Show legend: `true`/`false` (default: `false`)

**Circle Properties:**
- `label` - Circle label
- `value` - Progress value 0-100
- `color` - Hex color code

**Features:**
- Responsive sizing
- Optional center title
- Optional color legend
- Nested concentric circles

---

### 10. MultiSlider

Multi-item carousel with infinite loop and responsive breakpoints.

**HTML:**
```html
<div data-multislider 
     data-multislider-items="3" 
     data-multislider-items-md="2" 
     data-multislider-items-sm="1" 
     data-multislider-gap="20"
     data-multislider-autoplay="true"
     data-multislider-interval="3000">
  <div data-multislider-track>
    <div data-multislider-item>Item 1</div>
    <div data-multislider-item>Item 2</div>
    <div data-multislider-item>Item 3</div>
    <div data-multislider-item>Item 4</div>
    <div data-multislider-item>Item 5</div>
  </div>
  <button data-multislider-prev>â€¹</button>
  <button data-multislider-next>â€º</button>
</div>
```

**Attributes:**
- `data-multislider-items` - Items per view on desktop (default: `3`)
- `data-multislider-items-md` - Items per view on tablet (default: `2`)
- `data-multislider-items-sm` - Items per view on mobile (default: `1`)
- `data-multislider-gap` - Gap between items in pixels (default: `20`)
- `data-multislider-autoplay` - Enable autoplay: `true`/`false` (default: `false`)
- `data-multislider-interval` - Autoplay interval in ms (default: `5000`)

**Breakpoints:**
- Desktop: â‰¥1024px
- Tablet: 768px - 1023px  
- Mobile: <768px

**Features:**
- âœ¨ **True infinite loop**
- Clone-based seamless sliding
- Responsive breakpoints
- Keyboard navigation
- Autoplay with pause on hover
- Smooth transitions in both directions

**Events:**
```javascript
multislider.addEventListener('battersea:multisliderChange', (e) => {
  console.log('Current position:', e.detail.index);
});
```

---

### 11. Parallax

Parallax scrolling background effect.

**HTML:**
```html
<div data-parallax 
     data-parallax-speed="0.5" 
     data-parallax-image="background.jpg">
  <div class="content">
    <h1>Content with parallax background</h1>
  </div>
</div>
```

**Attributes:**
- `data-parallax-speed` - Scroll speed multiplier (default: `0.5`)
- `data-parallax-image` - Background image URL

**Features:**
- Smooth scroll effect
- Adjustable speed
- Optimized performance

---

### 12. Flipbox

3D flip card animations.

**HTML:**
```html
<div data-flipbox data-flipbox-trigger="hover">
  <div data-flipbox-front>
    <h3>Front Side</h3>
  </div>
  <div data-flipbox-back>
    <h3>Back Side</h3>
  </div>
</div>
```

**Attributes:**
- `data-flipbox-trigger` - Trigger type: `hover`/`click` (default: `hover`)

**Features:**
- 3D transform animation
- Hover or click trigger
- Smooth rotation
- Perspective effect

---

### 13. SmoothScroll ⭐ NEW

Scroll-to-section navigation with visual dots and dynamic header support.

**HTML:**
```html
<!-- Dynamic header detection (recommended) -->
<div data-smoothscroll 
     data-smoothscroll-header-selector="#main-header"
     data-smoothscroll-position="right"
     data-smoothscroll-duration="1000"
     data-smoothscroll-easing="ease-out">
</div>

<!-- Sections can be ANY element -->
<section data-scroll-section data-scroll-title="Home">Content</section>
<div data-scroll-section data-scroll-title="Features">Content</div>
<article data-scroll-section data-scroll-title="About">Content</article>
```

**Container Attributes:**
- `data-smoothscroll-header-selector` - CSS selector for dynamic header (e.g., `#header`)
- `data-smoothscroll-offset` - Static offset in pixels (default: `0`)
- `data-smoothscroll-position` - Dot position: `left`/`right` (default: `right`)
- `data-smoothscroll-duration` - Scroll animation duration in ms (default: `800`)
- `data-smoothscroll-easing` - Easing function: `linear`, `ease-in`, `ease-out`, `ease-in-out` (default: `ease-out`)
- `data-smoothscroll-hide-mobile` - Hide navigation on mobile: `true`/`false` (default: `true`)

**Section Attributes:**
- `data-scroll-section` - Marks element as a section (required)
- `data-scroll-title` - Section title for tooltip (required)
- `id` - Section ID (auto-generated if missing)

**Features:**
- ✨ Visual navigation dots on page side
- 🎯 Dynamic header offset detection (auto-adjusts to shrinking headers)
- 🔄 Real-time target recalculation during scroll
- 📍 Section detection with IntersectionObserver
- 💨 Cubic ease-out for smooth deceleration
- ⌨️ Keyboard accessible (Tab, Enter, Arrow keys)
- 📱 Responsive (auto-hides on mobile by default)
- 🎨 Customizable via CSS variables
- 🔊 Custom events: `battersea:scrollSectionChange`

**Events:**
```javascript
document.querySelector('[data-smoothscroll]')
  .addEventListener('battersea:scrollSectionChange', (e) => {
    console.log('Section:', e.detail.section.title);
    console.log('Index:', e.detail.index);
  });
```

**CSS Variables:**
```css
--battersea-scroll-dot-size: 12px
--battersea-scroll-dot-active-size: 16px
--battersea-scroll-dot-color: rgba(0,0,0,0.3)
--battersea-scroll-dot-active-color: var(--battersea-primary)
--battersea-scroll-tooltip-bg: rgba(0,0,0,0.85)
```

**Dynamic Header Support:**
The component automatically detects and adapts to headers that change size (e.g., shrink on scroll). Uses `getComputedStyle()` to read CSS target values, handles transitions smoothly, and recalculates scroll targets in real-time during animation.

---

## ðŸŽ¨ Customization

### CSS Variables

Customize the library's appearance using CSS variables:

```css
:root {
  /* Colors */
  --battersea-primary: #007bff;
  --battersea-secondary: #6c757d;
  --battersea-text: #333;
  --battersea-bg: #f8f9fa;
  
  /* Animation */
  --battersea-animation-duration: 0.6s;
  --battersea-animation-timing: ease-out;
  
  /* Tooltips */
  --battersea-tooltip-bg: #333;
  --battersea-tooltip-text: #fff;
  
  /* Progress */
  --battersea-progress-bg: #e9ecef;
  --battersea-progress-fill: #007bff;
  
  /* Slider */
  --battersea-slider-arrow-bg: rgba(0, 0, 0, 0.5);
  --battersea-slider-dot-bg: #ccc;
  --battersea-slider-dot-active: #007bff;
}
```

### Compiling LESS

The library uses LESS for styling. To customize:

1. Edit `battersea-library.less`
2. Compile to CSS:
   ```bash
   lessc battersea-library.less battersea-library.css
   ```

---

## ðŸ”§ JavaScript API

### Manual Initialization

By default, components auto-initialize on page load. For dynamic content:

```javascript
// Re-initialize all components
Battersea.init();

// Initialize specific component
Battersea.initComponent('slider');

// Get component instance
const sliderInstance = Battersea.getInstance(element, 'slider');

// Destroy component
sliderInstance.destroy();
```

### Custom Events

All components dispatch custom events:

```javascript
// Slider
element.addEventListener('battersea:slideChange', (e) => {
  console.log(e.detail.index, e.detail.slide);
});

// Accordion
element.addEventListener('battersea:accordionToggle', (e) => {
  console.log(e.detail.item, e.detail.isOpen);
});

// Popup
element.addEventListener('battersea:popupOpen', () => {});
element.addEventListener('battersea:popupClose', () => {});

// MultiSlider
element.addEventListener('battersea:multisliderChange', (e) => {
  console.log(e.detail.index);
});
```

---

## ðŸ“± Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES6 Classes
- CSS Custom Properties
- IntersectionObserver
- CSS Transforms
- TransitionEnd events

---

## ðŸ—ï¸ Architecture

### File Structure

```
battersea-library/
â”œâ”€â”€ battersea-utils.js          # Utility functions
â”œâ”€â”€ battersea-core.js           # Core initialization system
â”œâ”€â”€ battersea-tooltip.js        # Tooltip component
â”œâ”€â”€ battersea-slider.js         # Slider component
â”œâ”€â”€ battersea-tabs.js           # Tabs component
â”œâ”€â”€ battersea-accordion.js      # Accordion component
â”œâ”€â”€ battersea-popup.js          # Popup component
â”œâ”€â”€ battersea-animation.js      # Animation component
â”œâ”€â”€ battersea-counter.js        # Counter component
â”œâ”€â”€ battersea-progressbar.js    # ProgressBar component
â”œâ”€â”€ battersea-nestedprogress.js # NestedProgress component
â”œâ”€â”€ battersea-multislider.js    # MultiSlider component
â”œâ”€â”€ battersea-parallax.js       # Parallax component
â”œâ”€â”€ battersea-flipbox.js        # Flipbox component
â”œâ”€â”€ battersea-library.less      # LESS styles
â”œâ”€â”€ battersea-library.css       # Compiled CSS
â””â”€â”€ README.md                   # This file
```

### Component Structure

Each component follows this pattern:

```javascript
class ComponentName {
  constructor(el) {
    this.el = el;
    this.events = [];
    // ... initialization
    this.init();
  }
  
  init() {
    // Setup component
  }
  
  destroy() {
    // Clean up events
    this.events.forEach(cleanup => cleanup());
  }
}

// Register with core
Battersea.register('component-name', ComponentName, '[data-component]');
```

---

## ðŸš¦ Performance

### Best Practices

1. **Load only what you need**: Include only component files you're using
2. **Lazy load**: For large sites, consider lazy-loading component JS
3. **Optimize images**: Use appropriate image sizes for sliders
4. **Minimize animations**: Limit the number of simultaneously animating elements
5. **Debouncing**: Resize/scroll events are automatically debounced

### Optimization Features

- IntersectionObserver for scroll-triggered components
- CSS transforms for hardware acceleration
- Debounced resize handlers
- Event delegation where possible
- Minimal DOM manipulation

---

## â™¿ Accessibility

All components are built with accessibility in mind:

- **Keyboard Navigation**: All interactive components support keyboard controls
- **ARIA Labels**: Proper ARIA attributes throughout
- **Focus Management**: Visible focus indicators, focus trapping in modals
- **Screen Readers**: Semantic HTML and ARIA roles
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Color Contrast**: WCAG AA compliant default colors

---

## ðŸ› Troubleshooting

### Components not initializing

**Problem**: Components don't work after page load.

**Solution**: Ensure scripts are loaded in order:
```html
<script src="battersea-utils.js"></script>
<script src="battersea-core.js"></script>
<script src="battersea-[component].js"></script>
```

### Slider not sliding smoothly

**Problem**: Slider jumps or doesn't loop smoothly.

**Solution**: 
- Ensure you're using `data-slider-transition="slide"` for infinite loop
- Check that `data-slider-track` wraps all slides
- Verify slides have `data-slider-item` attribute

### Animations triggering multiple times

**Problem**: Animations play more than once.

**Solution**: 
- Don't manually call animation methods
- Ensure only one instance of battersea-animation.js is loaded
- Check console for errors

### MultiSlider items wrong size

**Problem**: Items not sized correctly.

**Solution**:
- Ensure parent has a defined width
- Check that gap value accounts for container width
- Verify responsive breakpoints match your CSS

---

## ðŸ“„ License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## ðŸ¤ Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development

1. Clone the repository
2. Make your changes
3. Test thoroughly across browsers
4. Compile LESS to CSS
5. Submit a pull request

---

## ðŸ“ž Support

For bug reports and feature requests, please open an issue on the repository.

---

## ðŸŽ‰ Acknowledgments

Built with â¤ï¸ using vanilla JavaScript and modern web standards.

Special thanks to all contributors and users of Battersea Library.

---

**Happy Building! ðŸš€**
