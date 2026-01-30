/**
 * Battersea Library - SmoothScroll Component
 * Version: 2.1.0
 * 
 * Smooth scroll-to-section with visual navigation dots
 * 
 * Usage:
 * <div data-smoothscroll 
 *      data-smoothscroll-offset="80"
 *      data-smoothscroll-header-selector="#header"
 *      data-smoothscroll-position="right"
 *      data-smoothscroll-duration="800"
 *      data-smoothscroll-easing="ease-in-out"
 *      data-smoothscroll-hide-mobile="true">
 * </div>
 * 
 * <div data-scroll-section data-scroll-title="Introduction" id="intro">
 *   Section content
 * </div>
 * 
 * Options:
 * - data-smoothscroll-offset: Static offset in pixels (default: 0)
 * - data-smoothscroll-header-selector: CSS selector for dynamic header (overrides offset)
 * - data-smoothscroll-position: "left" or "right" (default: "right")
 * - data-smoothscroll-duration: Animation duration in ms (default: 800)
 * - data-smoothscroll-easing: "linear", "ease-in", "ease-out", "ease-in-out" (default: "ease-in-out")
 * - data-smoothscroll-hide-mobile: Hide on mobile screens (default: true)
 * 
 * Dependencies: battersea-utils.js, battersea-core.js, battersea-tooltip.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('SmoothScroll requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class SmoothScroll {
    constructor(el) {
      this.el = el;
      this.sections = [];
      this.dots = [];
      this.dotsContainer = null;
      this.activeDotIndex = -1;
      this.offset = 0;
      this.position = 'right';
      this.duration = 800;
      this.easing = 'ease-out'; // Default to ease-out for smooth deceleration
      this.hideMobile = true;
      this.observer = null;
      this.events = [];
      this.isScrolling = false;
      this.resizeTimer = null;

      this.init();
    }

    init() {
      this.parseOptions();
      this.findSections();
      
      if (this.sections.length === 0) {
        console.warn('SmoothScroll: No sections found with [data-scroll-section]');
        return;
      }

      // Initialize lastKnownOffset if using dynamic header
      if (this.headerElement) {
        this.lastKnownOffset = this.getCurrentOffset();
      }

      this.createNavigation();
      this.setupIntersectionObserver();
      this.bindEvents();
    }

    parseOptions() {
      // Read all data attributes with defaults
      this.offset = Utils.parseInt(Utils.getData(this.el, 'smoothscroll-offset'), 0);
      this.headerSelector = Utils.getData(this.el, 'smoothscroll-header-selector') || '';
      this.headerElement = null;
      this.position = Utils.getData(this.el, 'smoothscroll-position') || 'right';
      this.duration = Utils.parseInt(Utils.getData(this.el, 'smoothscroll-duration'), 800);
      this.easing = Utils.getData(this.el, 'smoothscroll-easing') || 'ease-in-out';
      this.hideMobile = Utils.parseBoolean(Utils.getData(this.el, 'smoothscroll-hide-mobile') || 'true');
      
      // If header selector is provided, find the header element
      if (this.headerSelector) {
        this.headerElement = Utils.qs(this.headerSelector);
        if (!this.headerElement) {
          console.warn(`SmoothScroll: Header element not found with selector "${this.headerSelector}"`);
        }
      }
    }

    findSections() {
      // Find all elements with [data-scroll-section] attribute
      const sectionElements = Utils.qsa('[data-scroll-section]');
      
      sectionElements.forEach((element, index) => {
        const title = Utils.getData(element, 'scroll-title');
        
        if (!title) {
          console.warn('Section missing data-scroll-title:', element);
          return;
        }

        // Get or generate ID
        let id = element.id;
        if (!id) {
          id = Utils.generateId('scroll-section');
          element.id = id;
        }

        this.sections.push({
          element: element,
          title: title,
          id: id,
          index: index
        });
      });
    }

    getCurrentOffset() {
      // If header selector is provided and element exists, measure its height dynamically
      if (this.headerElement) {
        // Use getComputedStyle to get the CSS height value (not mid-transition offsetHeight)
        // This ensures we get the target height immediately, even during CSS transitions
        const computedStyle = window.getComputedStyle(this.headerElement);
        const height = parseFloat(computedStyle.height);
        return height || 0;
      }
      // Otherwise, use the static offset value
      return this.offset;
    }

    createNavigation() {
      // Create container
      this.dotsContainer = document.createElement('nav');
      this.dotsContainer.className = `battersea-scroll-nav battersea-scroll-${this.position}`;
      this.dotsContainer.setAttribute('role', 'navigation');
      this.dotsContainer.setAttribute('aria-label', 'Page sections');
      
      if (this.hideMobile) {
        this.dotsContainer.classList.add('battersea-scroll-hide-mobile');
      }

      // Create dots for each section
      this.sections.forEach((section, index) => {
        const dot = document.createElement('button');
        dot.className = 'battersea-scroll-dot';
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', `Go to ${section.title}`);
        
        // Add tooltip with custom styling
        dot.setAttribute('data-tooltip', section.title);
        dot.setAttribute('data-tooltip-position', this.position === 'left' ? 'right' : 'left');
        dot.setAttribute('data-tooltip-class', 'battersea-scroll-tooltip');
        
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      });

      // Add to document
      document.body.appendChild(this.dotsContainer);
      
      // Initialize tooltips ONLY for the newly created dots
      // Instead of calling Battersea.init() which re-initializes everything,
      // we manually initialize just the tooltip component for our dots
      this.initializeTooltips();
    }

    initializeTooltips() {
      // Check if Tooltip component is registered
      if (!window.Battersea.components['tooltip']) {
        console.warn('Tooltip component not found');
        return;
      }

      // Initialize tooltips only for our dots
      this.dots.forEach(dot => {
        // Check if tooltip is already initialized
        const instanceId = Utils.getData(dot, 'battersea-instance');
        if (instanceId) return; // Already initialized

        // Manually create a Tooltip instance
        const TooltipClass = window.Battersea.components['tooltip'].Class;
        try {
          const instance = new TooltipClass(dot);
          const id = Utils.generateId('tooltip');
          Utils.setData(dot, 'battersea-instance', id);
          window.Battersea.components['tooltip'].instances.push({ 
            id, 
            instance, 
            element: dot 
          });
        } catch (error) {
          console.error('Error initializing tooltip:', error);
        }
      });
    }

    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported');
        // Fallback: set first section as active
        if (this.sections.length > 0) {
          this.updateActiveState(0);
        }
        return;
      }

      // Get current offset (dynamic or static)
      const currentOffset = this.getCurrentOffset();
      const rootMargin = currentOffset > 0 ? `-${currentOffset}px 0px 0px 0px` : '0px';

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // Only update active state when scrolling naturally (not programmatically)
          if (entry.isIntersecting && !this.isScrolling) {
            const index = this.sections.findIndex(s => s.element === entry.target);
            if (index !== -1) {
              this.updateActiveState(index);
            }
          }
        });
      }, {
        threshold: 0.5,
        rootMargin: rootMargin
      });

      // Observe all sections
      this.sections.forEach(section => {
        this.observer.observe(section.element);
      });
    }

    reconnectObserver() {
      // Disconnect existing observer
      if (this.observer) {
        this.observer.disconnect();
      }
      
      // Recreate with new offset
      this.setupIntersectionObserver();
    }

    bindEvents() {
      // Bind click and keyboard events to each dot
      this.dots.forEach((dot, index) => {
        this.events.push(
          Utils.addEvent(dot, 'click', () => this.scrollToSection(index)),
          Utils.addEvent(dot, 'keydown', (e) => this.handleKeydown(e, index))
        );
      });

      // Handle window resize with debouncing
      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(() => {
          this.handleResize();
        }, 250))
      );

      // If using dynamic header detection, also monitor scroll events
      // to detect header size changes (e.g., shrinking header on scroll)
      if (this.headerElement) {
        this.events.push(
          Utils.addEvent(window, 'scroll', Utils.throttle(() => {
            this.checkHeaderSizeChange();
          }, 100))
        );
      }
    }

    checkHeaderSizeChange() {
      if (!this.headerElement) return;
      
      const currentOffset = this.getCurrentOffset();
      
      // If header height changed significantly (more than 1px to avoid jitter)
      if (Math.abs(this.lastKnownOffset - currentOffset) > 1) {
        this.lastKnownOffset = currentOffset;
        this.reconnectObserver();
      }
    }

    handleKeydown(e, index) {
      // Enter or Space = scroll to section
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.scrollToSection(index);
      }
      
      // Arrow Up = focus previous dot
      if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        this.dots[index - 1].focus();
      }
      
      // Arrow Down = focus next dot
      if (e.key === 'ArrowDown' && index < this.dots.length - 1) {
        e.preventDefault();
        this.dots[index + 1].focus();
      }
    }

    scrollToSection(index) {
      if (this.isScrolling) return;
      
      const section = this.sections[index];
      if (!section || !section.element) return;

      this.isScrolling = true;

      // Pass the section element to smoothScrollTo so it can recalculate target dynamically
      this.smoothScrollTo(section.element, this.duration, () => {
        this.isScrolling = false;
        this.updateActiveState(index);
        
        // Dispatch custom event
        const event = new CustomEvent('battersea:scrollSectionChange', {
          detail: { 
            index: index,
            section: section
          }
        });
        this.el.dispatchEvent(event);
      });
    }

    smoothScrollTo(targetElement, duration, callback) {
      const startY = window.pageYOffset;
      const startTime = performance.now();

      const scroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = this.applyEasing(progress);

        // CRITICAL: Recalculate target position on every frame
        // This handles dynamic headers that change size during scroll
        const currentOffset = this.getCurrentOffset();
        const rect = targetElement.getBoundingClientRect();
        const targetY = rect.top + window.pageYOffset - currentOffset;
        
        // Calculate distance from current position
        const currentY = window.pageYOffset;
        const distance = targetY - startY;

        window.scrollTo(0, startY + distance * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(scroll);
        } else {
          if (callback) callback();
        }
      };

      requestAnimationFrame(scroll);
    }

    applyEasing(t) {
      // Apply easing function based on this.easing
      switch (this.easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t * t; // Cubic ease-in
        case 'ease-out':
          // Cubic ease-out - smooth deceleration at the end
          return 1 - Math.pow(1 - t, 3);
        case 'ease-in-out':
          // Cubic ease-in-out
          return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        default:
          // Default to ease-out
          return 1 - Math.pow(1 - t, 3);
      }
    }

    updateActiveState(index) {
      if (this.activeDotIndex === index) return;

      // Remove old active state
      if (this.activeDotIndex !== -1 && this.dots[this.activeDotIndex]) {
        this.dots[this.activeDotIndex].classList.remove('active');
        this.dots[this.activeDotIndex].setAttribute('aria-current', 'false');
      }

      // Add new active state
      this.activeDotIndex = index;
      if (this.dots[index]) {
        this.dots[index].classList.add('active');
        this.dots[index].setAttribute('aria-current', 'true');
      }

      // Dispatch event for active section change (natural scrolling)
      if (!this.isScrolling) {
        const event = new CustomEvent('battersea:scrollSectionChange', {
          detail: { 
            index: index,
            section: this.sections[index]
          }
        });
        this.el.dispatchEvent(event);
      }
    }

    handleResize() {
      // If we're using dynamic header detection, check if header height changed
      if (this.headerElement) {
        const currentOffset = this.getCurrentOffset();
        
        // If header height changed, reconnect observer with new rootMargin
        if (this.lastKnownOffset !== currentOffset) {
          this.lastKnownOffset = currentOffset;
          this.reconnectObserver();
        }
      }
    }

    destroy() {
      // Disconnect observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      // Remove all event listeners
      this.events.forEach(event => event.remove());
      this.events = [];

      // Remove navigation from DOM
      if (this.dotsContainer && this.dotsContainer.parentNode) {
        this.dotsContainer.parentNode.removeChild(this.dotsContainer);
      }

      // Clear references
      this.sections = [];
      this.dots = [];
      this.dotsContainer = null;
    }
  }

  // Register component with Battersea
  window.Battersea.register('smoothscroll', SmoothScroll, '[data-smoothscroll]');

})(window, document);
