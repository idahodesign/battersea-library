/**
 * Battersea Mini Quiz Component
 * Version: 2.18.0
 *
 * Interactive quiz element with multiple question types, data sources,
 * countdown timer, and configurable results display.
 *
 * Question types: boolean (two-choice), choice (single), multi (multiple)
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

			// Read config
			this.config = {
				title: Utils.getData(el, 'quiz-title') || '',
				description: Utils.getData(el, 'quiz-description') || '',
				timer: Utils.parseInt(Utils.getData(el, 'quiz-timer'), 0),
				hidden: Utils.parseBoolean(Utils.getData(el, 'quiz-hidden') || 'false'),
				results: Utils.getData(el, 'quiz-results') || 'both',
				shuffle: Utils.parseBoolean(Utils.getData(el, 'quiz-shuffle') || 'false'),
				shuffleOptions: Utils.parseBoolean(Utils.getData(el, 'quiz-shuffle-options') || 'false')
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
				this.questions.forEach(q => this.shuffleArray(q.options));
			}

			// Clear container and build quiz
			this.el.innerHTML = '';
			this.buildQuiz();

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
				const q = {
					id: obj.id || '',
					type: obj.type || 'choice',
					question: obj.question || '',
					options: (obj.options || '').split('|').map(o => o.trim()).filter(Boolean),
					answer: obj.type === 'multi'
						? (obj.answer || '').split('|').map(a => a.trim()).filter(Boolean)
						: (obj.answer || '').trim(),
					explanation: obj.explanation || ''
				};
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

				// Get options
				const optionEls = Utils.qsa('[data-quiz-option]', el);
				const options = optionEls.map(o => o.textContent.trim());

				const answer = type === 'multi'
					? answerRaw.split('|').map(a => a.trim()).filter(Boolean)
					: answerRaw.trim();

				return this.normaliseQuestion({
					type: type,
					question: questionText,
					options: options,
					answer: answer,
					explanation: explanation
				}, i);
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
			if (['boolean', 'choice', 'multi'].indexOf(q.type) === -1) {
				console.warn('MiniQuiz: Unknown question type "' + q.type + '", defaulting to "choice"');
				q.type = 'choice';
			}

			// Ensure multi answers are arrays
			if (q.type === 'multi' && !Array.isArray(q.answer)) {
				q.answer = q.answer.split('|').map(a => a.trim()).filter(Boolean);
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

			const legend = document.createElement('legend');
			legend.className = 'battersea-quiz__question-text';
			let legendText = question.question;
			if (question.type === 'multi') {
				legendText += ' (select all that apply)';
			}
			legend.textContent = legendText;
			fieldset.appendChild(legend);

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

			// Disable all inputs
			const inputs = Utils.qsa('input', this.quizEl);
			inputs.forEach(inp => { inp.disabled = true; });

			// Disable submit button
			this.submitBtn.disabled = true;
			this.submitBtn.textContent = 'Submitted';
			this.submitBtn.classList.add('battersea-quiz__submit-btn--disabled');

			// Add submitted class
			this.quizEl.classList.add('battersea-quiz--submitted');

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

				// Mark individual options
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

				// Show explanation if available
				if (question.explanation) {
					const explEl = document.createElement('div');
					explEl.className = 'battersea-quiz__explanation';
					explEl.textContent = question.explanation;
					fieldset.appendChild(explEl);
				}
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
			this.el.innerHTML = this.originalHTML || '';
			this.questions = [];
			this.userAnswers = {};
			this.submitted = false;
			this.quizEl = null;
			this.liveRegion = null;
			this.timerEl = null;
		}
	}

	window.Battersea.register('miniQuiz', MiniQuiz, '[data-quiz]');

})(window, document);
