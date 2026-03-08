/**
 * Battersea Library - Copy Code Utility
 * Adds a "Copy" button to all <pre><code> blocks on the page.
 * Self-executing — no registration needed.
 */
(function(document) {
  'use strict';

  var COPY_LABEL = 'Copy';
  var COPIED_LABEL = 'Copied!';
  var RESET_DELAY = 2000;

  function createCopyButton(preEl) {
    var btn = document.createElement('button');
    btn.className = 'battersea-copy-btn';
    btn.type = 'button';
    btn.textContent = COPY_LABEL;
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', function() {
      var code = preEl.querySelector('code');
      var text = code ? code.textContent : preEl.textContent;

      navigator.clipboard.writeText(text).then(function() {
        btn.textContent = COPIED_LABEL;
        btn.classList.add('battersea-copy-btn--copied');
        setTimeout(function() {
          btn.textContent = COPY_LABEL;
          btn.classList.remove('battersea-copy-btn--copied');
        }, RESET_DELAY);
      }).catch(function() {
        // Fallback for older browsers or insecure contexts
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          btn.textContent = COPIED_LABEL;
          btn.classList.add('battersea-copy-btn--copied');
          setTimeout(function() {
            btn.textContent = COPY_LABEL;
            btn.classList.remove('battersea-copy-btn--copied');
          }, RESET_DELAY);
        } catch (e) {
          btn.textContent = 'Error';
          setTimeout(function() {
            btn.textContent = COPY_LABEL;
          }, RESET_DELAY);
        }
        document.body.removeChild(textarea);
      });
    });

    preEl.appendChild(btn);
  }

  function initCopyButtons() {
    var preElements = document.querySelectorAll('pre');
    for (var i = 0; i < preElements.length; i++) {
      var pre = preElements[i];
      if (pre.querySelector('code') && !pre.querySelector('.battersea-copy-btn')) {
        createCopyButton(pre);
      }
    }
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Delay slightly to allow includes to load
      setTimeout(initCopyButtons, 500);
    });
  } else {
    setTimeout(initCopyButtons, 500);
  }

  // Also listen for custom event in case includes load later
  document.addEventListener('battersea:includesLoaded', initCopyButtons);

  // Re-run after a longer delay to catch late-loading content
  window.addEventListener('load', function() {
    setTimeout(initCopyButtons, 1000);
  });

})(document);
