/**
 * Battersea Library - NavData Service
 * Version: 1.0.0
 *
 * Parses the primary navigation DOM and builds a structured JSON data model.
 * Exposes the data via window.Battersea.navData and fires a custom event
 * when ready. Consumers (Breadcrumbs, PageNav, etc.) can access navigation
 * data through the provided API methods.
 *
 * This is a self-initialising service — it watches for the nav DOM to appear
 * (loaded via the include system) and parses it automatically.
 *
 * Dependencies: battersea-utils.js, battersea-core.js, battersea-env-config.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('NavData requires Battersea Core and Utils');
    return;
  }

  class NavData {
    constructor() {
      this.data = null;
      this.flat = null;
      this.lookup = {};
      this.observer = null;
      this.timeout = null;
      this.ready = false;

      this.init();
    }

    init() {
      var nav = document.querySelector('.battersea-hnav[data-horizontal-nav]');
      if (nav && nav.children.length > 0) {
        this.parseAndExpose(nav);
        return;
      }

      this.waitForNav();
    }

    waitForNav() {
      var self = this;

      this.observer = new MutationObserver(function() {
        var nav = document.querySelector('.battersea-hnav[data-horizontal-nav]');
        if (nav && nav.children.length > 0) {
          self.observer.disconnect();
          self.observer = null;
          clearTimeout(self.timeout);
          // Delay to let env-config fix paths first
          setTimeout(function() {
            self.parseAndExpose(nav);
          }, 0);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout after 10 seconds
      this.timeout = setTimeout(function() {
        if (!self.ready && self.observer) {
          self.observer.disconnect();
          self.observer = null;
          console.warn('NavData: Navigation element not found after 10s');
        }
      }, 10000);
    }

    parseAndExpose(navEl) {
      var items = this.parseNav(navEl);
      var flat = this.buildFlatList(items);

      this.buildSequentialRefs(items, flat);
      this.buildLookup(items);

      this.data = {
        generated: new Date().toISOString(),
        version: '1.0.0',
        items: items,
        flat: flat
      };

      this.flat = flat;

      window.Battersea.navData = this;
      this.ready = true;

      document.dispatchEvent(new CustomEvent('battersea:navdata-ready', {
        detail: { navData: this }
      }));

      console.log('Battersea: NavData ready (' + flat.length + ' pages)');
    }

    parseNav(navEl) {
      var self = this;
      var items = [];
      var topItems = Array.from(navEl.children).filter(function(child) {
        return child.tagName === 'LI';
      });

      topItems.forEach(function(li, catIndex) {
        var link = li.querySelector(':scope > a');
        if (!link) return;

        var label = link.textContent.trim();
        var href = link.getAttribute('href') || '#';
        var key = link.getAttribute('data-nav-link') || self.slugify(label);
        var isExternal = link.getAttribute('target') === '_blank';

        var item = {
          key: key,
          label: label,
          href: href,
          external: isExternal,
          categoryIndex: catIndex,
          category: null,
          children: [],
          prev: null,
          next: null
        };

        var dropdown = li.querySelector(':scope > .battersea-hnav__dropdown');
        if (dropdown) {
          var dropdownItems = Array.from(dropdown.children).filter(function(child) {
            return child.tagName === 'LI';
          });

          dropdownItems.forEach(function(childLi, childIndex) {
            var childLink = childLi.querySelector(':scope > a');
            if (!childLink) return;

            var childLabel = childLink.textContent.trim();
            var childHref = childLink.getAttribute('href') || '#';
            var childKey = childLink.getAttribute('data-nav-link') || self.slugify(childLabel);

            item.children.push({
              key: childKey,
              label: childLabel,
              href: childHref,
              external: false,
              categoryKey: key,
              categoryLabel: label,
              categoryIndex: catIndex,
              childIndex: childIndex,
              prev: null,
              next: null,
              prevInCategory: null,
              nextInCategory: null
            });
          });
        }

        items.push(item);
      });

      return items;
    }

    buildFlatList(items) {
      var flat = [];

      items.forEach(function(item) {
        if (item.href !== '#' && !item.external) {
          flat.push({
            key: item.key,
            label: item.label,
            href: item.href,
            categoryKey: null,
            categoryLabel: null
          });
        }

        item.children.forEach(function(child) {
          if (child.href !== '#' && !child.external) {
            flat.push({
              key: child.key,
              label: child.label,
              href: child.href,
              categoryKey: child.categoryKey,
              categoryLabel: child.categoryLabel
            });
          }
        });
      });

      return flat;
    }

    buildSequentialRefs(items, flat) {
      var self = this;

      // Category-level prev/next (excluding external)
      var navigableCategories = items.filter(function(i) { return !i.external; });
      navigableCategories.forEach(function(item, i) {
        item.prev = i > 0 ? self.makeRef(navigableCategories[i - 1]) : null;
        item.next = i < navigableCategories.length - 1 ? self.makeRef(navigableCategories[i + 1]) : null;
      });

      // Within-category prev/next for children
      items.forEach(function(item) {
        item.children.forEach(function(child, i) {
          child.prevInCategory = i > 0 ? self.makeRef(item.children[i - 1]) : null;
          child.nextInCategory = i < item.children.length - 1 ? self.makeRef(item.children[i + 1]) : null;
        });
      });

      // Global prev/next across all pages (using flat list order)
      flat.forEach(function(page, i) {
        var obj = self.findInItems(items, page.key);
        if (obj) {
          obj.prev = i > 0 ? self.makeRef(flat[i - 1]) : null;
          obj.next = i < flat.length - 1 ? self.makeRef(flat[i + 1]) : null;
        }
      });
    }

    buildLookup(items) {
      var self = this;
      items.forEach(function(item) {
        self.lookup[item.key] = item;
        item.children.forEach(function(child) {
          self.lookup[child.key] = child;
        });
      });
    }

    findInItems(items, key) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].key === key) return items[i];
        for (var j = 0; j < items[i].children.length; j++) {
          if (items[i].children[j].key === key) return items[i].children[j];
        }
      }
      return null;
    }

    slugify(text) {
      return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    makeRef(item) {
      if (!item) return null;
      return { key: item.key, label: item.label, href: item.href };
    }

    normalisePath(path) {
      var p = path.replace(/\/+$/, '');
      var basePath = window.BatterseaConfig ? window.BatterseaConfig.basePath : '';
      if (basePath && p.indexOf(basePath) === 0) {
        p = p.substring(basePath.length);
      }
      return p;
    }

    // =========================================
    // Public API
    // =========================================

    getData() {
      return this.data;
    }

    getCurrentPage() {
      var currentPath = window.location.pathname;
      var normCurrent = this.normalisePath(currentPath);

      // Exact match
      for (var i = 0; i < this.flat.length; i++) {
        if (this.normalisePath(this.flat[i].href) === normCurrent) {
          return this.lookup[this.flat[i].key] || null;
        }
      }

      // Fallback: match by filename
      var currentFile = currentPath.split('/').pop();
      for (var j = 0; j < this.flat.length; j++) {
        var pageFile = this.flat[j].href.split('/').pop();
        if (pageFile === currentFile) {
          return this.lookup[this.flat[j].key] || null;
        }
      }

      return null;
    }

    getPageByKey(key) {
      return this.lookup[key] || null;
    }

    getCategory(key) {
      var page = this.lookup[key];
      if (!page) return null;
      if (page.categoryKey) {
        return this.lookup[page.categoryKey] || null;
      }
      // Already a category
      if (page.children) return page;
      return null;
    }

    getSiblings(key) {
      var page = this.lookup[key];
      if (!page || !page.categoryKey) return [];
      var category = this.lookup[page.categoryKey];
      if (!category) return [];
      return category.children.map(this.makeRef);
    }

    getNextPage(key) {
      var page = this.lookup[key];
      return page ? page.next : null;
    }

    getPrevPage(key) {
      var page = this.lookup[key];
      return page ? page.prev : null;
    }

    getNextInCategory(key) {
      var page = this.lookup[key];
      return page ? page.nextInCategory || null : null;
    }

    getPrevInCategory(key) {
      var page = this.lookup[key];
      return page ? page.prevInCategory || null : null;
    }

    getNextCategory(categoryKey) {
      var cat = this.lookup[categoryKey];
      return cat ? cat.next : null;
    }

    getPrevCategory(categoryKey) {
      var cat = this.lookup[categoryKey];
      return cat ? cat.prev : null;
    }

    getBreadcrumb(key) {
      var page = this.lookup[key];
      if (!page) return [];

      var crumbs = [];

      // Home is always first
      var home = this.lookup['home'];
      if (home) {
        crumbs.push(this.makeRef(home));
      }

      // If page has a category, add it
      if (page.categoryKey) {
        var cat = this.lookup[page.categoryKey];
        if (cat) {
          crumbs.push(this.makeRef(cat));
        }
        crumbs.push(this.makeRef(page));
      } else if (page.key !== 'home') {
        // Top-level page that isn't Home
        crumbs.push(this.makeRef(page));
      }

      return crumbs;
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.data = null;
      this.flat = null;
      this.lookup = {};
      this.ready = false;
      if (window.Battersea.navData === this) {
        window.Battersea.navData = null;
      }
    }
  }

  // Self-initialise
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { new NavData(); });
  } else {
    new NavData();
  }

})(window, document);
