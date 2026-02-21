/**
 * Battersea Library - Pagination Component
 * Version: 1.0.0
 *
 * Standalone pagination with client-side and server-side modes.
 *
 * Usage:
 * <!-- Client-side: paginate children of a target container -->
 * <div data-pagination
 *      data-pagination-target="#cards"
 *      data-pagination-page-size="10"
 *      data-pagination-show-info="true"
 *      data-pagination-show-input="true">
 * </div>
 *
 * <!-- Server-side: fire events for AJAX fetching -->
 * <div data-pagination
 *      data-pagination-total-items="95"
 *      data-pagination-page-size="10"
 *      data-pagination-show-info="true">
 * </div>
 *
 * Options:
 * - data-pagination-target:          CSS selector for content container (enables client mode)
 * - data-pagination-total-items:     Total item count (required for server mode)
 * - data-pagination-page-size:       Items per page (default: 10)
 * - data-pagination-mode:            "client" or "server" (auto-detected if omitted)
 * - data-pagination-show-info:       Show "Showing X-Y of Z" text (default: true)
 * - data-pagination-show-input:      Show go-to-page input (default: false)
 * - data-pagination-show-first-last: Show first/last buttons (default: false)
 * - data-pagination-show-sizes:      Comma-separated page size options, e.g. "10,25,50"
 * - data-pagination-scroll-top:      Scroll target into view on page change (default: false)
 *
 * Events:
 * - battersea:pagination:change  { page, pageSize, totalPages, totalItems }
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Pagination requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;

  class Pagination {
    constructor(el) {
      this.el = el;
      this.events = [];

      // Configuration
      this.mode = null;
      this.pageSize = 10;
      this.currentPage = 1;
      this.totalItems = 0;
      this.showInfo = true;
      this.showInput = false;
      this.showFirstLast = false;
      this.showSizes = null;
      this.scrollTop = false;
      this.targetSelector = null;

      // DOM references
      this.targetEl = null;
      this.items = [];
      this.wrapper = null;
      this.liveRegion = null;

      this.init();
    }

    init() {
      this.parseOptions();
      this.detectMode();

      if (this.mode === 'client') {
        this.collectItems();
      }

      this.buildStructure();
      this.render();
    }

    parseOptions() {
      this.targetSelector = Utils.getData(this.el, 'pagination-target') || null;
      this.pageSize = Utils.parseInt(Utils.getData(this.el, 'pagination-page-size'), 10);
      this.totalItems = Utils.parseInt(Utils.getData(this.el, 'pagination-total-items'), 0);
      this.showInfo = Utils.parseBoolean(Utils.getData(this.el, 'pagination-show-info') !== null ? Utils.getData(this.el, 'pagination-show-info') : 'true');
      this.showInput = Utils.parseBoolean(Utils.getData(this.el, 'pagination-show-input'));
      this.showFirstLast = Utils.parseBoolean(Utils.getData(this.el, 'pagination-show-first-last'));
      this.scrollTop = Utils.parseBoolean(Utils.getData(this.el, 'pagination-scroll-top'));

      var sizesAttr = Utils.getData(this.el, 'pagination-show-sizes');
      if (sizesAttr) {
        this.showSizes = sizesAttr.split(',').map(function(s) { return parseInt(s.trim(), 10); }).filter(function(n) { return !isNaN(n) && n > 0; });
        if (this.showSizes.length === 0) this.showSizes = null;
      }

      var modeAttr = Utils.getData(this.el, 'pagination-mode');
      if (modeAttr === 'client' || modeAttr === 'server') {
        this.mode = modeAttr;
      }
    }

    detectMode() {
      if (this.mode) return;

      if (this.targetSelector) {
        var target = document.querySelector(this.targetSelector);
        if (target) {
          this.mode = 'client';
          return;
        }
      }

      this.mode = 'server';
    }

    collectItems() {
      this.targetEl = document.querySelector(this.targetSelector);
      if (!this.targetEl) return;

      this.items = Array.prototype.slice.call(this.targetEl.children);
      this.totalItems = this.items.length;
    }

    buildStructure() {
      this.wrapper = document.createElement('nav');
      this.wrapper.className = 'battersea-pagination';
      this.wrapper.setAttribute('aria-label', 'Pagination');
      this.wrapper.setAttribute('role', 'navigation');

      this.liveRegion = document.createElement('div');
      this.liveRegion.className = 'battersea-sr-only';
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.wrapper.appendChild(this.liveRegion);

      this.el.appendChild(this.wrapper);
    }

    render() {
      // Remove old event listeners (except those on the wrapper itself)
      this.events.forEach(function(e) { e.remove(); });
      this.events = [];

      // Clear wrapper except live region
      var children = Array.prototype.slice.call(this.wrapper.children);
      children.forEach(function(child) {
        if (child !== this.liveRegion) {
          this.wrapper.removeChild(child);
        }
      }.bind(this));

      var totalPages = this.getTotalPages();

      // Clamp current page
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
      if (this.currentPage < 1) {
        this.currentPage = 1;
      }

      // Don't render if only 1 page and no extras to show
      if (totalPages <= 1 && !this.showInfo && !this.showInput && !this.showSizes) {
        return;
      }

      // Primary row: info + controls
      var row = document.createElement('div');
      row.className = 'battersea-pagination__row';

      if (this.showInfo) {
        row.appendChild(this.renderInfo());
      }

      if (totalPages > 1) {
        row.appendChild(this.renderControls(totalPages));
      }

      this.wrapper.insertBefore(row, this.liveRegion);

      // Secondary row: input + sizes
      if (this.showInput || this.showSizes) {
        var row2 = document.createElement('div');
        row2.className = 'battersea-pagination__row battersea-pagination__row--secondary';

        if (this.showInput && totalPages > 1) {
          row2.appendChild(this.renderInput(totalPages));
        }

        if (this.showSizes) {
          row2.appendChild(this.renderSizes());
        }

        // Only add secondary row if it has content
        if (row2.children.length > 0) {
          this.wrapper.insertBefore(row2, this.liveRegion);
        }
      }

      // Client-side: show/hide items
      if (this.mode === 'client') {
        this.showPage();
      }
    }

    renderInfo() {
      var info = document.createElement('div');
      info.className = 'battersea-pagination__info';

      if (this.totalItems === 0) {
        info.textContent = 'No items';
      } else {
        var start = (this.currentPage - 1) * this.pageSize + 1;
        var end = Math.min(this.currentPage * this.pageSize, this.totalItems);
        info.textContent = 'Showing ' + start + '\u2013' + end + ' of ' + this.totalItems;
      }

      return info;
    }

    renderControls(totalPages) {
      var controls = document.createElement('div');
      controls.className = 'battersea-pagination__controls';

      // First button
      if (this.showFirstLast) {
        var firstBtn = this.createNavButton('first', '\u00AB', 1, this.currentPage <= 1);
        firstBtn.setAttribute('aria-label', 'First page');
        controls.appendChild(firstBtn);
      }

      // Previous button
      var prevBtn = this.createNavButton('prev', '\u2039', this.currentPage - 1, this.currentPage <= 1);
      prevBtn.setAttribute('aria-label', 'Previous page');
      controls.appendChild(prevBtn);

      // Page numbers
      var pages = this.getPageRange(this.currentPage, totalPages);
      pages.forEach(function(p) {
        if (p === '...') {
          controls.appendChild(this.createEllipsis());
        } else {
          var btn = this.createPageButton(p);
          controls.appendChild(btn);
        }
      }.bind(this));

      // Next button
      var nextBtn = this.createNavButton('next', '\u203A', this.currentPage + 1, this.currentPage >= totalPages);
      nextBtn.setAttribute('aria-label', 'Next page');
      controls.appendChild(nextBtn);

      // Last button
      if (this.showFirstLast) {
        var lastBtn = this.createNavButton('last', '\u00BB', totalPages, this.currentPage >= totalPages);
        lastBtn.setAttribute('aria-label', 'Last page');
        controls.appendChild(lastBtn);
      }

      return controls;
    }

    renderInput(totalPages) {
      var group = document.createElement('div');
      group.className = 'battersea-pagination__input-group';

      var label = document.createElement('label');
      label.className = 'battersea-pagination__input-label';
      label.textContent = 'Go to page';

      var input = document.createElement('input');
      input.type = 'number';
      input.className = 'battersea-pagination__input';
      input.min = '1';
      input.max = String(totalPages);
      input.setAttribute('aria-label', 'Page number');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'battersea-pagination__input-btn';
      btn.textContent = 'Go';

      var self = this;
      var goHandler = function() {
        var val = parseInt(input.value, 10);
        if (!isNaN(val)) {
          self.goToPage(val);
          input.value = '';
        }
      };

      this.events.push(Utils.addEvent(btn, 'click', goHandler));
      this.events.push(Utils.addEvent(input, 'keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          goHandler();
        }
      }));

      group.appendChild(label);
      group.appendChild(input);
      group.appendChild(btn);

      return group;
    }

    renderSizes() {
      var group = document.createElement('div');
      group.className = 'battersea-pagination__sizes';

      var labelBefore = document.createElement('label');
      labelBefore.className = 'battersea-pagination__sizes-label';
      labelBefore.textContent = 'Show';

      var select = document.createElement('select');
      select.className = 'battersea-pagination__sizes-select';
      select.setAttribute('aria-label', 'Items per page');

      var self = this;
      this.showSizes.forEach(function(size) {
        var option = document.createElement('option');
        option.value = String(size);
        option.textContent = String(size);
        if (size === self.pageSize) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      var labelAfter = document.createElement('span');
      labelAfter.className = 'battersea-pagination__sizes-label';
      labelAfter.textContent = 'per page';

      this.events.push(Utils.addEvent(select, 'change', function() {
        self.pageSize = parseInt(select.value, 10);
        self.currentPage = 1;
        self.render();
        self.dispatchChange();
        self.announce('Showing ' + self.pageSize + ' per page');
      }));

      group.appendChild(labelBefore);
      group.appendChild(select);
      group.appendChild(labelAfter);

      return group;
    }

    // Button helpers

    createNavButton(type, label, targetPage, disabled) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'battersea-pagination__btn battersea-pagination__btn--' + type;
      btn.textContent = label;
      btn.disabled = disabled;

      if (!disabled) {
        var self = this;
        this.events.push(Utils.addEvent(btn, 'click', function() {
          self.goToPage(targetPage);
        }));
      }

      return btn;
    }

    createPageButton(pageNum) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'battersea-pagination__btn battersea-pagination__btn--page';
      btn.textContent = String(pageNum);

      if (pageNum === this.currentPage) {
        btn.classList.add('battersea-pagination__btn--active');
        btn.setAttribute('aria-current', 'page');
      }

      var self = this;
      this.events.push(Utils.addEvent(btn, 'click', function() {
        self.goToPage(pageNum);
      }));

      return btn;
    }

    createEllipsis() {
      var span = document.createElement('span');
      span.className = 'battersea-pagination__ellipsis';
      span.textContent = '\u2026';
      span.setAttribute('aria-hidden', 'true');
      return span;
    }

    getPageRange(current, total) {
      if (total <= 7) {
        var result = [];
        for (var i = 1; i <= total; i++) result.push(i);
        return result;
      }

      if (current <= 4) {
        return [1, 2, 3, 4, 5, '...', total];
      }

      if (current >= total - 3) {
        return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
      }

      return [1, '...', current - 1, current, current + 1, '...', total];
    }

    // Navigation

    goToPage(page) {
      page = parseInt(page, 10);
      var totalPages = this.getTotalPages();

      if (isNaN(page) || page < 1 || page > totalPages) return;
      if (page === this.currentPage) return;

      this.currentPage = page;
      this.render();

      if (this.scrollTop && this.targetEl) {
        this.targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      this.dispatchChange();
      this.announce('Page ' + this.currentPage + ' of ' + totalPages);
    }

    dispatchChange() {
      this.el.dispatchEvent(new CustomEvent('battersea:pagination:change', {
        bubbles: true,
        detail: {
          page: this.currentPage,
          pageSize: this.pageSize,
          totalPages: this.getTotalPages(),
          totalItems: this.totalItems
        }
      }));
    }

    // Client-side display

    showPage() {
      if (!this.items.length) return;

      var start = (this.currentPage - 1) * this.pageSize;
      var end = start + this.pageSize;

      this.items.forEach(function(item, index) {
        item.style.display = (index >= start && index < end) ? '' : 'none';
      });
    }

    // Utility

    getTotalPages() {
      return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }

    announce(message) {
      if (!this.liveRegion) return;
      this.liveRegion.textContent = '';
      requestAnimationFrame(function() {
        this.liveRegion.textContent = message;
      }.bind(this));
    }

    // Public API

    setTotalItems(total) {
      this.totalItems = total;
      var totalPages = this.getTotalPages();
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
      this.render();
    }

    setPage(page) {
      this.goToPage(page);
    }

    refresh() {
      if (this.mode === 'client') {
        this.collectItems();
      }
      this.render();
    }

    destroy() {
      this.events.forEach(function(e) { e.remove(); });
      this.events = [];

      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }

      // Restore all items visibility in client mode
      if (this.mode === 'client' && this.items.length) {
        this.items.forEach(function(item) { item.style.display = ''; });
      }

      this.wrapper = null;
      this.liveRegion = null;
      this.targetEl = null;
      this.items = [];
    }
  }

  window.Battersea.register('pagination', Pagination, '[data-pagination]');

})(window, document);
