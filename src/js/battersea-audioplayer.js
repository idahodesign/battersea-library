/**
 * Battersea Library - AudioPlayer Component
 * Version: 1.0.0
 *
 * A fully custom audio player with stylable controls.
 * Supports MP3, WAV, OGG, AAC.
 *
 * Usage:
 * <div data-audio-player data-audio-src="track.mp3"></div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */
(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('AudioPlayer requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  // SVG icons for volume states
  const ICONS = {
    volume: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    volumeLow: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 9v6h4l5 5V4l-5 5H7zm9.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
    muted: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
  };

  class AudioPlayer {

    constructor(el) {
      this.el = el;
      this.events = [];

      // Parse config from data attributes
      this.src = Utils.getData(el, 'audio-src');
      this.title = Utils.getData(el, 'audio-title') || '';
      this.artist = Utils.getData(el, 'audio-artist') || '';
      this.autoplay = Utils.parseBoolean(Utils.getData(el, 'audio-autoplay'));
      this.loop = Utils.parseBoolean(Utils.getData(el, 'audio-loop'));
      this.muted = Utils.parseBoolean(Utils.getData(el, 'audio-muted'));
      this.volume = Utils.parseInt(Utils.getData(el, 'audio-volume'), 80);
      this.preload = Utils.getData(el, 'audio-preload') || 'metadata';
      this.accentColor = Utils.getData(el, 'audio-color') || '';
      this.showProgress = Utils.getData(el, 'audio-progress') !== 'false';

      // State
      this.isPlaying = false;
      this.isMuted = this.muted;
      this.isDraggingProgress = false;
      this.isDraggingVolume = false;
      this.rafPending = false;
      this.savedVolume = this.volume;

      if (!this.src) {
        console.warn('AudioPlayer: data-audio-src is required');
        return;
      }

      this.init();
    }

    init() {
      this.createDOM();
      this.bindEvents();

      // Set initial volume
      this.audio.volume = Math.max(0, Math.min(1, this.volume / 100));
      this.audio.muted = this.isMuted;
      this.updateVolumeDisplay();
      this.updateVolumeIcon();

      // Handle autoplay
      if (this.autoplay) {
        this.play();
      }
    }

    createDOM() {
      this.el.classList.add('battersea-audio');

      // Apply accent colour as custom property
      if (this.accentColor) {
        this.el.style.setProperty('--battersea-audio-accent', this.accentColor);
      }

      // Hidden audio element
      this.audio = document.createElement('audio');
      this.audio.src = this.src;
      this.audio.preload = this.preload;
      if (this.loop) this.audio.loop = true;
      this.el.appendChild(this.audio);

      // Track info (optional)
      if (this.title || this.artist) {
        const info = document.createElement('div');
        info.className = 'battersea-audio__info';

        if (this.title) {
          const titleEl = document.createElement('span');
          titleEl.className = 'battersea-audio__title';
          titleEl.textContent = this.title;
          info.appendChild(titleEl);
        }

        if (this.artist) {
          const artistEl = document.createElement('span');
          artistEl.className = 'battersea-audio__artist';
          artistEl.textContent = this.artist;
          info.appendChild(artistEl);
        }

        this.el.appendChild(info);
      }

      // Controls container
      const controls = document.createElement('div');
      controls.className = 'battersea-audio__controls';

      // Play button
      this.playBtn = document.createElement('button');
      this.playBtn.className = 'battersea-audio__play';
      this.playBtn.setAttribute('type', 'button');
      this.playBtn.setAttribute('aria-label', 'Play');
      this.playIcon = document.createElement('span');
      this.playIcon.className = 'battersea-audio__icon--play';
      this.playBtn.appendChild(this.playIcon);
      controls.appendChild(this.playBtn);

      // Current time
      this.currentTimeEl = document.createElement('span');
      this.currentTimeEl.className = 'battersea-audio__time battersea-audio__time--current';
      this.currentTimeEl.textContent = '0:00';
      controls.appendChild(this.currentTimeEl);

      // Progress bar (optional — hidden when data-audio-progress="false")
      if (this.showProgress) {
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'battersea-audio__progress';
        this.progressContainer.setAttribute('role', 'slider');
        this.progressContainer.setAttribute('aria-label', 'Seek');
        this.progressContainer.setAttribute('aria-valuemin', '0');
        this.progressContainer.setAttribute('aria-valuemax', '100');
        this.progressContainer.setAttribute('aria-valuenow', '0');
        this.progressContainer.setAttribute('tabindex', '0');

        const progressBar = document.createElement('div');
        progressBar.className = 'battersea-audio__progress-bar';

        this.progressFill = document.createElement('div');
        this.progressFill.className = 'battersea-audio__progress-fill';

        this.progressHandle = document.createElement('div');
        this.progressHandle.className = 'battersea-audio__progress-handle';

        this.progressFill.appendChild(this.progressHandle);
        progressBar.appendChild(this.progressFill);
        this.progressContainer.appendChild(progressBar);
        controls.appendChild(this.progressContainer);
      }

      // Duration
      this.durationEl = document.createElement('span');
      this.durationEl.className = 'battersea-audio__time battersea-audio__time--duration';
      this.durationEl.textContent = '0:00';
      controls.appendChild(this.durationEl);

      // Mute button
      this.muteBtn = document.createElement('button');
      this.muteBtn.className = 'battersea-audio__mute';
      this.muteBtn.setAttribute('type', 'button');
      this.muteBtn.setAttribute('aria-label', 'Mute');
      this.muteBtn.innerHTML = ICONS.volume;
      controls.appendChild(this.muteBtn);

      // Volume bar
      this.volumeContainer = document.createElement('div');
      this.volumeContainer.className = 'battersea-audio__volume';
      this.volumeContainer.setAttribute('role', 'slider');
      this.volumeContainer.setAttribute('aria-label', 'Volume');
      this.volumeContainer.setAttribute('aria-valuemin', '0');
      this.volumeContainer.setAttribute('aria-valuemax', '100');
      this.volumeContainer.setAttribute('aria-valuenow', String(this.volume));
      this.volumeContainer.setAttribute('tabindex', '0');

      const volumeBar = document.createElement('div');
      volumeBar.className = 'battersea-audio__volume-bar';

      this.volumeFill = document.createElement('div');
      this.volumeFill.className = 'battersea-audio__volume-fill';

      this.volumeHandle = document.createElement('div');
      this.volumeHandle.className = 'battersea-audio__volume-handle';

      this.volumeFill.appendChild(this.volumeHandle);
      volumeBar.appendChild(this.volumeFill);
      this.volumeContainer.appendChild(volumeBar);
      controls.appendChild(this.volumeContainer);

      this.el.appendChild(controls);
    }

    bindEvents() {
      // Play/Pause
      this.events.push(
        Utils.addEvent(this.playBtn, 'click', () => this.togglePlay())
      );

      // Audio element events
      this.events.push(
        Utils.addEvent(this.audio, 'loadedmetadata', () => {
          this.durationEl.textContent = this.formatTime(this.audio.duration);
        })
      );

      this.events.push(
        Utils.addEvent(this.audio, 'timeupdate', () => this.updateProgress())
      );

      this.events.push(
        Utils.addEvent(this.audio, 'ended', () => {
          this.isPlaying = false;
          this.updatePlayIcon();
          this.el.dispatchEvent(new CustomEvent('battersea:audioEnded', { bubbles: true }));
        })
      );

      this.events.push(
        Utils.addEvent(this.audio, 'error', () => {
          this.el.classList.add('battersea-audio--error');
          const msg = document.createElement('div');
          msg.className = 'battersea-audio__error-msg';
          msg.textContent = 'Unable to load audio file';
          this.el.appendChild(msg);
        })
      );

      // Progress bar interaction (only if progress bar is shown)
      if (this.showProgress) {
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
              this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 5);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
            }
          })
        );
      }

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
            this.setVolume(Math.min(100, (this.audio.volume * 100) + 5));
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            this.setVolume(Math.max(0, (this.audio.volume * 100) - 5));
          }
        })
      );

      // Document-level drag handlers (bound once, check flags)
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

    // --- Playback ---

    play() {
      const promise = this.audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          this.isPlaying = true;
          this.updatePlayIcon();
          this.el.dispatchEvent(new CustomEvent('battersea:audioPlay', {
            bubbles: true,
            detail: { currentTime: this.audio.currentTime }
          }));
        }).catch(() => {
          // Autoplay blocked by browser — reset state
          this.isPlaying = false;
          this.updatePlayIcon();
        });
      }
    }

    pause() {
      this.audio.pause();
      this.isPlaying = false;
      this.updatePlayIcon();
      this.el.dispatchEvent(new CustomEvent('battersea:audioPause', {
        bubbles: true,
        detail: { currentTime: this.audio.currentTime }
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
        this.playIcon.className = 'battersea-audio__icon--pause';
        this.playBtn.setAttribute('aria-label', 'Pause');
      } else {
        this.playIcon.className = 'battersea-audio__icon--play';
        this.playBtn.setAttribute('aria-label', 'Play');
      }
    }

    // --- Seek / Progress ---

    seek(percentage) {
      if (!isFinite(this.audio.duration)) return;
      const time = (percentage / 100) * this.audio.duration;
      this.audio.currentTime = time;
      this.el.dispatchEvent(new CustomEvent('battersea:audioSeek', {
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
      this.el.classList.add('battersea-audio--dragging-progress');
      const pct = this.getPositionPercentage(e, this.progressContainer);
      this.progressFill.style.width = pct + '%';
      this.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
    }

    onProgressDrag(e) {
      const pct = this.getPositionPercentage(e, this.progressContainer);
      this.progressFill.style.width = pct + '%';
      this.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
      // Update time display during drag
      if (isFinite(this.audio.duration)) {
        const time = (pct / 100) * this.audio.duration;
        this.currentTimeEl.textContent = this.formatTime(time);
      }
    }

    stopProgressDrag() {
      const pct = parseFloat(this.progressFill.style.width) || 0;
      this.seek(pct);
      this.isDraggingProgress = false;
      this.el.classList.remove('battersea-audio--dragging-progress');
    }

    updateProgress() {
      if (this.isDraggingProgress) return;
      if (this.rafPending) return;

      this.rafPending = true;
      requestAnimationFrame(() => {
        this.rafPending = false;
        if (!this.audio || this.isDraggingProgress) return;

        const duration = this.audio.duration;
        if (!isFinite(duration) || duration === 0) return;

        const pct = (this.audio.currentTime / duration) * 100;

        if (this.showProgress) {
          this.progressFill.style.width = pct + '%';
          this.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
        }

        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
      });
    }

    // --- Volume ---

    setVolume(percentage) {
      percentage = Math.max(0, Math.min(100, percentage));
      this.audio.volume = percentage / 100;

      if (percentage > 0 && this.isMuted) {
        this.audio.muted = false;
        this.isMuted = false;
      }

      this.savedVolume = percentage;
      this.updateVolumeDisplay();
      this.updateVolumeIcon();

      this.volumeContainer.setAttribute('aria-valuenow', Math.round(percentage).toString());

      this.el.dispatchEvent(new CustomEvent('battersea:audioVolumeChange', {
        bubbles: true,
        detail: { volume: percentage }
      }));
    }

    toggleMute() {
      if (this.isMuted) {
        this.isMuted = false;
        this.audio.muted = false;
        // Restore previous volume
        this.audio.volume = this.savedVolume / 100;
      } else {
        this.isMuted = true;
        this.audio.muted = true;
      }

      this.updateVolumeDisplay();
      this.updateVolumeIcon();

      this.el.dispatchEvent(new CustomEvent('battersea:audioMute', {
        bubbles: true,
        detail: { muted: this.isMuted }
      }));
    }

    updateVolumeDisplay() {
      const vol = this.isMuted ? 0 : this.audio.volume * 100;
      this.volumeFill.style.width = vol + '%';
    }

    updateVolumeIcon() {
      const vol = this.audio.volume * 100;
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
      this.el.classList.add('battersea-audio--dragging-volume');
      const pct = this.getPositionPercentage(e, this.volumeContainer);
      this.setVolume(pct);
    }

    onVolumeDrag(e) {
      const pct = this.getPositionPercentage(e, this.volumeContainer);
      this.setVolume(pct);
    }

    stopVolumeDrag() {
      this.isDraggingVolume = false;
      this.el.classList.remove('battersea-audio--dragging-volume');
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
      if (this.audio) {
        this.audio.pause();
        this.audio.src = '';
      }

      this.events.forEach(event => event.remove());
      this.events = [];

      // Remove generated DOM
      while (this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
      }

      this.el.classList.remove('battersea-audio', 'battersea-audio--error', 'battersea-audio--dragging-progress', 'battersea-audio--dragging-volume');

      if (this.accentColor) {
        this.el.style.removeProperty('--battersea-audio-accent');
      }

      this.audio = null;
      this.playBtn = null;
      this.playIcon = null;
      this.muteBtn = null;
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

  window.Battersea.register('audioPlayer', AudioPlayer, '[data-audio-player]');

})(window, document);
