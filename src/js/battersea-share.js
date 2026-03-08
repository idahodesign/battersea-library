/**
 * Battersea Library - Share Component
 * Version: 2.31.0
 *
 * Usage:
 * <div data-share
 *      data-share-url="https://example.com"
 *      data-share-title="Page Title"
 *      data-share-text="Description text"
 *      data-share-platforms="x,facebook,linkedin,bluesky,whatsapp,email"
 *      data-share-style="icons"
 *      data-share-direction="horizontal">
 * </div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('Share requires Battersea Core and Utils');
    return;
  }

  var Utils = window.BatterseaUtils;

  // Platform SVG icons (fill-based, 24x24 viewBox)
  var PLATFORM_ICONS = {
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    bluesky: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.59 3.501 6.158 3.186-4.402.634-7.392 2.47-4.168 7.392 3.638 4.908 6.822-.423 8.886-4.287.2-.376.355-.588.5-.588.145 0 .3.212.5.588 2.064 3.864 5.248 9.195 8.886 4.287 3.224-4.922.234-6.758-4.168-7.392 2.568.315 5.373-.559 6.158-3.186C23.622 9.418 24 4.458 24 3.768c0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
  };

  // Platform display names
  var PLATFORM_LABELS = {
    x: 'X',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    bluesky: 'Bluesky',
    whatsapp: 'WhatsApp',
    email: 'Email'
  };

  // Default platform order
  var DEFAULT_PLATFORMS = ['x', 'facebook', 'linkedin', 'bluesky', 'whatsapp', 'email'];

  // Share window dimensions
  var POPUP_WIDTH = 600;
  var POPUP_HEIGHT = 400;

  class Share {
    constructor(el) {
      this.el = el;
      this.events = [];
      this.init();
    }

    init() {
      this.parseOptions();
      this.buildButtons();
      this.bindEvents();
    }

    parseOptions() {
      this.shareUrl = Utils.getData(this.el, 'share-url') || window.location.href;
      this.shareTitle = Utils.getData(this.el, 'share-title') || document.title;
      this.shareText = Utils.getData(this.el, 'share-text') || '';
      this.style = Utils.getData(this.el, 'share-style') || 'icons';
      this.direction = Utils.getData(this.el, 'share-direction') || 'horizontal';

      var platformsAttr = Utils.getData(this.el, 'share-platforms');
      if (platformsAttr) {
        this.platforms = platformsAttr.split(',').map(function(p) { return p.trim().toLowerCase(); }).filter(function(p) { return PLATFORM_ICONS[p]; });
      } else {
        this.platforms = DEFAULT_PLATFORMS.slice();
      }
    }

    buildButtons() {
      this.el.classList.add('battersea-share');
      this.el.classList.add('battersea-share--' + this.direction);
      if (this.style === 'pills') {
        this.el.classList.add('battersea-share--pills');
      }
      this.el.setAttribute('role', 'group');
      this.el.setAttribute('aria-label', 'Share this page');

      var html = '';
      for (var i = 0; i < this.platforms.length; i++) {
        var platform = this.platforms[i];
        var icon = PLATFORM_ICONS[platform];
        var label = PLATFORM_LABELS[platform] || platform;

        html += '<button type="button" class="battersea-share__button battersea-share__button--' + platform + '" data-share-platform="' + platform + '" aria-label="Share on ' + label + '">';
        html += '<span class="battersea-share__icon">' + icon + '</span>';
        if (this.style === 'pills') {
          html += '<span class="battersea-share__label">' + label + '</span>';
        }
        html += '</button>';
      }

      this.el.innerHTML = html;
    }

    bindEvents() {
      var buttons = this.el.querySelectorAll('[data-share-platform]');
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        this.events.push(
          Utils.addEvent(btn, 'click', this.handleClick.bind(this))
        );
      }
    }

    handleClick(e) {
      var btn = e.currentTarget;
      var platform = btn.getAttribute('data-share-platform');
      var url = this.getShareUrl(platform);

      if (!url) return;

      this.el.dispatchEvent(new CustomEvent('battersea:shareClick', {
        bubbles: true,
        detail: { platform: platform, url: this.shareUrl }
      }));

      if (platform === 'email') {
        window.location.href = url;
      } else {
        var left = (screen.width - POPUP_WIDTH) / 2;
        var top = (screen.height - POPUP_HEIGHT) / 2;
        window.open(url, 'share_' + platform, 'width=' + POPUP_WIDTH + ',height=' + POPUP_HEIGHT + ',left=' + left + ',top=' + top + ',toolbar=no,menubar=no,scrollbars=yes,resizable=yes');
      }
    }

    getShareUrl(platform) {
      var url = encodeURIComponent(this.shareUrl);
      var title = encodeURIComponent(this.shareTitle);
      var text = encodeURIComponent(this.shareText || this.shareTitle);

      switch (platform) {
        case 'x':
          return 'https://x.com/intent/post?url=' + url + '&text=' + text;
        case 'facebook':
          return 'https://www.facebook.com/sharer/sharer.php?u=' + url;
        case 'linkedin':
          return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
        case 'bluesky':
          return 'https://bsky.app/intent/compose?text=' + text + '%20' + url;
        case 'whatsapp':
          return 'https://wa.me/?text=' + text + '%20' + url;
        case 'email':
          return 'mailto:?subject=' + title + '&body=' + text + '%0A%0A' + url;
        default:
          return null;
      }
    }

    destroy() {
      this.events.forEach(function(event) { event.remove(); });
      this.events = [];
      this.el.innerHTML = '';
      this.el.classList.remove('battersea-share', 'battersea-share--horizontal', 'battersea-share--vertical', 'battersea-share--pills');
      this.el.removeAttribute('role');
      this.el.removeAttribute('aria-label');
    }
  }

  window.Battersea.register('share', Share, '[data-share]');

})(window, document);
