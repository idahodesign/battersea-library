/**
 * Battersea Library - ProgressBar Component
 * Version: 2.0.0
 * 
 * Usage:
 * <!-- Horizontal Progress Bar -->
 * <div data-progress data-progress-value="75" data-progress-label="Loading..."></div>
 * 
 * <!-- Circular Progress Bar -->
 * <div data-progress data-progress-type="circular" data-progress-value="85" data-progress-size="120" data-progress-stroke="8"></div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('ProgressBar requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class ProgressBar {
    constructor(el) {
      this.el = el;
      this.type = Utils.getData(el, 'progress-type') || 'horizontal';
      this.value = Utils.parseFloat(Utils.getData(el, 'progress-value'), 0);
      this.label = Utils.getData(el, 'progress-label') || '';
      this.showPercent = Utils.parseBoolean(Utils.getData(el, 'progress-show-percent') || 'true');
      this.animated = Utils.parseBoolean(Utils.getData(el, 'progress-animated') || 'true');
      this.size = Utils.parseInt(Utils.getData(el, 'progress-size'), 120);
      this.stroke = Utils.parseInt(Utils.getData(el, 'progress-stroke'), 8);
      this.observer = null;
      this.hasAnimated = false;

      this.init();
    }

    init() {
      if (this.type === 'circular') {
        this.createCircular();
      } else {
        this.createHorizontal();
      }

      if (this.animated) {
        this.setupObserver();
      } else {
        this.setProgress(this.value);
      }
    }

    createHorizontal() {
      this.el.classList.add('battersea-progress');
      
      const bar = document.createElement('div');
      bar.className = 'battersea-progress-bar';
      
      const fill = document.createElement('div');
      fill.className = 'battersea-progress-fill';
      fill.style.width = '0%';
      
      bar.appendChild(fill);
      this.el.appendChild(bar);
      
      if (this.label || this.showPercent) {
        const labelEl = document.createElement('div');
        labelEl.className = 'battersea-progress-label';
        labelEl.textContent = this.label;
        this.el.appendChild(labelEl);
        this.labelEl = labelEl;
      }
      
      this.fillEl = fill;
    }

    createCircular() {
      this.el.classList.add('battersea-progress', 'battersea-progress-circular');
      
      // Get size from parent or use specified size
      const parentWidth = this.el.parentElement ? this.el.parentElement.offsetWidth : this.size;
      const calculatedSize = Math.min(parentWidth, this.size);
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', `0 0 ${calculatedSize} ${calculatedSize}`);
      svg.style.maxWidth = calculatedSize + 'px';
      svg.style.maxHeight = calculatedSize + 'px';
      
      const center = calculatedSize / 2;
      const radius = (calculatedSize - this.stroke) / 2;
      const circumference = 2 * Math.PI * radius;
      
      // Background circle
      const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bgCircle.setAttribute('cx', center);
      bgCircle.setAttribute('cy', center);
      bgCircle.setAttribute('r', radius);
      bgCircle.setAttribute('fill', 'none');
      bgCircle.setAttribute('stroke', 'var(--battersea-progress-circular-stroke, #e0e0e0)');
      bgCircle.setAttribute('stroke-width', this.stroke);
      
      // Progress circle
      const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      progressCircle.setAttribute('cx', center);
      progressCircle.setAttribute('cy', center);
      progressCircle.setAttribute('r', radius);
      progressCircle.setAttribute('fill', 'none');
      progressCircle.setAttribute('stroke', 'var(--battersea-progress-circular-fill, #4CAF50)');
      progressCircle.setAttribute('stroke-width', this.stroke);
      progressCircle.setAttribute('stroke-linecap', 'round');
      progressCircle.setAttribute('stroke-dasharray', circumference);
      progressCircle.setAttribute('stroke-dashoffset', circumference);
      progressCircle.setAttribute('transform', `rotate(-90 ${center} ${center})`);
      
      svg.appendChild(bgCircle);
      svg.appendChild(progressCircle);
      this.el.appendChild(svg);
      
      if (this.showPercent) {
        const labelEl = document.createElement('div');
        labelEl.className = 'battersea-progress-label';
        labelEl.textContent = '0%';
        this.el.appendChild(labelEl);
        this.labelEl = labelEl;
      }
      
      this.progressCircle = progressCircle;
      this.circumference = circumference;
    }

    setupObserver() {
      if (!('IntersectionObserver' in window)) {
        this.animateProgress();
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animateProgress();
            this.hasAnimated = true;
          }
        });
      }, {
        threshold: 0.5
      });

      this.observer.observe(this.el);
    }

    animateProgress() {
      const duration = 1000;
      const steps = 60;
      const increment = this.value / steps;
      let current = 0;
      let step = 0;
      
      const timer = setInterval(() => {
        current += increment;
        step++;
        
        if (step >= steps) {
          current = this.value;
          clearInterval(timer);
        }
        
        this.setProgress(current);
      }, duration / steps);
    }

    setProgress(value) {
      value = Math.max(0, Math.min(100, value));
      
      if (this.type === 'circular') {
        const offset = this.circumference - (value / 100) * this.circumference;
        this.progressCircle.setAttribute('stroke-dashoffset', offset);
      } else {
        this.fillEl.style.width = value + '%';
      }
      
      if (this.labelEl) {
        if (this.showPercent) {
          this.labelEl.textContent = this.label ? `${this.label} ${Math.round(value)}%` : `${Math.round(value)}%`;
        } else {
          this.labelEl.textContent = this.label;
        }
      }
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Register component with Battersea
  window.Battersea.register('progressbar', ProgressBar, '[data-progress]');

})(window, document);
