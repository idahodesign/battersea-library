# Battersea Library - Project Instructions

## Project Overview
This is the Battersea Library development project. Battersea is a lightweight, modular JavaScript component library built with vanilla JavaScript, LESS/CSS, and no dependencies. The library focuses on accessibility, performance, and ease of use.

**Current Version:** 2.0.0  
**Status:** Production-ready with 12 components, actively developing new components

---

## Library Architecture

### Core Files (Required for all components)
1. **battersea-utils.js** - Utility functions (DOM manipulation, event handling, parsing)
2. **battersea-core.js** - Auto-initialization system, component registration, MutationObserver
3. **battersea-library.less** - LESS stylesheet (compile to CSS)
4. **battersea-library.css** - Compiled CSS

### Component Structure Pattern
Every component follows this structure:

```javascript
(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('[Component] requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class ComponentName {
    constructor(el) {
      this.el = el;
      this.events = [];
      // ... get data attributes
      // ... validate
      this.init();
    }

    init() {
      // Setup component
      this.attachEvents();
    }

    attachEvents() {
      // Use Utils.addEvent and push to this.events
    }

    destroy() {
      // Clean up events
      this.events.forEach(cleanup => cleanup());
    }
  }

  // Register with core
  Battersea.register('component-name', ComponentName, '[data-component]');

})(window, document);
```

---

## Existing Components (v2.0.0)

### Working Components:
1. **Tooltip** - Hover/focus tooltips with positioning
2. **Slider** - Carousel with true infinite loop (clone-based)
3. **Tabs** - Tabbed content interface
4. **Accordion** - Collapsible sections with smooth animations
5. **Popup** - Modal dialogs with backdrop
6. **Animation** - Scroll-triggered animations with parent-child cascading
7. **Counter** - Animated number counting
8. **ProgressBar** - Horizontal and circular progress
9. **NestedProgress** - Multi-layer circular progress
10. **MultiSlider** - Multi-item carousel with infinite loop
11. **Parallax** - Parallax scrolling backgrounds
12. **Flipbox** - 3D flip animations

### Key Patterns Established:
- **Data attributes** for configuration (e.g., `data-slider-autoplay="true"`)
- **Auto-initialization** on page load
- **Custom events** with `battersea:` prefix (e.g., `battersea:slideChange`)
- **Responsive design** using breakpoints (mobile <768px, tablet 768-1023px, desktop ≥1024px)
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Clone-based infinite loops** for seamless carousel sliding

---

## Development Guidelines

### When Building New Components:

1. **Follow Naming Conventions:**
   - File: `battersea-[component].js`
   - Class: `ComponentName` (PascalCase)
   - Data attribute: `data-[component]`
   - Event prefix: `battersea:[component]Event`
   - CSS class: `.battersea-[component]-[element]`

2. **Use Utils Functions:**
   - `Utils.qs(selector, parent)` - querySelector wrapper
   - `Utils.qsa(selector, parent)` - querySelectorAll wrapper (returns Array)
   - `Utils.getData(el, attr)` - Get data attribute without `data-` prefix
   - `Utils.setData(el, attr, value)` - Set data attribute
   - `Utils.addEvent(el, event, handler, options)` - Add event with cleanup function return
   - `Utils.parseBoolean(str)` - Parse string to boolean
   - `Utils.parseInt(str, fallback)` - Safe parseInt with fallback
   - `Utils.debounce(fn, delay)` - Debounce function
   - `Utils.generateId(prefix)` - Generate unique ID
   - `Utils.getTransitionEndEvent()` - Get correct transitionend event name

3. **Component Requirements:**
   - Must have `destroy()` method for cleanup
   - Must register with `Battersea.register(name, class, selector)`
   - Must store event cleanup functions in `this.events = []`
   - Must validate required attributes/elements in constructor
   - Should dispatch custom events for important state changes
   - Should support keyboard navigation where applicable
   - Should work without JavaScript (progressive enhancement)

4. **Accessibility Checklist:**
   - Add ARIA labels where needed
   - Support keyboard navigation (Tab, Enter, Arrow keys, ESC)
   - Use semantic HTML
   - Ensure focus indicators are visible
   - Test with screen readers in mind
   - Add `aria-hidden="true"` to decorative elements

5. **Performance Best Practices:**
   - Use CSS transforms for animations (GPU accelerated)
   - Debounce resize/scroll events
   - Use IntersectionObserver for scroll-triggered components
   - Minimize DOM manipulation
   - Clean up event listeners in `destroy()`

6. **CSS/LESS Guidelines:**
   - Add styles to `battersea-library.less`
   - Use CSS variables for customization
   - Follow BEM-like naming: `.battersea-[component]__[element]--[modifier]`
   - Use existing color/animation variables
   - Ensure responsive design with mobile-first approach

---

## Planned Components (Roadmap)

### High Priority:
1. **Header** - Adaptive navigation with scroll-shrink, multi-level menus, mobile hamburger
2. **SmoothScroll** - Scroll-to-section with visual indicators, section detection, header offset
3. **Graphs** - Animated charts (line, bar, pie, area) with Canvas/SVG

### Medium Priority:
4. **DragDrop** - Reordering elements, moving between containers, sortable lists
5. **Breadcrumbs** - Navigation breadcrumb trail
6. **Timeline** - Vertical/horizontal timeline with animations
7. **Masonry** - Pinterest-style grid layout

### Future Considerations:
8. **DataTable** - Sortable, filterable tables with pagination
9. **ImageGallery** - Lightbox with thumbnails
10. **VideoPlayer** - Custom video player controls
11. **FormValidation** - Real-time form validation

---

## Component Development Workflow

### Phase 1: Planning
- Define component features and API
- List required data attributes
- Identify similar patterns in existing components
- Plan HTML structure and CSS classes
- Consider accessibility requirements

### Phase 2: Implementation
- Create `battersea-[component].js` following the pattern
- Add styles to `battersea-library.less`
- Implement core functionality
- Add event listeners with cleanup
- Register with Battersea core

### Phase 3: Testing
- Create demo page (e.g., `demo-[component].html`)
- Test all features and edge cases
- Test keyboard navigation
- Test responsive behavior
- Test browser compatibility
- Test with other components (integration)

### Phase 4: Documentation
- Update `README.md` with component documentation
- Add HTML examples
- Document all attributes
- List features
- Show event listeners
- Add troubleshooting notes if needed

---

## Important Technical Details

### Infinite Loop Implementation (Slider/MultiSlider):
Both sliders use a clone-based approach:
1. Clone first slide(s) and append to end
2. Clone last slide(s) and prepend to beginning
3. Navigate normally through items
4. When reaching a clone, detect via `transitionEnd` event
5. Instantly snap (transition: none) to the real corresponding item
6. The snap is so fast users never see it - creating seamless infinite loop

### Animation System:
- Uses IntersectionObserver for scroll detection
- Parent elements animate first
- Children wait 0.3s after parent completes
- Each child staggers by 0.1s
- Custom delay classes: `delay-1` through `delay-10` (each = 100ms)
- Animations only trigger once (uses `battersea-animated` class marker)
- Sets `opacity: 0; visibility: hidden;` initially via CSS

### Accordion Smooth Transitions:
- Uses `max-height` transitions (not `height`)
- Measures `scrollHeight` to determine target height
- Uses `requestAnimationFrame` for smooth animation start
- `void element.offsetHeight` to force reflow
- Sets `max-height: none` after transition completes

---

## Common Patterns & Solutions

### Pattern: Responsive Breakpoints
```javascript
updateResponsive() {
  const width = window.innerWidth;
  if (width < 768) {
    this.currentView = this.mobileView;
  } else if (width < 1024) {
    this.currentView = this.tabletView;
  } else {
    this.currentView = this.desktopView;
  }
}
```

### Pattern: Debounced Resize Handler
```javascript
this.events.push(
  Utils.addEvent(window, 'resize', Utils.debounce(() => {
    this.updateResponsive();
    this.recalculate();
  }, 250))
);
```

### Pattern: TransitionEnd Detection
```javascript
const transitionEnd = () => {
  element.removeEventListener(Utils.getTransitionEndEvent(), transitionEnd);
  // Do something after transition
};
element.addEventListener(Utils.getTransitionEndEvent(), transitionEnd, { once: true });
```

### Pattern: Custom Event Dispatch
```javascript
const event = new CustomEvent('battersea:componentEvent', {
  detail: { data: value }
});
this.el.dispatchEvent(event);
```

### Pattern: Keyboard Navigation
```javascript
this.events.push(
  Utils.addEvent(this.el, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'Escape') this.close();
  })
);
```

---

## CSS Variables

Default theme variables in `:root`:
```css
--battersea-primary: #007bff;
--battersea-secondary: #6c757d;
--battersea-text: #333;
--battersea-bg: #f8f9fa;
--battersea-animation-duration: 0.6s;
--battersea-animation-timing: ease-out;
--battersea-tooltip-bg: #333;
--battersea-tooltip-text: #fff;
--battersea-progress-bg: #e9ecef;
--battersea-progress-fill: #007bff;
--battersea-slider-arrow-bg: rgba(0, 0, 0, 0.5);
--battersea-slider-dot-bg: #ccc;
--battersea-slider-dot-active: #007bff;
```

---

## Testing Checklist

For each new component:
- [ ] Works without JavaScript (progressive enhancement)
- [ ] Keyboard accessible (Tab, Enter, Arrows, ESC)
- [ ] Touch/mobile friendly
- [ ] Responsive (mobile, tablet, desktop)
- [ ] ARIA labels present
- [ ] Custom events dispatched
- [ ] Cleanup in destroy() method
- [ ] No memory leaks (events cleaned up)
- [ ] Works with multiple instances
- [ ] Demo page created
- [ ] README.md updated
- [ ] Browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Integrates with other components

---

## When Helping Me:

1. **Always review existing components first** to maintain consistency
2. **Follow the established patterns** - don't reinvent the wheel
3. **Ask clarifying questions** if requirements are unclear
4. **Propose the structure** before building complex components
5. **Create demo pages** for testing new components
6. **Update documentation** after each component
7. **Consider accessibility** from the start, not as an afterthought
8. **Keep it modular** - components should work independently
9. **Optimize for performance** - use best practices
10. **Test edge cases** - think about what could go wrong

---

## File Organization Preference

When working on components:
- Keep all component JS in root directory initially
- LESS/CSS updates go directly into battersea-library.less
- Create demo files as: `demo-[component].html`
- Update README.md in place
- Version number only increments when a component is complete and tested

---

## My Coding Preferences

- **Vanilla JavaScript** - No frameworks or dependencies
- **ES6 syntax** - Use modern JavaScript features
- **Clear variable names** - Readable over clever
- **Comments** - Add comments for complex logic only
- **Consistent formatting** - Match existing code style
- **DRY principle** - Don't repeat yourself, use utils
- **Progressive enhancement** - Works without JS when possible
- **Mobile-first** - Design for mobile, enhance for desktop

---

## Known Issues to Avoid

1. **Don't use localStorage/sessionStorage** in artifacts (not supported in Claude.ai)
2. **Don't use display: none for animations** - causes layout shifts, use opacity + visibility
3. **Don't forget to disconnect IntersectionObservers** - memory leaks
4. **Don't use height transitions directly** - jerky animations, use max-height
5. **Clone elements need aria-hidden="true"** - for accessibility
6. **Always use Utils.addEvent** - returns cleanup function we need for destroy()
7. **TransitionEnd events need browser prefixes** - use Utils.getTransitionEndEvent()

---

## Success Metrics

A component is "done" when:
✅ All features work as specified
✅ Demo page demonstrates all features  
✅ Keyboard navigation works
✅ Mobile responsive
✅ No console errors
✅ Integrates with other components
✅ README.md updated
✅ Follows all established patterns
✅ Accessibility features present

---

**Remember:** Quality over speed. It's better to build one excellent component than rush through multiple half-baked ones.

**Current Focus:** Ready to build new components following the roadmap!
