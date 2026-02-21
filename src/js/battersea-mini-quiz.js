/**
 * Battersea Mini Quiz Component
 * Version: 2.26.0
 *
 * Interactive quiz element with multiple question types, data sources,
 * countdown timer, and configurable results display.
 *
 * Question types: boolean (two-choice), choice (single), multi (multiple),
 *                 order (drag to reorder), match (drag to match pairs),
 *                 group (drag to sort into categories)
 * Data sources: HTML markup, JSON (inline or file), CSV file
 */
(function(window, document) {
	'use strict';

	if (!window.Battersea || !window.BatterseaUtils) {
		console.error('MiniQuiz requires Battersea Core and Utils');
		return;
	}

	const Utils = window.BatterseaUtils;

	class MiniQuiz {
		constructor(el) {
			this.el = el;
			this.events = [];
			this.questions = [];
			this.userAnswers = {};
			this.submitted = false;
			this.timerValue = 0;
			this.timerInterval = null;
			this.startTime = null;
			this.quizEl = null;
			this.liveRegion = null;
			this.originalHTML = null;

			// Drag state
			this.dragState = null;
			this._onDragMove = Utils.throttle((e) => this._handleDragMove(e), 16);
			this._onDragEnd = (e) => this._handleDragEnd(e);
			this._keyboardGrabbed = null;

			// Navigation prevention
			this._beforeUnloadHandler = null;
			this._linkClickHandler = null;
			this._leaveWarningEl = null;

			// Mobile detection for match select fallback
			this._isMobile = window.matchMedia('(max-width: 767px)').matches;

			// Read config
			this.config = {
				title: Utils.getData(el, 'quiz-title') || '',
				description: Utils.getData(el, 'quiz-description') || '',
				timer: Utils.parseInt(Utils.getData(el, 'quiz-timer'), 0),
				hidden: Utils.parseBoolean(Utils.getData(el, 'quiz-hidden') || 'false'),
				results: Utils.getData(el, 'quiz-results') || 'both',
				shuffle: Utils.parseBoolean(Utils.getData(el, 'quiz-shuffle') || 'false'),
				shuffleOptions: Utils.parseBoolean(Utils.getData(el, 'quiz-shuffle-options') || 'false'),
				requireAttempt: Utils.parseBoolean(Utils.getData(el, 'quiz-require-attempt') || 'false')
			};

			this.quizId = Utils.generateId('quiz');
			this.init();
		}

		init() {
			// Store original HTML for destroy()
			this.originalHTML = this.el.innerHTML;

			// Detect data source: CSV > JSON > HTML
			const csvUrl = Utils.getData(this.el, 'quiz-csv');
			if (csvUrl) {
				this.loadCSV(csvUrl);
				return;
			}

			const jsonValue = Utils.getData(this.el, 'quiz-data');
			if (jsonValue) {
				const trimmed = jsonValue.trim();
				if (trimmed.charAt(0) === '[' || trimmed.charAt(0) === '{') {
					this.parseJSONData(trimmed);
				} else {
					this.loadJSON(trimmed);
					return;
				}
			} else {
				this.parseHTMLQuestions();
			}

			this.finishInit();
		}

		finishInit() {
			if (this.questions.length === 0) {
				console.warn('MiniQuiz: No questions found');
				return;
			}

			// Shuffle questions if configured
			if (this.config.shuffle) {
				this.shuffleArray(this.questions);
			}

			// Shuffle options within each question if configured
			if (this.config.shuffleOptions) {
				this.questions.forEach(q => {
					if (q.options && q.options.length > 0) {
						this.shuffleArray(q.options);
					}
				});
			}

			// Clear container and build quiz
			this.el.innerHTML = '';
			this.buildQuiz();

			// Set up navigation prevention
			if (this.config.requireAttempt) {
				this._setupNavPrevention();
			}

			// Dispatch ready event
			this.el.dispatchEvent(new CustomEvent('battersea:quizReady', {
				bubbles: true,
				detail: {
					questionCount: this.questions.length,
					hasTimer: this.config.timer > 0,
					isHidden: this.config.hidden
				}
			}));
		}

		// ============================================================
		// Data Loading
		// ============================================================

		loadJSON(url) {
			fetch(url)
				.then(response => {
					if (!response.ok) throw new Error('HTTP ' + response.status);
					return response.json();
				})
				.then(data => {
					this.parseJSONObject(data);
					this.finishInit();
				})
				.catch(err => {
					console.error('MiniQuiz: Failed to load JSON - ' + err.message);
				});
		}

		loadCSV(url) {
			fetch(url)
				.then(response => {
					if (!response.ok) throw new Error('HTTP ' + response.status);
					return response.text();
				})
				.then(text => {
					this.parseCSVString(text);
					this.finishInit();
				})
				.catch(err => {
					console.error('MiniQuiz: Failed to load CSV - ' + err.message);
				});
		}

		parseJSONData(jsonStr) {
			try {
				const data = JSON.parse(jsonStr);
				this.parseJSONObject(data);
			} catch (err) {
				console.error('MiniQuiz: Invalid JSON - ' + err.message);
			}
		}

		parseJSONObject(data) {
			// Handle both array of questions and object with metadata
			if (Array.isArray(data)) {
				this.questions = data.map((q, i) => this.normaliseQuestion(q, i));
			} else {
				if (data.title && !this.config.title) this.config.title = data.title;
				if (data.description && !this.config.description) this.config.description = data.description;
				const qs = data.questions || [];
				this.questions = qs.map((q, i) => this.normaliseQuestion(q, i));
			}
		}

		parseCSVString(text) {
			const lines = [];
			let current = '';
			let inQuotes = false;

			for (let i = 0; i < text.length; i++) {
				const ch = text[i];
				if (ch === '"') {
					if (inQuotes && text[i + 1] === '"') {
						current += '"';
						i++;
					} else {
						inQuotes = !inQuotes;
					}
				} else if (ch === ',' && !inQuotes) {
					lines.push(current);
					current = '';
				} else if ((ch === '\n' || ch === '\r') && !inQuotes) {
					lines.push(current);
					current = '';
					// Skip \r\n pair
					if (ch === '\r' && text[i + 1] === '\n') i++;
					// Process the row
					if (lines.length > 0 && lines.some(f => f.trim() !== '')) {
						this._csvRows = this._csvRows || [];
						this._csvRows.push(lines.slice());
					}
					lines.length = 0;
				} else {
					current += ch;
				}
			}
			// Push last field and row
			lines.push(current);
			if (lines.length > 0 && lines.some(f => f.trim() !== '')) {
				this._csvRows = this._csvRows || [];
				this._csvRows.push(lines.slice());
			}

			if (!this._csvRows || this._csvRows.length < 2) {
				console.warn('MiniQuiz: CSV has no data rows');
				return;
			}

			// First row is headers
			const headers = this._csvRows[0].map(h => h.trim().toLowerCase());
			const questions = [];

			for (let r = 1; r < this._csvRows.length; r++) {
				const row = this._csvRows[r];
				const obj = {};
				headers.forEach((h, i) => {
					obj[h] = (row[i] || '').trim();
				});

				// Parse pipe-separated options and answers
				const qType = obj.type || 'choice';
				const q = {
					id: obj.id || '',
					type: qType,
					question: obj.question || '',
					options: (obj.options || '').split('|').map(o => o.trim()).filter(Boolean),
					answer: qType === 'multi'
						? (obj.answer || '').split('|').map(a => a.trim()).filter(Boolean)
						: (obj.answer || '').trim(),
					explanation: obj.explanation || ''
				};

				// Drag type fields
				if (obj.items) {
					q.items = obj.items.split('|').map(s => s.trim()).filter(Boolean);
				}
				if (obj.pairs) {
					q.pairs = obj.pairs.split('|').map(s => s.trim()).filter(Boolean);
				}
				if (obj.categories) {
					q.categories = obj.categories.split('|').map(s => s.trim()).filter(Boolean);
				}

				// Parse answer as integer array for drag types
				if (qType === 'order' || qType === 'match' || qType === 'group') {
					q.answer = (obj.answer || '').split('|').map(a => parseInt(a.trim(), 10)).filter(n => !isNaN(n));
				}

				questions.push(q);
			}

			this.questions = questions.map((q, i) => this.normaliseQuestion(q, i));
			delete this._csvRows;
		}

		parseHTMLQuestions() {
			const questionEls = Utils.qsa('[data-quiz-question]', this.el);
			this.questions = questionEls.map((el, i) => {
				const type = Utils.getData(el, 'quiz-type') || 'choice';
				const answerRaw = Utils.getData(el, 'quiz-answer') || '';
				const explanation = Utils.getData(el, 'quiz-explanation') || '';

				// Get question text from first <p> or text content
				const pEl = Utils.qs('p', el);
				const questionText = pEl ? pEl.textContent.trim() : '';

				// Get options (for boolean, choice, multi, order)
				const optionEls = Utils.qsa('[data-quiz-option]', el);
				const options = optionEls.map(o => o.textContent.trim());

				// Parse answer based on type
				let answer;
				if (type === 'multi') {
					answer = answerRaw.split('|').map(a => a.trim()).filter(Boolean);
				} else if (type === 'order' || type === 'match' || type === 'group') {
					answer = answerRaw ? answerRaw.split('|').map(a => parseInt(a.trim(), 10)).filter(n => !isNaN(n)) : [];
				} else {
					answer = answerRaw.trim();
				}

				const qData = {
					type: type,
					question: questionText,
					options: options,
					answer: answer,
					explanation: explanation
				};

				// Drag type HTML fields
				if (type === 'match' || type === 'group') {
					const itemEls = Utils.qsa('[data-quiz-item]', el);
					qData.items = itemEls.map(o => o.textContent.trim());
				}
				if (type === 'match') {
					const pairEls = Utils.qsa('[data-quiz-pair]', el);
					qData.pairs = pairEls.map(o => o.textContent.trim());
				}
				if (type === 'group') {
					const categoriesRaw = Utils.getData(el, 'quiz-categories') || '';
					qData.categories = categoriesRaw.split('|').map(s => s.trim()).filter(Boolean);
				}

				return this.normaliseQuestion(qData, i);
			});
		}

		normaliseQuestion(raw, index) {
			const q = {
				id: raw.id || 'q' + index,
				type: raw.type || 'choice',
				question: raw.question || '',
				options: raw.options || [],
				answer: raw.answer || '',
				explanation: raw.explanation || ''
			};

			// Validate type
			if (['boolean', 'choice', 'multi', 'order', 'match', 'group'].indexOf(q.type) === -1) {
				console.warn('MiniQuiz: Unknown question type "' + q.type + '", defaulting to "choice"');
				q.type = 'choice';
			}

			// Ensure multi answers are arrays
			if (q.type === 'multi' && !Array.isArray(q.answer)) {
				q.answer = q.answer.split('|').map(a => a.trim()).filter(Boolean);
			}

			// Order type: answer is always [0, 1, 2, ..., n-1]
			if (q.type === 'order') {
				q.answer = q.options.map((_, i) => i);
			}

			// Match type: copy items, pairs; validate answer
			if (q.type === 'match') {
				q.items = raw.items || [];
				q.pairs = raw.pairs || [];
				if (!Array.isArray(q.answer) || q.answer.length === 0) {
					q.answer = q.items.map((_, i) => i);
				}
			}

			// Group type: copy items, categories; validate answer
			if (q.type === 'group') {
				q.items = raw.items || [];
				q.categories = raw.categories || [];
				if (!Array.isArray(q.answer)) {
					q.answer = [];
				}
			}

			return q;
		}

		// ============================================================
		// DOM Construction
		// ============================================================

		buildQuiz() {
			this.quizEl = document.createElement('div');
			this.quizEl.className = 'battersea-quiz';

			// Title
			if (this.config.title) {
				const title = document.createElement('h3');
				title.className = 'battersea-quiz__title';
				title.textContent = this.config.title;
				this.quizEl.appendChild(title);
			}

			// Description
			if (this.config.description) {
				const desc = document.createElement('p');
				desc.className = 'battersea-quiz__description';
				desc.textContent = this.config.description;
				this.quizEl.appendChild(desc);
			}

			// Timer
			if (this.config.timer > 0) {
				const timerEl = document.createElement('div');
				timerEl.className = 'battersea-quiz__timer';
				timerEl.innerHTML = '<span class="battersea-quiz__timer-icon">\u23F1</span>' +
					'<span class="battersea-quiz__timer-value">' + this.formatTime(this.config.timer) + '</span>';
				this.quizEl.appendChild(timerEl);
				this.timerEl = timerEl;
			}

			// Questions container
			const questionsEl = document.createElement('div');
			questionsEl.className = 'battersea-quiz__questions';

			this.questions.forEach(q => {
				questionsEl.appendChild(this.buildQuestion(q));
			});

			this.quizEl.appendChild(questionsEl);

			// Submit button
			const actionsEl = document.createElement('div');
			actionsEl.className = 'battersea-quiz__actions';
			const submitBtn = document.createElement('button');
			submitBtn.className = 'battersea-quiz__submit-btn';
			submitBtn.type = 'button';
			submitBtn.textContent = 'Submit Answers';
			this.events.push(
				Utils.addEvent(submitBtn, 'click', () => this.handleSubmit())
			);
			actionsEl.appendChild(submitBtn);
			this.submitBtn = submitBtn;
			this.quizEl.appendChild(actionsEl);

			// Live region for screen readers
			this.liveRegion = document.createElement('div');
			this.liveRegion.setAttribute('role', 'status');
			this.liveRegion.setAttribute('aria-live', 'polite');
			this.liveRegion.className = 'battersea-quiz__live-region';
			this.quizEl.appendChild(this.liveRegion);

			// Hidden/timer mode: wrap in hidden state, add reveal button
			// Any quiz with a timer needs a start button so the user controls when it begins
			if (this.config.hidden || this.config.timer > 0) {
				this.quizEl.classList.add('battersea-quiz--hidden');

				const revealBtn = document.createElement('button');
				revealBtn.className = 'battersea-quiz__reveal-btn';
				revealBtn.type = 'button';
				revealBtn.textContent = 'Start Quiz';
				this.events.push(
					Utils.addEvent(revealBtn, 'click', () => this.revealQuiz(revealBtn))
				);
				this.el.appendChild(revealBtn);
			}

			this.el.appendChild(this.quizEl);
		}

		buildQuestion(question) {
			const fieldset = document.createElement('fieldset');
			fieldset.className = 'battersea-quiz__question';
			fieldset.setAttribute('data-question-id', question.id);
			fieldset.setAttribute('data-question-type', question.type);

			const legend = document.createElement('legend');
			legend.className = 'battersea-quiz__question-text';
			let legendText = question.question;
			if (question.type === 'multi') {
				legendText += ' (select all that apply)';
			} else if (question.type === 'order') {
				legendText += ' (drag to reorder)';
			} else if (question.type === 'match') {
				legendText += this._isMobile ? ' (select the matching item)' : ' (drag items to their match)';
			} else if (question.type === 'group') {
				legendText += ' (drag items into the correct group)';
			}
			legend.textContent = legendText;
			fieldset.appendChild(legend);

			// Branch for drag types
			if (question.type === 'order') {
				this._buildOrderQuestion(question, fieldset);
				return fieldset;
			}
			if (question.type === 'match') {
				this._buildMatchQuestion(question, fieldset);
				return fieldset;
			}
			if (question.type === 'group') {
				this._buildGroupQuestion(question, fieldset);
				return fieldset;
			}

			// Standard radio/checkbox types
			const optionsList = document.createElement('ul');
			optionsList.className = 'battersea-quiz__options';
			if (question.type === 'boolean') {
				optionsList.classList.add('battersea-quiz__options--boolean');
			}

			const inputType = question.type === 'multi' ? 'checkbox' : 'radio';
			const inputName = this.quizId + '-' + question.id;

			question.options.forEach((option, i) => {
				const li = document.createElement('li');
				li.className = 'battersea-quiz__option';

				const label = document.createElement('label');
				label.className = 'battersea-quiz__option-label';

				const input = document.createElement('input');
				input.type = inputType;
				input.name = inputName;
				input.value = option;
				input.className = 'battersea-quiz__option-input';
				input.id = inputName + '-' + i;

				this.events.push(
					Utils.addEvent(input, 'change', () => {
						this.handleOptionSelect(question.id, question.type, input);
					})
				);

				const span = document.createElement('span');
				span.className = 'battersea-quiz__option-text';
				span.textContent = option;

				label.appendChild(input);
				label.appendChild(span);
				li.appendChild(label);
				optionsList.appendChild(li);
			});

			fieldset.appendChild(optionsList);
			return fieldset;
		}

		// ============================================================
		// Drag Question Builders
		// ============================================================

		_buildOrderQuestion(question, fieldset) {
			const listEl = document.createElement('div');
			listEl.className = 'battersea-quiz__order-list';
			listEl.setAttribute('role', 'listbox');
			listEl.setAttribute('aria-label', 'Drag items to reorder');

			// Create shuffled index array
			const indices = question.options.map((_, i) => i);
			this.shuffleArray(indices);

			indices.forEach(originalIdx => {
				const item = this._buildDragItem(question.options[originalIdx], originalIdx);
				listEl.appendChild(item);
			});

			fieldset.appendChild(listEl);

			// Set initial answer (shuffled order)
			this._updateDragAnswer(question, fieldset);

			// Bind drag and keyboard events
			this._initDragForQuestion(fieldset, question);
			this._initKeyboardDrag(fieldset, question);
		}

		_buildMatchQuestion(question, fieldset) {
			if (this._isMobile) {
				this._buildMatchSelectFallback(question, fieldset);
				return;
			}

			const layout = document.createElement('div');
			layout.className = 'battersea-quiz__match-layout';

			// Left: draggable items
			const itemsCol = document.createElement('div');
			itemsCol.className = 'battersea-quiz__match-items';

			const itemsLabel = document.createElement('div');
			itemsLabel.className = 'battersea-quiz__match-col-label';
			itemsLabel.textContent = 'Items';
			itemsCol.appendChild(itemsLabel);

			// Shuffle items for display
			const indices = question.items.map((_, i) => i);
			this.shuffleArray(indices);

			indices.forEach(originalIdx => {
				const item = this._buildDragItem(question.items[originalIdx], originalIdx);
				itemsCol.appendChild(item);
			});

			layout.appendChild(itemsCol);

			// Right: drop zones labelled with pairs
			const pairsCol = document.createElement('div');
			pairsCol.className = 'battersea-quiz__match-pairs';

			const pairsLabel = document.createElement('div');
			pairsLabel.className = 'battersea-quiz__match-col-label';
			pairsLabel.textContent = 'Matches';
			pairsCol.appendChild(pairsLabel);

			question.pairs.forEach((pairText, pairIdx) => {
				const zone = document.createElement('div');
				zone.className = 'battersea-quiz__match-zone';
				zone.setAttribute('data-quiz-pair-index', pairIdx);

				const label = document.createElement('div');
				label.className = 'battersea-quiz__match-zone-label';
				label.textContent = pairText;
				zone.appendChild(label);

				const slot = document.createElement('div');
				slot.className = 'battersea-quiz__match-zone-slot';
				zone.appendChild(slot);

				pairsCol.appendChild(zone);
			});

			layout.appendChild(pairsCol);
			fieldset.appendChild(layout);

			// Initialise answer with all unplaced
			this.userAnswers[question.id] = new Array(question.items.length).fill(-1);

			// Bind drag and keyboard events
			this._initDragForQuestion(fieldset, question);
			this._initKeyboardDrag(fieldset, question);
		}

		_buildMatchSelectFallback(question, fieldset) {
			const container = document.createElement('div');
			container.className = 'battersea-quiz__match-selects';

			// Shuffle items order for select options
			const shuffledItemIndices = question.items.map((_, i) => i);
			this.shuffleArray(shuffledItemIndices);

			question.pairs.forEach((pairText, pairIdx) => {
				const row = document.createElement('div');
				row.className = 'battersea-quiz__match-select-row';

				const label = document.createElement('span');
				label.className = 'battersea-quiz__match-select-label';
				label.textContent = pairText;
				row.appendChild(label);

				const select = document.createElement('select');
				select.className = 'battersea-quiz__match-select';
				select.setAttribute('data-quiz-pair-index', pairIdx);

				const defaultOpt = document.createElement('option');
				defaultOpt.value = '';
				defaultOpt.textContent = '-- Select --';
				select.appendChild(defaultOpt);

				shuffledItemIndices.forEach(itemIdx => {
					const opt = document.createElement('option');
					opt.value = itemIdx;
					opt.textContent = question.items[itemIdx];
					select.appendChild(opt);
				});

				this.events.push(
					Utils.addEvent(select, 'change', () => {
						this._handleMatchSelectChange(question, fieldset);
					})
				);

				row.appendChild(select);
				container.appendChild(row);
			});

			fieldset.appendChild(container);

			// Initialise answer
			this.userAnswers[question.id] = new Array(question.items.length).fill(-1);
		}

		_handleMatchSelectChange(question, fieldset) {
			if (this.submitted) return;

			const selects = Utils.qsa('.battersea-quiz__match-select', fieldset);
			const answer = new Array(question.items.length).fill(-1);

			// Auto-deselect duplicates: last change wins
			const seen = {};
			selects.forEach(sel => {
				if (sel.value === '') return;
				const itemIdx = parseInt(sel.value, 10);
				if (seen[itemIdx] !== undefined) {
					// Clear the previous select that had this item
					selects[seen[itemIdx]].value = '';
				}
				seen[itemIdx] = parseInt(sel.getAttribute('data-quiz-pair-index'), 10);
			});

			// Build answer
			selects.forEach(sel => {
				if (sel.value === '') return;
				const itemIdx = parseInt(sel.value, 10);
				const pairIdx = parseInt(sel.getAttribute('data-quiz-pair-index'), 10);
				answer[itemIdx] = pairIdx;
			});

			this.userAnswers[question.id] = answer;
			fieldset.classList.remove('battersea-quiz__question--unanswered');

			this.el.dispatchEvent(new CustomEvent('battersea:quizAnswer', {
				bubbles: true,
				detail: { questionId: question.id, value: answer, type: 'match' }
			}));
		}

		_buildGroupQuestion(question, fieldset) {
			// Item pool
			const pool = document.createElement('div');
			pool.className = 'battersea-quiz__group-pool';
			pool.setAttribute('data-quiz-pool', '');

			const poolLabel = document.createElement('div');
			poolLabel.className = 'battersea-quiz__group-pool-label';
			poolLabel.textContent = 'Drag items into the groups below';
			pool.appendChild(poolLabel);

			// Shuffle items for display
			const indices = question.items.map((_, i) => i);
			this.shuffleArray(indices);

			indices.forEach(originalIdx => {
				const item = this._buildDragItem(question.items[originalIdx], originalIdx);
				pool.appendChild(item);
			});

			fieldset.appendChild(pool);

			// Category zones
			const categoriesEl = document.createElement('div');
			categoriesEl.className = 'battersea-quiz__group-categories';

			question.categories.forEach((catText, catIdx) => {
				const zone = document.createElement('div');
				zone.className = 'battersea-quiz__group-zone';
				zone.setAttribute('data-quiz-category-index', catIdx);

				const label = document.createElement('div');
				label.className = 'battersea-quiz__group-zone-label';
				label.textContent = catText;
				zone.appendChild(label);

				categoriesEl.appendChild(zone);
			});

			fieldset.appendChild(categoriesEl);

			// Initialise answer with all unplaced
			this.userAnswers[question.id] = new Array(question.items.length).fill(-1);

			// Bind drag and keyboard events
			this._initDragForQuestion(fieldset, question);
			this._initKeyboardDrag(fieldset, question);
		}

		_buildDragItem(text, originalIndex) {
			const item = document.createElement('div');
			item.className = 'battersea-quiz__drag-item';
			item.setAttribute('data-quiz-drag-index', originalIndex);
			item.setAttribute('tabindex', '0');
			item.setAttribute('role', 'option');
			item.setAttribute('aria-grabbed', 'false');

			const handle = document.createElement('span');
			handle.className = 'battersea-quiz__drag-handle';
			handle.textContent = '\u2630';

			const span = document.createElement('span');
			span.className = 'battersea-quiz__drag-text';
			span.textContent = text;

			item.appendChild(handle);
			item.appendChild(span);
			return item;
		}

		// ============================================================
		// Drag-and-Drop System
		// ============================================================

		_getPointerPosition(e) {
			if (e.type && e.type.startsWith('touch')) {
				const touch = e.touches[0] || e.changedTouches[0];
				return { x: touch.clientX, y: touch.clientY };
			}
			return { x: e.clientX, y: e.clientY };
		}

		_initDragForQuestion(fieldset, question) {
			const items = Utils.qsa('.battersea-quiz__drag-item', fieldset);
			items.forEach(item => {
				this.events.push(
					Utils.addEvent(item, 'mousedown', (e) => {
						if (e.button !== 0) return;
						e.preventDefault();
						this._startDrag(item, e.clientX, e.clientY, question, fieldset);
					})
				);
				this.events.push(
					Utils.addEvent(item, 'touchstart', (e) => {
						const touch = e.touches[0];
						this._startDrag(item, touch.clientX, touch.clientY, question, fieldset);
					}, { passive: false })
				);
			});
		}

		_startDrag(item, clientX, clientY, question, fieldset) {
			if (this.submitted || this.dragState) return;

			// Cancel any keyboard grab
			if (this._keyboardGrabbed) {
				this._keyboardGrabbed.item.classList.remove('battersea-quiz__drag-item--grabbed');
				this._keyboardGrabbed.item.setAttribute('aria-grabbed', 'false');
				this._keyboardGrabbed = null;
			}

			const rect = item.getBoundingClientRect();
			const offsetX = clientX - rect.left;
			const offsetY = clientY - rect.top;

			// Create ghost
			const ghost = item.cloneNode(true);
			ghost.classList.add('battersea-quiz__drag-ghost');
			ghost.style.position = 'fixed';
			ghost.style.pointerEvents = 'none';
			ghost.style.zIndex = '10000';
			ghost.style.width = rect.width + 'px';
			ghost.style.left = (clientX - offsetX) + 'px';
			ghost.style.top = (clientY - offsetY) + 'px';
			ghost.style.margin = '0';
			ghost.removeAttribute('tabindex');
			ghost.removeAttribute('role');
			document.body.appendChild(ghost);

			// Create placeholder
			const placeholder = document.createElement('div');
			placeholder.className = 'battersea-quiz__drag-placeholder';
			placeholder.style.height = rect.height + 'px';
			item.parentElement.insertBefore(placeholder, item);

			// Hide original item
			item.classList.add('battersea-quiz__drag-item--dragging');

			this.dragState = {
				item: item,
				ghost: ghost,
				placeholder: placeholder,
				question: question,
				fieldset: fieldset,
				offsetX: offsetX,
				offsetY: offsetY
			};

			// Bind document-level move/end events
			document.addEventListener('mousemove', this._onDragMove);
			document.addEventListener('mouseup', this._onDragEnd);
			document.addEventListener('touchmove', this._onDragMove, { passive: false });
			document.addEventListener('touchend', this._onDragEnd);
		}

		_handleDragMove(e) {
			if (!this.dragState) return;
			e.preventDefault();

			const pos = this._getPointerPosition(e);
			const state = this.dragState;

			// Move ghost
			state.ghost.style.left = (pos.x - state.offsetX) + 'px';
			state.ghost.style.top = (pos.y - state.offsetY) + 'px';

			// Find element under cursor
			const elBelow = document.elementFromPoint(pos.x, pos.y);
			if (!elBelow) return;

			const qType = state.question.type;

			if (qType === 'order') {
				this._handleOrderDragMove(elBelow, pos, state);
			} else if (qType === 'match') {
				this._handleMatchDragMove(elBelow, pos, state);
			} else if (qType === 'group') {
				this._handleGroupDragMove(elBelow, pos, state);
			}
		}

		_handleOrderDragMove(elBelow, pos, state) {
			const targetItem = elBelow.closest('.battersea-quiz__drag-item');
			if (targetItem && targetItem !== state.item && targetItem.closest('.battersea-quiz__order-list')) {
				const rect = targetItem.getBoundingClientRect();
				const midY = rect.top + rect.height / 2;
				const parent = targetItem.parentElement;
				if (pos.y < midY) {
					parent.insertBefore(state.placeholder, targetItem);
				} else {
					parent.insertBefore(state.placeholder, targetItem.nextSibling);
				}
			}
		}

		_handleMatchDragMove(elBelow, pos, state) {
			// Check if over a match zone
			const zone = elBelow.closest('.battersea-quiz__match-zone');
			if (zone && zone.closest('[data-question-id="' + state.question.id + '"]')) {
				const slot = Utils.qs('.battersea-quiz__match-zone-slot', zone);
				if (slot) {
					slot.appendChild(state.placeholder);
				}
				zone.classList.add('battersea-quiz__match-zone--active');

				// Remove active from other zones
				const allZones = Utils.qsa('.battersea-quiz__match-zone', state.fieldset);
				allZones.forEach(z => {
					if (z !== zone) z.classList.remove('battersea-quiz__match-zone--active');
				});
				return;
			}

			// Check if over the items column (return to source)
			const itemsCol = elBelow.closest('.battersea-quiz__match-items');
			if (itemsCol) {
				const targetItem = elBelow.closest('.battersea-quiz__drag-item');
				if (targetItem && targetItem !== state.item) {
					const rect = targetItem.getBoundingClientRect();
					const midY = rect.top + rect.height / 2;
					if (pos.y < midY) {
						itemsCol.insertBefore(state.placeholder, targetItem);
					} else {
						itemsCol.insertBefore(state.placeholder, targetItem.nextSibling);
					}
				} else if (!targetItem) {
					itemsCol.appendChild(state.placeholder);
				}

				// Remove active from all zones
				Utils.qsa('.battersea-quiz__match-zone', state.fieldset).forEach(z => {
					z.classList.remove('battersea-quiz__match-zone--active');
				});
			}
		}

		_handleGroupDragMove(elBelow, pos, state) {
			// Check if over a group zone
			const zone = elBelow.closest('.battersea-quiz__group-zone');
			if (zone && zone.closest('[data-question-id="' + state.question.id + '"]')) {
				const targetItem = elBelow.closest('.battersea-quiz__drag-item');
				if (targetItem && targetItem !== state.item) {
					const rect = targetItem.getBoundingClientRect();
					const midY = rect.top + rect.height / 2;
					if (pos.y < midY) {
						zone.insertBefore(state.placeholder, targetItem);
					} else {
						zone.insertBefore(state.placeholder, targetItem.nextSibling);
					}
				} else {
					zone.appendChild(state.placeholder);
				}
				zone.classList.add('battersea-quiz__group-zone--active');

				// Remove active from other zones and pool
				Utils.qsa('.battersea-quiz__group-zone', state.fieldset).forEach(z => {
					if (z !== zone) z.classList.remove('battersea-quiz__group-zone--active');
				});
				const pool = Utils.qs('.battersea-quiz__group-pool', state.fieldset);
				if (pool) pool.classList.remove('battersea-quiz__group-pool--active');
				return;
			}

			// Check if over the pool
			const pool = elBelow.closest('.battersea-quiz__group-pool');
			if (pool && pool.closest('[data-question-id="' + state.question.id + '"]')) {
				const targetItem = elBelow.closest('.battersea-quiz__drag-item');
				if (targetItem && targetItem !== state.item) {
					const rect = targetItem.getBoundingClientRect();
					const midY = rect.top + rect.height / 2;
					if (pos.y < midY) {
						pool.insertBefore(state.placeholder, targetItem);
					} else {
						pool.insertBefore(state.placeholder, targetItem.nextSibling);
					}
				} else {
					pool.appendChild(state.placeholder);
				}
				pool.classList.add('battersea-quiz__group-pool--active');

				Utils.qsa('.battersea-quiz__group-zone', state.fieldset).forEach(z => {
					z.classList.remove('battersea-quiz__group-zone--active');
				});
			}
		}

		_handleDragEnd(e) {
			if (!this.dragState) return;

			const state = this.dragState;
			const question = state.question;
			const item = state.item;
			const placeholder = state.placeholder;

			// Remove document event listeners
			document.removeEventListener('mousemove', this._onDragMove);
			document.removeEventListener('mouseup', this._onDragEnd);
			document.removeEventListener('touchmove', this._onDragMove);
			document.removeEventListener('touchend', this._onDragEnd);

			// For match: displace existing item from target zone
			if (question.type === 'match') {
				const targetZone = placeholder.closest('.battersea-quiz__match-zone-slot');
				if (targetZone) {
					const existingItem = Utils.qs('.battersea-quiz__drag-item:not(.battersea-quiz__drag-item--dragging)', targetZone);
					if (existingItem) {
						// Move existing item back to source pool
						const sourcePool = Utils.qs('.battersea-quiz__match-items', state.fieldset);
						if (sourcePool) sourcePool.appendChild(existingItem);
					}
				}
			}

			// Move item to placeholder position
			placeholder.parentElement.insertBefore(item, placeholder);

			// Cleanup
			item.classList.remove('battersea-quiz__drag-item--dragging');
			if (state.ghost.parentNode) state.ghost.remove();
			if (placeholder.parentNode) placeholder.remove();

			// Remove active states
			Utils.qsa('.battersea-quiz__match-zone--active', state.fieldset).forEach(z => {
				z.classList.remove('battersea-quiz__match-zone--active');
			});
			Utils.qsa('.battersea-quiz__group-zone--active', state.fieldset).forEach(z => {
				z.classList.remove('battersea-quiz__group-zone--active');
			});
			const pool = Utils.qs('.battersea-quiz__group-pool--active', state.fieldset);
			if (pool) pool.classList.remove('battersea-quiz__group-pool--active');

			this.dragState = null;

			// Update answer
			this._updateDragAnswer(question, state.fieldset);

			// Announce
			const itemText = Utils.qs('.battersea-quiz__drag-text', item);
			if (itemText) {
				this.announce(itemText.textContent + ' moved');
			}
		}

		_updateDragAnswer(question, fieldset) {
			if (question.type === 'order') {
				const items = Utils.qsa('.battersea-quiz__drag-item', Utils.qs('.battersea-quiz__order-list', fieldset));
				this.userAnswers[question.id] = items.map(el =>
					parseInt(el.getAttribute('data-quiz-drag-index'), 10)
				);
			} else if (question.type === 'match') {
				const answer = new Array(question.items.length).fill(-1);
				const zones = Utils.qsa('.battersea-quiz__match-zone', fieldset);
				zones.forEach(zone => {
					const pairIdx = parseInt(zone.getAttribute('data-quiz-pair-index'), 10);
					const item = Utils.qs('.battersea-quiz__drag-item', zone);
					if (item) {
						const itemIdx = parseInt(item.getAttribute('data-quiz-drag-index'), 10);
						answer[itemIdx] = pairIdx;
					}
				});
				this.userAnswers[question.id] = answer;
			} else if (question.type === 'group') {
				const answer = new Array(question.items.length).fill(-1);
				const zones = Utils.qsa('.battersea-quiz__group-zone', fieldset);
				zones.forEach(zone => {
					const catIdx = parseInt(zone.getAttribute('data-quiz-category-index'), 10);
					const items = Utils.qsa('.battersea-quiz__drag-item', zone);
					items.forEach(item => {
						const itemIdx = parseInt(item.getAttribute('data-quiz-drag-index'), 10);
						answer[itemIdx] = catIdx;
					});
				});
				this.userAnswers[question.id] = answer;
			}

			fieldset.classList.remove('battersea-quiz__question--unanswered');

			this.el.dispatchEvent(new CustomEvent('battersea:quizAnswer', {
				bubbles: true,
				detail: { questionId: question.id, value: this.userAnswers[question.id], type: question.type }
			}));
		}

		// ============================================================
		// Keyboard Drag Accessibility
		// ============================================================

		_initKeyboardDrag(fieldset, question) {
			const items = Utils.qsa('.battersea-quiz__drag-item', fieldset);
			items.forEach(item => {
				this.events.push(
					Utils.addEvent(item, 'keydown', (e) => {
						this._handleDragKeydown(e, item, question, fieldset);
					})
				);
			});
		}

		_handleDragKeydown(e, item, question, fieldset) {
			if (this.submitted) return;

			const key = e.key;

			// Toggle grab with Space or Enter
			if (key === ' ' || key === 'Enter') {
				e.preventDefault();
				if (this._keyboardGrabbed && this._keyboardGrabbed.item === item) {
					// Drop
					item.classList.remove('battersea-quiz__drag-item--grabbed');
					item.setAttribute('aria-grabbed', 'false');
					const text = Utils.qs('.battersea-quiz__drag-text', item);
					this.announce((text ? text.textContent : 'Item') + ' dropped');
					this._keyboardGrabbed = null;
					this._updateDragAnswer(question, fieldset);
				} else {
					// Grab
					if (this._keyboardGrabbed) {
						this._keyboardGrabbed.item.classList.remove('battersea-quiz__drag-item--grabbed');
						this._keyboardGrabbed.item.setAttribute('aria-grabbed', 'false');
					}
					item.classList.add('battersea-quiz__drag-item--grabbed');
					item.setAttribute('aria-grabbed', 'true');
					const text = Utils.qs('.battersea-quiz__drag-text', item);
					this.announce((text ? text.textContent : 'Item') + ' grabbed. Use arrow keys to move, Enter to drop');
					this._keyboardGrabbed = { item: item, question: question, fieldset: fieldset };
				}
				return;
			}

			// Cancel with Escape
			if (key === 'Escape' && this._keyboardGrabbed) {
				e.preventDefault();
				this._keyboardGrabbed.item.classList.remove('battersea-quiz__drag-item--grabbed');
				this._keyboardGrabbed.item.setAttribute('aria-grabbed', 'false');
				this.announce('Cancelled');
				this._keyboardGrabbed = null;
				return;
			}

			// Move with arrow keys while grabbed
			if (!this._keyboardGrabbed || this._keyboardGrabbed.item !== item) return;

			if (question.type === 'order') {
				this._handleOrderKeyMove(e, item, fieldset);
			} else if (question.type === 'match') {
				this._handleMatchKeyMove(e, item, question, fieldset);
			} else if (question.type === 'group') {
				this._handleGroupKeyMove(e, item, question, fieldset);
			}
		}

		_handleOrderKeyMove(e, item, fieldset) {
			const list = Utils.qs('.battersea-quiz__order-list', fieldset);
			if (!list) return;

			if (e.key === 'ArrowUp') {
				e.preventDefault();
				const prev = item.previousElementSibling;
				if (prev && prev.classList.contains('battersea-quiz__drag-item')) {
					list.insertBefore(item, prev);
					item.focus();
					const items = Utils.qsa('.battersea-quiz__drag-item', list);
					const pos = Array.from(items).indexOf(item) + 1;
					this.announce('Moved to position ' + pos);
				}
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				const next = item.nextElementSibling;
				if (next && next.classList.contains('battersea-quiz__drag-item')) {
					list.insertBefore(item, next.nextSibling);
					item.focus();
					const items = Utils.qsa('.battersea-quiz__drag-item', list);
					const pos = Array.from(items).indexOf(item) + 1;
					this.announce('Moved to position ' + pos);
				}
			}
		}

		_handleMatchKeyMove(e, item, question, fieldset) {
			if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
			e.preventDefault();

			const zones = Utils.qsa('.battersea-quiz__match-zone', fieldset);
			const sourcePool = Utils.qs('.battersea-quiz__match-items', fieldset);
			const containers = [sourcePool].concat(Array.from(zones));

			// Find current container
			let currentIdx = containers.findIndex(c => c && c.contains(item));
			if (currentIdx === -1) currentIdx = 0;

			// Move to next/prev container
			if (e.key === 'ArrowDown') {
				currentIdx = Math.min(currentIdx + 1, containers.length - 1);
			} else {
				currentIdx = Math.max(currentIdx - 1, 0);
			}

			const target = containers[currentIdx];
			if (!target) return;

			// For zones, handle displacement
			if (target.classList.contains('battersea-quiz__match-zone')) {
				const slot = Utils.qs('.battersea-quiz__match-zone-slot', target);
				const existing = slot ? Utils.qs('.battersea-quiz__drag-item', slot) : null;
				if (existing && existing !== item && sourcePool) {
					sourcePool.appendChild(existing);
				}
				if (slot) slot.appendChild(item);
			} else {
				target.appendChild(item);
			}

			item.focus();
			const pairIdx = target.getAttribute('data-quiz-pair-index');
			if (pairIdx !== null) {
				this.announce('Placed in ' + question.pairs[parseInt(pairIdx, 10)]);
			} else {
				this.announce('Returned to items');
			}
		}

		_handleGroupKeyMove(e, item, question, fieldset) {
			if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
			e.preventDefault();

			const pool = Utils.qs('.battersea-quiz__group-pool', fieldset);
			const zones = Utils.qsa('.battersea-quiz__group-zone', fieldset);
			const containers = [pool].concat(Array.from(zones));

			let currentIdx = containers.findIndex(c => c && c.contains(item));
			if (currentIdx === -1) currentIdx = 0;

			if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
				currentIdx = Math.min(currentIdx + 1, containers.length - 1);
			} else {
				currentIdx = Math.max(currentIdx - 1, 0);
			}

			const target = containers[currentIdx];
			if (!target) return;

			target.appendChild(item);
			item.focus();

			const catIdx = target.getAttribute('data-quiz-category-index');
			if (catIdx !== null) {
				this.announce('Placed in ' + question.categories[parseInt(catIdx, 10)]);
			} else {
				this.announce('Returned to pool');
			}
		}

		// ============================================================
		// User Interaction
		// ============================================================

		handleOptionSelect(questionId, type, inputEl) {
			if (this.submitted) return;

			const fieldset = inputEl.closest('.battersea-quiz__question');

			if (type === 'multi') {
				// Build array of all checked values
				const checked = Utils.qsa('input:checked', fieldset);
				this.userAnswers[questionId] = checked.map(c => c.value);
			} else {
				this.userAnswers[questionId] = inputEl.value;
			}

			// Remove unanswered highlight if present
			fieldset.classList.remove('battersea-quiz__question--unanswered');

			// Update selected styling
			const labels = Utils.qsa('.battersea-quiz__option-label', fieldset);
			labels.forEach(label => {
				const inp = Utils.qs('input', label);
				if (inp && inp.checked) {
					label.classList.add('battersea-quiz__option-label--selected');
				} else {
					label.classList.remove('battersea-quiz__option-label--selected');
				}
			});

			this.el.dispatchEvent(new CustomEvent('battersea:quizAnswer', {
				bubbles: true,
				detail: { questionId: questionId, value: this.userAnswers[questionId], type: type }
			}));
		}

		handleSubmit() {
			if (this.submitted) return;

			// Check all questions answered (unless timer expired)
			const unanswered = [];
			this.questions.forEach(q => {
				// Order is always answered (items are always in some sequence)
				if (q.type === 'order') return;

				// Match and group: check all items placed
				if (q.type === 'match' || q.type === 'group') {
					const answer = this.userAnswers[q.id];
					if (!answer || !Array.isArray(answer) || answer.some(v => v === -1)) {
						unanswered.push(q.id);
					}
					return;
				}

				const answer = this.userAnswers[q.id];
				if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
					unanswered.push(q.id);
				}
			});

			// If manual submit (not timer), require all answered
			if (unanswered.length > 0 && this.timerValue > 0) {
				// Timer still running - validate
				this.highlightUnanswered(unanswered);
				this.announce('Please answer all questions before submitting. ' + unanswered.length + ' unanswered.');
				return;
			} else if (unanswered.length > 0 && this.timerInterval === null && this.config.timer > 0) {
				// Timer expired - allow submit with unanswered
			} else if (unanswered.length > 0 && this.config.timer === 0) {
				// No timer - validate
				this.highlightUnanswered(unanswered);
				this.announce('Please answer all questions before submitting. ' + unanswered.length + ' unanswered.');
				return;
			}

			this.submitted = true;
			this.stopTimer();

			// Calculate time taken
			const timeTaken = this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0;

			// Disable all inputs and selects
			const inputs = Utils.qsa('input, select', this.quizEl);
			inputs.forEach(inp => { inp.disabled = true; });

			// Disable submit button
			this.submitBtn.disabled = true;
			this.submitBtn.textContent = 'Submitted';
			this.submitBtn.classList.add('battersea-quiz__submit-btn--disabled');

			// Add submitted class
			this.quizEl.classList.add('battersea-quiz--submitted');

			// Remove navigation prevention
			if (this.config.requireAttempt) {
				this._removeNavPrevention();
			}

			// Score
			const results = this.calculateResults();

			// Display results
			this.showResults(results);

			// Announce
			this.announce('Quiz complete. You scored ' + results.score + ' out of ' + results.total + '.');

			// Dispatch events
			this.el.dispatchEvent(new CustomEvent('battersea:quizSubmit', {
				bubbles: true,
				detail: { score: results.score, total: results.total, percentage: results.percentage, results: results.perQuestion }
			}));
		}

		highlightUnanswered(questionIds) {
			questionIds.forEach(id => {
				const fieldset = Utils.qs('[data-question-id="' + id + '"]', this.quizEl);
				if (fieldset) {
					fieldset.classList.add('battersea-quiz__question--unanswered');
				}
			});

			// Scroll to first unanswered
			const first = Utils.qs('.battersea-quiz__question--unanswered', this.quizEl);
			if (first) {
				first.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}

		// ============================================================
		// Scoring
		// ============================================================

		calculateResults() {
			let score = 0;
			const perQuestion = [];

			this.questions.forEach(q => {
				const userAnswer = this.userAnswers[q.id];
				const result = this.checkAnswer(q, userAnswer);
				if (result.correct) score++;
				perQuestion.push(result);
			});

			return {
				score: score,
				total: this.questions.length,
				percentage: Math.round((score / this.questions.length) * 100),
				perQuestion: perQuestion
			};
		}

		checkAnswer(question, userAnswer) {
			const result = {
				questionId: question.id,
				correct: false,
				expected: question.answer,
				given: userAnswer || null
			};

			if (!userAnswer) return result;

			// Drag types: compare integer arrays
			if (question.type === 'order' || question.type === 'match' || question.type === 'group') {
				if (!Array.isArray(userAnswer)) return result;
				const expected = question.answer;
				result.correct = expected.length === userAnswer.length &&
					expected.every((val, idx) => val === userAnswer[idx]);
				return result;
			}

			if (question.type === 'multi') {
				// Compare sorted arrays (case-insensitive)
				const expected = (Array.isArray(question.answer) ? question.answer : [question.answer])
					.map(a => a.toLowerCase().trim()).sort();
				const given = (Array.isArray(userAnswer) ? userAnswer : [userAnswer])
					.map(a => a.toLowerCase().trim()).sort();
				result.correct = expected.length === given.length &&
					expected.every((val, idx) => val === given[idx]);
			} else {
				result.correct = String(userAnswer).toLowerCase().trim() ===
					String(question.answer).toLowerCase().trim();
			}

			return result;
		}

		// ============================================================
		// Results Display
		// ============================================================

		showResults(results) {
			const mode = this.config.results;

			if (mode === 'inline' || mode === 'both') {
				this.showInlineResults(results);
			}

			if (mode === 'summary' || mode === 'both') {
				this.showSummaryPanel(results);
			}
		}

		showInlineResults(results) {
			results.perQuestion.forEach((result, i) => {
				const question = this.questions[i];
				const fieldset = Utils.qs('[data-question-id="' + question.id + '"]', this.quizEl);
				if (!fieldset) return;

				// Add correct/incorrect/unanswered class to fieldset
				if (result.correct) {
					fieldset.classList.add('battersea-quiz__question--correct');
				} else if (result.given === null) {
					fieldset.classList.add('battersea-quiz__question--unanswered');
				} else {
					fieldset.classList.add('battersea-quiz__question--incorrect');
				}

				// Drag types: mark individual items
				if (question.type === 'order') {
					this._showOrderResults(question, result, fieldset);
				} else if (question.type === 'match') {
					this._showMatchResults(question, result, fieldset);
				} else if (question.type === 'group') {
					this._showGroupResults(question, result, fieldset);
				} else {
					// Standard types: mark individual options
					const labels = Utils.qsa('.battersea-quiz__option-label', fieldset);
					labels.forEach(label => {
						const input = Utils.qs('input', label);
						if (!input) return;
						const value = input.value;

						// Is this the correct answer?
						let isCorrect = false;
						if (question.type === 'multi') {
							isCorrect = question.answer.some(a =>
								a.toLowerCase().trim() === value.toLowerCase().trim()
							);
						} else {
							isCorrect = String(question.answer).toLowerCase().trim() ===
								value.toLowerCase().trim();
						}

						if (isCorrect) {
							label.classList.add('battersea-quiz__option-label--correct');
						} else if (input.checked) {
							label.classList.add('battersea-quiz__option-label--incorrect');
						}
					});
				}

				// Show explanation if available
				if (question.explanation) {
					const explEl = document.createElement('div');
					explEl.className = 'battersea-quiz__explanation';
					explEl.textContent = question.explanation;
					fieldset.appendChild(explEl);
				}
			});
		}

		_showOrderResults(question, result, fieldset) {
			const items = Utils.qsa('.battersea-quiz__drag-item', fieldset);
			items.forEach((item, domIdx) => {
				const origIdx = parseInt(item.getAttribute('data-quiz-drag-index'), 10);
				// Correct position = the item's original index should equal its DOM position
				if (origIdx === domIdx) {
					item.classList.add('battersea-quiz__drag-item--correct');
				} else {
					item.classList.add('battersea-quiz__drag-item--incorrect');
				}
			});
		}

		_showMatchResults(question, result, fieldset) {
			// Mobile select fallback
			if (this._isMobile) {
				const selects = Utils.qsa('.battersea-quiz__match-select', fieldset);
				selects.forEach(sel => {
					const pairIdx = parseInt(sel.getAttribute('data-quiz-pair-index'), 10);
					// Find the item that should be in this pair
					const correctItemIdx = question.answer.indexOf(pairIdx);
					if (sel.value !== '' && parseInt(sel.value, 10) === correctItemIdx) {
						sel.classList.add('battersea-quiz__match-select--correct');
					} else {
						sel.classList.add('battersea-quiz__match-select--incorrect');
					}
				});
				return;
			}

			// Desktop drag
			const zones = Utils.qsa('.battersea-quiz__match-zone', fieldset);
			zones.forEach(zone => {
				const pairIdx = parseInt(zone.getAttribute('data-quiz-pair-index'), 10);
				const item = Utils.qs('.battersea-quiz__drag-item', zone);
				if (item) {
					const itemIdx = parseInt(item.getAttribute('data-quiz-drag-index'), 10);
					if (question.answer[itemIdx] === pairIdx) {
						item.classList.add('battersea-quiz__drag-item--correct');
					} else {
						item.classList.add('battersea-quiz__drag-item--incorrect');
					}
				}
			});

			// Items still in source are incorrect
			const sourceItems = Utils.qsa('.battersea-quiz__match-items .battersea-quiz__drag-item', fieldset);
			sourceItems.forEach(item => {
				item.classList.add('battersea-quiz__drag-item--incorrect');
			});
		}

		_showGroupResults(question, result, fieldset) {
			const zones = Utils.qsa('.battersea-quiz__group-zone', fieldset);
			zones.forEach(zone => {
				const catIdx = parseInt(zone.getAttribute('data-quiz-category-index'), 10);
				const items = Utils.qsa('.battersea-quiz__drag-item', zone);
				items.forEach(item => {
					const itemIdx = parseInt(item.getAttribute('data-quiz-drag-index'), 10);
					if (question.answer[itemIdx] === catIdx) {
						item.classList.add('battersea-quiz__drag-item--correct');
					} else {
						item.classList.add('battersea-quiz__drag-item--incorrect');
					}
				});
			});

			// Items still in pool are incorrect
			const poolItems = Utils.qsa('.battersea-quiz__group-pool .battersea-quiz__drag-item', fieldset);
			poolItems.forEach(item => {
				item.classList.add('battersea-quiz__drag-item--incorrect');
			});
		}

		showSummaryPanel(results) {
			const summary = document.createElement('div');
			summary.className = 'battersea-quiz__summary';

			// Score text
			const scoreText = document.createElement('div');
			scoreText.className = 'battersea-quiz__summary-score';
			scoreText.textContent = 'You scored ' + results.score + ' out of ' + results.total +
				' (' + results.percentage + '%)';
			summary.appendChild(scoreText);

			// Score bar
			const bar = document.createElement('div');
			bar.className = 'battersea-quiz__summary-bar';
			const fill = document.createElement('div');
			fill.className = 'battersea-quiz__summary-fill';

			// Colour based on score
			if (results.percentage >= 80) {
				fill.classList.add('battersea-quiz__summary-fill--high');
			} else if (results.percentage >= 50) {
				fill.classList.add('battersea-quiz__summary-fill--mid');
			} else {
				fill.classList.add('battersea-quiz__summary-fill--low');
			}

			bar.appendChild(fill);
			summary.appendChild(bar);

			// Animate fill after insertion
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					fill.style.width = results.percentage + '%';
				});
			});

			// Message
			const message = document.createElement('div');
			message.className = 'battersea-quiz__summary-message';
			if (results.percentage === 100) {
				message.textContent = 'Full marks. Well done.';
			} else if (results.percentage >= 80) {
				message.textContent = 'Great work.';
			} else if (results.percentage >= 50) {
				message.textContent = 'Not bad. Room for improvement.';
			} else {
				message.textContent = 'Keep practising.';
			}
			summary.appendChild(message);

			// Insert at the bottom of the quiz (after submit button)
			this.quizEl.appendChild(summary);

			// Scroll summary into view
			summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}

		// ============================================================
		// Timer
		// ============================================================

		startTimer() {
			if (this.config.timer <= 0) return;

			this.timerValue = this.config.timer;
			this.startTime = Date.now();
			this.updateTimerDisplay();

			this.timerInterval = setInterval(() => this.tick(), 1000);
		}

		tick() {
			this.timerValue--;
			this.updateTimerDisplay();

			// Warning at 10 seconds
			if (this.timerValue === 10) {
				if (this.timerEl) this.timerEl.classList.add('battersea-quiz__timer--warning');
				this.announce('10 seconds remaining.');
				this.el.dispatchEvent(new CustomEvent('battersea:quizTimerWarning', {
					bubbles: true, detail: { remaining: this.timerValue }
				}));
			}

			// Announce at 30 seconds
			if (this.timerValue === 30) {
				this.announce('30 seconds remaining.');
			}

			// Announce at 5 seconds
			if (this.timerValue === 5) {
				this.announce('5 seconds remaining.');
			}

			// Time up
			if (this.timerValue <= 0) {
				this.stopTimer();
				this.announce('Time is up. Submitting your answers.');
				this.el.dispatchEvent(new CustomEvent('battersea:quizTimerExpired', {
					bubbles: true
				}));
				this.handleSubmit();
			}
		}

		stopTimer() {
			if (this.timerInterval) {
				clearInterval(this.timerInterval);
				this.timerInterval = null;
			}
		}

		updateTimerDisplay() {
			if (!this.timerEl) return;
			const valueEl = Utils.qs('.battersea-quiz__timer-value', this.timerEl);
			if (valueEl) {
				valueEl.textContent = this.formatTime(this.timerValue);
			}
		}

		formatTime(seconds) {
			const mins = Math.floor(seconds / 60);
			const secs = seconds % 60;
			return mins + ':' + (secs < 10 ? '0' : '') + secs;
		}

		// ============================================================
		// Hide-Until-Click
		// ============================================================

		revealQuiz(revealBtn) {
			// Fade out and remove reveal button
			revealBtn.classList.add('battersea-quiz__reveal-btn--hiding');
			const onTransitionEnd = () => {
				revealBtn.removeEventListener('transitionend', onTransitionEnd);
				revealBtn.remove();
			};
			revealBtn.addEventListener('transitionend', onTransitionEnd);

			// Fallback in case transition doesn't fire
			setTimeout(() => { if (revealBtn.parentNode) revealBtn.remove(); }, 500);

			// Reveal quiz
			this.quizEl.classList.remove('battersea-quiz--hidden');
			this.quizEl.classList.add('battersea-quiz--revealing');

			const onRevealEnd = () => {
				this.quizEl.removeEventListener('transitionend', onRevealEnd);
				this.quizEl.classList.remove('battersea-quiz--revealing');
				this.quizEl.classList.add('battersea-quiz--revealed');
			};
			this.quizEl.addEventListener('transitionend', onRevealEnd);

			// Start timer
			if (this.config.timer > 0) {
				this.startTimer();
			} else {
				this.startTime = Date.now();
			}

			this.el.dispatchEvent(new CustomEvent('battersea:quizReveal', {
				bubbles: true,
				detail: { timestamp: Date.now() }
			}));
		}

		// ============================================================
		// Navigation Prevention
		// ============================================================

		_setupNavPrevention() {
			// beforeunload handler
			this._beforeUnloadHandler = (e) => {
				if (!this.submitted) {
					e.preventDefault();
					e.returnValue = '';
				}
			};
			window.addEventListener('beforeunload', this._beforeUnloadHandler);

			// Link click interception (capture phase)
			this._linkClickHandler = (e) => {
				if (this.submitted) return;
				const link = e.target.closest('a[href]');
				if (!link) return;
				const href = link.getAttribute('href');
				// Skip hash-only links
				if (href.startsWith('#')) return;
				e.preventDefault();
				e.stopPropagation();
				this._showLeaveWarning(link.href);
			};
			document.addEventListener('click', this._linkClickHandler, true);
		}

		_removeNavPrevention() {
			if (this._beforeUnloadHandler) {
				window.removeEventListener('beforeunload', this._beforeUnloadHandler);
				this._beforeUnloadHandler = null;
			}
			if (this._linkClickHandler) {
				document.removeEventListener('click', this._linkClickHandler, true);
				this._linkClickHandler = null;
			}
			this._hideLeaveWarning();
		}

		_showLeaveWarning(targetUrl) {
			if (this._leaveWarningEl) return;

			const overlay = document.createElement('div');
			overlay.className = 'battersea-quiz__leave-warning';

			const panel = document.createElement('div');
			panel.className = 'battersea-quiz__leave-warning-panel';

			const title = document.createElement('div');
			title.className = 'battersea-quiz__leave-warning-title';
			title.textContent = 'Leave this page?';
			panel.appendChild(title);

			const text = document.createElement('div');
			text.className = 'battersea-quiz__leave-warning-text';
			text.textContent = "You haven't submitted your quiz yet. Your answers will be lost if you leave.";
			panel.appendChild(text);

			const actions = document.createElement('div');
			actions.className = 'battersea-quiz__leave-warning-actions';

			const stayBtn = document.createElement('button');
			stayBtn.className = 'battersea-quiz__leave-warning-stay';
			stayBtn.type = 'button';
			stayBtn.textContent = 'Stay on Page';
			stayBtn.addEventListener('click', () => this._hideLeaveWarning());

			const leaveBtn = document.createElement('button');
			leaveBtn.className = 'battersea-quiz__leave-warning-leave';
			leaveBtn.type = 'button';
			leaveBtn.textContent = 'Leave Page';
			leaveBtn.addEventListener('click', () => {
				this._removeNavPrevention();
				window.location.href = targetUrl;
			});

			actions.appendChild(stayBtn);
			actions.appendChild(leaveBtn);
			panel.appendChild(actions);
			overlay.appendChild(panel);

			document.body.appendChild(overlay);
			this._leaveWarningEl = overlay;

			// Focus stay button
			stayBtn.focus();
		}

		_hideLeaveWarning() {
			if (this._leaveWarningEl) {
				this._leaveWarningEl.remove();
				this._leaveWarningEl = null;
			}
		}

		// ============================================================
		// Utilities
		// ============================================================

		shuffleArray(array) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				const temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			return array;
		}

		announce(message) {
			if (!this.liveRegion) return;
			// Double RAF pattern for screen reader detection
			this.liveRegion.textContent = '';
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					this.liveRegion.textContent = message;
				});
			});
		}

		// ============================================================
		// Cleanup
		// ============================================================

		destroy() {
			this.events.forEach(event => event.remove());
			this.events = [];
			this.stopTimer();

			// Clean up drag state
			if (this.dragState) {
				if (this.dragState.ghost && this.dragState.ghost.parentNode) this.dragState.ghost.remove();
				if (this.dragState.placeholder && this.dragState.placeholder.parentNode) this.dragState.placeholder.remove();
				document.removeEventListener('mousemove', this._onDragMove);
				document.removeEventListener('mouseup', this._onDragEnd);
				document.removeEventListener('touchmove', this._onDragMove);
				document.removeEventListener('touchend', this._onDragEnd);
				this.dragState = null;
			}

			// Clean up navigation prevention
			this._removeNavPrevention();

			this.el.innerHTML = this.originalHTML || '';
			this.questions = [];
			this.userAnswers = {};
			this.submitted = false;
			this.quizEl = null;
			this.liveRegion = null;
			this.timerEl = null;
			this._keyboardGrabbed = null;
		}
	}

	window.Battersea.register('miniQuiz', MiniQuiz, '[data-quiz]');

})(window, document);
