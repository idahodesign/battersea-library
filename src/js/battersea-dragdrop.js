/**
 * Battersea Library - DragDrop Component
 * Version: 1.0.0
 *
 * Reorderable lists and multi-container sorting with sessionStorage persistence.
 * Supports mouse and touch input.
 *
 * Modes:
 *   reorder - Drag items into a specific order within one container
 *   sort    - Drag items from a source into destination containers
 *   display - Read-only rendering of saved state from sessionStorage
 */

(function(window, document) {
	'use strict';

	if (!window.Battersea || !window.BatterseaUtils) {
		console.error('DragDrop requires Battersea Core and Utils');
		return;
	}

	const Utils = window.BatterseaUtils;

	class DragDrop {
		constructor(el) {
			this.el = el;
			this.mode = Utils.getData(el, 'drag-drop-mode') || 'reorder';
			this.storageKey = Utils.getData(el, 'drag-drop-key') || '';
			this.events = [];

			// Drag state
			this.draggedItem = null;
			this.ghost = null;
			this.placeholder = null;
			this.sourceContainer = null;
			this.startX = 0;
			this.startY = 0;
			this.offsetX = 0;
			this.offsetY = 0;
			this.isDragging = false;

			// Bound handlers for document-level events (need references for cleanup)
			this._onMouseMove = Utils.throttle((e) => this.onDragMove(e), 16);
			this._onMouseUp = (e) => this.endDrag(e);
			this._onTouchMove = Utils.throttle((e) => this.onDragMove(e), 16);
			this._onTouchEnd = (e) => this.endDrag(e);

			if (this.mode === 'display') {
				this.initDisplay();
			} else {
				this.init();
			}
		}

		init() {
			// Load saved state first
			this.loadState();

			// Find all draggable items
			const items = Utils.qsa('[data-drag-item]', this.el);
			if (items.length === 0) {
				console.warn('DragDrop: No items found');
				return;
			}

			// Bind drag events to each item
			items.forEach(item => this.bindItemEvents(item));

			// Add container labels in sort mode
			if (this.mode === 'sort') {
				this.setupContainerLabels();
			}

			// Fire restore event if state was loaded
			if (this.storageKey && this.stateLoaded) {
				this.el.dispatchEvent(new CustomEvent('battersea:dragRestore', {
					detail: { key: this.storageKey, mode: this.mode, data: this.lastSavedData }
				}));
			}
		}

		bindItemEvents(item) {
			// Mouse events
			this.events.push(
				Utils.addEvent(item, 'mousedown', (e) => {
					if (e.button !== 0) return; // Left click only
					e.preventDefault();
					this.startDrag(item, e.clientX, e.clientY);
				})
			);

			// Touch events
			this.events.push(
				Utils.addEvent(item, 'touchstart', (e) => {
					const touch = e.touches[0];
					this.startDrag(item, touch.clientX, touch.clientY);
				}, { passive: false })
			);
		}

		startDrag(item, clientX, clientY) {
			if (this.isDragging) return;
			this.isDragging = true;
			this.draggedItem = item;
			this.sourceContainer = item.parentElement;

			const rect = item.getBoundingClientRect();
			this.offsetX = clientX - rect.left;
			this.offsetY = clientY - rect.top;

			// Create ghost
			this.ghost = item.cloneNode(true);
			this.ghost.classList.add('battersea-dragdrop__ghost');
			this.ghost.style.width = rect.width + 'px';
			this.ghost.style.position = 'fixed';
			this.ghost.style.pointerEvents = 'none';
			this.ghost.style.zIndex = '10000';
			this.ghost.style.opacity = '0.7';
			this.ghost.style.left = (clientX - this.offsetX) + 'px';
			this.ghost.style.top = (clientY - this.offsetY) + 'px';
			this.ghost.setAttribute('aria-hidden', 'true');
			document.body.appendChild(this.ghost);

			// Create placeholder
			this.placeholder = document.createElement('div');
			this.placeholder.classList.add('battersea-dragdrop__placeholder');
			this.placeholder.style.height = rect.height + 'px';
			item.parentElement.insertBefore(this.placeholder, item);

			// Mark dragged item
			item.classList.add('battersea-dragdrop__dragging');

			// Bind document-level events
			document.addEventListener('mousemove', this._onMouseMove);
			document.addEventListener('mouseup', this._onMouseUp);
			document.addEventListener('touchmove', this._onTouchMove, { passive: false });
			document.addEventListener('touchend', this._onTouchEnd);

			// Fire event
			this.el.dispatchEvent(new CustomEvent('battersea:dragStart', {
				detail: {
					item: item,
					itemId: Utils.getData(item, 'drag-id'),
					container: this.sourceContainer
				}
			}));
		}

		onDragMove(e) {
			if (!this.isDragging) return;

			const pos = this.getPointerPosition(e);
			if (e.type === 'touchmove') e.preventDefault();

			// Move ghost
			this.ghost.style.left = (pos.x - this.offsetX) + 'px';
			this.ghost.style.top = (pos.y - this.offsetY) + 'px';

			// Find element under cursor
			const elementBelow = document.elementFromPoint(pos.x, pos.y);
			if (!elementBelow) return;

			// Find the nearest drag item or container
			const targetItem = elementBelow.closest('[data-drag-item]');
			const targetContainer = elementBelow.closest('[data-drag-container]') ||
				(this.mode === 'reorder' ? elementBelow.closest('[data-drag-drop]') : null);

			if (targetItem && targetItem !== this.draggedItem && targetItem !== this.placeholder) {
				// Insert placeholder near the target item
				const rect = targetItem.getBoundingClientRect();
				const midY = rect.top + rect.height / 2;

				if (pos.y < midY) {
					targetItem.parentElement.insertBefore(this.placeholder, targetItem);
				} else {
					targetItem.parentElement.insertBefore(this.placeholder, targetItem.nextSibling);
				}
			} else if (targetContainer && !targetContainer.contains(this.placeholder)) {
				// Hovering over an empty container (or one with no items near cursor)
				const items = Utils.qsa('[data-drag-item]:not(.battersea-dragdrop__dragging)', targetContainer);
				if (items.length === 0) {
					targetContainer.appendChild(this.placeholder);
				}
			}
		}

		endDrag(e) {
			if (!this.isDragging) return;
			this.isDragging = false;

			// Remove document-level events
			document.removeEventListener('mousemove', this._onMouseMove);
			document.removeEventListener('mouseup', this._onMouseUp);
			document.removeEventListener('touchmove', this._onTouchMove);
			document.removeEventListener('touchend', this._onTouchEnd);

			// Save references before cleanup nulls them
			const draggedItem = this.draggedItem;
			const sourceContainer = this.sourceContainer;
			const targetContainer = this.placeholder ? this.placeholder.parentElement : null;

			if (!targetContainer || !draggedItem) {
				this.removeDragElements();
				return;
			}

			// Check container max
			if (targetContainer !== sourceContainer && this.mode === 'sort') {
				const max = Utils.parseInt(Utils.getData(targetContainer, 'drag-drop-max'), Infinity);
				const currentCount = Utils.qsa('[data-drag-item]:not(.battersea-dragdrop__dragging)', targetContainer).length;
				if (currentCount >= max) {
					// Snap back — put item back in source container
					sourceContainer.appendChild(draggedItem);
					this.removeDragElements();
					return;
				}
			}

			// Insert item at placeholder position
			targetContainer.insertBefore(draggedItem, this.placeholder);

			// Clean up
			this.removeDragElements();

			// Save state
			this.saveState();

			// Fire events
			this.el.dispatchEvent(new CustomEvent('battersea:dragEnd', {
				detail: {
					item: draggedItem,
					itemId: Utils.getData(draggedItem, 'drag-id'),
					fromContainer: sourceContainer,
					toContainer: targetContainer
				}
			}));
		}

		removeDragElements() {
			if (this.ghost && this.ghost.parentNode) {
				this.ghost.parentNode.removeChild(this.ghost);
			}
			if (this.placeholder && this.placeholder.parentNode) {
				this.placeholder.parentNode.removeChild(this.placeholder);
			}
			if (this.draggedItem) {
				this.draggedItem.classList.remove('battersea-dragdrop__dragging');
			}
			this.ghost = null;
			this.placeholder = null;
			this.draggedItem = null;
			this.sourceContainer = null;
		}

		saveState() {
			if (!this.storageKey) return;

			let data;

			if (this.mode === 'reorder') {
				const items = Utils.qsa('[data-drag-item]', this.el);
				data = {
					key: this.storageKey,
					mode: 'reorder',
					items: items.map(item => ({
						id: Utils.getData(item, 'drag-id'),
						html: item.innerHTML
					}))
				};
			} else if (this.mode === 'sort') {
				const containers = Utils.qsa('[data-drag-container]', this.el);
				const containerData = {};
				containers.forEach(container => {
					const name = Utils.getData(container, 'drag-container');
					const label = Utils.getData(container, 'drag-container-label') || name;
					const items = Utils.qsa('[data-drag-item]', container);
					containerData[name] = {
						label: label,
						items: items.map(item => ({
							id: Utils.getData(item, 'drag-id'),
							html: item.innerHTML
						}))
					};
				});
				data = {
					key: this.storageKey,
					mode: 'sort',
					containers: containerData
				};
			}

			if (data) {
				try {
					sessionStorage.setItem('battersea-dragdrop-' + this.storageKey, JSON.stringify(data));
					this.lastSavedData = data;

					this.el.dispatchEvent(new CustomEvent('battersea:dragSave', {
						detail: { key: this.storageKey, mode: this.mode, data: data }
					}));
				} catch (e) {
					console.warn('DragDrop: Could not save to sessionStorage', e);
				}
			}
		}

		loadState() {
			if (!this.storageKey) return;
			this.stateLoaded = false;

			let raw;
			try {
				raw = sessionStorage.getItem('battersea-dragdrop-' + this.storageKey);
			} catch (e) {
				return;
			}

			if (!raw) return;

			let data;
			try {
				data = JSON.parse(raw);
			} catch (e) {
				return;
			}

			this.lastSavedData = data;

			if (this.mode === 'reorder' && data.mode === 'reorder' && data.items) {
				this.applyReorderState(data.items);
				this.stateLoaded = true;
			} else if (this.mode === 'sort' && data.mode === 'sort' && data.containers) {
				this.applySortState(data.containers);
				this.stateLoaded = true;
			}
		}

		applyReorderState(savedItems) {
			const container = this.mode === 'reorder' ? this.el : null;
			if (!container) return;

			const itemMap = {};
			Utils.qsa('[data-drag-item]', container).forEach(item => {
				itemMap[Utils.getData(item, 'drag-id')] = item;
			});

			// Re-append items in saved order
			savedItems.forEach(saved => {
				const item = itemMap[saved.id];
				if (item) {
					container.appendChild(item);
				}
			});
		}

		applySortState(savedContainers) {
			const containerMap = {};
			Utils.qsa('[data-drag-container]', this.el).forEach(container => {
				containerMap[Utils.getData(container, 'drag-container')] = container;
			});

			const itemMap = {};
			Utils.qsa('[data-drag-item]', this.el).forEach(item => {
				itemMap[Utils.getData(item, 'drag-id')] = item;
			});

			// Move items to their saved containers in order
			Object.keys(savedContainers).forEach(containerName => {
				const container = containerMap[containerName];
				if (!container) return;

				const savedItems = savedContainers[containerName].items || [];
				savedItems.forEach(saved => {
					const item = itemMap[saved.id];
					if (item) {
						container.appendChild(item);
					}
				});
			});
		}

		setupContainerLabels() {
			const containers = Utils.qsa('[data-drag-container]', this.el);
			containers.forEach(container => {
				const label = Utils.getData(container, 'drag-container-label');
				if (label && !Utils.qs('.battersea-dragdrop__container-label', container)) {
					const labelEl = document.createElement('div');
					labelEl.className = 'battersea-dragdrop__container-label';
					labelEl.textContent = label;
					container.insertBefore(labelEl, container.firstChild);
				}
			});
		}

		// Display mode — read-only rendering of saved state
		initDisplay() {
			if (!this.storageKey) {
				this.showEmptyMessage();
				return;
			}

			let raw;
			try {
				raw = sessionStorage.getItem('battersea-dragdrop-' + this.storageKey);
			} catch (e) {
				this.showEmptyMessage();
				return;
			}

			if (!raw) {
				this.showEmptyMessage();
				return;
			}

			let data;
			try {
				data = JSON.parse(raw);
			} catch (e) {
				this.showEmptyMessage();
				return;
			}

			this.el.classList.add('battersea-dragdrop--display');

			if (data.mode === 'reorder' && data.items) {
				this.renderReorderDisplay(data.items);
			} else if (data.mode === 'sort' && data.containers) {
				this.renderSortDisplay(data.containers);
			} else {
				this.showEmptyMessage();
			}
		}

		renderReorderDisplay(items) {
			const ol = document.createElement('ol');
			ol.className = 'battersea-dragdrop__display-list';

			items.forEach(item => {
				const li = document.createElement('li');
				li.className = 'battersea-dragdrop__display-item';
				li.innerHTML = item.html;
				ol.appendChild(li);
			});

			this.el.appendChild(ol);
		}

		renderSortDisplay(containers) {
			const wrapper = document.createElement('div');
			wrapper.className = 'battersea-dragdrop__display-groups';

			Object.keys(containers).forEach(name => {
				const containerData = containers[name];
				const items = containerData.items || [];
				if (items.length === 0) return; // Skip empty containers

				const group = document.createElement('div');
				group.className = 'battersea-dragdrop__display-group';

				const heading = document.createElement('h4');
				heading.className = 'battersea-dragdrop__display-group-title';
				heading.textContent = containerData.label || name;
				group.appendChild(heading);

				const ul = document.createElement('ul');
				ul.className = 'battersea-dragdrop__display-list';
				items.forEach(item => {
					const li = document.createElement('li');
					li.className = 'battersea-dragdrop__display-item';
					li.innerHTML = item.html;
					ul.appendChild(li);
				});
				group.appendChild(ul);

				wrapper.appendChild(group);
			});

			if (wrapper.children.length === 0) {
				this.showEmptyMessage();
			} else {
				this.el.appendChild(wrapper);
			}
		}

		showEmptyMessage() {
			const msg = document.createElement('p');
			msg.className = 'battersea-dragdrop__empty-message';
			msg.textContent = 'No saved data yet. Try the demos above and come back here.';
			this.el.appendChild(msg);
		}

		getPointerPosition(e) {
			if (e.type && e.type.startsWith('touch')) {
				const touch = e.touches[0] || e.changedTouches[0];
				return { x: touch.clientX, y: touch.clientY };
			}
			return { x: e.clientX, y: e.clientY };
		}

		destroy() {
			this.events.forEach(event => event.remove());
			this.events = [];

			// Clean up any active drag
			document.removeEventListener('mousemove', this._onMouseMove);
			document.removeEventListener('mouseup', this._onMouseUp);
			document.removeEventListener('touchmove', this._onTouchMove);
			document.removeEventListener('touchend', this._onTouchEnd);

			this.removeDragElements();
		}
	}

	window.Battersea.register('dragDrop', DragDrop, '[data-drag-drop]');

})(window, document);
