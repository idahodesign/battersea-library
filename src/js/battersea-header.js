/**
 * Battersea Library - Header Component
 * Version: 2.4.0
 * Adaptive header with shrink-on-scroll, transparent mode, pre-header bar, logo swapping, and mobile menu
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
      this.transparent = Utils.parseBoolean(Utils.getData(el, 'transparent') || 'false');

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
      this.logoFound = !!this.logo;
      this.isTransparentActive = false;

      // Mobile logo handling
      this.desktopLogoSrc = this.logo ? this.logo.src : null;
      this.logoSwapBreakpoint = 768;

      // Mobile menu
      this.mobileMenuEnabled = Utils.parseBoolean(Utils.getData(el, 'mobile-menu') || 'true');
      this.mobileBreakpoint = Utils.parseInt(Utils.getData(el, 'mobile-breakpoint'), 768);
      this.toggle = null;
      this.mobileOverlay = null;
      this.mobileMenuOpen = false;
      this.panelStack = [];
      this.mobileNavBuilt = false;

      // If logo not found initially, set up observer to detect when it's loaded via includes
      if (!this.logo) {
        this.setupLogoObserver();
      }

      this.init();
    }

    /**
     * Watch for logo element to be added via dynamic includes
     */
    setupLogoObserver() {
      if (!('MutationObserver' in window)) return;

      this.logoObserver = new MutationObserver((mutations) => {
        // Check if logo has been added
        const logo = Utils.qs('.battersea-header__logo', this.el);
        if (logo && !this.logoFound) {
          this.logoFound = true;
          this.logo = logo;
          this.desktopLogoSrc = logo.src;

          // Recalculate heights now that logo is available
          this.calculateHeights();
          this.dispatchHeightEvent();
        }

        // Check if toggle button has been added via includes
        if (this.mobileMenuEnabled && !this.toggle) {
          this.toggle = Utils.qs('.battersea-header__toggle', this.el);
          if (this.toggle) {
            this.events.push(
              Utils.addEvent(this.toggle, 'click', () => this.toggleMobileMenu())
            );
          }
        }

        // Check if navigation has been added - build mobile nav
        if (this.mobileMenuEnabled && !this.mobileNavBuilt) {
          const navList = Utils.qs('.battersea-hnav', this.el);
          if (navList) {
            this.buildMobileNav();
          }
        }

        // Disconnect once both logo and nav are found
        if (this.logoFound && this.mobileNavBuilt) {
          this.logoObserver.disconnect();
          this.logoObserver = null;
        }
      });

      this.logoObserver.observe(this.el, {
        childList: true,
        subtree: true
      });
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
      
      // Setup transparent mode if enabled
      if (this.transparent) {
        this.setupTransparent();
      }

      // Setup mobile menu if enabled
      if (this.mobileMenuEnabled) {
        this.setupMobileMenu();
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

      // Recalculate transparent margin if active
      if (this.transparent) {
        this.updateTransparentMargin();
      }
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

      // Close mobile menu when switching to desktop
      if (!this.isMobile && wasMobile && this.mobileMenuOpen) {
        this.closeMobileMenu();
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

    setupTransparent() {
      this.el.classList.add('battersea-header--transparent');
      this.el.classList.add('battersea-header--transparent-active');
      this.isTransparentActive = true;

      if (this.preHeader) {
        this.preHeader.classList.add('battersea-header-pre--transparent-active');
      }

      this.updateTransparentMargin();

      // Watch for size changes (e.g. includes loading) and recalculate margin
      this.transparentResizeObserver = new ResizeObserver(() => {
        this.updateTransparentMargin();
      });
      this.transparentResizeObserver.observe(this.el);
      if (this.preHeader) {
        this.transparentResizeObserver.observe(this.preHeader);
      }
    }

    updateTransparentMargin() {
      const headerHeight = this.el.offsetHeight;
      const preHeaderHeight = this.preHeader ? this.preHeader.offsetHeight : 0;
      const totalPull = headerHeight + preHeaderHeight;
      // Apply negative margin-top to the content after the header — margin-bottom
      // on sticky elements does not pull siblings up in all browsers.
      // Skip any header-owned elements (e.g. mobile overlay) to find the real content.
      let target = this.el.nextElementSibling;
      while (target && target.className.indexOf('battersea-header') === 0) {
        target = target.nextElementSibling;
      }
      if (target) {
        this.transparentTarget = target;
        target.style.marginTop = -totalPull + 'px';
      }
    }

    attachEvents() {
      // Scroll handler for shrink, pre-header hide, and transparent toggle
      if (this.shrink || this.preHeader || this.transparent) {
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
      
      // Handle transparent background toggle
      // Note: pre-header stays permanently transparent when transparent mode is active
      if (this.transparent) {
        if (scrollY > 10 && this.isTransparentActive) {
          this.isTransparentActive = false;
          this.el.classList.remove('battersea-header--transparent-active');
          this.el.dispatchEvent(new CustomEvent('battersea:headerTransparent', {
            detail: { isTransparent: false }
          }));
        } else if (scrollY <= 10 && !this.isTransparentActive) {
          this.isTransparentActive = true;
          this.el.classList.add('battersea-header--transparent-active');
          this.el.dispatchEvent(new CustomEvent('battersea:headerTransparent', {
            detail: { isTransparent: true }
          }));
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

    // ============================================
    // Mobile Menu
    // ============================================

    setupMobileMenu() {
      // Find toggle button (may already exist in HTML or will be found by observer)
      this.toggle = Utils.qs('.battersea-header__toggle', this.el);

      // Create overlay element
      this.mobileOverlay = document.createElement('div');
      this.mobileOverlay.className = 'battersea-header__mobile-overlay';
      this.mobileOverlay.setAttribute('role', 'dialog');
      this.mobileOverlay.setAttribute('aria-modal', 'true');
      this.mobileOverlay.setAttribute('aria-label', 'Mobile navigation');

      // Spacer to push content below header
      this.mobileSpacer = document.createElement('div');
      this.mobileSpacer.className = 'battersea-header__mobile-spacer';
      this.mobileOverlay.appendChild(this.mobileSpacer);

      // Panel container
      this.mobilePanels = document.createElement('div');
      this.mobilePanels.className = 'battersea-header__mobile-panels';
      this.mobileOverlay.appendChild(this.mobilePanels);

      // Insert overlay after the header
      this.el.parentNode.insertBefore(this.mobileOverlay, this.el.nextSibling);

      // Wire up toggle button if already present
      if (this.toggle) {
        this.events.push(
          Utils.addEvent(this.toggle, 'click', () => this.toggleMobileMenu())
        );
      }

      // ESC key to close
      this.events.push(
        Utils.addEvent(document, 'keydown', (e) => {
          if (e.key === 'Escape' && this.mobileMenuOpen) {
            this.closeMobileMenu();
          }
        })
      );

      // Try to build nav immediately if markup is already loaded
      const navList = Utils.qs('.battersea-hnav', this.el);
      if (navList) {
        this.buildMobileNav();
      }
    }

    buildMobileNav() {
      if (this.mobileNavBuilt) return;

      const navList = Utils.qs('.battersea-hnav', this.el);
      if (!navList) return;

      this.mobileNavBuilt = true;

      // Clear any existing panels
      this.mobilePanels.innerHTML = '';
      this.panelStack = [];

      // Build root panel from top-level nav items
      var rootPanel = this.createPanel(navList.children, null);
      rootPanel.classList.remove('battersea-header__mobile-panel--right');
      rootPanel.classList.add('battersea-header__mobile-panel--active');
      this.mobilePanels.appendChild(rootPanel);
      this.panelStack.push(rootPanel);
    }

    createPanel(items, parentLabel) {
      var panel = document.createElement('div');
      panel.className = 'battersea-header__mobile-panel battersea-header__mobile-panel--right';

      // Add back button for sub-panels
      if (parentLabel) {
        var backBtn = document.createElement('button');
        backBtn.className = 'battersea-header__mobile-back';
        backBtn.setAttribute('aria-label', 'Back to ' + parentLabel);
        backBtn.textContent = parentLabel;
        this.events.push(
          Utils.addEvent(backBtn, 'click', () => this.drillUp())
        );
        panel.appendChild(backBtn);
      }

      var list = document.createElement('ul');
      list.className = 'battersea-header__mobile-list';

      var itemsArray = Array.from(items);
      for (var i = 0; i < itemsArray.length; i++) {
        var sourceItem = itemsArray[i];
        if (sourceItem.tagName !== 'LI') continue;

        var li = document.createElement('li');
        li.className = 'battersea-header__mobile-item';

        // Find the link in this item
        var sourceLink = Utils.qs('a', sourceItem);
        if (!sourceLink) continue;

        var linkText = sourceLink.textContent.trim();
        var linkHref = sourceLink.getAttribute('href');
        var linkTarget = sourceLink.getAttribute('target');

        // Check for sub-navigation (dropdown or flyout)
        var subNav = Utils.qs('.battersea-hnav__dropdown, .battersea-hnav__flyout, .battersea-hnav__accordion', sourceItem);
        var hasChildren = subNav && subNav.children.length > 0;

        if (hasChildren) {
          // Button that triggers drill-down
          var btn = document.createElement('button');
          btn.className = 'battersea-header__mobile-link battersea-header__mobile-link--has-children';
          btn.textContent = linkText;

          // Store the sub-items for lazy panel creation
          var subItems = subNav.children;
          (function(b, si, lt, self) {
            self.events.push(
              Utils.addEvent(b, 'click', function() {
                self.drillDown(si, lt);
              })
            );
          })(btn, subItems, linkText, this);

          li.appendChild(btn);
        } else {
          // Regular link
          var link = document.createElement('a');
          link.className = 'battersea-header__mobile-link';
          link.href = linkHref || '#';
          link.textContent = linkText;
          if (linkTarget) {
            link.target = linkTarget;
          }

          // Close menu on link click
          this.events.push(
            Utils.addEvent(link, 'click', () => {
              this.closeMobileMenu();
            })
          );

          li.appendChild(link);
        }

        list.appendChild(li);
      }

      panel.appendChild(list);
      return panel;
    }

    toggleMobileMenu() {
      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    }

    openMobileMenu() {
      if (this.mobileMenuOpen) return;
      this.mobileMenuOpen = true;

      // Update spacer height to push content below header (accounts for pre-header)
      this.mobileSpacer.style.height = this.el.getBoundingClientRect().bottom + 'px';

      // Show overlay
      this.mobileOverlay.classList.add('battersea-header__mobile-overlay--open');

      // Update header class for hamburger animation
      this.el.classList.add('battersea-header--menu-open');

      // Update toggle ARIA
      if (this.toggle) {
        this.toggle.setAttribute('aria-expanded', 'true');
        this.toggle.setAttribute('aria-label', 'Close menu');
      }

      // Lock body scroll
      this.savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus first interactive element in overlay
      var firstFocusable = Utils.qs('button, a', this.mobileOverlay);
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Setup focus trap
      this.setupFocusTrap();

      // Dispatch event
      var event = new CustomEvent('battersea:mobileMenuOpen', {
        detail: { header: this }
      });
      this.el.dispatchEvent(event);
    }

    closeMobileMenu() {
      if (!this.mobileMenuOpen) return;
      this.mobileMenuOpen = false;

      // Hide overlay
      this.mobileOverlay.classList.remove('battersea-header__mobile-overlay--open');

      // Remove header class
      this.el.classList.remove('battersea-header--menu-open');

      // Update toggle ARIA
      if (this.toggle) {
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.setAttribute('aria-label', 'Open menu');
      }

      // Restore body scroll
      document.body.style.overflow = this.savedBodyOverflow || '';

      // Reset to root panel
      this.resetPanels();

      // Remove focus trap
      this.removeFocusTrap();

      // Return focus to toggle
      if (this.toggle) {
        this.toggle.focus();
      }

      // Dispatch event
      var event = new CustomEvent('battersea:mobileMenuClose', {
        detail: { header: this }
      });
      this.el.dispatchEvent(event);
    }

    setPanelPosition(panel, position) {
      panel.classList.remove(
        'battersea-header__mobile-panel--active',
        'battersea-header__mobile-panel--left',
        'battersea-header__mobile-panel--right'
      );
      panel.classList.add('battersea-header__mobile-panel--' + position);
    }

    drillDown(subItems, parentLabel) {
      // Create new panel for sub-items
      var newPanel = this.createPanel(subItems, parentLabel);
      this.mobilePanels.appendChild(newPanel);

      // Get current active panel
      var currentPanel = this.panelStack[this.panelStack.length - 1];

      // Force reflow to ensure the new panel starts at translateX(100%)
      void newPanel.offsetHeight;

      // Slide current panel left, new panel in from right
      this.setPanelPosition(currentPanel, 'left');
      this.setPanelPosition(newPanel, 'active');

      this.panelStack.push(newPanel);

      // Focus back button in new panel
      var backBtn = Utils.qs('.battersea-header__mobile-back', newPanel);
      if (backBtn) {
        setTimeout(function() { backBtn.focus(); }, 350);
      }
    }

    drillUp() {
      if (this.panelStack.length <= 1) return;

      // Remove current panel
      var currentPanel = this.panelStack.pop();

      // Get parent panel
      var parentPanel = this.panelStack[this.panelStack.length - 1];

      // Slide current panel right (off-screen), parent back in
      this.setPanelPosition(currentPanel, 'right');
      this.setPanelPosition(parentPanel, 'active');

      // Remove the panel from DOM after animation
      setTimeout(function() {
        if (currentPanel.parentNode) {
          currentPanel.parentNode.removeChild(currentPanel);
        }
      }, 350);
    }

    resetPanels() {
      // Remove all sub-panels, keep only root
      while (this.panelStack.length > 1) {
        var panel = this.panelStack.pop();
        if (panel.parentNode) {
          panel.parentNode.removeChild(panel);
        }
      }

      // Reset root panel position
      if (this.panelStack.length === 1) {
        var rootPanel = this.panelStack[0];
        rootPanel.className = 'battersea-header__mobile-panel battersea-header__mobile-panel--active';
      }
    }

    setupFocusTrap() {
      // Remove existing trap if any
      this.removeFocusTrap();

      this.focusTrapHandler = (e) => {
        if (e.key !== 'Tab' || !this.mobileMenuOpen) return;

        var focusable = Utils.qsa(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          this.mobileOverlay
        );

        // Include the toggle button in the focus trap
        if (this.toggle) {
          focusable.unshift(this.toggle);
        }

        if (focusable.length === 0) return;

        var firstEl = focusable[0];
        var lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      };

      this.focusTrapEvent = Utils.addEvent(document, 'keydown', this.focusTrapHandler);
      this.events.push(this.focusTrapEvent);
    }

    removeFocusTrap() {
      if (this.focusTrapEvent) {
        this.focusTrapEvent.remove();
        // Remove from events array
        var idx = this.events.indexOf(this.focusTrapEvent);
        if (idx > -1) {
          this.events.splice(idx, 1);
        }
        this.focusTrapEvent = null;
      }
      this.focusTrapHandler = null;
    }

    destroyMobileMenu() {
      // Close menu if open
      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      }

      // Remove overlay
      if (this.mobileOverlay && this.mobileOverlay.parentNode) {
        this.mobileOverlay.parentNode.removeChild(this.mobileOverlay);
      }

      // Remove menu-open class
      this.el.classList.remove('battersea-header--menu-open');

      // Reset state
      this.mobileOverlay = null;
      this.mobilePanels = null;
      this.mobileSpacer = null;
      this.toggle = null;
      this.panelStack = [];
      this.mobileNavBuilt = false;
      this.mobileMenuOpen = false;
    }

    destroy() {
      // Clean up mobile menu
      if (this.mobileMenuEnabled) {
        this.destroyMobileMenu();
      }

      // Disconnect observers
      if (this.logoObserver) {
        this.logoObserver.disconnect();
        this.logoObserver = null;
      }
      if (this.transparentResizeObserver) {
        this.transparentResizeObserver.disconnect();
        this.transparentResizeObserver = null;
      }

      // Remove all event listeners
      this.events.forEach(event => event.remove());
      this.events = [];

      // Remove classes
      this.el.classList.remove('battersea-header--sticky');
      this.el.classList.remove('battersea-header--shrunk');
      this.el.classList.remove('battersea-header--shrink-enabled');
      this.el.classList.remove('battersea-header--transparent');
      this.el.classList.remove('battersea-header--transparent-active');
      this.el.classList.remove(`battersea-header--${this.layout}`);

      // Reset inline styles
      this.el.style.height = '';
      if (this.transparentTarget) {
        this.transparentTarget.style.marginTop = '';
      }
      if (this.logo) {
        this.logo.style.transform = '';
        this.logo.style.transition = '';
        this.logo.style.opacity = '';
      }
      
      // Reset pre-header if present
      if (this.preHeader) {
        this.preHeader.classList.remove('battersea-header-pre--hidden');
        this.preHeader.classList.remove('battersea-header-pre--transparent-active');
        this.preHeader.style.height = '';
      }
    }
  }

  // Register component with Battersea
  window.Battersea.register('header', Header, '[data-header]');

})(window, document);
