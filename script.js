// Storage Keys
const STORAGE_KEYS = {
    QUOTES: 'business_quotes',
    INVOICES: 'business_invoices',
    EXPENSES: 'business_expenses',
    BUSINESS_INFO: 'business_info'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateDashboard();
    loadTransactions();
    loadDocuments();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
    document.getElementById('invoiceDate').value = today;
    setExpenseDefaultDates();
    
    // Generate initial document numbers
    generateQuoteNumber();
    generateInvoiceNumber();
    generateExpenseNumber();
    updateApprovedQuoteSelect();
});

// Initialize App
function initializeApp() {
    // Show home page by default
    navigateTo('home');
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
            
            // Close mobile menu
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Real-time calculations for quotes
    const quoteForm = document.getElementById('quoteForm');
    quoteForm.addEventListener('input', () => calculateQuote());
    
    // Real-time calculations for invoices
    const invoiceForm = document.getElementById('invoiceForm');
    invoiceForm.addEventListener('input', () => calculateInvoice());

    // Real-time calculations for expenses
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('input', () => calculateExpense());
    }

    const approvedQuoteSelect = document.getElementById('approvedQuoteSelect');
    if (approvedQuoteSelect) {
        approvedQuoteSelect.addEventListener('change', handleApprovedQuoteSelect);
    }
}

// Navigation
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    document.getElementById(page + '-page').classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
    
    // Update page-specific content
    if (page === 'transactions') {
        loadTransactions();
    } else if (page === 'expenses') {
        loadExpenses();
    } else if (page === 'documents') {
        loadDocuments();
    }
}

// Quote Management
function addQuoteItem() {
    const container = document.getElementById('quoteItems');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" placeholder="Description" class="item-desc" required>
        <input type="number" placeholder="Quantity" class="item-qty" min="1" value="1" required>
        <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" required>
        <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(newItem);
    calculateQuote();
}

function calculateQuote() {
    const items = document.querySelectorAll('#quoteItems .item-row');
    let subtotal = 0;
    
    items.forEach(item => {
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        
        const itemTotal = qty * price;
        subtotal += itemTotal;
    });
    
    const discount = parseFloat(document.getElementById('quoteDiscount').value) || 0;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    document.getElementById('quoteSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('quoteDiscountAmount').textContent = formatCurrency(discountAmount);
    document.getElementById('quoteTotal').textContent = formatCurrency(total);
}

function saveQuote() {
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
    
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    quotes.push(quote);
    saveToStorage(STORAGE_KEYS.QUOTES, quotes);
    
    alert('Quote saved successfully!');
    updateDashboard();
    generateQuoteNumber();
    updateApprovedQuoteSelect();
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
    const container = document.getElementById('invoiceItems');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" placeholder="Description" class="item-desc" required>
        <input type="number" placeholder="Quantity" class="item-qty" min="1" value="1" required>
        <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" required>
        <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
    `;
    container.appendChild(newItem);
    calculateInvoice();
}

function calculateInvoice() {
    const items = document.querySelectorAll('#invoiceItems .item-row');
    let subtotal = 0;
    
    items.forEach(item => {
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        
        const itemTotal = qty * price;
        subtotal += itemTotal;
    });
    
    const discount = parseFloat(document.getElementById('invDiscount').value) || 0;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    document.getElementById('invSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('invDiscountAmount').textContent = formatCurrency(discountAmount);
    document.getElementById('invTotal').textContent = formatCurrency(total);
}

function saveInvoice() {
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
    
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    invoices.push(invoice);
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
    
    alert('Invoice saved successfully!');
    updateDashboard();
    generateInvoiceNumber();
    const approvedQuoteSelect = document.getElementById('approvedQuoteSelect');
    if (approvedQuoteSelect) {
        approvedQuoteSelect.value = '';
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

// Expense Management
function setExpenseDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
    document.getElementById('expenseDueDate').value = today;
}

function createExpenseItemRow() {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" placeholder="Description" class="item-desc" required>
        <input type="number" placeholder="Quantity" class="item-qty" min="1" value="1" required>
        <input type="number" placeholder="Price" class="item-price" step="0.01" min="0" required>
        <button type="button" class="btn-remove" onclick="removeItem(this)">×</button>
    `;
    return row;
}

function addExpenseItem() {
    const container = document.getElementById('expenseItems');
    const newItem = createExpenseItemRow();
    container.appendChild(newItem);
    calculateExpense();
}

function calculateExpense() {
    const items = document.querySelectorAll('#expenseItems .item-row');
    let subtotal = 0;
    
    items.forEach(item => {
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        subtotal += qty * price;
    });
    
    document.getElementById('expenseSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('expenseTotal').textContent = formatCurrency(subtotal);
}

function saveExpense() {
    const expense = {
        id: Date.now(),
        type: 'expense',
        number: document.getElementById('expenseNumber').value,
        date: document.getElementById('expenseDate').value,
        dueDate: document.getElementById('expenseDueDate').value,
        status: document.getElementById('expenseStatus').value,
        vendorInfo: {
            name: document.getElementById('expenseVendorName').value,
            email: document.getElementById('expenseVendorEmail').value,
            phone: document.getElementById('expenseVendorPhone').value,
            address: document.getElementById('expenseVendorAddress').value
        },
        items: getExpenseItems(),
        notes: document.getElementById('expenseNotes').value,
        subtotal: parseFloat(document.getElementById('expenseSubtotal').textContent.replace(/[R $,]/g, '')),
        total: parseFloat(document.getElementById('expenseTotal').textContent.replace(/[R $,]/g, ''))
    };
    
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    expenses.push(expense);
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    
    alert('Expense saved successfully!');
    updateDashboard();
    generateExpenseNumber();
    resetExpenseForm();
    loadExpenses();
}

function resetExpenseForm() {
    document.getElementById('expenseVendorName').value = '';
    document.getElementById('expenseVendorEmail').value = '';
    document.getElementById('expenseVendorPhone').value = '';
    document.getElementById('expenseVendorAddress').value = '';
    setExpenseDefaultDates();
    document.getElementById('expenseStatus').value = 'unpaid';
    document.getElementById('expenseNotes').value = '';

    const container = document.getElementById('expenseItems');
    container.innerHTML = '';
    container.appendChild(createExpenseItemRow());
    calculateExpense();
}

function getExpenseItems() {
    const items = [];
    document.querySelectorAll('#expenseItems .item-row').forEach(row => {
        items.push({
            description: row.querySelector('.item-desc').value,
            quantity: parseFloat(row.querySelector('.item-qty').value),
            price: parseFloat(row.querySelector('.item-price').value)
        });
    });
    return items;
}

function generateExpenseNumber() {
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    const number = 'EXP' + String(expenses.length + 1).padStart(4, '0');
    document.getElementById('expenseNumber').value = number;
}

function loadExpenses() {
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    displayExpenses(expenses);
    updateExpenseSummary(expenses);
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesBody');
    tbody.innerHTML = '';
    
    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No expenses found</td></tr>';
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.vendorInfo.name}</td>
            <td>${expense.number}</td>
            <td>${formatDate(expense.date)}</td>
            <td>${formatDate(expense.dueDate)}</td>
            <td>${formatCurrency(expense.total)}</td>
            <td><span class="status-badge status-${expense.status}">${expense.status.toUpperCase()}</span></td>
            <td>
                <button class="action-btn danger" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateExpenseSummary(expenses) {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total, 0);
    const unpaid = expenses.reduce((sum, expense) => 
        expense.status === 'unpaid' ? sum + expense.total : sum, 0);
    const overdue = expenses.reduce((sum, expense) => 
        expense.status === 'overdue' ? sum + expense.total : sum, 0);
    const paid = expenses.reduce((sum, expense) => 
        expense.status === 'paid' ? sum + expense.total : sum, 0);
    
    const totalElement = document.getElementById('expenseTotalAmount');
    const unpaidElement = document.getElementById('expenseUnpaidTotal');
    const overdueElement = document.getElementById('expenseOverdueTotal');
    const paidElement = document.getElementById('expensePaidTotal');

    if (totalElement) {
        totalElement.textContent = formatCurrency(totalExpenses);
    }
    if (unpaidElement) {
        unpaidElement.textContent = formatCurrency(unpaid);
    }
    if (overdueElement) {
        overdueElement.textContent = formatCurrency(overdue);
    }
    if (paidElement) {
        paidElement.textContent = formatCurrency(paid);
    }
}

function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    let expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    expenses = expenses.filter(expense => expense.id !== id);
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
    
    loadExpenses();
    loadTransactions();
    updateDashboard();
    alert('Expense deleted successfully!');
}

// Approved quotes
function updateApprovedQuoteSelect() {
    const select = document.getElementById('approvedQuoteSelect');
    if (!select) {
        return;
    }
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const approvedQuotes = quotes.filter(quote => quote.status === 'approved');
    
    select.innerHTML = '<option value="">Select an approved quote (optional)</option>';
    approvedQuotes.forEach(quote => {
        const option = document.createElement('option');
        option.value = quote.id;
        option.textContent = `${quote.number} - ${quote.clientInfo.name}`;
        select.appendChild(option);
    });
}

function handleApprovedQuoteSelect(event) {
    const quoteId = parseInt(event.target.value, 10);
    if (!quoteId) {
        return;
    }
    
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const selectedQuote = quotes.find(quote => quote.id === quoteId);
    if (!selectedQuote) {
        return;
    }
    
    document.getElementById('invBizName').value = selectedQuote.businessInfo.name;
    document.getElementById('invBizEmail').value = selectedQuote.businessInfo.email;
    document.getElementById('invBizPhone').value = selectedQuote.businessInfo.phone;
    document.getElementById('invBizAddress').value = selectedQuote.businessInfo.address;
    document.getElementById('invClientName').value = selectedQuote.clientInfo.name;
    document.getElementById('invClientEmail').value = selectedQuote.clientInfo.email;
    document.getElementById('invClientPhone').value = selectedQuote.clientInfo.phone;
    document.getElementById('invClientAddress').value = selectedQuote.clientInfo.address;
    document.getElementById('invDiscount').value = selectedQuote.discount || 0;
    document.getElementById('invNotes').value = selectedQuote.notes || '';
    
    const container = document.getElementById('invoiceItems');
    container.innerHTML = '';
    selectedQuote.items.forEach(item => {
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
}

// Common Functions
function removeItem(button) {
    const itemRow = button.parentElement;
    const container = itemRow.parentElement;
    
    // Don't remove if it's the last item
    if (container.children.length > 1) {
        itemRow.remove();
        
        // Recalculate based on which form
        if (container.id === 'quoteItems') {
            calculateQuote();
        } else if (container.id === 'expenseItems') {
            calculateExpense();
        } else {
            calculateInvoice();
        }
    } else {
        alert('At least one item is required');
    }
}

function resetForm(formId) {
    document.getElementById(formId).reset();
    if (formId === 'quoteForm') {
        calculateQuote();
        generateQuoteNumber();
        updateApprovedQuoteSelect();
    } else if (formId === 'expenseForm') {
        resetExpenseForm();
        generateExpenseNumber();
    } else {
        calculateInvoice();
        generateInvoiceNumber();
    }
}

// PDF Generation
function downloadQuotePDF() {
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
    
    doc.save(`Quote_${document.getElementById('quoteNumber').value}.pdf`);
}

function downloadInvoicePDF() {
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
    
    doc.save(`Invoice_${document.getElementById('invoiceNumber').value}.pdf`);
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
        const isExpense = trans.type === 'expense';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="status-badge">${trans.type.toUpperCase()}</span></td>
            <td>${trans.number}</td>
            <td>${isExpense ? trans.vendorInfo.name : trans.clientInfo.name}</td>
            <td>${formatDate(trans.date)}</td>
            <td>${trans.dueDate ? formatDate(trans.dueDate) : trans.validUntil ? formatDate(trans.validUntil) : '-'}</td>
            <td>${formatCurrency(trans.total)}</td>
            <td><span class="status-badge status-${trans.status}">${trans.status.toUpperCase()}</span></td>
            <td>
                ${isExpense ? '' : `<button class="action-btn" onclick="viewTransaction(${trans.id})">View</button>`}
                <button class="action-btn danger" onclick="deleteTransaction(${trans.id}, '${trans.type}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateTransactionSummary(transactions) {
    const invoices = transactions.filter(t => t.type === 'invoice');
    const quotes = transactions.filter(t => t.type === 'quote');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = invoices.reduce((sum, inv) => 
        inv.status === 'paid' ? sum + inv.total : sum, 0);
    
    const outstanding = calculateTotalOutstandingAmount(invoices, quotes);
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total, 0);
    const netProfit = totalIncome - totalExpenses;
    
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('netProfit').textContent = formatCurrency(netProfit);
    document.getElementById('outstanding').textContent = formatCurrency(outstanding);
}

function applyFilters() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    let allTransactions = [...quotes, ...invoices, ...expenses];
    
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
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    const transaction = [...quotes, ...invoices, ...expenses].find(t => t.id === id);
    
    if (!transaction) return;
    
    if (transaction.type === 'expense') {
        return;
    }
    
    downloadDocumentPDF(id, transaction.type);
}

function deleteTransaction(id, type) {
    if (type === 'expense') {
        deleteExpense(id);
        return;
    }
    
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    const key = type === 'quote' ? STORAGE_KEYS.QUOTES : STORAGE_KEYS.INVOICES;
    let items = getFromStorage(key) || [];
    items = items.filter(item => item.id !== id);
    saveToStorage(key, items);
    
    loadTransactions();
    updateDashboard();
    updateApprovedQuoteSelect();
    alert('Transaction deleted successfully!');
}

function exportTransactionsCSV() {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    const allTransactions = [...quotes, ...invoices, ...expenses];
    
    let csv = 'Type,Number,Client,Date,Due Date,Amount,Status\n';
    
    allTransactions.forEach(trans => {
        const partyName = trans.type === 'expense' ? trans.vendorInfo.name : trans.clientInfo.name;
        csv += `${trans.type},${trans.number},${partyName},${trans.date},${trans.dueDate || trans.validUntil || '-'},${trans.total},${trans.status}\n`;
    });
    
    downloadFile(csv, 'transactions.csv', 'text/csv');
}

function exportTransactionsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const invoices = getFromStorage(STORAGE_KEYS.INVOICES) || [];
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    const allTransactions = [...quotes, ...invoices, ...expenses];
    
    doc.setFontSize(18);
    doc.text('Transactions Report', 105, 15, { align: 'center' });
    
    const tableData = allTransactions.map(trans => [
        trans.type.toUpperCase(),
        trans.number,
        trans.type === 'expense' ? trans.vendorInfo.name : trans.clientInfo.name,
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
        card.innerHTML = `
            <h3>${doc.number}</h3>
            ${renderQuoteStatusActions(doc)}
            <div class="document-meta">
                <p><strong>Type:</strong> ${doc.type.toUpperCase()}</p>
                <p><strong>Client:</strong> ${doc.clientInfo.name}</p>
                <p><strong>Date:</strong> ${formatDate(doc.date)}</p>
                <p><strong>Amount:</strong> ${formatCurrency(doc.total)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${doc.status}">${doc.status.toUpperCase()}</span></p>
            </div>
            <div class="document-actions">
                <button class="btn btn-primary" onclick="downloadDocumentPDF(${doc.id}, '${doc.type}')">Download PDF</button>
                <button class="btn btn-secondary danger" onclick="deleteTransaction(${doc.id}, '${doc.type}')">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateQuoteStatus(id, status) {
    const quotes = getFromStorage(STORAGE_KEYS.QUOTES) || [];
    const quoteIndex = quotes.findIndex(quote => quote.id === id);
    if (quoteIndex === -1) {
        return;
    }
    
    quotes[quoteIndex].status = status;
    saveToStorage(STORAGE_KEYS.QUOTES, quotes);
    loadDocuments();
    loadTransactions();
    updateDashboard();
    updateApprovedQuoteSelect();
}

function renderQuoteStatusActions(doc) {
    if (doc.type !== 'quote') {
        return '';
    }

    return `
        <div class="document-status-actions" role="group" aria-label="Quote status actions">
            <button class="status-action status-action-approved" onclick="updateQuoteStatus(${doc.id}, 'approved')" aria-pressed="${doc.status === 'approved'}">Approve</button>
            <button class="status-action status-action-rejected" onclick="updateQuoteStatus(${doc.id}, 'rejected')" aria-pressed="${doc.status === 'rejected'}">Reject</button>
            <button class="status-action status-action-pending" onclick="updateQuoteStatus(${doc.id}, 'pending')" aria-pressed="${doc.status === 'pending'}">Pending</button>
        </div>
    `;
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
        card.innerHTML = `
            <h3>${doc.number}</h3>
            ${renderQuoteStatusActions(doc)}
            <div class="document-meta">
                <p><strong>Type:</strong> ${doc.type.toUpperCase()}</p>
                <p><strong>Client:</strong> ${doc.clientInfo.name}</p>
                <p><strong>Date:</strong> ${formatDate(doc.date)}</p>
                <p><strong>Amount:</strong> ${formatCurrency(doc.total)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${doc.status}">${doc.status.toUpperCase()}</span></p>
            </div>
            <div class="document-actions">
                <button class="btn btn-primary" onclick="downloadDocumentPDF(${doc.id}, '${doc.type}')">Download PDF</button>
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
    const expenses = getFromStorage(STORAGE_KEYS.EXPENSES) || [];
    
    document.getElementById('totalQuotes').textContent = quotes.length;
    document.getElementById('totalInvoices').textContent = invoices.length;
    
    const totalRevenue = invoices.reduce((sum, inv) => 
        inv.status === 'paid' ? sum + inv.total : sum, 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    
    const outstanding = calculateTotalOutstandingAmount(invoices, quotes);
    document.getElementById('totalOutstanding').textContent = formatCurrency(outstanding);

    if (document.getElementById('expenseTotalAmount')) {
        updateExpenseSummary(expenses);
    }
}

// Calculate outstanding amounts from pending invoices and pending quotes
function calculateTotalOutstandingAmount(invoices, quotes) {
    const pendingInvoices = invoices.reduce((sum, inv) => 
        inv.status === 'pending' ? sum + inv.total : sum, 0);
    const pendingQuotes = quotes.reduce((sum, quote) => 
        quote.status === 'pending' ? sum + quote.total : sum, 0);
    return pendingInvoices + pendingQuotes;
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
