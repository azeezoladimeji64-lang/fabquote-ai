// ==========================================================================
// FabQuote AI — shared logic
// Browser-only prototype storage
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const here = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === here) {
      a.classList.add('active');
    }
  });
});

const FQ_STORAGE_KEY = 'fabquote_current_quote';
const FQ_HISTORY_KEY = 'fabquote_quote_history';

function fqFormatCurrency(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// --------------------------------------------------------------------------
// Calculate quotation
// --------------------------------------------------------------------------

function fqCalculateQuote(data) {
  const materialCost = Number(data.materialCost) || 0;
  const labourHours = Number(data.labourHours) || 0;
  const labourRate = Number(data.labourRate) || 0;
  const otherCosts = Number(data.otherCosts) || 0;
  const markupPercent = Number(data.markupPercent) || 0;
  const taxPercent = Number(data.taxPercent) || 0;

  const materialSubtotal = materialCost;
  const labourSubtotal = labourHours * labourRate;

  const baseCost =
    materialSubtotal +
    labourSubtotal +
    otherCosts;

  const markupAmount =
    baseCost * (markupPercent / 100);

  const preTaxTotal =
    baseCost + markupAmount;

  const taxAmount =
    preTaxTotal * (taxPercent / 100);

  const grandTotal =
    preTaxTotal + taxAmount;

  return {
    materialSubtotal,
    labourSubtotal,
    otherCosts,
    baseCost,
    markupAmount,
    preTaxTotal,
    taxAmount,
    grandTotal
  };
}

// --------------------------------------------------------------------------
// Current quote
// --------------------------------------------------------------------------

function fqSaveQuote(data) {
  localStorage.setItem(
    FQ_STORAGE_KEY,
    JSON.stringify(data)
  );
}

function fqLoadQuote() {
  const raw = localStorage.getItem(FQ_STORAGE_KEY);

  return raw ? JSON.parse(raw) : null;
}

// --------------------------------------------------------------------------
// Quote history
// --------------------------------------------------------------------------

function fqLoadHistory() {
  const raw = localStorage.getItem(FQ_HISTORY_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function fqSaveHistory(history) {
  localStorage.setItem(
    FQ_HISTORY_KEY,
    JSON.stringify(history)
  );
}

function fqAddToHistory(data) {
  const history = fqLoadHistory();

  // Remove an existing version of the same quote number
  const filtered = history.filter(
    q => q.quoteNumber !== data.quoteNumber
  );

  filtered.unshift(data);

  fqSaveHistory(filtered);

  return filtered;
}

// --------------------------------------------------------------------------
// Automatic quote number
// --------------------------------------------------------------------------

function fqNextQuoteNumber() {
  const year = new Date().getFullYear();
  const history = fqLoadHistory();

  let highest = 148;

  history.forEach(q => {
    const match = String(q.quoteNumber || '').match(
      /FQ-\d{4}-(\d+)/
    );

    if (match) {
      highest = Math.max(
        highest,
        Number(match[1])
      );
    }
  });

  return `FQ-${year}-${String(highest + 1).padStart(4, '0')}`;
}

// --------------------------------------------------------------------------
// Create and save quote
// --------------------------------------------------------------------------

function fqPrepareQuote(data, status) {
  const quote = {
    ...data,
    status: status || 'pending',
    quoteNumber: fqNextQuoteNumber(),
    createdDate: new Date().toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    )
  };

  const totals = fqCalculateQuote(quote);

  quote.grandTotal = totals.grandTotal;

  fqSaveQuote(quote);
  fqAddToHistory(quote);

  return quote;
}

// --------------------------------------------------------------------------
// Example quote
// --------------------------------------------------------------------------

const FQ_EXAMPLE_QUOTE = {
  quoteNumber: 'FQ-2026-0148',
  customerName: 'Marcus Delgado',
  company: 'Delgado Steel Works',
  email: 'marcus@delgadosteel.com',
  phone: '(312) 555-0148',
  jobTitle: 'Structural bracket set — loading dock canopy',
  jobDescription:
    '24x custom laser-cut and welded steel mounting brackets, powder-coated, per supplied drawing rev C. Includes hardware and delivery.',
  quantity: 24,
  material: 'Mild Steel A36 — 3/8in plate',
  materialCost: 1860,
  labourHours: 22,
  labourRate: 68,
  otherCosts: 240,
  markupPercent: 28,
  taxPercent: 8.25,
  createdDate: 'Sep 4, 2026',
  status: 'pending'
};
