/**
 * Battersea Library - BackToTop Component
 * Version: 1.0.0
 *
 * A button that fades in as you scroll down the page.
 * Clicking it smoothly scrolls back to the top.
 *
 * Usage:
 * <div data-backtotop
 *      data-backtotop-threshold="300"
 *      data-backtotop-duration="500"
 *      data-backtotop-offset="30">
 * </div>
 *
 * Options:
 * - data-backtotop-threshold: Scroll distance (px) before button appears (default: 300)
 * - data-backtotop-duration: Scroll animation duration in ms (default: 500)
 * - data-backtotop-offset: Distance from bottom-right corner in px (default: 30)
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('BackToTop requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class BackToTop {
    constructor(el) {
      this.el = el;
      this.button = null;
      this.isVisible = false;
      this.isScrolling = false;
      this.events = [];

      this.init();
    }

    init() {
      this.parseOptions();
      this.createButton();
      this.bindEvents();
      this.checkScroll();
    }

    parseOptions() {
      this.threshold = Utils.parseInt(Utils.getData(this.el, 'backtotop-threshold'), 300);
      this.duration = Utils.parseInt(Utils.getData(this.el, 'backtotop-duration'), 500);
      this.offset = Utils.parseInt(Utils.getData(this.el, 'backtotop-offset'), 30);
    }

    createButton() {
      this.button = document.createElement('button');
      this.button.className = 'battersea-backtotop';
      this.button.setAttribute('aria-label', 'Back to top');
      this.button.setAttribute('type', 'button');
      this.button.style.right = this.offset + 'px';
      this.button.style.bottom = this.offset + 'px';

      // Create the chevron arrow via CSS (no innerHTML needed)
      const arrow = document.createElement('span');
      arrow.className = 'battersea-backtotop__arrow';
      this.button.appendChild(arrow);

      document.body.appendChild(this.button);
    }

    bindEvents() {
      this.events.push(
        Utils.addEvent(this.button, 'click', () => this.scrollToTop()),
        Utils.addEvent(window, 'scroll', Utils.throttle(() => this.checkScroll(), 100))
      );
    }

    checkScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const shouldShow = scrollY > this.threshold;

      if (shouldShow && !this.isVisible) {
        this.show();
      } else if (!shouldShow && this.isVisible) {
        this.hide();
      }
    }

    show() {
      this.isVisible = true;
      this.button.classList.add('battersea-backtotop--visible');
    }

    hide() {
      this.isVisible = false;
      this.button.classList.remove('battersea-backtotop--visible');
    }

    scrollToTop() {
      if (this.isScrolling) return;
      this.isScrolling = true;

      const startY = window.pageYOffset;
      const startTime = performance.now();
      const duration = this.duration;

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Cubic ease-out for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, startY * (1 - eased));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          this.isScrolling = false;
        }
      };

      requestAnimationFrame(step);
    }

    destroy() {
      this.events.forEach(event => event.remove());
      this.events = [];

      if (this.button && this.button.parentNode) {
        this.button.parentNode.removeChild(this.button);
      }

      this.button = null;
    }
  }

  window.Battersea.register('backtotop', BackToTop, '[data-backtotop]');

})(window, document);
