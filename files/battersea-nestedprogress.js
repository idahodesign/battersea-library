/**
 * Battersea Library - NestedProgress Component
 * Version: 2.0.5
 * 
 * Nested circular progress bars
 * 
 * Usage:
 * <div data-progress-nested data-progress-circles='[
 *   {"label":"HTML","value":90,"color":"#e34c26"},
 *   {"label":"CSS","value":85,"color":"#264de4"},
 *   {"label":"JS","value":75,"color":"#f0db4f"}
 * ]'></div>
 * 
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('NestedProgress requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  class NestedProgress {
    constructor(el) {
      if (!el) return;
      
      this.el = el;
      this.circles = this.parseCircles();
      this.title = Utils.getData(el, 'progress-title') || '';
      this.showLegend = Utils.parseBoolean(Utils.getData(el, 'progress-legend') || 'false');
      this.duration = Utils.parseInt(Utils.getData(el, 'progress-duration'), 1500);
      this.hasAnimated = false;
      this.observer = null;
      this.fillElements = [];

      if (this.circles.length === 0) {
        console.warn('NestedProgress has no circles defined');
        return;
      }

      this.init();
    }

    init() {
      this.createSVG();
      if (this.showLegend) this.createLegend();
      this.setupObserver();
    }

    parseCircles() {
      const circlesData = Utils.getData(this.el, 'progress-circles');
      if (!circlesData) return [];
      
      try {
        return JSON.parse(circlesData);
      } catch (e) {
        console.error('Invalid progress circles data:', e);
        return [];
      }
    }

    createSVG() {
      // Calculate responsive size based on parent width
      const parentWidth = this.el.offsetWidth || 300;
      const size = Math.min(parentWidth, 300);
      const center = size / 2;
      const strokeWidth = 12;
      const gap = 8;
      
      let svgContent = '';
      
      // Add title text in center if provided
      if (this.title) {
        svgContent += `
          <text
            x="${center}"
            y="${center}"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="var(--battersea-text, #333)"
            font-size="18"
            font-weight="bold"
          >${this.title}</text>
        `;
      }
      
      this.circles.forEach((circle, index) => {
        const radius = center - (strokeWidth / 2) - (index * (strokeWidth + gap));
        const circumference = 2 * Math.PI * radius;
        const offset = circumference;
        
        // Background circle
        svgContent += `
          <circle
            cx="${center}"
            cy="${center}"
            r="${radius}"
            fill="none"
            stroke="#e0e0e0"
            stroke-width="${strokeWidth}"
          />
        `;
        
        // Progress circle
        svgContent += `
          <circle
            class="battersea-nested-progress-fill"
            cx="${center}"
            cy="${center}"
            r="${radius}"
            fill="none"
            stroke="${circle.color || '#4CAF50'}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            transform="rotate(-90 ${center} ${center})"
            data-value="${circle.value}"
            data-circumference="${circumference}"
          />
        `;
      });
      
      this.el.innerHTML = `
        <svg class="battersea-progress-nested" width="100%" height="100%" viewBox="0 0 ${size} ${size}" style="max-width: ${size}px; max-height: ${size}px;">
          ${svgContent}
        </svg>
      `;
      
      this.fillElements = Utils.qsa('.battersea-nested-progress-fill', this.el);
      
      // Update on resize
      window.addEventListener('resize', Utils.debounce(() => {
        if (!this.hasAnimated) return;
        const newSize = Math.min(this.el.offsetWidth || 300, 300);
        const currentSize = parseInt(this.el.querySelector('svg').style.maxWidth);
        if (Math.abs(newSize - currentSize) > 10) {
          this.createSVG();
          if (this.showLegend) this.createLegend();
          this.hasAnimated = false;
          this.setupObserver();
        }
      }, 250));
    }

    createLegend() {
      // Remove existing legend if any
      const existingLegend = this.el.querySelector('.battersea-progress-legend');
      if (existingLegend) existingLegend.remove();
      
      const legend = document.createElement('div');
      legend.className = 'battersea-progress-legend';
      
      this.circles.forEach((circle, index) => {
        const item = document.createElement('div');
        item.className = 'battersea-progress-legend-item';
        
        const colorBox = document.createElement('span');
        colorBox.className = 'battersea-progress-legend-color';
        colorBox.style.backgroundColor = circle.color || '#4CAF50';
        
        const label = document.createElement('span');
        label.className = 'battersea-progress-legend-label';
        label.textContent = circle.label + (circle.showValue !== false ? ` (${circle.value}%)` : '');
        
        item.appendChild(colorBox);
        item.appendChild(label);
        legend.appendChild(item);
      });
      
      this.el.appendChild(legend);
    }

    setupObserver() {
      if (!('IntersectionObserver' in window)) {
        this.animate();
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animate();
            this.observer.unobserve(this.el);
          }
        });
      }, { threshold: 0.5 });

      this.observer.observe(this.el);
    }

    animate() {
      this.hasAnimated = true;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.easeOutQuad(progress);

        this.fillElements.forEach(fillEl => {
          const targetValue = parseFloat(Utils.getData(fillEl, 'value'));
          const circumference = parseFloat(Utils.getData(fillEl, 'circumference'));
          const currentValue = targetValue * easedProgress;
          const offset = circumference - (currentValue / 100) * circumference;
          fillEl.style.strokeDashoffset = offset;
        });

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    }

    easeOutQuad(t) {
      return t * (2 - t);
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Register component with Battersea
  window.Battersea.register('nestedprogress', NestedProgress, '[data-progress-nested]');

})(window, document);
