/**
 * Battersea Library - DataTable Component
 * Version: 2.13.0
 *
 * Sortable, filterable tables with pagination, column resizing,
 * row selection, and CSV export.
 *
 * Supports four data sources:
 * 1. Existing HTML <table> — component enhances it
 * 2. Inline JSON via data-table-data attribute — component builds the table
 * 3. JSON file URL via data-table-data attribute — component fetches and builds the table
 * 4. CSV file via data-table-csv attribute — component fetches and builds the table
 *
 * Usage (HTML table):
 * <div data-datatable data-table-sortable="true">
 *   <table>
 *     <thead><tr><th>Name</th><th data-column-type="number">Age</th></tr></thead>
 *     <tbody><tr><td>Alice</td><td>30</td></tr></tbody>
 *   </table>
 * </div>
 *
 * Usage (inline JSON):
 * <div data-datatable data-table-data='[{"name":"Alice","age":30}]'></div>
 *
 * Usage (JSON file):
 * <div data-datatable data-table-data="data/inventory.json"></div>
 *
 * Usage (CSV file):
 * <div data-datatable data-table-csv="data/employees.csv"></div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('DataTable requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;

  class DataTable {
    constructor(el) {
      this.el = el;
      this.events = [];

      // Configuration
      this.sortable = Utils.parseBoolean(Utils.getData(el, 'table-sortable') || 'true');
      this.filterable = Utils.parseBoolean(Utils.getData(el, 'table-filterable') || 'false');
      this.pageSize = Utils.parseInt(Utils.getData(el, 'table-page-size'), 0);
      this.selectable = Utils.parseBoolean(Utils.getData(el, 'table-selectable') || 'false');
      this.resizable = Utils.parseBoolean(Utils.getData(el, 'table-resizable') || 'false');
      this.exportable = Utils.parseBoolean(Utils.getData(el, 'table-exportable') || 'false');
      this.striped = Utils.parseBoolean(Utils.getData(el, 'table-striped') || 'true');

      // Data model
      this.columns = [];
      this.originalData = [];
      this.data = [];
      this.filteredData = [];
      this.displayData = [];

      // State
      this.currentPage = 1;
      this.sortColumn = null;
      this.sortDirection = null;
      this.filterQuery = '';
      this.selectedRows = new Set();

      // DOM references
      this.wrapper = null;
      this.table = null;
      this.thead = null;
      this.tbody = null;
      this.toolbar = null;
      this.filterInput = null;
      this.paginationContainer = null;
      this.selectAllCheckbox = null;
      this.liveRegion = null;

      // Debounced filter
      this._debouncedFilter = Utils.debounce(function(query) {
        this.filterQuery = query;
        this.currentPage = 1;
        this.render();
        this.el.dispatchEvent(new CustomEvent('battersea:tableFilter', {
          detail: { query: query, results: this.filteredData.length }
        }));
        this.announce(this.filteredData.length + ' rows found');
      }.bind(this), 300);

      this.init();
    }

    init() {
      var csvUrl = Utils.getData(this.el, 'table-csv');

      if (csvUrl) {
        this.loadCSV(csvUrl);
        return;
      }

      // Check if data-table-data looks like a URL rather than inline JSON
      var jsonValue = Utils.getData(this.el, 'table-data');
      if (jsonValue && jsonValue.charAt(0) !== '[' && jsonValue.charAt(0) !== '{') {
        this.loadJSON(jsonValue);
        return;
      }

      this.parseDataSource();
      this.finishInit();
    }

    finishInit() {
      if (this.columns.length === 0 || this.originalData.length === 0) {
        console.warn('DataTable: No data or columns found');
        return;
      }

      this.data = this.originalData.slice();
      this.buildStructure();
      this.render();
    }

    // ─── Data Parsing ────────────────────────────────

    parseDataSource() {
      var existingTable = Utils.qs('table', this.el);
      var jsonData = Utils.getData(this.el, 'table-data');

      if (existingTable) {
        this.parseHTMLTable(existingTable);
      } else if (jsonData) {
        this.parseJSONData(jsonData);
      } else {
        console.error('DataTable: No data source found');
      }
    }

    parseHTMLTable(table) {
      var headerCells = Utils.qsa('thead th', table);

      this.columns = headerCells.map(function(th, i) {
        return {
          key: Utils.getData(th, 'column-key') || 'col' + i,
          label: th.textContent.trim(),
          type: Utils.getData(th, 'column-type') || 'string',
          sortable: Utils.parseBoolean(Utils.getData(th, 'column-sortable') || 'true'),
          width: th.style.width || null
        };
      });

      var rows = Utils.qsa('tbody tr', table);
      this.originalData = rows.map(function(tr) {
        var cells = Utils.qsa('td', tr);
        var rowData = {};
        cells.forEach(function(td, i) {
          if (this.columns[i]) {
            rowData[this.columns[i].key] = td.textContent.trim();
          }
        }.bind(this));
        return rowData;
      }.bind(this));

      // Remove existing table — we rebuild it
      table.parentNode.removeChild(table);
    }

    parseJSONData(jsonStr) {
      try {
        this.originalData = JSON.parse(jsonStr);
      } catch (e) {
        console.error('DataTable: Invalid JSON data', e);
        return;
      }

      var columnsStr = Utils.getData(this.el, 'table-columns');
      if (columnsStr) {
        try {
          this.columns = JSON.parse(columnsStr);
        } catch (e) {
          console.error('DataTable: Invalid JSON columns', e);
        }
      }

      // Auto-detect columns from first row
      if (this.columns.length === 0 && this.originalData.length > 0) {
        var firstRow = this.originalData[0];
        this.columns = Object.keys(firstRow).map(function(key) {
          return {
            key: key,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            type: this.inferType(firstRow[key]),
            sortable: true
          };
        }.bind(this));
      }
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
          self.originalData = data;

          var columnsStr = Utils.getData(self.el, 'table-columns');
          if (columnsStr) {
            try {
              self.columns = JSON.parse(columnsStr);
            } catch (e) {
              console.error('DataTable: Invalid JSON columns', e);
            }
          }

          // Auto-detect columns from first row
          if (self.columns.length === 0 && self.originalData.length > 0) {
            var firstRow = self.originalData[0];
            self.columns = Object.keys(firstRow).map(function(key) {
              return {
                key: key,
                label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                type: self.inferType(firstRow[key]),
                sortable: true
              };
            });
          }

          self.finishInit();
        })
        .catch(function(err) {
          console.error('DataTable: ' + err.message);
        });
    }

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
          console.error('DataTable: ' + err.message);
        });
    }

    parseCSVString(text) {
      var lines = [];
      var current = '';
      var inQuotes = false;

      // Parse respecting quoted fields that may contain commas or newlines
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
        console.warn('DataTable: CSV has no data rows');
        return;
      }

      // Split each line into fields
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

      // First line is headers
      var headers = splitLine(lines[0]);
      this.columns = headers.map(function(header, i) {
        var key = header.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'col' + i;
        return {
          key: key,
          label: header,
          type: 'string',
          sortable: true
        };
      });

      // Remaining lines are data
      this.originalData = [];
      for (var r = 1; r < lines.length; r++) {
        var fields = splitLine(lines[r]);
        if (fields.length === 0 || (fields.length === 1 && fields[0] === '')) continue;
        var row = {};
        this.columns.forEach(function(col, ci) {
          row[col.key] = fields[ci] !== undefined ? fields[ci] : '';
        });
        this.originalData.push(row);
      }

      // Infer types from first data row
      if (this.originalData.length > 0) {
        var firstRow = this.originalData[0];
        this.columns.forEach(function(col) {
          col.type = this.inferType(firstRow[col.key]);
        }.bind(this));
      }
    }

    inferType(value) {
      if (value === null || value === undefined) return 'string';
      if (typeof value === 'number' || (!isNaN(value) && value !== '')) return 'number';
      if (!isNaN(Date.parse(value)) && /\d{4}/.test(value)) return 'date';
      return 'string';
    }

    // ─── DOM Construction ────────────────────────────

    buildStructure() {
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'battersea-datatable';

      // Toolbar
      if (this.filterable || this.exportable) {
        this.toolbar = this.buildToolbar();
        this.wrapper.appendChild(this.toolbar);
      }

      // Table wrapper (horizontal scroll)
      var tableWrapper = document.createElement('div');
      tableWrapper.className = 'battersea-datatable__table-wrapper';

      this.buildTable();
      tableWrapper.appendChild(this.table);
      this.wrapper.appendChild(tableWrapper);

      // Pagination
      if (this.pageSize > 0) {
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.className = 'battersea-datatable__pagination';
        this.wrapper.appendChild(this.paginationContainer);
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
      toolbar.className = 'battersea-datatable__toolbar';

      if (this.filterable) {
        var filterWrap = document.createElement('div');
        filterWrap.className = 'battersea-datatable__filter';

        this.filterInput = document.createElement('input');
        this.filterInput.type = 'text';
        this.filterInput.placeholder = 'Search...';
        this.filterInput.setAttribute('aria-label', 'Filter table');

        this.events.push(Utils.addEvent(this.filterInput, 'input', function(e) {
          this._debouncedFilter(e.target.value);
        }.bind(this)));

        filterWrap.appendChild(this.filterInput);
        toolbar.appendChild(filterWrap);
      }

      if (this.exportable) {
        var exportBtn = document.createElement('button');
        exportBtn.className = 'battersea-datatable__export-btn';
        exportBtn.textContent = 'Export CSV';
        exportBtn.type = 'button';

        this.events.push(Utils.addEvent(exportBtn, 'click', function() {
          this.handleExport();
        }.bind(this)));

        toolbar.appendChild(exportBtn);
      }

      return toolbar;
    }

    buildTable() {
      this.table = document.createElement('table');
      this.table.className = 'battersea-datatable__table';
      if (this.striped) {
        this.table.classList.add('battersea-datatable__table--striped');
      }
      if (this.resizable) {
        this.table.style.tableLayout = 'fixed';
      }

      // thead
      this.thead = document.createElement('thead');
      var headerRow = document.createElement('tr');

      // Select-all column
      if (this.selectable) {
        var selectTh = document.createElement('th');
        selectTh.className = 'battersea-datatable__th battersea-datatable__th--select';
        this.selectAllCheckbox = document.createElement('input');
        this.selectAllCheckbox.type = 'checkbox';
        this.selectAllCheckbox.setAttribute('aria-label', 'Select all rows');
        this.events.push(Utils.addEvent(this.selectAllCheckbox, 'change', function() {
          this.handleSelectAll();
        }.bind(this)));
        selectTh.appendChild(this.selectAllCheckbox);
        headerRow.appendChild(selectTh);
      }

      // Data columns
      this.columns.forEach(function(col) {
        var th = document.createElement('th');
        th.className = 'battersea-datatable__th';
        th.setAttribute('data-column-key', col.key);

        var label = document.createElement('span');
        label.className = 'battersea-datatable__th-label';
        label.textContent = col.label;
        th.appendChild(label);

        if (col.width) {
          th.style.width = col.width;
        }

        // Sortable
        if (this.sortable && col.sortable !== false) {
          th.classList.add('battersea-datatable__th--sortable');
          th.setAttribute('role', 'button');
          th.setAttribute('tabindex', '0');
          th.setAttribute('aria-sort', 'none');

          var indicator = document.createElement('span');
          indicator.className = 'battersea-datatable__sort-indicator';
          indicator.setAttribute('aria-hidden', 'true');
          th.appendChild(indicator);

          this.events.push(Utils.addEvent(th, 'click', function(key) {
            this.handleSort(key);
          }.bind(this, col.key)));

          this.events.push(Utils.addEvent(th, 'keydown', function(key, e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.handleSort(key);
            }
          }.bind(this, col.key)));
        }

        // Resize handle
        if (this.resizable) {
          var handle = document.createElement('div');
          handle.className = 'battersea-datatable__resize-handle';
          handle.setAttribute('aria-hidden', 'true');
          th.appendChild(handle);
          this.setupResizeHandle(th, handle);
        }

        headerRow.appendChild(th);
      }.bind(this));

      this.thead.appendChild(headerRow);
      this.table.appendChild(this.thead);

      // tbody
      this.tbody = document.createElement('tbody');
      this.table.appendChild(this.tbody);
    }

    setupResizeHandle(th, handle) {
      var startX, startWidth;
      var self = this;

      var onMouseMove = Utils.throttle(function(e) {
        var delta = e.clientX - startX;
        var newWidth = Math.max(50, startWidth + delta);
        th.style.width = newWidth + 'px';
      }, 16);

      var onMouseUp = function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        handle.classList.remove('battersea-datatable__resize-handle--active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      this.events.push(Utils.addEvent(handle, 'mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        startX = e.clientX;
        startWidth = th.offsetWidth;
        handle.classList.add('battersea-datatable__resize-handle--active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }));

      // Store for cleanup
      this._resizeCleanup = this._resizeCleanup || [];
      this._resizeCleanup.push(function() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      });
    }

    // ─── Interaction Handlers ────────────────────────

    handleSort(columnKey) {
      if (this.sortColumn === columnKey) {
        if (this.sortDirection === 'asc') {
          this.sortDirection = 'desc';
        } else if (this.sortDirection === 'desc') {
          this.sortColumn = null;
          this.sortDirection = null;
        }
      } else {
        this.sortColumn = columnKey;
        this.sortDirection = 'asc';
      }

      this.render();

      this.el.dispatchEvent(new CustomEvent('battersea:tableSort', {
        detail: { column: this.sortColumn, direction: this.sortDirection }
      }));

      if (this.sortColumn) {
        var col = this.columns.find(function(c) { return c.key === columnKey; });
        this.announce('Sorted by ' + col.label + ' ' + (this.sortDirection === 'asc' ? 'ascending' : 'descending'));
      } else {
        this.announce('Sort cleared');
      }
    }

    handlePageChange(page) {
      var totalPages = this.getTotalPages();
      if (page < 1 || page > totalPages) return;

      this.currentPage = page;
      this.render();

      this.el.dispatchEvent(new CustomEvent('battersea:tablePageChange', {
        detail: { page: this.currentPage, pageSize: this.pageSize }
      }));
    }

    handleRowSelect(originalIndex) {
      if (this.selectedRows.has(originalIndex)) {
        this.selectedRows.delete(originalIndex);
      } else {
        this.selectedRows.add(originalIndex);
      }

      this.updateSelectAll();

      this.el.dispatchEvent(new CustomEvent('battersea:rowSelect', {
        detail: {
          selectedRows: Array.from(this.selectedRows),
          row: originalIndex
        }
      }));
    }

    handleSelectAll() {
      var allSelected = this.selectAllCheckbox.checked;

      this.displayData.forEach(function(row) {
        var idx = this.originalData.indexOf(row);
        if (allSelected) {
          this.selectedRows.add(idx);
        } else {
          this.selectedRows.delete(idx);
        }
      }.bind(this));

      this.renderTableBody();

      this.el.dispatchEvent(new CustomEvent('battersea:rowSelect', {
        detail: {
          selectedRows: Array.from(this.selectedRows),
          row: null
        }
      }));
    }

    updateSelectAll() {
      if (!this.selectAllCheckbox) return;
      var allChecked = this.displayData.length > 0 && this.displayData.every(function(row) {
        return this.selectedRows.has(this.originalData.indexOf(row));
      }.bind(this));
      this.selectAllCheckbox.checked = allChecked;
    }

    handleExport() {
      var csv = this.generateCSV();
      this.downloadCSV(csv);

      this.el.dispatchEvent(new CustomEvent('battersea:tableExport', {
        detail: { data: this.filteredData, format: 'csv' }
      }));
    }

    // ─── Data Operations ─────────────────────────────

    sortData() {
      if (!this.sortColumn || !this.sortDirection) {
        this.data = this.originalData.slice();
        return;
      }

      var col = this.columns.find(function(c) { return c.key === this.sortColumn; }.bind(this));
      var type = col ? col.type : 'string';
      var dir = this.sortDirection === 'asc' ? 1 : -1;
      var key = this.sortColumn;
      var self = this;

      this.data = this.originalData.slice();
      this.data.sort(function(a, b) {
        return self.compareValues(self.getCellValue(a, key), self.getCellValue(b, key), type) * dir;
      });
    }

    filterData() {
      if (!this.filterQuery) {
        this.filteredData = this.data.slice();
        return;
      }

      var query = this.filterQuery.toLowerCase();
      var cols = this.columns;

      this.filteredData = this.data.filter(function(row) {
        return cols.some(function(col) {
          var val = String(row[col.key] || '').toLowerCase();
          return val.indexOf(query) !== -1;
        });
      });
    }

    paginateData() {
      if (this.pageSize <= 0) {
        this.displayData = this.filteredData.slice();
        return;
      }

      var start = (this.currentPage - 1) * this.pageSize;
      var end = start + this.pageSize;
      this.displayData = this.filteredData.slice(start, end);
    }

    getTotalPages() {
      if (this.pageSize <= 0) return 1;
      return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
    }

    // ─── Rendering ───────────────────────────────────

    render() {
      this.sortData();
      this.filterData();

      // Clamp page
      var totalPages = this.getTotalPages();
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }

      this.paginateData();
      this.renderTableBody();
      this.renderPagination();
      this.updateSortIndicators();
      this.updateSelectAll();
    }

    renderTableBody() {
      // Clear old event listeners from checkboxes
      this.tbody.innerHTML = '';

      if (this.displayData.length === 0) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        var colSpan = this.columns.length + (this.selectable ? 1 : 0);
        td.setAttribute('colspan', colSpan);
        td.className = 'battersea-datatable__empty';
        td.textContent = this.filterQuery ? 'No matching rows found' : 'No data available';
        tr.appendChild(td);
        this.tbody.appendChild(tr);
        return;
      }

      this.displayData.forEach(function(rowData, displayIndex) {
        var originalIndex = this.originalData.indexOf(rowData);
        var tr = document.createElement('tr');
        tr.className = 'battersea-datatable__row';

        if (this.selectedRows.has(originalIndex)) {
          tr.classList.add('battersea-datatable__row--selected');
        }

        // Selection checkbox
        if (this.selectable) {
          var selectTd = document.createElement('td');
          selectTd.className = 'battersea-datatable__td battersea-datatable__td--select';
          var checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = this.selectedRows.has(originalIndex);
          checkbox.setAttribute('aria-label', 'Select row ' + (displayIndex + 1));

          // Use closure for index
          (function(idx, cb, self) {
            self.events.push(Utils.addEvent(cb, 'change', function() {
              self.handleRowSelect(idx);
            }));
          })(originalIndex, checkbox, this);

          selectTd.appendChild(checkbox);
          tr.appendChild(selectTd);
        }

        // Data cells
        this.columns.forEach(function(col) {
          var td = document.createElement('td');
          td.className = 'battersea-datatable__td';
          td.setAttribute('data-label', col.label);
          td.textContent = rowData[col.key] !== undefined ? rowData[col.key] : '';
          tr.appendChild(td);
        });

        this.tbody.appendChild(tr);
      }.bind(this));
    }

    renderPagination() {
      if (!this.paginationContainer) return;

      this.paginationContainer.innerHTML = '';
      var totalPages = this.getTotalPages();
      var totalRows = this.filteredData.length;
      var start = (this.currentPage - 1) * this.pageSize + 1;
      var end = Math.min(this.currentPage * this.pageSize, totalRows);

      // Info text
      var info = document.createElement('div');
      info.className = 'battersea-datatable__pagination-info';
      if (totalRows === 0) {
        info.textContent = '0 rows';
      } else {
        info.textContent = 'Showing ' + start + '\u2013' + end + ' of ' + totalRows + ' rows';
      }
      this.paginationContainer.appendChild(info);

      // Controls
      var controls = document.createElement('div');
      controls.className = 'battersea-datatable__pagination-controls';

      // Prev button
      var prevBtn = this.createPageButton('\u2039', this.currentPage - 1, this.currentPage <= 1);
      prevBtn.setAttribute('aria-label', 'Previous page');
      controls.appendChild(prevBtn);

      // Page numbers
      var pages = this.getPageRange(this.currentPage, totalPages);
      pages.forEach(function(p) {
        if (p === '...') {
          var ellipsis = document.createElement('span');
          ellipsis.className = 'battersea-datatable__page-ellipsis';
          ellipsis.textContent = '\u2026';
          controls.appendChild(ellipsis);
        } else {
          var btn = this.createPageButton(p, p, false);
          if (p === this.currentPage) {
            btn.classList.add('battersea-datatable__page-btn--active');
            btn.setAttribute('aria-current', 'page');
          }
          controls.appendChild(btn);
        }
      }.bind(this));

      // Next button
      var nextBtn = this.createPageButton('\u203A', this.currentPage + 1, this.currentPage >= totalPages);
      nextBtn.setAttribute('aria-label', 'Next page');
      controls.appendChild(nextBtn);

      this.paginationContainer.appendChild(controls);
    }

    createPageButton(label, page, disabled) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'battersea-datatable__page-btn';
      btn.textContent = label;
      btn.disabled = disabled;

      if (!disabled) {
        this.events.push(Utils.addEvent(btn, 'click', function() {
          this.handlePageChange(page);
        }.bind(this)));
      }

      return btn;
    }

    getPageRange(current, total) {
      if (total <= 7) {
        var result = [];
        for (var i = 1; i <= total; i++) result.push(i);
        return result;
      }

      if (current <= 4) {
        return [1, 2, 3, 4, 5, '...', total];
      }

      if (current >= total - 3) {
        return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
      }

      return [1, '...', current - 1, current, current + 1, '...', total];
    }

    updateSortIndicators() {
      var headers = Utils.qsa('.battersea-datatable__th--sortable', this.thead);
      headers.forEach(function(th) {
        var key = th.getAttribute('data-column-key');
        if (key === this.sortColumn) {
          th.setAttribute('aria-sort', this.sortDirection === 'asc' ? 'ascending' : 'descending');
        } else {
          th.setAttribute('aria-sort', 'none');
        }
      }.bind(this));
    }

    // ─── Export ──────────────────────────────────────

    generateCSV() {
      var cols = this.columns;
      var headers = cols.map(function(col) {
        return '"' + col.label.replace(/"/g, '""') + '"';
      }).join(',');

      var rows = this.filteredData.map(function(row) {
        return cols.map(function(col) {
          var val = row[col.key] !== undefined ? String(row[col.key]) : '';
          return '"' + val.replace(/"/g, '""') + '"';
        }).join(',');
      });

      return headers + '\n' + rows.join('\n');
    }

    downloadCSV(csvString) {
      var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'table-export.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    // ─── Utilities ───────────────────────────────────

    getCellValue(row, key) {
      return row[key] !== undefined ? row[key] : '';
    }

    compareValues(a, b, type) {
      if (a === b) return 0;
      if (a === '' || a === null || a === undefined) return 1;
      if (b === '' || b === null || b === undefined) return -1;

      if (type === 'number') {
        var numA = parseFloat(a);
        var numB = parseFloat(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
      }

      if (type === 'date') {
        var dateA = new Date(a);
        var dateB = new Date(b);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateA.getTime() - dateB.getTime();
      }

      // String comparison
      return String(a).localeCompare(String(b));
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
      if (this._resizeCleanup) {
        this._resizeCleanup.forEach(function(fn) { fn(); });
      }
      if (this.wrapper && this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
    }
  }

  // Register component
  window.Battersea.register('dataTable', DataTable, '[data-datatable]');

})(window, document);
