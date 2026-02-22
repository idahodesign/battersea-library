/**
 * Battersea Library - Vertical Navigation Component
 * Version: 2.5.2
 *
 * Features:
 * - Three modes: simple, collapsible, flyout
 * - Collapsible: hover-to-expand (links stay clickable) or click-to-expand (button toggles)
 * - Optional sidebar toggle (show/hide)
 * - Off-canvas panel (slide-in from left or right, any screen size)
 * - Mobile overlay with drill-down panels (matches Header mobile menu)
 * - External toggle support (hamburger in header with animation)
 * - Active page detection with active-trail
 * - Keyboard navigation (Tab, Enter, Space, Escape, Arrow keys)
 * - Responsive: flyout falls back to collapsible on mobile
 * - CSS custom properties for theming
 *
 * Usage:
 * <nav data-vertical-nav data-vertical-nav-mode="collapsible" aria-label="Sidebar">
 *   <ul class="battersea-vnav">
 *     <li class="battersea-vnav__item">
 *       <a href="/page" class="battersea-vnav__link">Link</a>
 *     </li>
 *     <li class="battersea-vnav__item">
 *       <a href="/category" class="battersea-vnav__link">Category</a>
 *       <ul class="battersea-vnav__group">
 *         <li class="battersea-vnav__item">
 *           <a href="/sub" class="battersea-vnav__link">Sub Link</a>
 *         </li>
 *       </ul>
 *     </li>
 *   </ul>
 * </nav>
 *
 * Off-canvas panel:
 * <nav data-vertical-nav data-vertical-nav-offcanvas="true"
 *      data-vertical-nav-offcanvas-direction="left" data-vertical-nav-id="sidebar">
 *
 * External toggle (hamburger in header):
 * <button class="battersea-vnav__external-toggle" data-vertical-nav-toggle-target="mySidebar">
 *   <span></span><span></span><span></span>
 * </button>
 * <nav data-vertical-nav data-vertical-nav-id="mySidebar" ...>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('VerticalNav requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class VerticalNav {
    constructor(el) {
      // Prevent duplicate instances
      if (el._batterseaVnavInstance) {
        return el._batterseaVnavInstance;
      }

      this.el = el;
      this.events = [];
      this.hoverTimers = new Map();
      this.activeFlyouts = new Set();

      // Configuration from data attributes
      this.mode = Utils.getData(el, 'vertical-nav-mode') || 'simple';
      this.allowMultiple = Utils.parseBoolean(Utils.getData(el, 'vertical-nav-multiple') || 'false');
      this.toggleEnabled = Utils.parseBoolean(Utils.getData(el, 'vertical-nav-toggle') || 'false');
      this.toggleLabel = Utils.getData(el, 'vertical-nav-toggle-label') || 'Menu';
      this.startCollapsed = Utils.parseBoolean(Utils.getData(el, 'vertical-nav-collapsed') || 'false');
      this.animationSpeed = Utils.parseInt(Utils.getData(el, 'vertical-nav-animation-speed'), 300);
      this.flyoutHoverDelay = Utils.parseInt(Utils.getData(el, 'vertical-nav-flyout-hover-delay'), 200);
      this.mobileBreakpoint = 768;

      // External toggle / mobile overlay config
      this.navId = Utils.getData(el, 'vertical-nav-id') || null;
      this.mobileOverlayEnabled = Utils.parseBoolean(Utils.getData(el, 'vertical-nav-mobile-overlay') || 'true');

      // Off-canvas config
      this.offCanvasEnabled = Utils.parseBoolean(Utils.getData(el, 'vertical-nav-offcanvas') || 'false');
      this.offCanvasDirection = Utils.getData(el, 'vertical-nav-offcanvas-direction') || 'left';

      // Find nav container
      this.navContainer = Utils.qs('.battersea-vnav', el);
      if (!this.navContainer) {
        console.warn('VerticalNav: No .battersea-vnav container found');
        return;
      }

      // State
      this.isCollapsed = false;
      this.isMobile = window.innerWidth < this.mobileBreakpoint;
      this.effectiveMode = this.isMobile && this.mode === 'flyout' ? 'collapsible' : this.mode;
      this.mobileMenuOpen = false;
      this.mobileNavBuilt = false;
      this.panelStack = [];
      this.offCanvasOpen = false;
      this.offCanvasBackdrop = null;

      // Store instance reference
      el._batterseaVnavInstance = this;

      this.init();
    }

    init() {
      if (this.el.hasAttribute('data-vnav-initialized')) {
        return;
      }

      this.el.setAttribute('data-vnav-initialized', 'true');
      this.el.classList.add('battersea-vnav-initialized');

      // Setup navigation structure
      this.setupNavigation();

      // Detect active page
      this.detectActivePage();

      // Attach mode-specific events
      this.attachEvents();

      // Setup toggle if enabled
      if (this.toggleEnabled) {
        this.setupToggle();
      }

      // Setup external toggle if one targets this nav
      this.setupExternalToggle();

      // Setup off-canvas panel
      if (this.offCanvasEnabled) {
        this.setupOffCanvas();
      }

      // Setup mobile overlay (skip if off-canvas is enabled — off-canvas handles its own overlay)
      if (this.mobileOverlayEnabled && !this.offCanvasEnabled) {
        this.setupMobileMenu();
      }

      // Start collapsed if configured
      if (this.startCollapsed) {
        this.collapse();
      }

      // Check initial screen size
      this.handleResize();

      // Dispatch init event
      this.el.dispatchEvent(new CustomEvent('battersea:vnavInit', {
        detail: { nav: this }
      }));
    }

    setupNavigation() {
      // Process all items — find those with child <ul> elements
      var items = Utils.qsa('.battersea-vnav__item', this.navContainer);

      items.forEach(function(item) {
        // Only process direct child <ul>, not deeply nested ones
        var childUl = item.querySelector(':scope > ul');
        if (!childUl) return;

        if (this.effectiveMode === 'collapsible' || (this.effectiveMode === 'flyout' && this.isMobile)) {
          // Collapsible mode setup
          childUl.classList.add('battersea-vnav__group');
          item.classList.add('battersea-vnav__item--has-group');

          // Check for an existing toggle button
          var existingToggle = item.querySelector(':scope > .battersea-vnav__group-toggle');
          if (existingToggle) {
            // Pre-existing button toggle — click-to-expand (unchanged behaviour)
            existingToggle.setAttribute('aria-expanded', 'false');
          } else {
            // Link with child group — keep the link, expand on hover
            var link = item.querySelector(':scope > .battersea-vnav__link');
            if (link) {
              link.classList.add('battersea-vnav__link--has-group');
              link.setAttribute('aria-expanded', 'false');
              item.classList.add('battersea-vnav__item--hover-expand');
            }
          }

          // Initial state — collapsed
          childUl.style.maxHeight = '0px';
          childUl.style.overflow = 'hidden';

        } else if (this.effectiveMode === 'flyout') {
          // Flyout mode setup
          childUl.classList.add('battersea-vnav__flyout');
          item.classList.add('battersea-vnav__item--has-flyout');

          var flyoutLink = item.querySelector(':scope > .battersea-vnav__link');
          if (flyoutLink) {
            flyoutLink.setAttribute('aria-haspopup', 'true');
            flyoutLink.setAttribute('aria-expanded', 'false');
          }
        }
      }.bind(this));
    }

    detectActivePage() {
      var currentPath = window.location.pathname;
      var currentHash = window.location.hash;
      var currentUrl = currentPath + currentHash;
      var allLinks = Utils.qsa('a', this.navContainer);
      var foundExactMatch = false;

      allLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href) return;

        if (href === currentUrl ||
            (href === currentPath && currentPath !== '/' && currentPath !== '')) {
          link.classList.add('active');
          foundExactMatch = true;

          // Add active-trail to parent items
          var parent = link.closest('li');
          while (parent && parent !== this.navContainer) {
            parent.classList.add('active-trail');
            var parentEl = parent.parentElement;
            parent = parentEl ? parentEl.closest('li') : null;
          }
        }
      }.bind(this));

      // Hash-only fallback
      if (!foundExactMatch && currentHash) {
        allLinks.forEach(function(link) {
          var href = link.getAttribute('href');
          if (href === currentHash) {
            link.classList.add('active');
            var parent = link.closest('li');
            while (parent && parent !== this.navContainer) {
              parent.classList.add('active-trail');
              var parentEl = parent.parentElement;
              parent = parentEl ? parentEl.closest('li') : null;
            }
          }
        }.bind(this));
      }

      // Auto-open groups containing active items (collapsible mode)
      if (this.effectiveMode === 'collapsible') {
        var activeTrailGroups = Utils.qsa('.battersea-vnav__item--has-group.active-trail', this.navContainer);
        activeTrailGroups.forEach(function(item) {
          this.openGroup(item, true); // silent open, no event
        }.bind(this));
      }
    }

    attachEvents() {
      var self = this;

      if (this.effectiveMode === 'collapsible') {
        this._attachCollapsibleEvents();
      } else if (this.effectiveMode === 'flyout') {
        this._attachFlyoutEvents();
      }

      // Window resize
      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(function() {
          self.handleResize();
        }, 250))
      );

      // ESC key to close
      this.events.push(
        Utils.addEvent(document, 'keydown', function(e) {
          if (e.key === 'Escape') {
            if (self.offCanvasOpen) {
              self.closeOffCanvas();
            } else if (self.mobileMenuOpen) {
              self.closeMobileMenu();
            } else {
              self.closeAll();
            }
          }
        })
      );

      // Click outside to close flyouts
      if (this.effectiveMode === 'flyout') {
        this.events.push(
          Utils.addEvent(document, 'click', function(e) {
            if (!self.el.contains(e.target)) {
              self.closeAll();
            }
          })
        );
      }

      // Keyboard navigation
      this.events.push(
        Utils.addEvent(this.el, 'keydown', function(e) {
          self.handleKeydown(e);
        })
      );
    }

    _attachCollapsibleEvents() {
      var self = this;
      var groupItems = Utils.qsa('.battersea-vnav__item--has-group', this.navContainer);

      groupItems.forEach(function(item) {
        if (item.classList.contains('battersea-vnav__item--hover-expand')) {
          // Hover-to-expand — link stays clickable, group opens on hover
          self.events.push(
            Utils.addEvent(item, 'mouseenter', function() {
              self.clearFlyoutTimer(item);
              self.openGroup(item);
            })
          );

          self.events.push(
            Utils.addEvent(item, 'mouseleave', function() {
              self.scheduleGroupClose(item);
            })
          );
        } else {
          // Button toggle — click-to-expand (original behaviour)
          var toggle = item.querySelector(':scope > .battersea-vnav__group-toggle');
          if (toggle) {
            self.events.push(
              Utils.addEvent(toggle, 'click', function(e) {
                e.stopPropagation();
                self.toggleGroup(item);
              })
            );
          }
        }
      });
    }

    scheduleGroupClose(item) {
      var self = this;
      var timer = setTimeout(function() {
        self.closeGroup(item);
        self.hoverTimers.delete(item);
      }, this.flyoutHoverDelay);
      this.hoverTimers.set(item, timer);
    }

    _attachFlyoutEvents() {
      var self = this;
      var flyoutItems = Utils.qsa('.battersea-vnav__item--has-flyout', this.navContainer);

      flyoutItems.forEach(function(item) {
        // Mouse enter — show flyout
        self.events.push(
          Utils.addEvent(item, 'mouseenter', function() {
            if (!self.isMobile) {
              self.clearFlyoutTimer(item);

              // Close sibling flyouts
              var siblings = Utils.getSiblings(item);
              siblings.forEach(function(sibling) {
                if (sibling.classList.contains('battersea-vnav__item--has-flyout')) {
                  self.clearFlyoutTimer(sibling);
                  self.activeFlyouts.delete(sibling);
                  self.hideFlyout(sibling);
                }
              });

              self.activeFlyouts.add(item);
              self.showFlyout(item);
            }
          })
        );

        // Mouse leave — schedule close
        self.events.push(
          Utils.addEvent(item, 'mouseleave', function(e) {
            if (!self.isMobile) {
              var flyout = Utils.qs('.battersea-vnav__flyout', item);
              if (flyout && flyout.contains(e.relatedTarget)) {
                return;
              }
              self.activeFlyouts.delete(item);
              self.scheduleFlyoutClose(item);
            }
          })
        );

        // Flyout mouse events
        var flyout = Utils.qs('.battersea-vnav__flyout', item);
        if (flyout) {
          self.events.push(
            Utils.addEvent(flyout, 'mouseenter', function() {
              self.clearFlyoutTimer(item);
              self.activeFlyouts.add(item);
            })
          );

          self.events.push(
            Utils.addEvent(flyout, 'mouseleave', function(e) {
              if (item.contains(e.relatedTarget) && !flyout.contains(e.relatedTarget)) {
                return;
              }
              self.activeFlyouts.delete(item);
              self.hideFlyout(item);
            })
          );
        }

        // Click handler for keyboard/touch users
        var link = item.querySelector(':scope > .battersea-vnav__link');
        if (link) {
          self.events.push(
            Utils.addEvent(link, 'click', function(e) {
              var href = link.getAttribute('href');
              if (!href || href === '#') {
                e.preventDefault();
                if (item.classList.contains('battersea-vnav__item--flyout-open')) {
                  self.hideFlyout(item);
                } else {
                  self.showFlyout(item);
                }
              }
            })
          );
        }
      });
    }

    // ---- Collapsible Mode Methods ----

    toggleGroup(item) {
      if (item.classList.contains('battersea-vnav__item--open')) {
        this.closeGroup(item);
      } else {
        this.openGroup(item);
      }
    }

    openGroup(item, silent) {
      var group = item.querySelector(':scope > .battersea-vnav__group');
      if (!group) return;

      if (!this.allowMultiple) {
        // Close sibling groups
        var siblings = Utils.getSiblings(item);
        siblings.forEach(function(sib) {
          if (sib.classList.contains('battersea-vnav__item--has-group') &&
              sib.classList.contains('battersea-vnav__item--open')) {
            this.closeGroup(sib);
          }
        }.bind(this));
      }

      // Measure height
      group.style.display = 'block';
      var height = group.scrollHeight;
      group.style.maxHeight = '0px';
      void group.offsetHeight; // Force reflow

      item.classList.add('battersea-vnav__item--open');

      // Update ARIA — works with both button toggles and hover-expand links
      var toggle = item.querySelector(':scope > .battersea-vnav__group-toggle') ||
                   item.querySelector(':scope > .battersea-vnav__link--has-group');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');

      requestAnimationFrame(function() {
        group.style.maxHeight = height + 'px';
      });

      // After transition, allow natural height
      var transitionEnd = function() {
        if (item.classList.contains('battersea-vnav__item--open')) {
          group.style.maxHeight = 'none';
          group.style.overflow = 'visible';
        }
        group.removeEventListener(Utils.getTransitionEndEvent(), transitionEnd);
      };
      group.addEventListener(Utils.getTransitionEndEvent(), transitionEnd, { once: true });

      if (!silent) {
        this.el.dispatchEvent(new CustomEvent('battersea:vnavGroupOpen', {
          detail: { item: item, group: group }
        }));
      }
    }

    closeGroup(item) {
      var group = item.querySelector(':scope > .battersea-vnav__group');
      if (!group) return;

      var height = group.scrollHeight;
      group.style.maxHeight = height + 'px';
      group.style.overflow = 'hidden';
      void group.offsetHeight; // Force reflow

      item.classList.remove('battersea-vnav__item--open');

      var toggle = item.querySelector(':scope > .battersea-vnav__group-toggle') ||
                   item.querySelector(':scope > .battersea-vnav__link--has-group');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');

      requestAnimationFrame(function() {
        group.style.maxHeight = '0px';
      });

      this.el.dispatchEvent(new CustomEvent('battersea:vnavGroupClose', {
        detail: { item: item, group: group }
      }));
    }

    // ---- Flyout Mode Methods ----

    showFlyout(item) {
      var flyout = Utils.qs('.battersea-vnav__flyout', item);
      if (!flyout) return;

      if (item.classList.contains('battersea-vnav__item--flyout-open')) {
        return;
      }

      // Position the flyout
      this.positionFlyout(item, flyout);

      // Show
      item.classList.add('battersea-vnav__item--flyout-open');
      flyout.classList.add('battersea-vnav__flyout--visible');

      // Update ARIA
      var link = item.querySelector(':scope > .battersea-vnav__link');
      if (link) link.setAttribute('aria-expanded', 'true');

      this.el.dispatchEvent(new CustomEvent('battersea:vnavFlyoutOpen', {
        detail: { item: item, flyout: flyout }
      }));
    }

    hideFlyout(item) {
      var flyout = Utils.qs('.battersea-vnav__flyout', item);
      if (!flyout) return;

      this.activeFlyouts.delete(item);
      item.classList.remove('battersea-vnav__item--flyout-open');
      flyout.classList.remove('battersea-vnav__flyout--visible');

      // Update ARIA
      var link = item.querySelector(':scope > .battersea-vnav__link');
      if (link) link.setAttribute('aria-expanded', 'false');

      // Clean up positioning after animation
      setTimeout(function() {
        if (!item.classList.contains('battersea-vnav__item--flyout-open')) {
          flyout.classList.remove('battersea-vnav__flyout--left');
        }
      }, this.animationSpeed + 50);

      this.el.dispatchEvent(new CustomEvent('battersea:vnavFlyoutClose', {
        detail: { item: item, flyout: flyout }
      }));
    }

    positionFlyout(item, flyout) {
      var viewportWidth = window.innerWidth;
      var itemRect = item.getBoundingClientRect();

      // Measure flyout width
      var origVis = flyout.style.visibility;
      var origDisp = flyout.style.display;
      flyout.style.visibility = 'hidden';
      flyout.style.display = 'block';
      var flyoutWidth = flyout.offsetWidth;
      flyout.style.visibility = origVis;
      flyout.style.display = origDisp;

      var spaceOnRight = viewportWidth - itemRect.right;

      if (spaceOnRight < flyoutWidth) {
        flyout.classList.add('battersea-vnav__flyout--left');
      } else {
        flyout.classList.remove('battersea-vnav__flyout--left');
      }
    }

    scheduleFlyoutClose(item) {
      var self = this;
      var timer = setTimeout(function() {
        self.hideFlyout(item);
        self.hoverTimers.delete(item);
      }, this.flyoutHoverDelay);
      this.hoverTimers.set(item, timer);
    }

    clearFlyoutTimer(item) {
      var timer = this.hoverTimers.get(item);
      if (timer) {
        clearTimeout(timer);
        this.hoverTimers.delete(item);
      }
    }

    // ---- Toggle Methods ----

    setupToggle() {
      var self = this;
      var toggle = document.createElement('button');
      toggle.className = 'battersea-vnav__toggle';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Toggle sidebar navigation');
      toggle.type = 'button';

      toggle.innerHTML = '<span class="battersea-vnav__toggle-icon"></span>' +
                          '<span class="battersea-vnav__toggle-label">' + this.toggleLabel + '</span>';

      this.el.insertBefore(toggle, this.navContainer);
      this.toggleButton = toggle;

      this.events.push(
        Utils.addEvent(toggle, 'click', function() {
          self.toggle();
        })
      );
    }

    toggle() {
      if (this.isCollapsed) {
        this.expand();
      } else {
        this.collapse();
      }
    }

    expand() {
      this.isCollapsed = false;
      this.el.classList.remove('battersea-vnav--collapsed');
      if (this.toggleButton) {
        this.toggleButton.setAttribute('aria-expanded', 'true');
      }

      this.el.dispatchEvent(new CustomEvent('battersea:vnavToggle', {
        detail: { isCollapsed: false }
      }));
    }

    collapse() {
      this.isCollapsed = true;
      this.el.classList.add('battersea-vnav--collapsed');
      if (this.toggleButton) {
        this.toggleButton.setAttribute('aria-expanded', 'false');
      }

      this.el.dispatchEvent(new CustomEvent('battersea:vnavToggle', {
        detail: { isCollapsed: true }
      }));
    }

    // ---- External Toggle Support ----

    setupExternalToggle() {
      if (!this.navId) return;
      var self = this;

      // Find any external toggle buttons that target this nav
      var selector = '[data-vertical-nav-toggle-target="' + this.navId + '"]';
      var externalToggles = Utils.qsa(selector, document);

      externalToggles.forEach(function(btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open sidebar menu');

        // When off-canvas is enabled, always show external toggle and route to off-canvas
        if (self.offCanvasEnabled) {
          btn.style.display = 'flex';

          self.events.push(
            Utils.addEvent(btn, 'click', function() {
              self.toggleOffCanvas();
            })
          );
        } else {
          self.events.push(
            Utils.addEvent(btn, 'click', function() {
              self.toggleMobileMenu();
            })
          );
        }
      });

      this.externalToggles = externalToggles;
    }

    // ---- Mobile Overlay Menu ----

    setupMobileMenu() {
      var self = this;

      // Create overlay element
      this.mobileOverlay = document.createElement('div');
      this.mobileOverlay.className = 'battersea-vnav__mobile-overlay';
      this.mobileOverlay.setAttribute('role', 'dialog');
      this.mobileOverlay.setAttribute('aria-modal', 'true');
      this.mobileOverlay.setAttribute('aria-label', 'Mobile navigation');

      // Spacer to push content below header
      this.mobileSpacer = document.createElement('div');
      this.mobileSpacer.className = 'battersea-vnav__mobile-spacer';
      this.mobileOverlay.appendChild(this.mobileSpacer);

      // Panel container
      this.mobilePanels = document.createElement('div');
      this.mobilePanels.className = 'battersea-vnav__mobile-panels';
      this.mobileOverlay.appendChild(this.mobilePanels);

      // Insert overlay after the nav element
      this.el.parentNode.insertBefore(this.mobileOverlay, this.el.nextSibling);
    }

    buildMobileNav() {
      if (this.mobileNavBuilt) return;
      if (!this.navContainer) return;

      this.mobileNavBuilt = true;

      // Clear any existing panels
      this.mobilePanels.innerHTML = '';
      this.panelStack = [];

      // Build root panel from top-level nav items
      var rootPanel = this.createMobilePanel(this.navContainer.children, null);
      rootPanel.classList.remove('battersea-vnav__mobile-panel--right');
      rootPanel.classList.add('battersea-vnav__mobile-panel--active');
      this.mobilePanels.appendChild(rootPanel);
      this.panelStack.push(rootPanel);
    }

    createMobilePanel(items, parentLabel) {
      var self = this;
      var panel = document.createElement('div');
      panel.className = 'battersea-vnav__mobile-panel battersea-vnav__mobile-panel--right';

      // Add back button for sub-panels
      if (parentLabel) {
        var backBtn = document.createElement('button');
        backBtn.className = 'battersea-vnav__mobile-back';
        backBtn.setAttribute('aria-label', 'Back to ' + parentLabel);
        backBtn.textContent = parentLabel;
        this.events.push(
          Utils.addEvent(backBtn, 'click', function() { self.drillUp(); })
        );
        panel.appendChild(backBtn);
      }

      var list = document.createElement('ul');
      list.className = 'battersea-vnav__mobile-list';

      var itemsArray = Array.from(items);
      for (var i = 0; i < itemsArray.length; i++) {
        var sourceItem = itemsArray[i];
        if (sourceItem.tagName !== 'LI') continue;

        var li = document.createElement('li');
        li.className = 'battersea-vnav__mobile-item';

        // Find the link or toggle in this item
        var sourceLink = sourceItem.querySelector(':scope > a, :scope > .battersea-vnav__link');
        var sourceToggle = sourceItem.querySelector(':scope > .battersea-vnav__group-toggle');

        var linkText = '';
        var linkHref = '#';
        var linkTarget = null;

        if (sourceLink) {
          linkText = sourceLink.textContent.trim();
          linkHref = sourceLink.getAttribute('href') || '#';
          linkTarget = sourceLink.getAttribute('target');
        } else if (sourceToggle) {
          linkText = sourceToggle.textContent.trim();
        }

        if (!linkText) continue;

        // Check for sub-navigation (group, flyout, or plain ul)
        var subNav = sourceItem.querySelector(':scope > .battersea-vnav__group, :scope > .battersea-vnav__flyout, :scope > ul');
        var hasChildren = subNav && subNav.children.length > 0;

        if (hasChildren) {
          // Button that triggers drill-down
          var btn = document.createElement('button');
          btn.className = 'battersea-vnav__mobile-link battersea-vnav__mobile-link--has-children';
          btn.textContent = linkText;

          var subItems = subNav.children;
          (function(b, si, lt, ctx) {
            ctx.events.push(
              Utils.addEvent(b, 'click', function() {
                ctx.drillDown(si, lt);
              })
            );
          })(btn, subItems, linkText, this);

          li.appendChild(btn);
        } else {
          // Regular link
          var link = document.createElement('a');
          link.className = 'battersea-vnav__mobile-link';
          link.href = linkHref;
          link.textContent = linkText;
          if (linkTarget) {
            link.target = linkTarget;
          }

          // Close menu on link click
          this.events.push(
            Utils.addEvent(link, 'click', function() {
              self.closeMobileMenu();
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
      if (!this.mobileOverlay) return;

      this.mobileMenuOpen = true;

      // Build nav on first open (lazy)
      this.buildMobileNav();

      // Calculate spacer height — push content below header
      var header = Utils.qs('.battersea-header', document);
      if (header) {
        this.mobileSpacer.style.height = header.getBoundingClientRect().bottom + 'px';
      } else {
        this.mobileSpacer.style.height = '0px';
      }

      // Show overlay
      this.mobileOverlay.classList.add('battersea-vnav__mobile-overlay--open');

      // Add class to nav element for state tracking
      this.el.classList.add('battersea-vnav--mobile-open');

      // Update external toggle ARIA and animation class
      if (this.externalToggles) {
        this.externalToggles.forEach(function(btn) {
          btn.setAttribute('aria-expanded', 'true');
          btn.setAttribute('aria-label', 'Close sidebar menu');
          btn.classList.add('battersea-vnav__external-toggle--active');
        });
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
      this.el.dispatchEvent(new CustomEvent('battersea:vnavMobileOpen', {
        detail: { nav: this }
      }));
    }

    closeMobileMenu() {
      if (!this.mobileMenuOpen) return;
      this.mobileMenuOpen = false;

      // Hide overlay
      if (this.mobileOverlay) {
        this.mobileOverlay.classList.remove('battersea-vnav__mobile-overlay--open');
      }

      // Remove state class
      this.el.classList.remove('battersea-vnav--mobile-open');

      // Update external toggle ARIA and animation class
      if (this.externalToggles) {
        this.externalToggles.forEach(function(btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-label', 'Open sidebar menu');
          btn.classList.remove('battersea-vnav__external-toggle--active');
        });
      }

      // Restore body scroll
      document.body.style.overflow = this.savedBodyOverflow || '';

      // Reset to root panel
      this.resetPanels();

      // Remove focus trap
      this.removeFocusTrap();

      // Return focus to external toggle (if available) or nav
      if (this.externalToggles && this.externalToggles.length > 0) {
        this.externalToggles[0].focus();
      }

      // Dispatch event
      this.el.dispatchEvent(new CustomEvent('battersea:vnavMobileClose', {
        detail: { nav: this }
      }));
    }

    // ---- Mobile Panel Navigation ----

    setPanelPosition(panel, position) {
      panel.classList.remove(
        'battersea-vnav__mobile-panel--active',
        'battersea-vnav__mobile-panel--left',
        'battersea-vnav__mobile-panel--right'
      );
      panel.classList.add('battersea-vnav__mobile-panel--' + position);
    }

    drillDown(subItems, parentLabel) {
      var newPanel = this.createMobilePanel(subItems, parentLabel);
      this.mobilePanels.appendChild(newPanel);

      var currentPanel = this.panelStack[this.panelStack.length - 1];

      // Force reflow so the new panel starts at translateX(100%)
      void newPanel.offsetHeight;

      // Slide current panel left, new panel in from right
      this.setPanelPosition(currentPanel, 'left');
      this.setPanelPosition(newPanel, 'active');

      this.panelStack.push(newPanel);

      // Focus back button in new panel
      var backBtn = Utils.qs('.battersea-vnav__mobile-back', newPanel);
      if (backBtn) {
        setTimeout(function() { backBtn.focus(); }, 350);
      }
    }

    drillUp() {
      if (this.panelStack.length <= 1) return;

      var currentPanel = this.panelStack.pop();
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
        rootPanel.className = 'battersea-vnav__mobile-panel battersea-vnav__mobile-panel--active';
      }
    }

    // ---- Off-Canvas Panel ----

    setupOffCanvas() {
      var self = this;

      // Move nav to <body> to avoid containing-block issues
      // (parent transforms from animations break position:fixed)
      this.offCanvasOriginalParent = this.el.parentNode;
      this.offCanvasOriginalNext = this.el.nextSibling;
      document.body.appendChild(this.el);

      // Add off-canvas classes to nav element
      this.el.classList.add('battersea-vnav--offcanvas');
      this.el.classList.add('battersea-vnav--offcanvas-' + this.offCanvasDirection);

      // Create backdrop
      this.offCanvasBackdrop = document.createElement('div');
      this.offCanvasBackdrop.className = 'battersea-vnav__offcanvas-backdrop';
      document.body.appendChild(this.offCanvasBackdrop);

      // Click backdrop to close
      this.events.push(
        Utils.addEvent(this.offCanvasBackdrop, 'click', function() {
          self.closeOffCanvas();
        })
      );
    }

    toggleOffCanvas() {
      if (this.offCanvasOpen) {
        this.closeOffCanvas();
      } else {
        this.openOffCanvas();
      }
    }

    openOffCanvas() {
      if (this.offCanvasOpen) return;
      this.offCanvasOpen = true;

      // Show the panel
      this.el.classList.add('battersea-vnav--offcanvas-open');

      // Show backdrop
      if (this.offCanvasBackdrop) {
        this.offCanvasBackdrop.classList.add('battersea-vnav__offcanvas-backdrop--visible');
      }

      // Lock body scroll
      this.savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Update external toggle ARIA and animation class
      // Move toggles to <body> so they sit above the off-canvas panel
      // (parent transforms create stacking contexts that trap z-index)
      if (this.externalToggles) {
        this.externalToggles.forEach(function(btn) {
          btn.setAttribute('aria-expanded', 'true');
          btn.setAttribute('aria-label', 'Close sidebar menu');
          btn.classList.add('battersea-vnav__external-toggle--active');

          // Save original position and move to body
          btn._offCanvasOriginalParent = btn.parentNode;
          btn._offCanvasOriginalNext = btn.nextSibling;
          var rect = btn.getBoundingClientRect();
          document.body.appendChild(btn);
          btn.style.position = 'fixed';
          btn.style.top = rect.top + 'px';
          btn.style.left = rect.left + 'px';
          btn.style.zIndex = '1001';
        });
      }

      // Focus first focusable element in nav
      var firstFocusable = Utils.qs('.battersea-vnav__link, .battersea-vnav__group-toggle', this.el);
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Dispatch event
      this.el.dispatchEvent(new CustomEvent('battersea:vnavOffCanvasOpen', {
        detail: { nav: this }
      }));
    }

    closeOffCanvas() {
      if (!this.offCanvasOpen) return;
      this.offCanvasOpen = false;

      // Hide the panel
      this.el.classList.remove('battersea-vnav--offcanvas-open');

      // Hide backdrop
      if (this.offCanvasBackdrop) {
        this.offCanvasBackdrop.classList.remove('battersea-vnav__offcanvas-backdrop--visible');
      }

      // Restore body scroll
      document.body.style.overflow = this.savedBodyOverflow || '';

      // Update external toggle ARIA and restore to original position
      if (this.externalToggles) {
        this.externalToggles.forEach(function(btn) {
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-label', 'Open sidebar menu');
          btn.classList.remove('battersea-vnav__external-toggle--active');

          // Restore to original DOM position and clear inline styles
          if (btn._offCanvasOriginalParent) {
            if (btn._offCanvasOriginalNext) {
              btn._offCanvasOriginalParent.insertBefore(btn, btn._offCanvasOriginalNext);
            } else {
              btn._offCanvasOriginalParent.appendChild(btn);
            }
            btn.style.position = '';
            btn.style.top = '';
            btn.style.left = '';
            btn.style.zIndex = '';
            btn._offCanvasOriginalParent = null;
            btn._offCanvasOriginalNext = null;
          }
        });
      }

      // Return focus to external toggle
      if (this.externalToggles && this.externalToggles.length > 0) {
        this.externalToggles[0].focus();
      }

      // Dispatch event
      this.el.dispatchEvent(new CustomEvent('battersea:vnavOffCanvasClose', {
        detail: { nav: this }
      }));
    }

    // ---- Focus Trap ----

    setupFocusTrap() {
      this.removeFocusTrap();
      var self = this;

      this.focusTrapHandler = function(e) {
        if (e.key !== 'Tab' || !self.mobileMenuOpen) return;

        var focusable = Utils.qsa(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          self.mobileOverlay
        );

        // Include external toggles in focus trap
        if (self.externalToggles) {
          self.externalToggles.forEach(function(btn) {
            focusable.unshift(btn);
          });
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
        var idx = this.events.indexOf(this.focusTrapEvent);
        if (idx > -1) {
          this.events.splice(idx, 1);
        }
        this.focusTrapEvent = null;
      }
      this.focusTrapHandler = null;
    }

    // ---- Keyboard Navigation ----

    handleKeydown(e) {
      var focusable = Utils.qsa(
        '.battersea-vnav__link, .battersea-vnav__group-toggle, .battersea-vnav__toggle',
        this.el
      );

      // Filter to visible elements only
      focusable = focusable.filter(function(el) {
        return el.offsetParent !== null;
      });

      var currentIndex = focusable.indexOf(document.activeElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < focusable.length - 1) {
            focusable[currentIndex + 1].focus();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            focusable[currentIndex - 1].focus();
          }
          break;

        case 'ArrowRight':
          if (this.effectiveMode === 'flyout') {
            var flyoutItem = document.activeElement.closest('.battersea-vnav__item--has-flyout');
            if (flyoutItem) {
              e.preventDefault();
              this.showFlyout(flyoutItem);
              // Focus first link in flyout
              var firstLink = Utils.qs('.battersea-vnav__flyout .battersea-vnav__link', flyoutItem);
              if (firstLink) firstLink.focus();
            }
          }
          break;

        case 'ArrowLeft':
          if (this.effectiveMode === 'flyout') {
            var flyout = document.activeElement.closest('.battersea-vnav__flyout');
            if (flyout) {
              e.preventDefault();
              var parentItem = flyout.closest('.battersea-vnav__item--has-flyout');
              if (parentItem) {
                this.hideFlyout(parentItem);
                var parentLink = parentItem.querySelector(':scope > .battersea-vnav__link');
                if (parentLink) parentLink.focus();
              }
            }
          }
          break;

        case 'Enter':
        case ' ':
          if (document.activeElement.classList.contains('battersea-vnav__group-toggle')) {
            // Already handled by click event
            break;
          }
          if (this.effectiveMode === 'flyout') {
            var fItem = document.activeElement.closest('.battersea-vnav__item--has-flyout');
            if (fItem && document.activeElement === fItem.querySelector(':scope > .battersea-vnav__link')) {
              var href = document.activeElement.getAttribute('href');
              if (!href || href === '#') {
                e.preventDefault();
                if (fItem.classList.contains('battersea-vnav__item--flyout-open')) {
                  this.hideFlyout(fItem);
                } else {
                  this.showFlyout(fItem);
                }
              }
            }
          }
          break;
      }
    }

    // ---- Responsive ----

    handleResize() {
      var wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < this.mobileBreakpoint;

      // Off-canvas mode handles its own visibility — skip mobile class toggling
      if (this.offCanvasEnabled) {
        // Still track mobile state for flyout→collapsible fallback
        if (wasMobile !== this.isMobile && this.mode === 'flyout') {
          var newEffectiveMode = this.isMobile ? 'collapsible' : 'flyout';
          if (newEffectiveMode !== this.effectiveMode) {
            this.closeAll();
            this.effectiveMode = newEffectiveMode;
            this._detachModeEvents();
            if (this.effectiveMode === 'collapsible') {
              this._rebuildAsCollapsible();
              this._attachCollapsibleEvents();
            } else {
              this._rebuildAsFlyout();
              this._attachFlyoutEvents();
            }
          }
        }
        return;
      }

      // Hide desktop nav on mobile, show mobile overlay trigger
      if (this.isMobile) {
        this.el.classList.add('battersea-vnav--mobile');
      } else {
        this.el.classList.remove('battersea-vnav--mobile');
        // Close mobile menu if open and switching to desktop
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      }

      if (wasMobile !== this.isMobile) {
        var newEffectiveMode = this.isMobile && this.mode === 'flyout' ? 'collapsible' : this.mode;

        if (newEffectiveMode !== this.effectiveMode) {
          this.closeAll();
          this.effectiveMode = newEffectiveMode;
          // Rebuild event handlers for new mode
          this._detachModeEvents();
          if (this.effectiveMode === 'collapsible') {
            this._rebuildAsCollapsible();
            this._attachCollapsibleEvents();
          } else if (this.effectiveMode === 'flyout') {
            this._rebuildAsFlyout();
            this._attachFlyoutEvents();
          }
        }
      }
    }

    _detachModeEvents() {
      // Remove mode-specific events but keep resize, ESC, and keyboard handlers
      // Simpler approach: clear all and re-attach
      this.events.forEach(function(ev) { ev.remove(); });
      this.events = [];

      // Re-attach shared events
      var self = this;
      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(function() {
          self.handleResize();
        }, 250))
      );
      this.events.push(
        Utils.addEvent(document, 'keydown', function(e) {
          if (e.key === 'Escape') {
            if (self.offCanvasOpen) {
              self.closeOffCanvas();
            } else if (self.mobileMenuOpen) {
              self.closeMobileMenu();
            } else {
              self.closeAll();
            }
          }
        })
      );
      this.events.push(
        Utils.addEvent(this.el, 'keydown', function(e) {
          self.handleKeydown(e);
        })
      );
    }

    _rebuildAsCollapsible() {
      // Convert flyout items to collapsible groups — keep links, use hover-expand
      var flyoutItems = Utils.qsa('.battersea-vnav__item--has-flyout', this.navContainer);
      flyoutItems.forEach(function(item) {
        item.classList.remove('battersea-vnav__item--has-flyout');
        item.classList.add('battersea-vnav__item--has-group');

        var flyout = Utils.qs('.battersea-vnav__flyout', item);
        if (flyout) {
          flyout.classList.remove('battersea-vnav__flyout');
          flyout.classList.add('battersea-vnav__group');
          flyout.classList.remove('battersea-vnav__flyout--visible');
          flyout.classList.remove('battersea-vnav__flyout--left');
          flyout.style.maxHeight = '0px';
          flyout.style.overflow = 'hidden';
        }

        var link = item.querySelector(':scope > .battersea-vnav__link');
        if (link) {
          // Keep the link — use hover-expand instead of replacing with a button
          link.setAttribute('data-vnav-original-link', 'true');
          link.classList.add('battersea-vnav__link--has-group');
          link.setAttribute('aria-expanded', 'false');
          link.removeAttribute('aria-haspopup');
          item.classList.add('battersea-vnav__item--hover-expand');
        }
      });
    }

    _rebuildAsFlyout() {
      // Convert collapsible groups back to flyouts
      var groupItems = Utils.qsa('.battersea-vnav__item--has-group', this.navContainer);
      groupItems.forEach(function(item) {
        // Only convert items that were originally flyouts
        var originalLink = item.querySelector('[data-vnav-original-link]');
        if (!originalLink) return;

        item.classList.remove('battersea-vnav__item--has-group');
        item.classList.remove('battersea-vnav__item--hover-expand');
        item.classList.add('battersea-vnav__item--has-flyout');
        item.classList.remove('battersea-vnav__item--open');

        var group = Utils.qs('.battersea-vnav__group', item);
        if (group) {
          group.classList.remove('battersea-vnav__group');
          group.classList.add('battersea-vnav__flyout');
          group.style.maxHeight = '';
          group.style.overflow = '';
        }

        // Clean up hover-expand classes, restore flyout attributes
        originalLink.classList.remove('battersea-vnav__link--has-group');
        originalLink.removeAttribute('data-vnav-original-link');
        originalLink.setAttribute('aria-haspopup', 'true');
        originalLink.setAttribute('aria-expanded', 'false');
      });
    }

    // ---- Lifecycle ----

    closeAll() {
      var self = this;

      // Close all groups
      var openGroups = Utils.qsa('.battersea-vnav__item--open', this.navContainer);
      openGroups.forEach(function(item) {
        self.closeGroup(item);
      });

      // Close all flyouts
      var openFlyouts = Utils.qsa('.battersea-vnav__item--flyout-open', this.navContainer);
      openFlyouts.forEach(function(item) {
        self.hideFlyout(item);
      });

      // Clear timers
      this.hoverTimers.forEach(function(timer) { clearTimeout(timer); });
      this.hoverTimers.clear();
      this.activeFlyouts.clear();
    }

    destroy() {
      // Close mobile menu if open
      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      }

      // Close off-canvas if open
      if (this.offCanvasOpen) {
        this.closeOffCanvas();
      }

      this.events.forEach(function(ev) { ev.remove(); });
      this.events = [];

      this.hoverTimers.forEach(function(timer) { clearTimeout(timer); });
      this.hoverTimers.clear();
      this.activeFlyouts.clear();

      this.el.classList.remove('battersea-vnav-initialized');
      this.el.classList.remove('battersea-vnav--collapsed');
      this.el.classList.remove('battersea-vnav--mobile');
      this.el.classList.remove('battersea-vnav--mobile-open');
      this.el.classList.remove('battersea-vnav--offcanvas');
      this.el.classList.remove('battersea-vnav--offcanvas-left');
      this.el.classList.remove('battersea-vnav--offcanvas-right');
      this.el.classList.remove('battersea-vnav--offcanvas-open');
      this.el.removeAttribute('data-vnav-initialized');

      if (this.toggleButton) {
        this.toggleButton.remove();
        this.toggleButton = null;
      }

      if (this.mobileOverlay) {
        this.mobileOverlay.remove();
        this.mobileOverlay = null;
      }

      // Remove off-canvas backdrop and restore nav position
      if (this.offCanvasBackdrop) {
        this.offCanvasBackdrop.remove();
        this.offCanvasBackdrop = null;
      }
      if (this.offCanvasOriginalParent) {
        if (this.offCanvasOriginalNext) {
          this.offCanvasOriginalParent.insertBefore(this.el, this.offCanvasOriginalNext);
        } else {
          this.offCanvasOriginalParent.appendChild(this.el);
        }
        this.offCanvasOriginalParent = null;
        this.offCanvasOriginalNext = null;
      }

      // Clean up external toggle classes
      if (this.externalToggles) {
        this.externalToggles.forEach(function(btn) {
          btn.classList.remove('battersea-vnav__external-toggle--active');
          btn.removeAttribute('aria-expanded');
          btn.style.display = '';
        });
        this.externalToggles = null;
      }

      delete this.el._batterseaVnavInstance;
    }
  }

  // Register component with Battersea
  window.Battersea.register('verticalNav', VerticalNav, '[data-vertical-nav]');

})(window, document);
