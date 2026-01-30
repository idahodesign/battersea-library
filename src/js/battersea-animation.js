/**
 * Battersea Library - Animation Component
 * Version: 2.0.6
 * 
 * Usage:
 * <div data-animate="fade-up" class="delay-5">Content</div>
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
      this.observer = null;
      this.isAnimating = false;
      this.hasAnimated = false;

      if (!this.animation) {
        console.warn('Animation element missing data-animate attribute');
        return;
      }

      // Immediately hide children without their own animate attribute
      this.hideChildren(this.el);
      
      this.init();
    }

    hideChildren(element) {
      const children = Array.from(element.children);
      children.forEach(child => {
        if (!Utils.getData(child, 'animate')) {
          child.style.opacity = '0';
          child.style.visibility = 'hidden';
          this.hideChildren(child); // Recursively hide
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
        
        // Wait for animation to complete
        const duration = parseFloat(getComputedStyle(this.el).animationDuration) * 1000 || 600;
        
        setTimeout(() => {
          this.animateChildren(this.el, this.animation);
          this.isAnimating = false;
        }, duration);
      }, totalDelay);
    }

    animateChildren(parent, parentAnimation) {
      const children = Array.from(parent.children);
      
      if (children.length === 0) return;

      children.forEach((child, index) => {
        const childAnimation = Utils.getData(child, 'animate');
        
        // Only animate children without their own animation setting
        if (!childAnimation && !child.classList.contains('battersea-animated')) {
          child.classList.add('battersea-animated');
          
          // Child delay: 300ms base + custom delay + stagger
          const customDelay = this.getDelay(child);
          const childDelay = 300 + customDelay + (index * 100);
          
          setTimeout(() => {
            child.style.visibility = 'visible';
            child.style.opacity = '1';
            child.classList.add(`battersea-${parentAnimation}`);
            
            // Animate grandchildren
            const animationDuration = parseFloat(getComputedStyle(child).animationDuration) * 1000 || 600;
            setTimeout(() => {
              this.animateGrandchildren(child, parentAnimation);
            }, animationDuration);
          }, childDelay);
        }
      });
    }

    animateGrandchildren(child, animation) {
      const grandchildren = Array.from(child.children);
      
      if (grandchildren.length === 0) return;

      grandchildren.forEach((grandchild, gIndex) => {
        const grandchildAnimation = Utils.getData(grandchild, 'animate');
        
        if (!grandchildAnimation && !grandchild.classList.contains('battersea-animated')) {
          grandchild.classList.add('battersea-animated');
          
          const customDelay = this.getDelay(grandchild);
          const grandchildDelay = 300 + customDelay + (gIndex * 100);
          
          setTimeout(() => {
            grandchild.style.visibility = 'visible';
            grandchild.style.opacity = '1';
            grandchild.classList.add(`battersea-${animation}`);
          }, grandchildDelay);
        }
      });
    }

    getDelay(el) {
      const classes = el.className.split(' ');
      const delayClass = classes.find(cls => cls.startsWith('delay-'));
      
      if (delayClass) {
        const delayValue = parseInt(delayClass.replace('delay-', ''));
        return delayValue * 100; // delay-5 = 500ms
      }
      
      return 0;
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Register component with Battersea
  window.Battersea.register('animation', Animation, '[data-animate]');

})(window, document);
