/**
 * Battersea Library - DragTable Component
 * Version: 2.32.0
 *
 * Drag-and-drop reorderable table for columns and/or rows.
 * Enhances a standard HTML <table> with drag handles, text filter,
 * per-column filters, and sessionStorage persistence.
 *
 * Usage:
 * <div data-drag-table data-dragtable-reorder="rows">
 *   <table>
 *     <thead><tr><th>Name</th><th>Age</th></tr></thead>
 *     <tbody><tr><td>Alice</td><td>30</td></tr></tbody>
 *   </table>
 * </div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('DragTable requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;

  class DragTable {
    constructor(el) {
      this.el = el;
      this.events = [];

      // Configuration
      this.reorder = (Utils.getData(el, 'dragtable-reorder') || 'rows').toLowerCase();
      this.filterable = Utils.parseBoolean(Utils.getData(el, 'dragtable-filterable') || 'false');
      this.columnFilters = Utils.parseBoolean(Utils.getData(el, 'dragtable-column-filters') || 'false');
      this.striped = Utils.parseBoolean(Utils.getData(el, 'dragtable-striped') || 'true');
      this.responsive = Utils.parseBoolean(Utils.getData(el, 'dragtable-responsive') || 'true');
      this.storageKey = Utils.getData(el, 'dragtable-storage-key') || '';

      // Whether rows/columns can be dragged
      this.canDragRows = this.reorder === 'rows' || this.reorder === 'both';
      this.canDragColumns = this.reorder === 'columns' || this.reorder === 'both';

      // State
      this.columns = [];
      this.rows = [];
      this.filteredRows = [];
      this.filterQuery = '';
      this.columnFilterValues = {};

      // Drag state
      this.isDragging = false;
      this.dragType = null; // 'row' or 'column'
      this.dragIndex = null;
      this.ghost = null;
      this.placeholder = null;
      this.offsetX = 0;
      this.offsetY = 0;

      // DOM references
      this.wrapper = null;
      this.sourceTable = null;
      this.table = null;
      this.thead = null;
      this.tbody = null;
      this.toolbar = null;
      this.filterInput = null;
      this.columnFilterRow = null;
      this.scrollContainer = null;
      this.tableWrapper = null;
      this.liveRegion = null;

      // Bound handlers for document-level events
      this._onMouseMove = Utils.throttle(function(e) { this.onDragMove(e); }.bind(this), 16);
      this._onMouseUp = function(e) { this.endDrag(e); }.bind(this);
      this._onTouchMove = Utils.throttle(function(e) { this.onDragMove(e); }.bind(this), 16);
      this._onTouchEnd = function(e) { this.endDrag(e); }.bind(this);

      // Debounced filter
      this._debouncedFilter = Utils.debounce(function(query) {
        this.filterQuery = query;
        this.applyFilters();
        this.el.dispatchEvent(new CustomEvent('battersea:dragTableFilter', {
          detail: { query: query, results: this.filteredRows.length }
        }));
        this.announce(this.filteredRows.length + ' rows found');
      }.bind(this), 300);

      this.init();
    }

    init() {
      this.sourceTable = Utils.qs('table', this.el);
      if (!this.sourceTable) {
        console.error('DragTable: No <table> found');
        return;
      }

      this.parseTable();
      this.loadState();
      this.buildStructure();
      this.applyFilters();
    }

    // ─── Data Parsing ────────────────────────────────

    parseTable() {
      var headerCells = Utils.qsa('thead th', this.sourceTable);
      this.columns = headerCells.map(function(th, i) {
        return {
          key: 'col' + i,
          label: th.textContent.trim(),
          originalIndex: i,
          filterable: Utils.parseBoolean(Utils.getData(th, 'column-filter') || 'false')
        };
      });

      // If any column has data-column-filter, use per-column mode
      this.hasPerColumnFilters = this.columns.some(function(col) { return col.filterable; });

      var bodyRows = Utils.qsa('tbody tr', this.sourceTable);
      this.rows = bodyRows.map(function(tr, rowIndex) {
        var cells = Utils.qsa('td', tr);
        var cellData = cells.map(function(td) {
          return td.innerHTML.trim();
        });
        return {
          id: 'row-' + rowIndex,
          cells: cellData,
          originalIndex: rowIndex
        };
      });

      // Remove original table
      this.sourceTable.parentNode.removeChild(this.sourceTable);
    }

    // ─── State Persistence ──────────────────────────

    loadState() {
      if (!this.storageKey) return;

      var raw;
      try {
        raw = sessionStorage.getItem('battersea-dragtable-' + this.storageKey);
      } catch (e) {
        return;
      }
      if (!raw) return;

      var data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        return;
      }

      // Restore column order
      if (data.columnOrder && data.columnOrder.length === this.columns.length) {
        var colMap = {};
        this.columns.forEach(function(col) { colMap[col.key] = col; });
        var restored = [];
        data.columnOrder.forEach(function(key) {
          if (colMap[key]) restored.push(colMap[key]);
        });
        if (restored.length === this.columns.length) {
          this.columns = restored;
        }
      }

      // Restore row order
      if (data.rowOrder && data.rowOrder.length === this.rows.length) {
        var rowMap = {};
        this.rows.forEach(function(row) { rowMap[row.id] = row; });
        var restoredRows = [];
        data.rowOrder.forEach(function(id) {
          if (rowMap[id]) restoredRows.push(rowMap[id]);
        });
        if (restoredRows.length === this.rows.length) {
          this.rows = restoredRows;
        }
      }
    }

    saveState() {
      var data = {
        columnOrder: this.columns.map(function(col) { return col.key; }),
        rowOrder: this.rows.map(function(row) { return row.id; })
      };

      // Always fire the event so external code can save to a database
      this.el.dispatchEvent(new CustomEvent('battersea:dragTableReorder', {
        detail: {
          columnOrder: data.columnOrder,
          rowOrder: data.rowOrder,
          columns: this.columns.map(function(col) { return { key: col.key, label: col.label, originalIndex: col.originalIndex }; }),
          rows: this.rows.map(function(row) { return { id: row.id, cells: row.cells, originalIndex: row.originalIndex }; })
        }
      }));

      if (!this.storageKey) return;

      try {
        sessionStorage.setItem('battersea-dragtable-' + this.storageKey, JSON.stringify(data));
      } catch (e) {
        console.warn('DragTable: Could not save to sessionStorage', e);
      }
    }

    /**
     * Public method to get the current order data.
     * Useful for saving to a database via AJAX.
     */
    getOrderData() {
      return {
        columnOrder: this.columns.map(function(col) { return { key: col.key, label: col.label, originalIndex: col.originalIndex }; }),
        rowOrder: this.rows.map(function(row, i) { return { id: row.id, position: i, cells: row.cells, originalIndex: row.originalIndex }; })
      };
    }

    // ─── DOM Construction ────────────────────────────

    buildStructure() {
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'battersea-dragtable';
      if (this.responsive) {
        this.wrapper.classList.add('battersea-dragtable--responsive');
      }

      // Toolbar
      if (this.filterable) {
        this.toolbar = this.buildToolbar();
        this.wrapper.appendChild(this.toolbar);
      }

      // Table wrapper
      this.tableWrapper = document.createElement('div');
      this.tableWrapper.className = 'battersea-dragtable__table-wrapper';

      this.buildTable();
      this.tableWrapper.appendChild(this.table);

      if (this.responsive) {
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'battersea-dragtable__scroll-container';
        this.scrollContainer.appendChild(this.tableWrapper);
        this.wrapper.appendChild(this.scrollContainer);
        this.setupScrollHints();
      } else {
        this.wrapper.appendChild(this.tableWrapper);
      }

      // Live region for screen readers
      this.liveRegion = document.createElement('div');
      this.liveRegion.className = 'battersea-sr-only';
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.wrapper.appendChild(this.liveRegion);

      this.el.appendChild(this.wrapper);
    }

    buildToolbar() {
      var toolbar = document.createElement('div');
      toolbar.className = 'battersea-dragtable__toolbar';

      var filterWrap = document.createElement('div');
      filterWrap.className = 'battersea-dragtable__filter';

      this.filterInput = document.createElement('input');
      this.filterInput.type = 'text';
      this.filterInput.placeholder = 'Search...';
      this.filterInput.setAttribute('aria-label', 'Filter table');

      this.events.push(Utils.addEvent(this.filterInput, 'input', function(e) {
        this._debouncedFilter(e.target.value);
      }.bind(this)));

      filterWrap.appendChild(this.filterInput);
      toolbar.appendChild(filterWrap);

      return toolbar;
    }

    buildTable() {
      this.table = document.createElement('table');
      this.table.className = 'battersea-dragtable__table';
      if (this.striped) {
        this.table.classList.add('battersea-dragtable__table--striped');
      }

      this.buildTableHead();
      this.tbody = document.createElement('tbody');
      this.table.appendChild(this.tbody);
    }

    buildTableHead() {
      this.thead = document.createElement('thead');
      var headerRow = document.createElement('tr');

      // Drag handle column for rows
      if (this.canDragRows) {
        var handleTh = document.createElement('th');
        handleTh.className = 'battersea-dragtable__th battersea-dragtable__th--handle';
        handleTh.setAttribute('aria-label', 'Drag handle');
        headerRow.appendChild(handleTh);
      }

      // Data columns
      this.columns.forEach(function(col, colIndex) {
        var th = document.createElement('th');
        th.className = 'battersea-dragtable__th';
        th.setAttribute('data-col-index', colIndex);

        var label = document.createElement('span');
        label.className = 'battersea-dragtable__th-label';
        label.textContent = col.label;
        th.appendChild(label);

        // Column drag handle
        if (this.canDragColumns) {
          th.classList.add('battersea-dragtable__th--draggable');

          var grip = document.createElement('span');
          grip.className = 'battersea-dragtable__column-grip';
          grip.setAttribute('aria-hidden', 'true');
          grip.innerHTML = '&#8942;&#8942;';
          th.insertBefore(grip, label);

          this.bindColumnDragEvents(th, colIndex);
        }

        headerRow.appendChild(th);
      }.bind(this));

      this.thead.appendChild(headerRow);

      // Column filter row — show if global column-filters is on, or any column has data-column-filter
      if (this.columnFilters || this.hasPerColumnFilters) {
        this.buildColumnFilterRow();
      }

      this.table.appendChild(this.thead);
    }

    buildColumnFilterRow() {
      this.columnFilterRow = document.createElement('tr');
      this.columnFilterRow.className = 'battersea-dragtable__filter-row';

      // Empty cell for drag handle column
      if (this.canDragRows) {
        var emptyTd = document.createElement('th');
        emptyTd.className = 'battersea-dragtable__th battersea-dragtable__th--filter-empty';
        this.columnFilterRow.appendChild(emptyTd);
      }

      this.columns.forEach(function(col) {
        var th = document.createElement('th');
        th.className = 'battersea-dragtable__th battersea-dragtable__th--filter';

        // Show filter if global column-filters is on, or this column has data-column-filter
        var showFilter = this.columnFilters || col.filterable;

        if (showFilter) {
          var select = document.createElement('select');
          select.className = 'battersea-dragtable__column-filter';
          select.setAttribute('aria-label', 'Filter ' + col.label);

          var allOption = document.createElement('option');
          allOption.value = '';
          allOption.textContent = 'All';
          select.appendChild(allOption);

          // Get unique values for this column
          var values = this.getUniqueColumnValues(col.originalIndex);
          values.forEach(function(val) {
            var option = document.createElement('option');
            option.value = val;
            option.textContent = val;
            select.appendChild(option);
          });

          // Restore previous filter value if one was set
          var currentFilter = this.columnFilterValues[col.key] || '';
          if (currentFilter) {
            select.value = currentFilter;
          }

          this.events.push(Utils.addEvent(select, 'change', function(colKey, e) {
            this.columnFilterValues[colKey] = e.target.value;
            this.applyFilters();
          }.bind(this, col.key)));

          th.appendChild(select);
        }

        this.columnFilterRow.appendChild(th);
      }.bind(this));

      this.thead.appendChild(this.columnFilterRow);
    }

    getUniqueColumnValues(originalColIndex) {
      var values = {};
      this.rows.forEach(function(row) {
        var cellText = this.stripHTML(row.cells[originalColIndex] || '');
        if (cellText) values[cellText] = true;
      }.bind(this));
      return Object.keys(values).sort();
    }

    stripHTML(html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent.trim();
    }

    // ─── Rendering ───────────────────────────────────

    renderBody() {
      this.tbody.innerHTML = '';

      var displayRows = this.filteredRows;

      if (displayRows.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        var colSpan = this.columns.length + (this.canDragRows ? 1 : 0);
        td.setAttribute('colspan', colSpan);
        td.className = 'battersea-dragtable__empty';
        td.textContent = this.filterQuery || this.hasActiveColumnFilters() ? 'No matching rows found' : 'No data available';
        tr.appendChild(td);
        this.tbody.appendChild(tr);
        return;
      }

      displayRows.forEach(function(rowData) {
        var tr = document.createElement('tr');
        tr.className = 'battersea-dragtable__row';
        tr.setAttribute('data-row-id', rowData.id);

        // Drag handle cell
        if (this.canDragRows) {
          var handleTd = document.createElement('td');
          handleTd.className = 'battersea-dragtable__td battersea-dragtable__td--handle';

          var grip = document.createElement('span');
          grip.className = 'battersea-dragtable__row-grip';
          grip.setAttribute('aria-label', 'Drag to reorder row');
          grip.setAttribute('role', 'button');
          grip.setAttribute('tabindex', '0');
          grip.innerHTML = '&#8942;&#8942;';
          handleTd.appendChild(grip);

          this.bindRowDragEvents(grip, tr);
          tr.appendChild(handleTd);
        }

        // Data cells — render in current column order
        this.columns.forEach(function(col) {
          var td = document.createElement('td');
          td.className = 'battersea-dragtable__td';
          td.setAttribute('data-label', col.label);
          td.innerHTML = rowData.cells[col.originalIndex] !== undefined ? rowData.cells[col.originalIndex] : '';
          tr.appendChild(td);
        });

        this.tbody.appendChild(tr);
      }.bind(this));
    }

    rebuildHead() {
      // Remove existing thead content
      this.thead.innerHTML = '';
      var headerRow = document.createElement('tr');

      if (this.canDragRows) {
        var handleTh = document.createElement('th');
        handleTh.className = 'battersea-dragtable__th battersea-dragtable__th--handle';
        handleTh.setAttribute('aria-label', 'Drag handle');
        headerRow.appendChild(handleTh);
      }

      this.columns.forEach(function(col, colIndex) {
        var th = document.createElement('th');
        th.className = 'battersea-dragtable__th';
        th.setAttribute('data-col-index', colIndex);

        var label = document.createElement('span');
        label.className = 'battersea-dragtable__th-label';
        label.textContent = col.label;
        th.appendChild(label);

        if (this.canDragColumns) {
          th.classList.add('battersea-dragtable__th--draggable');

          var grip = document.createElement('span');
          grip.className = 'battersea-dragtable__column-grip';
          grip.setAttribute('aria-hidden', 'true');
          grip.innerHTML = '&#8942;&#8942;';
          th.insertBefore(grip, label);

          this.bindColumnDragEvents(th, colIndex);
        }

        headerRow.appendChild(th);
      }.bind(this));

      this.thead.appendChild(headerRow);

      if (this.columnFilters) {
        this.buildColumnFilterRow();
      }
    }

    // ─── Filtering ───────────────────────────────────

    applyFilters() {
      var self = this;
      this.filteredRows = this.rows.filter(function(row) {
        // Text filter
        if (self.filterQuery) {
          var query = self.filterQuery.toLowerCase();
          var match = row.cells.some(function(cell) {
            return self.stripHTML(cell).toLowerCase().indexOf(query) !== -1;
          });
          if (!match) return false;
        }

        // Column filters (keyed by column key)
        var colFilterKeys = Object.keys(self.columnFilterValues);
        for (var i = 0; i < colFilterKeys.length; i++) {
          var colKey = colFilterKeys[i];
          var filterVal = self.columnFilterValues[colKey];
          if (!filterVal) continue;

          var col = self.columns.find(function(c) { return c.key === colKey; });
          if (!col) continue;

          var cellText = self.stripHTML(row.cells[col.originalIndex] || '');
          if (cellText !== filterVal) return false;
        }

        return true;
      });

      this.renderBody();
    }

    hasActiveColumnFilters() {
      var keys = Object.keys(this.columnFilterValues);
      for (var i = 0; i < keys.length; i++) {
        if (this.columnFilterValues[keys[i]]) return true;
      }
      return false;
    }

    // ─── Scroll Hints ────────────────────────────────

    setupScrollHints() {
      var wrapper = this.tableWrapper;
      var container = this.scrollContainer;

      this._updateScrollHints = function() {
        var maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

        if (maxScroll <= 1) {
          container.classList.remove('battersea-dragtable__scroll-container--scroll-left');
          container.classList.remove('battersea-dragtable__scroll-container--scroll-right');
          return;
        }

        container.classList.toggle(
          'battersea-dragtable__scroll-container--scroll-left',
          wrapper.scrollLeft > 0
        );
        container.classList.toggle(
          'battersea-dragtable__scroll-container--scroll-right',
          wrapper.scrollLeft < maxScroll - 1
        );
      };

      this.events.push(Utils.addEvent(wrapper, 'scroll', Utils.throttle(this._updateScrollHints, 50)));
      this.events.push(Utils.addEvent(window, 'resize', Utils.debounce(this._updateScrollHints, 150)));
    }

    // ─── Row Dragging ────────────────────────────────

    bindRowDragEvents(grip, tr) {
      this.events.push(Utils.addEvent(grip, 'mousedown', function(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        this.startRowDrag(tr, e.clientX, e.clientY);
      }.bind(this)));

      this.events.push(Utils.addEvent(grip, 'touchstart', function(e) {
        var touch = e.touches[0];
        this.startRowDrag(tr, touch.clientX, touch.clientY);
      }.bind(this), { passive: false }));

      // Keyboard support
      this.events.push(Utils.addEvent(grip, 'keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          this.moveRowByKeyboard(tr, e.key === 'ArrowUp' ? -1 : 1);
        }
      }.bind(this)));
    }

    startRowDrag(tr, clientX, clientY) {
      if (this.isDragging) return;
      this.isDragging = true;
      this.dragType = 'row';

      var rowId = tr.getAttribute('data-row-id');
      this.dragIndex = this.filteredRows.findIndex(function(r) { return r.id === rowId; });

      var rect = tr.getBoundingClientRect();
      this.offsetX = clientX - rect.left;
      this.offsetY = clientY - rect.top;

      // Create ghost
      this.ghost = tr.cloneNode(true);
      this.ghost.className = 'battersea-dragtable__ghost-row';
      this.ghost.style.width = rect.width + 'px';
      this.ghost.style.position = 'fixed';
      this.ghost.style.pointerEvents = 'none';
      this.ghost.style.zIndex = '10000';
      this.ghost.style.opacity = '0.85';
      this.ghost.style.left = rect.left + 'px';
      this.ghost.style.top = (clientY - this.offsetY) + 'px';
      document.body.appendChild(this.ghost);

      // Mark dragged row
      tr.classList.add('battersea-dragtable__row--dragging');

      // Bind document events
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);
      document.addEventListener('touchmove', this._onTouchMove, { passive: false });
      document.addEventListener('touchend', this._onTouchEnd);

      document.body.style.userSelect = 'none';
    }

    moveRowByKeyboard(tr, direction) {
      var rowId = tr.getAttribute('data-row-id');
      var rowIndex = this.rows.findIndex(function(r) { return r.id === rowId; });
      var targetIndex = rowIndex + direction;

      if (targetIndex < 0 || targetIndex >= this.rows.length) return;

      // Swap in data
      var temp = this.rows[rowIndex];
      this.rows[rowIndex] = this.rows[targetIndex];
      this.rows[targetIndex] = temp;

      this.applyFilters();
      this.saveState();

      // Re-focus the grip in the moved row
      var movedRow = Utils.qs('[data-row-id="' + rowId + '"]', this.tbody);
      if (movedRow) {
        var grip = Utils.qs('.battersea-dragtable__row-grip', movedRow);
        if (grip) grip.focus();
      }

      this.announce('Row moved ' + (direction === -1 ? 'up' : 'down'));
    }

    // ─── Column Dragging ─────────────────────────────

    bindColumnDragEvents(th, colIndex) {
      this.events.push(Utils.addEvent(th, 'mousedown', function(e) {
        if (e.button !== 0) return;
        // Don't start drag on column filter selects
        if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
        e.preventDefault();
        this.startColumnDrag(th, colIndex, e.clientX, e.clientY);
      }.bind(this)));

      this.events.push(Utils.addEvent(th, 'touchstart', function(e) {
        if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
        var touch = e.touches[0];
        this.startColumnDrag(th, colIndex, touch.clientX, touch.clientY);
      }.bind(this), { passive: false }));
    }

    startColumnDrag(th, colIndex, clientX, clientY) {
      if (this.isDragging) return;

      // Disable column drag on mobile (< 768px)
      if (window.innerWidth < 768) return;

      this.isDragging = true;
      this.dragType = 'column';
      this.dragIndex = colIndex;

      var rect = th.getBoundingClientRect();
      this.offsetX = clientX - rect.left;
      this.offsetY = clientY - rect.top;

      // Create ghost
      this.ghost = document.createElement('div');
      this.ghost.className = 'battersea-dragtable__ghost-column';
      this.ghost.textContent = this.columns[colIndex].label;
      this.ghost.style.position = 'fixed';
      this.ghost.style.pointerEvents = 'none';
      this.ghost.style.zIndex = '10000';
      this.ghost.style.left = (clientX - this.offsetX) + 'px';
      this.ghost.style.top = (clientY - this.offsetY) + 'px';
      document.body.appendChild(this.ghost);

      // Mark dragged column header
      th.classList.add('battersea-dragtable__th--dragging');

      // Bind document events
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);
      document.addEventListener('touchmove', this._onTouchMove, { passive: false });
      document.addEventListener('touchend', this._onTouchEnd);

      document.body.style.userSelect = 'none';
    }

    // ─── Shared Drag Logic ───────────────────────────

    onDragMove(e) {
      if (!this.isDragging) return;

      var pos = this.getPointerPosition(e);
      if (e.type === 'touchmove') e.preventDefault();

      // Move ghost
      if (this.dragType === 'row') {
        this.ghost.style.top = (pos.y - this.offsetY) + 'px';
        this.handleRowDragOver(pos);
      } else if (this.dragType === 'column') {
        this.ghost.style.left = (pos.x - this.offsetX) + 'px';
        this.ghost.style.top = (pos.y - this.offsetY) + 'px';
        this.handleColumnDragOver(pos);
      }
    }

    handleRowDragOver(pos) {
      var rows = Utils.qsa('.battersea-dragtable__row:not(.battersea-dragtable__row--dragging)', this.tbody);

      for (var i = 0; i < rows.length; i++) {
        var rect = rows[i].getBoundingClientRect();
        var midY = rect.top + rect.height / 2;

        if (pos.y < midY) {
          rows[i].classList.add('battersea-dragtable__row--drop-above');
          // Remove from others
          rows.forEach(function(r, j) {
            if (j !== i) {
              r.classList.remove('battersea-dragtable__row--drop-above');
              r.classList.remove('battersea-dragtable__row--drop-below');
            }
          });
          return;
        } else if (i === rows.length - 1) {
          rows[i].classList.add('battersea-dragtable__row--drop-below');
          rows.forEach(function(r, j) {
            if (j !== i) {
              r.classList.remove('battersea-dragtable__row--drop-above');
              r.classList.remove('battersea-dragtable__row--drop-below');
            }
          });
          return;
        }
      }
    }

    handleColumnDragOver(pos) {
      var headers = Utils.qsa('.battersea-dragtable__th:not(.battersea-dragtable__th--handle):not(.battersea-dragtable__th--filter-empty):not(.battersea-dragtable__th--filter)', this.thead);
      // Only look at the main header row (first row)
      var headerRow = Utils.qs('tr', this.thead);
      if (!headerRow) return;
      var ths = Utils.qsa('.battersea-dragtable__th:not(.battersea-dragtable__th--handle)', headerRow);

      ths.forEach(function(th) {
        th.classList.remove('battersea-dragtable__th--drop-left');
        th.classList.remove('battersea-dragtable__th--drop-right');
      });

      for (var i = 0; i < ths.length; i++) {
        var rect = ths[i].getBoundingClientRect();
        var midX = rect.left + rect.width / 2;

        if (pos.x < midX) {
          ths[i].classList.add('battersea-dragtable__th--drop-left');
          return;
        } else if (i === ths.length - 1) {
          ths[i].classList.add('battersea-dragtable__th--drop-right');
          return;
        }
      }
    }

    endDrag(e) {
      if (!this.isDragging) return;
      this.isDragging = false;

      document.removeEventListener('mousemove', this._onMouseMove);
      document.removeEventListener('mouseup', this._onMouseUp);
      document.removeEventListener('touchmove', this._onTouchMove);
      document.removeEventListener('touchend', this._onTouchEnd);

      document.body.style.userSelect = '';

      if (this.dragType === 'row') {
        this.finaliseRowDrop();
      } else if (this.dragType === 'column') {
        this.finaliseColumnDrop();
      }

      // Clean up ghost
      if (this.ghost && this.ghost.parentNode) {
        this.ghost.parentNode.removeChild(this.ghost);
      }
      this.ghost = null;
      this.dragType = null;
      this.dragIndex = null;
    }

    finaliseRowDrop() {
      // Find the drop target
      var dropAbove = Utils.qs('.battersea-dragtable__row--drop-above', this.tbody);
      var dropBelow = Utils.qs('.battersea-dragtable__row--drop-below', this.tbody);
      var draggedRow = Utils.qs('.battersea-dragtable__row--dragging', this.tbody);

      if (!draggedRow) return;

      var draggedId = draggedRow.getAttribute('data-row-id');
      var fromIndex = this.rows.findIndex(function(r) { return r.id === draggedId; });

      var toIndex = -1;

      if (dropAbove) {
        var targetId = dropAbove.getAttribute('data-row-id');
        toIndex = this.rows.findIndex(function(r) { return r.id === targetId; });
      } else if (dropBelow) {
        var targetId2 = dropBelow.getAttribute('data-row-id');
        toIndex = this.rows.findIndex(function(r) { return r.id === targetId2; }) + 1;
      }

      // Clean up CSS classes
      Utils.qsa('.battersea-dragtable__row', this.tbody).forEach(function(r) {
        r.classList.remove('battersea-dragtable__row--dragging');
        r.classList.remove('battersea-dragtable__row--drop-above');
        r.classList.remove('battersea-dragtable__row--drop-below');
      });

      if (toIndex === -1 || fromIndex === toIndex) return;

      // Reorder data
      var movedRow = this.rows.splice(fromIndex, 1)[0];
      if (toIndex > fromIndex) toIndex--;
      this.rows.splice(toIndex, 0, movedRow);

      this.applyFilters();
      this.saveState();
      this.announce('Row reordered');
    }

    finaliseColumnDrop() {
      var headerRow = Utils.qs('tr', this.thead);
      if (!headerRow) return;

      var ths = Utils.qsa('.battersea-dragtable__th:not(.battersea-dragtable__th--handle)', headerRow);
      var dropLeft = null;
      var dropRight = null;

      for (var i = 0; i < ths.length; i++) {
        if (ths[i].classList.contains('battersea-dragtable__th--drop-left')) {
          dropLeft = i;
          break;
        }
        if (ths[i].classList.contains('battersea-dragtable__th--drop-right')) {
          dropRight = i;
          break;
        }
      }

      // Clean up CSS classes
      ths.forEach(function(th) {
        th.classList.remove('battersea-dragtable__th--dragging');
        th.classList.remove('battersea-dragtable__th--drop-left');
        th.classList.remove('battersea-dragtable__th--drop-right');
      });

      var fromIndex = this.dragIndex;
      var toIndex = -1;

      if (dropLeft !== null) {
        toIndex = dropLeft;
      } else if (dropRight !== null) {
        toIndex = dropRight + 1;
      }

      if (toIndex === -1 || fromIndex === toIndex) return;

      // Reorder columns
      var movedCol = this.columns.splice(fromIndex, 1)[0];
      if (toIndex > fromIndex) toIndex--;
      this.columns.splice(toIndex, 0, movedCol);

      this.rebuildHead();
      this.applyFilters();
      this.saveState();
      this.announce('Column reordered');
    }

    // ─── Utilities ───────────────────────────────────

    getPointerPosition(e) {
      if (e.type && e.type.startsWith('touch')) {
        var touch = e.touches[0] || e.changedTouches[0];
        return { x: touch.clientX, y: touch.clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    announce(message) {
      if (!this.liveRegion) return;
      this.liveRegion.textContent = '';
      requestAnimationFrame(function() {
        this.liveRegion.textContent = message;
      }.bind(this));
    }

    // ─── Cleanup ─────────────────────────────────────

    destroy() {
      this.events.forEach(function(event) { event.remove(); });
      this.events = [];

      document.removeEventListener('mousemove', this._onMouseMove);
      document.removeEventListener('mouseup', this._onMouseUp);
      document.removeEventListener('touchmove', this._onTouchMove);
      document.removeEventListener('touchend', this._onTouchEnd);

      if (this.ghost && this.ghost.parentNode) {
        this.ghost.parentNode.removeChild(this.ghost);
      }

      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
    }
  }

  // Register component
  window.Battersea.register('dragTable', DragTable, '[data-drag-table]');

})(window, document);
