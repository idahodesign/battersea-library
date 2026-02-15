/**
 * Battersea Library - Profile Grid Component
 * Version: 2.10.0
 *
 * Usage:
 * <div data-profile-grid data-profile-grid-columns="4" data-profile-grid-filter="position,company">
 *   <div data-profile-item
 *        data-profile-name="Jane Smith"
 *        data-profile-title="Designer"
 *        data-profile-position="Head of Design"
 *        data-profile-company="Acme Corp"
 *        data-profile-university="UCL"
 *        data-profile-phone="+44 20 1234 5678"
 *        data-profile-email="jane@acme.com"
 *        data-profile-website="https://janesmith.com"
 *        data-profile-social='[{"platform":"linkedin","url":"https://linkedin.com/in/jane"}]'>
 *     <img src="photo.jpg" alt="Jane Smith">
 *     <div data-profile-bio>
 *       <p>Rich HTML bio content here.</p>
 *     </div>
 *   </div>
 * </div>
 *
 * Dependencies: battersea-utils.js, battersea-core.js
 */

(function(window, document) {
  'use strict';

  if (!window.Battersea || !window.BatterseaUtils) {
    console.error('ProfileGrid requires Battersea Core and Utils');
    return;
  }

  const Utils = window.BatterseaUtils;

  // SVG icons for known social platforms
  const SOCIAL_ICONS = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
  };

  // Generic link icon for unknown platforms
  const LINK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

  // Contact icons
  const PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const EMAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const WEBSITE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

  class ProfileGrid {
    constructor(el) {
      this.el = el;
      this.columns = Utils.parseInt(Utils.getData(el, 'profile-grid-columns'), 4);
      this.filterFields = (Utils.getData(el, 'profile-grid-filter') || '').split(',').map(f => f.trim()).filter(Boolean);
      this.items = Utils.qsa('[data-profile-item]', el);
      this.events = [];
      this.lightbox = null;
      this.activeFilter = null;

      if (this.items.length === 0) {
        console.warn('ProfileGrid: No profile items found');
        return;
      }

      this.init();
    }

    init() {
      this.buildStructure();
      this.buildOverlays();
      if (this.filterFields.length > 0) {
        this.buildFilterBar();
      }
      this.createLightbox();
      this.bindEvents();
    }

    buildStructure() {
      // Wrap items in a grid container
      const gridWrapper = document.createElement('div');
      gridWrapper.className = 'battersea-profile-grid__items';
      gridWrapper.style.gridTemplateColumns = 'repeat(' + this.columns + ', 1fr)';

      // Move all profile items into the grid wrapper
      this.items.forEach(item => {
        gridWrapper.appendChild(item);
      });

      this.el.appendChild(gridWrapper);
      this.gridWrapper = gridWrapper;
    }

    buildOverlays() {
      this.items.forEach(item => {
        const name = Utils.getData(item, 'profile-name');
        const title = Utils.getData(item, 'profile-title');

        if (name || title) {
          const overlay = document.createElement('div');
          overlay.className = 'battersea-profile-overlay';

          if (name) {
            const nameEl = document.createElement('p');
            nameEl.className = 'battersea-profile-overlay__name';
            nameEl.textContent = name;
            overlay.appendChild(nameEl);
          }

          if (title) {
            const titleEl = document.createElement('p');
            titleEl.className = 'battersea-profile-overlay__title';
            titleEl.textContent = title;
            overlay.appendChild(titleEl);
          }

          item.appendChild(overlay);
        }
      });
    }

    buildFilterBar() {
      // Collect unique values per field
      this.filterData = {};
      this.filterFields.forEach(field => {
        const values = new Set();
        this.items.forEach(item => {
          const val = Utils.getData(item, 'profile-' + field);
          if (val) values.add(val);
        });
        if (values.size > 0) {
          this.filterData[field] = Array.from(values).sort();
        }
      });

      const wrapper = document.createElement('div');
      wrapper.className = 'battersea-profile-filter';

      // Row 1: Category pills (All, Position, Company, University...)
      const categoryRow = document.createElement('div');
      categoryRow.className = 'battersea-profile-filter__categories';

      const allPill = document.createElement('button');
      allPill.className = 'battersea-profile-filter__pill active';
      allPill.textContent = 'All';
      allPill.type = 'button';
      this.events.push(
        Utils.addEvent(allPill, 'click', () => this.clearFilter())
      );
      categoryRow.appendChild(allPill);
      this.allPill = allPill;

      Object.keys(this.filterData).forEach(field => {
        const pill = document.createElement('button');
        pill.className = 'battersea-profile-filter__pill';
        pill.textContent = field.charAt(0).toUpperCase() + field.slice(1);
        pill.type = 'button';
        pill.setAttribute('data-filter-category', field);

        this.events.push(
          Utils.addEvent(pill, 'click', () => this.selectCategory(field, pill))
        );

        categoryRow.appendChild(pill);
      });

      wrapper.appendChild(categoryRow);

      // Row 2: Value pills (hidden until a category is selected)
      const valueRow = document.createElement('div');
      valueRow.className = 'battersea-profile-filter__values';
      valueRow.style.display = 'none';
      wrapper.appendChild(valueRow);
      this.valueRow = valueRow;

      // Insert filter bar before the grid
      this.el.insertBefore(wrapper, this.gridWrapper);
      this.filterBar = wrapper;
      this.categoryRow = categoryRow;
    }

    selectCategory(field, activePill) {
      // Update category pills
      Utils.qsa('.battersea-profile-filter__pill', this.categoryRow).forEach(p => {
        p.classList.remove('active');
      });
      activePill.classList.add('active');

      // Clear any existing value events
      this.valueEvents = this.valueEvents || [];
      this.valueEvents.forEach(e => e.remove());
      this.valueEvents = [];

      // Build value pills for this category
      this.valueRow.innerHTML = '';
      this.valueRow.style.display = 'flex';

      const values = this.filterData[field] || [];
      values.forEach(value => {
        const pill = document.createElement('button');
        pill.className = 'battersea-profile-filter__pill';
        pill.textContent = value;
        pill.type = 'button';

        const handler = Utils.addEvent(pill, 'click', () => this.applyFilter(field, value, pill));
        this.valueEvents.push(handler);
        this.events.push(handler);

        this.valueRow.appendChild(pill);
      });

      // Show all items when switching category (no value selected yet)
      this.items.forEach(item => {
        item.classList.remove('battersea-profile-item--hidden');
      });
      this.activeFilter = null;
    }

    applyFilter(field, value, activePill) {
      // Deactivate all value pills, activate the clicked one
      Utils.qsa('.battersea-profile-filter__pill', this.valueRow).forEach(p => {
        p.classList.remove('active');
      });
      activePill.classList.add('active');

      this.activeFilter = { field: field, value: value };

      // Show/hide items
      this.items.forEach(item => {
        const itemValue = Utils.getData(item, 'profile-' + field);
        if (itemValue === value) {
          item.classList.remove('battersea-profile-item--hidden');
        } else {
          item.classList.add('battersea-profile-item--hidden');
        }
      });
    }

    clearFilter() {
      // Reset category pills
      Utils.qsa('.battersea-profile-filter__pill', this.categoryRow).forEach(p => {
        p.classList.remove('active');
      });
      this.allPill.classList.add('active');

      // Hide value row
      this.valueRow.innerHTML = '';
      this.valueRow.style.display = 'none';

      this.activeFilter = null;

      this.items.forEach(item => {
        item.classList.remove('battersea-profile-item--hidden');
      });
    }

    createLightbox() {
      this.lightbox = document.createElement('div');
      this.lightbox.className = 'battersea-profile-lightbox';
      this.lightbox.innerHTML =
        '<div class="battersea-profile-lightbox__panel">' +
          '<button class="battersea-profile-lightbox__close" aria-label="Close">\u00D7</button>' +
          '<div class="battersea-profile-lightbox__photo"><img src="" alt=""></div>' +
          '<div class="battersea-profile-lightbox__details"></div>' +
        '</div>';

      document.body.appendChild(this.lightbox);

      // Close button
      const closeBtn = this.lightbox.querySelector('.battersea-profile-lightbox__close');
      this.events.push(
        Utils.addEvent(closeBtn, 'click', () => this.closeLightbox())
      );

      // Overlay click
      this.events.push(
        Utils.addEvent(this.lightbox, 'click', (e) => {
          if (e.target === this.lightbox) {
            this.closeLightbox();
          }
        })
      );

      // Escape key
      this.events.push(
        Utils.addEvent(document, 'keydown', (e) => {
          if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
            this.closeLightbox();
          }
        })
      );
    }

    bindEvents() {
      this.items.forEach(item => {
        this.events.push(
          Utils.addEvent(item, 'click', (e) => {
            // Don't open lightbox if clicking a link inside the item
            if (e.target.closest('a')) return;
            this.openLightbox(item);
          })
        );
      });
    }

    openLightbox(item) {
      const img = item.querySelector('img');
      const name = Utils.getData(item, 'profile-name');
      const title = Utils.getData(item, 'profile-title');
      const position = Utils.getData(item, 'profile-position');
      const company = Utils.getData(item, 'profile-company');
      const university = Utils.getData(item, 'profile-university');
      const phone = Utils.getData(item, 'profile-phone');
      const email = Utils.getData(item, 'profile-email');
      const website = Utils.getData(item, 'profile-website');
      const socialData = Utils.getData(item, 'profile-social');
      const bioEl = item.querySelector('[data-profile-bio]');

      // Set photo
      const lightboxImg = this.lightbox.querySelector('.battersea-profile-lightbox__photo img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = name || '';
      }

      // Build details
      const details = this.lightbox.querySelector('.battersea-profile-lightbox__details');
      let html = '';

      if (name) {
        html += '<h2 class="battersea-profile-lightbox__name">' + this.escapeHtml(name) + '</h2>';
      }

      if (title) {
        html += '<p class="battersea-profile-lightbox__title">' + this.escapeHtml(title) + '</p>';
      }

      // Meta fields
      const metaFields = [];
      if (position) metaFields.push({ label: 'Position', value: position });
      if (company) metaFields.push({ label: 'Company', value: company });
      if (university) metaFields.push({ label: 'University', value: university });

      if (metaFields.length > 0) {
        html += '<ul class="battersea-profile-lightbox__meta">';
        metaFields.forEach(function(f) {
          html += '<li><strong>' + f.label + '</strong> ' + ProfileGrid.escapeHtml(f.value) + '</li>';
        });
        html += '</ul>';
      }

      // Contact links
      if (phone || email || website) {
        html += '<div class="battersea-profile-lightbox__contact">';
        if (phone) {
          html += '<a href="tel:' + this.escapeHtml(phone.replace(/\s/g, '')) + '">' + PHONE_ICON + this.escapeHtml(phone) + '</a>';
        }
        if (email) {
          html += '<a href="mailto:' + this.escapeHtml(email) + '">' + EMAIL_ICON + this.escapeHtml(email) + '</a>';
        }
        if (website) {
          html += '<a href="' + this.escapeHtml(website) + '" target="_blank" rel="noopener">' + WEBSITE_ICON + this.escapeHtml(website) + '</a>';
        }
        html += '</div>';
      }

      // Bio (rich HTML, cloned from the hidden container)
      if (bioEl) {
        html += '<div class="battersea-profile-lightbox__bio">' + bioEl.innerHTML + '</div>';
      }

      // Social links
      if (socialData) {
        try {
          const socials = JSON.parse(socialData);
          if (Array.isArray(socials) && socials.length > 0) {
            html += '<div class="battersea-profile-lightbox__social">';
            socials.forEach(function(s) {
              const platform = (s.platform || '').toLowerCase();
              const icon = SOCIAL_ICONS[platform] || null;
              if (icon) {
                html += '<a href="' + ProfileGrid.escapeHtml(s.url) + '" target="_blank" rel="noopener" aria-label="' + ProfileGrid.escapeHtml(s.platform) + '">' + icon + '</a>';
              } else {
                html += '<a href="' + ProfileGrid.escapeHtml(s.url) + '" target="_blank" rel="noopener" class="battersea-profile-lightbox__social-label">' + LINK_ICON + ' ' + ProfileGrid.escapeHtml(s.platform || 'Link') + '</a>';
              }
            });
            html += '</div>';
          }
        } catch (e) {
          console.warn('ProfileGrid: Invalid social data JSON', e);
        }
      }

      details.innerHTML = html;

      // Show lightbox
      this.lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';

      this.el.dispatchEvent(new CustomEvent('battersea:profileOpen', {
        detail: { item: item, name: name }
      }));
    }

    closeLightbox() {
      this.lightbox.classList.remove('active');
      document.body.style.overflow = '';

      this.el.dispatchEvent(new CustomEvent('battersea:profileClose'));
    }

    escapeHtml(str) {
      return ProfileGrid.escapeHtml(str);
    }

    static escapeHtml(str) {
      if (!str) return '';
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    destroy() {
      this.events.forEach(function(event) { event.remove(); });
      if (this.lightbox && this.lightbox.parentNode) {
        this.lightbox.parentNode.removeChild(this.lightbox);
      }
      document.body.style.overflow = '';
    }
  }

  window.Battersea.register('profileGrid', ProfileGrid, '[data-profile-grid]');

})(window, document);
