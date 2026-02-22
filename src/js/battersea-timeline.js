/**
 * Battersea Library - Timeline Component
 * Version: 2.12.0
 *
 * Vertical: uses the Animation component for scroll-reveal (data-animate)
 * Horizontal: snap-to-centre with highlighted item and content panel below
 *
 * Usage:
 * <div data-timeline data-timeline-direction="vertical" data-timeline-alternate="true">
 *   <div data-timeline-item data-timeline-date="2024" data-timeline-icon="🎯">
 *     <img src="image.jpg" alt="" data-timeline-image>
 *     <h3>Title</h3>
 *     <p>Description text</p>
 *   </div>
 * </div>
 *
 * Horizontal with intro:
 * <div data-timeline data-timeline-direction="horizontal">
 *   <div data-timeline-item data-timeline-date="Step 1" data-timeline-intro="Short intro">
 *     <h3>Title</h3>
 *     <p>Full description shown in panel below when active.</p>
 *   </div>
 * </div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js, battersea-animation.js (vertical)
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Timeline requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;

  class Timeline {
    constructor(el) {
      this.el = el;
      this.direction = Utils.getData(el, 'timeline-direction') || 'vertical';
      this.alternate = Utils.parseBoolean(Utils.getData(el, 'timeline-alternate') || 'true');

      this.items = Utils.qsa('[data-timeline-item]', el);
      this.events = [];
      this.observer = null;
      this.isHorizontal = false;
      this.trackEl = null;
      this.trackWrapper = null;
      this.prevBtn = null;
      this.nextBtn = null;

      // Horizontal-specific
      this.panelEl = null;
      this.startSpacer = null;
      this.endSpacer = null;
      this.itemContentMap = [];
      this.activeIndex = -1;
      this.wrapperEls = [];

      if (this.items.length === 0) {
        console.warn('Timeline: No timeline items found');
        return;
      }

      this.init();
    }

    init() {
      this.buildStructure();
      this.checkDirection();
      this.setupScrollReveal();

      if (this.direction === 'horizontal') {
        this.setupHorizontalSnap();
      }

      this.bindEvents();

      this.el.dispatchEvent(new CustomEvent('battersea:timelineReady', {
        detail: { direction: this.direction, itemCount: this.items.length }
      }));
    }

    buildStructure() {
      this.el.classList.add('battersea-timeline');

      var line = document.createElement('div');
      line.className = 'battersea-timeline__line';

      this.trackEl = document.createElement('div');
      this.trackEl.className = 'battersea-timeline__track';

      // Horizontal: add start spacer
      if (this.direction === 'horizontal') {
        this.startSpacer = document.createElement('div');
        this.startSpacer.className = 'battersea-timeline__spacer battersea-timeline__spacer--start';
        this.trackEl.appendChild(this.startSpacer);
      }

      // Process each item
      this.items.forEach(function(item, index) {
        var wrapper = this.buildItemWrapper(item, index);
        this.trackEl.appendChild(wrapper);
        if (this.direction === 'horizontal') {
          this.wrapperEls.push(wrapper);
        }
      }.bind(this));

      // Horizontal: remove original items (content was cloned, not moved)
      if (this.direction === 'horizontal') {
        this.items.forEach(function(item) {
          if (item.parentNode) item.parentNode.removeChild(item);
        });
      }

      // Horizontal: add end spacer
      if (this.direction === 'horizontal') {
        this.endSpacer = document.createElement('div');
        this.endSpacer.className = 'battersea-timeline__spacer battersea-timeline__spacer--end';
        this.trackEl.appendChild(this.endSpacer);
      }

      // Horizontal: wrap track + line + nav in a container
      if (this.direction === 'horizontal') {
        this.trackWrapper = document.createElement('div');
        this.trackWrapper.className = 'battersea-timeline__track-wrapper';
        this.trackWrapper.appendChild(line);
        this.trackWrapper.appendChild(this.trackEl);
        this.el.appendChild(this.trackWrapper);

        this.buildHorizontalNav();

        // Content panel below the track
        this.panelEl = document.createElement('div');
        this.panelEl.className = 'battersea-timeline__panel';
        this.el.appendChild(this.panelEl);

        this.updateSpacerWidths();
      } else {
        this.el.appendChild(line);
        this.el.appendChild(this.trackEl);
      }
    }

    buildItemWrapper(item, index) {
      var wrapper = document.createElement('div');
      wrapper.className = 'battersea-timeline__item';

      // Alternate sides for vertical
      if (this.direction === 'vertical' && this.alternate) {
        wrapper.classList.add(index % 2 === 0 ? 'battersea-timeline__item--left' : 'battersea-timeline__item--right');
      }

      // Scroll reveal
      if (this.direction === 'vertical') {
        // Vertical: delegate to Animation component
        if (this.alternate) {
          var animType = (index % 2 === 0) ? 'fade-right' : 'fade-left';
          wrapper.setAttribute('data-animation', animType);
        } else {
          wrapper.setAttribute('data-animation', 'fade-up');
        }
      } else {
        // Horizontal: custom reveal (handled in setupScrollReveal)
        wrapper.classList.add('battersea-timeline__item--hidden');
      }

      // Build marker
      var marker = document.createElement('div');
      marker.className = 'battersea-timeline__marker';
      var iconData = Utils.getData(item, 'timeline-icon');
      if (iconData) {
        marker.textContent = iconData;
        marker.classList.add('battersea-timeline__marker--icon');
      }

      // Build card container
      var card = document.createElement('div');
      card.className = 'battersea-timeline__card';

      // Date badge
      var dateStr = Utils.getData(item, 'timeline-date');
      if (dateStr) {
        var dateBadge = document.createElement('span');
        dateBadge.className = 'battersea-timeline__date';
        dateBadge.textContent = dateStr;
        card.appendChild(dateBadge);
      }

      if (this.direction === 'horizontal') {
        // Horizontal: show title + intro on card, store full content for panel
        var titleEl = item.querySelector('h3, [data-timeline-title]');
        if (titleEl) {
          var cardTitle = titleEl.cloneNode(true);
          card.appendChild(cardTitle);
        }

        var introText = Utils.getData(item, 'timeline-intro');
        if (introText) {
          var introEl = document.createElement('p');
          introEl.className = 'battersea-timeline__intro';
          introEl.textContent = introText;
          card.appendChild(introEl);
        }

        // Hidden full content (shown on mobile fallback)
        var fullContentEl = document.createElement('div');
        fullContentEl.className = 'battersea-timeline__full-content';
        fullContentEl.innerHTML = item.innerHTML;
        card.appendChild(fullContentEl);

        // Store content for the panel
        this.itemContentMap.push({
          content: item.innerHTML,
          date: dateStr
        });
      } else {
        // Vertical: move original item content into the card
        card.appendChild(item);
      }

      wrapper.appendChild(marker);
      wrapper.appendChild(card);

      return wrapper;
    }

    buildHorizontalNav() {
      this.prevBtn = document.createElement('button');
      this.prevBtn.className = 'battersea-timeline__nav battersea-timeline__nav--prev';
      this.prevBtn.setAttribute('aria-label', 'Previous');
      this.prevBtn.innerHTML = '\u2039';

      this.nextBtn = document.createElement('button');
      this.nextBtn.className = 'battersea-timeline__nav battersea-timeline__nav--next';
      this.nextBtn.setAttribute('aria-label', 'Next');
      this.nextBtn.innerHTML = '\u203A';

      var navParent = this.trackWrapper || this.el;
      navParent.appendChild(this.prevBtn);
      navParent.appendChild(this.nextBtn);

      this.updateNavVisibility();
    }

    checkDirection() {
      var width = window.innerWidth;

      if (this.direction === 'horizontal' && width >= 768) {
        this.isHorizontal = true;
        this.el.classList.add('battersea-timeline--horizontal');
        this.el.classList.remove('battersea-timeline--vertical');
      } else {
        this.isHorizontal = false;
        this.el.classList.add('battersea-timeline--vertical');
        this.el.classList.remove('battersea-timeline--horizontal');
      }

      if (this.direction === 'vertical' && this.alternate && width >= 768) {
        this.el.classList.add('battersea-timeline--alternate');
      } else {
        this.el.classList.remove('battersea-timeline--alternate');
      }

      if (this.prevBtn && this.nextBtn) {
        this.prevBtn.style.display = this.isHorizontal ? '' : 'none';
        this.nextBtn.style.display = this.isHorizontal ? '' : 'none';
      }
    }

    setupScrollReveal() {
      // Vertical mode uses the Animation component (via data-animate attributes)
      if (this.direction !== 'horizontal') return;

      var wrappers = this.wrapperEls;

      if (!('IntersectionObserver' in window)) {
        wrappers.forEach(function(item) {
          item.classList.remove('battersea-timeline__item--hidden');
          item.classList.add('battersea-timeline__item--visible');
        });
        this.el.classList.add('battersea-timeline--snap-ready');
        return;
      }

      this.observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            wrappers.forEach(function(item, i) {
              setTimeout(function() {
                item.classList.remove('battersea-timeline__item--hidden');
                item.classList.add('battersea-timeline__item--visible');
              }, i * 100);
            });
            this.observer.unobserve(entry.target);

            // After all items revealed, enable snap highlighting
            var totalRevealTime = (wrappers.length * 100) + 600;
            setTimeout(function() {
              this.el.classList.add('battersea-timeline--snap-ready');
            }.bind(this), totalRevealTime);
          }
        }.bind(this));
      }.bind(this), { threshold: 0.1 });

      this.observer.observe(this.el);
    }

    setupHorizontalSnap() {
      if (!this.trackEl) return;

      // Listen to scroll to detect centred item
      this.events.push(
        Utils.addEvent(this.trackEl, 'scroll', Utils.debounce(function() {
          this.updateActiveItem();
          this.updateNavVisibility();
        }.bind(this), 80))
      );

      // Set first item active after layout settles
      setTimeout(function() {
        this.updateSpacerWidths();
        this.updateActiveItem();
      }.bind(this), 200);
    }

    updateSpacerWidths() {
      if (!this.trackEl || !this.startSpacer || !this.endSpacer) return;
      if (!this.isHorizontal) return;

      var containerWidth = this.trackEl.clientWidth;
      var firstItem = this.wrapperEls[0];
      if (!firstItem) return;

      var itemWidth = firstItem.offsetWidth;
      var spacerWidth = Math.max(0, (containerWidth / 2) - (itemWidth / 2));

      this.startSpacer.style.minWidth = spacerWidth + 'px';
      this.endSpacer.style.minWidth = spacerWidth + 'px';
    }

    updateActiveItem() {
      if (!this.trackEl || this.wrapperEls.length === 0) return;

      var trackRect = this.trackEl.getBoundingClientRect();
      var trackCentre = trackRect.left + (trackRect.width / 2);

      var closestIndex = 0;
      var closestDistance = Infinity;

      this.wrapperEls.forEach(function(wrapper, index) {
        var rect = wrapper.getBoundingClientRect();
        var itemCentre = rect.left + (rect.width / 2);
        var distance = Math.abs(itemCentre - trackCentre);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex === this.activeIndex) return;

      this.wrapperEls.forEach(function(wrapper) {
        wrapper.classList.remove('battersea-timeline__item--active');
      });

      this.wrapperEls[closestIndex].classList.add('battersea-timeline__item--active');
      this.activeIndex = closestIndex;

      this.updatePanel(closestIndex);

      this.el.dispatchEvent(new CustomEvent('battersea:timelineItemActive', {
        detail: { index: closestIndex }
      }));
    }

    updatePanel(index) {
      if (!this.panelEl || !this.itemContentMap[index]) return;

      // Fade out
      this.panelEl.classList.remove('battersea-timeline__panel--visible');

      // Swap content after fade-out, then fade in
      setTimeout(function() {
        this.panelEl.innerHTML = this.itemContentMap[index].content;
        void this.panelEl.offsetHeight;
        this.panelEl.classList.add('battersea-timeline__panel--visible');
      }.bind(this), 250);
    }

    bindEvents() {
      // Responsive resize
      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(function() {
          this.checkDirection();
          if (this.isHorizontal) {
            this.updateNavVisibility();
            this.updateSpacerWidths();
            this.updateActiveItem();
          }
        }.bind(this), 250))
      );

      // Horizontal nav clicks
      if (this.prevBtn) {
        this.events.push(Utils.addEvent(this.prevBtn, 'click', function() {
          this.scrollHorizontal(-1);
        }.bind(this)));
      }
      if (this.nextBtn) {
        this.events.push(Utils.addEvent(this.nextBtn, 'click', function() {
          this.scrollHorizontal(1);
        }.bind(this)));
      }

      // Keyboard navigation for horizontal
      this.events.push(
        Utils.addEvent(this.el, 'keydown', function(e) {
          if (this.isHorizontal) {
            if (e.key === 'ArrowLeft') this.scrollHorizontal(-1);
            if (e.key === 'ArrowRight') this.scrollHorizontal(1);
          }
        }.bind(this))
      );
    }

    scrollHorizontal(direction) {
      if (!this.trackEl) return;

      var firstItem = this.wrapperEls[0];
      if (!firstItem) return;

      var cardWidth = firstItem.offsetWidth;
      var gap = parseFloat(getComputedStyle(this.trackEl).gap) || 30;
      var scrollAmount = (cardWidth + gap) * direction;

      this.trackEl.scrollBy({ left: scrollAmount, behavior: 'smooth' });

      this.el.dispatchEvent(new CustomEvent('battersea:timelineScroll', {
        detail: { direction: direction > 0 ? 'next' : 'prev' }
      }));
    }

    updateNavVisibility() {
      if (!this.trackEl || !this.prevBtn || !this.nextBtn) return;

      var scrollLeft = this.trackEl.scrollLeft;
      var scrollWidth = this.trackEl.scrollWidth;
      var clientWidth = this.trackEl.clientWidth;

      this.prevBtn.classList.toggle('battersea-timeline__nav--disabled', scrollLeft <= 0);
      this.nextBtn.classList.toggle('battersea-timeline__nav--disabled', scrollLeft + clientWidth >= scrollWidth - 1);
    }

    destroy() {
      this.events.forEach(function(event) { event.remove(); });
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.itemContentMap = [];
      this.wrapperEls = [];
      this.activeIndex = -1;
    }
  }

  window.Battersea.register('timeline', Timeline, '[data-timeline]');

})(window, document);
