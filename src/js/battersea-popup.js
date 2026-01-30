/**
 * Battersea Library - Popup Component
 * Version: 2.0.0
 * 
 * Usage:
 * <button data-popup-trigger="popup1">Open Popup</button>
 * 
 * <div data-popup="popup1">
 *   <div data-popup-close>×</div>
 *   <h2>Popup Title</h2>
 *   <p>Popup content goes here</p>
 * </div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Popup requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Popup {
    constructor(el) {
      this.el = el;
      this.id = Utils.getData(el, 'popup');
      this.overlay = null;
      this.wrapper = null;
      this.closeOnOverlay = Utils.parseBoolean(Utils.getData(el, 'popup-close-overlay') || 'true');
      this.events = [];

      if (!this.id) {
        console.warn('Popup element missing data-popup attribute');
        return;
      }

      this.init();
    }

    init() {
      this.createStructure();
      this.bindTriggers();
      this.bindClose();
    }

    createStructure() {
      // Create overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'battersea-popup-overlay';
      
      // Create wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'battersea-popup-wrapper';
      
      // Move popup content into wrapper
      this.el.style.display = 'block';
      this.wrapper.appendChild(this.el);
      this.overlay.appendChild(this.wrapper);
      
      // Add to body
      document.body.appendChild(this.overlay);
    }

    bindTriggers() {
      // Find all triggers for this popup
      const triggers = Utils.qsa(`[data-popup-trigger="${this.id}"]`);
      triggers.forEach(trigger => {
        this.events.push(
          Utils.addEvent(trigger, 'click', (e) => {
            e.preventDefault();
            this.open();
          })
        );
      });
    }

    bindClose() {
      // Close buttons
      const closeButtons = Utils.qsa('[data-popup-close]', this.el);
      closeButtons.forEach(btn => {
        this.events.push(
          Utils.addEvent(btn, 'click', (e) => {
            e.preventDefault();
            this.close();
          })
        );
      });

      // Close on overlay click
      if (this.closeOnOverlay) {
        this.events.push(
          Utils.addEvent(this.overlay, 'click', (e) => {
            if (e.target === this.overlay) {
              this.close();
            }
          })
        );
      }

      // Close on escape key
      this.events.push(
        Utils.addEvent(document, 'keydown', (e) => {
          if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
            this.close();
          }
        })
      );
    }

    open() {
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Dispatch custom event
      const event = new CustomEvent('battersea:popupOpen', {
        detail: { popupId: this.id }
      });
      this.el.dispatchEvent(event);
    }

    close() {
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';

      // Dispatch custom event
      const event = new CustomEvent('battersea:popupClose', {
        detail: { popupId: this.id }
      });
      this.el.dispatchEvent(event);
    }

    destroy() {
      this.events.forEach(event => event.remove());
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      document.body.style.overflow = '';
    }
  }

  // Register component with Battersea
  window.Battersea.register('popup', Popup, '[data-popup]');

})(window, document);
