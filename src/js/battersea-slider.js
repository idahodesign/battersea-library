/**
 * Battersea Library - Slider Component
 * Version: 2.0.5
 * 
 * Usage:
 * <div data-slider data-slider-autoplay="true" data-slider-interval="3000" data-slider-dots="true" data-slider-arrows="true">
 *   <div data-slider-item>Slide 1</div>
 *   <div data-slider-item>Slide 2</div>
 *   <div data-slider-item>Slide 3</div>
 * </div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Slider requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class Slider {
    constructor(el) {
      this.el = el;
      this.track = Utils.qs('[data-slider-track]', el);
      this.slides = this.track ? Utils.qsa('[data-slider-item]', this.track) : [];
      this.prevBtn = Utils.qs('[data-slider-prev]', el);
      this.nextBtn = Utils.qs('[data-slider-next]', el);
      this.dotsContainer = Utils.qs('[data-slider-dots]', el);
      this.currentIndex = 0;
      this.autoplay = Utils.parseBoolean(Utils.getData(el, 'slider-autoplay') || 'false');
      this.interval = Utils.parseInt(Utils.getData(el, 'slider-interval'), 5000);
      this.transition = Utils.getData(el, 'slider-transition') || 'slide'; // 'slide' or 'fade'
      this.showDots = Utils.parseBoolean(Utils.getData(el, 'slider-dots') || 'true');
      this.showArrows = Utils.parseBoolean(Utils.getData(el, 'slider-arrows') || 'true');
      this.autoplayTimer = null;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.isTransitioning = false;
      this.events = [];
      
      // For infinite loop
      this.realIndex = 0; // Actual slide index (0 to slides.length - 1)
      this.allSlides = []; // Will include clones
      this.slideCount = 0; // Original slide count

      if (this.slides.length === 0) {
        console.warn('Slider has no slides');
        return;
      }
      
      this.slideCount = this.slides.length;

      this.init();
    }

    init() {
      // Ensure container is positioned for absolute children (arrows/dots)
      this.el.style.position = 'relative';
      
      // Setup slide structure first
      if (this.transition === 'fade') {
        this.setupFadeTransition();
      } else {
        this.setupSlideTransition();
        this.createClones(); // Create clones for infinite loop
      }
      
      // Set consistent height based on tallest slide
      this.setSliderHeight();
      
      // Create controls if needed
      if (this.showDots && this.dotsContainer) this.createDots();
      
      // Hide arrows if showArrows is false
      if (!this.showArrows) {
        if (this.prevBtn) this.prevBtn.style.display = 'none';
        if (this.nextBtn) this.nextBtn.style.display = 'none';
      } else {
        // Ensure arrows are visible and have high z-index
        if (this.prevBtn) {
          this.prevBtn.style.zIndex = '1000';
          this.prevBtn.style.position = 'absolute';
        }
        if (this.nextBtn) {
          this.nextBtn.style.zIndex = '1000';
          this.nextBtn.style.position = 'absolute';
        }
      }
      
      // Ensure dots container has high z-index
      if (this.dotsContainer) {
        this.dotsContainer.style.zIndex = '1000';
        this.dotsContainer.style.position = 'absolute';
      }
      
      this.bindEvents();
      this.goToSlide(0, false);
      
      if (this.autoplay) this.startAutoplay();
      
      // Recalculate height on resize
      this.events.push(
        Utils.addEvent(window, 'resize', Utils.debounce(() => this.setSliderHeight(), 250))
      );
    }

    setSliderHeight() {
      // Let the container size itself from the track/slides naturally.
      // Just ensure overflow is hidden so off-screen slides don't expand the page.
      this.el.style.overflow = 'hidden';
    }

    setupSlideTransition() {
      // Ensure track uses flexbox for slide transition
      if (this.track) {
        this.track.style.display = 'flex';
        this.track.style.transition = 'transform 0.5s ease-in-out';
        this.track.style.position = 'relative';
      }
      
      this.slides.forEach(slide => {
        slide.style.flex = '0 0 100%';
        slide.style.minWidth = '100%';
        slide.style.position = 'relative';
      });
    }

    createClones() {
      if (!this.track || this.slideCount < 2) return;
      
      // Clone first slide and append to end
      const firstClone = this.slides[0].cloneNode(true);
      firstClone.classList.add('battersea-slider-clone');
      firstClone.setAttribute('aria-hidden', 'true');
      this.track.appendChild(firstClone);
      
      // Clone last slide and prepend to beginning
      const lastClone = this.slides[this.slideCount - 1].cloneNode(true);
      lastClone.classList.add('battersea-slider-clone');
      lastClone.setAttribute('aria-hidden', 'true');
      this.track.insertBefore(lastClone, this.slides[0]);
      
      // Update allSlides to include clones
      this.allSlides = Utils.qsa('[data-slider-item]', this.track);
      
      // Start at index 1 (first real slide, after the cloned last slide)
      this.currentIndex = 1;
      
      // Position track at first real slide without animation
      const slideWidth = this.el.offsetWidth;
      this.track.style.transition = 'none';
      this.track.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
      
      // Force reflow then restore transition
      this.track.offsetHeight;
      this.track.style.transition = 'transform 0.5s ease-in-out';
    }

    setupFadeTransition() {
      if (this.track) {
        this.track.style.position = 'relative';
      }
      
      this.slides.forEach((slide, index) => {
        slide.style.position = 'absolute';
        slide.style.top = '0';
        slide.style.left = '0';
        slide.style.width = '100%';
        slide.style.opacity = index === 0 ? '1' : '0';
        slide.style.transition = 'opacity 0.5s ease-in-out';
        slide.style.zIndex = index === 0 ? '1' : '0';
      });
    }

    createDots() {
      if (!this.showDots || !this.dotsContainer) return;
      
      this.slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'battersea-slider-dot';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        
        this.events.push(
          Utils.addEvent(dot, 'click', () => this.goToSlide(index))
        );
        
        this.dotsContainer.appendChild(dot);
      });
      
      this.dots = Array.from(this.dotsContainer.children);
    }

    bindEvents() {
      // Keyboard navigation on the slider container
      this.events.push(
        Utils.addEvent(this.el, 'keydown', (e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prev();
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.next();
          }
        })
      );
      
      // Make slider focusable for keyboard
      if (!this.el.hasAttribute('tabindex')) {
        this.el.setAttribute('tabindex', '0');
      }
      
      if (this.prevBtn) {
        this.events.push(
          Utils.addEvent(this.prevBtn, 'click', (e) => {
            e.preventDefault();
            this.prev();
          })
        );
      }
      
      if (this.nextBtn) {
        this.events.push(
          Utils.addEvent(this.nextBtn, 'click', (e) => {
            e.preventDefault();
            this.next();
          })
        );
      }

      // Pause autoplay on hover
      if (this.autoplay) {
        this.events.push(
          Utils.addEvent(this.el, 'mouseenter', () => this.stopAutoplay()),
          Utils.addEvent(this.el, 'mouseleave', () => this.startAutoplay())
        );
      }

      // Touch/swipe support
      if (this.track) {
        this.events.push(
          Utils.addEvent(this.track, 'touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
          }, { passive: true }),
          Utils.addEvent(this.track, 'touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
          })
        );
      }
    }

    handleSwipe() {
      const diff = this.touchStartX - this.touchEndX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    goToSlide(index, animate = true) {
      if (this.isTransitioning) return;
      
      if (this.transition === 'fade') {
        // Fade doesn't use clones
        index = (index + this.slideCount) % this.slideCount;
        this.goToSlideFade(index);
        this.realIndex = index;
      } else {
        // Slide uses clones for infinite loop
        this.goToSlideSlide(index, animate);
      }
      
      // Update dots based on realIndex
      if (this.dots) {
        this.dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === this.realIndex);
        });
      }

      // Dispatch custom event
      const event = new CustomEvent('battersea:slideChange', {
        detail: { index: this.realIndex, slide: this.slides[this.realIndex] }
      });
      this.el.dispatchEvent(event);
    }

    goToSlideFade(index) {
      this.slides.forEach((slide, i) => {
        slide.style.opacity = i === index ? '1' : '0';
        slide.style.zIndex = i === index ? '2' : '1';
      });
    }

    goToSlideSlide(targetIndex, animate) {
      if (!this.track) return;
      
      this.isTransitioning = true;
      
      // targetIndex is the desired slide (can be -1 for prev, slideCount for next)
      // currentIndex is the current position in allSlides array (includes clones)
      
      const slideWidth = this.el.offsetWidth;
      
      // Calculate target position in allSlides
      let newIndex;
      
      if (targetIndex === -1) {
        // Going to previous from first slide - go to last clone (index 0)
        newIndex = 0;
      } else if (targetIndex === this.slideCount) {
        // Going to next from last slide - go to first clone (last index)
        newIndex = this.allSlides.length - 1;
      } else {
        // Normal navigation - offset by 1 because of prepended clone
        newIndex = targetIndex + 1;
      }
      
      // Animate to target
      if (animate) {
        this.track.style.transition = 'transform 0.5s ease-in-out';
      } else {
        this.track.style.transition = 'none';
      }
      
      this.currentIndex = newIndex;
      const offset = -newIndex * slideWidth;
      this.track.style.transform = `translateX(${offset}px)`;
      
      if (!animate) {
        this.track.offsetHeight;
        this.track.style.transition = 'transform 0.5s ease-in-out';
        this.isTransitioning = false;
        return;
      }
      
      // After transition, check if we're on a clone and snap to real slide
      const transitionEnd = () => {
        this.track.removeEventListener(Utils.getTransitionEndEvent(), transitionEnd);
        
        // If on first clone (last slide clone at index 0), snap to real last slide
        if (this.currentIndex === 0) {
          this.currentIndex = this.slideCount; // Real last slide position
          this.realIndex = this.slideCount - 1;
          this.track.style.transition = 'none';
          this.track.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
          this.track.offsetHeight;
          this.track.style.transition = 'transform 0.5s ease-in-out';
        }
        // If on last clone (first slide clone at end), snap to real first slide
        else if (this.currentIndex === this.allSlides.length - 1) {
          this.currentIndex = 1; // Real first slide position
          this.realIndex = 0;
          this.track.style.transition = 'none';
          this.track.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
          this.track.offsetHeight;
          this.track.style.transition = 'transform 0.5s ease-in-out';
        }
        // Normal slide - update realIndex
        else {
          this.realIndex = this.currentIndex - 1;
        }
        
        // Update dots
        if (this.dots) {
          this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.realIndex);
          });
        }
        
        this.isTransitioning = false;
      };
      
      this.track.addEventListener(Utils.getTransitionEndEvent(), transitionEnd, { once: true });
    }

    next() {
      if (this.transition === 'fade') {
        const nextIndex = (this.realIndex + 1) % this.slideCount;
        this.goToSlide(nextIndex);
      } else {
        // For slide transition with clones
        const nextIndex = this.realIndex + 1;
        this.goToSlide(nextIndex);
      }
    }

    prev() {
      if (this.transition === 'fade') {
        const prevIndex = (this.realIndex - 1 + this.slideCount) % this.slideCount;
        this.goToSlide(prevIndex);
      } else {
        // For slide transition with clones
        const prevIndex = this.realIndex - 1;
        this.goToSlide(prevIndex);
      }
    }

    startAutoplay() {
      if (!this.autoplay || this.autoplayTimer) return;
      
      this.autoplayTimer = setInterval(() => {
        this.next();
      }, this.interval);
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
  window.Battersea.register('slider', Slider, '[data-slider]');

})(window, document);
