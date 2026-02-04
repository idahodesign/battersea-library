/**
 * Battersea Library - Animation Component (Enhanced)
 * Version: 2.2.0
 * 
 * DEFAULT BEHAVIOR (CHANGED in v2.2.0):
 * - By default, children do NOT animate (they appear immediately)
 * - Use data-animate-children="true" to enable child cascade animation
 * 
 * FEATURES:
 * - data-animate-children="true" - Enable cascading child animations
 * - data-animate-children=".selector" - Only animate specific children
 * - Individual children can override with their own data-animate
 * 
 * Usage:
 * 
 * Basic (children appear immediately):
 * <section data-animate="fade-up">
 *   <div>Appears immediately</div>
 * </section>
 * 
 * With child cascade:
 * <section data-animate="fade-up" data-animate-children="true">
 *   <div>Fades in after parent</div>
 *   <div>Fades in with stagger</div>
 * </section>
 * 
 * Animate specific children only:
 * <section data-animate="fade-up" data-animate-children=".animate-me">
 *   <div class="animate-me">Animated</div>
 *   <div>Not animated</div>
 * </section>
 * 
 * Individual child override:
 * <section data-animate="fade-up">
 *   <div>Appears immediately</div>
 *   <button data-animate="fade-up" class="delay-2">Animates independently!</button>
 * </section>
 * 
 * Available animations: fade-in, fade-up, fade-down, fade-left, fade-right
 * Delay classes: delay-1 through delay-10 (delay-5 = 0.5 seconds)
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Animation requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Animation {
    constructor(el) {
      this.el = el;
      this.animation = Utils.getData(el, 'animate');
      this.animateChildren = Utils.getData(el, 'animate-children'); // NEW: Control child animation
      this.observer = null;
      this.isAnimating = false;
      this.hasAnimated = false;

      if (!this.animation) {
        console.warn('Animation element missing data-animate attribute');
        return;
      }

      // Only hide/animate children if explicitly set to "true"
      // Default is to NOT animate children (changed from previous behavior)
      if (this.animateChildren === 'true') {
        this.hideChildren(this.el);
      }
      
      this.init();
    }

    hideChildren(element) {
      // If animateChildren is a selector, only hide matching elements
      if (this.animateChildren && this.animateChildren !== 'false' && this.animateChildren !== 'true') {
        // It's a selector - only hide elements matching this selector
        const targetChildren = element.querySelectorAll(this.animateChildren);
        targetChildren.forEach(child => {
          if (!Utils.getData(child, 'animate')) {
            child.style.opacity = '0';
            child.style.visibility = 'hidden';
          }
        });
        return;
      }

      // Default behavior: hide all children without data-animate
      const children = Array.from(element.children);
      children.forEach(child => {
        if (!Utils.getData(child, 'animate')) {
          child.style.opacity = '0';
          child.style.visibility = 'hidden';
          
          // Only recurse if animateChildren is "true"
          if (this.animateChildren === 'true') {
            this.hideChildrenRecursive(child);
          }
        }
      });
    }
    
    // NEW: Separate recursive method for cleaner control
    hideChildrenRecursive(element) {
      const children = Array.from(element.children);
      children.forEach(child => {
        if (!Utils.getData(child, 'animate')) {
          child.style.opacity = '0';
          child.style.visibility = 'hidden';
          this.hideChildrenRecursive(child);
        }
      });
    }

    init() {
      this.setupObserver();
    }

    setupObserver() {
      if (!('IntersectionObserver' in window)) {
        this.animate();
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated && !this.isAnimating) {
            // Mark as animating (hasAnimated will be set in animate())
            this.isAnimating = true;
            
            // Disconnect observer immediately
            this.observer.disconnect();
            this.observer = null;
            
            // Start animation
            this.animate();
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px'
      });

      this.observer.observe(this.el);
    }

    animate() {
      // Prevent any chance of double execution
      if (this.hasAnimated) {
        return;
      }
      this.hasAnimated = true;
      
      // Get delay from class (e.g., delay-5 = 500ms)
      const customDelay = this.getDelay(this.el);
      
      // Total delay: 500ms base + custom delay
      const totalDelay = 500 + customDelay;
      
      setTimeout(() => {
        this.el.style.visibility = 'visible';
        this.el.style.opacity = '1';
        this.el.classList.add('battersea-animated', `battersea-${this.animation}`);
        
        // After animation completes, show all children
        setTimeout(() => {
          // Only cascade children if explicitly set to "true"
          if (this.animateChildren === 'true') {
            this.showChildren(this.el);
          } else {
            // Default: show children immediately without animation
            this.showAllChildren(this.el);
          }
        }, 600); // Match animation duration
      }, totalDelay);
    }
    
    showChildren(element) {
      const children = Array.from(element.children);
      children.forEach((child, index) => {
        if (!Utils.getData(child, 'animate')) {
          const childDelay = this.getDelay(child);
          // Add stagger delay based on index (100ms per child)
          const staggerDelay = childDelay + (index * 100);
          
          setTimeout(() => {
            child.style.visibility = 'visible';
            child.style.opacity = '1';
            // Add animation classes to make children fade in
            child.classList.add('battersea-animated', `battersea-${this.animation}`);
            this.showChildren(child); // Recursively show
          }, staggerDelay);
        }
      });
    }
    
    // NEW: Show all children immediately without delays
    showAllChildren(element) {
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        const hasOwnAnimation = Utils.getData(el, 'animate');
        // Skip elements with their own data-animate (they'll animate themselves)
        if (el.style.visibility === 'hidden' && !hasOwnAnimation) {
          el.style.visibility = 'visible';
          el.style.opacity = '1';
        }
      });
    }

    getDelay(element) {
      const classes = element.className.split(' ');
      const delayClass = classes.find(cls => cls.startsWith('delay-'));
      
      if (delayClass) {
        const delayValue = parseInt(delayClass.replace('delay-', ''), 10);
        return delayValue * 100; // delay-5 = 500ms
      }
      
      return 0;
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }

  // Register with Battersea Core
  window.Battersea.register('animation', Animation, '[data-animate]');

})(window, document);
