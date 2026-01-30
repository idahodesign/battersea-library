/**
 * Battersea Library - Header Component
 * Version: 2.2.0
 * Adaptive header with shrink-on-scroll, pre-header bar, and logo swapping
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('[Header] requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Header {
    constructor(el) {
      this.el = el;
      this.events = [];
      
      // Get configuration from data attributes
      this.sticky = Utils.parseBoolean(Utils.getData(el, 'sticky') || 'false');
      this.shrink = Utils.parseBoolean(Utils.getData(el, 'shrink') || 'false');
      this.shrinkOffset = Utils.parseInt(Utils.getData(el, 'shrink-offset'), 100);
      this.shrinkHeight = Utils.parseInt(Utils.getData(el, 'shrink-height'), 60);
      this.layout = Utils.getData(el, 'layout') || 'right-align';
      this.logoMobile = Utils.getData(el, 'logo-mobile');
      this.transitionSpeed = Utils.parseFloat(Utils.getData(el, 'transition-speed'), 0.3);
      this.headerHeight = Utils.parseInt(Utils.getData(el, 'header-height'), 0); // 0 = auto
      this.mobileLogoHeight = Utils.parseInt(Utils.getData(el, 'mobile-logo-height'), 0); // 0 = auto
      
      // Find elements
      this.brand = Utils.qs('.battersea-header__brand', this.el);
      this.logo = Utils.qs('.battersea-header__logo', this.el);
      this.nav = Utils.qs('.battersea-header__nav', this.el);
      this.preHeader = document.querySelector('.battersea-header-pre');
      
      // State tracking
      this.isSticky = false;
      this.isShrunk = false;
      this.isMobile = false;
      this.isScrolling = false;
      this.currentHeight = 0;
      this.lastScrollY = 0;
      this.ticking = false;
      
      // Mobile logo handling
      this.desktopLogoSrc = this.logo ? this.logo.src : null;
      this.logoSwapBreakpoint = 768;
      
      // Validate required elements
      if (!this.logo) {
        console.warn('[Header] Logo element (.battersea-header__logo) not found');
      }
      
      this.init();
    }

    init() {
      // Add layout class
      this.el.classList.add(`battersea-header--${this.layout}`);
      
      // Set initial responsive state
      this.updateResponsive();
      
      // Calculate and set initial heights
      this.calculateHeights();
      
      // Setup sticky behavior if enabled
      if (this.sticky) {
        this.setupSticky();
      }
      
      // Setup shrink behavior if enabled (and not mobile)
      if (this.shrink && !this.isMobile) {
        this.setupShrink();
      }
      
      // Setup pre-header behavior
      if (this.preHeader) {
        this.setupPreHeader();
      }
      
      this.attachEvents();
      
      // Dispatch initial height for other components (like SmoothScroll)
      this.dispatchHeightEvent();
    }

    calculateHeights() {
      // Calculate initial header height
      if (this.headerHeight > 0) {
        // Manual height specified
        this.currentHeight = this.headerHeight;
        this.el.style.height = this.headerHeight + 'px';
      } else {
        // Auto-calculate from logo
        if (this.logo) {
          const logoHeight = this.logo.offsetHeight || this.logo.naturalHeight || 40;
          const computedStyle = window.getComputedStyle(this.el);
          const paddingTop = parseFloat(computedStyle.paddingTop) || 20;
          const paddingBottom = parseFloat(computedStyle.paddingBottom) || 20;
          
          this.currentHeight = logoHeight + paddingTop + paddingBottom;
          
          // Don't force height in CSS, let it be natural
          // but track it for calculations
        } else {
          this.currentHeight = this.el.offsetHeight;
        }
      }
      
      // Store initial height for shrink calculations
      this.initialHeight = this.currentHeight;
    }

    updateResponsive() {
      const width = window.innerWidth;
      const wasMobile = this.isMobile;
      
      this.isMobile = width < this.logoSwapBreakpoint;
      
      // Handle logo swapping
      if (this.logo && this.logoMobile) {
        if (this.isMobile && !wasMobile) {
          // Swap to mobile logo
          this.swapLogo(this.logoMobile);
        } else if (!this.isMobile && wasMobile) {
          // Swap back to desktop logo
          this.swapLogo(this.desktopLogoSrc);
        }
      }
      
      // Recalculate heights on mobile change
      if (wasMobile !== this.isMobile) {
        // Wait for logo to load if swapped
        setTimeout(() => {
          this.calculateHeights();
          this.dispatchHeightEvent();
        }, 50);
      }
      
      // Handle shrink behavior on mobile
      if (this.isMobile && this.isShrunk) {
        // Disable shrink on mobile
        this.unshrink();
      }
    }

    swapLogo(newSrc) {
      if (!this.logo || !newSrc) return;
      
      // Add transition class for smooth fade/scale
      this.logo.style.transition = `opacity ${this.transitionSpeed}s ease, transform ${this.transitionSpeed}s ease`;
      this.logo.style.opacity = '0';
      this.logo.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        this.logo.src = newSrc;
        
        // Wait for logo to load
        this.logo.onload = () => {
          this.logo.style.opacity = '1';
          this.logo.style.transform = 'scale(1)';
          
          // Recalculate height after logo loads
          if (this.isMobile && this.mobileLogoHeight > 0) {
            // Use specified mobile logo height
            this.currentHeight = this.mobileLogoHeight;
            this.el.style.height = this.mobileLogoHeight + 'px';
          } else {
            this.calculateHeights();
          }
          
          this.dispatchHeightEvent();
        };
      }, this.transitionSpeed * 1000 / 2);
    }

    setupSticky() {
      // Make header sticky from the start
      this.el.classList.add('battersea-header--sticky');
      this.isSticky = true;
      
      // Set top position to account for pre-header if it exists
      if (this.preHeader) {
        const preHeaderHeight = this.preHeader.offsetHeight;
        this.el.style.top = preHeaderHeight + 'px';
        this.stickyTop = preHeaderHeight;
      } else {
        this.el.style.top = '0px';
        this.stickyTop = 0;
      }
      
      // Dispatch sticky event
      const event = new CustomEvent('battersea:headerSticky', {
        detail: { height: this.currentHeight }
      });
      this.el.dispatchEvent(event);
    }

    setupShrink() {
      // Add shrink-enabled class for CSS hooks
      this.el.classList.add('battersea-header--shrink-enabled');
      
      // Set CSS variable for transition speed
      this.el.style.setProperty('--header-transition-speed', `${this.transitionSpeed}s`);
    }

    setupPreHeader() {
      // Get pre-header configuration
      const preMobile = Utils.getData(this.preHeader, 'pre-mobile') || 'show';
      const preTablet = Utils.getData(this.preHeader, 'pre-tablet') || 'show';
      const preDesktop = Utils.getData(this.preHeader, 'pre-desktop') || 'show';
      const preHeight = Utils.parseInt(Utils.getData(this.preHeader, 'pre-height'), 40);
      
      // Set pre-header height
      this.preHeader.style.height = preHeight + 'px';
      
      // Apply device visibility classes
      this.preHeader.classList.toggle('battersea-header-pre--hidden-mobile', preMobile === 'hide');
      this.preHeader.classList.toggle('battersea-header-pre--hidden-tablet', preTablet === 'hide');
      this.preHeader.classList.toggle('battersea-header-pre--hidden-desktop', preDesktop === 'hide');
      
      // Store pre-header height
      this.preHeaderHeight = preHeight;
    }

    attachEvents() {
      // Scroll handler for shrink and pre-header hide
      if (this.shrink || this.preHeader) {
        this.events.push(
          Utils.addEvent(window, 'scroll', () => this.onScroll(), { passive: true })
        );
      }
      
      // Resize handler
      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(() => {
          this.updateResponsive();
          this.calculateHeights();
          this.dispatchHeightEvent();
        }, 250))
      );
    }

    onScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Use requestAnimationFrame for smooth updates
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll(scrollY);
          this.ticking = false;
        });
        this.ticking = true;
      }
      
      this.lastScrollY = scrollY;
    }

    handleScroll(scrollY) {
      // Handle pre-header visibility
      if (this.preHeader) {
        if (scrollY > 10 && !this.preHeader.classList.contains('battersea-header-pre--hidden')) {
          this.preHeader.classList.add('battersea-header-pre--hidden');
          
          // Adjust header top position when pre-header hides
          if (this.isSticky) {
            this.el.style.top = '0px';
          }
        } else if (scrollY <= 10 && this.preHeader.classList.contains('battersea-header-pre--hidden')) {
          this.preHeader.classList.remove('battersea-header-pre--hidden');
          
          // Restore header top position when pre-header shows
          if (this.isSticky && this.stickyTop) {
            this.el.style.top = this.stickyTop + 'px';
          }
        }
      }
      
      // Handle shrink behavior (desktop/tablet only) with hysteresis
      if (this.shrink && !this.isMobile) {
        // Add buffer zones: shrink at offset+20, unshrink at offset-20
        const shrinkThreshold = this.shrinkOffset + 20;
        const unshrinkThreshold = this.shrinkOffset - 20;
        
        if (scrollY > shrinkThreshold && !this.isShrunk) {
          this.shrinkHeader();
        } else if (scrollY < unshrinkThreshold && this.isShrunk) {
          this.unshrink();
        }
      }
    }

    shrinkHeader() {
      if (this.isShrunk) return;
      
      this.isShrunk = true;
      
      // Apply shrink height via CSS custom property for smooth transition
      if (this.headerHeight === 0) {
        // Auto mode - use CSS variable so transition works
        this.el.style.setProperty('--header-shrink-height', this.shrinkHeight + 'px');
        this.currentHeight = this.shrinkHeight;
      }
      
      // Add shrunk class AFTER setting the CSS variable
      this.el.classList.add('battersea-header--shrunk');
      
      // Scale logo if present
      if (this.logo) {
        const scale = this.shrinkHeight / this.initialHeight;
        this.logo.style.transform = `scale(${Math.max(scale, 0.7)})`;
      }
      
      // Dispatch shrink event
      const event = new CustomEvent('battersea:headerShrink', {
        detail: { 
          height: this.currentHeight,
          shrunkHeight: this.shrinkHeight 
        }
      });
      this.el.dispatchEvent(event);
      
      // Dispatch height change event AFTER transition completes
      setTimeout(() => {
        this.dispatchHeightEvent();
      }, this.transitionSpeed * 1000);
    }

    unshrink() {
      if (!this.isShrunk) return;
      
      this.isShrunk = false;
      this.el.classList.remove('battersea-header--shrunk');
      
      // Restore original height
      if (this.headerHeight === 0) {
        this.el.style.height = '';
        // Recalculate current height
        setTimeout(() => {
          this.currentHeight = this.el.offsetHeight;
          this.dispatchHeightEvent();
        }, this.transitionSpeed * 1000);
      } else {
        this.currentHeight = this.headerHeight;
      }
      
      // Reset logo scale
      if (this.logo) {
        this.logo.style.transform = 'scale(1)';
      }
      
      // Dispatch expand event
      const event = new CustomEvent('battersea:headerExpand', {
        detail: { height: this.currentHeight }
      });
      this.el.dispatchEvent(event);
      
      // Dispatch height change event
      setTimeout(() => {
        this.dispatchHeightEvent();
      }, this.transitionSpeed * 1000);
    }

    dispatchHeightEvent() {
      // Get current computed height for accuracy
      const computedHeight = this.el.offsetHeight;
      this.currentHeight = computedHeight;
      
      const event = new CustomEvent('battersea:headerResize', {
        detail: { 
          height: computedHeight,
          isShrunk: this.isShrunk,
          isSticky: this.isSticky
        }
      });
      this.el.dispatchEvent(event);
    }

    getHeight() {
      return this.el.offsetHeight;
    }

    destroy() {
      // Remove all event listeners
      this.events.forEach(event => event.remove());
      this.events = [];
      
      // Remove classes
      this.el.classList.remove('battersea-header--sticky');
      this.el.classList.remove('battersea-header--shrunk');
      this.el.classList.remove('battersea-header--shrink-enabled');
      this.el.classList.remove(`battersea-header--${this.layout}`);
      
      // Reset inline styles
      this.el.style.height = '';
      if (this.logo) {
        this.logo.style.transform = '';
        this.logo.style.transition = '';
        this.logo.style.opacity = '';
      }
      
      // Reset pre-header if present
      if (this.preHeader) {
        this.preHeader.classList.remove('battersea-header-pre--hidden');
        this.preHeader.style.height = '';
      }
    }
  }

  // Register component with Battersea
  window.Battersea.register('header', Header, '[data-header]');

})(window, document);
