/**
 * Battersea Library - Tooltip Component
 * Version: 2.0.1
 * 
 * Usage: 
 * <div data-tooltip="Your text here" data-tooltip-position="top">Hover me</div>
 * <div data-tooltip="Custom styled" data-tooltip-class="my-custom-tooltip">With custom class</div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Tooltip requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Tooltip {
    constructor(el) {
      this.el = el;
      this.text = Utils.getData(el, 'tooltip');
      this.position = Utils.getData(el, 'tooltip-position') || 'top';
      this.customClass = Utils.getData(el, 'tooltip-class') || '';
      this.tooltipEl = null;
      this.events = [];

      if (!this.text) {
        console.warn('Tooltip element missing data-tooltip attribute');
        return;
      }

      this.init();
    }

    init() {
      this.createTooltip();
      this.bindEvents();
    }

    createTooltip() {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.className = `battersea-tooltip battersea-tooltip-${this.position}`;
      
      // Add custom class if provided
      if (this.customClass) {
        this.tooltipEl.classList.add(this.customClass);
      }
      
      this.tooltipEl.textContent = this.text;
      document.body.appendChild(this.tooltipEl);
    }

    bindEvents() {
      this.events.push(
        Utils.addEvent(this.el, 'mouseenter', () => this.show()),
        Utils.addEvent(this.el, 'mouseleave', () => this.hide()),
        Utils.addEvent(this.el, 'focus', () => this.show()),
        Utils.addEvent(this.el, 'blur', () => this.hide())
      );
    }

    show() {
      if (!this.tooltipEl) return;

      const rect = this.el.getBoundingClientRect();
      const tooltipRect = this.tooltipEl.getBoundingClientRect();

      let top, left;

      switch (this.position) {
        case 'top':
          top = rect.top - tooltipRect.height - 10;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.left - tooltipRect.width - 10;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.right + 10;
          break;
        default:
          top = rect.top - tooltipRect.height - 10;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      }

      this.tooltipEl.style.top = `${top}px`;
      this.tooltipEl.style.left = `${left}px`;
      
      // Use setTimeout to ensure transform transition works
      setTimeout(() => {
        this.tooltipEl.classList.add('battersea-tooltip-show');
      }, 10);
    }

    hide() {
      if (!this.tooltipEl) return;
      this.tooltipEl.classList.remove('battersea-tooltip-show');
    }

    destroy() {
      this.events.forEach(event => event.remove());
      if (this.tooltipEl && this.tooltipEl.parentNode) {
        this.tooltipEl.parentNode.removeChild(this.tooltipEl);
      }
    }
  }

  // Register component with Battersea
  window.Battersea.register('tooltip', Tooltip, '[data-tooltip]');

})(window, document);
