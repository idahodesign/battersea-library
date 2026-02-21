/**
 * Battersea Library - FormValidation Component
 * Version: 2.22.0
 *
 * Real-time form validation with password strength indicators,
 * file upload validation, custom rules, and optional AJAX submission.
 *
 * Usage:
 * <form data-form-validation>
 *   <input type="text" name="email" data-validate="required|email">
 *   <input type="password" name="password" data-validate="required|min:8|uppercase|lowercase|number|special">
 *   <input type="password" name="confirm" data-validate="required|match:password">
 *   <input type="file" name="document" data-validate="required|filetypes:pdf,doc|maxsize:5">
 *   <button type="submit">Submit</button>
 * </form>
 *
 * AJAX submission:
 * <form data-form-validation data-form-ajax="true" data-form-action="/api/submit">
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('FormValidation requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;

  // Default error messages
  var DEFAULT_MESSAGES = {
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid phone number.',
    url: 'Please enter a valid URL.',
    min: 'Must be at least {param} characters.',
    max: 'Must be no more than {param} characters.',
    number: 'Must contain at least one number.',
    uppercase: 'Must contain at least one uppercase letter.',
    lowercase: 'Must contain at least one lowercase letter.',
    special: 'Must contain at least one special character.',
    match: 'Fields do not match.',
    pattern: 'Invalid format.',
    filetypes: 'Allowed file types: {param}.',
    maxsize: 'File must be under {param} MB.'
  };

  // Password-related rules (trigger strength indicator)
  var PASSWORD_RULES = ['min', 'uppercase', 'lowercase', 'number', 'special'];

  class FormValidation {
    constructor(el) {
      this.el = el;
      this.events = [];
      this.fields = [];
      this.strengthIndicators = [];
      this.passwordToggles = [];
      this.fileUploads = [];

      // Form-level configuration
      this.ajax = Utils.parseBoolean(Utils.getData(el, 'form-ajax') || 'false');
      this.action = Utils.getData(el, 'form-action') || el.getAttribute('action') || '';
      this.method = (Utils.getData(el, 'form-method') || el.getAttribute('method') || 'POST').toUpperCase();
      this.successMessage = Utils.getData(el, 'form-success-message') || 'Form submitted successfully.';
      this.errorMessage = Utils.getData(el, 'form-error-message') || 'Something went wrong. Please try again.';

      this.init();
    }

    init() {
      // Prevent native browser validation
      this.el.setAttribute('novalidate', '');

      this.parseFields();
      this.bindEvents();
    }

    // ──────────────────────────────────────────────
    // Field Parsing
    // ──────────────────────────────────────────────

    parseFields() {
      var fieldEls = Utils.qsa('[data-validate]', this.el);

      this.fields = fieldEls.map(function(el) {
        var rulesStr = Utils.getData(el, 'validate') || '';
        var rules = this.parseRules(rulesStr);
        var field = {
          el: el,
          rules: rules,
          hasPasswordRules: this.checkPasswordRules(rules),
          strengthIndicator: null
        };

        // Build password toggle for password inputs
        if (el.type === 'password') {
          this.buildPasswordToggle(field);
        }

        // Build strength indicator for password fields
        if (field.hasPasswordRules) {
          this.buildStrengthIndicator(field);
        }

        // Build styled upload area for file inputs
        if (el.type === 'file') {
          this.buildFileUpload(field);
        }

        return field;
      }.bind(this));
    }

    parseRules(str) {
      if (!str) return [];

      return str.split('|').map(function(part) {
        var colonIndex = part.indexOf(':');
        if (colonIndex === -1) {
          return { rule: part.trim(), param: null };
        }
        return {
          rule: part.substring(0, colonIndex).trim(),
          param: part.substring(colonIndex + 1).trim()
        };
      });
    }

    checkPasswordRules(rules) {
      return rules.some(function(r) {
        return PASSWORD_RULES.indexOf(r.rule) !== -1;
      });
    }

    // ──────────────────────────────────────────────
    // Event Binding
    // ──────────────────────────────────────────────

    bindEvents() {
      var self = this;

      // Field-level validation
      this.fields.forEach(function(field) {
        // File inputs validate on change, everything else on blur
        if (field.el.type === 'file') {
          self.events.push(
            Utils.addEvent(field.el, 'change', function() {
              self.updateFileDisplay(field);
              self.validateField(field);
            })
          );
        } else {
          self.events.push(
            Utils.addEvent(field.el, 'blur', function() {
              self.validateField(field);
            })
          );
        }

        // Real-time input for password strength
        if (field.hasPasswordRules) {
          self.events.push(
            Utils.addEvent(field.el, 'input', function() {
              self.updateStrengthIndicator(field);
            })
          );
        }

        // If a field uses match:X, also listen on the source field
        field.rules.forEach(function(r) {
          if (r.rule === 'match' && r.param) {
            var sourceField = self.el.querySelector('[name="' + r.param + '"]');
            if (sourceField) {
              self.events.push(
                Utils.addEvent(sourceField, 'input', function() {
                  // Re-validate the confirm field when source changes
                  if (field.el.value) {
                    self.validateField(field);
                  }
                })
              );
            }
          }
        });
      });

      // Form submit
      this.events.push(
        Utils.addEvent(this.el, 'submit', function(e) {
          self.handleSubmit(e);
        })
      );

      // Form reset
      this.events.push(
        Utils.addEvent(this.el, 'reset', function() {
          // Delay to let the browser reset field values first
          setTimeout(function() {
            self.clearAll();
          }, 10);
        })
      );
    }

    // ──────────────────────────────────────────────
    // Validation Engine
    // ──────────────────────────────────────────────

    validateField(field) {
      var isFile = field.el.type === 'file';
      var value = isFile ? '' : field.el.value;
      var files = isFile ? field.el.files : null;
      var isRequired = field.rules.some(function(r) { return r.rule === 'required'; });

      // Optional fields: skip other rules if empty
      if (!isRequired) {
        if (isFile && (!files || files.length === 0)) {
          this.clearError(field);
          return { valid: true, errors: [] };
        }
        if (!isFile && !value) {
          this.clearError(field);
          return { valid: true, errors: [] };
        }
      }

      var errors = [];

      for (var i = 0; i < field.rules.length; i++) {
        var r = field.rules[i];
        var result = this.runRule(r.rule, r.param, value, field.el);

        if (!result.valid) {
          var message = this.getErrorMessage(field.el, r.rule, r.param, result.message);
          errors.push(message);
          break; // Show first error only
        }
      }

      if (errors.length > 0) {
        this.showError(field, errors[0]);
        this.dispatchEvent('battersea:fieldInvalid', { field: field.el, message: errors[0] });
        return { valid: false, errors: errors };
      }

      this.clearError(field);
      this.showValid(field);
      this.dispatchEvent('battersea:fieldValid', { field: field.el });
      return { valid: true, errors: [] };
    }

    validateAll() {
      var allErrors = [];
      var self = this;

      this.fields.forEach(function(field) {
        var result = self.validateField(field);
        if (!result.valid) {
          allErrors.push({ field: field.el, message: result.errors[0] });
        }
      });

      if (allErrors.length > 0) {
        this.dispatchEvent('battersea:formInvalid', { errors: allErrors });
        return { valid: false, errors: allErrors };
      }

      this.dispatchEvent('battersea:formValid', {});
      return { valid: true, errors: [] };
    }

    runRule(rule, param, value, fieldEl) {
      switch (rule) {
        case 'required':  return this.ruleRequired(value, fieldEl);
        case 'email':     return this.ruleEmail(value);
        case 'phone':     return this.rulePhone(value);
        case 'url':       return this.ruleUrl(value);
        case 'min':       return this.ruleMin(value, param);
        case 'max':       return this.ruleMax(value, param);
        case 'number':    return this.ruleNumber(value);
        case 'uppercase': return this.ruleUppercase(value);
        case 'lowercase': return this.ruleLowercase(value);
        case 'special':   return this.ruleSpecial(value);
        case 'match':     return this.ruleMatch(value, param);
        case 'pattern':   return this.rulePattern(value, param);
        case 'filetypes': return this.ruleFiletypes(param, fieldEl);
        case 'maxsize':   return this.ruleMaxsize(param, fieldEl);
        default:
          console.warn('FormValidation: Unknown rule "' + rule + '"');
          return { valid: true };
      }
    }

    // ──────────────────────────────────────────────
    // Individual Rule Validators
    // ──────────────────────────────────────────────

    ruleRequired(value, fieldEl) {
      var type = fieldEl.type;

      // File input: at least one file selected
      if (type === 'file') {
        return { valid: fieldEl.files && fieldEl.files.length > 0 };
      }

      // Checkbox: must be checked
      if (type === 'checkbox') {
        return { valid: fieldEl.checked };
      }

      // Radio: at least one in the group must be selected
      if (type === 'radio') {
        var name = fieldEl.name;
        var checked = this.el.querySelector('input[name="' + name + '"]:checked');
        return { valid: !!checked };
      }

      // Select: must have a non-empty value
      if (fieldEl.tagName === 'SELECT') {
        return { valid: value !== '' };
      }

      // Text, textarea, etc: must not be empty after trimming
      return { valid: value.trim() !== '' };
    }

    ruleEmail(value) {
      return { valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) };
    }

    rulePhone(value) {
      // Flexible: allows +, digits, spaces, dashes, parentheses. Min 7 chars.
      return { valid: /^\+?[\d\s\-().]{7,}$/.test(value) };
    }

    ruleUrl(value) {
      try {
        new URL(value);
        return { valid: true };
      } catch (e) {
        return { valid: false };
      }
    }

    ruleMin(value, param) {
      var min = parseInt(param, 10);
      return { valid: value.length >= min };
    }

    ruleMax(value, param) {
      var max = parseInt(param, 10);
      return { valid: value.length <= max };
    }

    ruleNumber(value) {
      return { valid: /\d/.test(value) };
    }

    ruleUppercase(value) {
      return { valid: /[A-Z]/.test(value) };
    }

    ruleLowercase(value) {
      return { valid: /[a-z]/.test(value) };
    }

    ruleSpecial(value) {
      return { valid: /[^A-Za-z0-9]/.test(value) };
    }

    ruleMatch(value, fieldName) {
      var sourceField = this.el.querySelector('[name="' + fieldName + '"]');
      if (!sourceField) {
        console.warn('FormValidation: No field found with name "' + fieldName + '"');
        return { valid: false };
      }
      return { valid: value === sourceField.value };
    }

    rulePattern(value, regex) {
      try {
        return { valid: new RegExp(regex).test(value) };
      } catch (e) {
        console.warn('FormValidation: Invalid regex pattern "' + regex + '"');
        return { valid: false };
      }
    }

    ruleFiletypes(param, fieldEl) {
      var files = fieldEl.files;
      if (!files || files.length === 0) return { valid: true };

      var allowed = param.split(',').map(function(ext) {
        return ext.trim().toLowerCase().replace(/^\./, '');
      });

      for (var i = 0; i < files.length; i++) {
        var name = files[i].name;
        var ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        if (allowed.indexOf(ext) === -1) {
          return { valid: false, message: 'Allowed file types: ' + allowed.join(', ') + '.' };
        }
      }
      return { valid: true };
    }

    ruleMaxsize(param, fieldEl) {
      var files = fieldEl.files;
      if (!files || files.length === 0) return { valid: true };

      var maxBytes = parseFloat(param) * 1024 * 1024;

      for (var i = 0; i < files.length; i++) {
        if (files[i].size > maxBytes) {
          return { valid: false, message: files[i].name + ' exceeds ' + param + ' MB.' };
        }
      }
      return { valid: true };
    }

    // ──────────────────────────────────────────────
    // Error Message Resolution
    // ──────────────────────────────────────────────

    getErrorMessage(fieldEl, rule, param, fallback) {
      // 1. Rule-specific custom message: data-validate-message-required
      var ruleMsg = Utils.getData(fieldEl, 'validate-message-' + rule);
      if (ruleMsg) return ruleMsg;

      // 2. Field-level catch-all: data-validate-message
      var fieldMsg = Utils.getData(fieldEl, 'validate-message');
      if (fieldMsg) return fieldMsg;

      // 3. Default message with param substitution
      var msg = DEFAULT_MESSAGES[rule] || fallback || 'Invalid value.';
      if (param) {
        msg = msg.replace('{param}', param);
      }
      return msg;
    }

    // ──────────────────────────────────────────────
    // Error Display
    // ──────────────────────────────────────────────

    showError(field, message) {
      this.clearError(field);

      // For file inputs, apply error class to drop zone instead of hidden input
      if (field.fileUpload) {
        field.fileUpload.dropzone.classList.add('battersea-form-field--error');
        field.fileUpload.dropzone.classList.remove('battersea-form-field--valid');
      } else {
        field.el.classList.add('battersea-form-field--error');
        field.el.classList.remove('battersea-form-field--valid');
      }
      field.el.setAttribute('aria-invalid', 'true');

      // Create error span
      var errorSpan = document.createElement('span');
      errorSpan.className = 'battersea-form-error';
      errorSpan.textContent = message;
      errorSpan.id = Utils.generateId('form-error');
      errorSpan.setAttribute('role', 'alert');

      // Link to field via aria-describedby
      field.el.setAttribute('aria-describedby', errorSpan.id);

      // Insert after the outermost wrapper element
      var insertAfter = field.strengthIndicator ||
                        (field.passwordToggle ? field.passwordToggle.wrapper : null) ||
                        (field.fileUpload ? field.fileUpload.wrapper : null) ||
                        field.el;
      insertAfter.parentNode.insertBefore(errorSpan, insertAfter.nextSibling);
    }

    clearError(field) {
      if (field.fileUpload) {
        field.fileUpload.dropzone.classList.remove('battersea-form-field--error');
      } else {
        field.el.classList.remove('battersea-form-field--error');
      }
      field.el.removeAttribute('aria-invalid');
      field.el.removeAttribute('aria-describedby');

      // Remove existing error span — look in wrapper's parent if wrapper exists
      var searchRoot = field.passwordToggle ? field.passwordToggle.wrapper.parentNode :
                       field.fileUpload ? field.fileUpload.wrapper.parentNode :
                       field.el.parentNode;
      if (searchRoot) {
        var existing = searchRoot.querySelector('.battersea-form-error');
        if (existing) {
          existing.remove();
        }
      }
    }

    showValid(field) {
      if (field.fileUpload) {
        field.fileUpload.dropzone.classList.add('battersea-form-field--valid');
      } else {
        field.el.classList.add('battersea-form-field--valid');
      }
      field.el.setAttribute('aria-invalid', 'false');
    }

    clearAll() {
      var self = this;
      this.fields.forEach(function(field) {
        self.clearError(field);
        if (field.fileUpload) {
          field.fileUpload.dropzone.classList.remove('battersea-form-field--valid');
          self.updateFileDisplay(field);
        } else {
          field.el.classList.remove('battersea-form-field--valid');
        }
        field.el.removeAttribute('aria-invalid');
        if (field.hasPasswordRules) {
          self.updateStrengthIndicator(field);
        }
      });
      this.clearFormMessage();
    }

    scrollToFirstError() {
      var firstError = this.el.querySelector('.battersea-form-field--error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // For file fields, focus the browse button instead of hidden input
        var browseBtn = firstError.querySelector('.battersea-form-file-browse');
        if (browseBtn) {
          browseBtn.focus();
        } else {
          firstError.focus();
        }
      }
    }

    // ──────────────────────────────────────────────
    // Form-Level Messages
    // ──────────────────────────────────────────────

    showFormMessage(type, text) {
      this.clearFormMessage();

      var msgDiv = document.createElement('div');
      msgDiv.className = 'battersea-form-message battersea-form-message--' + type;
      msgDiv.textContent = text;
      msgDiv.setAttribute('role', 'alert');

      // Insert at the top of the form
      this.el.insertBefore(msgDiv, this.el.firstChild);
    }

    clearFormMessage() {
      var existing = this.el.querySelector('.battersea-form-message');
      if (existing) {
        existing.remove();
      }
    }

    // ──────────────────────────────────────────────
    // Password Toggle
    // ──────────────────────────────────────────────

    buildPasswordToggle(field) {
      var self = this;
      var input = field.el;

      // Wrap input in a container for positioning
      var wrapper = document.createElement('div');
      wrapper.className = 'battersea-form-password-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      // Create toggle button
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'battersea-form-password-toggle';
      toggle.setAttribute('aria-label', 'Show password');
      toggle.setAttribute('tabindex', '-1');

      // Eye icon (visible when password is hidden)
      toggle.innerHTML = '<svg class="battersea-form-eye-open" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
        '<circle cx="12" cy="12" r="3"/>' +
        '</svg>' +
        '<svg class="battersea-form-eye-closed" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>' +
        '<line x1="1" y1="1" x2="23" y2="23"/>' +
        '</svg>';

      wrapper.appendChild(toggle);

      // Toggle handler
      this.events.push(
        Utils.addEvent(toggle, 'click', function() {
          var isHidden = input.type === 'password';
          input.type = isHidden ? 'text' : 'password';
          toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
          toggle.classList.toggle('battersea-form-password-toggle--visible', isHidden);
        })
      );

      field.passwordToggle = { wrapper: wrapper, toggle: toggle };
      this.passwordToggles.push(field.passwordToggle);
    }

    // ──────────────────────────────────────────────
    // Password Strength Indicator
    // ──────────────────────────────────────────────

    buildStrengthIndicator(field) {
      var container = document.createElement('div');
      container.className = 'battersea-form-strength';
      container.setAttribute('aria-live', 'polite');

      var bar = document.createElement('div');
      bar.className = 'battersea-form-strength__bar';
      container.appendChild(bar);

      var label = document.createElement('span');
      label.className = 'battersea-form-strength__label';
      container.appendChild(label);

      // Insert after the field (or after its wrapper if it has a toggle)
      var insertAfter = field.passwordToggle ? field.passwordToggle.wrapper : field.el;
      insertAfter.parentNode.insertBefore(container, insertAfter.nextSibling);
      field.strengthIndicator = container;

      this.strengthIndicators.push(container);
    }

    updateStrengthIndicator(field) {
      if (!field.strengthIndicator) return;

      var value = field.el.value;
      var bar = field.strengthIndicator.querySelector('.battersea-form-strength__bar');
      var label = field.strengthIndicator.querySelector('.battersea-form-strength__label');

      if (!value) {
        bar.style.width = '0%';
        label.textContent = '';
        field.strengthIndicator.className = 'battersea-form-strength';
        return;
      }

      // Count how many password rules pass
      var passwordRules = field.rules.filter(function(r) {
        return PASSWORD_RULES.indexOf(r.rule) !== -1;
      });
      var totalRules = passwordRules.length;
      var passedRules = 0;

      var self = this;
      passwordRules.forEach(function(r) {
        var result = self.runRule(r.rule, r.param, value, field.el);
        if (result.valid) passedRules++;
      });

      // Calculate percentage and strength level
      var percent = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 0;
      var level, text;

      if (percent <= 33) {
        level = 'weak';
        text = 'Weak';
      } else if (percent <= 66) {
        level = 'medium';
        text = 'Getting there';
      } else {
        level = 'strong';
        text = 'Strong';
      }

      bar.style.width = percent + '%';
      label.textContent = text;

      // Update class
      field.strengthIndicator.className = 'battersea-form-strength battersea-form-strength--' + level;
    }

    // ──────────────────────────────────────────────
    // File Upload
    // ──────────────────────────────────────────────

    buildFileUpload(field) {
      var self = this;
      var input = field.el;

      // Wrap input in a container
      var wrapper = document.createElement('div');
      wrapper.className = 'battersea-form-file-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      // Create drop zone
      var dropzone = document.createElement('div');
      dropzone.className = 'battersea-form-file-dropzone';
      dropzone.setAttribute('role', 'button');
      dropzone.setAttribute('tabindex', '0');
      dropzone.setAttribute('aria-label', 'File upload area. Click or drag files here.');

      // Upload icon
      var icon = document.createElement('div');
      icon.className = 'battersea-form-file-icon';
      icon.innerHTML = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
        '<polyline points="17 8 12 3 7 8"/>' +
        '<line x1="12" y1="3" x2="12" y2="15"/>' +
        '</svg>';
      dropzone.appendChild(icon);

      // Text
      var text = document.createElement('p');
      text.className = 'battersea-form-file-text';
      text.innerHTML = 'Drag files here or <button type="button" class="battersea-form-file-browse">browse</button>';
      dropzone.appendChild(text);

      // File list container
      var fileList = document.createElement('div');
      fileList.className = 'battersea-form-file-list';
      dropzone.appendChild(fileList);

      wrapper.appendChild(dropzone);

      // Browse button triggers native file picker
      var browseBtn = text.querySelector('.battersea-form-file-browse');
      this.events.push(
        Utils.addEvent(browseBtn, 'click', function(e) {
          e.stopPropagation();
          input.click();
        })
      );

      // Clicking the drop zone also triggers file picker
      this.events.push(
        Utils.addEvent(dropzone, 'click', function(e) {
          if (e.target === browseBtn) return;
          input.click();
        })
      );

      // Keyboard: Enter/Space on drop zone triggers file picker
      this.events.push(
        Utils.addEvent(dropzone, 'keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            input.click();
          }
        })
      );

      // Drag-and-drop handling
      var dragCounter = 0;

      this.events.push(
        Utils.addEvent(dropzone, 'dragenter', function(e) {
          e.preventDefault();
          dragCounter++;
          if (dragCounter === 1) {
            dropzone.classList.add('battersea-form-file-dropzone--dragover');
          }
        })
      );

      this.events.push(
        Utils.addEvent(dropzone, 'dragover', function(e) {
          e.preventDefault();
        })
      );

      this.events.push(
        Utils.addEvent(dropzone, 'dragleave', function(e) {
          e.preventDefault();
          dragCounter--;
          if (dragCounter === 0) {
            dropzone.classList.remove('battersea-form-file-dropzone--dragover');
          }
        })
      );

      this.events.push(
        Utils.addEvent(dropzone, 'drop', function(e) {
          e.preventDefault();
          dragCounter = 0;
          dropzone.classList.remove('battersea-form-file-dropzone--dragover');

          var dt = e.dataTransfer;
          if (dt && dt.files && dt.files.length > 0) {
            input.files = dt.files;
            self.updateFileDisplay(field);
            self.validateField(field);
          }
        })
      );

      field.fileUpload = { wrapper: wrapper, dropzone: dropzone, fileList: fileList, browseBtn: browseBtn };
      this.fileUploads.push(field.fileUpload);
    }

    updateFileDisplay(field) {
      if (!field.fileUpload) return;

      var fileList = field.fileUpload.fileList;
      var files = field.el.files;
      fileList.innerHTML = '';

      if (!files || files.length === 0) {
        field.fileUpload.dropzone.classList.remove('battersea-form-file-dropzone--has-files');
        return;
      }

      field.fileUpload.dropzone.classList.add('battersea-form-file-dropzone--has-files');

      for (var i = 0; i < files.length; i++) {
        var item = document.createElement('div');
        item.className = 'battersea-form-file-item';
        item.textContent = files[i].name + ' (' + this.formatFileSize(files[i].size) + ')';
        fileList.appendChild(item);
      }
    }

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      var units = ['B', 'KB', 'MB', 'GB'];
      var i = Math.floor(Math.log(bytes) / Math.log(1024));
      return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + units[i];
    }

    // ──────────────────────────────────────────────
    // Form Submission
    // ──────────────────────────────────────────────

    handleSubmit(e) {
      e.preventDefault();
      this.clearFormMessage();

      var result = this.validateAll();

      if (!result.valid) {
        this.scrollToFirstError();
        return;
      }

      // If AJAX mode, submit via fetch
      if (this.ajax) {
        this.submitAjax();
        return;
      }

      // Standard submission: re-submit the form without our listener blocking it
      this.el.removeAttribute('novalidate');

      // Create a hidden submit button and click it to trigger native submit
      var hiddenSubmit = document.createElement('button');
      hiddenSubmit.type = 'submit';
      hiddenSubmit.style.display = 'none';
      hiddenSubmit.setAttribute('data-form-bypass', 'true');
      this.el.appendChild(hiddenSubmit);

      // Temporarily unbind our submit handler
      this.submitting = true;
      hiddenSubmit.click();
      hiddenSubmit.remove();
    }

    submitAjax() {
      var self = this;
      var submitBtn = this.el.querySelector('[type="submit"]');

      this.setSubmitLoading(true);

      var formData = new FormData(this.el);

      var fetchOptions = {
        method: this.method,
        body: this.method !== 'GET' ? formData : undefined
      };

      // For GET requests, append form data as query params
      var url = this.action;
      if (this.method === 'GET') {
        var params = new URLSearchParams(formData);
        url += (url.indexOf('?') !== -1 ? '&' : '?') + params.toString();
      }

      fetch(url, fetchOptions)
        .then(function(response) {
          self.setSubmitLoading(false);

          if (response.ok) {
            self.showFormMessage('success', self.successMessage);
            self.dispatchEvent('battersea:formSubmitted', { response: response });
          } else {
            self.showFormMessage('error', self.errorMessage);
            self.dispatchEvent('battersea:formError', { error: 'Server returned ' + response.status });
          }
        })
        .catch(function(error) {
          self.setSubmitLoading(false);
          self.showFormMessage('error', self.errorMessage);
          self.dispatchEvent('battersea:formError', { error: error });
        });
    }

    setSubmitLoading(loading) {
      var submitBtn = this.el.querySelector('[type="submit"]');
      if (!submitBtn) return;

      if (loading) {
        submitBtn.classList.add('battersea-form-btn--loading');
        submitBtn.disabled = true;
        submitBtn.setAttribute('data-original-text', submitBtn.textContent);
        submitBtn.textContent = 'Sending\u2026';
      } else {
        submitBtn.classList.remove('battersea-form-btn--loading');
        submitBtn.disabled = false;
        var originalText = submitBtn.getAttribute('data-original-text');
        if (originalText) {
          submitBtn.textContent = originalText;
          submitBtn.removeAttribute('data-original-text');
        }
      }
    }

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    dispatchEvent(name, detail) {
      this.el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
    }

    // ──────────────────────────────────────────────
    // Cleanup
    // ──────────────────────────────────────────────

    destroy() {
      this.events.forEach(function(e) { e.remove(); });
      this.events = [];

      // Remove password toggles (unwrap inputs back to their original parent)
      this.passwordToggles.forEach(function(pt) {
        var wrapper = pt.wrapper;
        var input = wrapper.querySelector('input');
        if (input && wrapper.parentNode) {
          input.type = 'password';
          wrapper.parentNode.insertBefore(input, wrapper);
          wrapper.parentNode.removeChild(wrapper);
        }
      });
      this.passwordToggles = [];

      // Remove file upload wrappers (unwrap inputs back to their original parent)
      this.fileUploads.forEach(function(fu) {
        var wrapper = fu.wrapper;
        var input = wrapper.querySelector('input[type="file"]');
        if (input && wrapper.parentNode) {
          wrapper.parentNode.insertBefore(input, wrapper);
          wrapper.parentNode.removeChild(wrapper);
        }
      });
      this.fileUploads = [];

      // Remove strength indicators
      this.strengthIndicators.forEach(function(el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      this.strengthIndicators = [];

      // Remove error spans and classes
      this.clearAll();

      // Remove novalidate
      this.el.removeAttribute('novalidate');

      this.fields = [];
    }
  }

  window.Battersea.register('formValidation', FormValidation, '[data-form-validation]');

})(window, document);
