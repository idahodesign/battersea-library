<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
	<meta charset="utf-8"/>
</head>
<body>

<h1 id="battersealibrary">Battersea Library</h1>

<p><strong>Version:</strong> 2.1.0<br />
<strong>License:</strong> MIT<br />
<strong>Author:</strong> Claude &amp; User</p>

<p>A lightweight, modular JavaScript component library with no dependencies. Built with vanilla JavaScript, CSS (LESS), and a focus on accessibility, performance, and ease of use.</p>

<hr />

<h2 id="ðŸ“¦whatsincluded">ðŸ“¦ What&#8217;s Included</h2>

<p>Battersea Library provides 13 fully-featured, production-ready components:</p>

<ol>
<li><strong>Tooltips</strong> - Hover/focus tooltips with 4 positions</li>
<li><strong>Slider</strong> - Image/content carousel with infinite loop</li>
<li><strong>Tabs</strong> - Tabbed content interface</li>
<li><strong>Accordion</strong> - Collapsible content sections</li>
<li><strong>Popup/Modal</strong> - Overlay dialogs</li>
<li><strong>Animation</strong> - Scroll-triggered animations with cascading children</li>
<li><strong>Counter</strong> - Animated number counting on scroll</li>
<li><strong>ProgressBar</strong> - Horizontal and circular progress indicators</li>
<li><strong>NestedProgress</strong> - Multi-layer circular progress visualization</li>
<li><strong>MultiSlider</strong> - Multi-item carousel with infinite loop</li>
<li><strong>Parallax</strong> - Parallax scrolling backgrounds</li>
<li><strong>Flipbox</strong> - 3D flip card animations</li>
<li><strong>SmoothScroll</strong> - Scroll-to-section navigation with dynamic header support ⭐ NEW</li>
</ol>

<hr />

<h2 id="ðŸš€quickstart">ðŸš€ Quick Start</h2>

<h3 id="installation">Installation</h3>

<p>Download the library files and include them in your HTML:</p>

<pre><code class="html">&lt;!-- CSS --&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;battersea-library.css&quot;&gt;

&lt;!-- JavaScript (in order) --&gt;
&lt;script src=&quot;battersea-utils.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;battersea-core.js&quot;&gt;&lt;/script&gt;

&lt;!-- Include only the components you need --&gt;
&lt;script src=&quot;battersea-slider.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;battersea-tooltip.js&quot;&gt;&lt;/script&gt;
&lt;!-- ... other components ... --&gt;
</code></pre>

<h3 id="basicusage">Basic Usage</h3>

<pre><code class="html">&lt;!-- Simple Slider --&gt;
&lt;div data-slider data-slider-autoplay=&quot;true&quot; data-slider-interval=&quot;3000&quot;&gt;
  &lt;div data-slider-track&gt;
    &lt;div data-slider-item&gt;Slide 1&lt;/div&gt;
    &lt;div data-slider-item&gt;Slide 2&lt;/div&gt;
    &lt;div data-slider-item&gt;Slide 3&lt;/div&gt;
  &lt;/div&gt;
  &lt;button data-slider-prev&gt;‹&lt;/button&gt;
  &lt;button data-slider-next&gt;›&lt;/button&gt;
  &lt;div data-slider-dots&gt;&lt;/div&gt;
&lt;/div&gt;

&lt;!-- Tooltip --&gt;
&lt;button data-tooltip=&quot;Hello World!&quot; data-tooltip-position=&quot;top&quot;&gt;
  Hover me
&lt;/button&gt;

&lt;!-- SmoothScroll --&gt;
&lt;div data-smoothscroll data-smoothscroll-header-selector=&quot;#header&quot;&gt;&lt;/div&gt;
&lt;section data-scroll-section data-scroll-title=&quot;Home&quot;&gt;Content&lt;/section&gt;
&lt;section data-scroll-section data-scroll-title=&quot;About&quot;&gt;Content&lt;/section&gt;

&lt;!-- Animation --&gt;
&lt;div data-animate=&quot;fade-up&quot; class=&quot;delay-3&quot;&gt;
  &lt;h2&gt;Animated Heading&lt;/h2&gt;
  &lt;p&gt;This will fade up with a delay&lt;/p&gt;
&lt;/div&gt;
</code></pre>

<p>The library auto-initializes on page load. No JavaScript code required!</p>

<hr />

<h2 id="ðŸ“šcomponentdocumentation">ðŸ“š Component Documentation</h2>

<h3 id="1.tooltips">1. Tooltips</h3>

<p>Accessible tooltips that appear on hover or focus.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;button data-tooltip=&quot;Tooltip text&quot; data-tooltip-position=&quot;top&quot;&gt;
  Hover me
&lt;/button&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-tooltip</code> - Tooltip text (required)</li>
<li><code>data-tooltip-position</code> - Position: <code>top</code>, <code>right</code>, <code>bottom</code>, <code>left</code> (default: <code>top</code>)</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>Keyboard accessible</li>
<li>ARIA labels</li>
<li>Smooth fade-in/out</li>
<li>Auto-positioning</li>
</ul>

<hr />

<h3 id="2.slider">2. Slider</h3>

<p>Full-featured image/content carousel with true infinite loop.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-slider 
     data-slider-autoplay=&quot;true&quot; 
     data-slider-interval=&quot;5000&quot;
     data-slider-transition=&quot;slide&quot;
     data-slider-dots=&quot;true&quot;
     data-slider-arrows=&quot;true&quot;
     tabindex=&quot;0&quot;&gt;
  &lt;div data-slider-track&gt;
    &lt;div data-slider-item&gt;Slide 1&lt;/div&gt;
    &lt;div data-slider-item&gt;Slide 2&lt;/div&gt;
    &lt;div data-slider-item&gt;Slide 3&lt;/div&gt;
  &lt;/div&gt;
  &lt;button data-slider-prev aria-label=&quot;Previous&quot;&gt;â€¹&lt;/button&gt;
  &lt;button data-slider-next aria-label=&quot;Next&quot;&gt;â€º&lt;/button&gt;
  &lt;div data-slider-dots&gt;&lt;/div&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-slider-autoplay</code> - Enable autoplay: <code>true</code>/<code>false</code> (default: <code>false</code>)</li>
<li><code>data-slider-interval</code> - Autoplay interval in ms (default: <code>5000</code>)</li>
<li><code>data-slider-transition</code> - Transition type: <code>slide</code>/<code>fade</code> (default: <code>slide</code>)</li>
<li><code>data-slider-dots</code> - Show navigation dots: <code>true</code>/<code>false</code> (default: <code>true</code>)</li>
<li><code>data-slider-arrows</code> - Show arrow buttons: <code>true</code>/<code>false</code> (default: <code>true</code>)</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>âœ¨ <strong>True infinite loop</strong> (slide transition only)</li>
<li>Clone-based seamless sliding</li>
<li>Keyboard navigation (â† â†’)</li>
<li>Touch/swipe support</li>
<li>Autoplay with pause on hover</li>
<li>Responsive</li>
<li>Accessible (ARIA labels, keyboard control)</li>
</ul>

<p><strong>Events:</strong></p>

<pre><code class="javascript">slider.addEventListener('battersea:slideChange', (e) =&gt; {
  console.log('Current slide:', e.detail.index);
});
</code></pre>

<hr />

<h3 id="3.tabs">3. Tabs</h3>

<p>Tabbed content interface with smooth transitions.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-tabs&gt;
  &lt;div data-tabs-nav&gt;
    &lt;button data-tab-trigger=&quot;tab1&quot; class=&quot;active&quot;&gt;Tab 1&lt;/button&gt;
    &lt;button data-tab-trigger=&quot;tab2&quot;&gt;Tab 2&lt;/button&gt;
    &lt;button data-tab-trigger=&quot;tab3&quot;&gt;Tab 3&lt;/button&gt;
  &lt;/div&gt;
  
  &lt;div data-tab-content=&quot;tab1&quot; class=&quot;active&quot;&gt;
    Content for Tab 1
  &lt;/div&gt;
  &lt;div data-tab-content=&quot;tab2&quot;&gt;
    Content for Tab 2
  &lt;/div&gt;
  &lt;div data-tab-content=&quot;tab3&quot;&gt;
    Content for Tab 3
  &lt;/div&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Features:</strong></p>

<ul>
<li>Smooth content switching</li>
<li>Active state management</li>
<li>Keyboard accessible</li>
<li>Simple markup</li>
</ul>

<hr />

<h3 id="4.accordion">4. Accordion</h3>

<p>Collapsible content sections with smooth animations.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-accordion data-accordion-multiple=&quot;false&quot;&gt;
  &lt;div data-accordion-item class=&quot;active&quot;&gt;
    &lt;div data-accordion-header&gt;Section 1&lt;/div&gt;
    &lt;div data-accordion-content&gt;
      &lt;div&gt;Content for section 1&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
  
  &lt;div data-accordion-item&gt;
    &lt;div data-accordion-header&gt;Section 2&lt;/div&gt;
    &lt;div data-accordion-content&gt;
      &lt;div&gt;Content for section 2&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-accordion-multiple</code> - Allow multiple sections open: <code>true</code>/<code>false</code> (default: <code>false</code>)</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>Smooth max-height transitions</li>
<li>No snapping or jerky animations</li>
<li>Multiple or single-open modes</li>
<li>Works with dynamic content</li>
</ul>

<p><strong>Events:</strong></p>

<pre><code class="javascript">accordion.addEventListener('battersea:accordionToggle', (e) =&gt; {
  console.log('Section toggled:', e.detail.isOpen);
});
</code></pre>

<hr />

<h3 id="5.popupmodal">5. Popup/Modal</h3>

<p>Overlay dialogs with backdrop and ESC/click-outside to close.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;button data-popup-trigger=&quot;myPopup&quot;&gt;Open Popup&lt;/button&gt;

&lt;div data-popup=&quot;myPopup&quot;&gt;
  &lt;div data-popup-content&gt;
    &lt;button data-popup-close&gt;&amp;times;&lt;/button&gt;
    &lt;h2&gt;Popup Title&lt;/h2&gt;
    &lt;p&gt;Popup content goes here&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Features:</strong></p>

<ul>
<li>Click outside to close</li>
<li>ESC key to close</li>
<li>Backdrop overlay</li>
<li>Focus trap</li>
<li>Smooth fade-in/out</li>
</ul>

<p><strong>Events:</strong></p>

<pre><code class="javascript">popup.addEventListener('battersea:popupOpen', () =&gt; {
  console.log('Popup opened');
});

popup.addEventListener('battersea:popupClose', () =&gt; {
  console.log('Popup closed');
});
</code></pre>

<hr />

<h3 id="6.animation">6. Animation</h3>

<p>Scroll-triggered animations with parent-child cascading.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;!-- Basic animation --&gt;
&lt;div data-animate=&quot;fade-up&quot;&gt;
  Content fades up when scrolled into view
&lt;/div&gt;

&lt;!-- With custom delay --&gt;
&lt;div data-animate=&quot;fade-in&quot; class=&quot;delay-5&quot;&gt;
  Fades in with 1.0s total delay (0.5s base + 0.5s custom)
&lt;/div&gt;

&lt;!-- Parent with children --&gt;
&lt;div data-animate=&quot;fade-up&quot;&gt;
  &lt;h2&gt;Parent animates first&lt;/h2&gt;
  &lt;p&gt;Child 1 - waits 0.3s after parent&lt;/p&gt;
  &lt;p&gt;Child 2 - appears 0.1s after child 1&lt;/p&gt;
  &lt;p&gt;Child 3 - appears 0.1s after child 2&lt;/p&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Available Animations:</strong></p>

<ul>
<li><code>fade-in</code> - Fade in</li>
<li><code>fade-up</code> - Slide up + fade</li>
<li><code>fade-down</code> - Slide down + fade</li>
<li><code>fade-left</code> - Slide from right + fade</li>
<li><code>fade-right</code> - Slide from left + fade</li>
</ul>

<p><strong>Delay Classes:</strong></p>

<ul>
<li><code>delay-1</code> through <code>delay-10</code></li>
<li>Each unit = 100ms (e.g., <code>delay-5</code> = 500ms additional delay)</li>
</ul>

<p><strong>Animation Timing:</strong></p>

<ol>
<li>Element enters viewport</li>
<li>Wait 0.5s (base delay)</li>
<li>Element animates</li>
<li>Children wait 0.3s after parent completes</li>
<li>Each child staggers by 0.1s</li>
</ol>

<p><strong>Features:</strong></p>

<ul>
<li>IntersectionObserver for performance</li>
<li>One-time animation (doesn&#8217;t re-trigger)</li>
<li>Supports grandchildren</li>
<li>Custom delay classes</li>
<li>No double-animation or flicker</li>
</ul>

<hr />

<h3 id="7.counter">7. Counter</h3>

<p>Animated number counting when scrolled into view.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-counter 
     data-counter-start=&quot;0&quot; 
     data-counter-end=&quot;1000&quot; 
     data-counter-duration=&quot;2000&quot;
     data-counter-suffix=&quot; users&quot;&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-counter-start</code> - Starting number (default: <code>0</code>)</li>
<li><code>data-counter-end</code> - Ending number (required)</li>
<li><code>data-counter-duration</code> - Animation duration in ms (default: <code>2000</code>)</li>
<li><code>data-counter-prefix</code> - Text before number (e.g., <code>$</code>)</li>
<li><code>data-counter-suffix</code> - Text after number (e.g., <code>users</code>)</li>
<li><code>data-counter-decimals</code> - Decimal places (default: <code>0</code>)</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>Smooth easing animation</li>
<li>Decimal support</li>
<li>Prefix/suffix support</li>
<li>Triggers on scroll into view</li>
</ul>

<hr />

<h3 id="8.progressbar">8. ProgressBar</h3>

<p>Horizontal and circular progress indicators.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;!-- Horizontal --&gt;
&lt;div data-progress 
     data-progress-value=&quot;75&quot; 
     data-progress-type=&quot;horizontal&quot;
     data-progress-label=&quot;Loading...&quot;&gt;
&lt;/div&gt;

&lt;!-- Circular --&gt;
&lt;div data-progress 
     data-progress-value=&quot;60&quot; 
     data-progress-type=&quot;circular&quot;
     data-progress-size=&quot;150&quot;&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-progress-value</code> - Progress value 0&#8211;100 (required)</li>
<li><code>data-progress-type</code> - Type: <code>horizontal</code>/<code>circular</code> (default: <code>horizontal</code>)</li>
<li><code>data-progress-size</code> - Size in pixels for circular (default: <code>120</code>)</li>
<li><code>data-progress-label</code> - Optional label text</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>Responsive circular progress</li>
<li>Smooth animations</li>
<li>Customizable colors via CSS variables</li>
<li>Auto-sizing to parent container</li>
</ul>

<hr />

<h3 id="9.nestedprogress">9. NestedProgress</h3>

<p>Multi-layer circular progress visualization.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-progress-nested
     data-progress-title=&quot;Skills&quot;
     data-progress-legend=&quot;true&quot;
     data-progress-circles='[
       {&quot;label&quot;:&quot;HTML&quot;,&quot;value&quot;:90,&quot;color&quot;:&quot;#e34c26&quot;},
       {&quot;label&quot;:&quot;CSS&quot;,&quot;value&quot;:85,&quot;color&quot;:&quot;#264de4&quot;},
       {&quot;label&quot;:&quot;JavaScript&quot;,&quot;value&quot;:80,&quot;color&quot;:&quot;#f7df1e&quot;}
     ]'&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-progress-circles</code> - JSON array of circle data (required)</li>
<li><code>data-progress-title</code> - Center title text</li>
<li><code>data-progress-legend</code> - Show legend: <code>true</code>/<code>false</code> (default: <code>false</code>)</li>
</ul>

<p><strong>Circle Properties:</strong></p>

<ul>
<li><code>label</code> - Circle label</li>
<li><code>value</code> - Progress value 0&#8211;100</li>
<li><code>color</code> - Hex color code</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>Responsive sizing</li>
<li>Optional center title</li>
<li>Optional color legend</li>
<li>Nested concentric circles</li>
</ul>

<hr />

<h3 id="10.multislider">10. MultiSlider</h3>

<p>Multi-item carousel with infinite loop and responsive breakpoints.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-multislider 
     data-multislider-items=&quot;3&quot; 
     data-multislider-items-md=&quot;2&quot; 
     data-multislider-items-sm=&quot;1&quot; 
     data-multislider-gap=&quot;20&quot;
     data-multislider-autoplay=&quot;true&quot;
     data-multislider-interval=&quot;3000&quot;&gt;
  &lt;div data-multislider-track&gt;
    &lt;div data-multislider-item&gt;Item 1&lt;/div&gt;
    &lt;div data-multislider-item&gt;Item 2&lt;/div&gt;
    &lt;div data-multislider-item&gt;Item 3&lt;/div&gt;
    &lt;div data-multislider-item&gt;Item 4&lt;/div&gt;
    &lt;div data-multislider-item&gt;Item 5&lt;/div&gt;
  &lt;/div&gt;
  &lt;button data-multislider-prev&gt;â€¹&lt;/button&gt;
  &lt;button data-multislider-next&gt;â€º&lt;/button&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-multislider-items</code> - Items per view on desktop (default: <code>3</code>)</li>
<li><code>data-multislider-items-md</code> - Items per view on tablet (default: <code>2</code>)</li>
<li><code>data-multislider-items-sm</code> - Items per view on mobile (default: <code>1</code>)</li>
<li><code>data-multislider-gap</code> - Gap between items in pixels (default: <code>20</code>)</li>
<li><code>data-multislider-autoplay</code> - Enable autoplay: <code>true</code>/<code>false</code> (default: <code>false</code>)</li>
<li><code>data-multislider-interval</code> - Autoplay interval in ms (default: <code>5000</code>)</li>
</ul>

<p><strong>Breakpoints:</strong></p>

<ul>
<li>Desktop: â‰¥1024px</li>
<li>Tablet: 768px - 1023px</li>
<li>Mobile: &lt;768px</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>âœ¨ <strong>True infinite loop</strong></li>
<li>Clone-based seamless sliding</li>
<li>Responsive breakpoints</li>
<li>Keyboard navigation</li>
<li>Autoplay with pause on hover</li>
<li>Smooth transitions in both directions</li>
</ul>

<p><strong>Events:</strong></p>

<pre><code class="javascript">multislider.addEventListener('battersea:multisliderChange', (e) =&gt; {
  console.log('Current position:', e.detail.index);
});
</code></pre>

<hr />

<h3 id="11.parallax">11. Parallax</h3>

<p>Parallax scrolling background effect.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-parallax 
     data-parallax-speed=&quot;0.5&quot; 
     data-parallax-image=&quot;background.jpg&quot;&gt;
  &lt;div class=&quot;content&quot;&gt;
    &lt;h1&gt;Content with parallax background&lt;/h1&gt;
  &lt;/div&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-parallax-speed</code> - Scroll speed multiplier (default: <code>0.5</code>)</li>
<li><code>data-parallax-image</code> - Background image URL</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>Smooth scroll effect</li>
<li>Adjustable speed</li>
<li>Optimized performance</li>
</ul>

<hr />

<h3 id="12.flipbox">12. Flipbox</h3>

<p>3D flip card animations.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;div data-flipbox data-flipbox-trigger=&quot;hover&quot;&gt;
  &lt;div data-flipbox-front&gt;
    &lt;h3&gt;Front Side&lt;/h3&gt;
  &lt;/div&gt;
  &lt;div data-flipbox-back&gt;
    &lt;h3&gt;Back Side&lt;/h3&gt;
  &lt;/div&gt;
&lt;/div&gt;
</code></pre>

<p><strong>Attributes:</strong></p>

<ul>
<li><code>data-flipbox-trigger</code> - Trigger type: <code>hover</code>/<code>click</code> (default: <code>hover</code>)</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>3D transform animation</li>
<li>Hover or click trigger</li>
<li>Smooth rotation</li>
<li>Perspective effect</li>
</ul>

<hr />

<h3 id="13.smoothscroll⭐new">13. SmoothScroll ⭐ NEW</h3>

<p>Scroll-to-section navigation with visual dots and dynamic header support.</p>

<p><strong>HTML:</strong></p>

<pre><code class="html">&lt;!-- Dynamic header detection (recommended) --&gt;
&lt;div data-smoothscroll 
     data-smoothscroll-header-selector=&quot;#main-header&quot;
     data-smoothscroll-position=&quot;right&quot;
     data-smoothscroll-duration=&quot;1000&quot;
     data-smoothscroll-easing=&quot;ease-out&quot;&gt;
&lt;/div&gt;

&lt;!-- Sections can be ANY element --&gt;
&lt;section data-scroll-section data-scroll-title=&quot;Home&quot;&gt;Content&lt;/section&gt;
&lt;div data-scroll-section data-scroll-title=&quot;Features&quot;&gt;Content&lt;/div&gt;
&lt;article data-scroll-section data-scroll-title=&quot;About&quot;&gt;Content&lt;/article&gt;
</code></pre>

<p><strong>Container Attributes:</strong></p>

<ul>
<li><code>data-smoothscroll-header-selector</code> - CSS selector for dynamic header (e.g., <code>#header</code>)</li>
<li><code>data-smoothscroll-offset</code> - Static offset in pixels (default: <code>0</code>)</li>
<li><code>data-smoothscroll-position</code> - Dot position: <code>left</code>/<code>right</code> (default: <code>right</code>)</li>
<li><code>data-smoothscroll-duration</code> - Scroll animation duration in ms (default: <code>800</code>)</li>
<li><code>data-smoothscroll-easing</code> - Easing function: <code>linear</code>, <code>ease-in</code>, <code>ease-out</code>, <code>ease-in-out</code> (default: <code>ease-out</code>)</li>
<li><code>data-smoothscroll-hide-mobile</code> - Hide navigation on mobile: <code>true</code>/<code>false</code> (default: <code>true</code>)</li>
</ul>

<p><strong>Section Attributes:</strong></p>

<ul>
<li><code>data-scroll-section</code> - Marks element as a section (required)</li>
<li><code>data-scroll-title</code> - Section title for tooltip (required)</li>
<li><code>id</code> - Section ID (auto-generated if missing)</li>
</ul>

<p><strong>Features:</strong></p>

<ul>
<li>✨ Visual navigation dots on page side</li>
<li>🎯 Dynamic header offset detection (auto-adjusts to shrinking headers)</li>
<li>🔄 Real-time target recalculation during scroll</li>
<li>📍 Section detection with IntersectionObserver</li>
<li>💨 Cubic ease-out for smooth deceleration</li>
<li>⌨️ Keyboard accessible (Tab, Enter, Arrow keys)</li>
<li>📱 Responsive (auto-hides on mobile by default)</li>
<li>🎨 Customizable via CSS variables</li>
<li>🔊 Custom events: <code>battersea:scrollSectionChange</code></li>
</ul>

<p><strong>Events:</strong></p>

<pre><code class="javascript">document.querySelector('[data-smoothscroll]')
  .addEventListener('battersea:scrollSectionChange', (e) =&gt; {
    console.log('Section:', e.detail.section.title);
    console.log('Index:', e.detail.index);
  });
</code></pre>

<p><strong>CSS Variables:</strong></p>

<pre><code class="css">--battersea-scroll-dot-size: 12px
--battersea-scroll-dot-active-size: 16px
--battersea-scroll-dot-color: rgba(0,0,0,0.3)
--battersea-scroll-dot-active-color: var(--battersea-primary)
--battersea-scroll-tooltip-bg: rgba(0,0,0,0.85)
</code></pre>

<p><strong>Dynamic Header Support:</strong>
The component automatically detects and adapts to headers that change size (e.g., shrink on scroll). Uses <code>getComputedStyle()</code> to read CSS target values, handles transitions smoothly, and recalculates scroll targets in real-time during animation.</p>

<hr />

<h2 id="ðŸŽ¨customization">ðŸŽ¨ Customization</h2>

<h3 id="cssvariables">CSS Variables</h3>

<p>Customize the library&#8217;s appearance using CSS variables:</p>

<pre><code class="css">:root {
  /* Colors */
  --battersea-primary: #007bff;
  --battersea-secondary: #6c757d;
  --battersea-text: #333;
  --battersea-bg: #f8f9fa;
  
  /* Animation */
  --battersea-animation-duration: 0.6s;
  --battersea-animation-timing: ease-out;
  
  /* Tooltips */
  --battersea-tooltip-bg: #333;
  --battersea-tooltip-text: #fff;
  
  /* Progress */
  --battersea-progress-bg: #e9ecef;
  --battersea-progress-fill: #007bff;
  
  /* Slider */
  --battersea-slider-arrow-bg: rgba(0, 0, 0, 0.5);
  --battersea-slider-dot-bg: #ccc;
  --battersea-slider-dot-active: #007bff;
}
</code></pre>

<h3 id="compilingless">Compiling LESS</h3>

<p>The library uses LESS for styling. To customize:</p>

<ol>
<li>Edit <code>battersea-library.less</code></li>
<li>Compile to CSS:</li>
</ol>

<pre><code class="```bash">   lessc battersea-library.less battersea-library.css

</code></pre>

<hr />

<h2 id="ðŸ”§javascriptapi">ðŸ”§ JavaScript API</h2>

<h3 id="manualinitialization">Manual Initialization</h3>

<p>By default, components auto-initialize on page load. For dynamic content:</p>

<pre><code class="javascript">// Re-initialize all components
Battersea.init();

// Initialize specific component
Battersea.initComponent('slider');

// Get component instance
const sliderInstance = Battersea.getInstance(element, 'slider');

// Destroy component
sliderInstance.destroy();
</code></pre>

<h3 id="customevents">Custom Events</h3>

<p>All components dispatch custom events:</p>

<pre><code class="javascript">// Slider
element.addEventListener('battersea:slideChange', (e) =&gt; {
  console.log(e.detail.index, e.detail.slide);
});

// Accordion
element.addEventListener('battersea:accordionToggle', (e) =&gt; {
  console.log(e.detail.item, e.detail.isOpen);
});

// Popup
element.addEventListener('battersea:popupOpen', () =&gt; {});
element.addEventListener('battersea:popupClose', () =&gt; {});

// MultiSlider
element.addEventListener('battersea:multisliderChange', (e) =&gt; {
  console.log(e.detail.index);
});
</code></pre>

<hr />

<h2 id="ðŸ“±browsersupport">ðŸ“± Browser Support</h2>

<ul>
<li>Chrome 90+</li>
<li>Firefox 88+</li>
<li>Safari 14+</li>
<li>Edge 90+</li>
</ul>

<p><strong>Required Features:</strong></p>

<ul>
<li>ES6 Classes</li>
<li>CSS Custom Properties</li>
<li>IntersectionObserver</li>
<li>CSS Transforms</li>
<li>TransitionEnd events</li>
</ul>

<hr />

<h2 id="ðŸ—ï¸architecture">ðŸ—ï¸ Architecture</h2>

<h3 id="filestructure">File Structure</h3>

<pre><code>battersea-library/
â”œâ”€â”€ battersea-utils.js          # Utility functions
â”œâ”€â”€ battersea-core.js           # Core initialization system
â”œâ”€â”€ battersea-tooltip.js        # Tooltip component
â”œâ”€â”€ battersea-slider.js         # Slider component
â”œâ”€â”€ battersea-tabs.js           # Tabs component
â”œâ”€â”€ battersea-accordion.js      # Accordion component
â”œâ”€â”€ battersea-popup.js          # Popup component
â”œâ”€â”€ battersea-animation.js      # Animation component
â”œâ”€â”€ battersea-counter.js        # Counter component
â”œâ”€â”€ battersea-progressbar.js    # ProgressBar component
â”œâ”€â”€ battersea-nestedprogress.js # NestedProgress component
â”œâ”€â”€ battersea-multislider.js    # MultiSlider component
â”œâ”€â”€ battersea-parallax.js       # Parallax component
â”œâ”€â”€ battersea-flipbox.js        # Flipbox component
â”œâ”€â”€ battersea-library.less      # LESS styles
â”œâ”€â”€ battersea-library.css       # Compiled CSS
â””â”€â”€ README.md                   # This file
</code></pre>

<h3 id="componentstructure">Component Structure</h3>

<p>Each component follows this pattern:</p>

<pre><code class="javascript">class ComponentName {
  constructor(el) {
    this.el = el;
    this.events = [];
    // ... initialization
    this.init();
  }
  
  init() {
    // Setup component
  }
  
  destroy() {
    // Clean up events
    this.events.forEach(cleanup =&gt; cleanup());
  }
}

// Register with core
Battersea.register('component-name', ComponentName, '[data-component]');
</code></pre>

<hr />

<h2 id="ðŸš¦performance">ðŸš¦ Performance</h2>

<h3 id="bestpractices">Best Practices</h3>

<ol>
<li><strong>Load only what you need</strong>: Include only component files you&#8217;re using</li>
<li><strong>Lazy load</strong>: For large sites, consider lazy-loading component JS</li>
<li><strong>Optimize images</strong>: Use appropriate image sizes for sliders</li>
<li><strong>Minimize animations</strong>: Limit the number of simultaneously animating elements</li>
<li><strong>Debouncing</strong>: Resize/scroll events are automatically debounced</li>
</ol>

<h3 id="optimizationfeatures">Optimization Features</h3>

<ul>
<li>IntersectionObserver for scroll-triggered components</li>
<li>CSS transforms for hardware acceleration</li>
<li>Debounced resize handlers</li>
<li>Event delegation where possible</li>
<li>Minimal DOM manipulation</li>
</ul>

<hr />

<h2 id="â™¿accessibility">â™¿ Accessibility</h2>

<p>All components are built with accessibility in mind:</p>

<ul>
<li><strong>Keyboard Navigation</strong>: All interactive components support keyboard controls</li>
<li><strong>ARIA Labels</strong>: Proper ARIA attributes throughout</li>
<li><strong>Focus Management</strong>: Visible focus indicators, focus trapping in modals</li>
<li><strong>Screen Readers</strong>: Semantic HTML and ARIA roles</li>
<li><strong>Reduced Motion</strong>: Respects <code>prefers-reduced-motion</code></li>
<li><strong>Color Contrast</strong>: WCAG AA compliant default colors</li>
</ul>

<hr />

<h2 id="ðŸ›troubleshooting">ðŸ› Troubleshooting</h2>

<h3 id="componentsnotinitializing">Components not initializing</h3>

<p><strong>Problem</strong>: Components don&#8217;t work after page load.</p>

<p><strong>Solution</strong>: Ensure scripts are loaded in order:</p>

<pre><code class="html">&lt;script src=&quot;battersea-utils.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;battersea-core.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;battersea-[component].js&quot;&gt;&lt;/script&gt;
</code></pre>

<h3 id="slidernotslidingsmoothly">Slider not sliding smoothly</h3>

<p><strong>Problem</strong>: Slider jumps or doesn&#8217;t loop smoothly.</p>

<p><strong>Solution</strong>:</p>

<ul>
<li>Ensure you&#8217;re using <code>data-slider-transition=&quot;slide&quot;</code> for infinite loop</li>
<li>Check that <code>data-slider-track</code> wraps all slides</li>
<li>Verify slides have <code>data-slider-item</code> attribute</li>
</ul>

<h3 id="animationstriggeringmultipletimes">Animations triggering multiple times</h3>

<p><strong>Problem</strong>: Animations play more than once.</p>

<p><strong>Solution</strong>:</p>

<ul>
<li>Don&#8217;t manually call animation methods</li>
<li>Ensure only one instance of battersea-animation.js is loaded</li>
<li>Check console for errors</li>
</ul>

<h3 id="multislideritemswrongsize">MultiSlider items wrong size</h3>

<p><strong>Problem</strong>: Items not sized correctly.</p>

<p><strong>Solution</strong>:</p>

<ul>
<li>Ensure parent has a defined width</li>
<li>Check that gap value accounts for container width</li>
<li>Verify responsive breakpoints match your CSS</li>
</ul>

<hr />

<h2 id="ðŸ“„license">ðŸ“„ License</h2>

<p>MIT License</p>

<p>Copyright (c) 2024</p>

<p>Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &#8220;Software&#8221;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:</p>

<p>The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.</p>

<p>THE SOFTWARE IS PROVIDED &#8220;AS IS&#8221;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</p>

<hr />

<h2 id="ðŸ¤contributing">ðŸ¤ Contributing</h2>

<p>Contributions are welcome! Please feel free to submit issues and pull requests.</p>

<h3 id="development">Development</h3>

<ol>
<li>Clone the repository</li>
<li>Make your changes</li>
<li>Test thoroughly across browsers</li>
<li>Compile LESS to CSS</li>
<li>Submit a pull request</li>
</ol>

<hr />

<h2 id="ðŸ“žsupport">ðŸ“ž Support</h2>

<p>For bug reports and feature requests, please open an issue on the repository.</p>

<hr />

<h2 id="ðŸŽ‰acknowledgments">ðŸŽ‰ Acknowledgments</h2>

<p>Built with â¤ï¸ using vanilla JavaScript and modern web standards.</p>

<p>Special thanks to all contributors and users of Battersea Library.</p>

<hr />

<p><strong>Happy Building! ðŸš€</strong></p>

</body>
</html>

