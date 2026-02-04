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
    // Find all links with data-nav-link attribute
    const navLinks = document.querySelectorAll('[data-nav-link]');

    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        link.setAttribute('href', basePath + href);
      }
    });

    // Also fix any links that start with /demo/ or /src/
    const allLinks = document.querySelectorAll('a[href^="/demo/"], a[href^="/src/"], a[href^="/assets/"]');

    allLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (!link.hasAttribute('data-path-fixed')) {
        link.setAttribute('href', basePath + href);
        link.setAttribute('data-path-fixed', 'true');
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixNavigationPaths);
  } else {
    fixNavigationPaths();
  }

  // Also run after includes are loaded (for dynamically loaded navigation)
  // This uses a MutationObserver to catch dynamically added content
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        fixNavigationPaths();
      }
    });
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  console.log('[Battersea] Environment configured:', {
    hostname: hostname,
    basePath: basePath
  });

})(window, document);
