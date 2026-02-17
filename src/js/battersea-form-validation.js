/**
 * Battersea Library - FormValidation Component
 * Version: 2.15.0
 *
 * Real-time form validation with password strength indicators,
 * custom rules, and optional AJAX submission.
 *
 * Usage:
 * <form data-form-validation>
 *   <input type="text" name="email" data-validate="required|email">
 *   <input type="password" name="password" data-validate="required|min:8|uppercase|lowercase|number|special">
 *   <input type="password" name="confirm" data-validate="required|match:password">
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
    pattern: 'Invalid format.'
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

      // Blur validation on each field
      this.fields.forEach(function(field) {
        self.events.push(
          Utils.addEvent(field.el, 'blur', function() {
            self.validateField(field);
          })
        );

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
      var value = field.el.value;
      var isRequired = field.rules.some(function(r) { return r.rule === 'required'; });

      // Optional fields: skip other rules if empty
      if (!isRequired && !value) {
        this.clearError(field);
        return { valid: true, errors: [] };
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
      field.el.classList.add('battersea-form-field--error');
      field.el.classList.remove('battersea-form-field--valid');
      field.el.setAttribute('aria-invalid', 'true');

      // Create error span
      var errorSpan = document.createElement('span');
      errorSpan.className = 'battersea-form-error';
      errorSpan.textContent = message;
      errorSpan.id = Utils.generateId('form-error');
      errorSpan.setAttribute('role', 'alert');

      // Link to field via aria-describedby
      field.el.setAttribute('aria-describedby', errorSpan.id);

      // Insert after strength indicator, then wrapper, then field
      var insertAfter = field.strengthIndicator || (field.passwordToggle ? field.passwordToggle.wrapper : field.el);
      insertAfter.parentNode.insertBefore(errorSpan, insertAfter.nextSibling);
    }

    clearError(field) {
      field.el.classList.remove('battersea-form-field--error');
      field.el.removeAttribute('aria-invalid');
      field.el.removeAttribute('aria-describedby');

      // Remove existing error span — look in wrapper's parent if toggle exists
      var searchRoot = field.passwordToggle ? field.passwordToggle.wrapper.parentNode : field.el.parentNode;
      if (searchRoot) {
        var existing = searchRoot.querySelector('.battersea-form-error');
        if (existing) {
          existing.remove();
        }
      }
    }

    showValid(field) {
      field.el.classList.add('battersea-form-field--valid');
      field.el.setAttribute('aria-invalid', 'false');
    }

    clearAll() {
      var self = this;
      this.fields.forEach(function(field) {
        self.clearError(field);
        field.el.classList.remove('battersea-form-field--valid');
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
        firstError.focus();
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
