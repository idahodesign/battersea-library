/**
 * Battersea Library - Tabs Component
 * Version: 2.0.2
 * 
 * Usage:
 * <div data-tabs>
 *   <div data-tabs-nav>
 *     <button data-tab="tab1" class="active">Tab 1</button>
 *     <button data-tab="tab2">Tab 2</button>
 *   </div>
 *   <div data-tabs-content>
 *     <div data-tab-content="tab1" class="active">Content 1</div>
 *     <div data-tab-content="tab2">Content 2</div>
 *   </div>
 * </div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Tabs requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Tabs {
    constructor(el) {
      this.el = el;
      this.nav = Utils.qs('[data-tabs-nav]', el);
      this.contentContainer = Utils.qs('[data-tabs-content]', el);
      this.tabs = Utils.qsa('[data-tab]', this.nav);
      this.contents = Utils.qsa('[data-tab-content]', this.contentContainer);
      this.events = [];

      if (!this.nav || !this.contentContainer || this.tabs.length === 0) {
        console.warn('Tabs element missing required structure');
        return;
      }

      this.init();
    }

    init() {
      this.bindEvents();
    }

    bindEvents() {
      this.tabs.forEach(tab => {
        this.events.push(
          Utils.addEvent(tab, 'click', (e) => {
            e.preventDefault();
            const targetId = Utils.getData(tab, 'tab');
            this.switchTab(targetId);
          })
        );
      });
    }

    switchTab(targetId) {
      // Deactivate all tabs
      this.tabs.forEach(tab => tab.classList.remove('active'));
      
      // Hide all content (remove active class and set display none)
      this.contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });

      // Activate target tab
      const targetTab = Utils.qs(`[data-tab="${targetId}"]`, this.nav);
      const targetContent = Utils.qs(`[data-tab-content="${targetId}"]`, this.contentContainer);

      if (targetTab) targetTab.classList.add('active');
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
      }

      // Dispatch custom event
      const event = new CustomEvent('battersea:tabChange', {
        detail: { tabId: targetId }
      });
      this.el.dispatchEvent(event);
    }

    destroy() {
      this.events.forEach(event => event.remove());
    }
  }

  // Register component with Battersea
  window.Battersea.register('tabs', Tabs, '[data-tabs]');

})(window, document);
