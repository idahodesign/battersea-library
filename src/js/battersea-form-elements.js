/**
 * Battersea Library - FormElements Component
 * Version: 2.23.0
 *
 * Advanced form input types: toggle switch, range slider, date picker,
 * time picker, and colour swatch. Works standalone or with FormValidation.
 *
 * Usage:
 * <div data-form-elements>
 *   <input type="checkbox" name="agree" data-toggle>
 *   <input type="hidden" name="brightness" data-slider-input data-slider-min="0" data-slider-max="100">
 *   <input type="text" name="date" data-datepicker>
 *   <input type="text" name="time" data-timepicker>
 *   <input type="hidden" name="colour" data-colourswatch data-colourswatch-colours="#f00,#0f0,#00f">
 * </div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('FormElements requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;

  class FormElements {
    constructor(el) {
      this.el = el;
      this.events = [];
      this.elements = [];

      this.init();
    }

    init() {
      this.initToggles();
      this.initSliders();
      this.initDatePickers();
      this.initTimePickers();
      this.initColourSwatches();

      // Single document-level click handler for closing dropdowns
      this._onDocClick = (e) => this.handleDocumentClick(e);
      this.events.push(
        Utils.addEvent(document, 'click', this._onDocClick)
      );
    }

    // ──────────────────────────────────────────────
    // Shared Helpers
    // ──────────────────────────────────────────────

    dispatchChange(input, type) {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));

      this.el.dispatchEvent(new CustomEvent('battersea:formElementChange', {
        bubbles: true,
        detail: {
          name: input.name || '',
          value: input.type === 'checkbox' ? input.checked : input.value,
          type: type
        }
      }));
    }

    getPointerX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    getPointerY(e) {
      return e.touches ? e.touches[0].clientY : e.clientY;
    }

    positionDropdown(trigger, dropdown) {
      var rect = trigger.getBoundingClientRect();
      var spaceBelow = window.innerHeight - rect.bottom;
      var dropHeight = dropdown.offsetHeight || 300;

      var parent = dropdown.parentElement;
      if (spaceBelow < dropHeight && rect.top > dropHeight) {
        parent.classList.add('battersea-fe--flip');
      } else {
        parent.classList.remove('battersea-fe--flip');
      }
    }

    handleDocumentClick(e) {
      // Close any open dropdowns if click is outside
      this.elements.forEach(function(elem) {
        if (elem.closeIfOutside) {
          elem.closeIfOutside(e);
        }
      });
    }

    // ──────────────────────────────────────────────
    // Toggle Switch
    // ──────────────────────────────────────────────

    initToggles() {
      var self = this;
      var inputs = Utils.qsa('[data-toggle]', this.el);

      inputs.forEach(function(input) {
        if (input.type !== 'checkbox') {
          console.warn('FormElements: data-toggle should be on a checkbox input');
          return;
        }

        var onLabel = Utils.getData(input, 'toggle-on') || 'On';
        var offLabel = Utils.getData(input, 'toggle-off') || 'Off';

        // Check for data-toggle-checked attribute
        if (input.hasAttribute('data-toggle-checked')) {
          input.checked = true;
        }

        // Build wrapper
        var wrapper = document.createElement('label');
        wrapper.className = 'battersea-toggle';
        if (input.checked) {
          wrapper.classList.add('battersea-toggle--checked');
        }

        // Insert wrapper before input, then move input inside
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Add role="switch" for accessibility
        input.setAttribute('role', 'switch');
        input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
        input.classList.add('battersea-toggle__input');

        // Track
        var track = document.createElement('span');
        track.className = 'battersea-toggle__track';
        var thumb = document.createElement('span');
        thumb.className = 'battersea-toggle__thumb';
        track.appendChild(thumb);
        wrapper.appendChild(track);

        // Label text
        var labelEl = document.createElement('span');
        labelEl.className = 'battersea-toggle__label';
        labelEl.textContent = input.checked ? onLabel : offLabel;
        wrapper.appendChild(labelEl);

        // Change handler
        self.events.push(
          Utils.addEvent(input, 'change', function() {
            wrapper.classList.toggle('battersea-toggle--checked', input.checked);
            input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
            labelEl.textContent = input.checked ? onLabel : offLabel;
            self.dispatchChange(input, 'toggle');
          })
        );

        // Store for cleanup
        self.elements.push({
          type: 'toggle',
          input: input,
          wrapper: wrapper,
          destroy: function() {
            // Move input back out of wrapper
            if (wrapper.parentNode) {
              wrapper.parentNode.insertBefore(input, wrapper);
              wrapper.parentNode.removeChild(wrapper);
            }
            input.classList.remove('battersea-toggle__input');
            input.removeAttribute('role');
            input.removeAttribute('aria-checked');
          }
        });
      });
    }

    // ──────────────────────────────────────────────
    // Range Slider
    // ──────────────────────────────────────────────

    initSliders() {
      var self = this;
      var inputs = Utils.qsa('[data-slider-input]', this.el);

      inputs.forEach(function(input) {
        var min = parseFloat(Utils.getData(input, 'slider-min')) || 0;
        var max = parseFloat(Utils.getData(input, 'slider-max'));
        if (isNaN(max)) max = 100;
        var step = parseFloat(Utils.getData(input, 'slider-step')) || 1;
        var value = parseFloat(Utils.getData(input, 'slider-value'));
        if (isNaN(value)) value = min + (max - min) / 2;
        var labelTemplate = Utils.getData(input, 'slider-label') || '{value}';

        // Set initial value on input
        input.value = value;
        if (input.type !== 'hidden') {
          input.type = 'hidden';
        }

        // Build structure
        var wrapper = document.createElement('div');
        wrapper.className = 'battersea-slider-input';

        var trackEl = document.createElement('div');
        trackEl.className = 'battersea-slider-input__track';
        trackEl.setAttribute('role', 'slider');
        trackEl.setAttribute('tabindex', '0');
        trackEl.setAttribute('aria-valuemin', min);
        trackEl.setAttribute('aria-valuemax', max);
        trackEl.setAttribute('aria-valuenow', value);
        if (input.name) {
          trackEl.setAttribute('aria-label', input.name);
        }

        var fill = document.createElement('div');
        fill.className = 'battersea-slider-input__fill';

        var handle = document.createElement('div');
        handle.className = 'battersea-slider-input__handle';

        trackEl.appendChild(fill);
        trackEl.appendChild(handle);

        var valueEl = document.createElement('div');
        valueEl.className = 'battersea-slider-input__value';

        wrapper.appendChild(trackEl);
        wrapper.appendChild(valueEl);

        // Insert wrapper after input
        input.parentNode.insertBefore(wrapper, input.nextSibling);
        wrapper.insertBefore(input, wrapper.firstChild);

        // Update display
        function updateDisplay(val) {
          var pct = ((val - min) / (max - min)) * 100;
          fill.style.width = pct + '%';
          handle.style.left = pct + '%';
          trackEl.setAttribute('aria-valuenow', val);
          valueEl.textContent = labelTemplate.replace('{value}', val);
        }

        function snapToStep(val) {
          val = Math.round((val - min) / step) * step + min;
          return Math.max(min, Math.min(max, parseFloat(val.toFixed(10))));
        }

        function setValueFromPct(pct) {
          var raw = min + (pct / 100) * (max - min);
          var snapped = snapToStep(raw);
          input.value = snapped;
          updateDisplay(snapped);
        }

        updateDisplay(value);

        // Drag state
        var isDragging = false;

        function startDrag(e) {
          isDragging = true;
          wrapper.classList.add('battersea-slider-input--dragging');
          var rect = trackEl.getBoundingClientRect();
          var x = self.getPointerX(e) - rect.left;
          var pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
          setValueFromPct(pct);
        }

        function onDrag(e) {
          if (!isDragging) return;
          var rect = trackEl.getBoundingClientRect();
          var x = self.getPointerX(e) - rect.left;
          var pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
          setValueFromPct(pct);
        }

        function stopDrag() {
          if (!isDragging) return;
          isDragging = false;
          wrapper.classList.remove('battersea-slider-input--dragging');
          self.dispatchChange(input, 'slider');
        }

        // Mouse events on track
        self.events.push(
          Utils.addEvent(trackEl, 'mousedown', function(e) {
            e.preventDefault();
            startDrag(e);
          })
        );
        self.events.push(
          Utils.addEvent(trackEl, 'touchstart', function(e) {
            startDrag(e);
          }, { passive: true })
        );

        // Document-level drag
        self.events.push(
          Utils.addEvent(document, 'mousemove', function(e) {
            if (isDragging) onDrag(e);
          })
        );
        self.events.push(
          Utils.addEvent(document, 'mouseup', stopDrag)
        );
        self.events.push(
          Utils.addEvent(document, 'touchmove', function(e) {
            if (isDragging) {
              e.preventDefault();
              onDrag(e);
            }
          }, { passive: false })
        );
        self.events.push(
          Utils.addEvent(document, 'touchend', stopDrag)
        );

        // Keyboard
        self.events.push(
          Utils.addEvent(trackEl, 'keydown', function(e) {
            var val = parseFloat(input.value);
            var changed = false;

            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault();
              val = snapToStep(val + step);
              changed = true;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              val = snapToStep(val - step);
              changed = true;
            } else if (e.key === 'Home') {
              e.preventDefault();
              val = min;
              changed = true;
            } else if (e.key === 'End') {
              e.preventDefault();
              val = max;
              changed = true;
            }

            if (changed) {
              input.value = val;
              updateDisplay(val);
              self.dispatchChange(input, 'slider');
            }
          })
        );

        self.elements.push({
          type: 'slider',
          input: input,
          wrapper: wrapper,
          destroy: function() {
            if (wrapper.parentNode) {
              wrapper.parentNode.insertBefore(input, wrapper);
              wrapper.parentNode.removeChild(wrapper);
            }
          }
        });
      });
    }

    // ──────────────────────────────────────────────
    // Date Picker
    // ──────────────────────────────────────────────

    initDatePickers() {
      var self = this;
      var inputs = Utils.qsa('[data-datepicker]', this.el);

      inputs.forEach(function(input) {
        var isNative = Utils.getData(input, 'datepicker-native') === 'true';
        var format = Utils.getData(input, 'datepicker-format') || 'DD/MM/YYYY';
        var minStr = Utils.getData(input, 'datepicker-min') || '';
        var maxStr = Utils.getData(input, 'datepicker-max') || '';

        if (isNative) {
          // Native mode: change type to date, apply min/max, style wrapper
          input.type = 'date';
          var nativeWrapper = document.createElement('div');
          nativeWrapper.className = 'battersea-datepicker battersea-datepicker--native';
          input.parentNode.insertBefore(nativeWrapper, input);
          nativeWrapper.appendChild(input);

          if (minStr) input.min = self.formatToISO(self.parseDate(minStr, format));
          if (maxStr) input.max = self.formatToISO(self.parseDate(maxStr, format));

          self.elements.push({
            type: 'datepicker-native',
            input: input,
            wrapper: nativeWrapper,
            destroy: function() {
              if (nativeWrapper.parentNode) {
                nativeWrapper.parentNode.insertBefore(input, nativeWrapper);
                nativeWrapper.parentNode.removeChild(nativeWrapper);
              }
              input.type = 'text';
              input.removeAttribute('min');
              input.removeAttribute('max');
            }
          });
          return;
        }

        // Custom calendar mode
        input.setAttribute('readonly', 'readonly');
        input.classList.add('battersea-datepicker__input');

        var wrapper = document.createElement('div');
        wrapper.className = 'battersea-datepicker';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Calendar icon
        var icon = document.createElement('span');
        icon.className = 'battersea-datepicker__icon';
        icon.innerHTML = '&#128197;';
        icon.setAttribute('aria-hidden', 'true');
        wrapper.appendChild(icon);

        // Dropdown
        var dropdown = document.createElement('div');
        dropdown.className = 'battersea-datepicker__dropdown';
        dropdown.setAttribute('role', 'dialog');
        dropdown.setAttribute('aria-label', 'Choose date');
        wrapper.appendChild(dropdown);

        var minDate = minStr ? self.parseDate(minStr, format) : null;
        var maxDate = maxStr ? self.parseDate(maxStr, format) : null;

        // State
        var today = new Date();
        var viewYear = today.getFullYear();
        var viewMonth = today.getMonth();
        var selectedDate = null;
        var isOpen = false;

        // If input already has a value, parse it
        if (input.value) {
          var parsed = self.parseDate(input.value, format);
          if (parsed) {
            selectedDate = parsed;
            viewYear = parsed.getFullYear();
            viewMonth = parsed.getMonth();
          }
        }

        function buildCalendar() {
          dropdown.innerHTML = '';

          // Header row
          var header = document.createElement('div');
          header.className = 'battersea-datepicker__header';

          var prevBtn = document.createElement('button');
          prevBtn.type = 'button';
          prevBtn.className = 'battersea-datepicker__prev';
          prevBtn.innerHTML = '\u2039';
          prevBtn.setAttribute('aria-label', 'Previous month');

          var monthYear = document.createElement('span');
          monthYear.className = 'battersea-datepicker__month-year';
          var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          monthYear.textContent = months[viewMonth] + ' ' + viewYear;

          var nextBtn = document.createElement('button');
          nextBtn.type = 'button';
          nextBtn.className = 'battersea-datepicker__next';
          nextBtn.innerHTML = '\u203A';
          nextBtn.setAttribute('aria-label', 'Next month');

          header.appendChild(prevBtn);
          header.appendChild(monthYear);
          header.appendChild(nextBtn);
          dropdown.appendChild(header);

          // Weekday labels (Mon-Sun)
          var weekdays = document.createElement('div');
          weekdays.className = 'battersea-datepicker__weekdays';
          var dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
          dayNames.forEach(function(d) {
            var span = document.createElement('span');
            span.textContent = d;
            weekdays.appendChild(span);
          });
          dropdown.appendChild(weekdays);

          // Days grid
          var grid = document.createElement('div');
          grid.className = 'battersea-datepicker__days';
          grid.setAttribute('role', 'grid');

          // First day of month (0=Sun, convert to Mon=0)
          var firstDay = new Date(viewYear, viewMonth, 1).getDay();
          firstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0

          var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
          var daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

          // Previous month filler
          for (var p = firstDay - 1; p >= 0; p--) {
            var dayNum = daysInPrev - p;
            var btn = createDayButton(dayNum, viewMonth - 1, viewYear, true);
            grid.appendChild(btn);
          }

          // Current month days
          for (var d = 1; d <= daysInMonth; d++) {
            var btn = createDayButton(d, viewMonth, viewYear, false);
            grid.appendChild(btn);
          }

          // Next month filler (fill to 42 cells)
          var totalCells = firstDay + daysInMonth;
          var rows = totalCells <= 35 ? 35 : 42;
          var remaining = rows - totalCells;
          for (var n = 1; n <= remaining; n++) {
            var btn = createDayButton(n, viewMonth + 1, viewYear, true);
            grid.appendChild(btn);
          }

          dropdown.appendChild(grid);

          // Navigation events
          self.events.push(
            Utils.addEvent(prevBtn, 'click', function(e) {
              e.stopPropagation();
              viewMonth--;
              if (viewMonth < 0) { viewMonth = 11; viewYear--; }
              buildCalendar();
            })
          );
          self.events.push(
            Utils.addEvent(nextBtn, 'click', function(e) {
              e.stopPropagation();
              viewMonth++;
              if (viewMonth > 11) { viewMonth = 0; viewYear++; }
              buildCalendar();
            })
          );
        }

        function createDayButton(day, month, year, isOutside) {
          // Normalise month/year for overflow
          var date = new Date(year, month, day);
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'battersea-datepicker__day';
          btn.textContent = date.getDate();
          btn.setAttribute('data-date', self.formatToISO(date));

          if (isOutside) {
            btn.classList.add('battersea-datepicker__day--outside');
          }

          // Today
          if (date.toDateString() === today.toDateString()) {
            btn.classList.add('battersea-datepicker__day--today');
          }

          // Selected
          if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            btn.classList.add('battersea-datepicker__day--selected');
          }

          // Disabled (min/max)
          var disabled = false;
          if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
            disabled = true;
          }
          if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
            disabled = true;
          }
          if (disabled) {
            btn.classList.add('battersea-datepicker__day--disabled');
            btn.disabled = true;
          }

          // Click to select
          self.events.push(
            Utils.addEvent(btn, 'click', function(e) {
              e.stopPropagation();
              if (disabled) return;
              selectedDate = date;
              viewYear = date.getFullYear();
              viewMonth = date.getMonth();
              input.value = self.formatDate(date, format);
              closeCalendar();
              self.dispatchChange(input, 'datepicker');
            })
          );

          return btn;
        }

        function openCalendar() {
          if (isOpen) return;
          isOpen = true;

          // If there's a selected date, view that month
          if (selectedDate) {
            viewYear = selectedDate.getFullYear();
            viewMonth = selectedDate.getMonth();
          }

          buildCalendar();
          wrapper.classList.add('battersea-datepicker--open');
          self.positionDropdown(input, dropdown);
        }

        function closeCalendar() {
          if (!isOpen) return;
          isOpen = false;
          wrapper.classList.remove('battersea-datepicker--open');
          wrapper.classList.remove('battersea-fe--flip');
        }

        // Open on input click
        self.events.push(
          Utils.addEvent(input, 'click', function(e) {
            e.stopPropagation();
            if (isOpen) {
              closeCalendar();
            } else {
              openCalendar();
            }
          })
        );

        // Open on icon click
        self.events.push(
          Utils.addEvent(icon, 'click', function(e) {
            e.stopPropagation();
            if (isOpen) {
              closeCalendar();
            } else {
              openCalendar();
            }
          })
        );

        // Keyboard on input
        self.events.push(
          Utils.addEvent(input, 'keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              closeCalendar();
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (isOpen) {
                closeCalendar();
              } else {
                openCalendar();
              }
            }
          })
        );

        self.elements.push({
          type: 'datepicker',
          input: input,
          wrapper: wrapper,
          closeIfOutside: function(e) {
            if (isOpen && !wrapper.contains(e.target)) {
              closeCalendar();
            }
          },
          destroy: function() {
            closeCalendar();
            if (wrapper.parentNode) {
              wrapper.parentNode.insertBefore(input, wrapper);
              wrapper.parentNode.removeChild(wrapper);
            }
            input.removeAttribute('readonly');
            input.classList.remove('battersea-datepicker__input');
          }
        });
      });
    }

    // Date utility methods
    parseDate(str, format) {
      if (!str) return null;

      // Try ISO format first (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        var parts = str.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }

      var parts, day, month, year;

      if (format === 'DD/MM/YYYY' || format === 'dd/mm/yyyy') {
        parts = str.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      } else if (format === 'MM/DD/YYYY' || format === 'mm/dd/yyyy') {
        parts = str.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
      } else if (format === 'YYYY-MM-DD') {
        parts = str.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
      }

      return null;
    }

    formatDate(date, format) {
      var d = date.getDate();
      var m = date.getMonth() + 1;
      var y = date.getFullYear();
      var dd = d < 10 ? '0' + d : '' + d;
      var mm = m < 10 ? '0' + m : '' + m;

      if (format === 'DD/MM/YYYY' || format === 'dd/mm/yyyy') {
        return dd + '/' + mm + '/' + y;
      } else if (format === 'MM/DD/YYYY' || format === 'mm/dd/yyyy') {
        return mm + '/' + dd + '/' + y;
      } else if (format === 'YYYY-MM-DD') {
        return y + '-' + mm + '-' + dd;
      }
      return dd + '/' + mm + '/' + y;
    }

    formatToISO(date) {
      if (!date) return '';
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      var d = date.getDate();
      return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
    }

    // ──────────────────────────────────────────────
    // Time Picker
    // ──────────────────────────────────────────────

    initTimePickers() {
      var self = this;
      var inputs = Utils.qsa('[data-timepicker]', this.el);

      inputs.forEach(function(input) {
        var format = Utils.getData(input, 'timepicker-format') || '24';
        var step = parseInt(Utils.getData(input, 'timepicker-step')) || 15;
        var minTime = Utils.getData(input, 'timepicker-min') || '';
        var maxTime = Utils.getData(input, 'timepicker-max') || '';

        input.setAttribute('readonly', 'readonly');
        input.classList.add('battersea-timepicker__input');

        var wrapper = document.createElement('div');
        wrapper.className = 'battersea-timepicker';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Clock icon
        var icon = document.createElement('span');
        icon.className = 'battersea-timepicker__icon';
        icon.innerHTML = '&#128339;';
        icon.setAttribute('aria-hidden', 'true');
        wrapper.appendChild(icon);

        // Dropdown
        var dropdown = document.createElement('div');
        dropdown.className = 'battersea-timepicker__dropdown';
        dropdown.setAttribute('role', 'listbox');
        dropdown.setAttribute('aria-label', 'Choose time');
        wrapper.appendChild(dropdown);

        var isOpen = false;
        var selectedHour = null;
        var selectedMinute = null;
        var selectedPeriod = 'AM';

        // Parse existing value
        if (input.value) {
          var timeParts = input.value.match(/^(\d{1,2}):(\d{2})$/);
          if (timeParts) {
            selectedHour = parseInt(timeParts[1]);
            selectedMinute = parseInt(timeParts[2]);
            if (format === '12') {
              selectedPeriod = selectedHour >= 12 ? 'PM' : 'AM';
            }
          }
        }

        // Parse min/max times to minutes-since-midnight
        function timeToMinutes(str) {
          if (!str) return null;
          var parts = str.match(/^(\d{1,2}):(\d{2})$/);
          if (!parts) return null;
          return parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }

        var minMinutes = timeToMinutes(minTime);
        var maxMinutes = timeToMinutes(maxTime);

        function buildDropdown() {
          dropdown.innerHTML = '';

          var columns = document.createElement('div');
          columns.className = 'battersea-timepicker__columns';

          // Hours column
          var hoursCol = document.createElement('div');
          hoursCol.className = 'battersea-timepicker__col battersea-timepicker__hours';

          var hourStart = format === '12' ? 1 : 0;
          var hourEnd = format === '12' ? 12 : 23;

          for (var h = hourStart; h <= hourEnd; h++) {
            var hourBtn = document.createElement('button');
            hourBtn.type = 'button';
            hourBtn.className = 'battersea-timepicker__option';
            hourBtn.setAttribute('data-value', h);
            hourBtn.textContent = h < 10 ? '0' + h : '' + h;

            if (selectedHour !== null) {
              var displayHour = format === '12' ? (selectedHour % 12 || 12) : selectedHour;
              if (h === displayHour) {
                hourBtn.classList.add('battersea-timepicker__option--selected');
              }
            }

            (function(hour) {
              self.events.push(
                Utils.addEvent(hourBtn, 'click', function(e) {
                  e.stopPropagation();
                  selectHour(hour);
                })
              );
            })(h);

            hoursCol.appendChild(hourBtn);
          }

          // Separator
          var sep = document.createElement('div');
          sep.className = 'battersea-timepicker__separator';
          sep.textContent = ':';

          // Minutes column
          var minutesCol = document.createElement('div');
          minutesCol.className = 'battersea-timepicker__col battersea-timepicker__minutes';

          for (var m = 0; m < 60; m += step) {
            var minBtn = document.createElement('button');
            minBtn.type = 'button';
            minBtn.className = 'battersea-timepicker__option';
            minBtn.setAttribute('data-value', m);
            minBtn.textContent = m < 10 ? '0' + m : '' + m;

            if (selectedMinute !== null && m === selectedMinute) {
              minBtn.classList.add('battersea-timepicker__option--selected');
            }

            (function(minute) {
              self.events.push(
                Utils.addEvent(minBtn, 'click', function(e) {
                  e.stopPropagation();
                  selectMinute(minute);
                })
              );
            })(m);

            minutesCol.appendChild(minBtn);
          }

          columns.appendChild(hoursCol);
          columns.appendChild(sep);
          columns.appendChild(minutesCol);

          // AM/PM column for 12h format
          if (format === '12') {
            var periodCol = document.createElement('div');
            periodCol.className = 'battersea-timepicker__col battersea-timepicker__period';

            ['AM', 'PM'].forEach(function(period) {
              var pBtn = document.createElement('button');
              pBtn.type = 'button';
              pBtn.className = 'battersea-timepicker__option';
              pBtn.setAttribute('data-value', period);
              pBtn.textContent = period;

              if (selectedPeriod === period) {
                pBtn.classList.add('battersea-timepicker__option--selected');
              }

              self.events.push(
                Utils.addEvent(pBtn, 'click', function(e) {
                  e.stopPropagation();
                  selectPeriod(period);
                })
              );

              periodCol.appendChild(pBtn);
            });

            columns.appendChild(periodCol);
          }

          dropdown.appendChild(columns);

          // Scroll selected items into view after render
          setTimeout(function() {
            scrollToSelected(hoursCol);
            scrollToSelected(minutesCol);
          }, 0);
        }

        function scrollToSelected(col) {
          var selected = col.querySelector('.battersea-timepicker__option--selected');
          if (selected) {
            selected.scrollIntoView({ block: 'center', behavior: 'instant' });
          }
        }

        function selectHour(h) {
          selectedHour = h;
          updateSelectedClass(wrapper.querySelector('.battersea-timepicker__hours'), h);
          updateValue();
        }

        function selectMinute(m) {
          selectedMinute = m;
          updateSelectedClass(wrapper.querySelector('.battersea-timepicker__minutes'), m);
          updateValue();
        }

        function selectPeriod(p) {
          selectedPeriod = p;
          var periodCol = wrapper.querySelector('.battersea-timepicker__period');
          if (periodCol) {
            Utils.qsa('.battersea-timepicker__option', periodCol).forEach(function(btn) {
              btn.classList.toggle('battersea-timepicker__option--selected', btn.getAttribute('data-value') === p);
            });
          }
          updateValue();
        }

        function updateSelectedClass(col, value) {
          if (!col) return;
          Utils.qsa('.battersea-timepicker__option', col).forEach(function(btn) {
            btn.classList.toggle('battersea-timepicker__option--selected', parseInt(btn.getAttribute('data-value')) === value);
          });
        }

        function updateValue() {
          if (selectedHour === null || selectedMinute === null) return;

          // Convert to 24h internally
          var hour24 = selectedHour;
          if (format === '12') {
            if (selectedPeriod === 'AM' && selectedHour === 12) hour24 = 0;
            else if (selectedPeriod === 'PM' && selectedHour !== 12) hour24 = selectedHour + 12;
          }

          var totalMinutes = hour24 * 60 + selectedMinute;

          // Check min/max
          if (minMinutes !== null && totalMinutes < minMinutes) return;
          if (maxMinutes !== null && totalMinutes > maxMinutes) return;

          // Display value
          var displayHour, displayMinute;
          displayMinute = selectedMinute < 10 ? '0' + selectedMinute : '' + selectedMinute;

          if (format === '12') {
            displayHour = selectedHour < 10 ? '0' + selectedHour : '' + selectedHour;
            input.value = displayHour + ':' + displayMinute + ' ' + selectedPeriod;
          } else {
            displayHour = hour24 < 10 ? '0' + hour24 : '' + hour24;
            input.value = displayHour + ':' + displayMinute;
          }

          self.dispatchChange(input, 'timepicker');
        }

        function openDropdown() {
          if (isOpen) return;
          isOpen = true;
          buildDropdown();
          wrapper.classList.add('battersea-timepicker--open');
          self.positionDropdown(input, dropdown);
        }

        function closeDropdown() {
          if (!isOpen) return;
          isOpen = false;
          wrapper.classList.remove('battersea-timepicker--open');
          wrapper.classList.remove('battersea-fe--flip');
        }

        // Events
        self.events.push(
          Utils.addEvent(input, 'click', function(e) {
            e.stopPropagation();
            isOpen ? closeDropdown() : openDropdown();
          })
        );
        self.events.push(
          Utils.addEvent(icon, 'click', function(e) {
            e.stopPropagation();
            isOpen ? closeDropdown() : openDropdown();
          })
        );
        self.events.push(
          Utils.addEvent(input, 'keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              closeDropdown();
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              isOpen ? closeDropdown() : openDropdown();
            }
          })
        );

        self.elements.push({
          type: 'timepicker',
          input: input,
          wrapper: wrapper,
          closeIfOutside: function(e) {
            if (isOpen && !wrapper.contains(e.target)) {
              closeDropdown();
            }
          },
          destroy: function() {
            closeDropdown();
            if (wrapper.parentNode) {
              wrapper.parentNode.insertBefore(input, wrapper);
              wrapper.parentNode.removeChild(wrapper);
            }
            input.removeAttribute('readonly');
            input.classList.remove('battersea-timepicker__input');
          }
        });
      });
    }

    // ──────────────────────────────────────────────
    // Colour Swatch
    // ──────────────────────────────────────────────

    initColourSwatches() {
      var self = this;
      var inputs = Utils.qsa('[data-colourswatch]', this.el);

      inputs.forEach(function(input) {
        var coloursStr = Utils.getData(input, 'colourswatch-colours') || '#FF0000,#FF8800,#FFCC00,#00CC00,#0088FF,#8800FF,#000000,#FFFFFF';
        var colours = coloursStr.split(',').map(function(c) { return c.trim(); });
        var hasPicker = Utils.getData(input, 'colourswatch-picker') === 'true';
        var initialValue = Utils.getData(input, 'colourswatch-value') || input.value || colours[0];

        if (input.type !== 'hidden') {
          input.type = 'hidden';
        }
        input.value = initialValue;

        var wrapper = document.createElement('div');
        wrapper.className = 'battersea-colourswatch';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Preview swatch
        var preview = document.createElement('button');
        preview.type = 'button';
        preview.className = 'battersea-colourswatch__preview';
        preview.style.backgroundColor = initialValue;
        preview.setAttribute('aria-label', 'Selected colour: ' + initialValue + '. Click to change.');
        wrapper.appendChild(preview);

        // Dropdown
        var dropdown = document.createElement('div');
        dropdown.className = 'battersea-colourswatch__dropdown';
        wrapper.appendChild(dropdown);

        // Swatch grid
        var grid = document.createElement('div');
        grid.className = 'battersea-colourswatch__grid';
        grid.setAttribute('role', 'radiogroup');
        grid.setAttribute('aria-label', 'Colour options');
        dropdown.appendChild(grid);

        var isOpen = false;
        var currentColour = initialValue;

        function buildSwatches() {
          grid.innerHTML = '';

          colours.forEach(function(colour) {
            var swatch = document.createElement('button');
            swatch.type = 'button';
            swatch.className = 'battersea-colourswatch__swatch';
            swatch.style.backgroundColor = colour;
            swatch.setAttribute('role', 'radio');
            swatch.setAttribute('aria-checked', colour.toLowerCase() === currentColour.toLowerCase() ? 'true' : 'false');
            swatch.setAttribute('aria-label', colour);
            swatch.setAttribute('data-colour', colour);

            if (colour.toLowerCase() === currentColour.toLowerCase()) {
              swatch.classList.add('battersea-colourswatch__swatch--selected');
            }

            // Checkmark
            var check = document.createElement('span');
            check.className = 'battersea-colourswatch__check';
            check.innerHTML = '\u2713';
            swatch.appendChild(check);

            self.events.push(
              Utils.addEvent(swatch, 'click', function(e) {
                e.stopPropagation();
                selectColour(colour);
                closeDropdown();
              })
            );

            grid.appendChild(swatch);
          });

          // Custom colour button if picker enabled
          if (hasPicker) {
            var customBtn = document.createElement('button');
            customBtn.type = 'button';
            customBtn.className = 'battersea-colourswatch__custom-btn';
            customBtn.textContent = '+';
            customBtn.setAttribute('aria-label', 'Pick custom colour');
            grid.appendChild(customBtn);

            self.events.push(
              Utils.addEvent(customBtn, 'click', function(e) {
                e.stopPropagation();
                togglePicker();
              })
            );
          }
        }

        function selectColour(colour) {
          currentColour = colour;
          input.value = colour;
          preview.style.backgroundColor = colour;
          preview.setAttribute('aria-label', 'Selected colour: ' + colour + '. Click to change.');

          // Update swatch states
          Utils.qsa('.battersea-colourswatch__swatch', grid).forEach(function(s) {
            var isSelected = s.getAttribute('data-colour').toLowerCase() === colour.toLowerCase();
            s.classList.toggle('battersea-colourswatch__swatch--selected', isSelected);
            s.setAttribute('aria-checked', isSelected ? 'true' : 'false');
          });

          // Update picker hex input if open
          var hexInput = dropdown.querySelector('.battersea-colourswatch__hex');
          if (hexInput) hexInput.value = colour;

          self.dispatchChange(input, 'colourswatch');
        }

        // ── Colour Picker ──

        var pickerEl = null;
        var pickerOpen = false;

        function togglePicker() {
          if (!pickerEl) {
            buildPicker();
          }
          pickerOpen = !pickerOpen;
          pickerEl.style.display = pickerOpen ? 'block' : 'none';
        }

        function buildPicker() {
          pickerEl = document.createElement('div');
          pickerEl.className = 'battersea-colourswatch__picker';
          pickerEl.style.display = 'none';
          dropdown.appendChild(pickerEl);

          // Saturation/Brightness area
          var satval = document.createElement('div');
          satval.className = 'battersea-colourswatch__satval';
          var pointer = document.createElement('div');
          pointer.className = 'battersea-colourswatch__pointer';
          satval.appendChild(pointer);
          pickerEl.appendChild(satval);

          // Hue bar
          var hueBar = document.createElement('div');
          hueBar.className = 'battersea-colourswatch__hue';
          var hueHandle = document.createElement('div');
          hueHandle.className = 'battersea-colourswatch__hue-handle';
          hueBar.appendChild(hueHandle);
          pickerEl.appendChild(hueBar);

          // Hex input
          var hexInput = document.createElement('input');
          hexInput.type = 'text';
          hexInput.className = 'battersea-colourswatch__hex';
          hexInput.value = currentColour;
          hexInput.maxLength = 7;
          hexInput.setAttribute('aria-label', 'Hex colour value');
          pickerEl.appendChild(hexInput);

          // State
          var hsv = hexToHSV(currentColour);
          updatePickerDisplay(hsv);

          // Satval drag
          var isDraggingSV = false;

          function startSVDrag(e) {
            isDraggingSV = true;
            onSVDrag(e);
          }
          function onSVDrag(e) {
            if (!isDraggingSV) return;
            var rect = satval.getBoundingClientRect();
            var x = self.getPointerX(e) - rect.left;
            var y = self.getPointerY(e) - rect.top;
            hsv.s = Math.max(0, Math.min(1, x / rect.width));
            hsv.v = Math.max(0, Math.min(1, 1 - (y / rect.height)));
            updatePickerDisplay(hsv);
            var hex = hsvToHex(hsv.h, hsv.s, hsv.v);
            hexInput.value = hex;
            selectColour(hex);
          }
          function stopSVDrag() {
            isDraggingSV = false;
          }

          self.events.push(Utils.addEvent(satval, 'mousedown', function(e) { e.preventDefault(); startSVDrag(e); }));
          self.events.push(Utils.addEvent(satval, 'touchstart', startSVDrag, { passive: true }));
          self.events.push(Utils.addEvent(document, 'mousemove', function(e) { if (isDraggingSV) onSVDrag(e); }));
          self.events.push(Utils.addEvent(document, 'mouseup', stopSVDrag));
          self.events.push(Utils.addEvent(document, 'touchmove', function(e) { if (isDraggingSV) { e.preventDefault(); onSVDrag(e); } }, { passive: false }));
          self.events.push(Utils.addEvent(document, 'touchend', stopSVDrag));

          // Hue drag
          var isDraggingHue = false;

          function startHueDrag(e) {
            isDraggingHue = true;
            onHueDrag(e);
          }
          function onHueDrag(e) {
            if (!isDraggingHue) return;
            var rect = hueBar.getBoundingClientRect();
            var x = self.getPointerX(e) - rect.left;
            hsv.h = Math.max(0, Math.min(1, x / rect.width));
            updatePickerDisplay(hsv);
            var hex = hsvToHex(hsv.h, hsv.s, hsv.v);
            hexInput.value = hex;
            selectColour(hex);
          }
          function stopHueDrag() {
            isDraggingHue = false;
          }

          self.events.push(Utils.addEvent(hueBar, 'mousedown', function(e) { e.preventDefault(); startHueDrag(e); }));
          self.events.push(Utils.addEvent(hueBar, 'touchstart', startHueDrag, { passive: true }));
          self.events.push(Utils.addEvent(document, 'mousemove', function(e) { if (isDraggingHue) onHueDrag(e); }));
          self.events.push(Utils.addEvent(document, 'mouseup', stopHueDrag));
          self.events.push(Utils.addEvent(document, 'touchmove', function(e) { if (isDraggingHue) { e.preventDefault(); onHueDrag(e); } }, { passive: false }));
          self.events.push(Utils.addEvent(document, 'touchend', stopHueDrag));

          // Hex input
          self.events.push(
            Utils.addEvent(hexInput, 'keydown', function(e) {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                var val = hexInput.value.trim();
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                  hsv = hexToHSV(val);
                  updatePickerDisplay(hsv);
                  selectColour(val);
                }
              }
            })
          );
          self.events.push(
            Utils.addEvent(hexInput, 'click', function(e) {
              e.stopPropagation();
            })
          );

          function updatePickerDisplay(hsv) {
            // Update satval background hue
            var hueColour = hsvToHex(hsv.h, 1, 1);
            satval.style.backgroundColor = hueColour;
            // Position pointer
            pointer.style.left = (hsv.s * 100) + '%';
            pointer.style.top = ((1 - hsv.v) * 100) + '%';
            // Position hue handle
            hueHandle.style.left = (hsv.h * 100) + '%';
          }
        }

        // Colour conversion utilities
        function hexToHSV(hex) {
          hex = hex.replace('#', '');
          var r = parseInt(hex.substring(0, 2), 16) / 255;
          var g = parseInt(hex.substring(2, 4), 16) / 255;
          var b = parseInt(hex.substring(4, 6), 16) / 255;

          var max = Math.max(r, g, b);
          var min = Math.min(r, g, b);
          var d = max - min;
          var h = 0, s = 0, v = max;

          if (d !== 0) {
            s = d / max;
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
          }

          return { h: h, s: s, v: v };
        }

        function hsvToHex(h, s, v) {
          var i = Math.floor(h * 6);
          var f = h * 6 - i;
          var p = v * (1 - s);
          var q = v * (1 - f * s);
          var t = v * (1 - (1 - f) * s);

          var r, g, b;
          switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
          }

          var toHex = function(c) {
            var hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          };

          return '#' + toHex(r) + toHex(g) + toHex(b);
        }

        // Open/close
        function openDropdown() {
          if (isOpen) return;
          isOpen = true;
          buildSwatches();
          wrapper.classList.add('battersea-colourswatch--open');
          self.positionDropdown(preview, dropdown);
        }

        function closeDropdown() {
          if (!isOpen) return;
          isOpen = false;
          pickerOpen = false;
          wrapper.classList.remove('battersea-colourswatch--open');
          wrapper.classList.remove('battersea-fe--flip');
        }

        self.events.push(
          Utils.addEvent(preview, 'click', function(e) {
            e.stopPropagation();
            isOpen ? closeDropdown() : openDropdown();
          })
        );

        // Keyboard on preview
        self.events.push(
          Utils.addEvent(preview, 'keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              closeDropdown();
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              isOpen ? closeDropdown() : openDropdown();
            }
          })
        );

        // Keyboard navigation on grid
        self.events.push(
          Utils.addEvent(grid, 'keydown', function(e) {
            var swatches = Utils.qsa('.battersea-colourswatch__swatch', grid);
            if (!swatches.length) return;

            var focused = document.activeElement;
            var idx = swatches.indexOf(focused);
            if (idx === -1) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              var next = idx + 1 < swatches.length ? idx + 1 : 0;
              swatches[next].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              var prev = idx - 1 >= 0 ? idx - 1 : swatches.length - 1;
              swatches[prev].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              var colour = focused.getAttribute('data-colour');
              if (colour) {
                selectColour(colour);
                closeDropdown();
              }
            } else if (e.key === 'Escape') {
              e.preventDefault();
              closeDropdown();
              preview.focus();
            }
          })
        );

        self.elements.push({
          type: 'colourswatch',
          input: input,
          wrapper: wrapper,
          closeIfOutside: function(e) {
            if (isOpen && !wrapper.contains(e.target)) {
              closeDropdown();
            }
          },
          destroy: function() {
            closeDropdown();
            if (wrapper.parentNode) {
              wrapper.parentNode.insertBefore(input, wrapper);
              wrapper.parentNode.removeChild(wrapper);
            }
          }
        });
      });
    }

    // ──────────────────────────────────────────────
    // Destroy
    // ──────────────────────────────────────────────

    destroy() {
      this.elements.forEach(function(elem) {
        if (elem.destroy) elem.destroy();
      });
      this.events.forEach(function(e) { e.remove(); });
      this.events = [];
      this.elements = [];
    }
  }

  window.Battersea.register('formElements', FormElements, '[data-form-elements]');

})(window, document);
