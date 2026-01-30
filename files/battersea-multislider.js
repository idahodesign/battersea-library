/**
 * Battersea Library - MultiSlider Component
 * Version: 2.0.7
 * 
 * Multi-item carousel slider (shows multiple items at once)
 * 
 * Usage:
 * <div data-multislider data-multislider-items="4" data-multislider-items-md="2" data-multislider-items-sm="1" data-multislider-gap="20">
 *   <div data-multislider-track>
 *     <div data-multislider-item>Item 1</div>
 *     <div data-multislider-item>Item 2</div>
 *     <div data-multislider-item>Item 3</div>
 *   </div>
 *   <button data-multislider-prev>‹</button>
 *   <button data-multislider-next>›</button>
 * </div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('MultiSlider requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class MultiSlider {
    constructor(el) {
      if (!el) return;
      
      this.el = el;
      this.track = Utils.qs('[data-multislider-track]', el);
      this.items = this.track ? Utils.qsa('[data-multislider-item]', el) : [];
      this.prevBtn = Utils.qs('[data-multislider-prev]', el);
      this.nextBtn = Utils.qs('[data-multislider-next]', el);
      
      // Get settings from data attributes
      this.itemsPerView = Utils.parseInt(Utils.getData(el, 'multislider-items'), 3);
      this.itemsPerViewMd = Utils.parseInt(Utils.getData(el, 'multislider-items-md'), 2);
      this.itemsPerViewSm = Utils.parseInt(Utils.getData(el, 'multislider-items-sm'), 1);
      this.gap = Utils.parseInt(Utils.getData(el, 'multislider-gap'), 20);
      this.autoplay = Utils.parseBoolean(Utils.getData(el, 'multislider-autoplay') || 'false');
      this.interval = Utils.parseInt(Utils.getData(el, 'multislider-interval'), 5000);
      
      this.current = 0;
      this.autoplayTimer = null;
      this.currentItemsPerView = this.itemsPerView;
      this.events = [];
      this.isTransitioning = false;
      
      // For infinite loop
      this.originalItems = [];
      this.allItems = [];
      this.itemCount = 0;

      if (this.items.length === 0) {
        console.warn('MultiSlider has no items');
        return;
      }
      
      this.itemCount = this.items.length;
      this.originalItems = Array.from(this.items);

      this.init();
    }

    init() {
      this.createClones();
      this.setupItems();
      this.attachEvents();
      
      // Start at first real item position (after clones)
      this.current = this.currentItemsPerView;
      this.goToSlide(this.current, false);

      if (this.autoplay) {
        this.startAutoplay();
      }

      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(() => {
          this.updateResponsive();
          this.updateItemWidth();
          this.goToSlide(this.current, false);
        }, 250))
      );
    }

    updateResponsive() {
      const width = window.innerWidth;
      
      if (width < 768) {
        this.currentItemsPerView = this.itemsPerViewSm;
      } else if (width < 1024) {
        this.currentItemsPerView = this.itemsPerViewMd;
      } else {
        this.currentItemsPerView = this.itemsPerView;
      }
    }

    createClones() {
      if (!this.track || this.itemCount < 2) return;
      
      this.updateResponsive();
      
      // Clone enough items to fill the view on both ends
      const cloneCount = this.currentItemsPerView;
      
      // Clone last items and prepend
      for (let i = this.itemCount - cloneCount; i < this.itemCount; i++) {
        const clone = this.originalItems[i].cloneNode(true);
        clone.classList.add('battersea-multislider-clone');
        clone.setAttribute('aria-hidden', 'true');
        this.track.insertBefore(clone, this.track.firstChild);
      }
      
      // Clone first items and append
      for (let i = 0; i < cloneCount; i++) {
        const clone = this.originalItems[i].cloneNode(true);
        clone.classList.add('battersea-multislider-clone');
        clone.setAttribute('aria-hidden', 'true');
        this.track.appendChild(clone);
      }
      
      // Update allItems to include clones
      this.allItems = Utils.qsa('[data-multislider-item]', this.track);
    }

    setupItems() {
      this.updateResponsive();
      this.updateItemWidth();
    }

    updateItemWidth() {
      const containerWidth = this.el.offsetWidth;
      const totalGap = this.gap * (this.currentItemsPerView - 1);
      const itemWidth = (containerWidth - totalGap) / this.currentItemsPerView;
      
      // Use allItems which includes clones
      const itemsToUpdate = this.allItems.length > 0 ? this.allItems : this.items;
      
      itemsToUpdate.forEach((item, index) => {
        item.style.width = `${itemWidth}px`;
        item.style.minWidth = `${itemWidth}px`;
        item.style.maxWidth = `${itemWidth}px`;
        item.style.flex = '0 0 auto';
        item.style.marginRight = `${this.gap}px`;
      });
      
      // Remove margin from last item
      if (itemsToUpdate.length > 0) {
        itemsToUpdate[itemsToUpdate.length - 1].style.marginRight = '0';
      }
    }

    attachEvents() {
      if (this.prevBtn) {
        this.events.push(
          Utils.addEvent(this.prevBtn, 'click', () => this.prev())
        );
      }
      
      if (this.nextBtn) {
        this.events.push(
          Utils.addEvent(this.nextBtn, 'click', () => this.next())
        );
      }

      // Keyboard navigation
      this.events.push(
        Utils.addEvent(this.el, 'keydown', (e) => {
          if (e.key === 'ArrowLeft') this.prev();
          if (e.key === 'ArrowRight') this.next();
        })
      );

      // Pause autoplay on hover
      if (this.autoplay) {
        this.events.push(
          Utils.addEvent(this.el, 'mouseenter', () => this.stopAutoplay()),
          Utils.addEvent(this.el, 'mouseleave', () => this.startAutoplay())
        );
      }
    }

    goToSlide(index, animate = true) {
      if (this.isTransitioning && animate) return;
      
      this.isTransitioning = true;
      this.current = index;
      
      const cloneCount = this.currentItemsPerView;
      
      const containerWidth = this.el.offsetWidth;
      const totalGap = this.gap * (this.currentItemsPerView - 1);
      const itemWidth = (containerWidth - totalGap) / this.currentItemsPerView;
      const offset = -(this.current * (itemWidth + this.gap));
      
      if (animate) {
        this.track.style.transition = 'transform 0.5s ease-in-out';
      } else {
        this.track.style.transition = 'none';
      }
      
      this.track.style.transform = `translateX(${offset}px)`;
      
      if (!animate) {
        this.track.offsetHeight;
        this.track.style.transition = 'transform 0.5s ease-in-out';
        this.isTransitioning = false;
        return;
      }
      
      // After transition, check if we're on clones and snap to real items
      const transitionEnd = () => {
        this.track.removeEventListener(Utils.getTransitionEndEvent(), transitionEnd);
        
        // Real items are at: cloneCount to (cloneCount + itemCount - 1)
        // Start clones: 0 to (cloneCount - 1)
        // End clones: (cloneCount + itemCount) onwards
        
        const firstRealIndex = cloneCount;
        const lastRealIndex = cloneCount + this.itemCount - 1;
        const firstEndCloneIndex = cloneCount + this.itemCount;
        
        // If we've moved into the end clones (past last real item)
        if (this.current >= firstEndCloneIndex) {
          // Calculate how far into clones we are
          const cloneOffset = this.current - firstEndCloneIndex;
          // Snap to equivalent position in real items
          this.current = firstRealIndex + cloneOffset;
          
          this.track.style.transition = 'none';
          const newOffset = -(this.current * (itemWidth + this.gap));
          this.track.style.transform = `translateX(${newOffset}px)`;
          this.track.offsetHeight;
          this.track.style.transition = 'transform 0.5s ease-in-out';
        }
        // If we've moved into the start clones (before first real item)
        else if (this.current < cloneCount) {
          // Calculate how far into start clones we are (counting from end)
          const cloneOffset = cloneCount - 1 - this.current;
          // Snap to equivalent position at end of real items
          this.current = lastRealIndex - cloneOffset;
          
          this.track.style.transition = 'none';
          const newOffset = -(this.current * (itemWidth + this.gap));
          this.track.style.transform = `translateX(${newOffset}px)`;
          this.track.offsetHeight;
          this.track.style.transition = 'transform 0.5s ease-in-out';
        }
        
        this.isTransitioning = false;
      };
      
      this.track.addEventListener(Utils.getTransitionEndEvent(), transitionEnd, { once: true });

      // Dispatch custom event with real index
      const realIndex = Math.max(0, Math.min(this.itemCount - 1, this.current - cloneCount));
      const event = new CustomEvent('battersea:multisliderChange', {
        detail: { index: realIndex }
      });
      this.el.dispatchEvent(event);
    }

    next() {
      this.goToSlide(this.current + 1);
    }

    prev() {
      this.goToSlide(this.current - 1);
    }

    startAutoplay() {
      this.stopAutoplay();
      this.autoplayTimer = setInterval(() => this.next(), this.interval);
    }

    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    destroy() {
      this.stopAutoplay();
      this.events.forEach(event => event.remove());
    }
  }

  // Register component with Battersea
  window.Battersea.register('multislider', MultiSlider, '[data-multislider]');

})(window, document);
