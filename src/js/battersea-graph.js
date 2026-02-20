/**
 * Battersea Library - Graph Component
 * Version: 2.20.0
 *
 * SVG chart rendering with line, column, and pie graph types.
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

      // Pie options
      this.pieGap = Utils.parseInt(Utils.getData(el, 'graph-pie-gap'), 0);
      this.pieRadius = Utils.parseInt(Utils.getData(el, 'graph-pie-radius'), 0);
      this.pieStroke = Utils.getData(el, 'graph-pie-stroke') || '#fff';
      this.pieStrokeWidth = Utils.parseFloat(Utils.getData(el, 'graph-pie-stroke-width'), 2);

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

      // DOM references
      this.wrapper = null;
      this.svgEl = null;
      this.tooltipEl = null;
      this.legendEl = null;

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

      // Render the chart
      this.render();

      // Legend (bottom, left, right — placed after SVG)
      if (this.showLegend && this.legendPosition !== 'top') {
        this.drawLegend();
      }

      // Resize listener
      this.events.push(Utils.addEvent(window, 'resize', this._debouncedResize));

      // Dispatch ready event
      this.el.dispatchEvent(new CustomEvent('battersea:graphReady', {
        bubbles: true,
        detail: { type: this.type, labels: this.labels.length, datasets: this.datasets.length }
      }));
    }

    destroy() {
      this.events.forEach(function(event) { event.remove(); });
      this.events = [];

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
      try {
        var data = JSON.parse(jsonStr);
        this.labels = data.labels || [];
        this.datasets = (data.datasets || []).map(function(ds) {
          return { label: ds.label || '', values: ds.values || [] };
        });
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

      // First column = labels, remaining columns = datasets
      this.labels = [];
      this.datasets = [];

      for (var h = 1; h < headers.length; h++) {
        this.datasets.push({ label: headers[h], values: [] });
      }

      for (var r = 1; r < lines.length; r++) {
        var fields = splitLine(lines[r]);
        if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) continue;
        this.labels.push(fields[0]);
        for (var d = 0; d < this.datasets.length; d++) {
          this.datasets[d].values.push(parseFloat(fields[d + 1]) || 0);
        }
      }
    }

    // ─── Rendering ─────────────────────────────

    render() {
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
        case 'pie':
          this.renderPie(this.svgEl, width, height);
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
      var padding = {
        top: 15,
        right: 20,
        bottom: 40 + (this.xLabel ? 25 : 0),
        left: 55 + (this.yLabel ? 25 : 0)
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

        if (self.animated) {
          self.animateLine(path);
        }

        // Data points
        points.forEach(function(p, pi) {
          var circle = document.createElementNS(SVG_NS, 'circle');
          circle.setAttribute('cx', p.x.toFixed(1));
          circle.setAttribute('cy', p.y.toFixed(1));
          circle.setAttribute('r', '4');
          circle.setAttribute('fill', colour);
          circle.setAttribute('stroke', '#fff');
          circle.setAttribute('stroke-width', '2');
          circle.classList.add('battersea-graph__point');

          // Animated markers fade in after line draws
          if (self.animated) {
            circle.classList.add('battersea-graph__point--hidden');
            var delay = self.getAnimationDuration() + (pi * 60);
            setTimeout(function() {
              circle.classList.remove('battersea-graph__point--hidden');
              circle.classList.add('battersea-graph__point--visible');
            }, delay);
          }

          svg.appendChild(circle);

          if (self.tooltips) {
            self.events.push(Utils.addEvent(circle, 'mouseenter', function(e) {
              self.showTooltip(e, p.label, p.dsLabel + ': ' + self.formatNumber(p.value));
            }));
            self.events.push(Utils.addEvent(circle, 'mouseleave', function() {
              self.hideTooltip();
            }));
          }
        });
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
            // Animate bars growing from baseline using JS animation
            rect.setAttribute('y', (area.y + area.height).toFixed(1));
            rect.setAttribute('height', '0');
            svg.appendChild(rect);
            self.animateBar(rect, area.y + area.height, y, barHeight);
          } else {
            rect.setAttribute('y', y.toFixed(1));
            rect.setAttribute('height', barHeight.toFixed(1));
            svg.appendChild(rect);
          }

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

      // For clockwise wipe animation, use a clip-path
      if (this.animated) {
        var clipId = 'graph-pie-clip-' + Math.random().toString(36).substr(2, 6);
        var defs = document.createElementNS(SVG_NS, 'defs');
        var clipPath = document.createElementNS(SVG_NS, 'clipPath');
        clipPath.setAttribute('id', clipId);

        var clipCircle = document.createElementNS(SVG_NS, 'circle');
        clipCircle.setAttribute('cx', cx);
        clipCircle.setAttribute('cy', cy);
        clipCircle.setAttribute('r', radius + 10);
        clipCircle.setAttribute('fill', 'none');
        clipCircle.setAttribute('stroke', '#000');
        clipCircle.setAttribute('stroke-width', (radius + 10) * 2);
        var circumference = 2 * Math.PI * (radius + 10);
        clipCircle.style.strokeDasharray = circumference;
        clipCircle.style.strokeDashoffset = circumference;
        clipCircle.setAttribute('transform', 'rotate(-90 ' + cx + ' ' + cy + ')');
        clipCircle.getBoundingClientRect();
        clipCircle.classList.add('battersea-graph__pie-clip');

        clipPath.appendChild(clipCircle);
        defs.appendChild(clipPath);
        svg.appendChild(defs);
        sliceGroup.setAttribute('clip-path', 'url(#' + clipId + ')');
      }

      values.forEach(function(val, i) {
        var sliceAngle = (val / total) * Math.PI * 2;
        var colour = self.getColour(i);

        // Consistent gap: translate each slice outward along its bisector
        var midAngle = startAngle + sliceAngle / 2;
        var tx = gap > 0 ? Math.cos(midAngle) * (gap / 2) : 0;
        var ty = gap > 0 ? Math.sin(midAngle) * (gap / 2) : 0;

        // Build the slice path
        var d;
        if (cornerRadius > 0 && sliceAngle < Math.PI * 2 - 0.01) {
          d = self.buildRoundedSlicePath(cx, cy, radius, startAngle, startAngle + sliceAngle, cornerRadius);
        } else {
          // Standard sharp-cornered slice
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

        // Apply gap translation
        if (gap > 0) {
          path.setAttribute('transform', 'translate(' + tx.toFixed(2) + ',' + ty.toFixed(2) + ')');
        }

        // Stroke / outline config
        if (self.pieStrokeWidth > 0) {
          path.setAttribute('stroke', self.pieStroke);
          path.setAttribute('stroke-width', self.pieStrokeWidth);
        }

        sliceGroup.appendChild(path);

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
          if (chartType === 'column') {
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
        if (chartType === 'column') {
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
      var items = this.type === 'pie'
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

    animateBar(rect, baseline, targetY, targetHeight) {
      var duration = this.getAnimationDuration();
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
      this.render();
    }
  }

  window.Battersea.register('graph', Graph, '[data-graph]');

})(window, document);
