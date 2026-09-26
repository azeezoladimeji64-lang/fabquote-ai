// ==========================================================================
// FabQuote AI — shared logic
// No backend yet. Quote data is passed from the New Quotation page to the
// Preview page using the browser's localStorage — purely for this prototype,
// so refreshing or reopening the preview still shows the last quote.
// ==========================================================================

// Highlight the current page in the top nav
document.addEventListener('DOMContentLoaded', () => {
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });
});

const FQ_STORAGE_KEY = 'fabquote_current_quote';

function fqFormatCurrency(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Core calculation used by both the New Quotation live preview strip
// and the full Quotation Preview page.
function fqCalculateQuote(data) {
  const materialCost   = Number(data.materialCost)   || 0;
  const labourHours    = Number(data.labourHours)    || 0;
  const labourRate     = Number(data.labourRate)     || 0;
  const otherCosts     = Number(data.otherCosts)     || 0;
  const markupPercent  = Number(data.markupPercent)  || 0;
  const taxPercent     = Number(data.taxPercent)     || 0;

  const materialSubtotal = materialCost;
  const labourSubtotal   = labourHours * labourRate;
  const baseCost          = materialSubtotal + labourSubtotal + otherCosts;
  const markupAmount      = baseCost * (markupPercent / 100);
  const preTaxTotal       = baseCost + markupAmount;
  const taxAmount          = preTaxTotal * (taxPercent / 100);
  const grandTotal         = preTaxTotal + taxAmount;

  return {
    materialSubtotal, labourSubtotal, otherCosts,
    baseCost, markupAmount, preTaxTotal, taxAmount, grandTotal
  };
}

function fqSaveQuote(data) {
  localStorage.setItem(FQ_STORAGE_KEY, JSON.stringify(data));
}

function fqLoadQuote() {
  const raw = localStorage.getItem(FQ_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// Realistic fallback example — shown if someone opens quotation-preview.html
// directly, without going through the New Quotation form first.
const FQ_EXAMPLE_QUOTE = {
  quoteNumber: 'FQ-2026-0148',
  customerName: 'Marcus Delgado',
  company: 'Delgado Steel Works',
  email: 'marcus@delgadosteel.com',
  phone: '(312) 555-0148',
  jobTitle: 'Structural bracket set — loading dock canopy',
  jobDescription: '24x custom laser-cut and welded steel mounting brackets, powder-coated, per supplied drawing rev C. Includes hardware and delivery.',
  quantity: 24,
  material: 'Mild Steel A36 — 3/8in plate',
  materialCost: 1860,
  labourHours: 22,
  labourRate: 68,
  otherCosts: 240,
  markupPercent: 28,
  taxPercent: 8.25,
  createdDate: 'Sep 4, 2026'
};
