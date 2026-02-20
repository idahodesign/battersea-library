# Battersea Library - Graph Component Documentation

## Added in v2.20.0

---

## Graph

**New in v2.20.0** - SVG charts with line, column, bar (horizontal), and pie types. Supports inline JSON, external JSON files, and CSV files as data sources.

### Features
- **Four chart types** - Line, column, bar (horizontal), and pie, set with a single data attribute
- **Flexible data sources** - Inline JSON, JSON file URL, or CSV file
- **Smooth lines** - Optional cubic bezier interpolation for line charts (Catmull-Rom splines)
- **Animated drawing** - Lines draw left-to-right, columns grow from baseline, bars extend from left, pie sweeps clockwise
- **Scroll-triggered** - Animations deferred until the chart scrolls into view via IntersectionObserver
- **Sequential stagger** - Column bars animate left-to-right, bar chart top-to-bottom, line markers appear as the line reaches them
- **Tooltips** - Hover tooltips show label and value, positioned to stay within the container
- **Configurable legend** - Place at bottom, top, left, or right with square or circle swatches
- **Pie options** - Gap between segments, rounded corners, configurable stroke outline
- **Custom colours** - Override the built-in palette with a comma-separated list of hex values
- **Grid lines** - Independent horizontal and vertical grid lines with CSS-customisable style
- **Axis labels** - Optional x-axis and y-axis labels
- **Responsive** - Charts redraw on window resize; SVG viewBox scales to any container width
- **Themeable** - CSS custom properties for all visual elements

### HTML Structure

```html
<!-- Line Chart (inline JSON) -->
<div data-graph
  data-graph-type="line"
  data-graph-smooth="true"
  data-graph-animated="true"
  data-graph-tooltips="true"
  data-graph-legend="true"
  data-graph-height="350"
  data-graph-x-label="Month"
  data-graph-y-label="Revenue (GBP)"
  data-graph-data='{"labels":["Jan","Feb","Mar","Apr","May","Jun"],
    "datasets":[{"label":"Sales","values":[1200,1800,1400,2200,1900,2600]}]}'>
</div>

<!-- Column Chart (JSON file) -->
<div data-graph
  data-graph-type="column"
  data-graph-data="data/sales.json"
  data-graph-animated="true"
  data-graph-legend="true"
  data-graph-bar-radius="6">
</div>

<!-- Column Chart (CSV file) -->
<div data-graph
  data-graph-type="column"
  data-graph-csv="data/sales.csv"
  data-graph-animated="true"
  data-graph-legend="true"
  data-graph-grid-v="true">
</div>

<!-- Bar Chart (horizontal) -->
<div data-graph
  data-graph-type="bar"
  data-graph-animated="true"
  data-graph-tooltips="true"
  data-graph-legend="true"
  data-graph-bar-radius="4"
  data-graph-height="350"
  data-graph-title="Programming Languages"
  data-graph-data='{"labels":["JavaScript","Python","Java","TypeScript","C#"],
    "datasets":[{"label":"Popularity","values":[65,52,35,28,22]}]}'>
</div>

<!-- Pie Chart -->
<div data-graph
  data-graph-type="pie"
  data-graph-title="Market Share"
  data-graph-animated="true"
  data-graph-legend="true"
  data-graph-legend-position="right"
  data-graph-swatch-shape="circle"
  data-graph-pie-gap="4"
  data-graph-pie-radius="4"
  data-graph-data='{"labels":["Chrome","Safari","Firefox","Edge","Other"],
    "datasets":[{"label":"Share","values":[65,18,8,5,4]}]}'>
</div>
```

### Data Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-graph` | - | required | Initialises the Graph component |
| `data-graph-type` | `line` / `column` / `bar` / `pie` | `line` | The type of chart to render |
| `data-graph-data` | JSON object or URL | - | Inline JSON data or a URL to a JSON file |
| `data-graph-csv` | URL | - | Path to a CSV file. First column = labels, remaining = data series |
| `data-graph-height` | Number (px) | `400` | Height of the chart area in pixels |
| `data-graph-title` | String | - | Title shown above the chart |
| `data-graph-animated` | `true` / `false` | `false` | Animate the chart when it scrolls into view |
| `data-graph-animation-delay` | Milliseconds | `300` | Delay before animation starts after the chart becomes visible |
| `data-graph-tooltips` | `true` / `false` | `true` | Show tooltips on hover |
| `data-graph-legend` | `true` / `false` | `true` | Show the chart legend |
| `data-graph-legend-position` | `bottom` / `top` / `left` / `right` | `bottom` | Where to place the legend |
| `data-graph-x-label` | String | - | Label for the x-axis |
| `data-graph-y-label` | String | - | Label for the y-axis |
| `data-graph-colours` | Comma-separated hex values | Built-in palette | Custom colour palette for data series |
| `data-graph-swatch-shape` | `square` / `circle` | `square` | Shape of legend colour swatches |
| `data-graph-smooth` | `true` / `false` | `false` | Use smooth cubic bezier curves for line charts |
| `data-graph-bar-radius` | Number (px) | `2` | Corner radius on column/bar rectangles |
| `data-graph-grid-h` | `true` / `false` | `true` | Show horizontal grid lines |
| `data-graph-grid-v` | `true` / `false` | `false` | Show vertical grid lines |
| `data-graph-pie-gap` | Number (px) | `0` | Gap between pie segments |
| `data-graph-pie-radius` | Number (px) | `0` | Corner radius on pie segment edges |
| `data-graph-pie-stroke` | CSS colour | `#fff` | Outline colour between pie segments |
| `data-graph-pie-stroke-width` | Number | `2` | Outline thickness. Set to 0 to remove outlines |

### Data Formats

**JSON structure** (inline or file):

```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr"],
  "datasets": [
    { "label": "Revenue", "values": [42000, 51000, 47000, 63000] },
    { "label": "Expenses", "values": [28000, 31000, 29000, 35000] }
  ]
}
```

**CSV structure** (first row = headers, first column = labels):

```
Quarter,Revenue,Expenses,Profit
Q1 2025,42000,28000,14000
Q2 2025,51000,31000,20000
Q3 2025,47000,29000,18000
Q4 2025,63000,35000,28000
```

### Chart Type Behaviour

**Line** (`data-graph-type="line"`):
- Plots data points connected by straight lines or smooth curves (`data-graph-smooth="true"`)
- Markers at each data point with hover tooltips
- Animation: line draws left-to-right, markers fade in sequentially as the line reaches them
- Supports multiple datasets (multi-series)

**Column** (`data-graph-type="column"`):
- Vertical bars grouped by label, with multiple series shown side by side
- Animation: bars grow upward from the baseline, staggered left-to-right by group
- Corner radius via `data-graph-bar-radius`

**Bar** (`data-graph-type="bar"`):
- Horizontal bars, ideal for categories with long labels
- Category labels shown on the y-axis, values on the x-axis
- Animation: bars extend from left, staggered top-to-bottom
- Corner radius via `data-graph-bar-radius`

**Pie** (`data-graph-type="pie"`):
- Single dataset only; labels become segment names
- Animation: clockwise sweep reveal from 12 o'clock
- Gap between segments via `data-graph-pie-gap` (translates slices outward along bisector for uniform parallel-sided gaps)
- Rounded corners via `data-graph-pie-radius` (quadratic bezier curves)
- Configurable outline via `data-graph-pie-stroke` and `data-graph-pie-stroke-width`

### Animation

When `data-graph-animated="true"` is set:

1. Elements are rendered in their hidden/zero state on page load
2. An IntersectionObserver watches for the chart to scroll into view (15% threshold)
3. After the configurable delay (`data-graph-animation-delay`, default 300ms), animations trigger
4. The animation duration is controlled by the `--graph-animation-duration` CSS variable (default 1.5s)
5. On resize, charts redraw without re-animating

### CSS Custom Properties

```css
:root {
  /* Background */
  --graph-bg: transparent;
  --graph-text: #444;

  /* Grid lines */
  --graph-grid-h-color: #e8e8e8;
  --graph-grid-h-width: 1;
  --graph-grid-h-dasharray: 4 4;
  --graph-grid-v-color: #e8e8e8;
  --graph-grid-v-width: 1;
  --graph-grid-v-dasharray: 4 4;

  /* Axes and labels */
  --graph-axis-color: #ccc;
  --graph-tick-color: #666;
  --graph-title-color: #333;
  --graph-legend-text: #555;

  /* Tooltip */
  --graph-tooltip-bg: rgba(0, 0, 0, 0.85);
  --graph-tooltip-text: #fff;
  --graph-tooltip-radius: 6px;

  /* Animation */
  --graph-animation-duration: 1.5s;
}
```

### Custom Events

| Event | Detail | Description |
|-------|--------|-------------|
| `battersea:graphReady` | `{ type, labels, datasets }` | Fired when data is loaded and the chart is initialised |
| `battersea:graphRender` | `{ type }` | Fired each time the chart is drawn (including on resize) |

```javascript
var chart = document.querySelector('[data-graph]');

chart.addEventListener('battersea:graphReady', function(e) {
  console.log('Chart type:', e.detail.type);
  console.log('Data points:', e.detail.labels);
  console.log('Series count:', e.detail.datasets);
});

chart.addEventListener('battersea:graphRender', function(e) {
  console.log('Chart rendered:', e.detail.type);
});
```

### Required Files

```html
<!-- CSS -->
<link rel="stylesheet" href="battersea-library.css">

<!-- Core JS (required) -->
<script src="battersea-utils.js"></script>
<script src="battersea-core.js"></script>

<!-- Component -->
<script src="battersea-graph.js"></script>
```

### DOM Structure (after initialisation)

**Line / Column / Bar:**
```
.battersea-graph
  .battersea-graph__title (if data-graph-title set)
  .battersea-graph__legend.battersea-graph__legend--top (if legend position is top)
  .battersea-graph__svg-container
    svg.battersea-graph__svg
      .battersea-graph__grid-line--h (horizontal grid lines)
      .battersea-graph__grid-line--v (vertical grid lines)
      .battersea-graph__axis-line (x and y axis lines)
      .battersea-graph__tick-label (axis tick values)
      .battersea-graph__axis-label (axis labels)
      .battersea-graph__line (line chart paths)
      .battersea-graph__point (line chart data markers)
      .battersea-graph__bar (column/bar chart rectangles)
    .battersea-graph__tooltip (positioned absolutely)
  .battersea-graph__legend.battersea-graph__legend--bottom (default)
    .battersea-graph__legend-item
      .battersea-graph__legend-swatch--square|circle
      .battersea-graph__legend-label
```

**Pie:**
```
.battersea-graph
  .battersea-graph__title
  .battersea-graph__svg-container
    svg.battersea-graph__svg
      defs > clipPath (for animation)
      g.battersea-graph__pie-group
        .battersea-graph__slice (pie segment paths)
    .battersea-graph__tooltip
  .battersea-graph__legend
```

**Side legend layout** (left or right):
```
.battersea-graph.battersea-graph--legend-right
  .battersea-graph__svg-container (flex: 1)
  .battersea-graph__legend (width: 140px, collapses to row on mobile)
```

### Responsive Breakpoints

| Breakpoint | Behaviour |
|-----------|----------|
| Desktop (768px+) | Full layout with side legends, standard font sizes |
| Mobile (below 768px) | Smaller tick/axis labels, side legends collapse to horizontal row below chart |

### Default Colour Palette

The built-in palette cycles through these colours. Override with `data-graph-colours`:

| Index | Colour | Hex |
|-------|--------|-----|
| 1 | Blue-purple | `#667eea` |
| 2 | Red | `#e94560` |
| 3 | Teal | `#4ecdc4` |
| 4 | Coral | `#ff6b6b` |
| 5 | Sky blue | `#45b7d1` |
| 6 | Yellow | `#f9ca24` |
| 7 | Purple | `#6c5ce7` |
| 8 | Mint | `#a8e6cf` |

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses inline SVG, CSS custom properties, and IntersectionObserver. Charts scale responsively using SVG viewBox.
