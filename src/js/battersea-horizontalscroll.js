/**
 * Battersea Library - HorizontalScroll Component
 * Version: 1.0.0
 *
 * Scroll-driven horizontal panel navigation. Vertical scrolling
 * translates a row of full-viewport panels sideways inside a
 * sticky container.
 *
 * Usage:
 * <div data-horizontal-scroll
 *      data-horizontalscroll-dots="true"
 *      data-horizontalscroll-direction="right"
 *      data-horizontalscroll-speed="1">
 *   <div data-horizontal-scroll-panel>Panel 1</div>
 *   <div data-horizontal-scroll-panel>Panel 2</div>
 * </div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('HorizontalScroll requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;
  const MOBILE_BREAKPOINT = 768;

  class HorizontalScroll {
    constructor(el) {
      if (!el) return;

      this.el = el;
      this.panels = [];
      this.stickyEl = null;
      this.trackEl = null;
      this.dotsNav = null;
      this.dots = [];
      this.events = [];
      this.isMobile = false;
      this.currentPanel = -1;
      this.panelCount = 0;

      this.init();
    }

    init() {
      this.parseOptions();
      this.panels = Array.from(this.el.querySelectorAll('[data-horizontal-scroll-panel]'));
      this.panelCount = this.panels.length;

      if (this.panelCount < 2) return;

      this.isMobile = this.checkMobile();
      this.buildStructure();

      if (this.showDots) {
        this.createDots();
      }

      this.bindEvents();

      if (!this.isMobile) {
        this.enableDesktop();
      } else {
        this.enableMobile();
      }
    }

    parseOptions() {
      this.showDots = Utils.parseBoolean(Utils.getData(this.el, 'horizontalscroll-dots') || 'true');
      this.dotPosition = Utils.parseInt(Utils.getData(this.el, 'horizontalscroll-dot-position'), 20);
      this.speed = Utils.parseFloat(Utils.getData(this.el, 'horizontalscroll-speed'), 1);
      this.speed = Math.max(0.5, Math.min(2, this.speed));

      const dir = (Utils.getData(this.el, 'horizontalscroll-direction') || 'right').toLowerCase();
      this.direction = (dir === 'left') ? 'left' : 'right';
    }

    buildStructure() {
      this.stickyEl = document.createElement('div');
      this.stickyEl.className = 'battersea-hscroll__sticky';

      this.trackEl = document.createElement('div');
      this.trackEl.className = 'battersea-hscroll__track';

      this.panels.forEach(panel => {
        panel.classList.add('battersea-hscroll__panel');
        this.trackEl.appendChild(panel);
      });

      this.stickyEl.appendChild(this.trackEl);
      this.el.appendChild(this.stickyEl);
      this.el.classList.add('battersea-hscroll');
    }

    createDots() {
      this.dotsNav = document.createElement('nav');
      this.dotsNav.className = 'battersea-hscroll__dots';
      this.dotsNav.setAttribute('role', 'navigation');
      this.dotsNav.setAttribute('aria-label', 'Panel navigation');
      this.dotsNav.style.bottom = this.dotPosition + 'px';

      this.dots = [];

      for (let i = 0; i < this.panelCount; i++) {
        const btn = document.createElement('button');
        btn.className = 'battersea-hscroll__dot';
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', 'Go to panel ' + (i + 1));

        this.events.push(
          Utils.addEvent(btn, 'click', () => this.onDotClick(i))
        );

        this.dots.push(btn);
        this.dotsNav.appendChild(btn);
      }

      this.stickyEl.appendChild(this.dotsNav);
    }

    bindEvents() {
      this.events.push(
        Utils.addEvent(window, 'scroll', Utils.throttle(() => this.onScroll(), 10), { passive: true }),
        Utils.addEvent(window, 'resize', Utils.debounce(() => this.handleResize(), 250))
      );
    }

    onScroll() {
      if (this.isMobile) return;

      const rect = this.el.getBoundingClientRect();
      const zoneHeight = this.el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = zoneHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const scrolled = -rect.top;

      if (scrolled <= 0 || scrolled >= scrollableDistance) {
        if (scrolled <= 0) {
          this.updateTrackPosition(0);
          this.updateDots(0);
        } else {
          this.updateTrackPosition(1);
          this.updateDots(this.panelCount - 1);
        }
        return;
      }

      const progress = scrolled / scrollableDistance;
      this.updateTrackPosition(progress);

      const panelIndex = Math.min(
        Math.floor(progress * this.panelCount),
        this.panelCount - 1
      );
      this.updateDots(panelIndex);
    }

    updateTrackPosition(progress) {
      const maxTranslate = (this.panelCount - 1) * window.innerWidth;

      let translateX;
      if (this.direction === 'right') {
        translateX = -(progress * maxTranslate);
      } else {
        translateX = -(maxTranslate) + (progress * maxTranslate);
      }

      this.trackEl.style.transform = 'translateX(' + translateX + 'px)';
    }

    updateDots(panelIndex) {
      if (panelIndex === this.currentPanel) return;
      this.currentPanel = panelIndex;

      if (this.showDots && this.dots.length) {
        const dotIndex = (this.direction === 'left')
          ? (this.panelCount - 1 - panelIndex)
          : panelIndex;

        this.dots.forEach((dot, i) => {
          const isActive = i === dotIndex;
          dot.classList.toggle('battersea-hscroll__dot--active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }

      this.el.dispatchEvent(new CustomEvent('battersea:horizontalScrollChange', {
        detail: { panelIndex: panelIndex, panelCount: this.panelCount }
      }));
    }

    onDotClick(index) {
      if (this.panelCount <= 1) return;

      const dotIndex = (this.direction === 'left')
        ? (this.panelCount - 1 - index)
        : index;

      const zoneTop = this.el.getBoundingClientRect().top + window.pageYOffset;
      const zoneHeight = this.el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableDistance = zoneHeight - viewportHeight;
      const targetScroll = zoneTop + (dotIndex / (this.panelCount - 1)) * scrollableDistance;

      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    checkMobile() {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }

    enableDesktop() {
      this.el.classList.remove('battersea-hscroll--mobile');
      this.el.style.height = (this.panelCount * 100 / this.speed) + 'vh';

      if (this.dotsNav) {
        this.dotsNav.style.display = '';
      }

      this.onScroll();
    }

    enableMobile() {
      this.el.classList.add('battersea-hscroll--mobile');
      this.el.style.height = '';
      this.trackEl.style.transform = '';

      if (this.dotsNav) {
        this.dotsNav.style.display = 'none';
      }
    }

    handleResize() {
      const wasMobile = this.isMobile;
      this.isMobile = this.checkMobile();

      if (wasMobile !== this.isMobile) {
        if (this.isMobile) {
          this.enableMobile();
        } else {
          this.enableDesktop();
        }
      } else if (!this.isMobile) {
        this.el.style.height = (this.panelCount * 100 / this.speed) + 'vh';
        this.onScroll();
      }
    }

    destroy() {
      this.events.forEach(event => event.remove());
      this.events = [];

      this.panels.forEach(panel => {
        panel.classList.remove('battersea-hscroll__panel');
        this.el.appendChild(panel);
      });

      if (this.stickyEl && this.stickyEl.parentNode) {
        this.stickyEl.parentNode.removeChild(this.stickyEl);
      }

      this.el.classList.remove('battersea-hscroll', 'battersea-hscroll--mobile');
      this.el.style.height = '';

      this.stickyEl = null;
      this.trackEl = null;
      this.dotsNav = null;
      this.dots = [];
      this.panels = [];
      this.currentPanel = -1;
    }
  }

  window.Battersea.register('horizontalScroll', HorizontalScroll, '[data-horizontal-scroll]');

})(window, document);
