/**
 * Battersea Library - ImageGallery Component
 * Version: 2.4.0
 *
 * Usage:
 * <div data-image-gallery data-image-gallery-columns="4" data-image-gallery-gap="10">
 *   <div data-gallery-item data-gallery-title="Title" data-gallery-caption="Caption">
 *     <img src="thumb.jpg" alt="Description">
 *   </div>
 *   <div data-gallery-item data-gallery-type="video" data-gallery-video-src="video.mp4" data-gallery-poster="poster.jpg">
 *     <img src="poster.jpg" alt="Video thumbnail">
 *   </div>
 * </div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('ImageGallery requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class ImageGallery {
    constructor(el) {
      this.el = el;
      this.columns = Utils.parseInt(Utils.getData(el, 'image-gallery-columns'), 4);
      this.gap = Utils.parseInt(Utils.getData(el, 'image-gallery-gap'), 10);
      this.items = Array.from(el.querySelectorAll('[data-gallery-item]'));
      this.events = [];
      this.overlay = null;
      this.currentIndex = 0;
      this.isOpen = false;

      // Zoom state
      this.zoomLevel = 1;
      this.minZoom = 1;
      this.maxZoom = 4;
      this.zoomStep = 0.5;
      this.panX = 0;
      this.panY = 0;
      this.isPanning = false;
      this.panStartX = 0;
      this.panStartY = 0;

      // Touch swipe state
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.swipeThreshold = 50;

      if (this.items.length === 0) {
        console.warn('ImageGallery has no items');
        return;
      }

      this.init();
    }

    init() {
      // Apply masonry CSS custom properties
      this.el.style.setProperty('--battersea-gallery-columns', this.columns);
      this.el.style.setProperty('--battersea-gallery-gap', this.gap + 'px');

      // Build lightbox DOM
      this.buildLightbox();

      // Bind thumbnail click handlers
      this.items.forEach((item, index) => {
        this.events.push(
          Utils.addEvent(item, 'click', () => {
            this.open(index);
          })
        );

        // Keyboard accessibility for gallery items
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        const img = item.querySelector('img');
        if (img && img.alt) {
          item.setAttribute('aria-label', 'View ' + img.alt);
        }

        this.events.push(
          Utils.addEvent(item, 'keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.open(index);
            }
          })
        );
      });

      // Bind keyboard navigation
      this.bindKeyboard();
    }

    buildLightbox() {
      // Create overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'battersea-gallery-overlay';
      this.overlay.setAttribute('role', 'dialog');
      this.overlay.setAttribute('aria-modal', 'true');
      this.overlay.setAttribute('aria-label', 'Image gallery lightbox');

      // Create lightbox container
      this.lightbox = document.createElement('div');
      this.lightbox.className = 'battersea-gallery-lightbox';

      // Close button
      this.closeBtn = document.createElement('button');
      this.closeBtn.className = 'battersea-gallery-close';
      this.closeBtn.setAttribute('aria-label', 'Close gallery');
      this.closeBtn.setAttribute('type', 'button');

      // Media container
      this.mediaWrap = document.createElement('div');
      this.mediaWrap.className = 'battersea-gallery-media-wrap';

      // Zoom controls
      this.zoomControls = document.createElement('div');
      this.zoomControls.className = 'battersea-gallery-zoom-controls';

      this.zoomInBtn = document.createElement('button');
      this.zoomInBtn.className = 'battersea-gallery-zoom-in';
      this.zoomInBtn.textContent = '+';
      this.zoomInBtn.setAttribute('aria-label', 'Zoom in');
      this.zoomInBtn.setAttribute('type', 'button');

      this.zoomOutBtn = document.createElement('button');
      this.zoomOutBtn.className = 'battersea-gallery-zoom-out';
      this.zoomOutBtn.textContent = '\u2212';
      this.zoomOutBtn.setAttribute('aria-label', 'Zoom out');
      this.zoomOutBtn.setAttribute('type', 'button');

      this.zoomResetBtn = document.createElement('button');
      this.zoomResetBtn.className = 'battersea-gallery-zoom-reset';
      this.zoomResetBtn.textContent = '\u2715';
      this.zoomResetBtn.setAttribute('aria-label', 'Reset zoom');
      this.zoomResetBtn.setAttribute('type', 'button');

      this.zoomControls.appendChild(this.zoomInBtn);
      this.zoomControls.appendChild(this.zoomOutBtn);
      this.zoomControls.appendChild(this.zoomResetBtn);

      // Info bar
      this.infoBar = document.createElement('div');
      this.infoBar.className = 'battersea-gallery-info';

      this.titleEl = document.createElement('div');
      this.titleEl.className = 'battersea-gallery-title';

      this.captionEl = document.createElement('div');
      this.captionEl.className = 'battersea-gallery-caption';

      this.counterEl = document.createElement('div');
      this.counterEl.className = 'battersea-gallery-counter';

      this.infoBar.appendChild(this.titleEl);
      this.infoBar.appendChild(this.captionEl);
      this.infoBar.appendChild(this.counterEl);

      // Prev/next buttons
      this.prevBtn = document.createElement('button');
      this.prevBtn.className = 'battersea-gallery-prev';
      this.prevBtn.setAttribute('aria-label', 'Previous image');
      this.prevBtn.setAttribute('type', 'button');

      this.nextBtn = document.createElement('button');
      this.nextBtn.className = 'battersea-gallery-next';
      this.nextBtn.setAttribute('aria-label', 'Next image');
      this.nextBtn.setAttribute('type', 'button');

      // Assemble
      this.lightbox.appendChild(this.closeBtn);
      this.lightbox.appendChild(this.mediaWrap);
      this.lightbox.appendChild(this.zoomControls);
      this.lightbox.appendChild(this.infoBar);
      this.lightbox.appendChild(this.prevBtn);
      this.lightbox.appendChild(this.nextBtn);
      this.overlay.appendChild(this.lightbox);
      document.body.appendChild(this.overlay);

      // Bind lightbox events
      this.bindLightboxEvents();
    }

    bindLightboxEvents() {
      // Close button
      this.events.push(
        Utils.addEvent(this.closeBtn, 'click', () => this.close())
      );

      // Click overlay to close
      this.events.push(
        Utils.addEvent(this.overlay, 'click', (e) => {
          if (e.target === this.overlay || e.target === this.lightbox) {
            this.close();
          }
        })
      );

      // Navigation
      this.events.push(
        Utils.addEvent(this.prevBtn, 'click', (e) => {
          e.stopPropagation();
          this.navigate(-1);
        })
      );

      this.events.push(
        Utils.addEvent(this.nextBtn, 'click', (e) => {
          e.stopPropagation();
          this.navigate(1);
        })
      );

      // Zoom controls
      this.events.push(
        Utils.addEvent(this.zoomInBtn, 'click', (e) => {
          e.stopPropagation();
          this.zoomIn();
        })
      );

      this.events.push(
        Utils.addEvent(this.zoomOutBtn, 'click', (e) => {
          e.stopPropagation();
          this.zoomOut();
        })
      );

      this.events.push(
        Utils.addEvent(this.zoomResetBtn, 'click', (e) => {
          e.stopPropagation();
          this.zoomReset();
        })
      );

      // Click media to toggle zoom
      this.events.push(
        Utils.addEvent(this.mediaWrap, 'click', (e) => {
          if (this.mediaWrap.classList.contains('battersea-gallery-media-wrap--video')) {
            return;
          }
          e.stopPropagation();
          if (this.zoomLevel > this.minZoom) {
            this.zoomReset();
          } else {
            this.setZoom(2);
          }
        })
      );

      // Pan when zoomed (mouse)
      this.events.push(
        Utils.addEvent(this.mediaWrap, 'mousedown', (e) => {
          if (this.zoomLevel <= this.minZoom) return;
          e.preventDefault();
          this.isPanning = true;
          this.panStartX = e.clientX - this.panX;
          this.panStartY = e.clientY - this.panY;
          this.mediaWrap.classList.add('battersea-gallery-media-wrap--panning');
        })
      );

      this.events.push(
        Utils.addEvent(document, 'mousemove', (e) => {
          if (!this.isPanning) return;
          this.panX = e.clientX - this.panStartX;
          this.panY = e.clientY - this.panStartY;
          this.applyTransform();
        })
      );

      this.events.push(
        Utils.addEvent(document, 'mouseup', () => {
          if (this.isPanning) {
            this.isPanning = false;
            this.mediaWrap.classList.remove('battersea-gallery-media-wrap--panning');
          }
        })
      );

      // Touch events for swipe navigation and pan
      this.events.push(
        Utils.addEvent(this.mediaWrap, 'touchstart', (e) => {
          if (e.touches.length === 1) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;

            if (this.zoomLevel > this.minZoom) {
              this.isPanning = true;
              this.panStartX = e.touches[0].clientX - this.panX;
              this.panStartY = e.touches[0].clientY - this.panY;
            }
          }
        }, { passive: true })
      );

      this.events.push(
        Utils.addEvent(this.mediaWrap, 'touchmove', (e) => {
          if (e.touches.length === 1) {
            if (this.zoomLevel > this.minZoom && this.isPanning) {
              this.panX = e.touches[0].clientX - this.panStartX;
              this.panY = e.touches[0].clientY - this.panStartY;
              this.applyTransform();
            }
          }
        }, { passive: true })
      );

      this.events.push(
        Utils.addEvent(this.mediaWrap, 'touchend', (e) => {
          this.isPanning = false;

          if (this.zoomLevel > this.minZoom) return;

          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchEndX - this.touchStartX;
          const diffY = touchEndY - this.touchStartY;

          // Only swipe if horizontal movement is greater than vertical
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.swipeThreshold) {
            if (diffX > 0) {
              this.navigate(-1);
            } else {
              this.navigate(1);
            }
          }
        })
      );
    }

    bindKeyboard() {
      this.events.push(
        Utils.addEvent(document, 'keydown', (e) => {
          if (!this.isOpen) return;

          switch (e.key) {
            case 'Escape':
              this.close();
              break;
            case 'ArrowLeft':
              e.preventDefault();
              this.navigate(-1);
              break;
            case 'ArrowRight':
              e.preventDefault();
              this.navigate(1);
              break;
            case '+':
            case '=':
              e.preventDefault();
              this.zoomIn();
              break;
            case '-':
              e.preventDefault();
              this.zoomOut();
              break;
            case '0':
              e.preventDefault();
              this.zoomReset();
              break;
          }
        })
      );
    }

    open(index) {
      this.currentIndex = index;
      this.isOpen = true;
      this.zoomReset();
      this.loadMedia(index);
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus the close button for keyboard users
      this.closeBtn.focus();

      // Dispatch event
      this.el.dispatchEvent(new CustomEvent('battersea:galleryOpen', {
        detail: { index: index, item: this.items[index] }
      }));
    }

    close() {
      this.isOpen = false;
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.pauseVideo();
      this.zoomReset();

      // Return focus to the thumbnail that opened the lightbox
      if (this.items[this.currentIndex]) {
        this.items[this.currentIndex].focus();
      }

      // Dispatch event
      this.el.dispatchEvent(new CustomEvent('battersea:galleryClose'));
    }

    navigate(direction) {
      this.pauseVideo();
      this.zoomReset();

      this.currentIndex = this.currentIndex + direction;

      // Wrap around
      if (this.currentIndex >= this.items.length) {
        this.currentIndex = 0;
      } else if (this.currentIndex < 0) {
        this.currentIndex = this.items.length - 1;
      }

      this.loadMedia(this.currentIndex);

      // Dispatch event
      this.el.dispatchEvent(new CustomEvent('battersea:galleryChange', {
        detail: {
          index: this.currentIndex,
          item: this.items[this.currentIndex],
          direction: direction > 0 ? 'next' : 'prev'
        }
      }));
    }

    loadMedia(index) {
      const item = this.items[index];
      const type = Utils.getData(item, 'gallery-type') || 'image';
      const title = Utils.getData(item, 'gallery-title') || '';
      const caption = Utils.getData(item, 'gallery-caption') || '';

      // Clear existing media
      this.mediaWrap.innerHTML = '';
      this.mediaWrap.classList.remove(
        'battersea-gallery-media-wrap--zoomed',
        'battersea-gallery-media-wrap--video'
      );

      if (type === 'video') {
        this.loadVideo(item);
        this.mediaWrap.classList.add('battersea-gallery-media-wrap--video');
        // Hide zoom controls for video
        this.zoomControls.classList.add('battersea-gallery-zoom-controls--hidden');
      } else {
        this.loadImage(item);
        // Show zoom controls for images
        this.zoomControls.classList.remove('battersea-gallery-zoom-controls--hidden');
      }

      // Update info bar
      this.updateInfo(title, caption, index);
    }

    loadImage(item) {
      const fullSrc = Utils.getData(item, 'gallery-src');
      const img = item.querySelector('img');
      const src = fullSrc || (img ? img.src : '');

      if (!src) return;

      const mediaImg = document.createElement('img');
      mediaImg.className = 'battersea-gallery-media';
      mediaImg.alt = img ? img.alt : '';
      mediaImg.src = src;
      mediaImg.draggable = false;
      this.mediaWrap.appendChild(mediaImg);
    }

    loadVideo(item) {
      const videoSrc = Utils.getData(item, 'gallery-video-src');
      const poster = Utils.getData(item, 'gallery-poster');

      if (!videoSrc) {
        console.warn('ImageGallery: Video item missing data-gallery-video-src');
        return;
      }

      const video = document.createElement('video');
      video.className = 'battersea-gallery-media';
      video.controls = true;
      video.preload = 'metadata';
      if (poster) {
        video.poster = poster;
      }

      const source = document.createElement('source');
      source.src = videoSrc;

      // Detect type from extension
      const ext = videoSrc.split('.').pop().toLowerCase();
      const typeMap = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg'
      };
      source.type = typeMap[ext] || 'video/mp4';

      video.appendChild(source);
      this.mediaWrap.appendChild(video);
    }

    pauseVideo() {
      const video = this.mediaWrap.querySelector('video');
      if (video) {
        video.pause();
      }
    }

    updateInfo(title, caption, index) {
      const hasTitle = title.length > 0;
      const hasCaption = caption.length > 0;

      this.titleEl.textContent = title;
      this.titleEl.style.display = hasTitle ? '' : 'none';

      this.captionEl.textContent = caption;
      this.captionEl.style.display = hasCaption ? '' : 'none';

      this.counterEl.textContent = (index + 1) + ' / ' + this.items.length;

      // Show/hide info bar
      if (!hasTitle && !hasCaption && this.items.length <= 1) {
        this.infoBar.classList.add('battersea-gallery-info--hidden');
      } else {
        this.infoBar.classList.remove('battersea-gallery-info--hidden');
      }
    }

    // Zoom methods
    setZoom(level) {
      this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, level));

      if (this.zoomLevel <= this.minZoom) {
        this.panX = 0;
        this.panY = 0;
        this.mediaWrap.classList.remove('battersea-gallery-media-wrap--zoomed');
      } else {
        this.mediaWrap.classList.add('battersea-gallery-media-wrap--zoomed');
      }

      this.applyTransform();
    }

    zoomIn() {
      this.setZoom(this.zoomLevel + this.zoomStep);
    }

    zoomOut() {
      this.setZoom(this.zoomLevel - this.zoomStep);
    }

    zoomReset() {
      this.zoomLevel = this.minZoom;
      this.panX = 0;
      this.panY = 0;
      this.isPanning = false;
      this.mediaWrap.classList.remove(
        'battersea-gallery-media-wrap--zoomed',
        'battersea-gallery-media-wrap--panning'
      );
      this.applyTransform();
    }

    applyTransform() {
      const media = this.mediaWrap.querySelector('.battersea-gallery-media');
      if (!media) return;

      if (this.zoomLevel <= this.minZoom) {
        media.style.transform = '';
      } else {
        media.style.transform = 'scale(' + this.zoomLevel + ') translate(' +
          (this.panX / this.zoomLevel) + 'px, ' +
          (this.panY / this.zoomLevel) + 'px)';
      }
    }

    destroy() {
      this.events.forEach(event => event.remove());
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      document.body.style.overflow = '';
    }
  }

  // Register component with Battersea
  window.Battersea.register('imageGallery', ImageGallery, '[data-image-gallery]');

})(window, document);
