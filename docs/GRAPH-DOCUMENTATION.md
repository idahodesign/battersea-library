# Battersea Library - Graph Component Documentation

## Added in v2.20.0, updated in v2.21.1

---

## Graph

**New in v2.20.0, expanded in v2.21.1** - SVG charts with eight chart types: line, column, stacked column, bar (horizontal), stacked bar, pie, donut, and radial. Supports inline JSON, external JSON files, and CSV files as data sources. Segments can include clickable URL links.

### Features
- **Eight chart types** - Line, column, stacked column, bar, stacked bar, pie, donut, and radial, set with a single data attribute
- **Flexible data sources** - Inline JSON, JSON file URL, or CSV file
- **Smooth lines** - Optional cubic bezier interpolation for line charts (Catmull-Rom splines)
- **Animated drawing** - Lines draw left-to-right, columns grow from baseline, bars extend from left, pie and donut sweep clockwise, radial bars grow outward
- **Scroll-triggered** - Animations deferred until the chart scrolls into view via IntersectionObserver
- **Sequential stagger** - Column bars animate left-to-right, bar chart top-to-bottom, line markers appear as the line reaches them
- **Tooltips** - Hover tooltips show label and value; stacked charts show segment value and total
- **Configurable legend** - Place at bottom, top, left, or right with square or circle swatches
- **Clickable segments** - Optional URL links on any chart segment via a `links` array in the data
- **Stacked charts** - Datasets stacked vertically (stacked column) or horizontally (stacked bar) with per-segment tooltips, customisable gap between segments, and smooth sequential animation
- **Donut options** - Configurable ring width, optional centre label (custom text or auto-total)
- **Pie options** - Constant-width gap between segments, rounded corners, configurable stroke outline
- **Radial options** - Concentric grid circles, configurable start angle, label positioning
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

<!-- Stacked Column Chart -->
<div data-graph
  data-graph-type="stackedcolumn"
  data-graph-animated="true"
  data-graph-legend="true"
  data-graph-bar-radius="4"
  data-graph-stack-gap="3"
  data-graph-data='{"labels":["Q1","Q2","Q3","Q4"],
    "datasets":[
      {"label":"Revenue","values":[42000,51000,47000,63000]},
      {"label":"Expenses","values":[28000,31000,29000,35000]}
    ]}'>
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

<!-- Stacked Bar Chart -->
<div data-graph
  data-graph-type="stackedbar"
  data-graph-animated="true"
  data-graph-legend="true"
  data-graph-bar-radius="4"
  data-graph-stack-gap="3"
  data-graph-data='{"labels":["JavaScript","Python","Java"],
    "datasets":[
      {"label":"Frontend","values":[90,20,15]},
      {"label":"Backend","values":[60,80,70]}
    ]}'>
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

<!-- Donut Chart -->
<div data-graph
  data-graph-type="donut"
  data-graph-animated="true"
  data-graph-legend="true"
  data-graph-donut-width="60"
  data-graph-donut-label-value="true"
  data-graph-pie-gap="3"
  data-graph-data='{"labels":["Chrome","Safari","Firefox","Edge","Other"],
    "datasets":[{"label":"Share","values":[65,18,8,5,4]}]}'>
</div>

<!-- Radial Bar Chart -->
<div data-graph
  data-graph-type="radial"
  data-graph-animated="true"
  data-graph-legend="true"
  data-graph-radial-grid="true"
  data-graph-title="Skill Proficiency"
  data-graph-data='{"labels":["JavaScript","CSS","Python","Design","DevOps"],
    "datasets":[{"label":"Score","values":[92,88,65,78,55]}]}'>
</div>
```

### Data Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-graph` | - | required | Initialises the Graph component |
| `data-graph-type` | `line` / `column` / `stackedcolumn` / `bar` / `stackedbar` / `pie` / `donut` / `radial` | `line` | The type of chart to render |
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
| `data-graph-stack-gap` | Number (px) | `0` | Gap between stacked column/bar segments. Corner radius only applies when gap > 0 |
| `data-graph-pie-gap` | Number (px) | `0` | Gap between pie/donut segments (constant-width channels from rim to centre) |
| `data-graph-pie-radius` | Number (px) | `0` | Corner radius on pie/donut segment edges |
| `data-graph-pie-stroke` | CSS colour | `#fff` | Outline colour between pie/donut segments |
| `data-graph-pie-stroke-width` | Number | `2` | Outline thickness. Set to 0 to remove outlines |
| `data-graph-donut-width` | Number (px) | `60` | Thickness of the donut ring |
| `data-graph-donut-label` | String | - | Text displayed in the centre of the donut |
| `data-graph-donut-label-value` | `true` / `false` | `false` | Auto-display the total of all values as the centre label |
| `data-graph-radial-start` | Number (degrees) | `0` | Starting angle for radial bars (0 = 12 o'clock) |
| `data-graph-radial-grid` | `true` / `false` | `true` | Show concentric grid circles on radial charts |
| `data-graph-radial-label-position` | `end` / `outside` | `end` | Where to place category labels on radial charts |

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

### Segment Links

Segments across all chart types can include clickable URL links. Add a `links` array to the JSON data, with one entry per label. Each entry can be a URL string, an object with `url` and `target`, or `null` for no link.

**JSON with links:**

```json
{
  "labels": ["Accordion", "Slider", "Tabs", "Popup", "Tooltip"],
  "links": [
    "accordion.html",
    { "url": "slider.html", "target": "_blank" },
    "tabs.html",
    "popup.html",
    null
  ],
  "datasets": [
    { "label": "Pages", "values": [12, 8, 6, 4, 3] }
  ]
}
```

**CSV with links** (add `Link` and optional `LinkTarget` columns):

```
Label,Value,Link,LinkTarget
Accordion,12,accordion.html,
Slider,8,slider.html,_blank
Tabs,6,tabs.html,
Popup,4,popup.html,
Tooltip,3,,
```

Segments with links render as SVG `<a>` elements with `cursor: pointer`. Segments without links remain as standard elements.

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

**Stacked Column** (`data-graph-type="stackedcolumn"`):
- Multiple datasets stacked vertically on top of each other (one bar per label)
- Y-axis max is calculated from the stacked totals, not individual values
- Tooltips show the segment label, segment value, and stack total
- Animation: segments animate sequentially bottom-to-top with a single smooth ease-in-out curve
- Customisable gap between segments via `data-graph-stack-gap` (default 0)
- Corner radius applied to all segments when gap > 0; segments are flush when gap is 0

**Bar** (`data-graph-type="bar"`):
- Horizontal bars, ideal for categories with long labels
- Category labels shown on the y-axis, values on the x-axis
- Animation: bars extend from left, staggered top-to-bottom
- Corner radius via `data-graph-bar-radius`

**Stacked Bar** (`data-graph-type="stackedbar"`):
- Multiple datasets stacked horizontally (one bar per label)
- X-axis max is calculated from the stacked totals
- Tooltips show the segment label, segment value, and stack total
- Animation: segments animate sequentially left-to-right with a single smooth ease-in-out curve
- Customisable gap between segments via `data-graph-stack-gap` (default 0)
- Corner radius applied to all segments when gap > 0; segments are flush when gap is 0

**Pie** (`data-graph-type="pie"`):
- Single dataset only; labels become segment names
- Animation: clockwise sweep reveal from 12 o'clock
- Constant-width gap between segments via `data-graph-pie-gap` (perpendicular offset creates uniform channels from rim to centre)
- Rounded corners via `data-graph-pie-radius` (quadratic bezier curves)
- Configurable outline via `data-graph-pie-stroke` and `data-graph-pie-stroke-width`

**Donut** (`data-graph-type="donut"`):
- Same as pie but with a hollow centre
- Ring thickness controlled by `data-graph-donut-width` (default 60px)
- Optional centre label: custom text via `data-graph-donut-label` or auto-total via `data-graph-donut-label-value="true"`
- Supports all pie options: gap, rounded corners, stroke outline
- Animation: clockwise sweep reveal (same as pie)

**Radial Bar** (`data-graph-type="radial"`):
- Single dataset; bars radiate outward from a central point in a circular layout
- Each category is a bar extending from a small inner radius to a proportional outer radius
- Concentric grid circles at value intervals via `data-graph-radial-grid`
- Labels placed at bar ends (`end`) or around the outer perimeter (`outside`)
- Starting angle configurable via `data-graph-radial-start` (0 = 12 o'clock)
- Animation: bars grow outward from centre, staggered by index

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

  /* Donut */
  --graph-donut-label-color: #333;
  --graph-donut-label-size: 1.4rem;

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

**Line / Column / Stacked Column / Bar / Stacked Bar:**
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
      .battersea-graph__bar (column/bar/stacked chart rectangles)
    .battersea-graph__tooltip (positioned absolutely)
  .battersea-graph__legend.battersea-graph__legend--bottom (default)
    .battersea-graph__legend-item
      .battersea-graph__legend-swatch--square|circle
      .battersea-graph__legend-label
```

**Pie / Donut:**
```
.battersea-graph
  .battersea-graph__title
  .battersea-graph__svg-container
    svg.battersea-graph__svg
      defs > clipPath (for animation)
      g.battersea-graph__pie-group
        .battersea-graph__slice (pie/donut segment paths)
      .battersea-graph__donut-label (donut centre text, if set)
    .battersea-graph__tooltip
  .battersea-graph__legend
```

**Radial:**
```
.battersea-graph
  .battersea-graph__title
  .battersea-graph__svg-container
    svg.battersea-graph__svg
      .battersea-graph__grid-circle (concentric grid circles)
      .battersea-graph__radial-tick-label (grid value labels)
      .battersea-graph__radial-bar (bar segment paths)
      .battersea-graph__radial-label (category labels)
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
| Mobile (below 768px) | Smaller tick/axis/radial labels, side legends collapse to horizontal row below chart |

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
