/**
 * Battersea Library - Utilities
 * Version: 2.0.0
 * Shared utility functions for all Battersea components
 */

(function(window) {
  'use strict';

  const BatterseaUtils = {
    /**
     * Get data attribute value from element
     */
    getData: function(el, attr) {
      return el.getAttribute(`data-${attr}`);
    },

    /**
     * Set data attribute on element
     */
    setData: function(el, attr, value) {
      el.setAttribute(`data-${attr}`, value);
    },

    /**
     * Debounce function to limit execution rate
     */
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle function to limit execution rate
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport: function(el, offset = 0) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= -offset &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    /**
     * Get all siblings of an element
     */
    getSiblings: function(el) {
      return Array.from(el.parentNode.children).filter(child => child !== el);
    },

    /**
     * Add event listener with automatic cleanup tracking
     */
    addEvent: function(el, event, handler, options) {
      el.addEventListener(event, handler, options);
      return {
        remove: () => el.removeEventListener(event, handler, options)
      };
    },

    /**
     * Generate unique ID
     */
    generateId: function(prefix = 'battersea') {
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Parse boolean from string
     */
    parseBoolean: function(value) {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return false;
    },

    /**
     * Parse integer with fallback
     */
    parseInt: function(value, fallback = 0) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? fallback : parsed;
    },

    /**
     * Parse float with fallback
     */
    parseFloat: function(value, fallback = 0) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    },

    /**
     * Get element offset from top of page
     */
    getOffset: function(el) {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      };
    },

    /**
     * Check if touch device
     */
    isTouchDevice: function() {
      return ('ontouchstart' in window) || 
             (navigator.maxTouchPoints > 0) || 
             (navigator.msMaxTouchPoints > 0);
    },

    /**
     * Get transition/animation end event name
     */
    getTransitionEndEvent: function() {
      const transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      const el = document.createElement('div');
      for (let t in transitions) {
        if (el.style[t] !== undefined) {
          return transitions[t];
        }
      }
      return 'transitionend';
    },

    /**
     * Deep merge objects
     */
    deepMerge: function(target, ...sources) {
      if (!sources.length) return target;
      const source = sources.shift();

      if (this.isObject(target) && this.isObject(source)) {
        for (const key in source) {
          if (this.isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            this.deepMerge(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }

      return this.deepMerge(target, ...sources);
    },

    /**
     * Check if value is an object
     */
    isObject: function(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * Safely query selector
     */
    qs: function(selector, context = document) {
      try {
        return context.querySelector(selector);
      } catch (e) {
        console.warn('Invalid selector:', selector);
        return null;
      }
    },

    /**
     * Safely query selector all
     */
    qsa: function(selector, context = document) {
      try {
        return Array.from(context.querySelectorAll(selector));
      } catch (e) {
        console.warn('Invalid selector:', selector);
        return [];
      }
    }
  };

  // Expose to window
  window.BatterseaUtils = BatterseaUtils;

})(window);
