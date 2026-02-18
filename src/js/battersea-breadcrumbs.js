/**
 * Battersea Library - Breadcrumbs Component
 * Version: 1.0.0
 *
 * Auto-generates a breadcrumb trail from the primary navigation DOM
 * via the NavData service. Detects the current page from the URL
 * and renders the trail with configurable separator.
 *
 * Dependencies: battersea-utils.js, battersea-core.js, battersea-nav-data.js
 *
 * Usage:
 *   <div data-breadcrumb></div>
 *   <div data-breadcrumb data-breadcrumb-separator="/">Home / Section / Page</div>
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Breadcrumbs requires Battersea Core and Utils');
    return;
  }

  class Breadcrumbs {
    constructor(el) {
      this.el = el;
      this.separator = el.getAttribute('data-breadcrumb-separator') || '|';
      this.nav = null;

      this.init();
    }

    init() {
      // Check if NavData is already ready
      if (window.Battersea.navData && window.Battersea.navData.ready) {
        this.render();
        return;
      }

      // Wait for NavData
      var self = this;
      document.addEventListener('battersea:navdata-ready', function handler() {
        document.removeEventListener('battersea:navdata-ready', handler);
        self.render();
      });
    }

    render() {
      var navData = window.Battersea.navData;
      if (!navData) return;

      var currentPage = navData.getCurrentPage();
      if (!currentPage) return;

      var crumbs = navData.getBreadcrumb(currentPage.key);
      if (!crumbs || crumbs.length <= 1) return;

      // Set separator as CSS custom property on this element
      this.el.style.setProperty('--battersea-breadcrumb-sep', '"' + this.separator + '"');

      // Build the nav element
      this.nav = document.createElement('nav');
      this.nav.className = 'battersea-breadcrumb';
      this.nav.setAttribute('aria-label', 'Breadcrumb');

      var ol = document.createElement('ol');
      ol.className = 'battersea-breadcrumb__list';

      for (var i = 0; i < crumbs.length; i++) {
        var crumb = crumbs[i];
        var li = document.createElement('li');
        li.className = 'battersea-breadcrumb__item';

        if (i < crumbs.length - 1) {
          // Link item
          var a = document.createElement('a');
          a.className = 'battersea-breadcrumb__link';
          a.href = crumb.href;
          a.textContent = crumb.label;
          li.appendChild(a);
        } else {
          // Current page (no link)
          var span = document.createElement('span');
          span.className = 'battersea-breadcrumb__current';
          span.setAttribute('aria-current', 'page');
          span.textContent = crumb.label;
          li.appendChild(span);
        }

        ol.appendChild(li);
      }

      this.nav.appendChild(ol);
      this.el.appendChild(this.nav);
    }

    destroy() {
      if (this.nav && this.nav.parentNode) {
        this.nav.parentNode.removeChild(this.nav);
      }
      this.nav = null;
    }
  }

  window.Battersea.register('breadcrumbs', Breadcrumbs, '[data-breadcrumb]');

})(window, document);
