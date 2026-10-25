// Pure point-of-sale helpers, shared by the page and the Node tests.
const PdvCore = (() => {
const pricing = typeof module !== 'undefined' ? require('../price-catalog.js') : {scenarioPrice, calculateShoppingList};
const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const maxQuantity = 1000000;

// "10*rosa", "10x rosa", "10 × rosa" or "10 rosa" → quantity 10 and term "rosa".
function parseEntry(text) {
  const match = text.trim().match(/^(\d{1,7})\s*(?:[x×*]\s*|\s+)(\S.*)$/i);
  if (!match) return {quantity: 1, term: text.trim()};
  return {quantity: Math.min(maxQuantity, Math.max(1, Number(match[1]))), term: match[2].trim()};
}

// Exact names first, then names starting with the term, then any word starting with it.
function rankMatches(items, term) {
  const query = normalize(term);
  if (!query) return items.slice();
  const rank = item => {
    const names = [item.name, ...(item.aliases || [])].map(normalize);
    if (names.includes(query)) return 0;
    if (names.some(name => name.startsWith(query))) return 1;
    if (names.some(name => name.split(/[\s·-]+/).some(word => word.startsWith(query)))) return 2;
    return names.some(name => name.includes(query)) ? 3 : 4;
  };
  return items.map(item => ({item, rank: rank(item)})).filter(entry => entry.rank < 4)
    .sort((a, b) => a.rank - b.rank).map(entry => entry.item);
}

// Unit price in dollars, as the five-decimal string the exact totals expect.
const unitPrice = (item, scenario) => (pricing.scenarioPrice(item, scenario, 'unit') / 100).toFixed(5);

// Exact total in 1/100000 dollar; the amount to charge rounds half up to the cent.
function saleTotals(lines) {
  const result = pricing.calculateShoppingList(lines.map(line => ({quantity: line.quantity, price: line.price})));
  const exact = BigInt(result.totalCents.replace('.', ''));
  const charge = (exact + 500n) / 1000n * 1000n;
  return {exact, charge, items: lines.reduce((sum, line) => sum + Number(line.quantity), 0)};
}

// Received amount typed in dollars ("2", "2,5", "2.50") → change due, or null when invalid.
function changeDue(charge, received) {
  const text = String(received).trim().replace(',', '.');
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  return BigInt(whole) * 100000n + BigInt(fraction.padEnd(5, '0')) - charge;
}

// 1/100000-dollar integers formatted as pt-BR dollars, keeping only meaningful decimals.
function formatAmount(amount, maximumFractionDigits = 2) {
  const sign = amount < 0n ? '-' : '';
  const absolute = amount < 0n ? -amount : amount;
  const text = `${absolute / 100000n}.${String(absolute % 100000n).padStart(5, '0')}`;
  return sign + '$' + new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits}).format(text);
}
const formatPrice = price => formatAmount(BigInt(String(price).replace('.', '').replace(/^0+(?=\d)/, '')), 5);

function addLine(lines, item, quantity, scenario) {
  const existing = lines.find(line => line.name === item.name);
  if (existing) existing.quantity = Math.min(maxQuantity, existing.quantity + quantity);
  else lines.push({name: item.name, quantity: Math.min(maxQuantity, quantity), price: unitPrice(item, scenario), custom: false});
  return existing || lines[lines.length - 1];
}

return {normalize, parseEntry, rankMatches, unitPrice, saleTotals, changeDue, formatAmount, formatPrice, addLine, maxQuantity};
})();
if (typeof module !== 'undefined') module.exports = PdvCore;
