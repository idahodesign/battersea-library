/**
 * Battersea Library - VideoBackground Component
 * Looping background video with poster fallback and configurable overlay
 * @version 2.19.0
 */
(function(window, document) {
	'use strict';

	if (!window.Battersea || !window.BatterseaUtils) {
		console.error('VideoBackground requires Battersea Core and Utils');
		return;
	}

	const Utils = window.BatterseaUtils;

	class VideoBg {
		constructor(el) {
			if (!el) return;

			this.el = el;
			this.src = Utils.getData(el, 'videobg-src');
			this.poster = Utils.getData(el, 'videobg-poster') || '';
			this.overlay = Utils.getData(el, 'videobg-overlay') || '';
			this.breakpoint = Utils.parseInt(Utils.getData(el, 'videobg-mobile-breakpoint'), 768);
			this.video = null;
			this.posterEl = null;
			this.isMobile = false;
			this.events = [];

			if (!this.src) {
				console.warn('VideoBackground: no data-videobg-src provided');
				return;
			}

			this.init();
		}

		init() {
			this.el.classList.add('battersea-videobg');

			// Wrap existing child content so it sits above the video/overlay
			this.wrapContent();

			// Create overlay element (real DOM element, not pseudo — LESS mangles var() in ::after)
			if (this.overlay) {
				this.overlayEl = document.createElement('div');
				this.overlayEl.className = 'battersea-videobg__overlay';
				this.overlayEl.style.background = this.overlay;
				if (this.contentWrapper) {
					this.el.insertBefore(this.overlayEl, this.contentWrapper);
				} else {
					this.el.appendChild(this.overlayEl);
				}
			}

			// Check viewport and build accordingly
			this.isMobile = this.poster && window.innerWidth < this.breakpoint;

			if (this.isMobile) {
				this.showPoster();
			} else {
				this.showVideo();
			}

			// Listen for resize to swap between video and poster
			if (this.poster) {
				this.resizeBound = Utils.throttle(this.onResize.bind(this), 200);
				this.events.push(Utils.addEvent(window, 'resize', this.resizeBound));
			}

			this.el.dispatchEvent(new CustomEvent('battersea:videobgInit', {
				bubbles: true,
				detail: { instance: this }
			}));
		}

		wrapContent() {
			const children = Array.from(this.el.childNodes);
			if (children.length === 0) return;

			const wrapper = document.createElement('div');
			wrapper.className = 'battersea-videobg__content';
			children.forEach(child => wrapper.appendChild(child));
			this.el.appendChild(wrapper);
			this.contentWrapper = wrapper;
		}

		showVideo() {
			this.removePoster();

			if (this.video) return;

			this.video = document.createElement('video');
			this.video.className = 'battersea-videobg__video';
			this.video.src = this.src;
			this.video.muted = true;
			this.video.loop = true;
			this.video.playsInline = true;
			this.video.setAttribute('playsinline', '');
			this.video.preload = 'auto';

			if (this.poster) {
				this.video.poster = this.poster;
			}

			// Insert video as first child (before overlay and content)
			this.el.insertBefore(this.video, this.el.firstChild);

			// Autoplay with catch for browser blocking
			const playPromise = this.video.play();
			if (playPromise !== undefined) {
				playPromise.catch(() => {
					// Autoplay blocked — video stays paused, poster/first frame visible
				});
			}
		}

		showPoster() {
			this.removeVideo();

			if (this.posterEl) return;

			this.posterEl = document.createElement('div');
			this.posterEl.className = 'battersea-videobg__poster';
			this.posterEl.style.backgroundImage = 'url(' + this.poster + ')';

			// Insert poster as first child (before overlay and content)
			this.el.insertBefore(this.posterEl, this.el.firstChild);
		}

		removeVideo() {
			if (!this.video) return;
			this.video.pause();
			this.video.src = '';
			this.video.remove();
			this.video = null;
		}

		removePoster() {
			if (!this.posterEl) return;
			this.posterEl.remove();
			this.posterEl = null;
		}

		onResize() {
			const wasMobile = this.isMobile;
			this.isMobile = window.innerWidth < this.breakpoint;

			if (wasMobile && !this.isMobile) {
				this.showVideo();
			} else if (!wasMobile && this.isMobile) {
				this.showPoster();
			}
		}

		destroy() {
			this.removeVideo();
			this.removePoster();
			if (this.overlayEl) {
				this.overlayEl.remove();
				this.overlayEl = null;
			}
			this.events.forEach(event => event.remove());
			this.events = [];

			// Unwrap content
			if (this.contentWrapper && this.contentWrapper.parentNode === this.el) {
				while (this.contentWrapper.firstChild) {
					this.el.appendChild(this.contentWrapper.firstChild);
				}
				this.contentWrapper.remove();
			}

			this.el.classList.remove('battersea-videobg');
		}
	}

	window.Battersea.register('videoBg', VideoBg, '[data-videobg]');

})(window, document);
