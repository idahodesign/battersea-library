/**
 * Battersea Library - Environment Configuration
 *
 * This script detects the hosting environment and configures paths accordingly.
 * It allows the same HTML to work on multiple hosts without modification.
 *
 * Supported environments:
 * - GitHub Pages: idahodesign.github.io/battersea-library
 * - Uundi: uundi.david-haworth.com
 * - Local development
 */

(function(window, document) {
  'use strict';

  // Detect environment and set base path
  const hostname = window.location.hostname;
  let basePath = '';

  if (hostname.includes('github.io')) {
    // GitHub Pages - needs repository name prefix
    basePath = '/battersea-library';
  } else if (hostname.includes('uundi') || hostname.includes('david-haworth.com')) {
    // Uundi hosting - no prefix needed
    basePath = '';
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development - adjust as needed
    basePath = '';
  }

  // Export configuration
  window.BatterseaConfig = {
    basePath: basePath,
    demoPath: basePath + '/demo',
    srcPath: basePath + '/src',
    assetsPath: basePath + '/assets',

    // Helper to resolve a path
    resolvePath: function(path) {
      if (path.startsWith('/')) {
        return basePath + path;
      }
      return path;
    }
  };

  // Auto-fix navigation links when DOM is ready
  function fixNavigationPaths() {
    // Skip if no basePath needed
    if (!basePath) return;

    // Find all links that start with /demo/, /src/, or /assets/ (but not already prefixed)
    const allLinks = document.querySelectorAll('a[href^="/demo/"], a[href^="/src/"], a[href^="/assets/"]');

    allLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      // Only fix if not already fixed and doesn't already have the basePath
      if (!link.hasAttribute('data-path-fixed') && !href.startsWith(basePath)) {
        link.setAttribute('href', basePath + href);
        link.setAttribute('data-path-fixed', 'true');
      }
    });
  }

  // Set up MutationObserver to watch for dynamically loaded content (includes)
  function setupObserver() {
    const observer = new MutationObserver(function(mutations) {
      let shouldFix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          shouldFix = true;
        }
      });
      if (shouldFix) {
        fixNavigationPaths();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      fixNavigationPaths();
      setupObserver();
    });
  } else {
    fixNavigationPaths();
    if (document.body) {
      setupObserver();
    } else {
      document.addEventListener('DOMContentLoaded', setupObserver);
    }
  }

  console.log('[Battersea] Environment configured:', {
    hostname: hostname,
    basePath: basePath
  });

})(window, document);
