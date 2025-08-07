# MutationObserver HTMLStyleSheet Bug Report

This playground demonstrates an issue with Firefox where `MutationObserver` cannot observe changes to `HTMLStyleSheet` objects using `{ childList: true }` options.

## Problem Description

In Firefox, attempting to create a `MutationObserver` on a `HTMLStyleSheet` object and observe changes to its content (CSS rules) using `{ childList: true }` does not work as expected. The observer does not fire when CSS rules are added, removed, or modified through the CSS Object Model (CSSOM) APIs.

## Test Environment

- **Firefox**: Bug is present
- **Chrome**: May work differently (needs verification)
- **Safari**: May work differently (needs verification)

## Files

- `index.html` - Main test page with comprehensive UI
- `mutation-observer-test.js` - Test implementation with multiple scenarios
- `minimal-test.html` - Simplified version for bug reports
- `README.md` - This file

## How to Use

1. Open `index.html` in Firefox
2. Open the browser's Developer Console (F12)
3. Click the test buttons to modify the stylesheet
4. Observe that the StyleSheet MutationObserver does not fire events
5. Compare behavior with other browsers

## Test Scenarios

The playground tests multiple ways of modifying stylesheets:

1. **insertRule()** - Adding CSS rules via CSSOM
2. **deleteRule()** - Removing CSS rules via CSSOM  
3. **Rule modification** - Changing existing rule properties
4. **Direct text modification** - Changing the style element's textContent

## Expected vs Actual Behavior

### Expected
- MutationObserver should fire when CSS rules are added/removed/modified
- `mutation.type` should be `'childList'` for rule additions/removals
- `addedNodes`/`removedNodes` should contain information about changed rules

### Actual (Firefox)
- MutationObserver does not fire for stylesheet content changes
- Only fires for direct text content changes to the `<style>` element itself
- CSSOM modifications (insertRule, deleteRule, etc.) are not detected

## Bug Report Information

**Summary**: MutationObserver with `{ childList: true }` does not observe HTMLStyleSheet changes in Firefox

**Steps to Reproduce**:
1. Create a `<style>` element in HTML
2. Get reference to its `sheet` property (HTMLStyleSheet)
3. Create MutationObserver with `{ childList: true }` on the stylesheet
4. Use `insertRule()` or `deleteRule()` to modify the stylesheet
5. Observe that MutationObserver callback is not called

**Expected Result**: MutationObserver should fire when rules are added/removed

**Actual Result**: MutationObserver does not fire for CSSOM changes

## Browser Specifications

According to the DOM specification, StyleSheet objects should be observable by MutationObserver when their child rules change, as CSS rules are considered child nodes of the stylesheet in the CSSOM.

## Related APIs

- [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [CSSStyleSheet.insertRule()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule)
- [CSSStyleSheet.deleteRule()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/deleteRule)
- [CSS Object Model (CSSOM)](https://www.w3.org/TR/cssom-1/)
