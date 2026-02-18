/**
 * Battersea Library - PageNav Component
 * Version: 1.0.0
 *
 * Renders prev/next page navigation links using the NavData service.
 * Supports three modes: all pages, within category, or between categories.
 * Multiple instances per page with independent configuration.
 *
 * Dependencies: battersea-utils.js, battersea-core.js, battersea-nav-data.js
 *
 * Usage:
 *   <div data-pagenav></div>
 *   <div data-pagenav data-pagenav-mode="category" data-pagenav-show-category="true"></div>
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('PageNav requires Battersea Core and Utils');
    return;
  }

  class PageNav {
    constructor(el) {
      this.el = el;
      this.nav = null;

      this.mode = el.getAttribute('data-pagenav-mode') || 'pages';
      this.showTitle = el.getAttribute('data-pagenav-show-title') !== 'false';
      this.showCategory = el.getAttribute('data-pagenav-show-category') === 'true';
      this.label = el.getAttribute('data-pagenav-label') || '';

      this.init();
    }

    init() {
      if (window.Battersea.navData && window.Battersea.navData.ready) {
        this.render();
        return;
      }

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

      var prev = null;
      var next = null;

      if (this.mode === 'pages') {
        prev = navData.getPrevPage(currentPage.key);
        next = navData.getNextPage(currentPage.key);
      } else if (this.mode === 'category') {
        prev = navData.getPrevInCategory(currentPage.key);
        next = navData.getNextInCategory(currentPage.key);
      } else if (this.mode === 'categories') {
        var category = navData.getCategory(currentPage.key);
        if (category) {
          prev = navData.getPrevCategory(category.key);
          next = navData.getNextCategory(category.key);
        } else {
          prev = navData.getPrevCategory(currentPage.key);
          next = navData.getNextCategory(currentPage.key);
        }
      }

      if (!prev && !next) return;

      this.nav = document.createElement('nav');
      this.nav.className = 'battersea-pagenav';
      this.nav.setAttribute('aria-label', 'Page navigation');

      if (prev) {
        this.nav.appendChild(this.buildLink(prev, 'prev'));
      }

      if (this.label) {
        var labelSpan = document.createElement('span');
        labelSpan.className = 'battersea-pagenav__label';
        labelSpan.textContent = this.label;
        this.nav.appendChild(labelSpan);
      }

      if (next) {
        this.nav.appendChild(this.buildLink(next, 'next'));
      }

      this.el.appendChild(this.nav);
    }

    buildLink(ref, direction) {
      var a = document.createElement('a');
      a.href = ref.href;
      a.className = 'battersea-pagenav__link battersea-pagenav__link--' + direction;

      var dirLabel = direction === 'prev' ? 'Previous' : 'Next';
      a.setAttribute('aria-label', dirLabel + ': ' + ref.label);

      var arrowSpan = document.createElement('span');
      arrowSpan.className = 'battersea-pagenav__arrow';
      arrowSpan.setAttribute('aria-hidden', 'true');
      arrowSpan.textContent = direction === 'prev' ? '\u2039' : '\u203A';

      var textSpan = document.createElement('span');
      textSpan.className = 'battersea-pagenav__text';

      if (this.showCategory && this.mode !== 'categories') {
        var categoryLabel = this.getCategoryLabel(ref);
        if (categoryLabel) {
          var catSpan = document.createElement('span');
          catSpan.className = 'battersea-pagenav__category';
          catSpan.textContent = categoryLabel;
          textSpan.appendChild(catSpan);
        }
      }

      if (this.showTitle) {
        var titleSpan = document.createElement('span');
        titleSpan.className = 'battersea-pagenav__title';
        titleSpan.textContent = ref.label;
        textSpan.appendChild(titleSpan);
      }

      var hasText = this.showTitle || (this.showCategory && this.mode !== 'categories');

      if (direction === 'prev') {
        a.appendChild(arrowSpan);
        if (hasText) a.appendChild(textSpan);
      } else {
        if (hasText) a.appendChild(textSpan);
        a.appendChild(arrowSpan);
      }

      return a;
    }

    getCategoryLabel(ref) {
      var navData = window.Battersea.navData;
      if (!navData) return null;

      var page = navData.getPageByKey(ref.key);
      if (!page) return null;

      if (page.categoryKey) {
        var cat = navData.getCategory(ref.key);
        return cat ? cat.label : null;
      }

      return null;
    }

    destroy() {
      if (this.nav && this.nav.parentNode) {
        this.nav.parentNode.removeChild(this.nav);
      }
      this.nav = null;
    }
  }

  window.Battersea.register('pageNav', PageNav, '[data-pagenav]');

})(window, document);
