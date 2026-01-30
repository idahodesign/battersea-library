/**
 * Battersea Library - Parallax Component
 * Version: 2.0.0
 * 
 * Background parallax scrolling effect
 * 
 * Usage:
 * <div data-parallax data-parallax-speed="0.5" style="background-image: url('image.jpg'); height: 400px;">
 *   Content here
 * </div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Parallax requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Parallax {
    constructor(el) {
      if (!el) return;
      
      this.el = el;
      this.speed = Utils.parseFloat(Utils.getData(el, 'parallax-speed'), 0.5);
      this.events = [];
      
      this.init();
    }

    init() {
      // Ensure background covers the container
      this.el.style.backgroundSize = 'cover';
      this.el.style.backgroundPosition = 'center center';
      
      // Bind update method
      this.updateBound = this.update.bind(this);
      
      this.events.push(
        Utils.addEvent(window, 'scroll', Utils.throttle(this.updateBound, 10)),
        Utils.addEvent(window, 'resize', this.updateBound)
      );
      
      this.update();
    }

    update() {
      const rect = this.el.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;
      const elementHeight = this.el.offsetHeight;
      
      // Calculate if element is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        // Calculate parallax offset
        const viewportCenter = scrolled + windowHeight / 2;
        const elementCenter = elementTop + elementHeight / 2;
        const distance = viewportCenter - elementCenter;
        const yPos = distance * this.speed;
        
        this.el.style.backgroundPosition = `center calc(50% + ${yPos}px)`;
      }
    }

    destroy() {
      this.events.forEach(event => event.remove());
    }
  }

  // Register component with Battersea
  window.Battersea.register('parallax', Parallax, '[data-parallax]');

})(window, document);
