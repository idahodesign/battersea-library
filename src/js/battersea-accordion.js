/**
 * Battersea Library - Accordion Component
 * Version: 2.0.1 - FIXED for nested accordions
 * 
 * Usage:
 * <div data-accordion data-accordion-multiple="false">
 *   <div data-accordion-item>
 *     <div data-accordion-header>Header 1</div>
 *     <div data-accordion-content>Content 1</div>
 *   </div>
 *   <div data-accordion-item class="active">
 *     <div data-accordion-header>Header 2</div>
 *     <div data-accordion-content>Content 2</div>
 *   </div>
 * </div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Accordion requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Accordion {
    constructor(el) {
      this.el = el;
      this.allowMultiple = Utils.parseBoolean(Utils.getData(el, 'accordion-multiple') || 'false');
      
      // FIXED: Only select direct child accordion items, not nested ones
      // OLD: this.items = Utils.qsa('[data-accordion-item]', el);
      this.items = Array.from(el.children).filter(child => 
        child.hasAttribute('data-accordion-item')
      );
      
      this.events = [];

      if (this.items.length === 0) {
        console.warn('Accordion element has no items');
        return;
      }

      this.init();
    }

    init() {
      this.items.forEach((item, index) => {
        // FIXED: Use querySelector with :scope to only select direct child header/content
        const header = item.querySelector(':scope > [data-accordion-header]');
        const content = item.querySelector(':scope > [data-accordion-content]');

        if (!header || !content) {
          console.warn('Accordion item missing header or content');
          return;
        }

        // Set initial state
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.4s ease';
        
        if (item.classList.contains('active')) {
          // If active, set to natural height
          content.style.maxHeight = 'none';
        } else {
          // If not active, collapse it
          content.style.maxHeight = '0px';
        }

        // Bind click event
        this.events.push(
          Utils.addEvent(header, 'click', (e) => {
            // FIXED: Stop propagation to prevent nested accordion clicks from affecting parent
            e.stopPropagation();
            this.toggle(item);
          })
        );
      });
    }

    toggle(item) {
      const isActive = item.classList.contains('active');
      const content = item.querySelector(':scope > [data-accordion-content]');

      if (!this.allowMultiple) {
        // Close all other items
        this.items.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            this.close(otherItem);
          }
        });
      }

      if (isActive) {
        this.close(item);
      } else {
        this.open(item);
      }

      // Dispatch custom event
      const event = new CustomEvent('battersea:accordionToggle', {
        detail: { item, isOpen: !isActive }
      });
      this.el.dispatchEvent(event);
    }

    open(item) {
      const content = item.querySelector(':scope > [data-accordion-content]');
      if (!content) return;

      // Ensure content is visible for measurement
      content.style.display = 'block';
      content.style.overflow = 'hidden';
      
      // Measure actual height
      const height = content.scrollHeight;
      
      // Set to 0 first
      content.style.maxHeight = '0px';
      
      // Force reflow
      void content.offsetHeight;
      
      // Add active class
      item.classList.add('active');
      
      // Use requestAnimationFrame to ensure CSS transition applies
      requestAnimationFrame(() => {
        content.style.maxHeight = height + 'px';
      });
      
      // After transition, allow natural sizing
      const transitionEnd = () => {
        if (item.classList.contains('active')) {
          content.style.maxHeight = 'none';
          content.style.overflow = 'visible';
        }
        content.removeEventListener(Utils.getTransitionEndEvent(), transitionEnd);
      };
      content.addEventListener(Utils.getTransitionEndEvent(), transitionEnd, { once: true });
    }

    close(item) {
      const content = item.querySelector(':scope > [data-accordion-content]');
      if (!content) return;

      // Set current height explicitly
      const height = content.scrollHeight;
      content.style.maxHeight = height + 'px';
      content.style.overflow = 'hidden';
      
      // Force reflow
      void content.offsetHeight;
      
      // Remove active class
      item.classList.remove('active');
      
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        content.style.maxHeight = '0px';
      });
      
      // After transition, hide completely
      const transitionEnd = () => {
        if (!item.classList.contains('active')) {
          content.style.display = 'none';
          content.style.maxHeight = '';
          content.style.overflow = '';
        }
        content.removeEventListener(Utils.getTransitionEndEvent(), transitionEnd);
      };
      content.addEventListener(Utils.getTransitionEndEvent(), transitionEnd, { once: true });
    }

    destroy() {
      this.events.forEach(event => event.remove());
    }
  }

  // Register component with Battersea
  window.Battersea.register('accordion', Accordion, '[data-accordion]');

})(window, document);
