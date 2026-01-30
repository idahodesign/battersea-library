/**
 * Battersea Library - Counter Component
 * Version: 2.0.0
 * 
 * Usage:
 * <div data-counter data-counter-end="1000" data-counter-duration="2000" data-counter-prefix="$" data-counter-suffix="+">0</div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Counter requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Counter {
    constructor(el) {
      this.el = el;
      this.start = Utils.parseFloat(Utils.getData(el, 'counter-start') || '0');
      this.end = Utils.parseFloat(Utils.getData(el, 'counter-end') || el.textContent);
      this.duration = Utils.parseInt(Utils.getData(el, 'counter-duration'), 2000);
      this.prefix = Utils.getData(el, 'counter-prefix') || '';
      this.suffix = Utils.getData(el, 'counter-suffix') || '';
      this.decimals = Utils.parseInt(Utils.getData(el, 'counter-decimals'), 0);
      this.separator = Utils.getData(el, 'counter-separator') || ',';
      this.observer = null;
      this.hasAnimated = false;

      this.init();
    }

    init() {
      this.el.textContent = this.formatNumber(this.start);
      this.setupObserver();
    }

    setupObserver() {
      if (!('IntersectionObserver' in window)) {
        this.count();
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.count();
            this.hasAnimated = true;
          }
        });
      }, {
        threshold: 0.5
      });

      this.observer.observe(this.el);
    }

    count() {
      const range = this.end - this.start;
      const increment = range / (this.duration / 16); // 60fps
      let current = this.start;
      
      const timer = setInterval(() => {
        current += increment;
        
        if ((increment > 0 && current >= this.end) || (increment < 0 && current <= this.end)) {
          current = this.end;
          clearInterval(timer);
        }
        
        this.el.textContent = this.formatNumber(current);
      }, 16);
    }

    formatNumber(num) {
      let formatted = num.toFixed(this.decimals);
      
      // Add thousand separators
      if (this.separator) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.separator);
        formatted = parts.join('.');
      }
      
      return this.prefix + formatted + this.suffix;
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Register component with Battersea
  window.Battersea.register('counter', Counter, '[data-counter]');

})(window, document);
