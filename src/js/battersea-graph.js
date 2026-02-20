/**
 * Battersea Library - Graph Component
 * Version: 2.21.0
 *
 * SVG chart rendering with line, column, stacked column, bar, stacked bar,
 * pie, donut, and radial graph types.
 *
 * Supports three data sources:
 * 1. Inline JSON via data-graph-data attribute
 * 2. JSON file URL via data-graph-data attribute
 * 3. CSV file via data-graph-csv attribute
 *
 * Usage (inline JSON):
 * <div data-graph
 *   data-graph-type="line"
 *   data-graph-data='{"labels":["Jan","Feb"],"datasets":[{"label":"Sales","values":[100,200]}]}'>
 * </div>
 *
 * Usage (JSON file):
 * <div data-graph data-graph-type="column" data-graph-data="data/sales.json"></div>
 *
 * Usage (CSV file):
 * <div data-graph data-graph-type="pie" data-graph-csv="data/sales.csv"></div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Graph requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  class Graph {
    constructor(el) {
      this.el = el;
      this.events = [];

      // Graph type
      this.type = Utils.getData(el, 'graph-type') || 'line';

      // Data source
      this.csvUrl = Utils.getData(el, 'graph-csv') || '';
      this.dataAttr = Utils.getData(el, 'graph-data') || '';

      // Display options
      this.animated = Utils.parseBoolean(Utils.getData(el, 'graph-animated') || 'false');
      this.animationDelay = Utils.parseInt(Utils.getData(el, 'graph-animation-delay'), 300);
      this.tooltips = Utils.parseBoolean(Utils.getData(el, 'graph-tooltips') || 'true');
      this.showLegend = Utils.parseBoolean(Utils.getData(el, 'graph-legend') || 'true');
      this.legendPosition = Utils.getData(el, 'graph-legend-position') || 'bottom';
      this.xLabel = Utils.getData(el, 'graph-x-label') || '';
      this.yLabel = Utils.getData(el, 'graph-y-label') || '';
      this.title = Utils.getData(el, 'graph-title') || '';
      this.height = Utils.parseInt(Utils.getData(el, 'graph-height'), 400);

      // Line options
      this.smooth = Utils.parseBoolean(Utils.getData(el, 'graph-smooth') || 'false');

      // Column options
      this.barRadius = Utils.parseInt(Utils.getData(el, 'graph-bar-radius'), 2);
      this.stackGap = Utils.parseInt(Utils.getData(el, 'graph-stack-gap'), 0);

      // Pie options
      this.pieGap = Utils.parseInt(Utils.getData(el, 'graph-pie-gap'), 0);
      this.pieRadius = Utils.parseInt(Utils.getData(el, 'graph-pie-radius'), 0);
      this.pieStroke = Utils.getData(el, 'graph-pie-stroke') || '#fff';
      this.pieStrokeWidth = Utils.parseFloat(Utils.getData(el, 'graph-pie-stroke-width'), 2);

      // Donut options
      this.donutWidth = Utils.parseInt(Utils.getData(el, 'graph-donut-width'), 60);
      this.donutLabel = Utils.getData(el, 'graph-donut-label') || '';
      this.donutLabelValue = Utils.parseBoolean(Utils.getData(el, 'graph-donut-label-value') || 'false');

      // Radial options
      this.radialStart = Utils.parseInt(Utils.getData(el, 'graph-radial-start'), 0);
      this.radialGrid = Utils.parseBoolean(Utils.getData(el, 'graph-radial-grid') || 'true');
      this.radialLabelPosition = Utils.getData(el, 'graph-radial-label-position') || 'end';

      // Grid options
      this.showHGrid = Utils.parseBoolean(Utils.getData(el, 'graph-grid-h') || 'true');
      this.showVGrid = Utils.parseBoolean(Utils.getData(el, 'graph-grid-v') || 'false');

      // Legend swatch shape
      this.swatchShape = Utils.getData(el, 'graph-swatch-shape') || 'square';

      // Custom colours
      var coloursAttr = Utils.getData(el, 'graph-colours') || '';
      this.colours = coloursAttr ? coloursAttr.split(',').map(function(c) { return c.trim(); }) : [];

      // Default colour palette
      this.defaultColours = [
        '#667eea', '#e94560', '#4ecdc4', '#ff6b6b',
        '#45b7d1', '#f9ca24', '#6c5ce7', '#a8e6cf'
      ];

      // Data model
      this.labels = [];
      this.datasets = [];
      this.links = [];

      // DOM references
      this.wrapper = null;
      this.svgEl = null;
      this.tooltipEl = null;
      this.legendEl = null;

      // Animation state — deferred until visible
      this._hasAnimated = false;
      this._observer = null;
      this._pendingAnimations = [];

      // Debounced resize
      this._debouncedResize = Utils.debounce(this.onResize.bind(this), 250);

      this.init();
    }

    // ─── Lifecycle ─────────────────────────────

    init() {
      // Path 1: CSV file URL
      if (this.csvUrl) {
        this.loadCSV(this.csvUrl);
        return;
      }

      // Path 2: JSON — URL or inline
      if (this.dataAttr) {
        var firstChar = this.dataAttr.charAt(0);
        if (firstChar !== '[' && firstChar !== '{') {
          this.loadJSON(this.dataAttr);
          return;
        }
        this.parseJSONData(this.dataAttr);
      }

      this.finishInit();
    }

    finishInit() {
      if (this.labels.length === 0) {
        console.warn('Graph: No data to render');
        return;
      }

      // Build wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'battersea-graph';

      // Add legend-position modifier for left/right layout
      if (this.showLegend && (this.legendPosition === 'left' || this.legendPosition === 'right')) {
        this.wrapper.classList.add('battersea-graph--legend-' + this.legendPosition);
      }

      // Title
      if (this.title) {
        this.drawTitle();
      }

      // Top legend
      if (this.showLegend && this.legendPosition === 'top') {
        this.drawLegend();
      }

      // SVG container
      var svgContainer = document.createElement('div');
      svgContainer.className = 'battersea-graph__svg-container';
      this.wrapper.appendChild(svgContainer);

      // Tooltip element
      if (this.tooltips) {
        this.tooltipEl = document.createElement('div');
        this.tooltipEl.className = 'battersea-graph__tooltip';
        this.tooltipEl.style.display = 'none';
        svgContainer.appendChild(this.tooltipEl);
      }

      this.el.appendChild(this.wrapper);

      // Render the chart — elements are placed in animation-ready start state
      this.render();

      // Legend (bottom, left, right — placed after SVG)
      if (this.showLegend && this.legendPosition !== 'top') {
        this.drawLegend();
      }

      // If animated, observe when the graph scrolls into view to trigger
      if (this.animated) {
        this.observeVisibility();
      }

      // Resize listener
      this.events.push(Utils.addEvent(window, 'resize', this._debouncedResize));

      // Dispatch ready event
      this.el.dispatchEvent(new CustomEvent('battersea:graphReady', {
        bubbles: true,
        detail: { type: this.type, labels: this.labels.length, datasets: this.datasets.length }
      }));
    }

    observeVisibility() {
      var self = this;
      this._observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !self._hasAnimated) {
            self._hasAnimated = true;
            self._observer.disconnect();
            self._observer = null;
            // Trigger all queued animations after delay
            setTimeout(function() {
              self._pendingAnimations.forEach(function(fn) { fn(); });
              self._pendingAnimations = [];
            }, self.animationDelay);
          }
        });
      }, { threshold: 0.15 });

      this._observer.observe(this.el);
    }

    destroy() {
      this.events.forEach(function(event) { event.remove(); });
      this.events = [];

      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }

      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }

      this.svgEl = null;
      this.tooltipEl = null;
      this.legendEl = null;
      this.wrapper = null;
    }

    // ─── Data Loading ──────────────────────────

    loadCSV(url) {
      var self = this;
      fetch(url)
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Failed to load CSV: ' + response.status);
          }
          return response.text();
        })
        .then(function(text) {
          self.parseCSVString(text);
          self.finishInit();
        })
        .catch(function(err) {
          console.error('Graph: ' + err.message);
        });
    }

    loadJSON(url) {
      var self = this;
      fetch(url)
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Failed to load JSON: ' + response.status);
          }
          return response.json();
        })
        .then(function(data) {
          self.labels = data.labels || [];
          self.datasets = (data.datasets || []).map(function(ds) {
            return { label: ds.label || '', values: ds.values || [] };
          });
          self.finishInit();
        })
        .catch(function(err) {
          console.error('Graph: ' + err.message);
        });
    }

    parseJSONData(jsonStr) {
      var self = this;
      try {
        var data = JSON.parse(jsonStr);
        this.labels = data.labels || [];
        this.datasets = (data.datasets || []).map(function(ds) {
          return { label: ds.label || '', values: ds.values || [] };
        });
        // Parse links: each entry is a URL string, {url, target} object, or null
        if (data.links) {
          this.links = data.links.map(function(link) {
            if (!link) return null;
            if (typeof link === 'string') return { url: link, target: '_self' };
            return { url: link.url || '', target: link.target || '_self' };
          });
        }
      } catch (e) {
        console.error('Graph: Invalid JSON data', e);
      }
    }

    parseCSVString(text) {
      var lines = [];
      var current = '';
      var inQuotes = false;

      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (inQuotes) {
          if (ch === '"') {
            if (i + 1 < text.length && text[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            current += ch;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
          } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
            lines.push(current);
            current = '';
            if (ch === '\r') i++;
          } else {
            current += ch;
          }
        }
      }
      if (current.length > 0) {
        lines.push(current);
      }

      if (lines.length < 2) {
        console.warn('Graph: CSV has no data rows');
        return;
      }

      var splitLine = function(line) {
        var fields = [];
        var field = '';
        var q = false;
        for (var j = 0; j < line.length; j++) {
          var c = line[j];
          if (q) {
            if (c === '"') {
              if (j + 1 < line.length && line[j + 1] === '"') {
                field += '"';
                j++;
              } else {
                q = false;
              }
            } else {
              field += c;
            }
          } else {
            if (c === '"') {
              q = true;
            } else if (c === ',') {
              fields.push(field.trim());
              field = '';
            } else {
              field += c;
            }
          }
        }
        fields.push(field.trim());
        return fields;
      };

      var headers = splitLine(lines[0]);

      // Detect Link and LinkTarget columns (case-insensitive)
      var linkCol = -1;
      var linkTargetCol = -1;
      for (var c = 1; c < headers.length; c++) {
        var hLower = headers[c].toLowerCase();
        if (hLower === 'link') linkCol = c;
        else if (hLower === 'linktarget') linkTargetCol = c;
      }

      // First column = labels, remaining columns = datasets (excluding link columns)
      this.labels = [];
      this.datasets = [];

      for (var h = 1; h < headers.length; h++) {
        if (h === linkCol || h === linkTargetCol) continue;
        this.datasets.push({ label: headers[h], values: [] });
      }

      for (var r = 1; r < lines.length; r++) {
        var fields = splitLine(lines[r]);
        if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) continue;
        this.labels.push(fields[0]);

        var dsIdx = 0;
        for (var d = 1; d < headers.length; d++) {
          if (d === linkCol || d === linkTargetCol) continue;
          this.datasets[dsIdx].values.push(parseFloat(fields[d]) || 0);
          dsIdx++;
        }

        // Parse link for this row
        if (linkCol > -1) {
          var linkUrl = (fields[linkCol] || '').trim();
          if (linkUrl) {
            var linkTarget = linkTargetCol > -1 ? (fields[linkTargetCol] || '').trim() : '_self';
            this.links.push({ url: linkUrl, target: linkTarget || '_self' });
          } else {
            this.links.push(null);
          }
        }
      }
    }

    // ─── Rendering ─────────────────────────────

    render() {
      this._pendingAnimations = [];

      var container = Utils.qs('.battersea-graph__svg-container', this.wrapper);
      var width = container.clientWidth;
      if (width === 0) width = 600;
      var height = this.height;

      // Clear previous SVG
      if (this.svgEl) {
        this.svgEl.remove();
      }

      this.svgEl = document.createElementNS(SVG_NS, 'svg');
      this.svgEl.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      this.svgEl.setAttribute('width', '100%');
      this.svgEl.setAttribute('height', height);
      this.svgEl.setAttribute('role', 'img');
      this.svgEl.setAttribute('aria-label', this.title || 'Graph');
      this.svgEl.classList.add('battersea-graph__svg');

      container.insertBefore(this.svgEl, this.tooltipEl || null);

      var area = this.getChartArea(width, height);

      switch (this.type) {
        case 'line':
          this.renderLine(this.svgEl, area, width, height);
          break;
        case 'column':
          this.renderColumn(this.svgEl, area, width, height);
          break;
        case 'stackedcolumn':
          this.renderStackedColumn(this.svgEl, area, width, height);
          break;
        case 'bar':
          this.renderBar(this.svgEl, area, width, height);
          break;
        case 'stackedbar':
          this.renderStackedBar(this.svgEl, area, width, height);
          break;
        case 'pie':
          this.renderPie(this.svgEl, width, height);
          break;
        case 'donut':
          this.renderDonut(this.svgEl, width, height);
          break;
        case 'radial':
          this.renderRadial(this.svgEl, width, height);
          break;
        default:
          console.warn('Graph: Unknown type "' + this.type + '"');
      }

      this.el.dispatchEvent(new CustomEvent('battersea:graphRender', {
        bubbles: true,
        detail: { type: this.type }
      }));
    }

    getChartArea(width, height) {
      var leftPad = (this.type === 'bar' || this.type === 'stackedbar') ? 90 : 55;
      var padding = {
        top: 15,
        right: 20,
        bottom: 40 + (this.xLabel ? 25 : 0),
        left: leftPad + (this.yLabel ? 25 : 0)
      };
      return {
        x: padding.left,
        y: padding.top,
        width: width - padding.left - padding.right,
        height: height - padding.top - padding.bottom
      };
    }

    // ─── Line Chart ────────────────────────────

    renderLine(svg, area, width, height) {
      var self = this;

      // Calculate Y range
      var allValues = [];
      this.datasets.forEach(function(ds) {
        allValues = allValues.concat(ds.values);
      });
      var dataMin = Math.min.apply(null, allValues);
      var dataMax = Math.max.apply(null, allValues);
      var ticks = this.calculateNiceTicks(dataMin, dataMax, 5);

      this.drawGrid(svg, area, ticks, 'line');
      this.drawYAxis(svg, area, ticks);
      this.drawXAxis(svg, area, 'line');

      var pointCount = this.labels.length;
      var xStep = pointCount > 1 ? area.width / (pointCount - 1) : 0;

      this.datasets.forEach(function(ds, dsIndex) {
        var colour = self.getColour(dsIndex);
        var points = [];

        ds.values.forEach(function(val, i) {
          var x = area.x + i * xStep;
          var y = area.y + area.height - ((val - ticks.min) / (ticks.max - ticks.min)) * area.height;
          points.push({ x: x, y: y, label: self.labels[i], value: val, dsLabel: ds.label });
        });

        // Draw line path — smooth or straight
        var pathD;
        if (self.smooth && points.length > 1) {
          pathD = self.buildSmoothPath(points);
        } else {
          pathD = points.map(function(p, i) {
            return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
          }).join(' ');
        }

        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', colour);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
        path.classList.add('battersea-graph__line');
        svg.appendChild(path);

        // Set up line in hidden state for animation
        var lineLength = 0;
        if (self.animated) {
          lineLength = path.getTotalLength();
          path.style.strokeDasharray = lineLength;
          path.style.strokeDashoffset = lineLength;
        }

        // Data points
        var circles = [];
        points.forEach(function(p, pi) {
          var circle = document.createElementNS(SVG_NS, 'circle');
          circle.setAttribute('cx', p.x.toFixed(1));
          circle.setAttribute('cy', p.y.toFixed(1));
          circle.setAttribute('r', '4');
          circle.setAttribute('fill', colour);
          circle.setAttribute('stroke', '#fff');
          circle.setAttribute('stroke-width', '2');
          circle.classList.add('battersea-graph__point');

          // Hide markers initially for animation
          if (self.animated) {
            circle.classList.add('battersea-graph__point--hidden');
            circles.push(circle);
          }

          svg.appendChild(self.wrapInLink(circle, pi));

          if (self.tooltips) {
            self.events.push(Utils.addEvent(circle, 'mouseenter', function(e) {
              self.showTooltip(e, p.label, p.dsLabel + ': ' + self.formatNumber(p.value));
            }));
            self.events.push(Utils.addEvent(circle, 'mouseleave', function() {
              self.hideTooltip();
            }));
          }
        });

        // Queue line animation trigger
        if (self.animated) {
          (function(linePath, markerCircles, len) {
            var duration = self.getAnimationDuration();
            self._pendingAnimations.push(function() {
              // Trigger line draw
              linePath.classList.add('battersea-graph__line--animated');
              // Reveal markers as the line reaches each position
              markerCircles.forEach(function(c, ci) {
                var fraction = markerCircles.length > 1 ? ci / (markerCircles.length - 1) : 0;
                setTimeout(function() {
                  c.classList.remove('battersea-graph__point--hidden');
                  c.classList.add('battersea-graph__point--visible');
                }, duration * fraction);
              });
            });
          })(path, circles, lineLength);
        }
      });
    }

    // ─── Column Chart ──────────────────────────

    renderColumn(svg, area, width, height) {
      var self = this;

      var allValues = [];
      this.datasets.forEach(function(ds) { allValues = allValues.concat(ds.values); });
      var ticks = this.calculateNiceTicks(0, Math.max.apply(null, allValues), 5);

      this.drawGrid(svg, area, ticks, 'column');
      this.drawYAxis(svg, area, ticks);
      this.drawXAxis(svg, area, 'column');

      var groupCount = this.labels.length;
      var seriesCount = this.datasets.length;
      var groupWidth = area.width / groupCount;
      var barPadding = groupWidth * 0.15;
      var barGap = seriesCount > 1 ? 2 : 0;
      var barWidth = (groupWidth - barPadding * 2 - barGap * (seriesCount - 1)) / seriesCount;

      // Stagger delay per group for sequential left-to-right animation
      var barStagger = groupCount > 1 ? this.getAnimationDuration() / groupCount : 0;

      // Collect bar animation data
      var barAnimations = [];

      this.datasets.forEach(function(ds, dsIndex) {
        var colour = self.getColour(dsIndex);

        ds.values.forEach(function(val, i) {
          var barHeight = (val / ticks.max) * area.height;
          var x = area.x + i * groupWidth + barPadding + dsIndex * (barWidth + barGap);
          var y = area.y + area.height - barHeight;

          var rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('x', x.toFixed(1));
          rect.setAttribute('width', Math.max(barWidth, 1).toFixed(1));
          rect.setAttribute('rx', self.barRadius);
          rect.setAttribute('fill', colour);
          rect.classList.add('battersea-graph__bar');

          if (self.animated) {
            // Start at zero height — animation triggered later
            rect.setAttribute('y', (area.y + area.height).toFixed(1));
            rect.setAttribute('height', '0');
            barAnimations.push({ rect: rect, baseline: area.y + area.height, targetY: y, targetHeight: barHeight, group: i });
          } else {
            rect.setAttribute('y', y.toFixed(1));
            rect.setAttribute('height', barHeight.toFixed(1));
          }
          svg.appendChild(self.wrapInLink(rect, i));

          if (self.tooltips) {
            self.events.push(Utils.addEvent(rect, 'mouseenter', function(e) {
              self.showTooltip(e, self.labels[i], ds.label + ': ' + self.formatNumber(val));
            }));
            self.events.push(Utils.addEvent(rect, 'mouseleave', function() {
              self.hideTooltip();
            }));
          }
        });
      });

      // Queue staggered bar animations
      if (this.animated && barAnimations.length > 0) {
        var stagger = groupCount > 1 ? this.getAnimationDuration() / groupCount : 0;
        this._pendingAnimations.push(function() {
          barAnimations.forEach(function(bar) {
            self.animateBar(bar.rect, bar.baseline, bar.targetY, bar.targetHeight, bar.group * stagger);
          });
        });
      }
    }

    // ─── Bar Chart (Horizontal) ────────────────

    renderBar(svg, area, width, height) {
      var self = this;

      var allValues = [];
      this.datasets.forEach(function(ds) { allValues = allValues.concat(ds.values); });
      var maxVal = Math.max.apply(null, allValues);
      var ticks = this.calculateNiceTicks(0, maxVal, 5);

      var groupCount = this.labels.length;
      var seriesCount = this.datasets.length;
      var groupHeight = area.height / groupCount;
      var barPadding = groupHeight * 0.15;
      var barGap = seriesCount > 1 ? 2 : 0;
      var barHeight = (groupHeight - barPadding * 2 - barGap * (seriesCount - 1)) / seriesCount;

      // Draw horizontal grid lines at tick positions along X axis
      if (this.showHGrid || this.showVGrid) {
        ticks.ticks.forEach(function(tickVal) {
          var x = area.x + (tickVal / ticks.max) * area.width;
          var line = document.createElementNS(SVG_NS, 'line');
          line.setAttribute('x1', x.toFixed(1));
          line.setAttribute('y1', area.y);
          line.setAttribute('x2', x.toFixed(1));
          line.setAttribute('y2', area.y + area.height);
          line.classList.add('battersea-graph__grid-line');
          line.classList.add('battersea-graph__grid-line--v');
          svg.appendChild(line);
        });
      }

      // Y axis (left side)
      var axisLine = document.createElementNS(SVG_NS, 'line');
      axisLine.setAttribute('x1', area.x);
      axisLine.setAttribute('y1', area.y);
      axisLine.setAttribute('x2', area.x);
      axisLine.setAttribute('y2', area.y + area.height);
      axisLine.classList.add('battersea-graph__axis-line');
      svg.appendChild(axisLine);

      // X axis (bottom)
      var xAxisLine = document.createElementNS(SVG_NS, 'line');
      xAxisLine.setAttribute('x1', area.x);
      xAxisLine.setAttribute('y1', area.y + area.height);
      xAxisLine.setAttribute('x2', area.x + area.width);
      xAxisLine.setAttribute('y2', area.y + area.height);
      xAxisLine.classList.add('battersea-graph__axis-line');
      svg.appendChild(xAxisLine);

      // X-axis tick labels (values)
      ticks.ticks.forEach(function(tickVal) {
        var x = area.x + (tickVal / ticks.max) * area.width;
        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', x.toFixed(1));
        text.setAttribute('y', area.y + area.height + 20);
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('battersea-graph__tick-label');
        text.textContent = self.formatTickLabel(tickVal);
        svg.appendChild(text);
      });

      // Y-axis category labels
      this.labels.forEach(function(label, i) {
        var y = area.y + i * groupHeight + groupHeight / 2;
        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', area.x - 8);
        text.setAttribute('y', (y + 4).toFixed(1));
        text.setAttribute('text-anchor', 'end');
        text.classList.add('battersea-graph__tick-label');
        text.textContent = label;
        svg.appendChild(text);
      });

      // X-axis label
      if (this.xLabel) {
        var xLabelEl = document.createElementNS(SVG_NS, 'text');
        xLabelEl.setAttribute('x', (area.x + area.width / 2).toFixed(1));
        xLabelEl.setAttribute('y', area.y + area.height + 42);
        xLabelEl.setAttribute('text-anchor', 'middle');
        xLabelEl.classList.add('battersea-graph__axis-label');
        xLabelEl.textContent = this.xLabel;
        svg.appendChild(xLabelEl);
      }

      // Collect bar animation data
      var barAnimations = [];

      this.datasets.forEach(function(ds, dsIndex) {
        var colour = self.getColour(dsIndex);

        ds.values.forEach(function(val, i) {
          var barWidth = (val / ticks.max) * area.width;
          var x = area.x;
          var y = area.y + i * groupHeight + barPadding + dsIndex * (barHeight + barGap);

          var rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('y', y.toFixed(1));
          rect.setAttribute('height', Math.max(barHeight, 1).toFixed(1));
          rect.setAttribute('rx', self.barRadius);
          rect.setAttribute('fill', colour);
          rect.classList.add('battersea-graph__bar');

          if (self.animated) {
            // Start at zero width — animation triggered later
            rect.setAttribute('x', area.x.toFixed(1));
            rect.setAttribute('width', '0');
            barAnimations.push({ rect: rect, targetWidth: barWidth, group: i });
          } else {
            rect.setAttribute('x', x.toFixed(1));
            rect.setAttribute('width', barWidth.toFixed(1));
          }
          svg.appendChild(self.wrapInLink(rect, i));

          if (self.tooltips) {
            self.events.push(Utils.addEvent(rect, 'mouseenter', function(e) {
              self.showTooltip(e, self.labels[i], ds.label + ': ' + self.formatNumber(val));
            }));
            self.events.push(Utils.addEvent(rect, 'mouseleave', function() {
              self.hideTooltip();
            }));
          }
        });
      });

      // Queue staggered horizontal bar animations (top-to-bottom)
      if (this.animated && barAnimations.length > 0) {
        var stagger = groupCount > 1 ? this.getAnimationDuration() / groupCount : 0;
        var duration = this.getAnimationDuration();
        this._pendingAnimations.push(function() {
          barAnimations.forEach(function(bar) {
            var delay = bar.group * stagger;
            self.animateHorizontalBar(bar.rect, bar.targetWidth, duration, delay);
          });
        });
      }
    }

    // ─── Pie Chart ─────────────────────────────

    renderPie(svg, width, height) {
      var self = this;
      var values = this.datasets[0].values;
      var total = values.reduce(function(sum, v) { return sum + v; }, 0);
      if (total === 0) return;

      var cx = width / 2;
      var cy = height / 2;
      var radius = Math.min(cx, cy) - 40;
      var gap = this.pieGap;
      var cornerRadius = Math.min(this.pieRadius, radius * 0.3);
      var startAngle = -Math.PI / 2;

      // Build all slices as a group for clockwise animation
      var sliceGroup = document.createElementNS(SVG_NS, 'g');
      sliceGroup.classList.add('battersea-graph__pie-group');
      svg.appendChild(sliceGroup);

      // For clockwise wipe animation, use a clip-path with a growing arc
      var clipArc = null;
      if (this.animated) {
        var clipId = 'graph-pie-clip-' + Math.random().toString(36).substr(2, 6);
        var defs = document.createElementNS(SVG_NS, 'defs');
        var clipPath = document.createElementNS(SVG_NS, 'clipPath');
        clipPath.setAttribute('id', clipId);

        // Arc path that will grow from 0 to full circle
        clipArc = document.createElementNS(SVG_NS, 'path');
        clipArc.setAttribute('d', 'M ' + cx + ' ' + cy + ' Z');
        clipPath.appendChild(clipArc);
        defs.appendChild(clipPath);
        svg.appendChild(defs);
        sliceGroup.setAttribute('clip-path', 'url(#' + clipId + ')');
      }

      var halfGap = gap / 2;

      values.forEach(function(val, i) {
        var sliceAngle = (val / total) * Math.PI * 2;
        var colour = self.getColour(i);

        // Build the slice path
        var d;
        if (gap > 0 && cornerRadius > 0 && sliceAngle < Math.PI * 2 - 0.01) {
          d = self.buildGappedRoundedSlicePath(cx, cy, radius, startAngle, startAngle + sliceAngle, halfGap, cornerRadius);
        } else if (gap > 0) {
          d = self.buildGappedSlicePath(cx, cy, radius, startAngle, startAngle + sliceAngle, halfGap);
        } else if (cornerRadius > 0 && sliceAngle < Math.PI * 2 - 0.01) {
          d = self.buildRoundedSlicePath(cx, cy, radius, startAngle, startAngle + sliceAngle, cornerRadius);
        } else {
          var x1 = cx + radius * Math.cos(startAngle);
          var y1 = cy + radius * Math.sin(startAngle);
          var x2 = cx + radius * Math.cos(startAngle + sliceAngle);
          var y2 = cy + radius * Math.sin(startAngle + sliceAngle);
          var largeArc = sliceAngle > Math.PI ? 1 : 0;

          d = [
            'M', cx.toFixed(2), cy.toFixed(2),
            'L', x1.toFixed(2), y1.toFixed(2),
            'A', radius.toFixed(2), radius.toFixed(2), 0, largeArc, 1, x2.toFixed(2), y2.toFixed(2),
            'Z'
          ].join(' ');
        }

        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', colour);
        path.classList.add('battersea-graph__slice');

        // Stroke / outline config
        if (self.pieStrokeWidth > 0) {
          path.setAttribute('stroke', self.pieStroke);
          path.setAttribute('stroke-width', self.pieStrokeWidth);
        }

        sliceGroup.appendChild(self.wrapInLink(path, i));

        if (self.tooltips) {
          var pct = Math.round((val / total) * 100);
          self.events.push(Utils.addEvent(path, 'mouseenter', function(e) {
            self.showTooltip(e, self.labels[i], self.formatNumber(val) + ' (' + pct + '%)');
          }));
          self.events.push(Utils.addEvent(path, 'mouseleave', function() {
            self.hideTooltip();
          }));
        }

        startAngle += sliceAngle;
      });

      // Queue pie clockwise sweep animation
      if (this.animated && clipArc) {
        (function(arcEl, pieCx, pieCy, pieRadius) {
          var duration = self.getAnimationDuration();
          var r = pieRadius + 20; // clip slightly larger than pie
          self._pendingAnimations.push(function() {
            var startTime = null;
            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var elapsed = timestamp - startTime;
              var progress = Math.min(elapsed / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              var angle = eased * Math.PI * 2;

              if (angle < 0.001) {
                arcEl.setAttribute('d', 'M ' + pieCx + ' ' + pieCy + ' Z');
              } else if (angle >= Math.PI * 2 - 0.001) {
                // Full circle — use rect to cover everything
                arcEl.setAttribute('d',
                  'M ' + (pieCx - r) + ' ' + (pieCy - r) +
                  ' h ' + (r * 2) + ' v ' + (r * 2) + ' h ' + (-(r * 2)) + ' Z'
                );
              } else {
                // Build arc wedge from 12 o'clock position clockwise
                var startA = -Math.PI / 2;
                var endA = startA + angle;
                var x1 = pieCx + r * Math.cos(startA);
                var y1 = pieCy + r * Math.sin(startA);
                var x2 = pieCx + r * Math.cos(endA);
                var y2 = pieCy + r * Math.sin(endA);
                var largeArc = angle > Math.PI ? 1 : 0;

                arcEl.setAttribute('d',
                  'M ' + pieCx.toFixed(2) + ' ' + pieCy.toFixed(2) +
                  ' L ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
                  ' A ' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 ' + largeArc + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) +
                  ' Z'
                );
              }

              if (progress < 1) {
                requestAnimationFrame(step);
              }
            }
            requestAnimationFrame(step);
          });
        })(clipArc, cx, cy, radius);
      }
    }

    // ─── Stacked Column Chart ───────────────

    renderStackedColumn(svg, area, width, height) {
      var self = this;

      // Calculate stacked totals per label
      var groupCount = this.labels.length;
      var stackTotals = [];
      for (var g = 0; g < groupCount; g++) {
        var total = 0;
        this.datasets.forEach(function(ds) { total += ds.values[g] || 0; });
        stackTotals.push(total);
      }

      var ticks = this.calculateNiceTicks(0, Math.max.apply(null, stackTotals), 5);

      this.drawGrid(svg, area, ticks, 'stackedcolumn');
      this.drawYAxis(svg, area, ticks);
      this.drawXAxis(svg, area, 'stackedcolumn');

      var groupWidth = area.width / groupCount;
      var barPadding = groupWidth * 0.15;
      var barWidth = groupWidth - barPadding * 2;
      var stackGap = this.stackGap;
      var barAnimations = [];

      for (var i = 0; i < groupCount; i++) {
        var cumulativeHeight = 0;

        for (var dsIndex = 0; dsIndex < this.datasets.length; dsIndex++) {
          var ds = this.datasets[dsIndex];
          var val = ds.values[i] || 0;
          var colour = self.getColour(dsIndex);
          var segmentHeight = (val / ticks.max) * area.height;

          // Apply gap: add offset above the first segment, reduce height for gaps
          var gapOffset = dsIndex > 0 ? stackGap : 0;
          var drawHeight = Math.max(segmentHeight - gapOffset, 0);

          var x = area.x + i * groupWidth + barPadding;
          var y = area.y + area.height - cumulativeHeight - segmentHeight;

          var rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('x', x.toFixed(1));
          rect.setAttribute('width', Math.max(barWidth, 1).toFixed(1));
          rect.setAttribute('fill', colour);
          rect.classList.add('battersea-graph__bar');

          // Round corners: apply to all segments when gap > 0, none when gap is 0
          if (self.barRadius > 0 && stackGap > 0) {
            rect.setAttribute('rx', self.barRadius);
          }

          if (self.animated) {
            rect.setAttribute('y', (area.y + area.height - cumulativeHeight).toFixed(1));
            rect.setAttribute('height', '0');
            barAnimations.push({
              rect: rect,
              baseline: area.y + area.height - cumulativeHeight,
              targetY: y + gapOffset,
              targetHeight: drawHeight,
              group: i,
              segment: dsIndex
            });
          } else {
            rect.setAttribute('y', (y + gapOffset).toFixed(1));
            rect.setAttribute('height', Math.max(drawHeight, 0).toFixed(1));
          }
          svg.appendChild(self.wrapInLink(rect, i));

          if (self.tooltips) {
            (function(label, dsLabel, value, stackTotal) {
              self.events.push(Utils.addEvent(rect, 'mouseenter', function(e) {
                self.showTooltip(e, label, dsLabel + ': ' + self.formatNumber(value) + '<br>Total: ' + self.formatNumber(stackTotal));
              }));
              self.events.push(Utils.addEvent(rect, 'mouseleave', function() {
                self.hideTooltip();
              }));
            })(self.labels[i], ds.label, val, stackTotals[i]);
          }

          cumulativeHeight += segmentHeight;
        }
      }

      if (this.animated && barAnimations.length > 0) {
        var segmentCount = this.datasets.length;
        var totalDuration = this.getAnimationDuration();
        this._pendingAnimations.push(function() {
          self.animateStackedColumns(barAnimations, segmentCount, totalDuration);
        });
      }
    }

    // ─── Stacked Bar Chart (Horizontal) ─────

    renderStackedBar(svg, area, width, height) {
      var self = this;

      // Calculate stacked totals per label
      var groupCount = this.labels.length;
      var stackTotals = [];
      for (var g = 0; g < groupCount; g++) {
        var total = 0;
        this.datasets.forEach(function(ds) { total += ds.values[g] || 0; });
        stackTotals.push(total);
      }

      var maxVal = Math.max.apply(null, stackTotals);
      var ticks = this.calculateNiceTicks(0, maxVal, 5);

      // Draw vertical grid lines at tick positions
      if (this.showHGrid || this.showVGrid) {
        ticks.ticks.forEach(function(tickVal) {
          var x = area.x + (tickVal / ticks.max) * area.width;
          var line = document.createElementNS(SVG_NS, 'line');
          line.setAttribute('x1', x.toFixed(1));
          line.setAttribute('y1', area.y);
          line.setAttribute('x2', x.toFixed(1));
          line.setAttribute('y2', area.y + area.height);
          line.classList.add('battersea-graph__grid-line');
          line.classList.add('battersea-graph__grid-line--v');
          svg.appendChild(line);
        });
      }

      // Y axis line
      var axisLine = document.createElementNS(SVG_NS, 'line');
      axisLine.setAttribute('x1', area.x);
      axisLine.setAttribute('y1', area.y);
      axisLine.setAttribute('x2', area.x);
      axisLine.setAttribute('y2', area.y + area.height);
      axisLine.classList.add('battersea-graph__axis-line');
      svg.appendChild(axisLine);

      // X axis line
      var xAxisLine = document.createElementNS(SVG_NS, 'line');
      xAxisLine.setAttribute('x1', area.x);
      xAxisLine.setAttribute('y1', area.y + area.height);
      xAxisLine.setAttribute('x2', area.x + area.width);
      xAxisLine.setAttribute('y2', area.y + area.height);
      xAxisLine.classList.add('battersea-graph__axis-line');
      svg.appendChild(xAxisLine);

      // X-axis tick labels
      ticks.ticks.forEach(function(tickVal) {
        var x = area.x + (tickVal / ticks.max) * area.width;
        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', x.toFixed(1));
        text.setAttribute('y', area.y + area.height + 20);
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('battersea-graph__tick-label');
        text.textContent = self.formatTickLabel(tickVal);
        svg.appendChild(text);
      });

      // Y-axis category labels
      var groupHeight = area.height / groupCount;
      this.labels.forEach(function(label, i) {
        var y = area.y + i * groupHeight + groupHeight / 2;
        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', area.x - 8);
        text.setAttribute('y', (y + 4).toFixed(1));
        text.setAttribute('text-anchor', 'end');
        text.classList.add('battersea-graph__tick-label');
        text.textContent = label;
        svg.appendChild(text);
      });

      // X-axis label
      if (this.xLabel) {
        var xLabelEl = document.createElementNS(SVG_NS, 'text');
        xLabelEl.setAttribute('x', (area.x + area.width / 2).toFixed(1));
        xLabelEl.setAttribute('y', area.y + area.height + 42);
        xLabelEl.setAttribute('text-anchor', 'middle');
        xLabelEl.classList.add('battersea-graph__axis-label');
        xLabelEl.textContent = this.xLabel;
        svg.appendChild(xLabelEl);
      }

      var barPadding = groupHeight * 0.15;
      var barHeight = groupHeight - barPadding * 2;
      var stackGap = this.stackGap;
      var barAnimations = [];

      for (var i = 0; i < groupCount; i++) {
        var cumulativeWidth = 0;

        for (var dsIndex = 0; dsIndex < this.datasets.length; dsIndex++) {
          var ds = this.datasets[dsIndex];
          var val = ds.values[i] || 0;
          var colour = self.getColour(dsIndex);
          var segmentWidth = (val / ticks.max) * area.width;

          // Apply gap: offset after the first segment, reduce width for gaps
          var gapOffset = dsIndex > 0 ? stackGap : 0;
          var drawWidth = Math.max(segmentWidth - gapOffset, 0);

          var x = area.x + cumulativeWidth + gapOffset;
          var y = area.y + i * groupHeight + barPadding;

          var rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('y', y.toFixed(1));
          rect.setAttribute('height', Math.max(barHeight, 1).toFixed(1));
          rect.setAttribute('fill', colour);
          rect.classList.add('battersea-graph__bar');

          // Round corners: apply to all segments when gap > 0, none when gap is 0
          if (self.barRadius > 0 && stackGap > 0) {
            rect.setAttribute('rx', self.barRadius);
          }

          if (self.animated) {
            rect.setAttribute('x', x.toFixed(1));
            rect.setAttribute('width', '0');
            barAnimations.push({
              rect: rect,
              targetWidth: drawWidth,
              startX: x,
              group: i,
              segment: dsIndex
            });
          } else {
            rect.setAttribute('x', x.toFixed(1));
            rect.setAttribute('width', Math.max(drawWidth, 0).toFixed(1));
          }
          svg.appendChild(self.wrapInLink(rect, i));

          if (self.tooltips) {
            (function(label, dsLabel, value, stackTotal) {
              self.events.push(Utils.addEvent(rect, 'mouseenter', function(e) {
                self.showTooltip(e, label, dsLabel + ': ' + self.formatNumber(value) + '<br>Total: ' + self.formatNumber(stackTotal));
              }));
              self.events.push(Utils.addEvent(rect, 'mouseleave', function() {
                self.hideTooltip();
              }));
            })(self.labels[i], ds.label, val, stackTotals[i]);
          }

          cumulativeWidth += segmentWidth;
        }
      }

      if (this.animated && barAnimations.length > 0) {
        var segmentCount = this.datasets.length;
        var totalDuration = this.getAnimationDuration();
        this._pendingAnimations.push(function() {
          self.animateStackedBars(barAnimations, segmentCount, totalDuration);
        });
      }
    }

    // ─── Donut Chart ────────────────────────

    renderDonut(svg, width, height) {
      var self = this;
      var values = this.datasets[0].values;
      var total = values.reduce(function(sum, v) { return sum + v; }, 0);
      if (total === 0) return;

      var cx = width / 2;
      var cy = height / 2;
      var outerRadius = Math.min(cx, cy) - 40;
      var innerRadius = Math.max(outerRadius - this.donutWidth, 0);
      var gap = this.pieGap;
      var cornerRadius = Math.min(this.pieRadius, (outerRadius - innerRadius) * 0.4);
      var startAngle = -Math.PI / 2;

      var sliceGroup = document.createElementNS(SVG_NS, 'g');
      sliceGroup.classList.add('battersea-graph__pie-group');
      svg.appendChild(sliceGroup);

      // Clip-path for clockwise sweep animation
      var clipArc = null;
      if (this.animated) {
        var clipId = 'graph-donut-clip-' + Math.random().toString(36).substr(2, 6);
        var defs = document.createElementNS(SVG_NS, 'defs');
        var clipPath = document.createElementNS(SVG_NS, 'clipPath');
        clipPath.setAttribute('id', clipId);

        clipArc = document.createElementNS(SVG_NS, 'path');
        clipArc.setAttribute('d', 'M ' + cx + ' ' + cy + ' Z');
        clipPath.appendChild(clipArc);
        defs.appendChild(clipPath);
        svg.appendChild(defs);
        sliceGroup.setAttribute('clip-path', 'url(#' + clipId + ')');
      }

      var halfGap = gap / 2;

      values.forEach(function(val, i) {
        var sliceAngle = (val / total) * Math.PI * 2;
        var colour = self.getColour(i);

        var d;
        if (gap > 0 && cornerRadius > 0 && sliceAngle < Math.PI * 2 - 0.01) {
          d = self.buildGappedRoundedDonutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, startAngle + sliceAngle, halfGap, cornerRadius);
        } else if (gap > 0) {
          d = self.buildGappedDonutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, startAngle + sliceAngle, halfGap);
        } else if (cornerRadius > 0 && sliceAngle < Math.PI * 2 - 0.01) {
          d = self.buildRoundedDonutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, startAngle + sliceAngle, cornerRadius);
        } else {
          d = self.buildDonutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, startAngle + sliceAngle);
        }

        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', colour);
        path.classList.add('battersea-graph__slice');

        if (self.pieStrokeWidth > 0) {
          path.setAttribute('stroke', self.pieStroke);
          path.setAttribute('stroke-width', self.pieStrokeWidth);
        }

        sliceGroup.appendChild(self.wrapInLink(path, i));

        if (self.tooltips) {
          var pct = Math.round((val / total) * 100);
          self.events.push(Utils.addEvent(path, 'mouseenter', function(e) {
            self.showTooltip(e, self.labels[i], self.formatNumber(val) + ' (' + pct + '%)');
          }));
          self.events.push(Utils.addEvent(path, 'mouseleave', function() {
            self.hideTooltip();
          }));
        }

        startAngle += sliceAngle;
      });

      // Centre label
      var labelText = '';
      if (this.donutLabelValue) {
        labelText = this.formatNumber(total);
      } else if (this.donutLabel) {
        labelText = this.donutLabel;
      }

      if (labelText) {
        var labelEl = document.createElementNS(SVG_NS, 'text');
        labelEl.setAttribute('x', cx.toFixed(1));
        labelEl.setAttribute('y', cy.toFixed(1));
        labelEl.setAttribute('text-anchor', 'middle');
        labelEl.setAttribute('dominant-baseline', 'central');
        labelEl.classList.add('battersea-graph__donut-label');
        labelEl.textContent = labelText;
        svg.appendChild(labelEl);
      }

      // Queue pie clockwise sweep animation
      if (this.animated && clipArc) {
        (function(arcEl, pieCx, pieCy, pieOuterRadius) {
          var duration = self.getAnimationDuration();
          var r = pieOuterRadius + 20;
          self._pendingAnimations.push(function() {
            var startTime = null;
            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var elapsed = timestamp - startTime;
              var progress = Math.min(elapsed / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              var angle = eased * Math.PI * 2;

              if (angle < 0.001) {
                arcEl.setAttribute('d', 'M ' + pieCx + ' ' + pieCy + ' Z');
              } else if (angle >= Math.PI * 2 - 0.001) {
                arcEl.setAttribute('d',
                  'M ' + (pieCx - r) + ' ' + (pieCy - r) +
                  ' h ' + (r * 2) + ' v ' + (r * 2) + ' h ' + (-(r * 2)) + ' Z'
                );
              } else {
                var startA = -Math.PI / 2;
                var endA = startA + angle;
                var x1 = pieCx + r * Math.cos(startA);
                var y1 = pieCy + r * Math.sin(startA);
                var x2 = pieCx + r * Math.cos(endA);
                var y2 = pieCy + r * Math.sin(endA);
                var largeArc = angle > Math.PI ? 1 : 0;

                arcEl.setAttribute('d',
                  'M ' + pieCx.toFixed(2) + ' ' + pieCy.toFixed(2) +
                  ' L ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
                  ' A ' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 ' + largeArc + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) +
                  ' Z'
                );
              }

              if (progress < 1) {
                requestAnimationFrame(step);
              }
            }
            requestAnimationFrame(step);
          });
        })(clipArc, cx, cy, outerRadius);
      }
    }

    // ─── Radial Bar Chart ───────────────────

    renderRadial(svg, width, height) {
      var self = this;
      var values = this.datasets[0].values;
      var barCount = this.labels.length;
      if (barCount === 0) return;

      var cx = width / 2;
      var cy = height / 2;
      var maxRadius = Math.min(cx, cy) - 40;
      var innerRadius = maxRadius * 0.15;
      var maxVal = Math.max.apply(null, values);
      var ticks = this.calculateNiceTicks(0, maxVal, 4);

      var angleStep = (2 * Math.PI) / barCount;
      var barAngleRatio = 0.7;
      var gapAngleRatio = 1 - barAngleRatio;
      var startOffset = (this.radialStart * Math.PI / 180) - Math.PI / 2;

      // Draw concentric grid circles
      if (this.radialGrid) {
        this.drawRadialGrid(svg, cx, cy, innerRadius, maxRadius, ticks);
      }

      // Collect bar animations
      var barAnimations = [];

      values.forEach(function(val, i) {
        var colour = self.getColour(i);
        var barStart = startOffset + i * angleStep + (angleStep * gapAngleRatio / 2);
        var barEnd = barStart + angleStep * barAngleRatio;
        var barRadius = innerRadius + ((val / ticks.max) * (maxRadius - innerRadius));

        var cornerRadius = self.pieRadius;
        var d;
        if (cornerRadius > 0) {
          d = self.buildRoundedDonutSlicePath(cx, cy, barRadius, innerRadius, barStart, barEnd, cornerRadius);
        } else {
          d = self.buildDonutSlicePath(cx, cy, barRadius, innerRadius, barStart, barEnd);
        }

        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', colour);
        path.classList.add('battersea-graph__radial-bar');

        if (self.animated) {
          // Start with zero-length bar (all at inner radius)
          var startD = self.buildDonutSlicePath(cx, cy, innerRadius + 0.5, innerRadius, barStart, barEnd);
          path.setAttribute('d', startD);
          barAnimations.push({
            path: path,
            barStart: barStart,
            barEnd: barEnd,
            targetRadius: barRadius,
            cornerRadius: cornerRadius,
            group: i
          });
        }

        svg.appendChild(self.wrapInLink(path, i));

        if (self.tooltips) {
          self.events.push(Utils.addEvent(path, 'mouseenter', function(e) {
            self.showTooltip(e, self.labels[i], self.formatNumber(val));
          }));
          self.events.push(Utils.addEvent(path, 'mouseleave', function() {
            self.hideTooltip();
          }));
        }

        // Draw label
        var labelAngle = (barStart + barEnd) / 2;
        var labelRadius;
        if (self.radialLabelPosition === 'outside') {
          labelRadius = maxRadius + 14;
        } else {
          labelRadius = barRadius + 10;
        }

        var lx = cx + labelRadius * Math.cos(labelAngle);
        var ly = cy + labelRadius * Math.sin(labelAngle);

        var textEl = document.createElementNS(SVG_NS, 'text');
        textEl.setAttribute('x', lx.toFixed(1));
        textEl.setAttribute('y', ly.toFixed(1));
        textEl.classList.add('battersea-graph__radial-label');

        // Adjust text-anchor based on angle
        var angleDeg = ((labelAngle * 180 / Math.PI) + 360) % 360;
        if (angleDeg > 90 && angleDeg < 270) {
          textEl.setAttribute('text-anchor', 'end');
        } else {
          textEl.setAttribute('text-anchor', 'start');
        }
        textEl.setAttribute('dominant-baseline', 'central');
        textEl.textContent = self.labels[i];
        svg.appendChild(textEl);
      });

      // Queue radial bar growth animation
      if (this.animated && barAnimations.length > 0) {
        var duration = this.getAnimationDuration();
        var stagger = barCount > 1 ? duration / barCount : 0;
        this._pendingAnimations.push(function() {
          barAnimations.forEach(function(bar) {
            var delay = bar.group * stagger;
            self.animateRadialBar(bar.path, cx, cy, innerRadius, bar.targetRadius, bar.barStart, bar.barEnd, duration, delay, bar.cornerRadius);
          });
        });
      }
    }

    // ─── Shared Drawing Helpers ────────────────

    drawGrid(svg, area, ticks, chartType) {
      var self = this;

      // Horizontal grid lines
      if (this.showHGrid) {
        ticks.ticks.forEach(function(tickVal) {
          var y = area.y + area.height - ((tickVal - ticks.min) / (ticks.max - ticks.min)) * area.height;
          var line = document.createElementNS(SVG_NS, 'line');
          line.setAttribute('x1', area.x);
          line.setAttribute('y1', y.toFixed(1));
          line.setAttribute('x2', area.x + area.width);
          line.setAttribute('y2', y.toFixed(1));
          line.classList.add('battersea-graph__grid-line');
          line.classList.add('battersea-graph__grid-line--h');
          svg.appendChild(line);
        });
      }

      // Vertical grid lines
      if (this.showVGrid) {
        var count = self.labels.length;
        self.labels.forEach(function(label, i) {
          var x;
          if (chartType === 'column' || chartType === 'stackedcolumn') {
            var groupWidth = area.width / count;
            x = area.x + i * groupWidth + groupWidth / 2;
          } else {
            var step = count > 1 ? area.width / (count - 1) : 0;
            x = area.x + i * step;
          }
          var line = document.createElementNS(SVG_NS, 'line');
          line.setAttribute('x1', x.toFixed(1));
          line.setAttribute('y1', area.y);
          line.setAttribute('x2', x.toFixed(1));
          line.setAttribute('y2', area.y + area.height);
          line.classList.add('battersea-graph__grid-line');
          line.classList.add('battersea-graph__grid-line--v');
          svg.appendChild(line);
        });
      }
    }

    drawYAxis(svg, area, ticks) {
      // Axis line
      var axisLine = document.createElementNS(SVG_NS, 'line');
      axisLine.setAttribute('x1', area.x);
      axisLine.setAttribute('y1', area.y);
      axisLine.setAttribute('x2', area.x);
      axisLine.setAttribute('y2', area.y + area.height);
      axisLine.classList.add('battersea-graph__axis-line');
      svg.appendChild(axisLine);

      // Tick labels
      var self = this;
      ticks.ticks.forEach(function(tickVal) {
        var y = area.y + area.height - ((tickVal - ticks.min) / (ticks.max - ticks.min)) * area.height;
        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', area.x - 8);
        text.setAttribute('y', (y + 4).toFixed(1));
        text.setAttribute('text-anchor', 'end');
        text.classList.add('battersea-graph__tick-label');
        text.textContent = self.formatTickLabel(tickVal);
        svg.appendChild(text);
      });

      // Y-axis label (rotated)
      if (this.yLabel) {
        var label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', -(area.y + area.height / 2));
        label.setAttribute('y', 16);
        label.setAttribute('transform', 'rotate(-90)');
        label.setAttribute('text-anchor', 'middle');
        label.classList.add('battersea-graph__axis-label');
        label.textContent = this.yLabel;
        svg.appendChild(label);
      }
    }

    drawXAxis(svg, area, chartType) {
      // Axis line
      var axisLine = document.createElementNS(SVG_NS, 'line');
      axisLine.setAttribute('x1', area.x);
      axisLine.setAttribute('y1', area.y + area.height);
      axisLine.setAttribute('x2', area.x + area.width);
      axisLine.setAttribute('y2', area.y + area.height);
      axisLine.classList.add('battersea-graph__axis-line');
      svg.appendChild(axisLine);

      var self = this;
      var count = self.labels.length;

      self.labels.forEach(function(label, i) {
        var x;
        if (chartType === 'column' || chartType === 'stackedcolumn') {
          var groupWidth = area.width / count;
          x = area.x + i * groupWidth + groupWidth / 2;
        } else {
          var step = count > 1 ? area.width / (count - 1) : 0;
          x = area.x + i * step;
        }

        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', x.toFixed(1));
        text.setAttribute('y', area.y + area.height + 20);
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('battersea-graph__tick-label');
        text.textContent = label;
        svg.appendChild(text);
      });

      // X-axis label
      if (this.xLabel) {
        var xLabelEl = document.createElementNS(SVG_NS, 'text');
        xLabelEl.setAttribute('x', (area.x + area.width / 2).toFixed(1));
        xLabelEl.setAttribute('y', area.y + area.height + 42);
        xLabelEl.setAttribute('text-anchor', 'middle');
        xLabelEl.classList.add('battersea-graph__axis-label');
        xLabelEl.textContent = this.xLabel;
        svg.appendChild(xLabelEl);
      }
    }

    drawTitle() {
      var titleEl = document.createElement('div');
      titleEl.className = 'battersea-graph__title';
      titleEl.textContent = this.title;
      this.wrapper.appendChild(titleEl);
    }

    drawLegend() {
      if (this.legendEl) {
        this.legendEl.remove();
      }

      this.legendEl = document.createElement('div');
      this.legendEl.className = 'battersea-graph__legend battersea-graph__legend--' + this.legendPosition;

      var self = this;
      var useLabelLegend = (this.type === 'pie' || this.type === 'donut' || this.type === 'radial');
      var items = useLabelLegend
        ? this.labels.map(function(label, i) { return { label: label, colour: self.getColour(i) }; })
        : this.datasets.map(function(ds, i) { return { label: ds.label, colour: self.getColour(i) }; });

      items.forEach(function(item) {
        var legendItem = document.createElement('span');
        legendItem.className = 'battersea-graph__legend-item';

        var swatch = document.createElement('span');
        swatch.className = 'battersea-graph__legend-swatch battersea-graph__legend-swatch--' + self.swatchShape;
        swatch.style.backgroundColor = item.colour;

        var label = document.createElement('span');
        label.className = 'battersea-graph__legend-label';
        label.textContent = item.label;

        legendItem.appendChild(swatch);
        legendItem.appendChild(label);
        self.legendEl.appendChild(legendItem);
      });

      this.wrapper.appendChild(this.legendEl);
    }

    // ─── Tooltip ───────────────────────────────

    showTooltip(event, label, value) {
      if (!this.tooltipEl) return;

      this.tooltipEl.innerHTML = '<strong>' + label + '</strong><br>' + value;
      this.tooltipEl.style.display = 'block';

      var containerRect = Utils.qs('.battersea-graph__svg-container', this.wrapper).getBoundingClientRect();
      var x = event.clientX - containerRect.left + 12;
      var y = event.clientY - containerRect.top - 10;

      // Prevent right overflow
      var tooltipWidth = this.tooltipEl.offsetWidth;
      if (x + tooltipWidth > containerRect.width) {
        x = x - tooltipWidth - 24;
      }

      this.tooltipEl.style.left = x + 'px';
      this.tooltipEl.style.top = y + 'px';
    }

    hideTooltip() {
      if (this.tooltipEl) {
        this.tooltipEl.style.display = 'none';
      }
    }

    // ─── Animation ─────────────────────────────

    animateLine(path) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.getBoundingClientRect();
      path.classList.add('battersea-graph__line--animated');
    }

    animateBar(rect, baseline, targetY, targetHeight, delay, customDuration) {
      var duration = customDuration || this.getAnimationDuration();

      function startAnimation() {
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic
          var eased = 1 - Math.pow(1 - progress, 3);

          var currentHeight = targetHeight * eased;
          var currentY = baseline - currentHeight;
          rect.setAttribute('y', currentY.toFixed(1));
          rect.setAttribute('height', currentHeight.toFixed(1));

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
      }

      if (delay > 0) {
        setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    }

    animateHorizontalBar(rect, targetWidth, duration, delay) {
      function startAnimation() {
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic
          var eased = 1 - Math.pow(1 - progress, 3);

          rect.setAttribute('width', (targetWidth * eased).toFixed(1));

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
      }

      if (delay > 0) {
        setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    }

    /**
     * Animate stacked column segments sequentially using a single timer.
     * One ease-in-out curve drives all segments smoothly.
     */
    animateStackedColumns(barAnimations, segmentCount, duration) {
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var rawProgress = Math.min(elapsed / duration, 1);

        // Single ease-in-out curve across the entire animation
        var eased = rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

        // Map eased progress to sequential segments
        var fillProgress = eased * segmentCount;

        barAnimations.forEach(function(bar) {
          var segFraction = Math.max(0, Math.min(1, fillProgress - bar.segment));
          var currentHeight = bar.targetHeight * segFraction;
          var currentY = bar.baseline - currentHeight;
          bar.rect.setAttribute('y', currentY.toFixed(1));
          bar.rect.setAttribute('height', currentHeight.toFixed(1));
        });

        if (rawProgress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    /**
     * Animate stacked bar (horizontal) segments sequentially using a single timer.
     */
    animateStackedBars(barAnimations, segmentCount, duration) {
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var rawProgress = Math.min(elapsed / duration, 1);

        // Single ease-in-out curve
        var eased = rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

        var fillProgress = eased * segmentCount;

        barAnimations.forEach(function(bar) {
          var segFraction = Math.max(0, Math.min(1, fillProgress - bar.segment));
          bar.rect.setAttribute('width', (bar.targetWidth * segFraction).toFixed(1));
        });

        if (rawProgress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    buildRoundedSlicePath(cx, cy, radius, startAngle, endAngle, cr) {
      var sliceAngle = endAngle - startAngle;

      // Limit corner radius to fit the slice
      var maxCr = Math.min(cr, radius * 0.4, radius * Math.sin(sliceAngle / 2) * 0.8);
      if (maxCr < 1) {
        // Too small for rounding — standard sharp path
        var px1 = cx + radius * Math.cos(startAngle);
        var py1 = cy + radius * Math.sin(startAngle);
        var px2 = cx + radius * Math.cos(endAngle);
        var py2 = cy + radius * Math.sin(endAngle);
        return [
          'M', cx.toFixed(2), cy.toFixed(2),
          'L', px1.toFixed(2), py1.toFixed(2),
          'A', radius.toFixed(2), radius.toFixed(2), 0, (sliceAngle > Math.PI ? 1 : 0), 1, px2.toFixed(2), py2.toFixed(2),
          'Z'
        ].join(' ');
      }

      // Outer corners: inset the arc start/end by the angular equivalent of maxCr
      var outerInset = maxCr / radius;

      // Inner corners: inset from centre along each edge
      var innerInset = maxCr;

      // Inner-start: point on start edge, maxCr from centre
      var isx = cx + innerInset * Math.cos(startAngle);
      var isy = cy + innerInset * Math.sin(startAngle);
      // Inner-end: point on end edge, maxCr from centre
      var iex = cx + innerInset * Math.cos(endAngle);
      var iey = cy + innerInset * Math.sin(endAngle);

      // Edge-start: point on start edge, maxCr from the outer rim
      var edgeDist = radius - maxCr;
      var esx = cx + edgeDist * Math.cos(startAngle);
      var esy = cy + edgeDist * Math.sin(startAngle);
      // Edge-end: point on end edge, maxCr from the outer rim
      var eex = cx + edgeDist * Math.cos(endAngle);
      var eey = cy + edgeDist * Math.sin(endAngle);

      // Outer arc, inset from sharp corners
      var oas = startAngle + outerInset;
      var oae = endAngle - outerInset;
      var osx = cx + radius * Math.cos(oas);
      var osy = cy + radius * Math.sin(oas);
      var oex = cx + radius * Math.cos(oae);
      var oey = cy + radius * Math.sin(oae);
      var largeArc = (oae - oas) > Math.PI ? 1 : 0;

      // Sharp corner positions (for the quadratic bezier control points)
      var scsx = cx + radius * Math.cos(startAngle);
      var scsy = cy + radius * Math.sin(startAngle);
      var scex = cx + radius * Math.cos(endAngle);
      var scey = cy + radius * Math.sin(endAngle);

      // Build path:
      // 1. Start at inner-start
      var d = 'M ' + isx.toFixed(2) + ' ' + isy.toFixed(2);
      // 2. Line along start edge to near outer rim
      d += ' L ' + esx.toFixed(2) + ' ' + esy.toFixed(2);
      // 3. Outer-start corner: Q curve (control = sharp corner, end = arc start)
      d += ' Q ' + scsx.toFixed(2) + ' ' + scsy.toFixed(2) + ' ' + osx.toFixed(2) + ' ' + osy.toFixed(2);
      // 4. Main outer arc
      d += ' A ' + radius.toFixed(2) + ' ' + radius.toFixed(2) + ' 0 ' + largeArc + ' 1 ' + oex.toFixed(2) + ' ' + oey.toFixed(2);
      // 5. Outer-end corner: Q curve (control = sharp corner, end = edge-end point)
      d += ' Q ' + scex.toFixed(2) + ' ' + scey.toFixed(2) + ' ' + eex.toFixed(2) + ' ' + eey.toFixed(2);
      // 6. Line back toward centre on end edge
      d += ' L ' + iex.toFixed(2) + ' ' + iey.toFixed(2);
      // 7. Inner corner: Q curve through the centre point
      d += ' Q ' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + isx.toFixed(2) + ' ' + isy.toFixed(2);
      d += ' Z';

      return d;
    }

    // ─── Gapped Pie Slice Helpers ────────────────

    /**
     * Build a pie slice with constant-width gaps between segments.
     * Each edge is offset perpendicular to the original radial by halfGap pixels,
     * producing parallel-shifted edges with a uniform gap width from centre to rim.
     */
    buildGappedSlicePath(cx, cy, radius, startAngle, endAngle, halfGap) {
      var sliceAngle = endAngle - startAngle;

      // Perpendicular offset for start edge (rotate +90°)
      var sNx = -Math.sin(startAngle);
      var sNy = Math.cos(startAngle);
      // Perpendicular offset for end edge (rotate -90°)
      var eNx = Math.sin(endAngle);
      var eNy = -Math.cos(endAngle);

      // Inner points (near centre, offset perpendicular)
      var isx = cx + sNx * halfGap;
      var isy = cy + sNy * halfGap;
      var iex = cx + eNx * halfGap;
      var iey = cy + eNy * halfGap;

      // Outer points (at rim, offset perpendicular)
      var osx = cx + radius * Math.cos(startAngle) + sNx * halfGap;
      var osy = cy + radius * Math.sin(startAngle) + sNy * halfGap;
      var oex = cx + radius * Math.cos(endAngle) + eNx * halfGap;
      var oey = cy + radius * Math.sin(endAngle) + eNy * halfGap;

      // Arc radius stays the same; the arc is between the two offset outer points
      var largeArc = sliceAngle > Math.PI ? 1 : 0;

      return [
        'M', isx.toFixed(2), isy.toFixed(2),
        'L', osx.toFixed(2), osy.toFixed(2),
        'A', radius.toFixed(2), radius.toFixed(2), 0, largeArc, 1, oex.toFixed(2), oey.toFixed(2),
        'L', iex.toFixed(2), iey.toFixed(2),
        'Z'
      ].join(' ');
    }

    /**
     * Gapped pie slice with rounded outer corners.
     * Same perpendicular offset as buildGappedSlicePath, with Q-curves at the
     * outer rim corners.
     */
    buildGappedRoundedSlicePath(cx, cy, radius, startAngle, endAngle, halfGap, cr) {
      var sliceAngle = endAngle - startAngle;

      // Limit corner radius
      var maxCr = Math.min(cr, radius * 0.4, radius * Math.sin(sliceAngle / 2) * 0.8);
      if (maxCr < 1) {
        return this.buildGappedSlicePath(cx, cy, radius, startAngle, endAngle, halfGap);
      }

      // Perpendicular offset vectors
      var sNx = -Math.sin(startAngle);
      var sNy = Math.cos(startAngle);
      var eNx = Math.sin(endAngle);
      var eNy = -Math.cos(endAngle);

      // Inner points (near centre, offset perpendicular + inset from centre by cr)
      var innerInset = maxCr;
      var isx = cx + innerInset * Math.cos(startAngle) + sNx * halfGap;
      var isy = cy + innerInset * Math.sin(startAngle) + sNy * halfGap;
      var iex = cx + innerInset * Math.cos(endAngle) + eNx * halfGap;
      var iey = cy + innerInset * Math.sin(endAngle) + eNy * halfGap;

      // Edge points near outer rim (inset by maxCr from rim)
      var edgeDist = radius - maxCr;
      var esx = cx + edgeDist * Math.cos(startAngle) + sNx * halfGap;
      var esy = cy + edgeDist * Math.sin(startAngle) + sNy * halfGap;
      var eex = cx + edgeDist * Math.cos(endAngle) + eNx * halfGap;
      var eey = cy + edgeDist * Math.sin(endAngle) + eNy * halfGap;

      // Sharp corner positions (Q-curve control points, offset perpendicular)
      var scsx = cx + radius * Math.cos(startAngle) + sNx * halfGap;
      var scsy = cy + radius * Math.sin(startAngle) + sNy * halfGap;
      var scex = cx + radius * Math.cos(endAngle) + eNx * halfGap;
      var scey = cy + radius * Math.sin(endAngle) + eNy * halfGap;

      // Outer arc inset points
      var outerInset = maxCr / radius;
      var oas = startAngle + outerInset;
      var oae = endAngle - outerInset;
      var osx = cx + radius * Math.cos(oas) + sNx * halfGap * Math.cos(outerInset) + eNx * halfGap * (1 - Math.cos(outerInset));
      var osy = cy + radius * Math.sin(oas) + sNy * halfGap * Math.cos(outerInset) + eNy * halfGap * (1 - Math.cos(outerInset));
      // Simpler: the arc inset points on the actual rim
      osx = cx + radius * Math.cos(oas);
      osy = cy + radius * Math.sin(oas);
      var oex2 = cx + radius * Math.cos(oae);
      var oey2 = cy + radius * Math.sin(oae);
      var largeArc = (oae - oas) > Math.PI ? 1 : 0;

      // Centre point (offset is the average of start and end offsets — for Q curve)
      var centreX = cx;
      var centreY = cy;

      // Build path
      var d = 'M ' + isx.toFixed(2) + ' ' + isy.toFixed(2);
      d += ' L ' + esx.toFixed(2) + ' ' + esy.toFixed(2);
      d += ' Q ' + scsx.toFixed(2) + ' ' + scsy.toFixed(2) + ' ' + osx.toFixed(2) + ' ' + osy.toFixed(2);
      d += ' A ' + radius.toFixed(2) + ' ' + radius.toFixed(2) + ' 0 ' + largeArc + ' 1 ' + oex2.toFixed(2) + ' ' + oey2.toFixed(2);
      d += ' Q ' + scex.toFixed(2) + ' ' + scey.toFixed(2) + ' ' + eex.toFixed(2) + ' ' + eey.toFixed(2);
      d += ' L ' + iex.toFixed(2) + ' ' + iey.toFixed(2);
      d += ' Q ' + centreX.toFixed(2) + ' ' + centreY.toFixed(2) + ' ' + isx.toFixed(2) + ' ' + isy.toFixed(2);
      d += ' Z';

      return d;
    }

    // ─── Donut Path Helpers ────────────────────

    buildDonutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle) {
      var sliceAngle = endAngle - startAngle;

      // Outer arc points
      var ox1 = cx + outerR * Math.cos(startAngle);
      var oy1 = cy + outerR * Math.sin(startAngle);
      var ox2 = cx + outerR * Math.cos(endAngle);
      var oy2 = cy + outerR * Math.sin(endAngle);

      // Inner arc points
      var ix1 = cx + innerR * Math.cos(startAngle);
      var iy1 = cy + innerR * Math.sin(startAngle);
      var ix2 = cx + innerR * Math.cos(endAngle);
      var iy2 = cy + innerR * Math.sin(endAngle);

      var largeArc = sliceAngle > Math.PI ? 1 : 0;

      // Full circle case
      if (sliceAngle >= Math.PI * 2 - 0.01) {
        // Two half-arcs for outer, two half-arcs for inner
        var omx = cx + outerR * Math.cos(startAngle + Math.PI);
        var omy = cy + outerR * Math.sin(startAngle + Math.PI);
        var imx = cx + innerR * Math.cos(startAngle + Math.PI);
        var imy = cy + innerR * Math.sin(startAngle + Math.PI);
        return [
          'M', ox1.toFixed(2), oy1.toFixed(2),
          'A', outerR.toFixed(2), outerR.toFixed(2), 0, 1, 1, omx.toFixed(2), omy.toFixed(2),
          'A', outerR.toFixed(2), outerR.toFixed(2), 0, 1, 1, ox1.toFixed(2), oy1.toFixed(2),
          'M', ix1.toFixed(2), iy1.toFixed(2),
          'A', innerR.toFixed(2), innerR.toFixed(2), 0, 1, 0, imx.toFixed(2), imy.toFixed(2),
          'A', innerR.toFixed(2), innerR.toFixed(2), 0, 1, 0, ix1.toFixed(2), iy1.toFixed(2),
          'Z'
        ].join(' ');
      }

      return [
        'M', ox1.toFixed(2), oy1.toFixed(2),
        'A', outerR.toFixed(2), outerR.toFixed(2), 0, largeArc, 1, ox2.toFixed(2), oy2.toFixed(2),
        'L', ix2.toFixed(2), iy2.toFixed(2),
        'A', innerR.toFixed(2), innerR.toFixed(2), 0, largeArc, 0, ix1.toFixed(2), iy1.toFixed(2),
        'Z'
      ].join(' ');
    }

    buildRoundedDonutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle, cr) {
      var sliceAngle = endAngle - startAngle;
      var ringWidth = outerR - innerR;

      // Use midpoint radius for consistent angular inset on both rims
      var midR = (outerR + innerR) / 2;
      var maxCr = Math.min(cr, ringWidth * 0.4, midR * Math.sin(sliceAngle / 2) * 0.8);
      if (maxCr < 1) {
        return this.buildDonutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle);
      }

      // Use a single angular inset based on midpoint radius for symmetry
      var angularInset = maxCr / midR;
      var outerInset = angularInset;
      var innerInset = innerR > 0 ? angularInset : 0;

      // Outer arc inset points
      var oas = startAngle + outerInset;
      var oae = endAngle - outerInset;
      var osx = cx + outerR * Math.cos(oas);
      var osy = cy + outerR * Math.sin(oas);
      var oex = cx + outerR * Math.cos(oae);
      var oey = cy + outerR * Math.sin(oae);
      var outerLargeArc = (oae - oas) > Math.PI ? 1 : 0;

      // Inner arc inset points (reverse direction)
      var ias = endAngle - innerInset;
      var iae = startAngle + innerInset;
      var isx = cx + innerR * Math.cos(ias);
      var isy = cy + innerR * Math.sin(ias);
      var iex = cx + innerR * Math.cos(iae);
      var iey = cy + innerR * Math.sin(iae);
      var innerLargeArc = (ias - iae) > Math.PI ? 1 : 0;

      // Edge points near outer rim (start and end edges)
      var edgeOuterDist = outerR - maxCr;
      var eOsx = cx + edgeOuterDist * Math.cos(startAngle);
      var eOsy = cy + edgeOuterDist * Math.sin(startAngle);
      var eOex = cx + edgeOuterDist * Math.cos(endAngle);
      var eOey = cy + edgeOuterDist * Math.sin(endAngle);

      // Edge points near inner rim (start and end edges)
      var edgeInnerDist = innerR + maxCr;
      var eIsx = cx + edgeInnerDist * Math.cos(startAngle);
      var eIsy = cy + edgeInnerDist * Math.sin(startAngle);
      var eIex = cx + edgeInnerDist * Math.cos(endAngle);
      var eIey = cy + edgeInnerDist * Math.sin(endAngle);

      // Sharp corner positions (control points for Q curves)
      var scOsx = cx + outerR * Math.cos(startAngle);
      var scOsy = cy + outerR * Math.sin(startAngle);
      var scOex = cx + outerR * Math.cos(endAngle);
      var scOey = cy + outerR * Math.sin(endAngle);
      var scIsx = cx + innerR * Math.cos(startAngle);
      var scIsy = cy + innerR * Math.sin(startAngle);
      var scIex = cx + innerR * Math.cos(endAngle);
      var scIey = cy + innerR * Math.sin(endAngle);

      // Build path
      var d = 'M ' + eIsx.toFixed(2) + ' ' + eIsy.toFixed(2);
      // Start edge: line from near inner to near outer
      d += ' L ' + eOsx.toFixed(2) + ' ' + eOsy.toFixed(2);
      // Outer-start corner: Q curve
      d += ' Q ' + scOsx.toFixed(2) + ' ' + scOsy.toFixed(2) + ' ' + osx.toFixed(2) + ' ' + osy.toFixed(2);
      // Main outer arc
      d += ' A ' + outerR.toFixed(2) + ' ' + outerR.toFixed(2) + ' 0 ' + outerLargeArc + ' 1 ' + oex.toFixed(2) + ' ' + oey.toFixed(2);
      // Outer-end corner: Q curve
      d += ' Q ' + scOex.toFixed(2) + ' ' + scOey.toFixed(2) + ' ' + eOex.toFixed(2) + ' ' + eOey.toFixed(2);
      // End edge: line from near outer to near inner
      d += ' L ' + eIex.toFixed(2) + ' ' + eIey.toFixed(2);
      // Inner-end corner: Q curve
      d += ' Q ' + scIex.toFixed(2) + ' ' + scIey.toFixed(2) + ' ' + isx.toFixed(2) + ' ' + isy.toFixed(2);
      // Main inner arc (reverse direction)
      d += ' A ' + innerR.toFixed(2) + ' ' + innerR.toFixed(2) + ' 0 ' + innerLargeArc + ' 0 ' + iex.toFixed(2) + ' ' + iey.toFixed(2);
      // Inner-start corner: Q curve
      d += ' Q ' + scIsx.toFixed(2) + ' ' + scIsy.toFixed(2) + ' ' + eIsx.toFixed(2) + ' ' + eIsy.toFixed(2);
      d += ' Z';

      return d;
    }

    // ─── Gapped Donut Slice Helpers ────────────

    /**
     * Donut slice with constant-width gaps. Each radial edge is offset
     * perpendicular by halfGap pixels, producing a uniform gap from
     * inner to outer rim.
     */
    buildGappedDonutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle, halfGap) {
      var sliceAngle = endAngle - startAngle;

      // Perpendicular offset vectors
      var sNx = -Math.sin(startAngle);
      var sNy = Math.cos(startAngle);
      var eNx = Math.sin(endAngle);
      var eNy = -Math.cos(endAngle);

      // Outer arc points (offset perpendicular)
      var ox1 = cx + outerR * Math.cos(startAngle) + sNx * halfGap;
      var oy1 = cy + outerR * Math.sin(startAngle) + sNy * halfGap;
      var ox2 = cx + outerR * Math.cos(endAngle) + eNx * halfGap;
      var oy2 = cy + outerR * Math.sin(endAngle) + eNy * halfGap;

      // Inner arc points (offset perpendicular)
      var ix1 = cx + innerR * Math.cos(startAngle) + sNx * halfGap;
      var iy1 = cy + innerR * Math.sin(startAngle) + sNy * halfGap;
      var ix2 = cx + innerR * Math.cos(endAngle) + eNx * halfGap;
      var iy2 = cy + innerR * Math.sin(endAngle) + eNy * halfGap;

      var largeArc = sliceAngle > Math.PI ? 1 : 0;

      return [
        'M', ox1.toFixed(2), oy1.toFixed(2),
        'A', outerR.toFixed(2), outerR.toFixed(2), 0, largeArc, 1, ox2.toFixed(2), oy2.toFixed(2),
        'L', ix2.toFixed(2), iy2.toFixed(2),
        'A', innerR.toFixed(2), innerR.toFixed(2), 0, largeArc, 0, ix1.toFixed(2), iy1.toFixed(2),
        'Z'
      ].join(' ');
    }

    /**
     * Gapped donut slice with rounded corners at all four corners.
     */
    buildGappedRoundedDonutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle, halfGap, cr) {
      var sliceAngle = endAngle - startAngle;
      var ringWidth = outerR - innerR;

      var midR = (outerR + innerR) / 2;
      var maxCr = Math.min(cr, ringWidth * 0.4, midR * Math.sin(sliceAngle / 2) * 0.8);
      if (maxCr < 1) {
        return this.buildGappedDonutSlicePath(cx, cy, outerR, innerR, startAngle, endAngle, halfGap);
      }

      // Perpendicular offset vectors
      var sNx = -Math.sin(startAngle);
      var sNy = Math.cos(startAngle);
      var eNx = Math.sin(endAngle);
      var eNy = -Math.cos(endAngle);

      // Angular insets for the rounded arc portions
      var angularInset = maxCr / midR;

      // Outer arc inset points (on the actual rim, inset angularly)
      var oas = startAngle + angularInset;
      var oae = endAngle - angularInset;
      var osx = cx + outerR * Math.cos(oas);
      var osy = cy + outerR * Math.sin(oas);
      var oex = cx + outerR * Math.cos(oae);
      var oey = cy + outerR * Math.sin(oae);
      var outerLargeArc = (oae - oas) > Math.PI ? 1 : 0;

      // Inner arc inset points (reverse direction)
      var ias = endAngle - angularInset;
      var iae = startAngle + angularInset;
      var isx = cx + innerR * Math.cos(ias);
      var isy = cy + innerR * Math.sin(ias);
      var iex = cx + innerR * Math.cos(iae);
      var iey = cy + innerR * Math.sin(iae);
      var innerLargeArc = (ias - iae) > Math.PI ? 1 : 0;

      // Edge points near outer rim (offset perpendicular)
      var edgeOuterDist = outerR - maxCr;
      var eOsx = cx + edgeOuterDist * Math.cos(startAngle) + sNx * halfGap;
      var eOsy = cy + edgeOuterDist * Math.sin(startAngle) + sNy * halfGap;
      var eOex = cx + edgeOuterDist * Math.cos(endAngle) + eNx * halfGap;
      var eOey = cy + edgeOuterDist * Math.sin(endAngle) + eNy * halfGap;

      // Edge points near inner rim (offset perpendicular)
      var edgeInnerDist = innerR + maxCr;
      var eIsx = cx + edgeInnerDist * Math.cos(startAngle) + sNx * halfGap;
      var eIsy = cy + edgeInnerDist * Math.sin(startAngle) + sNy * halfGap;
      var eIex = cx + edgeInnerDist * Math.cos(endAngle) + eNx * halfGap;
      var eIey = cy + edgeInnerDist * Math.sin(endAngle) + eNy * halfGap;

      // Sharp corner control points (offset perpendicular)
      var scOsx = cx + outerR * Math.cos(startAngle) + sNx * halfGap;
      var scOsy = cy + outerR * Math.sin(startAngle) + sNy * halfGap;
      var scOex = cx + outerR * Math.cos(endAngle) + eNx * halfGap;
      var scOey = cy + outerR * Math.sin(endAngle) + eNy * halfGap;
      var scIsx = cx + innerR * Math.cos(startAngle) + sNx * halfGap;
      var scIsy = cy + innerR * Math.sin(startAngle) + sNy * halfGap;
      var scIex = cx + innerR * Math.cos(endAngle) + eNx * halfGap;
      var scIey = cy + innerR * Math.sin(endAngle) + eNy * halfGap;

      // Build path
      var d = 'M ' + eIsx.toFixed(2) + ' ' + eIsy.toFixed(2);
      d += ' L ' + eOsx.toFixed(2) + ' ' + eOsy.toFixed(2);
      d += ' Q ' + scOsx.toFixed(2) + ' ' + scOsy.toFixed(2) + ' ' + osx.toFixed(2) + ' ' + osy.toFixed(2);
      d += ' A ' + outerR.toFixed(2) + ' ' + outerR.toFixed(2) + ' 0 ' + outerLargeArc + ' 1 ' + oex.toFixed(2) + ' ' + oey.toFixed(2);
      d += ' Q ' + scOex.toFixed(2) + ' ' + scOey.toFixed(2) + ' ' + eOex.toFixed(2) + ' ' + eOey.toFixed(2);
      d += ' L ' + eIex.toFixed(2) + ' ' + eIey.toFixed(2);
      d += ' Q ' + scIex.toFixed(2) + ' ' + scIey.toFixed(2) + ' ' + isx.toFixed(2) + ' ' + isy.toFixed(2);
      d += ' A ' + innerR.toFixed(2) + ' ' + innerR.toFixed(2) + ' 0 ' + innerLargeArc + ' 0 ' + iex.toFixed(2) + ' ' + iey.toFixed(2);
      d += ' Q ' + scIsx.toFixed(2) + ' ' + scIsy.toFixed(2) + ' ' + eIsx.toFixed(2) + ' ' + eIsy.toFixed(2);
      d += ' Z';

      return d;
    }

    // ─── Radial Helpers ─────────────────────────

    drawRadialGrid(svg, cx, cy, innerRadius, maxRadius, ticks) {
      var self = this;
      ticks.ticks.forEach(function(tickVal) {
        if (tickVal === 0) return;
        var r = innerRadius + ((tickVal / ticks.max) * (maxRadius - innerRadius));
        var circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', cx.toFixed(1));
        circle.setAttribute('cy', cy.toFixed(1));
        circle.setAttribute('r', r.toFixed(1));
        circle.classList.add('battersea-graph__grid-circle');
        svg.appendChild(circle);

        // Tick label at 12 o'clock position
        var labelY = cy - r - 4;
        var text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('x', cx.toFixed(1));
        text.setAttribute('y', labelY.toFixed(1));
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('battersea-graph__radial-tick-label');
        text.textContent = self.formatTickLabel(tickVal);
        svg.appendChild(text);
      });
    }

    animateRadialBar(path, cx, cy, innerRadius, targetRadius, barStart, barEnd, duration, delay, cornerRadius) {
      var self = this;
      var cr = cornerRadius || 0;

      function startAnimation() {
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);

          var currentRadius = innerRadius + (targetRadius - innerRadius) * eased;
          var d;
          if (cr > 0 && currentRadius - innerRadius > cr * 2) {
            d = self.buildRoundedDonutSlicePath(cx, cy, currentRadius, innerRadius, barStart, barEnd, cr);
          } else {
            d = self.buildDonutSlicePath(cx, cy, currentRadius, innerRadius, barStart, barEnd);
          }
          path.setAttribute('d', d);

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
      }

      if (delay > 0) {
        setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    }

    // ─── Utilities ─────────────────────────────

    buildSmoothPath(points) {
      if (points.length < 2) {
        return 'M' + points[0].x.toFixed(1) + ',' + points[0].y.toFixed(1);
      }

      var d = 'M' + points[0].x.toFixed(1) + ',' + points[0].y.toFixed(1);

      for (var i = 0; i < points.length - 1; i++) {
        var p0 = points[i === 0 ? 0 : i - 1];
        var p1 = points[i];
        var p2 = points[i + 1];
        var p3 = points[i + 2 < points.length ? i + 2 : i + 1];

        // Catmull-Rom to cubic bezier conversion
        var tension = 0.3;
        var cp1x = p1.x + (p2.x - p0.x) * tension;
        var cp1y = p1.y + (p2.y - p0.y) * tension;
        var cp2x = p2.x - (p3.x - p1.x) * tension;
        var cp2y = p2.y - (p3.y - p1.y) * tension;

        d += ' C' + cp1x.toFixed(1) + ',' + cp1y.toFixed(1) +
             ' ' + cp2x.toFixed(1) + ',' + cp2y.toFixed(1) +
             ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
      }

      return d;
    }

    getAnimationDuration() {
      var style = getComputedStyle(this.wrapper);
      var val = style.getPropertyValue('--graph-animation-duration').trim();
      if (val.endsWith('ms')) return parseFloat(val);
      if (val.endsWith('s')) return parseFloat(val) * 1000;
      return 1000;
    }

    calculateNiceTicks(min, max, desiredCount) {
      if (min === max) { max = min + 1; }
      if (min > 0) min = 0;

      var range = max - min;
      var roughStep = range / desiredCount;
      var magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
      var residual = roughStep / magnitude;

      var niceStep;
      if (residual <= 1.5) niceStep = magnitude;
      else if (residual <= 3) niceStep = 2 * magnitude;
      else if (residual <= 7) niceStep = 5 * magnitude;
      else niceStep = 10 * magnitude;

      var niceMin = Math.floor(min / niceStep) * niceStep;
      var niceMax = Math.ceil(max / niceStep) * niceStep;

      if (niceMin > 0) niceMin = 0;

      var ticks = [];
      for (var v = niceMin; v <= niceMax + niceStep * 0.001; v += niceStep) {
        ticks.push(Math.round(v * 1000) / 1000);
      }

      return { min: niceMin, max: niceMax, step: niceStep, ticks: ticks };
    }

    wrapInLink(svgElement, labelIndex) {
      var link = this.links[labelIndex];
      if (!link || !link.url) return svgElement;

      var a = document.createElementNS(SVG_NS, 'a');
      a.setAttribute('href', link.url);
      if (link.target && link.target !== '_self') {
        a.setAttribute('target', link.target);
      }
      a.setAttribute('aria-label', this.labels[labelIndex] || '');
      a.style.cursor = 'pointer';
      a.appendChild(svgElement);
      return a;
    }

    getColour(index) {
      var palette = this.colours.length > 0 ? this.colours : this.defaultColours;
      return palette[index % palette.length];
    }

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }

    formatTickLabel(num) {
      if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }

    onResize() {
      this.events.forEach(function(event) {
        event.remove();
      });
      this.events = [];
      this.events.push(Utils.addEvent(window, 'resize', this._debouncedResize));
      // On resize after animation has played, render without animation start states
      var wasAnimated = this.animated;
      if (this._hasAnimated) {
        this.animated = false;
      }
      this.render();
      this.animated = wasAnimated;
    }
  }

  window.Battersea.register('graph', Graph, '[data-graph]');

})(window, document);
