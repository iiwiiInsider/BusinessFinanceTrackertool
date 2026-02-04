# Testing Guide - Business Finance Tracking Tool

## Server Status
✅ Local server running on **http://localhost:8000**

## How to Test (Step-by-Step)

### Prerequisites
- Browser with Developer Tools (F12 to open Console)
- Keep browser console open during testing to see debug logs

---

## Test 1: Quote Generator - Add Items

1. Navigate to **Quote Generator** (Click in browser)
2. Fill in Business Information:
   - Business Name: "BURN Productions"
   - Business Email: "info@burn.co.za"
   - Business Phone: "555-0123"
   - Business Address: "Johannesburg, SA"

3. Fill in Client Information:
   - Client Name: "Test Client"
   - Client Email: "client@example.com"
   - Client Phone: "555-9876"
   - Client Address: "Cape Town, SA"

4. **Test: Click "Add Item" button**
   - ✓ Console should show: `=== ADD QUOTE ITEM CALLED ===`
   - ✓ New row should appear below existing items
   - ✓ Focus should move to Description field

5. **Fill in Item Details:**
   - Description: "Logo Design"
   - Quantity: 1
   - Price: 500

6. **CRITICAL TEST: Modify Quantity from 1 to 2**
   - Console should show: `Item 0: qty=2, price=500, total=1000`
   - **Subtotal should update to "R 500.00"** (shows first item only before adding more)
   - **Total should update accordingly**

7. **CRITICAL TEST: Modify Price from 500 to 750**
   - Console should show: `Item 0: qty=2, price=750, total=1500`
   - **Subtotal should update to "R 1,500.00"**
   - **Total should update accordingly**

8. **Test: Click "Add Item" again**
   - Add another item: Description: "Web Design", Quantity: 1, Price: 1000
   - Console should show item was added
   - **Subtotal should now show "R 2,500.00"** (1500 + 1000)

9. **Test Discount:**
   - Set Discount to 10%
   - Console should show discount calculation
   - **Discount Amount should show "R 250.00"**
   - **Total should show "R 2,250.00"**

10. **Test: Change discount to 0%**
    - **Total should revert to "R 2,500.00"**

---

## Test 2: Invoice Generator - Add Items

Repeat the same tests for Invoice Generator:

1. Navigate to **Invoice Generator**
2. Fill in Business & Client Info (same as above)
3. Click **"Add Item"** button
   - ✓ Console should show: `=== ADD INVOICE ITEM CALLED ===`
   - ✓ New row should appear
4. Add items and test quantity/price changes
5. Verify calculations work identically to quotes

---

## Test 3: Save Quote

1. Complete a quote with items
2. Click **"Save Quote"** button
3. Should see alert: "Quote saved successfully!"
4. **Form should reset** (ready for new quote)
5. Check browser console for: `=== QUOTE SAVE COMPLETE ===`
6. Navigate to **Documents** to see saved quote

---

## Test 4: Download Quote PDF

1. After saving a quote, click **"Download Quote PDF"**
2. PDF should download with:
   - Quote number
   - Business & Client info
   - Item details with calculations
   - Subtotal, Discount, and Total

---

## Browser Console Expected Output

### When adding item:
```
=== ADD QUOTE ITEM CALLED ===
Container found, creating new item
New item added to DOM
Qty input listeners added
Price input listeners added
Calculating quote...
=== CALCULATE QUOTE CALLED ===
Found items: 2
Item 0: qty=..., price=..., total=...
Item 1: qty=..., price=..., total=...
Updated quoteSubtotal
Updated quoteDiscountAmount
Updated quoteTotal
=== CALCULATE QUOTE COMPLETE ===
=== ADD QUOTE ITEM COMPLETE ===
```

### When modifying quantity/price:
```
Qty input changed: 2
=== CALCULATE QUOTE CALLED ===
Found items: 1
Item 0: qty=2, price=500, total=1000
Subtotal before discount: 1000
Updated quoteSubtotal
Updated quoteDiscountAmount
Updated quoteTotal
=== CALCULATE QUOTE COMPLETE ===
```

---

## Troubleshooting

### If "Add Item" doesn't work:
1. Open F12 (Developer Tools)
2. Look for errors in Console tab
3. Check if `=== ADD QUOTE ITEM CALLED ===` appears
4. If not, verify quoteItems element exists

### If calculations don't update:
1. Check console for: `=== CALCULATE QUOTE CALLED ===`
2. Verify quantity and price inputs have values
3. Check for JavaScript errors in console (red text)

### If PDF doesn't download:
1. Check if jsPDF library loaded (check Network tab)
2. Ensure all required fields are filled
3. Check console for PDF generation errors

---

## Verification Checklist

- [ ] Quote Add Item works
- [ ] Quote quantity changes trigger recalculation
- [ ] Quote price changes trigger recalculation
- [ ] Quote discount changes trigger recalculation
- [ ] Invoice Add Item works
- [ ] Invoice quantity changes trigger recalculation
- [ ] Invoice price changes trigger recalculation
- [ ] Invoice discount changes trigger recalculation
- [ ] Save Quote works and resets form
- [ ] Save Invoice works and resets form
- [ ] Quote PDF downloads correctly
- [ ] Invoice PDF downloads correctly
- [ ] Console shows no errors (only info/debug logs)

---

## Notes
- All console logs are for debugging. They can be removed later.
- Server logs appear in the Python terminal window
- Refresh browser (Ctrl+F5) to clear cache if changes don't appear immediately
