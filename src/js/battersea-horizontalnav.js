/**
 * Battersea Library - Horizontal Navigation Component
 * Version: 2.2.0
 * 
 * Features:
 * - Up to 4 levels of navigation (main > dropdown > flyout > accordion)
 * - Hover-activated dropdowns with configurable delay
 * - Smart edge detection for 3rd/4th level positioning
 * - Smooth animations (slide up for dropdowns, slide left/right for flyouts)
 * - Active page highlighting
 * - Customizable icons for items with submenus
 * - Mobile mode integration (overlay mode)
 * 
 * Usage:
 * <nav class="battersea-header__nav" 
 *      data-horizontal-nav
 *      data-nav-hover-delay="200"
 *      data-nav-edge-threshold="250"
 *      data-nav-mobile-breakpoint="768"
 *      data-nav-mobile-mode="overlay">
 *   <ul class="battersea-hnav">
 *     <li class="battersea-hnav__item">
 *       <a href="#" class="battersea-hnav__link">Home</a>
 *     </li>
 *     <li class="battersea-hnav__item battersea-hnav__item--has-dropdown">
 *       <a href="#" class="battersea-hnav__link">Products</a>
 *       <ul class="battersea-hnav__dropdown">
 *         <li class="battersea-hnav__dropdown-item battersea-hnav__item--has-flyout">
 *           <a href="#" class="battersea-hnav__dropdown-link">Category 1</a>
 *           <ul class="battersea-hnav__flyout">
 *             <li class="battersea-hnav__flyout-item battersea-hnav__item--has-accordion">
 *               <a href="#" class="battersea-hnav__flyout-link">Subcategory 1</a>
 *               <ul class="battersea-hnav__accordion">
 *                 <li><a href="#">Item 1</a></li>
 *                 <li><a href="#">Item 2</a></li>
 *               </ul>
 *             </li>
 *           </ul>
 *         </li>
 *       </ul>
 *     </li>
 *   </ul>
 * </nav>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

/* eslint-env es6 */
/* global Map, Set */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('HorizontalNav requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class HorizontalNav {
    constructor(el) {
      // Check if already initialized - prevent duplicate instances
      if (el._batterseaHnavInstance) {
        return el._batterseaHnavInstance;
      }
      
      this.el = el;
      this.events = [];
      this.hoverTimers = new Map(); // Store timers for delayed close
      this.flyoutCloseTimers = new Map(); // Store flyout close timers
      this.activeDropdowns = new Set(); // Track open dropdowns
      this.activeFlyoutItems = new Set(); // Track items with open flyouts
      this.transitioningFlyouts = new Set(); // Track flyouts currently animating
      this.transitioningDropdowns = new Set(); // Track dropdowns currently animating
      this.flyoutPositions = new Map(); // Cache flyout positioning decisions
      
      // Configuration
      this.hoverDelay = Utils.parseInt(Utils.getData(el, 'nav-hover-delay'), 200);
      this.edgeThreshold = Utils.parseInt(Utils.getData(el, 'nav-edge-threshold'), 250);
      this.mobileBreakpoint = Utils.parseInt(Utils.getData(el, 'nav-mobile-breakpoint'), 768);
      this.mobileMode = Utils.getData(el, 'nav-mobile-mode') || 'overlay';
      
      // Find the navigation container
      // Check if the element itself is the nav container (for includes pattern)
      // or if it's a wrapper containing the nav (for inline pattern)
      if (el.classList.contains('battersea-hnav')) {
        this.navContainer = el;
      } else {
        this.navContainer = Utils.qs('.battersea-hnav', el);
      }
      
      if (!this.navContainer) {
        console.warn('HorizontalNav: No .battersea-hnav container found');
        return;
      }

      this.isMobile = window.innerWidth < this.mobileBreakpoint;
      
      // Store instance reference on element
      el._batterseaHnavInstance = this;
      
      this.init();
    }

    init() {
      // Check if already initialized to prevent duplicate event listeners
      if (this.el.hasAttribute('data-hnav-initialized')) {
        return;
      }
      
      // Mark as initialized
      this.el.setAttribute('data-hnav-initialized', 'true');
      
      // Add component class for styling
      this.el.classList.add('battersea-hnav-initialized');
      
      // Setup navigation structure
      this.setupNavigation();
      
      // Detect active page
      this.detectActivePage();
      
      // Attach events
      this.attachEvents();
      
      // Check initial screen size
      this.handleResize();
      
      // Dispatch initialization event
      const event = new CustomEvent('battersea:hnavInit', {
        detail: { nav: this }
      });
      this.el.dispatchEvent(event);
    }

    setupNavigation() {
      // Process all menu items and add necessary attributes
      const allItems = Utils.qsa('.battersea-hnav__item', this.navContainer);
      
      allItems.forEach(item => {
        // Check if item has dropdown
        const dropdown = Utils.qs('.battersea-hnav__dropdown', item);
        if (dropdown) {
          item.classList.add('battersea-hnav__item--has-dropdown');
          Utils.setData(item, 'has-submenu', 'true');
          
          // Add ARIA attributes
          const link = Utils.qs('.battersea-hnav__link', item);
          if (link) {
            link.setAttribute('aria-haspopup', 'true');
            link.setAttribute('aria-expanded', 'false');
          }
        }
        
        // Check if dropdown item has flyout
        const dropdownItems = Utils.qsa('.battersea-hnav__dropdown-item', item);
        dropdownItems.forEach(dropItem => {
          const flyout = Utils.qs('.battersea-hnav__flyout', dropItem);
          if (flyout) {
            dropItem.classList.add('battersea-hnav__item--has-flyout');
            Utils.setData(dropItem, 'has-submenu', 'true');
          }
        });
        
        // Check if flyout item has accordion
        const flyoutItems = Utils.qsa('.battersea-hnav__flyout-item', item);
        flyoutItems.forEach(flyItem => {
          const accordion = Utils.qs('.battersea-hnav__accordion', flyItem);
          if (accordion) {
            flyItem.classList.add('battersea-hnav__item--has-accordion');
            Utils.setData(flyItem, 'has-submenu', 'true');
            
            // Initially hide accordion
            accordion.style.maxHeight = '0px';
            accordion.style.overflow = 'hidden';
          }
        });
      });
    }

    detectActivePage() {
      // Get current URL path
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      const currentUrl = currentPath + currentHash;
      
      // Find all links
      const allLinks = Utils.qsa('a', this.navContainer);
      
      // First pass: find exact matches only
      let foundExactMatch = false;
      
      allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Check for exact match
        if (href === currentUrl || 
            (href === currentPath && currentPath !== '/' && currentPath !== '')) {
          link.classList.add('active');
          foundExactMatch = true;
          
          // Add active-trail class to parent items
          let parent = link.closest('li');
          while (parent && parent !== this.navContainer) {
            parent.classList.add('active-trail');
            // Safe navigation without optional chaining
            const parentEl = parent.parentElement;
            parent = parentEl ? parentEl.closest('li') : null;
          }
        }
      });
      
      // Second pass: if no exact match, try hash-only matching
      if (!foundExactMatch && currentHash) {
        allLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === currentHash) {
            link.classList.add('active');
            
            // Add active-trail class to parent items
            let parent = link.closest('li');
            while (parent && parent !== this.navContainer) {
              parent.classList.add('active-trail');
              // Safe navigation without optional chaining
              const parentEl = parent.parentElement;
              parent = parentEl ? parentEl.closest('li') : null;
            }
          }
        });
      }
    }

    attachEvents() {
      // Main navigation items (level 1 with dropdowns)
      const mainItems = Utils.qsa('.battersea-hnav__item--has-dropdown', this.navContainer);
      
      mainItems.forEach(item => {
        // Mouse enter - show dropdown
        this.events.push(
          Utils.addEvent(item, 'mouseenter', () => {
            if (!this.isMobile) {
              this.clearHoverTimer(item);
              this.showDropdown(item);
            }
          })
        );
        
        // Mouse leave - hide dropdown with delay
        this.events.push(
          Utils.addEvent(item, 'mouseleave', () => {
            if (!this.isMobile) {
              this.scheduleHideDropdown(item);
            }
          })
        );
        
        // Keyboard navigation
        const link = Utils.qs('.battersea-hnav__link', item);
        if (link) {
          this.events.push(
            Utils.addEvent(link, 'keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!this.isMobile) {
                  this.toggleDropdown(item);
                }
              }
            })
          );
        }
      });
      
      // Dropdown items with flyouts (level 2)
      const dropdownItems = Utils.qsa('.battersea-hnav__item--has-flyout', this.navContainer);
      
      dropdownItems.forEach(item => {
        // Mouse enter dropdown item - show flyout
        this.events.push(
          Utils.addEvent(item, 'mouseenter', () => {
            if (!this.isMobile) {
              // CRITICAL: Check if already active to prevent re-triggering
              if (this.activeFlyoutItems.has(item)) {
                return; // Already open, don't re-trigger
              }
              
              // Clear ANY pending close timer for this item
              if (this.flyoutCloseTimers.has(item)) {
                clearTimeout(this.flyoutCloseTimers.get(item));
                this.flyoutCloseTimers.delete(item);
              }
              
              // Hide flyouts from ALL siblings and clear their state completely
              const siblings = Utils.getSiblings(item);
              siblings.forEach(sibling => {
                if (sibling.classList.contains('battersea-hnav__item--has-flyout')) {
                  // Clear any pending timer
                  if (this.flyoutCloseTimers.has(sibling)) {
                    clearTimeout(this.flyoutCloseTimers.get(sibling));
                    this.flyoutCloseTimers.delete(sibling);
                  }
                  // Remove from active set immediately
                  this.activeFlyoutItems.delete(sibling);
                  // Clear transitioning flag
                  this.transitioningFlyouts.delete(sibling);
                  // Hide immediately
                  this.hideFlyout(sibling);
                }
              });
              
              // Mark as active BEFORE showing
              this.activeFlyoutItems.add(item);
              this.showFlyout(item);
            }
          })
        );
        
        // Mouse leave dropdown item - schedule close
        this.events.push(
          Utils.addEvent(item, 'mouseleave', (e) => {
            if (!this.isMobile) {
              const flyout = Utils.qs('.battersea-hnav__flyout', item);
              
              // Check if mouse is entering the flyout
              if (flyout && flyout.contains(e.relatedTarget)) {
                // Mouse moved into flyout, don't schedule close
                return;
              }
              
              // Remove from active set immediately
              this.activeFlyoutItems.delete(item);
              
              // Delay closing to allow moving to flyout
              const timer = setTimeout(() => {
                this.hideFlyout(item);
                this.flyoutCloseTimers.delete(item);
              }, this.hoverDelay);
              
              this.flyoutCloseTimers.set(item, timer);
            }
          })
        );
        
        // Handle mouse events on the flyout itself
        const flyout = Utils.qs('.battersea-hnav__flyout', item);
        if (flyout) {
          // Mouse enters flyout
          this.events.push(
            Utils.addEvent(flyout, 'mouseenter', () => {
              // Cancel close timer when entering flyout
              if (this.flyoutCloseTimers.has(item)) {
                clearTimeout(this.flyoutCloseTimers.get(item));
                this.flyoutCloseTimers.delete(item);
              }
              // Keep in active set
              this.activeFlyoutItems.add(item);
            })
          );
          
          // Mouse leaves flyout
          this.events.push(
            Utils.addEvent(flyout, 'mouseleave', (e) => {
              // Check if mouse is going back to parent dropdown item
              if (item.contains(e.relatedTarget) && !flyout.contains(e.relatedTarget)) {
                // Mouse went back to parent dropdown item specifically (not the flyout)
                // Keep flyout open and keep in active set
                return;
              }
              
              // Mouse left to somewhere else - remove from active and close immediately
              this.activeFlyoutItems.delete(item);
              this.hideFlyout(item);
            })
          );
        }
      });
      
      // Flyout items with accordions (level 3)
      const flyoutItems = Utils.qsa('.battersea-hnav__item--has-accordion', this.navContainer);
      
      flyoutItems.forEach(item => {
        const link = Utils.qs('.battersea-hnav__flyout-link', item);
        if (link) {
          this.events.push(
            Utils.addEvent(link, 'click', (e) => {
              e.preventDefault();
              this.toggleAccordion(item);
            })
          );
        }
      });
      
      // Window resize handler
      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(() => {
          this.handleResize();
        }, 250))
      );
      
      // Click outside to close
      this.events.push(
        Utils.addEvent(document, 'click', (e) => {
          if (!this.el.contains(e.target)) {
            this.closeAll();
          }
        })
      );
      
      // ESC key to close
      this.events.push(
        Utils.addEvent(document, 'keydown', (e) => {
          if (e.key === 'Escape') {
            this.closeAll();
          }
        })
      );
    }

    showDropdown(item) {
      const dropdown = Utils.qs('.battersea-hnav__dropdown', item);
      if (!dropdown) return;
      
      // Check if already open or transitioning to prevent re-triggering
      if (item.classList.contains('battersea-hnav__item--open') || this.transitioningDropdowns.has(item)) {
        return;
      }
      
      // Mark as transitioning
      this.transitioningDropdowns.add(item);
      
      // Close other dropdowns
      const siblings = Utils.getSiblings(item);
      siblings.forEach(sibling => {
        if (sibling.classList.contains('battersea-hnav__item--has-dropdown')) {
          this.hideDropdown(sibling, true); // Immediate hide for siblings
        }
      });
      
      // Show this dropdown
      item.classList.add('battersea-hnav__item--open');
      dropdown.classList.add('battersea-hnav__dropdown--visible');
      this.activeDropdowns.add(item);
      
      // Update ARIA
      const link = Utils.qs('.battersea-hnav__link', item);
      if (link) {
        link.setAttribute('aria-expanded', 'true');
      }
      
      // Remove transitioning flag after animation completes
      setTimeout(() => {
        this.transitioningDropdowns.delete(item);
      }, 350); // Slightly longer than animation duration
      
      // Dispatch event
      const event = new CustomEvent('battersea:hnavDropdownOpen', {
        detail: { item, dropdown }
      });
      this.el.dispatchEvent(event);
    }

    hideDropdown(item, immediate = false) {
      const dropdown = Utils.qs('.battersea-hnav__dropdown', item);
      if (!dropdown) return;
      
      // Clear transitioning flag
      this.transitioningDropdowns.delete(item);
      
      const doHide = () => {
        item.classList.remove('battersea-hnav__item--open');
        dropdown.classList.remove('battersea-hnav__dropdown--visible');
        this.activeDropdowns.delete(item);
        
        // Update ARIA
        const link = Utils.qs('.battersea-hnav__link', item);
        if (link) {
          link.setAttribute('aria-expanded', 'false');
        }
        
        // Hide any open flyouts
        const openFlyouts = Utils.qsa('.battersea-hnav__item--has-flyout', item);
        openFlyouts.forEach(flyItem => this.hideFlyout(flyItem));
        
        // Dispatch event
        const event = new CustomEvent('battersea:hnavDropdownClose', {
          detail: { item, dropdown }
        });
        this.el.dispatchEvent(event);
      };
      
      if (immediate) {
        doHide();
      } else {
        // Use transition end
        dropdown.addEventListener(Utils.getTransitionEndEvent(), doHide, { once: true });
      }
    }

    toggleDropdown(item) {
      if (item.classList.contains('battersea-hnav__item--open')) {
        this.scheduleHideDropdown(item);
      } else {
        this.showDropdown(item);
      }
    }

    showFlyout(item) {
      const flyout = Utils.qs('.battersea-hnav__flyout', item);
      if (!flyout) return;
      
      // Check if already open or transitioning to prevent re-triggering
      if (item.classList.contains('battersea-hnav__item--flyout-open') || this.transitioningFlyouts.has(item)) {
        return;
      }
      
      // Mark as transitioning
      this.transitioningFlyouts.add(item);
      
      // Reset display if it was hidden
      flyout.style.display = '';
      
      // Prevent pointer events during transition
      flyout.style.pointerEvents = 'none';
      
      // Determine positioning (left or right) - only if not cached
      if (!this.flyoutPositions.has(item)) {
        this.positionFlyout(item, flyout);
      } else {
        // Apply cached position
        const position = this.flyoutPositions.get(item);
        if (position === 'left') {
          flyout.classList.add('battersea-hnav__flyout--left');
          flyout.classList.remove('battersea-hnav__flyout--right');
        } else {
          flyout.classList.add('battersea-hnav__flyout--right');
          flyout.classList.remove('battersea-hnav__flyout--left');
        }
      }
      
      // Show flyout
      item.classList.add('battersea-hnav__item--flyout-open');
      flyout.classList.add('battersea-hnav__flyout--visible');
      
      // Remove transitioning flag and restore pointer events after animation completes
      setTimeout(() => {
        this.transitioningFlyouts.delete(item);
        flyout.style.pointerEvents = '';
      }, 350); // Slightly longer than animation duration
      
      // Dispatch event
      const event = new CustomEvent('battersea:hnavFlyoutOpen', {
        detail: { item, flyout }
      });
      this.el.dispatchEvent(event);
    }

    hideFlyout(item) {
      const flyout = Utils.qs('.battersea-hnav__flyout', item);
      if (!flyout) return;
      
      // Clear transitioning flag
      this.transitioningFlyouts.delete(item);
      
      // Remove from active set
      this.activeFlyoutItems.delete(item);
      
      // Remove visible class and open state (starts fade)
      item.classList.remove('battersea-hnav__item--flyout-open');
      flyout.classList.remove('battersea-hnav__flyout--visible');
      
      // After fade completes, remove positioning and force display:none
      setTimeout(() => {
        if (!item.classList.contains('battersea-hnav__item--flyout-open')) {
          flyout.classList.remove('battersea-hnav__flyout--left');
          flyout.classList.remove('battersea-hnav__flyout--right');
          flyout.style.display = 'none';
        }
      }, 320); // Slightly longer than 300ms animation to ensure fade completes
      
      // Close any open accordions
      const openAccordions = Utils.qsa('.battersea-hnav__item--has-accordion.battersea-hnav__item--accordion-open', item);
      openAccordions.forEach(accItem => this.closeAccordion(accItem));
      
      // Dispatch event
      const event = new CustomEvent('battersea:hnavFlyoutClose', {
        detail: { item, flyout }
      });
      this.el.dispatchEvent(event);
    }

    positionFlyout(item, flyout) {
      // Get viewport width
      const viewportWidth = window.innerWidth;
      
      // Get item position
      const itemRect = item.getBoundingClientRect();
      
      // Get flyout width (measure without affecting layout)
      const originalPosition = flyout.style.position;
      const originalDisplay = flyout.style.display;
      const originalVisibility = flyout.style.visibility;
      const originalPointerEvents = flyout.style.pointerEvents;
      
      // Temporarily show for measurement without affecting layout
      flyout.style.position = 'absolute';
      flyout.style.display = 'block';
      flyout.style.visibility = 'hidden';
      flyout.style.pointerEvents = 'none';
      
      const flyoutWidth = flyout.offsetWidth;
      
      // Restore original state
      flyout.style.position = originalPosition;
      flyout.style.display = originalDisplay;
      flyout.style.visibility = originalVisibility;
      flyout.style.pointerEvents = originalPointerEvents;
      
      // Calculate space on right
      const spaceOnRight = viewportWidth - itemRect.right;
      
      // Determine positioning and cache the decision
      let position;
      if (spaceOnRight < this.edgeThreshold || spaceOnRight < flyoutWidth) {
        // Not enough space on right - open to the left
        flyout.classList.add('battersea-hnav__flyout--left');
        flyout.classList.remove('battersea-hnav__flyout--right');
        position = 'left';
      } else {
        // Enough space on right - open to the right
        flyout.classList.add('battersea-hnav__flyout--right');
        flyout.classList.remove('battersea-hnav__flyout--left');
        position = 'right';
      }
      
      // Cache the positioning decision
      this.flyoutPositions.set(item, position);
    }

    toggleAccordion(item) {
      const isOpen = item.classList.contains('battersea-hnav__item--accordion-open');
      
      if (isOpen) {
        this.closeAccordion(item);
      } else {
        this.openAccordion(item);
      }
    }

    openAccordion(item) {
      const accordion = Utils.qs('.battersea-hnav__accordion', item);
      if (!accordion) return;
      
      // Close other accordions in the same flyout
      const flyoutParent = item.closest('.battersea-hnav__flyout');
      if (flyoutParent) {
        const siblings = Utils.qsa('.battersea-hnav__item--has-accordion', flyoutParent);
        siblings.forEach(sibling => {
          if (sibling !== item) {
            this.closeAccordion(sibling);
          }
        });
      }
      
      // Measure height
      accordion.style.display = 'block';
      const height = accordion.scrollHeight;
      
      // Animate open
      accordion.style.maxHeight = '0px';
      void accordion.offsetHeight; // Force reflow
      
      item.classList.add('battersea-hnav__item--accordion-open');
      
      requestAnimationFrame(() => {
        accordion.style.maxHeight = height + 'px';
      });
      
      // After transition, allow natural height
      const transitionEnd = () => {
        if (item.classList.contains('battersea-hnav__item--accordion-open')) {
          accordion.style.maxHeight = 'none';
          accordion.style.overflow = 'visible';
        }
        accordion.removeEventListener(Utils.getTransitionEndEvent(), transitionEnd);
      };
      accordion.addEventListener(Utils.getTransitionEndEvent(), transitionEnd, { once: true });
      
      // Dispatch event
      const event = new CustomEvent('battersea:hnavAccordionOpen', {
        detail: { item, accordion }
      });
      this.el.dispatchEvent(event);
    }

    closeAccordion(item) {
      const accordion = Utils.qs('.battersea-hnav__accordion', item);
      if (!accordion) return;
      
      // Set current height
      const height = accordion.scrollHeight;
      accordion.style.maxHeight = height + 'px';
      accordion.style.overflow = 'hidden';
      
      void accordion.offsetHeight; // Force reflow
      
      item.classList.remove('battersea-hnav__item--accordion-open');
      
      requestAnimationFrame(() => {
        accordion.style.maxHeight = '0px';
      });
      
      // Dispatch event
      const event = new CustomEvent('battersea:hnavAccordionClose', {
        detail: { item, accordion }
      });
      this.el.dispatchEvent(event);
    }

    scheduleHideDropdown(item) {
      // Clear any existing timer
      this.clearHoverTimer(item);
      
      // Set new timer
      const timer = setTimeout(() => {
        this.hideDropdown(item);
      }, this.hoverDelay);
      
      this.hoverTimers.set(item, timer);
    }

    clearHoverTimer(item) {
      const timer = this.hoverTimers.get(item);
      if (timer) {
        clearTimeout(timer);
        this.hoverTimers.delete(item);
      }
    }

    closeAll() {
      // Close all dropdowns
      this.activeDropdowns.forEach(item => {
        this.hideDropdown(item, true);
      });
      
      // Clear all timers
      this.hoverTimers.forEach(timer => clearTimeout(timer));
      this.hoverTimers.clear();
      
      // Clear all flyout close timers
      this.flyoutCloseTimers.forEach(timer => clearTimeout(timer));
      this.flyoutCloseTimers.clear();
      
      // Clear active flyout items
      this.activeFlyoutItems.clear();
      
      // Clear all transitioning flags
      this.transitioningDropdowns.clear();
      this.transitioningFlyouts.clear();
    }

    handleResize() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < this.mobileBreakpoint;
      
      // Clear position cache on resize since layout may have changed
      this.flyoutPositions.clear();
      
      if (wasMobile !== this.isMobile) {
        // Screen size category changed
        this.closeAll();
        
        if (this.isMobile) {
          // Switched to mobile - hide desktop nav
          this.el.classList.add('battersea-hnav--mobile');
          
          // Dispatch event for mobile mode switch
          const event = new CustomEvent('battersea:hnavMobileMode', {
            detail: { mode: this.mobileMode }
          });
          this.el.dispatchEvent(event);
        } else {
          // Switched to desktop
          this.el.classList.remove('battersea-hnav--mobile');
        }
      }
    }

    destroy() {
      // Clean up all events
      this.events.forEach(event => event.remove());
      
      // Clear all timers
      this.hoverTimers.forEach(timer => clearTimeout(timer));
      this.hoverTimers.clear();
      
      // Clear flyout close timers
      this.flyoutCloseTimers.forEach(timer => clearTimeout(timer));
      this.flyoutCloseTimers.clear();
      
      // Remove classes
      this.el.classList.remove('battersea-hnav-initialized');
      this.el.classList.remove('battersea-hnav--mobile');
      
      // Remove initialization flag
      this.el.removeAttribute('data-hnav-initialized');
      
      // Remove instance reference
      delete this.el._batterseaHnavInstance;
      
      // Clear active dropdowns, active flyout items and transitioning flags
      this.activeDropdowns.clear();
      this.activeFlyoutItems.clear();
      this.transitioningDropdowns.clear();
      this.transitioningFlyouts.clear();
    }
  }

  // Register component with Battersea
  window.Battersea.register('horizontalNav', HorizontalNav, '[data-horizontal-nav]');

})(window, document);
