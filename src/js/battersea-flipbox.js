/**
 * Battersea Library - Flipbox Component
 * Version: 2.0.5
 * 
 * Flip card animation effect
 * 
 * Usage:
 * <div data-flipbox data-flipbox-direction="horizontal" data-flipbox-trigger="hover">
 *   <div data-flipbox-front>
 *     Front content
 *   </div>
 *   <div data-flipbox-back>
 *     Back content
 *   </div>
 * </div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Flipbox requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Flipbox {
    constructor(el) {
      if (!el) return;
      
      this.el = el;
      this.direction = Utils.getData(el, 'flipbox-direction') || 'horizontal'; // horizontal or vertical
      this.trigger = Utils.getData(el, 'flipbox-trigger') || 'hover'; // hover or click
      this.isFlipped = false;
      this.events = [];
      
      this.init();
    }

    init() {
      // Add direction class
      this.el.classList.add(`battersea-flipbox-${this.direction}`);
      
      // Bind events based on trigger type
      if (this.trigger === 'hover') {
        this.events.push(
          Utils.addEvent(this.el, 'mouseenter', () => this.flip()),
          Utils.addEvent(this.el, 'mouseleave', () => this.unflip())
        );
      } else {
        this.events.push(
          Utils.addEvent(this.el, 'click', () => this.toggle())
        );
      }
    }

    flip() {
      this.isFlipped = true;
      this.el.classList.add('battersea-flipbox-flipped');
      
      // Dispatch custom event
      const event = new CustomEvent('battersea:flipboxFlip', {
        detail: { isFlipped: true }
      });
      this.el.dispatchEvent(event);
    }

    unflip() {
      this.isFlipped = false;
      this.el.classList.remove('battersea-flipbox-flipped');
      
      // Dispatch custom event
      const event = new CustomEvent('battersea:flipboxFlip', {
        detail: { isFlipped: false }
      });
      this.el.dispatchEvent(event);
    }

    toggle() {
      if (this.isFlipped) {
        this.unflip();
      } else {
        this.flip();
      }
    }

    destroy() {
      this.events.forEach(event => event.remove());
    }
  }

  // Register component with Battersea
  window.Battersea.register('flipbox', Flipbox, '[data-flipbox]');

})(window, document);
