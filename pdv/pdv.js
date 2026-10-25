const catalog = buildEconomyCatalog().filter(item => item.status === 'listed');
const byName = new Map(catalog.map(item => [item.name, item]));
const {parseEntry, rankMatches, unitPrice, saleTotals, changeDue, formatAmount, formatPrice, lotLabel, addLine, maxQuantity} = PdvCore;
const lotTag = line => { const label = lotLabel(line.quantity, byName.get(line.name).lotSize); return label ? `<span class="lot-tag">${label}</span>` : ''; };
const storageKey = 'botanica-pdv-v1';

// The shop's own products come first; every other item is reachable by section or search.
const botica = BotanicaData.recipes.map(recipe => byName.get(recipe.name)).filter(Boolean);
const icon = (item, className) => PdvIcons.svg(item, className);
const sections = [...new Set(catalog.map(item => item.section))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const tabs = [['botica', 'Botica'], ['all', 'Todos'], ...sections.map(section => [section, section])];

let lines = [], scenario = 'median', step = 1, tab = 'botica', lastAdded = null, undo = null, page = 0, perPage = 12;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && Array.isArray(saved.lines)) lines = saved.lines.filter(line => byName.has(line.name) && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= maxQuantity);
  if (['min', 'median', 'max'].includes(saved?.scenario)) scenario = saved.scenario;
  if ([1, 10, 100].includes(saved?.step)) step = saved.step;
} catch { /* Storage may be unavailable; the sale still works in memory. */ }
const save = () => { try { localStorage.setItem(storageKey, JSON.stringify({lines, scenario, step})); } catch { /* Ignore. */ } };

const entry = document.getElementById('entry');
const tilesBox = document.getElementById('tiles');
const status = document.getElementById('sale-status');
document.querySelector(`input[name="scenario"][value="${scenario}"]`).checked = true;

function visibleItems() {
  const {term} = parseEntry(entry.value);
  if (term) return rankMatches(catalog, term);
  return tab === 'botica' ? botica : tab === 'all' ? catalog : catalog.filter(item => item.section === tab);
}

function renderTabs() {
  document.getElementById('sections').innerHTML = tabs.map(([key, label]) => `<button type="button" role="tab" data-tab="${key}" aria-selected="${key === tab}">${key === 'botica' ? icon({name: 'Buquê de Flores'}, 'tab-icon') : key === 'all' ? '' : icon({name: '', section: key}, 'tab-icon')}${label}</button>`).join('');
  // Narrow screens keep Botica and Todos as chips and pick the other sections here.
  const select = document.getElementById('section-select');
  select.innerHTML = '<option value="">Seções…</option>' + sections.map(section => `<option${section === tab ? ' selected' : ''}>${section}</option>`).join('');
}

function renderTiles() {
  const items = visibleItems();
  const {quantity, term} = parseEntry(entry.value);
  const adds = term ? quantity : step;
  // Pages instead of scrolling: perPage is what fits the panel (see fitTiles).
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  page = Math.min(page, pages - 1);
  const first = page * perPage;
  document.getElementById('tiles-page').textContent = `${page + 1} / ${pages}`;
  document.getElementById('tiles-prev').disabled = page === 0;
  document.getElementById('tiles-next').disabled = page >= pages - 1;
  document.querySelector('.pager').classList.toggle('single', pages === 1);
  tilesBox.innerHTML = items.slice(first, first + perPage).map((item, offset) => {
    const index = first + offset;
    const price = unitPrice(item, scenario);
    return `<button type="button" class="tile${index === 0 && term ? ' first' : ''}" data-name="${item.name}" style="--hue:${hue(item.section)}" aria-label="Adicionar ${adds} × ${item.name}, ${formatPrice(price)} cada">
      <span class="tile-badge">${icon(item, 'tile-icon')}</span><span class="tile-name">${item.name}</span>
      <span class="tile-price">${formatPrice(price)}<small>${item.lotSize} un. ${formatAmount(BigInt(price.replace('.', '')) * BigInt(item.lotSize))}</small></span>
      <span class="tile-add" aria-hidden="true">+${adds}</span></button>`;
  }).join('');
  document.getElementById('no-match').hidden = items.length > 0;
}

// Section chips stay when they fit in two rows; otherwise the select replaces them.
function fitSections() {
  const bar = document.querySelector('.section-bar');
  bar.classList.remove('compact');
  const chips = [...document.querySelectorAll('#sections button')];
  const rows = new Set(chips.map(chip => Math.round(chip.getBoundingClientRect().top))).size;
  bar.classList.toggle('compact', rows > 2);
}

function fitTiles() {
  fitSections();
  const style = getComputedStyle(tilesBox);
  const columns = style.gridTemplateColumns.split(' ').filter(Boolean).length;
  const rowHeight = parseFloat(style.gridAutoRows), gap = parseFloat(style.rowGap) || 0;
  const rows = Math.max(1, Math.floor((tilesBox.clientHeight + gap) / (rowHeight + gap)));
  const fits = Math.max(1, columns * rows);
  if (fits === perPage) return;
  page = Math.floor(page * perPage / fits); perPage = fits; renderTiles();
}
const turnPage = delta => { page = Math.max(0, page + delta); renderTiles(); };
document.getElementById('tiles-prev').addEventListener('click', () => turnPage(-1));
document.getElementById('tiles-next').addEventListener('click', () => turnPage(1));

// Each section gets a stable hue so tiles of the same kind look alike.
function hue(section) { return [...section].reduce((sum, char) => sum + char.charCodeAt(0), 0) * 47 % 360; }

function renderSale() {
  const totals = saleTotals(lines);
  document.getElementById('lines').innerHTML = lines.map((line, index) => {
    const item = byName.get(line.name);
    const subtotal = BigInt(line.price.replace('.', '')) * BigInt(line.quantity);
    return `<li class="line${line.name === lastAdded ? ' flash' : ''}" style="--hue:${hue(item.section)}">
      ${icon(item, 'line-icon')}
      <span class="line-name">${line.name}<span class="lot-slot">${lotTag(line)}</span><small>${line.custom ? 'Preço ajustado' : 'Preço ' + {min:'mínimo', median:'mediano', max:'máximo'}[scenario]} · <label>$ <input class="line-price" data-index="${index}" inputmode="decimal" value="${line.price.replace(/0{1,3}$/, '').replace('.', ',')}" aria-label="Preço por unidade de ${line.name}"></label></small></span>
      <span class="qty"><button type="button" data-minus="${index}" aria-label="Menos 1 ${line.name}">−</button><input class="line-qty" data-index="${index}" inputmode="numeric" value="${line.quantity}" aria-label="Quantidade de ${line.name}"><button type="button" data-plus="${index}" aria-label="Mais 1 ${line.name}">+</button></span>
      <strong class="line-total">${formatAmount(subtotal, 5)}</strong>
      <button type="button" class="remove" data-remove="${index}" aria-label="Remover ${line.name}">×</button></li>`;
  }).join('');
  showTotals(totals);
}

function showTotals(totals = saleTotals(lines)) {
  document.getElementById('total').textContent = formatAmount(totals.charge);
  document.getElementById('tab-total').textContent = formatAmount(totals.charge);
  document.getElementById('exact-total').textContent = totals.exact !== totals.charge ? `Exato: ${formatAmount(totals.exact, 5)}` : '';
  document.getElementById('sale-count').textContent = `${totals.items.toLocaleString('pt-BR')} ${totals.items === 1 ? 'item' : 'itens'} · ${lines.length} ${lines.length === 1 ? 'linha' : 'linhas'}`;
  document.getElementById('empty-sale').hidden = lines.length > 0;
  document.getElementById('copy-receipt').disabled = document.getElementById('new-sale').disabled = !lines.length;
  const received = document.getElementById('received').value;
  const change = received ? changeDue(totals.charge, received) : null;
  const changeBox = document.getElementById('change');
  changeBox.textContent = !received ? '—' : change === null ? 'Valor inválido' : change < 0n ? `Faltam ${formatAmount(-change)}` : formatAmount(change);
  changeBox.classList.toggle('negative', change !== null && change < 0n);
  save();
}

function add(item, quantity) {
  const line = addLine(lines, item, quantity, scenario);
  lastAdded = item.name;
  const lots = lotLabel(line.quantity, item.lotSize);
  status.textContent = `Adicionado: ${quantity} × ${item.name}. Agora ${line.quantity}${lots ? ` (${lots})` : ''}.`;
  renderSale();
  const row = document.querySelector('.line.flash');
  row?.scrollIntoView({block: 'nearest'});
}

document.getElementById('sections').addEventListener('click', event => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  tab = button.dataset.tab; entry.value = ''; page = 0;
  renderTabs(); fitSections(); renderTiles();
});
document.getElementById('section-select').addEventListener('change', event => {
  if (!event.target.value) return;
  tab = event.target.value; entry.value = ''; page = 0;
  renderTabs(); fitSections(); renderTiles();
});
tilesBox.addEventListener('click', event => {
  const tile = event.target.closest('[data-name]');
  if (!tile) return;
  const {quantity, term} = parseEntry(entry.value);
  add(byName.get(tile.dataset.name), term ? quantity : step);
});
entry.addEventListener('input', () => { page = 0; renderTiles(); });
entry.addEventListener('keydown', event => {
  if (event.key === 'Escape') { entry.value = ''; page = 0; renderTiles(); }
  if (event.key === 'PageDown' || event.key === 'PageUp') { event.preventDefault(); turnPage(event.key === 'PageDown' ? 1 : -1); }
});
document.getElementById('entry-form').addEventListener('submit', event => {
  event.preventDefault();
  const {quantity, term} = parseEntry(entry.value);
  const [first] = term ? rankMatches(catalog, term) : [];
  if (!first) { status.textContent = term ? `Nenhum produto para “${term}”.` : 'Digite o nome do produto.'; return; }
  add(first, quantity);
  entry.value = ''; renderTiles(); entry.focus();
});
document.querySelector('.step').addEventListener('click', event => {
  const button = event.target.closest('[data-step]');
  if (!button) return;
  step = Number(button.dataset.step);
  document.querySelectorAll('[data-step]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  renderTiles(); save();
});
document.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === step)));

const linesBox = document.getElementById('lines');
linesBox.addEventListener('click', event => {
  const target = event.target.closest('[data-minus],[data-plus],[data-remove]');
  if (!target) return;
  const index = Number(target.dataset.minus ?? target.dataset.plus ?? target.dataset.remove);
  const line = lines[index];
  if (target.dataset.remove !== undefined || (target.dataset.minus !== undefined && line.quantity === 1)) {
    lines.splice(index, 1); lastAdded = null; status.textContent = `Removido: ${line.name}.`;
    renderSale();
    (document.querySelector(`[data-remove="${Math.min(index, lines.length - 1)}"]`) || entry).focus();
    return;
  }
  line.quantity = Math.min(maxQuantity, line.quantity + (target.dataset.plus !== undefined ? 1 : -1));
  lastAdded = null; renderSale();
  document.querySelector(`[data-${target.dataset.plus !== undefined ? 'plus' : 'minus'}="${index}"]`)?.focus();
});
// Typed quantities and prices update totals as they change; the row is redrawn when editing ends.
linesBox.addEventListener('input', event => {
  const input = event.target.closest('.line-qty,.line-price');
  if (!input) return;
  const line = lines[Number(input.dataset.index)];
  if (input.classList.contains('line-qty')) {
    const quantity = Number(input.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) { input.setAttribute('aria-invalid', 'true'); return; }
    line.quantity = quantity;
  } else {
    const price = input.value.trim().replace(',', '.');
    if (!/^\d{1,7}(?:\.\d{1,5})?$/.test(price)) { input.setAttribute('aria-invalid', 'true'); return; }
    const [whole, fraction = ''] = price.split('.');
    line.price = `${Number(whole)}.${fraction.padEnd(5, '0')}`; line.custom = true;
  }
  input.removeAttribute('aria-invalid');
  const subtotal = BigInt(line.price.replace('.', '')) * BigInt(line.quantity);
  input.closest('.line').querySelector('.line-total').textContent = formatAmount(subtotal, 5);
  input.closest('.line').querySelector('.lot-slot').innerHTML = lotTag(line);
  showTotals();
});
linesBox.addEventListener('change', () => { lastAdded = null; renderSale(); });
document.getElementById('received').addEventListener('input', () => showTotals());

document.querySelectorAll('input[name="scenario"]').forEach(input => input.addEventListener('change', () => {
  scenario = input.value;
  for (const line of lines) if (!line.custom) line.price = unitPrice(byName.get(line.name), scenario);
  lastAdded = null; renderTiles(); renderSale();
}));

document.getElementById('new-sale').addEventListener('click', () => {
  const charge = formatAmount(saleTotals(lines).charge);
  undo = lines; lines = []; lastAdded = null;
  document.getElementById('received').value = '';
  renderSale();
  status.innerHTML = `Venda concluída: ${charge}. Caixa livre. <button type="button" id="undo-sale">Desfazer</button>`;
  entry.focus();
});
status.addEventListener('click', event => {
  if (!event.target.closest('#undo-sale') || !undo) return;
  lines = undo; undo = null; status.textContent = 'Venda restaurada.'; renderSale();
});
document.getElementById('copy-receipt').addEventListener('click', async () => {
  const totals = saleTotals(lines);
  const received = document.getElementById('received').value;
  const change = received ? changeDue(totals.charge, received) : null;
  const text = ['Botânica Johnsons — Comprovante de venda', `Preço: cenário ${{min:'mínimo', median:'mediano', max:'máximo'}[scenario]}`, '',
    ...lines.map(line => `${line.quantity.toLocaleString('pt-BR')} × ${line.name}${lotLabel(line.quantity, byName.get(line.name).lotSize) ? ` (${lotLabel(line.quantity, byName.get(line.name).lotSize)})` : ''} @ ${formatPrice(line.price)} = ${formatAmount(BigInt(line.price.replace('.', '')) * BigInt(line.quantity), 5)}${line.custom ? ' (ajustado)' : ''}`),
    '', `TOTAL: ${formatAmount(totals.charge)}${totals.exact !== totals.charge ? ` (exato ${formatAmount(totals.exact, 5)})` : ''}`,
    ...(change !== null && change >= 0n ? [`Recebido: ${formatAmount(totals.charge + change)}`, `Troco: ${formatAmount(change)}`] : [])].join('\n');
  try { await navigator.clipboard.writeText(text); status.textContent = 'Comprovante copiado!'; }
  catch { status.textContent = 'Não foi possível copiar automaticamente.'; window.prompt('Copie o comprovante:', text); }
});

document.querySelectorAll('.mobile-nav [data-panel]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.pdv-workspace').dataset.panel = button.dataset.panel;
  document.querySelectorAll('.mobile-nav [data-panel]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
}));

renderTabs(); renderTiles(); renderSale();
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitTiles).observe(tilesBox);
fitTiles();
entry.focus();
