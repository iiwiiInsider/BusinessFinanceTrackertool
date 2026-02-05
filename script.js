// Storage Keys
const STORAGE_KEYS = {
    QUOTES: 'business_quotes',
    INVOICES: 'business_invoices',
    EXPENSES: 'business_expenses',
    BUSINESS_INFO: 'business_info'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CONTENT LOADED ===');
    console.log('Initializing application...');
    
    try {
        initializeApp();
        console.log('App initialized');
        
        setupEventListeners();
        console.log('Event listeners setup complete');
        
        updateDashboard();
        console.log('Dashboard updated');
        
        loadTransactions();
        console.log('Transactions loaded');
        
        loadDocuments();
        console.log('Documents loaded');
        
        loadExpenses();
        console.log('Expenses loaded');
        
        loadApprovedQuotes();
        console.log('Approved quotes loaded');
        
        // Set default dates
        const today = getTodayString();
        const quoteDate = document.getElementById('quoteDate');
        if (quoteDate) quoteDate.value = today;
        const invoiceDate = document.getElementById('invoiceDate');
        if (invoiceDate) invoiceDate.value = today;
        const expenseDate = document.getElementById('expenseDate');
        if (expenseDate) expenseDate.value = today;
        console.log('Default dates set to:', today);
        
        // Generate initial document numbers
        generateQuoteNumber();
        generateInvoiceNumber();
        console.log('Document numbers generated');
        
        console.log('=== INITIALIZATION COMPLETE ===');
    } catch (error) {
        console.error('=== INITIALIZATION ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
    }
});

// Initialize App
function initializeApp() {
    const pageFromHash = getPageFromHash();
    if (pageFromHash) {
        navigateTo(pageFromHash, { updateHash: false });
        return;
    }

    // Show home page by default
    navigateTo('home');
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Navigation links + buttons - with defensive checks
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.tagName.toLowerCase() === 'a') {
                e.preventDefault();
            }
            const page = this.getAttribute('data-page');
            if (page) {
                navigateTo(page);
                
                // Close mobile menu
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    window.addEventListener('hashchange', () => {
        const pageFromHash = getPageFromHash();
        if (pageFromHash) {
            navigateTo(pageFromHash, { updateHash: false });
        }
    });

    // Setup discount inputs with direct calculation
    const quoteDiscount = document.getElementById('quoteDiscount');
    if (quoteDiscount) {
        quoteDiscount.addEventListener('input', calculateQuote);
        quoteDiscount.addEventListener('change', calculateQuote);
    }
    
    const invDiscount = document.getElementById('invDiscount');
    if (invDiscount) {
        invDiscount.addEventListener('input', calculateInvoice);
        invDiscount.addEventListener('change', calculateInvoice);
    }
    
    // Initialize item row event listeners
    setupInitialItemListeners();

    // Delegated listeners for dynamic quote items
    const quoteItemsContainer = document.getElementById('quoteItems');
    if (quoteItemsContainer) {
        quoteItemsContainer.addEventListener('input', (event) => {
            const target = event.target;
            if (target && (target.classList.contains('item-qty') || target.classList.contains('item-price'))) {
                calculateQuote();
            }
        });
    }

    // Delegated listeners for dynamic invoice items
    const invoiceItemsContainer = document.getElementById('invoiceItems');
    if (invoiceItemsContainer) {
        invoiceItemsContainer.addEventListener('input', (event) => {
            const target = event.target;
            if (target && (target.classList.contains('item-qty') || target.classList.contains('item-price'))) {
                calculateInvoice();
            }
        });
    }
}

function setupInitialItemListeners() {
    // Setup quote item listeners
    const quoteItems = document.querySelectorAll('#quoteItems .item-row');
    quoteItems.forEach(row => {
        const qtyInput = row.querySelector('.item-qty');
        const priceInput = row.querySelector('.item-price');
        if (qtyInput && !qtyInput.dataset.listenerAdded) {
            qtyInput.addEventListener('input', calculateQuote);
            qtyInput.addEventListener('change', calculateQuote);
            qtyInput.dataset.listenerAdded = 'true';
        }
        if (priceInput && !priceInput.dataset.listenerAdded) {
            priceInput.addEventListener('input', calculateQuote);
            priceInput.addEventListener('change', calculateQuote);
            priceInput.dataset.listenerAdded = 'true';
        }
    });
    
    // Setup invoice item listeners
    const invoiceItems = document.querySelectorAll('#invoiceItems .item-row');
    invoiceItems.forEach(row => {
        const qtyInput = row.querySelector('.item-qty');
        const priceInput = row.querySelector('.item-price');
        if (qtyInput && !qtyInput.dataset.listenerAdded) {
            qtyInput.addEventListener('input', calculateInvoice);
            qtyInput.addEventListener('change', calculateInvoice);
            qtyInput.dataset.listenerAdded = 'true';
        }
        if (priceInput && !priceInput.dataset.listenerAdded) {
            priceInput.addEventListener('input', calculateInvoice);
            priceInput.addEventListener('change', calculateInvoice);
            priceInput.dataset.listenerAdded = 'true';
        }
    });
}

// Navigation
function navigateTo(page, options = {}) {
    console.log('=== NAVIGATION TRIGGERED ===');
    console.log('Page requested:', page);
    console.trace();
    
    try {
        // Validate page parameter
        if (!page || typeof page !== 'string') {
            console.error('Invalid page parameter:', page);
            return;
        }
        
        const pageId = page + '-page';
        console.log('Looking for page element:', pageId);
        
        // Get target page element
        const targetPage = document.getElementById(pageId);
        if (!targetPage) {
            console.error(`CRITICAL: Page element not found: ${pageId}`);
            console.log('Available page elements:', 
                Array.from(document.querySelectorAll('[id*="-page"]')).map(el => el.id));
            return;
        }
        
        console.log('Found target page:', pageId);

        const targetHash = `#${page}-page`;
        if (options.updateHash !== false && window.location.hash !== targetHash) {
            window.location.hash = targetHash;
        }
        
        // Hide all pages
        const allPages = document.querySelectorAll('.page');
        console.log('Total pages found:', allPages.length);
        allPages.forEach((p, index) => {
            console.log(`  Page ${index}:`, p.id, 'active?', p.classList.contains('active'));
            p.classList.remove('active');
        });
        
        // Show selected page
        console.log('Showing page:', pageId);
        targetPage.classList.add('active');
        console.log('Page is now active:', targetPage.classList.contains('active'));
        
        // Update active nav link
        const navLinks = document.querySelectorAll('.nav-link');
        console.log('Total nav links found:', navLinks.length);
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            link.classList.remove('active');
            if (linkPage === page) {
                console.log('Marking active nav link:', linkPage);
                link.classList.add('active');
            }
        });
        
        // Close mobile menu if open
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (hamburger && navMenu) {
            console.log('Closing mobile menu');
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update page-specific content
        console.log('Loading page-specific content for:', page);
        if (page === 'transactions') {
            console.log('Loading transactions...');
            loadTransactions();
        } else if (page === 'documents') {
            console.log('Loading documents...');
            loadDocuments();
        } else if (page === 'expenses') {
            console.log('Loading expenses...');
            loadExpenses();
        } else if (page === 'home') {
            console.log('Updating dashboard...');
            updateDashboard();
        }
        
        console.log('=== NAVIGATION COMPLETE ===');
    } catch (error) {
        console.error('=== NAVIGATION ERROR ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    }
}

function getPageFromHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) {
        return null;
    }
    return hash.endsWith('-page') ? hash.replace(/-page$/, '') : hash;
}

// Quote Management
function addQuoteItem() {
    try {
        console.log('=== ADD QUOTE ITEM CALLED ===');
        const container = document.getElementById('quoteItems');
        if (!container) {
            console.error('Quote items container not found');
            return;
        }
        
        console.log('Container found, creating new item');
        const newItem = document.createElement('div');
        newItem.className = 'item-row';
        newItem.innerHTML = `
            <input type="text" placeholder="Description" class="item-desc" required>
            <input type="number" placeholder="Quantity" class="item-qty" min="1" value="1" required>
            <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" required>
            <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
        `;
        container.appendChild(newItem);
        console.log('New item added to DOM');
        
        // Add event listeners for calculations
        const qtyInput = newItem.querySelector('.item-qty');
        const priceInput = newItem.querySelector('.item-price');
        
        if (qtyInput) {
            qtyInput.addEventListener('input', function() {
                console.log('Qty input changed:', this.value);
                calculateQuote();
            });
            qtyInput.addEventListener('change', function() {
                console.log('Qty changed (final):', this.value);
                calculateQuote();
            });
            console.log('Qty input listeners added');
        }
        
        if (priceInput) {
            priceInput.addEventListener('input', function() {
                console.log('Price input changed:', this.value);
                calculateQuote();
            });
            priceInput.addEventListener('change', function() {
                console.log('Price changed (final):', this.value);
                calculateQuote();
            });
            console.log('Price input listeners added');
        }
        
        const descInput = newItem.querySelector('.item-desc');
        if (descInput) {
            descInput.focus();
            descInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        console.log('Calculating quote...');
        calculateQuote();
        console.log('=== ADD QUOTE ITEM COMPLETE ===');
    } catch (error) {
        console.error('Error adding quote item:', error);
        console.error('Stack:', error.stack);
        alert('Error adding item. Please check browser console.');
    }
}

function calculateQuote() {
    try {
        console.log('=== CALCULATE QUOTE CALLED ===');
        const items = document.querySelectorAll('#quoteItems .item-row');
        console.log('Found items:', items.length);
        let subtotal = 0;
        
        items.forEach((item, index) => {
            const qtyInput = item.querySelector('.item-qty');
            const priceInput = item.querySelector('.item-price');
            
            if (qtyInput && priceInput) {
                const qty = parseFloat(qtyInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const itemTotal = qty * price;
                console.log(`Item ${index}: qty=${qty}, price=${price}, total=${itemTotal}`);
                subtotal += itemTotal;
            }
        });
        
        console.log('Subtotal before discount:', subtotal);
        
        const discountInput = document.getElementById('quoteDiscount');
        const discount = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
        const discountAmount = subtotal * (discount / 100);
        const total = subtotal - discountAmount;
        
        console.log('Discount:', discount, '%, Amount:', discountAmount, 'Total:', total);
        
        const subtotalEl = document.getElementById('quoteSubtotal');
        const discountAmountEl = document.getElementById('quoteDiscountAmount');
        const totalEl = document.getElementById('quoteTotal');
        
        if (subtotalEl) {
            subtotalEl.textContent = formatCurrency(subtotal);
            console.log('Updated quoteSubtotal');
        }
        if (discountAmountEl) {
            discountAmountEl.textContent = formatCurrency(discountAmount);
            console.log('Updated quoteDiscountAmount');
        }
        if (totalEl) {
            totalEl.textContent = formatCurrency(total);
            console.log('Updated quoteTotal');
        }
        console.log('=== CALCULATE QUOTE COMPLETE ===');
    } catch (error) {
        console.error('Error calculating quote:', error);
        console.error('Stack:', error.stack);
    }
}

function saveQuote() {
    console.log('=== SAVING QUOTE ===');
    try {
        if (!validateForm('quoteForm')) {
            return;
        }
        const quote = {
            id: Date.now(),
            type: 'quote',
            number: document.getElementById('quoteNumber').value,
            date: document.getElementById('quoteDate').value,
            validUntil: document.getElementById('quoteValidUntil').value,
            businessInfo: {
                name: document.getElementById('quoteBizName').value,
                email: document.getElementById('quoteBizEmail').value,
                phone: document.getElementById('quoteBizPhone').value,
                address: document.getElementById('quoteBizAddress').value
            },
            clientInfo: {
                name: document.getElementById('quoteClientName').value,
                email: document.getElementById('quoteClientEmail').value,
                phone: document.getElementById('quoteClientPhone').value,
                address: document.getElementById('quoteClientAddress').value
            },
            items: getQuoteItems(),
            discount: parseFloat(document.getElementById('quoteDiscount').value) || 0,
            notes: document.getElementById('quoteNotes').value,
            subtotal: parseFloat(document.getElementById('quoteSubtotal').textContent.replace(/[R $,]/g, '')),
            total: parseFloat(document.getElementById('quoteTotal').textContent.replace(/[R $,]/g, '')),
            status: 'pending'
        };
        
        console.log('Quote object created:', quote);
        
        const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
        quotes.push(quote);
        saveToStorage(STORAGE_KEYS.QUOTES, quotes);
        
        console.log('Quote saved to storage');
        
        alert('Quote saved successfully! Click "Download Quote PDF" to generate the PDF.');
        
        // Reset form and calculations
        resetForm('quoteForm');
        resetItemRows('quoteItems');
        document.getElementById('quoteDiscount').value = 0;
        calculateQuote();
        
        updateDashboard();
        loadTransactions();
        generateQuoteNumber();
        
        console.log('=== QUOTE SAVE COMPLETE ===');
    } catch (error) {
        console.error('=== QUOTE SAVE ERROR ===');
        console.error('Error:', error);
        alert('Error saving quote: ' + error.message);
    }
}

function getQuoteItems() {
    const items = [];
    document.querySelectorAll('#quoteItems .item-row').forEach(row => {
        items.push({
            description: row.querySelector('.item-desc').value,
            quantity: parseFloat(row.querySelector('.item-qty').value),
            price: parseFloat(row.querySelector('.item-price').value)
        });
    });
    return items;
}

function generateQuoteNumber() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const number = 'Q' + String(quotes.length + 1).padStart(4, '0');
    document.getElementById('quoteNumber').value = number;
}

// Invoice Management
function addInvoiceItem() {
    try {
        console.log('=== ADD INVOICE ITEM CALLED ===');
        const container = document.getElementById('invoiceItems');
        if (!container) {
            console.error('Invoice items container not found');
            return;
        }
        
        console.log('Container found, creating new item');
        const newItem = document.createElement('div');
        newItem.className = 'item-row';
        newItem.innerHTML = `
            <input type="text" placeholder="Description" class="item-desc" required>
            <input type="number" placeholder="Quantity" class="item-qty" min="1" value="1" required>
            <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" required>
            <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
        `;
        container.appendChild(newItem);
        console.log('New item added to DOM');
        
        // Add event listeners for calculations
        const qtyInput = newItem.querySelector('.item-qty');
        const priceInput = newItem.querySelector('.item-price');
        
        if (qtyInput) {
            qtyInput.addEventListener('input', function() {
                console.log('Invoice Qty input changed:', this.value);
                calculateInvoice();
            });
            qtyInput.addEventListener('change', function() {
                console.log('Invoice Qty changed (final):', this.value);
                calculateInvoice();
            });
            console.log('Qty input listeners added');
        }
        
        if (priceInput) {
            priceInput.addEventListener('input', function() {
                console.log('Invoice Price input changed:', this.value);
                calculateInvoice();
            });
            priceInput.addEventListener('change', function() {
                console.log('Invoice Price changed (final):', this.value);
                calculateInvoice();
            });
            console.log('Price input listeners added');
        }
        
        const descInput = newItem.querySelector('.item-desc');
        if (descInput) {
            descInput.focus();
            descInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        console.log('Calculating invoice...');
        calculateInvoice();
        console.log('=== ADD INVOICE ITEM COMPLETE ===');
    } catch (error) {
        console.error('Error adding invoice item:', error);
        console.error('Stack:', error.stack);
        alert('Error adding item. Please check browser console.');
    }
}


function calculateInvoice() {
    try {
        console.log('=== CALCULATE INVOICE CALLED ===');
        const items = document.querySelectorAll('#invoiceItems .item-row');
        console.log('Found items:', items.length);
        let subtotal = 0;
        
        items.forEach((item, index) => {
            const qtyInput = item.querySelector('.item-qty');
            const priceInput = item.querySelector('.item-price');
            
            if (qtyInput && priceInput) {
                const qty = parseFloat(qtyInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const itemTotal = qty * price;
                console.log(`Item ${index}: qty=${qty}, price=${price}, total=${itemTotal}`);
                subtotal += itemTotal;
            }
        });
        
        console.log('Subtotal before discount:', subtotal);
        
        const discountInput = document.getElementById('invDiscount');
        const discount = discountInput ? (parseFloat(discountInput.value) || 0) : 0;
        const discountAmount = subtotal * (discount / 100);
        const total = subtotal - discountAmount;
        
        console.log('Discount:', discount, '%, Amount:', discountAmount, 'Total:', total);
        
        const subtotalEl = document.getElementById('invSubtotal');
        const discountAmountEl = document.getElementById('invDiscountAmount');
        const totalEl = document.getElementById('invTotal');
        
        if (subtotalEl) {
            subtotalEl.textContent = formatCurrency(subtotal);
            console.log('Updated invSubtotal');
        }
        if (discountAmountEl) {
            discountAmountEl.textContent = formatCurrency(discountAmount);
            console.log('Updated invDiscountAmount');
        }
        if (totalEl) {
            totalEl.textContent = formatCurrency(total);
            console.log('Updated invTotal');
        }
        console.log('=== CALCULATE INVOICE COMPLETE ===');
    } catch (error) {
        console.error('Error calculating invoice:', error);
        console.error('Stack:', error.stack);
    }
}

function saveInvoice() {
    console.log('=== SAVING INVOICE ===');
    try {
        if (!validateForm('invoiceForm')) {
            return;
        }
        const invoice = {
            id: Date.now(),
            type: 'invoice',
            number: document.getElementById('invoiceNumber').value,
            date: document.getElementById('invoiceDate').value,
            dueDate: document.getElementById('invoiceDueDate').value,
            status: document.getElementById('invoiceStatus').value,
            businessInfo: {
                name: document.getElementById('invBizName').value,
                email: document.getElementById('invBizEmail').value,
                phone: document.getElementById('invBizPhone').value,
                address: document.getElementById('invBizAddress').value
            },
            clientInfo: {
                name: document.getElementById('invClientName').value,
                email: document.getElementById('invClientEmail').value,
                phone: document.getElementById('invClientPhone').value,
                address: document.getElementById('invClientAddress').value
            },
            items: getInvoiceItems(),
            discount: parseFloat(document.getElementById('invDiscount').value) || 0,
            notes: document.getElementById('invNotes').value,
            subtotal: parseFloat(document.getElementById('invSubtotal').textContent.replace(/[R $,]/g, '')),
            total: parseFloat(document.getElementById('invTotal').textContent.replace(/[R $,]/g, ''))
        };
        
        console.log('Invoice object created:', invoice);
        
        // Check if this invoice was generated from a quote
        const form = document.getElementById('invoiceForm');
        if (form.dataset.quoteId) {
            invoice.quoteId = parseInt(form.dataset.quoteId);
            
            // Update the associated quote status to "invoiced"
            const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
            const quoteIndex = quotes.findIndex(q => q.id === invoice.quoteId);
            if (quoteIndex !== -1) {
                quotes[quoteIndex].status = 'invoiced';
                saveToStorage(STORAGE_KEYS.QUOTES, quotes);
                console.log('Quote status updated to invoiced');
            }
            
            // Clear the quote ID from the form
            delete form.dataset.quoteId;
            delete form.dataset.generatedFromQuote;
        }
        
        const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
        invoices.push(invoice);
        saveToStorage(STORAGE_KEYS.INVOICES, invoices);
        
        console.log('Invoice saved to storage');
        
        alert('Invoice saved successfully! Click "Download Invoice PDF" to generate the PDF.');
        
        // Reset form and calculations
        resetForm('invoiceForm');
        resetItemRows('invoiceItems');
        document.getElementById('invDiscount').value = 0;
        calculateInvoice();
        
        updateDashboard();
        loadTransactions();
        generateInvoiceNumber();
        
        console.log('=== INVOICE SAVE COMPLETE ===');
    } catch (error) {
        console.error('=== INVOICE SAVE ERROR ===');
        console.error('Error:', error);
        alert('Error saving invoice: ' + error.message);
    }
}

function getInvoiceItems() {
    const items = [];
    document.querySelectorAll('#invoiceItems .item-row').forEach(row => {
        items.push({
            description: row.querySelector('.item-desc').value,
            quantity: parseFloat(row.querySelector('.item-qty').value),
            price: parseFloat(row.querySelector('.item-price').value)
        });
    });
    return items;
}

function generateInvoiceNumber() {
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const number = 'INV' + String(invoices.length + 1).padStart(4, '0');
    document.getElementById('invoiceNumber').value = number;
}

// Common Functions
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function focusFirstInvalid(form) {
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    if (!form.checkValidity()) {
        form.reportValidity();
        focusFirstInvalid(form);
        return false;
    }
    return true;
}

function resetItemRows(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="item-row">
            <input type="text" placeholder="Description" class="item-desc" required>
            <input type="number" placeholder="Quantity" class="item-qty" min="1" value="1" required>
            <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" required>
            <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
        </div>
    `;
}

function removeItem(button) {
    const itemRow = button.parentElement;
    const container = itemRow.parentElement;
    
    // Don't remove if it's the last item
    if (container.children.length > 1) {
        itemRow.remove();
        
        // Recalculate based on which form
        if (container.id === 'quoteItems') {
            calculateQuote();
        } else {
            calculateInvoice();
        }
    } else {
        alert('At least one item is required');
    }
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.reset();

    if (formId === 'quoteForm') {
        resetItemRows('quoteItems');
        const quoteDate = document.getElementById('quoteDate');
        if (quoteDate) quoteDate.value = getTodayString();
        calculateQuote();
        generateQuoteNumber();
    } else if (formId === 'invoiceForm') {
        resetItemRows('invoiceItems');
        const invoiceDate = document.getElementById('invoiceDate');
        if (invoiceDate) invoiceDate.value = getTodayString();
        const approvedSelect = document.getElementById('approvedQuoteSelect');
        if (approvedSelect) approvedSelect.value = '';
        delete form.dataset.quoteId;
        delete form.dataset.generatedFromQuote;
        calculateInvoice();
        generateInvoiceNumber();
    } else if (formId === 'expenseForm') {
        const expenseDate = document.getElementById('expenseDate');
        if (expenseDate) expenseDate.value = getTodayString();
    }
}

// PDF Generation
function downloadQuotePDF() {
    console.log('=== DOWNLOADING QUOTE PDF ===');
    try {
        if (!validateForm('quoteForm')) {
            return;
        }
        if (!window.jspdf) {
            console.error('jsPDF library not loaded!');
            alert('PDF library is not loaded. Please refresh the page.');
            return;
        }
        
        console.log('jsPDF available:', typeof window.jspdf);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
    // Add logo
    doc.setFillColor(255, 138, 0);
    doc.circle(30, 15, 8, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.circle(45, 15, 8);
    
    // Company name
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text('BURN PRODUCTIONS', 55, 18);
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text('QUOTE', 105, 35, { align: 'center' });
    
    // Quote details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Quote #: ${document.getElementById('quoteNumber').value}`, 20, 50);
    doc.text(`Date: ${document.getElementById('quoteDate').value}`, 20, 55);
    doc.text(`Valid Until: ${document.getElementById('quoteValidUntil').value}`, 20, 60);
    
    // Business info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('From:', 20, 75);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(document.getElementById('quoteBizName').value, 20, 82);
    doc.text(document.getElementById('quoteBizEmail').value, 20, 87);
    doc.text(document.getElementById('quoteBizPhone').value, 20, 92);
    
    // Client info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 120, 75);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(document.getElementById('quoteClientName').value, 120, 82);
    doc.text(document.getElementById('quoteClientEmail').value, 120, 87);
    doc.text(document.getElementById('quoteClientPhone').value, 120, 92);
    
    // Items table
    const items = getQuoteItems();
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.quantity * item.price)
    ]);
    
    doc.autoTable({
        startY: 105,
        head: [['Description', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'striped'
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Subtotal: ${document.getElementById('quoteSubtotal').textContent}`, 140, finalY);
    doc.text(`Discount: ${document.getElementById('quoteDiscountAmount').textContent}`, 140, finalY + 7);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Total: ${document.getElementById('quoteTotal').textContent}`, 140, finalY + 14);
    
    // Notes
    if (document.getElementById('quoteNotes').value) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Notes:', 20, finalY + 28);
        const notes = doc.splitTextToSize(document.getElementById('quoteNotes').value, 170);
        doc.text(notes, 20, finalY + 35);
    }
    
    const quoteNumber = document.getElementById('quoteNumber').value;
    console.log('Saving PDF with quote number:', quoteNumber);
    doc.save(`Quote_${quoteNumber}.pdf`);
    console.log('=== QUOTE PDF DOWNLOAD COMPLETE ===');
    } catch (error) {
        console.error('=== QUOTE PDF ERROR ===');
        console.error('Error:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

function downloadInvoicePDF() {
    console.log('=== DOWNLOADING INVOICE PDF ===');
    try {
        if (!validateForm('invoiceForm')) {
            return;
        }
        if (!window.jspdf) {
            console.error('jsPDF library not loaded!');
            alert('PDF library is not loaded. Please refresh the page.');
            return;
        }
        
        console.log('jsPDF available:', typeof window.jspdf);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
    // Add logo
    doc.setFillColor(255, 138, 0);
    doc.circle(30, 15, 8, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.circle(45, 15, 8);
    
    // Company name
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text('BURN PRODUCTIONS', 55, 18);
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text('INVOICE', 105, 35, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${document.getElementById('invoiceNumber').value}`, 20, 50);
    doc.text(`Date: ${document.getElementById('invoiceDate').value}`, 20, 55);
    doc.text(`Due Date: ${document.getElementById('invoiceDueDate').value}`, 20, 60);
    doc.text(`Status: ${document.getElementById('invoiceStatus').value.toUpperCase()}`, 20, 65);
    
    // Business info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('From:', 20, 80);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(document.getElementById('invBizName').value, 20, 87);
    doc.text(document.getElementById('invBizEmail').value, 20, 92);
    doc.text(document.getElementById('invBizPhone').value, 20, 97);
    
    // Client info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 120, 80);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(document.getElementById('invClientName').value, 120, 87);
    doc.text(document.getElementById('invClientEmail').value, 120, 92);
    doc.text(document.getElementById('invClientPhone').value, 120, 97);
    
    // Items table
    const items = getInvoiceItems();
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.price),
        formatCurrency(item.quantity * item.price)
    ]);
    
    doc.autoTable({
        startY: 110,
        head: [['Description', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'striped'
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Subtotal: ${document.getElementById('invSubtotal').textContent}`, 140, finalY);
    doc.text(`Discount: ${document.getElementById('invDiscountAmount').textContent}`, 140, finalY + 7);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Total: ${document.getElementById('invTotal').textContent}`, 140, finalY + 14);
    
    // Payment Terms
    if (document.getElementById('invNotes').value) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Payment Terms:', 20, finalY + 28);
        const notes = doc.splitTextToSize(document.getElementById('invNotes').value, 170);
        doc.text(notes, 20, finalY + 35);
    }
    
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    console.log('Saving PDF with invoice number:', invoiceNumber);
    doc.save(`Invoice_${invoiceNumber}.pdf`);
    console.log('=== INVOICE PDF DOWNLOAD COMPLETE ===');
    } catch (error) {
        console.error('=== INVOICE PDF ERROR ===');
        console.error('Error:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

// Transactions
function loadTransactions() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    const allTransactions = [...quotes, ...invoices, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayTransactions(allTransactions);
    updateTransactionSummary(allTransactions);
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No transactions found</td></tr>';
        return;
    }
    
    transactions.forEach(trans => {
        const row = document.createElement('tr');
        let actionButtons = `
            <button class="action-btn" onclick="viewTransaction(${trans.id})">View</button>
            <button class="action-btn danger" onclick="deleteTransaction(${trans.id}, '${trans.type}')">Delete</button>
        `;
        
        // Add Generate Invoice button for approved quotes
        if (trans.type === 'quote' && trans.status === 'approved') {
            actionButtons = `
                <button class="action-btn" onclick="generateInvoiceFromQuote(${trans.id})">Generate Invoice</button>
                <button class="action-btn" onclick="viewTransaction(${trans.id})">View</button>
                <button class="action-btn danger" onclick="deleteTransaction(${trans.id}, '${trans.type}')">Delete</button>
            `;
        }
        
        // Add Pay Now button for pending invoices
        if (trans.type === 'invoice' && trans.status === 'pending') {
            actionButtons = `
                <button class="action-btn" style="background: #10b981;" onclick="updateInvoiceStatus(${trans.id}, 'paid')">Mark Paid</button>
                <button class="action-btn" onclick="viewTransaction(${trans.id})">View</button>
                <button class="action-btn danger" onclick="deleteTransaction(${trans.id}, '${trans.type}')">Delete</button>
            `;
        }
        
        // Add View button for invoiced quotes and paid invoices
        if ((trans.type === 'quote' && trans.status === 'invoiced') || (trans.type === 'invoice' && trans.status === 'paid')) {
            actionButtons = `
                <button class="action-btn" onclick="viewTransaction(${trans.id})">View</button>
                <button class="action-btn danger" onclick="deleteTransaction(${trans.id}, '${trans.type}')">Delete</button>
            `;
        }
        
        // Handle expenses differently
        if (trans.type === 'expense') {
            const clientName = trans.vendor || 'N/A';
            const dueDate = trans.dueDate || '-';
            const amount = trans.amount || 0;
            
            actionButtons = `
                <button class="action-btn" style="background: #10b981;" onclick="updateExpenseStatus(${trans.id}, 'paid')">Mark Paid</button>
                <button class="action-btn danger" onclick="deleteExpense(${trans.id})">Delete</button>
            `;
            
            row.innerHTML = `
                <td><span class="status-badge">${trans.type.toUpperCase()}</span></td>
                <td>${trans.description || 'Expense'}</td>
                <td>${clientName}</td>
                <td>${formatDate(trans.date)}</td>
                <td>${dueDate}</td>
                <td>${formatCurrency(amount)}</td>
                <td><span class="status-badge status-${trans.status}">${trans.status.toUpperCase()}</span></td>
                <td>${actionButtons}</td>
            `;
        } else {
            // For quotes and invoices
            row.innerHTML = `
                <td><span class="status-badge">${trans.type.toUpperCase()}</span></td>
                <td>${trans.number}</td>
                <td>${trans.clientInfo.name}</td>
                <td>${formatDate(trans.date)}</td>
                <td>${trans.dueDate ? formatDate(trans.dueDate) : trans.validUntil ? formatDate(trans.validUntil) : '-'}</td>
                <td>${formatCurrency(trans.total)}</td>
                <td><span class="status-badge status-${trans.status}">${trans.status.toUpperCase()}</span></td>
                <td>${actionButtons}</td>
            `;
        }
        tbody.appendChild(row);
    });
}

function updateTransactionSummary(transactions) {
    const invoices = transactions.filter(t => t.type === 'invoice');
    const quotes = transactions.filter(t => t.type === 'quote' && t.status !== 'invoiced' && t.status !== 'rejected'); // Exclude invoiced and rejected quotes
    const expenses = transactions.filter(t => t.type === 'expense');
    const allDocuments = [...invoices, ...quotes];
    
    // Total Income from PAID invoices only
    const totalIncome = invoices.reduce((sum, inv) => 
        inv.status === 'paid' ? sum + inv.total : sum, 0);
    
    // Outstanding = pending invoices + pending quotes (not invoiced or rejected ones)
    const pendingInvoices = invoices.reduce((sum, inv) => 
        inv.status === 'pending' ? sum + inv.total : sum, 0);
    const totalQuotes = quotes.reduce((sum, q) => sum + q.total, 0);
    const outstanding = pendingInvoices + totalQuotes;
    
    // Total potential revenue (all non-deleted, non-invoiced transactions)
    const totalPotentialRevenue = allDocuments.reduce((sum, doc) => sum + doc.total, 0);
    
    // Total Expenses - sum of all expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Net Profit from paid transactions only minus expenses
    const netProfit = totalIncome - totalExpenses;
    
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('netProfit').textContent = formatCurrency(netProfit);
    document.getElementById('outstanding').textContent = formatCurrency(outstanding);
}

function applyFilters() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    let allTransactions = [...quotes, ...invoices];
    
    const typeFilter = document.getElementById('filterType').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    // Apply filters
    if (typeFilter !== 'all') {
        allTransactions = allTransactions.filter(t => t.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
        allTransactions = allTransactions.filter(t => t.status === statusFilter);
    }
    
    if (dateFrom) {
        allTransactions = allTransactions.filter(t => new Date(t.date) >= new Date(dateFrom));
    }
    
    if (dateTo) {
        allTransactions = allTransactions.filter(t => new Date(t.date) <= new Date(dateTo));
    }
    
    displayTransactions(allTransactions);
}

function clearFilters() {
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    loadTransactions();
}

function viewTransaction(id) {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const transaction = [...quotes, ...invoices].find(t => t.id === id);
    
    if (!transaction) return;
    
    downloadDocumentPDF(id, transaction.type);
}

function deleteTransaction(id, type) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    const key = type === 'quote' ? STORAGE_KEYS.QUOTES : STORAGE_KEYS.INVOICES;
    let items = getFromStorage(key) || [];
    items = items.filter(item => item.id !== id);
    saveToStorage(key, items);
    
    loadTransactions();
    updateDashboard();
    alert('Transaction deleted successfully!');
}

function exportTransactionsCSV() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const allTransactions = [...quotes, ...invoices];
    
    let csv = 'Type,Number,Client,Date,Due Date,Amount,Status\n';
    
    allTransactions.forEach(trans => {
        csv += `${trans.type},${trans.number},${trans.clientInfo.name},${trans.date},${trans.dueDate || trans.validUntil || '-'},${trans.total},${trans.status}\n`;
    });
    
    downloadFile(csv, 'transactions.csv', 'text/csv');
}

function exportTransactionsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const allTransactions = [...quotes, ...invoices];
    
    doc.setFontSize(18);
    doc.text('Transactions Report', 105, 15, { align: 'center' });
    
    const tableData = allTransactions.map(trans => [
        trans.type.toUpperCase(),
        trans.number,
        trans.clientInfo.name,
        formatDate(trans.date),
        formatCurrency(trans.total),
        trans.status.toUpperCase()
    ]);
    
    doc.autoTable({
        startY: 25,
        head: [['Type', 'Number', 'Client', 'Date', 'Amount', 'Status']],
        body: tableData,
        theme: 'grid'
    });
    
    doc.save('transactions_report.pdf');
}

// Documents
function loadDocuments() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const allDocuments = [...quotes, ...invoices].sort((a, b) => b.id - a.id);
    
    const grid = document.getElementById('documentsGrid');
    grid.innerHTML = '';
    
    if (allDocuments.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No documents found</p>';
        return;
    }
    
    allDocuments.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'document-card';
        
        let statusButtons = '';
        if (doc.type === 'quote') {
            statusButtons = `
                <div class="document-status-buttons">
                    <button class="status-btn approve" onclick="updateQuoteStatus(${doc.id}, 'approved')" title="Approve quote">✓ Approve</button>
                    <button class="status-btn reject" onclick="updateQuoteStatus(${doc.id}, 'rejected')" title="Reject quote">✗ Reject</button>
                    <button class="status-btn pending" onclick="updateQuoteStatus(${doc.id}, 'pending')" title="Reset to pending">↻ Pending</button>
                </div>
            `;
        }
        
        card.innerHTML = `
            <h3>${doc.number}</h3>
            <div class="document-meta">
                <p><strong>Type:</strong> ${doc.type.toUpperCase()}</p>
                <p><strong>Client:</strong> ${doc.clientInfo.name}</p>
                <p><strong>Date:</strong> ${formatDate(doc.date)}</p>
                <p><strong>Amount:</strong> ${formatCurrency(doc.total)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${doc.status}">${doc.status.toUpperCase()}</span></p>
            </div>
            ${statusButtons}
            <div class="document-actions">
                <button class="btn btn-primary" onclick="downloadDocumentPDF(${doc.id}, '${doc.type}')">Download PDF</button>
                <button class="btn btn-secondary danger" onclick="deleteTransaction(${doc.id}, '${doc.type}')">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterDocuments() {
    const search = document.getElementById('searchDocuments').value.toLowerCase();
    const typeFilter = document.getElementById('documentTypeFilter').value;
    
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    let allDocuments = [...quotes, ...invoices];
    
    if (typeFilter !== 'all') {
        allDocuments = allDocuments.filter(doc => doc.type === typeFilter);
    }
    
    if (search) {
        allDocuments = allDocuments.filter(doc => 
            doc.number.toLowerCase().includes(search) ||
            doc.clientInfo.name.toLowerCase().includes(search)
        );
    }
    
    const grid = document.getElementById('documentsGrid');
    grid.innerHTML = '';
    
    allDocuments.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'document-card';
        
        let statusButtons = '';
        if (doc.type === 'quote') {
            statusButtons = `
                <div class="document-status-buttons">
                    <button class="status-btn approve" onclick="updateQuoteStatus(${doc.id}, 'approved')" title="Approve quote">✓ Approve</button>
                    <button class="status-btn reject" onclick="updateQuoteStatus(${doc.id}, 'rejected')" title="Reject quote">✗ Reject</button>
                    <button class="status-btn pending" onclick="updateQuoteStatus(${doc.id}, 'pending')" title="Reset to pending">↻ Pending</button>
                </div>
            `;
        }
        
        card.innerHTML = `
            <h3>${doc.number}</h3>
            <div class="document-meta">
                <p><strong>Type:</strong> ${doc.type.toUpperCase()}</p>
                <p><strong>Client:</strong> ${doc.clientInfo.name}</p>
                <p><strong>Date:</strong> ${formatDate(doc.date)}</p>
                <p><strong>Amount:</strong> ${formatCurrency(doc.total)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${doc.status}">${doc.status.toUpperCase()}</span></p>
            </div>
            ${statusButtons}
            <div class="document-actions">
                <button class="btn btn-primary" onclick="downloadDocumentPDF(${doc.id}, '${doc.type}')">Download PDF</button>
                <button class="btn btn-secondary danger" onclick="deleteTransaction(${doc.id}, '${doc.type}')">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function downloadDocumentPDF(id, type) {
    const key = type === 'quote' ? STORAGE_KEYS.QUOTES : STORAGE_KEYS.INVOICES;
    const items = getFromStorage(key) || [];
    const doc = items.find(item => item.id === id);
    
    if (!doc) return;
    
    // Populate the form with document data
    if (type === 'quote') {
        document.getElementById('quoteNumber').value = doc.number;
        document.getElementById('quoteDate').value = doc.date;
        document.getElementById('quoteValidUntil').value = doc.validUntil;
        document.getElementById('quoteBizName').value = doc.businessInfo.name;
        document.getElementById('quoteBizEmail').value = doc.businessInfo.email;
        document.getElementById('quoteBizPhone').value = doc.businessInfo.phone;
        document.getElementById('quoteBizAddress').value = doc.businessInfo.address;
        document.getElementById('quoteClientName').value = doc.clientInfo.name;
        document.getElementById('quoteClientEmail').value = doc.clientInfo.email;
        document.getElementById('quoteClientPhone').value = doc.clientInfo.phone;
        document.getElementById('quoteClientAddress').value = doc.clientInfo.address;
        document.getElementById('quoteDiscount').value = doc.discount;
        document.getElementById('quoteNotes').value = doc.notes;
        
        // Populate items
        const container = document.getElementById('quoteItems');
        container.innerHTML = '';
        doc.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <input type="text" placeholder="Description" class="item-desc" value="${item.description}" required>
                <input type="number" placeholder="Quantity" class="item-qty" min="1" value="${item.quantity}" required>
                <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" value="${item.price}" required>
                <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
            `;
            container.appendChild(row);
        });
        
        calculateQuote();
        downloadQuotePDF();
    } else {
        document.getElementById('invoiceNumber').value = doc.number;
        document.getElementById('invoiceDate').value = doc.date;
        document.getElementById('invoiceDueDate').value = doc.dueDate;
        document.getElementById('invoiceStatus').value = doc.status;
        document.getElementById('invBizName').value = doc.businessInfo.name;
        document.getElementById('invBizEmail').value = doc.businessInfo.email;
        document.getElementById('invBizPhone').value = doc.businessInfo.phone;
        document.getElementById('invBizAddress').value = doc.businessInfo.address;
        document.getElementById('invClientName').value = doc.clientInfo.name;
        document.getElementById('invClientEmail').value = doc.clientInfo.email;
        document.getElementById('invClientPhone').value = doc.clientInfo.phone;
        document.getElementById('invClientAddress').value = doc.clientInfo.address;
        document.getElementById('invDiscount').value = doc.discount;
        document.getElementById('invNotes').value = doc.notes;
        
        // Populate items
        const container = document.getElementById('invoiceItems');
        container.innerHTML = '';
        doc.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <input type="text" placeholder="Description" class="item-desc" value="${item.description}" required>
                <input type="number" placeholder="Quantity" class="item-qty" min="1" value="${item.quantity}" required>
                <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" value="${item.price}" required>
                <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
            `;
            container.appendChild(row);
        });
        
        calculateInvoice();
        downloadInvoicePDF();
    }
}

// Dashboard
function updateDashboard() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    
    document.getElementById('totalQuotes').textContent = quotes.length;
    document.getElementById('totalInvoices').textContent = invoices.length;
    
    const totalRevenue = invoices.reduce((sum, inv) => 
        inv.status === 'paid' ? sum + inv.total : sum, 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    
    const pendingPayments = invoices.reduce((sum, inv) => 
        inv.status === 'pending' ? sum + inv.total : sum, 0);
    document.getElementById('pendingPayments').textContent = formatCurrency(pendingPayments);
}

// Utility Functions
function formatCurrency(amount) {
    return 'R ' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Generate Invoice from Quote
// Generate Invoice from Quote
function generateInvoiceFromQuote(quoteId) {
    // Get all quotes from storage
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const quote = quotes.find(q => q.id === quoteId);
    
    if (!quote) {
        alert('Quote not found');
        return;
    }
    
    // Populate business info from quote
    document.getElementById('invBizName').value = quote.businessInfo.name;
    document.getElementById('invBizEmail').value = quote.businessInfo.email;
    document.getElementById('invBizPhone').value = quote.businessInfo.phone;
    document.getElementById('invBizAddress').value = quote.businessInfo.address;
    
    // Populate invoice form with quote data
    document.getElementById('invClientName').value = quote.clientInfo.name;
    document.getElementById('invClientEmail').value = quote.clientInfo.email;
    document.getElementById('invClientPhone').value = quote.clientInfo.phone;
    document.getElementById('invClientAddress').value = quote.clientInfo.address;
    
    // Clear existing items and add quote items
    const invoiceItemsContainer = document.getElementById('invoiceItems');
    invoiceItemsContainer.innerHTML = '';
    
    // Add each quote item to invoice
    quote.items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <input type="text" placeholder="Description" value="${item.description}" class="item-desc" required>
            <input type="number" placeholder="Quantity" value="${item.quantity}" class="item-qty" min="1" required>
            <input type="number" placeholder="Price" value="${item.price}" class="item-price" step="0.01" min="0" required>
            <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
        `;
        invoiceItemsContainer.appendChild(itemRow);
    });
    
    // Copy discount and calculate
    document.getElementById('invDiscount').value = quote.discount || 0;
    
    // Set invoice date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    // Store quote ID for reference when saving
    document.getElementById('invoiceForm').dataset.quoteId = quoteId;
    document.getElementById('invoiceForm').dataset.generatedFromQuote = 'true';
    
    // Calculate and display
    calculateInvoice();
    
    // Navigate to invoices page
    navigateTo('invoices');
    
    // Show success message
    alert('Invoice created from quote. Please review and save.');
}

// Update Quote Status
function updateQuoteStatus(quoteId, newStatus) {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) {
        alert('Quote not found');
        return;
    }
    
    const oldStatus = quotes[quoteIndex].status;
    quotes[quoteIndex].status = newStatus;
    
    saveToStorage(STORAGE_KEYS.QUOTES, quotes);
    loadDocuments();
    loadApprovedQuotes();
    loadTransactions();
    alert(`Quote status updated from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`);
}

// Update Invoice Status
function updateInvoiceStatus(invoiceId, newStatus) {
    const invoices = getFromStorage('business_invoices') || [];
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) {
        alert('Invoice not found');
        return;
    }
    
    const oldStatus = invoices[invoiceIndex].status;
    invoices[invoiceIndex].status = newStatus;
    
    // Save updated invoices
    saveToStorage('business_invoices', invoices);
    
    // Refresh transactions display
    loadTransactions();
    
    // Show success message
    alert(`Invoice status updated from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`);
}

// Expense Functions
function saveExpense() {
    if (!validateForm('expenseForm')) {
        return;
    }
    const expense = {
        id: Date.now(),
        type: 'expense',
        date: document.getElementById('expenseDate').value,
        dueDate: document.getElementById('expenseDueDate').value,
        vendor: document.getElementById('expenseVendor').value,
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        status: document.getElementById('expenseStatus').value,
        notes: document.getElementById('expenseNotes').value
    };
    
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    expenses.push(expense);
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    
    alert('Expense saved successfully!');
    loadExpenses();
    updateDashboard();
    loadTransactions();
    document.getElementById('expenseForm').reset();
    const today = getTodayString();
    document.getElementById('expenseDate').value = today;
}

function loadExpenses() {
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    displayExpenses(expenses);
    updateExpenseSummary(expenses);
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        let statusColor = 'status-unpaid';
        if (expense.status === 'paid') statusColor = 'status-paid';
        if (expense.status === 'overdue') statusColor = 'status-overdue';
        if (expense.status === 'cancelled') statusColor = 'status-cancelled';
        
        row.innerHTML = `
            <td>${expense.vendor}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>${formatDate(expense.date)}</td>
            <td>${expense.dueDate ? formatDate(expense.dueDate) : '-'}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td><span class="status-badge ${statusColor}">${expense.status.toUpperCase()}</span></td>
            <td>
                <button class="action-btn" onclick="updateExpenseStatus(${expense.id}, 'paid')">Mark Paid</button>
                <button class="action-btn danger" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateExpenseSummary(expenses) {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const paidExpenses = expenses.reduce((sum, exp) => exp.status === 'paid' ? sum + exp.amount : sum, 0);
    const unpaidExpenses = expenses.reduce((sum, exp) => exp.status === 'unpaid' ? sum + exp.amount : sum, 0);
    const overdueExpenses = expenses.reduce((sum, exp) => exp.status === 'overdue' ? sum + exp.amount : sum, 0);
    
    const totalEl = document.getElementById('expensesTotal');
    const paidEl = document.getElementById('expensesPaid');
    const unpaidEl = document.getElementById('expensesUnpaid');
    const overdueEl = document.getElementById('expensesOverdue');
    
    if (totalEl) totalEl.textContent = formatCurrency(totalExpenses);
    if (paidEl) paidEl.textContent = formatCurrency(paidExpenses);
    if (unpaidEl) unpaidEl.textContent = formatCurrency(unpaidExpenses);
    if (overdueEl) overdueEl.textContent = formatCurrency(overdueExpenses);
}

function updateExpenseStatus(expenseId, newStatus) {
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
    
    if (expenseIndex === -1) {
        alert('Expense not found');
        return;
    }
    
    const oldStatus = expenses[expenseIndex].status;
    expenses[expenseIndex].status = newStatus;
    
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    loadExpenses();
    updateDashboard();
    loadTransactions();
    alert(`Expense status updated from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`);
}

function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
        const filteredExpenses = expenses.filter(exp => exp.id !== expenseId);
        saveToStorage(STORAGE_KEYS.EXPENSES, filteredExpenses);
        loadExpenses();
        updateDashboard();
        loadTransactions();
    }
}

// Load Approved Quotes for Invoice Dropdown
function loadApprovedQuotes() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    // Only show approved quotes that haven't been invoiced yet
    const approvedQuotes = quotes.filter(q => q.status === 'approved');
    
    const selectElement = document.getElementById('approvedQuoteSelect');
    if (!selectElement) return;
    
    // Clear existing options except the first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Add approved quotes
    approvedQuotes.forEach(quote => {
        const option = document.createElement('option');
        option.value = quote.id;
        option.textContent = `${quote.number} - ${quote.clientInfo.name} (${formatCurrency(quote.total)})`;
        selectElement.appendChild(option);
    });
}

function populateFromApprovedQuote() {
    const selectElement = document.getElementById('approvedQuoteSelect');
    const quoteId = parseInt(selectElement.value);
    
    if (!quoteId) return;
    
    // Find the quote
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const quote = quotes.find(q => q.id === quoteId);
    
    if (!quote) {
        alert('Quote not found');
        return;
    }
    
    // Populate business info from quote
    document.getElementById('invBizName').value = quote.businessInfo.name;
    document.getElementById('invBizEmail').value = quote.businessInfo.email;
    document.getElementById('invBizPhone').value = quote.businessInfo.phone;
    document.getElementById('invBizAddress').value = quote.businessInfo.address;
    
    // Populate invoice form with quote data
    document.getElementById('invClientName').value = quote.clientInfo.name;
    document.getElementById('invClientEmail').value = quote.clientInfo.email;
    document.getElementById('invClientPhone').value = quote.clientInfo.phone;
    document.getElementById('invClientAddress').value = quote.clientInfo.address;
    
    // Set discount from quote
    document.getElementById('invDiscount').value = quote.discount || 0;
    
    // Clear existing items and add quote items
    const invoiceItemsContainer = document.getElementById('invoiceItems');
    invoiceItemsContainer.innerHTML = '';
    
    quote.items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <input type="text" placeholder="Description" value="${item.description}" class="item-desc" required>
            <input type="number" placeholder="Quantity" value="${item.quantity}" class="item-qty" min="1" required>
            <input type="number" placeholder="Price" value="${item.price}" class="item-price" step="0.01" min="0" required>
            <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
        `;
        invoiceItemsContainer.appendChild(itemRow);
        
        // Add event listeners for calculations
        const qtyInput = itemRow.querySelector('.item-qty');
        const priceInput = itemRow.querySelector('.item-price');
        if (qtyInput) {
            qtyInput.addEventListener('input', calculateInvoice);
            qtyInput.addEventListener('change', calculateInvoice);
        }
        if (priceInput) {
            priceInput.addEventListener('input', calculateInvoice);
            priceInput.addEventListener('change', calculateInvoice);
        }
    });
    
    // Store the quote ID for later reference
    const form = document.getElementById('invoiceForm');
    form.dataset.quoteId = quote.id;
    form.dataset.generatedFromQuote = 'true';
    
    // Calculate totals
    calculateInvoice();
}

// ====== GLOBAL FUNCTION EXPORTS ======
// Ensure all key functions are accessible from HTML onclick attributes
window.navigateTo = navigateTo;
window.addQuoteItem = addQuoteItem;
window.removeItem = removeItem;
window.saveQuote = saveQuote;
window.saveInvoice = saveInvoice;
window.addInvoiceItem = addInvoiceItem;
window.calculateQuote = calculateQuote;
window.calculateInvoice = calculateInvoice;
window.downloadQuotePDF = downloadQuotePDF;
window.downloadInvoicePDF = downloadInvoicePDF;
window.resetForm = resetForm;
window.generateInvoiceFromQuote = generateInvoiceFromQuote;
window.saveExpense = saveExpense;
window.populateFromApprovedQuote = populateFromApprovedQuote;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.exportTransactionsCSV = exportTransactionsCSV;
window.exportTransactionsPDF = exportTransactionsPDF;
window.filterDocuments = filterDocuments;
window.downloadDocumentPDF = downloadDocumentPDF;
window.updateQuoteStatus = updateQuoteStatus;
window.updateInvoiceStatus = updateInvoiceStatus;
window.updateExpenseStatus = updateExpenseStatus;
window.deleteExpense = deleteExpense;
window.deleteTransaction = deleteTransaction;
window.viewTransaction = viewTransaction;

console.log('=== GLOBAL FUNCTIONS EXPORTED ===');
console.log('navigateTo:', typeof window.navigateTo);
console.log('saveQuote:', typeof window.saveQuote);
console.log('saveInvoice:', typeof window.saveInvoice);
console.log('downloadQuotePDF:', typeof window.downloadQuotePDF);
console.log('downloadInvoicePDF:', typeof window.downloadInvoicePDF);
