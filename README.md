# BURN Productions - Business Finance Tracking Tool

A professional, fully responsive business finance management system for generating quotes, invoices, and tracking transactions with real-time calculations and PDF exports.

## Features

✅ **Quote Generator**
- Create professional quotes with business and client information
- Real-time calculations with discount support
- Save quotes locally
- Download as PDF with BURN Productions branding

✅ **Invoice Generator**
- Complete invoice creation with payment status tracking
- Multiple items with automatic calculations
- Discount application
- Payment status options (Pending, Paid, Overdue, Cancelled)
- Select approved quote to auto-populate invoice fields
- Save and download as PDF

✅ **Expenses**
- Draft bills with vendor details, status tracking, and totals
- Track paid, unpaid, overdue, and cancelled expenses

✅ **Transactions Page**
- Real-time transaction overview
- Total Income, Expenses, Net Profit, and Outstanding calculations
- Outstanding includes pending invoices and quotes
- Advanced filtering by type, status, and date range
- Export transactions to CSV or PDF

✅ **Documents Management**
- View all saved quotes and invoices
- Search and filter functionality
- One-click PDF download
- Document deletion
- Quote status actions (Approve, Reject, Pending)

✅ **Dashboard**
- Live statistics (Total Quotes, Invoices, Revenue, Pending Payments)
- Quick action buttons for common tasks
- Real-time data updates

✅ **Responsive Design**
- Fully mobile-responsive
- Works on desktop, tablet, and mobile
- Smooth animations and transitions
- Professional UI with green accent theme

✅ **Video Background**
- Dynamic video background (large-thumbnail20250225-196099-19xdc5z.mp4)
- Professional glassmorphism design
- Adjustable overlay for better readability

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **PDF Generation:** jsPDF & AutoTable
- **Data Storage:** Browser LocalStorage
- **Currency:** South African Rand (ZAR)

## Live Demo

[Access the live application here](https://yourusername.github.io/BusiessFinanaceTrackingTool)

## Installation & Setup

### Local Use
1. Clone the repository
2. Open `index.html` in a modern web browser
3. Start creating quotes and invoices immediately!

### Deploy to GitHub Pages

1. **Create a GitHub Account** (if you don't have one)
   - Go to https://github.com/signup

2. **Create a New Repository**
   - Click "+" → "New repository"
   - Repository name: `BusiessFinanaceTrackingTool` (or your preferred name)
   - Select "Public"
   - Click "Create repository"

3. **Upload Files**
   - Option A (Using GitHub Web):
     - Click "Add file" → "Upload files"
     - Drag and drop all files:
       - index.html
       - styles.css
       - script.js
       - large-thumbnail20250225-196099-19xdc5z.mp4
     - Click "Commit changes"
   
   - Option B (Using Git Command Line):
     ```bash
     cd path/to/BusiessFinanaceTrackingTool
     git init
     git add .
     git commit -m "Initial commit: Business Finance Tracking Tool"
     git branch -M main
     git remote add origin https://github.com/yourusername/BusiessFinanaceTrackingTool.git
     git push -u origin main
     ```

4. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be published at: `https://yourusername.github.io/BusiessFinanaceTrackingTool`

5. **Share the Link**
   - Your live application is now accessible via the GitHub Pages URL
   - Share this link with anyone!

## File Structure

```
BusiessFinanaceTrackingTool/
├── index.html                              # Main HTML file
├── styles.css                              # Responsive styling
├── script.js                               # Application logic
├── large-thumbnail20250225-196099-19xdc5z.mp4  # Background video
└── README.md                               # This file
```

## How to Use

### Creating a Quote
1. Navigate to "Quote Generator"
2. Fill in business and client information
3. Add items/services with descriptions, quantities, and prices
4. Set discount percentage if needed
5. Click "Save Quote" to store locally
6. Click "Download PDF" to export

### Creating an Invoice
1. Navigate to "Invoice Generator"
2. Fill in business and client information
3. Add line items
4. Select payment status
5. Click "Save Invoice"
6. Download as PDF

### Viewing Transactions
1. Go to "Transactions" page
2. View summary cards (Income, Expenses, Profit, Outstanding)
3. Use filters to narrow results by type, status, or date
4. Export to CSV or PDF
5. Click "View" to download a specific document's PDF

### Managing Documents
1. Visit "Documents" page
2. Search by document number or client name
3. Filter by type (Quotes or Invoices)
4. Click "Download PDF" to export any document

## Data Storage

- All data is stored in your browser's **LocalStorage**
- No server or internet required after initial load
- Data persists between sessions
- Clear browser data to reset (Settings → Privacy → Clear Browsing Data)

## Currency

This application uses **South African Rand (ZAR)** as the default currency. All amounts display as "R X,XXX.XX"

## Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Features

- Tax fields have been removed (manual tax application recommended)
- All calculations are real-time
- PDF generation includes BURN Productions branding
- Responsive design adapts to all screen sizes
- No login required - all data stored locally

## Future Enhancements

- Multi-user support with cloud sync
- Custom branding/logo upload
- Advanced reporting features
- Email invoice delivery
- Payment gateway integration
- Expense tracking module

## License

This project is available for personal and commercial use.

## Support

For issues or feature requests, please use the GitHub Issues section.

## Author

**BURN Productions**
- Professional Business Finance Tracking
- Built with precision and attention to detail

---

**Version:** 1.0.0  
**Last Updated:** February 2, 2026
