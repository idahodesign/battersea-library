/**
 * Battersea Library - VideoPlayer Component
 * Version: 1.0.0
 *
 * A fully custom video player with stylable controls.
 * Supports MP4, WebM, OGG.
 *
 * Usage:
 * <div data-video-player data-video-src="clip.mp4"></div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */
(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('VideoPlayer requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  // SVG icons
  const ICONS = {
    volume: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    volumeLow: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 9v6h4l5 5V4l-5 5H7zm9.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
    muted: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    fullscreenExit: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
  };

  class VideoPlayer {

    constructor(el) {
      this.el = el;
      this.events = [];

      // Parse config from data attributes
      this.src = Utils.getData(el, 'video-src');
      this.poster = Utils.getData(el, 'video-poster') || '';
      this.title = Utils.getData(el, 'video-title') || '';
      this.autoplay = Utils.parseBoolean(Utils.getData(el, 'video-autoplay'));
      this.loop = Utils.parseBoolean(Utils.getData(el, 'video-loop'));
      this.muted = Utils.parseBoolean(Utils.getData(el, 'video-muted'));
      this.volume = Utils.parseInt(Utils.getData(el, 'video-volume'), 80);
      this.preload = Utils.getData(el, 'video-preload') || 'metadata';
      this.accentColor = Utils.getData(el, 'video-color') || '';
      this.controlsMode = Utils.getData(el, 'video-controls') || 'auto';
      this.showFullscreen = Utils.getData(el, 'video-fullscreen') !== 'false';

      // State
      this.isPlaying = false;
      this.isMuted = this.muted;
      this.isFullscreen = false;
      this.isDraggingProgress = false;
      this.isDraggingVolume = false;
      this.rafPending = false;
      this.savedVolume = this.volume;
      this.hideTimer = null;
      this.controlsVisible = true;

      if (!this.src) {
        console.warn('VideoPlayer: data-video-src is required');
        return;
      }

      this.init();
    }

    init() {
      this.createDOM();
      this.bindEvents();

      // Set initial volume
      this.video.volume = Math.max(0, Math.min(1, this.volume / 100));
      this.video.muted = this.isMuted;
      this.updateVolumeDisplay();
      this.updateVolumeIcon();

      // Handle autoplay
      if (this.autoplay) {
        this.play();
      }
    }

    createDOM() {
      this.el.classList.add('battersea-video');

      // Apply accent colour as custom property
      if (this.accentColor) {
        this.el.style.setProperty('--battersea-video-accent', this.accentColor);
      }

      // Video element (native controls hidden)
      this.video = document.createElement('video');
      this.video.src = this.src;
      this.video.preload = this.preload;
      this.video.setAttribute('playsinline', '');
      if (this.loop) this.video.loop = true;
      if (this.poster) this.video.poster = this.poster;
      this.el.appendChild(this.video);

      // Poster overlay (shown before first play, hides video black frame)
      if (this.poster) {
        this.posterEl = document.createElement('div');
        this.posterEl.className = 'battersea-video__poster';
        this.posterEl.style.backgroundImage = 'url(' + this.poster + ')';
        this.el.appendChild(this.posterEl);
      }

      // Title overlay (optional)
      if (this.title) {
        this.titleEl = document.createElement('div');
        this.titleEl.className = 'battersea-video__title';
        this.titleEl.textContent = this.title;
        this.el.appendChild(this.titleEl);
      }

      // Large centred play overlay
      this.overlay = document.createElement('button');
      this.overlay.className = 'battersea-video__overlay';
      this.overlay.setAttribute('type', 'button');
      this.overlay.setAttribute('aria-label', 'Play video');
      this.overlayIcon = document.createElement('span');
      this.overlayIcon.className = 'battersea-video__overlay-icon--play';
      this.overlay.appendChild(this.overlayIcon);
      this.el.appendChild(this.overlay);

      // Controls container
      const controls = document.createElement('div');
      controls.className = 'battersea-video__controls';
      this.controls = controls;

      // Play button
      this.playBtn = document.createElement('button');
      this.playBtn.className = 'battersea-video__play';
      this.playBtn.setAttribute('type', 'button');
      this.playBtn.setAttribute('aria-label', 'Play');
      this.playIcon = document.createElement('span');
      this.playIcon.className = 'battersea-video__icon--play';
      this.playBtn.appendChild(this.playIcon);
      controls.appendChild(this.playBtn);

      // Current time
      this.currentTimeEl = document.createElement('span');
      this.currentTimeEl.className = 'battersea-video__time battersea-video__time--current';
      this.currentTimeEl.textContent = '0:00';
      controls.appendChild(this.currentTimeEl);

      // Progress bar
      this.progressContainer = document.createElement('div');
      this.progressContainer.className = 'battersea-video__progress';
      this.progressContainer.setAttribute('role', 'slider');
      this.progressContainer.setAttribute('aria-label', 'Seek');
      this.progressContainer.setAttribute('aria-valuemin', '0');
      this.progressContainer.setAttribute('aria-valuemax', '100');
      this.progressContainer.setAttribute('aria-valuenow', '0');
      this.progressContainer.setAttribute('tabindex', '0');

      const progressBar = document.createElement('div');
      progressBar.className = 'battersea-video__progress-bar';

      this.progressFill = document.createElement('div');
      this.progressFill.className = 'battersea-video__progress-fill';

      this.progressHandle = document.createElement('div');
      this.progressHandle.className = 'battersea-video__progress-handle';

      this.progressFill.appendChild(this.progressHandle);
      progressBar.appendChild(this.progressFill);
      this.progressContainer.appendChild(progressBar);
      controls.appendChild(this.progressContainer);

      // Duration
      this.durationEl = document.createElement('span');
      this.durationEl.className = 'battersea-video__time battersea-video__time--duration';
      this.durationEl.textContent = '0:00';
      controls.appendChild(this.durationEl);

      // Mute button
      this.muteBtn = document.createElement('button');
      this.muteBtn.className = 'battersea-video__mute';
      this.muteBtn.setAttribute('type', 'button');
      this.muteBtn.setAttribute('aria-label', 'Mute');
      this.muteBtn.innerHTML = ICONS.volume;
      controls.appendChild(this.muteBtn);

      // Volume bar
      this.volumeContainer = document.createElement('div');
      this.volumeContainer.className = 'battersea-video__volume';
      this.volumeContainer.setAttribute('role', 'slider');
      this.volumeContainer.setAttribute('aria-label', 'Volume');
      this.volumeContainer.setAttribute('aria-valuemin', '0');
      this.volumeContainer.setAttribute('aria-valuemax', '100');
      this.volumeContainer.setAttribute('aria-valuenow', String(this.volume));
      this.volumeContainer.setAttribute('tabindex', '0');

      const volumeBar = document.createElement('div');
      volumeBar.className = 'battersea-video__volume-bar';

      this.volumeFill = document.createElement('div');
      this.volumeFill.className = 'battersea-video__volume-fill';

      this.volumeHandle = document.createElement('div');
      this.volumeHandle.className = 'battersea-video__volume-handle';

      this.volumeFill.appendChild(this.volumeHandle);
      volumeBar.appendChild(this.volumeFill);
      this.volumeContainer.appendChild(volumeBar);
      controls.appendChild(this.volumeContainer);

      // Fullscreen button (conditional)
      if (this.showFullscreen) {
        this.fullscreenBtn = document.createElement('button');
        this.fullscreenBtn.className = 'battersea-video__fullscreen';
        this.fullscreenBtn.setAttribute('type', 'button');
        this.fullscreenBtn.setAttribute('aria-label', 'Enter fullscreen');
        this.fullscreenBtn.innerHTML = ICONS.fullscreen;
        controls.appendChild(this.fullscreenBtn);
      }

      this.el.appendChild(controls);
    }

    bindEvents() {
      // Overlay play/pause
      this.events.push(
        Utils.addEvent(this.overlay, 'click', () => this.togglePlay())
      );

      // Controls play/pause
      this.events.push(
        Utils.addEvent(this.playBtn, 'click', () => this.togglePlay())
      );

      // Video element events
      this.events.push(
        Utils.addEvent(this.video, 'loadedmetadata', () => {
          this.durationEl.textContent = this.formatTime(this.video.duration);
        })
      );

      this.events.push(
        Utils.addEvent(this.video, 'timeupdate', () => this.updateProgress())
      );

      this.events.push(
        Utils.addEvent(this.video, 'ended', () => {
          this.isPlaying = false;
          this.updatePlayIcon();
          this.updateOverlayIcon();
          this.showControls();
          this.el.dispatchEvent(new CustomEvent('battersea:videoEnded', { bubbles: true }));
        })
      );

      this.events.push(
        Utils.addEvent(this.video, 'error', () => {
          this.el.classList.add('battersea-video--error');
          const msg = document.createElement('div');
          msg.className = 'battersea-video__error-msg';
          msg.textContent = 'Unable to load video file';
          this.el.appendChild(msg);
        })
      );

      // Progress bar interaction
      this.events.push(
        Utils.addEvent(this.progressContainer, 'mousedown', (e) => this.startProgressDrag(e))
      );
      this.events.push(
        Utils.addEvent(this.progressContainer, 'touchstart', (e) => this.startProgressDrag(e), { passive: true })
      );

      // Progress keyboard
      this.events.push(
        Utils.addEvent(this.progressContainer, 'keydown', (e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 5);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.video.currentTime = Math.max(0, this.video.currentTime - 5);
          }
        })
      );

      // Mute button
      this.events.push(
        Utils.addEvent(this.muteBtn, 'click', () => this.toggleMute())
      );

      // Volume bar interaction
      this.events.push(
        Utils.addEvent(this.volumeContainer, 'mousedown', (e) => this.startVolumeDrag(e))
      );
      this.events.push(
        Utils.addEvent(this.volumeContainer, 'touchstart', (e) => this.startVolumeDrag(e), { passive: true })
      );

      // Volume keyboard
      this.events.push(
        Utils.addEvent(this.volumeContainer, 'keydown', (e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            this.setVolume(Math.min(100, (this.video.volume * 100) + 5));
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            this.setVolume(Math.max(0, (this.video.volume * 100) - 5));
          }
        })
      );

      // Fullscreen button
      if (this.showFullscreen && this.fullscreenBtn) {
        this.events.push(
          Utils.addEvent(this.fullscreenBtn, 'click', () => this.toggleFullscreen())
        );
      }

      // Fullscreen change detection
      this.events.push(
        Utils.addEvent(document, 'fullscreenchange', () => this.onFullscreenChange())
      );
      this.events.push(
        Utils.addEvent(document, 'webkitfullscreenchange', () => this.onFullscreenChange())
      );

      // Auto-hide controls
      if (this.controlsMode === 'auto') {
        this.events.push(
          Utils.addEvent(this.el, 'mousemove', () => this.onUserActivity())
        );
        this.events.push(
          Utils.addEvent(this.el, 'touchstart', () => this.onUserActivity(), { passive: true })
        );
        this.events.push(
          Utils.addEvent(this.el, 'mouseleave', () => {
            if (this.isPlaying) this.startHideTimer();
          })
        );
      }

      // Global keyboard shortcuts on the container
      this.el.setAttribute('tabindex', '0');
      this.events.push(
        Utils.addEvent(this.el, 'keydown', (e) => this.onKeydown(e))
      );

      // Document-level drag handlers (identical to AudioPlayer pattern)
      this._onDocMouseMove = (e) => {
        if (this.isDraggingProgress) this.onProgressDrag(e);
        if (this.isDraggingVolume) this.onVolumeDrag(e);
      };
      this._onDocMouseUp = () => {
        if (this.isDraggingProgress) this.stopProgressDrag();
        if (this.isDraggingVolume) this.stopVolumeDrag();
      };
      this._onDocTouchMove = (e) => {
        if (this.isDraggingProgress || this.isDraggingVolume) {
          e.preventDefault();
        }
        if (this.isDraggingProgress) this.onProgressDrag(e);
        if (this.isDraggingVolume) this.onVolumeDrag(e);
      };
      this._onDocTouchEnd = () => {
        if (this.isDraggingProgress) this.stopProgressDrag();
        if (this.isDraggingVolume) this.stopVolumeDrag();
      };

      this.events.push(
        Utils.addEvent(document, 'mousemove', this._onDocMouseMove)
      );
      this.events.push(
        Utils.addEvent(document, 'mouseup', this._onDocMouseUp)
      );
      this.events.push(
        Utils.addEvent(document, 'touchmove', this._onDocTouchMove, { passive: false })
      );
      this.events.push(
        Utils.addEvent(document, 'touchend', this._onDocTouchEnd)
      );
    }

    // --- Keyboard ---

    onKeydown(e) {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.video.currentTime = Math.max(0, this.video.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.setVolume(Math.min(100, (this.video.volume * 100) + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.setVolume(Math.max(0, (this.video.volume * 100) - 5));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFullscreen();
          break;
        case 'Escape':
          if (this.isFullscreen) {
            e.preventDefault();
            this.exitFullscreen();
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          this.toggleMute();
          break;
      }
    }

    // --- Playback ---

    play() {
      // Hide poster on first play
      if (this.posterEl) {
        this.posterEl.classList.add('battersea-video__poster--hidden');
      }

      const promise = this.video.play();
      if (promise !== undefined) {
        promise.then(() => {
          this.isPlaying = true;
          this.updatePlayIcon();
          this.updateOverlayIcon();
          if (this.controlsMode === 'auto') {
            this.startHideTimer();
          }
          this.el.dispatchEvent(new CustomEvent('battersea:videoPlay', {
            bubbles: true,
            detail: { currentTime: this.video.currentTime }
          }));
        }).catch(() => {
          // Autoplay blocked by browser — reset state
          this.isPlaying = false;
          this.updatePlayIcon();
          this.updateOverlayIcon();
        });
      }
    }

    pause() {
      this.video.pause();
      this.isPlaying = false;
      this.updatePlayIcon();
      this.updateOverlayIcon();
      this.showControls();
      this.el.dispatchEvent(new CustomEvent('battersea:videoPause', {
        bubbles: true,
        detail: { currentTime: this.video.currentTime }
      }));
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    updatePlayIcon() {
      if (this.isPlaying) {
        this.playIcon.className = 'battersea-video__icon--pause';
        this.playBtn.setAttribute('aria-label', 'Pause');
      } else {
        this.playIcon.className = 'battersea-video__icon--play';
        this.playBtn.setAttribute('aria-label', 'Play');
      }
    }

    updateOverlayIcon() {
      if (this.isPlaying) {
        this.overlayIcon.className = 'battersea-video__overlay-icon--pause';
        this.overlay.setAttribute('aria-label', 'Pause video');
        this.overlay.classList.add('battersea-video__overlay--playing');
      } else {
        this.overlayIcon.className = 'battersea-video__overlay-icon--play';
        this.overlay.setAttribute('aria-label', 'Play video');
        this.overlay.classList.remove('battersea-video__overlay--playing');
      }
    }

    // --- Controls Visibility ---

    showControls() {
      this.controlsVisible = true;
      this.controls.classList.remove('battersea-video__controls--hidden');
      if (this.titleEl) this.titleEl.classList.remove('battersea-video__title--hidden');
      this.overlay.classList.remove('battersea-video__overlay--hidden');
      this.clearHideTimer();
    }

    hideControls() {
      if (this.isDraggingProgress || this.isDraggingVolume) return;
      if (!this.isPlaying) return;
      this.controlsVisible = false;
      this.controls.classList.add('battersea-video__controls--hidden');
      if (this.titleEl) this.titleEl.classList.add('battersea-video__title--hidden');
      this.overlay.classList.add('battersea-video__overlay--hidden');
    }

    startHideTimer() {
      this.clearHideTimer();
      this.hideTimer = setTimeout(() => this.hideControls(), 3000);
    }

    clearHideTimer() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
    }

    onUserActivity() {
      this.showControls();
      if (this.isPlaying && this.controlsMode === 'auto') {
        this.startHideTimer();
      }
    }

    // --- Seek / Progress ---

    seek(percentage) {
      if (!isFinite(this.video.duration)) return;
      const time = (percentage / 100) * this.video.duration;
      this.video.currentTime = time;
      this.el.dispatchEvent(new CustomEvent('battersea:videoSeek', {
        bubbles: true,
        detail: { currentTime: time, percentage: percentage }
      }));
    }

    getPositionPercentage(e, container) {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      return Math.max(0, Math.min(100, (x / rect.width) * 100));
    }

    startProgressDrag(e) {
      this.isDraggingProgress = true;
      this.el.classList.add('battersea-video--dragging-progress');
      const pct = this.getPositionPercentage(e, this.progressContainer);
      this.progressFill.style.width = pct + '%';
      this.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
    }

    onProgressDrag(e) {
      const pct = this.getPositionPercentage(e, this.progressContainer);
      this.progressFill.style.width = pct + '%';
      this.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
      // Update time display during drag
      if (isFinite(this.video.duration)) {
        const time = (pct / 100) * this.video.duration;
        this.currentTimeEl.textContent = this.formatTime(time);
      }
    }

    stopProgressDrag() {
      const pct = parseFloat(this.progressFill.style.width) || 0;
      this.seek(pct);
      this.isDraggingProgress = false;
      this.el.classList.remove('battersea-video--dragging-progress');
    }

    updateProgress() {
      if (this.isDraggingProgress) return;
      if (this.rafPending) return;

      this.rafPending = true;
      requestAnimationFrame(() => {
        this.rafPending = false;
        if (!this.video || this.isDraggingProgress) return;

        const duration = this.video.duration;
        if (!isFinite(duration) || duration === 0) return;

        const pct = (this.video.currentTime / duration) * 100;

        this.progressFill.style.width = pct + '%';
        this.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());

        this.currentTimeEl.textContent = this.formatTime(this.video.currentTime);
      });
    }

    // --- Volume ---

    setVolume(percentage) {
      percentage = Math.max(0, Math.min(100, percentage));
      this.video.volume = percentage / 100;

      if (percentage > 0 && this.isMuted) {
        this.video.muted = false;
        this.isMuted = false;
      }

      this.savedVolume = percentage;
      this.updateVolumeDisplay();
      this.updateVolumeIcon();

      this.volumeContainer.setAttribute('aria-valuenow', Math.round(percentage).toString());

      this.el.dispatchEvent(new CustomEvent('battersea:videoVolumeChange', {
        bubbles: true,
        detail: { volume: percentage }
      }));
    }

    toggleMute() {
      if (this.isMuted) {
        this.isMuted = false;
        this.video.muted = false;
        this.video.volume = this.savedVolume / 100;
      } else {
        this.isMuted = true;
        this.video.muted = true;
      }

      this.updateVolumeDisplay();
      this.updateVolumeIcon();

      this.el.dispatchEvent(new CustomEvent('battersea:videoMute', {
        bubbles: true,
        detail: { muted: this.isMuted }
      }));
    }

    updateVolumeDisplay() {
      const vol = this.isMuted ? 0 : this.video.volume * 100;
      this.volumeFill.style.width = vol + '%';
    }

    updateVolumeIcon() {
      const vol = this.video.volume * 100;
      if (this.isMuted || vol === 0) {
        this.muteBtn.innerHTML = ICONS.muted;
        this.muteBtn.setAttribute('aria-label', 'Unmute');
      } else if (vol < 50) {
        this.muteBtn.innerHTML = ICONS.volumeLow;
        this.muteBtn.setAttribute('aria-label', 'Mute');
      } else {
        this.muteBtn.innerHTML = ICONS.volume;
        this.muteBtn.setAttribute('aria-label', 'Mute');
      }
    }

    startVolumeDrag(e) {
      this.isDraggingVolume = true;
      this.el.classList.add('battersea-video--dragging-volume');
      const pct = this.getPositionPercentage(e, this.volumeContainer);
      this.setVolume(pct);
    }

    onVolumeDrag(e) {
      const pct = this.getPositionPercentage(e, this.volumeContainer);
      this.setVolume(pct);
    }

    stopVolumeDrag() {
      this.isDraggingVolume = false;
      this.el.classList.remove('battersea-video--dragging-volume');
    }

    // --- Fullscreen ---

    toggleFullscreen() {
      if (this.isFullscreen) {
        this.exitFullscreen();
      } else {
        this.enterFullscreen();
      }
    }

    enterFullscreen() {
      const el = this.el;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    }

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

    onFullscreenChange() {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      this.isFullscreen = (fsElement === this.el);
      this.el.classList.toggle('battersea-video--fullscreen', this.isFullscreen);

      if (this.fullscreenBtn) {
        this.fullscreenBtn.innerHTML = this.isFullscreen ? ICONS.fullscreenExit : ICONS.fullscreen;
        this.fullscreenBtn.setAttribute('aria-label', this.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
      }

      this.el.dispatchEvent(new CustomEvent('battersea:videoFullscreen', {
        bubbles: true,
        detail: { fullscreen: this.isFullscreen }
      }));
    }

    // --- Display Helpers ---

    formatTime(seconds) {
      if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

      seconds = Math.floor(seconds);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      if (h > 0) {
        return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }
      return m + ':' + String(s).padStart(2, '0');
    }

    // --- Lifecycle ---

    destroy() {
      this.clearHideTimer();

      if (this.video) {
        this.video.pause();
        this.video.src = '';
      }

      this.events.forEach(event => event.remove());
      this.events = [];

      // Remove generated DOM
      while (this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
      }

      this.el.classList.remove(
        'battersea-video',
        'battersea-video--error',
        'battersea-video--fullscreen',
        'battersea-video--dragging-progress',
        'battersea-video--dragging-volume'
      );
      this.el.removeAttribute('tabindex');

      if (this.accentColor) {
        this.el.style.removeProperty('--battersea-video-accent');
      }

      this.video = null;
      this.posterEl = null;
      this.titleEl = null;
      this.overlay = null;
      this.overlayIcon = null;
      this.playBtn = null;
      this.playIcon = null;
      this.muteBtn = null;
      this.fullscreenBtn = null;
      this.controls = null;
      this.progressContainer = null;
      this.progressFill = null;
      this.progressHandle = null;
      this.volumeContainer = null;
      this.volumeFill = null;
      this.volumeHandle = null;
      this.currentTimeEl = null;
      this.durationEl = null;
    }
  }

  window.Battersea.register('videoPlayer', VideoPlayer, '[data-video-player]');

})(window, document);
