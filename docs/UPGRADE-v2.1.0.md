# Battersea Library v2.1.0 - Upgrade Checklist

## ✅ Quick Upgrade Steps

### 1. Update Core Files ⚠️ **REQUIRED**

Replace these files in your project:

```
✓ battersea-library.css (updated - new CSS variables)
✓ battersea-library.less (updated - new styles)
✓ battersea-tooltip.js (v2.0.0 → v2.0.1)
```

### 2. Add New Component (Optional)

If you want to use SmoothScroll:

```
✓ battersea-smoothscroll.js (new file)
```

### 3. Update HTML Script Tags

If using SmoothScroll, add it to your scripts:

```html
<script src="battersea-utils.js"></script>
<script src="battersea-core.js"></script>
<script src="battersea-tooltip.js"></script>
<script src="battersea-smoothscroll.js"></script> <!-- NEW -->
<!-- ... other components ... -->
```

### 4. Implementation (If Using SmoothScroll)

Add to your HTML:

```html
<!-- Navigation container -->
<div data-smoothscroll 
     data-smoothscroll-header-selector="#your-header"
     data-smoothscroll-position="right">
</div>

<!-- Mark your sections -->
<section data-scroll-section data-scroll-title="Home">
  <!-- Your content -->
</section>

<section data-scroll-section data-scroll-title="About">
  <!-- Your content -->
</section>
```

---

## 🔍 What Changed?

### Breaking Changes
**NONE** - This is 100% backward compatible!

### New Features
- ✨ SmoothScroll component with dynamic header detection
- 📝 Tooltip custom class support (`data-tooltip-class`)
- 🎨 New CSS variables for scroll navigation

### Bug Fixes
- None (this is a feature release)

---

## 📋 File Inventory

### What's in the v2.1.0 Release

**Core Files (Updated):**
- `battersea-library.css` - Main stylesheet (17 KB)
- `battersea-library.less` - LESS source (19 KB)
- `battersea-tooltip.js` - Updated component (3.5 KB)
- `README.md` - Updated documentation (23 KB)

**New Files:**
- `battersea-smoothscroll.js` - New component (15 KB)
- `RELEASE-v2.1.0.md` - Release notes (8 KB)

**Demo Files (Optional):**
- `demo-smoothscroll.html` - Basic demo (10 KB)
- `demo-smoothscroll-dynamic.html` - Dynamic header demo (13 KB)

**Unchanged Files (Keep Your Existing):**
- `battersea-utils.js` (no changes)
- `battersea-core.js` (no changes)
- `battersea-slider.js` (no changes)
- `battersea-tabs.js` (no changes)
- `battersea-accordion.js` (no changes)
- `battersea-popup.js` (no changes)
- `battersea-animation.js` (no changes)
- `battersea-counter.js` (no changes)
- `battersea-progressbar.js` (no changes)
- `battersea-nestedprogress.js` (no changes)
- `battersea-multislider.js` (no changes)
- `battersea-parallax.js` (no changes)
- `battersea-flipbox.js` (no changes)

---

## 🧪 Testing Checklist

After upgrading, verify:

- [ ] Existing components still work
- [ ] Tooltips render correctly
- [ ] CSS styling is intact
- [ ] No console errors
- [ ] SmoothScroll works (if implemented)
- [ ] Dynamic header detection works (if used)
- [ ] Keyboard navigation functional
- [ ] Mobile responsive

---

## 💡 Pro Tips

### Custom Tooltip Styling

Now you can apply custom classes to tooltips:

```html
<button data-tooltip="My tooltip" 
        data-tooltip-class="fancy-tooltip">
  Hover me
</button>
```

```css
.fancy-tooltip {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 10px 15px;
  font-weight: bold;
}
```

### Dynamic Headers

If your header changes size on scroll:

```html
<!-- Let SmoothScroll auto-detect header height -->
<div data-smoothscroll 
     data-smoothscroll-header-selector="#header">
</div>
```

Instead of:

```html
<!-- Old way - won't adjust to header changes -->
<div data-smoothscroll 
     data-smoothscroll-offset="80">
</div>
```

### Customizing Scroll Dots

Override CSS variables in your stylesheet:

```css
:root {
  --battersea-scroll-dot-size: 14px;
  --battersea-scroll-dot-active-size: 18px;
  --battersea-scroll-dot-active-color: #ff6b6b;
}
```

---

## 🆘 Troubleshooting

### Issue: Tooltips not showing after upgrade
**Solution:** Clear browser cache, ensure `battersea-tooltip.js` v2.0.1 is loaded

### Issue: SmoothScroll dots not appearing
**Solution:** 
1. Check that sections have `data-scroll-section` and `data-scroll-title`
2. Verify CSS is loaded
3. Check browser console for errors

### Issue: Scroll alignment off with dynamic header
**Solution:**
1. Use `data-smoothscroll-header-selector` instead of `data-smoothscroll-offset`
2. Ensure header has `position: fixed`
3. Check that header selector matches your header element

### Issue: Multiple navigation dots after mutation
**Solution:** This should be fixed in v2.1.0. If persisting, ensure you're using latest version.

---

## 📞 Support

- **Documentation:** See README.md for full API reference
- **Examples:** Check demo files for implementation examples
- **Issues:** Review RELEASE-v2.1.0.md for known issues

---

## ✨ What's Next?

Consider these planned features for v2.2.0:
- Header component with scroll-shrink
- SmoothScroll enhancements (progress indicator, URL hashing)
- More easing options
- Performance optimizations

---

**Happy Upgrading! 🎉**
