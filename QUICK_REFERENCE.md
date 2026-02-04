# Quick Reference - Testing Commands

## Access Application
```
URL: http://localhost:8000
```

## Open Browser Console (Required for Testing)
```
Windows/Linux: Press F12
macOS: Press Cmd+Option+I
Then click "Console" tab
```

## Expected Console Messages

### Adding Quote Item
Expected:
```
=== ADD QUOTE ITEM CALLED ===
Container found, creating new item
New item added to DOM
Qty input listeners added
Price input listeners added
Calculating quote...
=== CALCULATE QUOTE CALLED ===
Found items: 1
Item 0: qty=1, price=0, total=0
Updated quoteSubtotal
Updated quoteDiscountAmount
Updated quoteTotal
=== CALCULATE QUOTE COMPLETE ===
=== ADD QUOTE ITEM COMPLETE ===
```

### Changing Quantity (e.g., 1 to 2)
Expected:
```
Qty input changed: 2
=== CALCULATE QUOTE CALLED ===
Found items: 1
Item 0: qty=2, price=500, total=1000
Subtotal before discount: 1000
Discount: 0 %, Amount: 0 Total: 1000
Updated quoteSubtotal
Updated quoteDiscountAmount
Updated quoteTotal
=== CALCULATE QUOTE COMPLETE ===
```

### Changing Discount (e.g., 0% to 10%)
Expected:
```
Discount input triggered
=== CALCULATE QUOTE CALLED ===
Found items: 1
Item 0: qty=2, price=500, total=1000
Subtotal before discount: 1000
Discount: 10 %, Amount: 100 Total: 900
Updated quoteSubtotal
Updated quoteDiscountAmount
Updated quoteTotal
=== CALCULATE QUOTE COMPLETE ===
```

## Quick Test Steps

### Test 1: Add Items
```
1. Navigate to Quote Generator
2. Click "Add Item"
   - Check console for "=== ADD QUOTE ITEM CALLED ===" message
   - Verify new row appears
   - Check "=== ADD QUOTE ITEM COMPLETE ===" message
```

### Test 2: Calculate on Quantity Change
```
1. Fill Quantity field: 2
2. Fill Price field: 500
3. Watch console for "Qty input changed: 2"
4. Verify "Item 0: qty=2, price=500, total=1000" in console
5. Verify subtotal updates to "R 1,000.00"
```

### Test 3: Calculate on Price Change
```
1. Change Price: 750 (from 500)
2. Watch console for "Price input changed: 750"
3. Verify "Item 0: qty=2, price=750, total=1500" in console
4. Verify subtotal updates to "R 1,500.00"
```

### Test 4: Calculate on Discount Change
```
1. Set Discount to 10%
2. Watch console for discount calculation
3. Verify "Discount: 10 %, Amount: 150"
4. Verify total updates correctly
```

### Test 5: Save Quote
```
1. Fill all required fields
2. Click "Save Quote"
3. Confirm alert appears
4. Check console for "=== QUOTE SAVE COMPLETE ===" message
5. Verify form resets
```

### Test 6: Download PDF
```
1. After saving, click "Download Quote PDF"
2. Verify PDF downloads
3. Open PDF and check contents
```

## Verify Functions Exist (Console Commands)

Copy-paste these into console to verify functions are loaded:

```javascript
// Check if functions exist
console.log('addQuoteItem:', typeof window.addQuoteItem);
console.log('calculateQuote:', typeof window.calculateQuote);
console.log('addInvoiceItem:', typeof window.addInvoiceItem);
console.log('calculateInvoice:', typeof window.calculateInvoice);

// All should return "function"
```

## Manual Function Calls (Console Commands)

```javascript
// Add a new quote item
window.addQuoteItem();

// Recalculate quote manually
window.calculateQuote();

// Add a new invoice item
window.addInvoiceItem();

// Recalculate invoice manually
window.calculateInvoice();
```

## Check if Elements Exist (Console Commands)

```javascript
// Verify quote items container
console.log(document.getElementById('quoteItems'));

// Verify invoice items container
console.log(document.getElementById('invoiceItems'));

// Verify quote subtotal display
console.log(document.getElementById('quoteSubtotal'));

// Verify invoice subtotal display
console.log(document.getElementById('invSubtotal'));
```

## If Something Goes Wrong

1. **Check F12 Console for errors (red text)**
2. **Clear browser cache (Ctrl+Shift+Delete)**
3. **Refresh page (Ctrl+F5)**
4. **Close and reopen browser**
5. **Check server status:** Terminal should show "Serving HTTP on..."

## Expected Behavior

✅ Add Item button works instantly
✅ Calculations update without page refresh
✅ Discount changes update totals immediately
✅ Form resets after save
✅ PDF downloads with correct data
✅ No red errors in console (only blue info logs)

## Success Indicators

- ✅ "=== ADD QUOTE ITEM CALLED ===" appears in console
- ✅ New item row appears in form
- ✅ "Item 0: qty=X, price=Y, total=Z" shows in console
- ✅ Subtotal/Total display elements update
- ✅ No red error messages in console
- ✅ All calculations are correct
- ✅ Form resets after save
- ✅ PDF generates without errors

## Files to Reference

- **Main Testing Guide:** /TESTING_GUIDE.md
- **Technical Details:** /TECHNICAL_SUMMARY.md
- **System Status:** /STATUS_REPORT.md
- **Source Code:** /script.js (look at lines 260-550)
