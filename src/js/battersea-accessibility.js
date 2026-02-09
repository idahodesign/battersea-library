/**
 * Battersea Library - Accessibility Component
 * Version: 1.1.0
 *
 * Usage:
 * <button data-accessibility aria-label="Adjust text size">Aa</button>
 *
 * Options (data attributes):
 * data-accessibility-min="80"    - Minimum font size percentage (default: 80)
 * data-accessibility-max="200"   - Maximum font size percentage (default: 200)
 * data-accessibility-step="10"   - Slider step increment (default: 10)
 *
 * Events:
 * battersea:fontSizeChange - Fired when font size changes, detail: { percentage }
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Accessibility requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;
  const STORAGE_KEY = 'battersea-font-size';

  class Accessibility {
    constructor(el) {
      this.el = el;
      this.panel = null;
      this.slider = null;
      this.events = [];
      this.isOpen = false;
      this.currentSize = 100;

      // Configuration from data attributes
      this.minSize = Utils.parseInt(Utils.getData(el, 'accessibility-min'), 80);
      this.maxSize = Utils.parseInt(Utils.getData(el, 'accessibility-max'), 200);
      this.step = Utils.parseInt(Utils.getData(el, 'accessibility-step'), 10);

      this.debouncedSave = Utils.debounce(function(value) {
        try {
          localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {
          // localStorage may be unavailable
        }
      }, 300);

      this.init();
    }

    init() {
      this.loadSavedSize();
      this.createPanel();
      this.bindEvents();
      this.applyFontSize(this.currentSize);
    }

    loadSavedSize() {
      try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          var parsed = parseInt(saved, 10);
          if (!isNaN(parsed)) {
            this.currentSize = Math.max(this.minSize, Math.min(this.maxSize, parsed));
          }
        }
      } catch (e) {
        // localStorage may be unavailable
      }
    }

    createPanel() {
      var id = Utils.generateId('a11y');

      // Panel container — slides down from pre-header
      this.panel = document.createElement('div');
      this.panel.className = 'battersea-a11y-panel';
      this.panel.setAttribute('role', 'group');
      this.panel.setAttribute('aria-label', 'Text size');

      // Small "a" label
      var labelSmall = document.createElement('span');
      labelSmall.className = 'battersea-a11y-panel__label battersea-a11y-panel__label--small';
      labelSmall.textContent = 'a';
      labelSmall.setAttribute('aria-hidden', 'true');

      // Slider
      this.slider = document.createElement('input');
      this.slider.type = 'range';
      this.slider.id = id + '-slider';
      this.slider.className = 'battersea-a11y-slider';
      this.slider.min = this.minSize;
      this.slider.max = this.maxSize;
      this.slider.step = this.step;
      this.slider.value = this.currentSize;
      this.slider.setAttribute('aria-label', 'Text size');
      this.slider.setAttribute('aria-valuemin', this.minSize);
      this.slider.setAttribute('aria-valuemax', this.maxSize);
      this.slider.setAttribute('aria-valuenow', this.currentSize);
      this.slider.setAttribute('aria-valuetext', this.currentSize + '%');

      // Large "A" label
      var labelLarge = document.createElement('span');
      labelLarge.className = 'battersea-a11y-panel__label battersea-a11y-panel__label--large';
      labelLarge.textContent = 'A';
      labelLarge.setAttribute('aria-hidden', 'true');

      this.panel.appendChild(labelSmall);
      this.panel.appendChild(this.slider);
      this.panel.appendChild(labelLarge);

      // Insert panel right after the pre-header placeholder
      var preHeader = this.el.closest('.battersea-header-pre');
      if (preHeader) {
        preHeader.appendChild(this.panel);
      } else {
        // Fallback: append to the trigger's parent
        this.el.parentNode.appendChild(this.panel);
      }
    }

    bindEvents() {
      var self = this;

      // Trigger button click
      this.events.push(
        Utils.addEvent(this.el, 'click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (self.isOpen) {
            self.close();
          } else {
            self.open();
          }
        })
      );

      // Slider input — apply font size in real time
      this.events.push(
        Utils.addEvent(this.slider, 'input', function(e) {
          self.applyFontSize(parseInt(e.target.value, 10));
        })
      );

      // Outside click closes panel and saves
      this.events.push(
        Utils.addEvent(document, 'click', function(e) {
          if (self.isOpen && !self.panel.contains(e.target) && !self.el.contains(e.target)) {
            self.close();
          }
        })
      );

      // Escape key
      this.events.push(
        Utils.addEvent(document, 'keydown', function(e) {
          if (e.key === 'Escape' && self.isOpen) {
            self.close();
            self.el.focus();
          }
        })
      );
    }

    open() {
      this.isOpen = true;
      this.panel.classList.add('battersea-a11y-panel--open');
      this.el.setAttribute('aria-expanded', 'true');

      // Focus the slider for keyboard access
      var slider = this.slider;
      setTimeout(function() {
        slider.focus();
      }, 100);

      this.el.dispatchEvent(new CustomEvent('battersea:a11yOpen'));
    }

    close() {
      this.isOpen = false;
      this.panel.classList.remove('battersea-a11y-panel--open');
      this.el.setAttribute('aria-expanded', 'false');

      // Save immediately on close
      try {
        localStorage.setItem(STORAGE_KEY, this.currentSize);
      } catch (e) {
        // localStorage may be unavailable
      }

      this.el.dispatchEvent(new CustomEvent('battersea:a11yClose'));
    }

    applyFontSize(percentage) {
      this.currentSize = percentage;
      document.documentElement.style.fontSize = percentage + '%';

      // Update slider UI
      this.slider.value = percentage;
      this.slider.setAttribute('aria-valuenow', percentage);
      this.slider.setAttribute('aria-valuetext', percentage + '%');

      // Debounced save while sliding
      this.debouncedSave(percentage);

      // Dispatch custom event
      this.el.dispatchEvent(new CustomEvent('battersea:fontSizeChange', {
        detail: { percentage: percentage }
      }));
    }

    destroy() {
      this.events.forEach(function(event) { event.remove(); });
      if (this.panel && this.panel.parentNode) {
        this.panel.parentNode.removeChild(this.panel);
      }
      document.documentElement.style.fontSize = '';
      this.el = null;
    }
  }

  // Register component with Battersea
  window.Battersea.register('accessibility', Accessibility, '[data-accessibility]');

})(window, document);
