const catalog = buildEconomyCatalog();
const money = (cents, fullPrecision = document.getElementById('full-precision').checked) => {
  if (!fullPrecision && Number(cents) !== 0 && Math.abs(cents) < 0.5) return cents > 0 ? '< $0,01' : '> -$0,01';
  // Shift the decimal as a string so formatting 0.325 cents yields $0.00325,
  // without introducing a binary division tail in the full precision view.
  const [coefficient, exponent = '0'] = String(cents).split('e');
  return '$' + new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: fullPrecision ? 20 : 2}).format(`${coefficient}e${Number(exponent) - 2}`);
};
const noteId = name => 'nota-' + name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const suggestedItems = catalog.filter(item => item.status === 'suggested');
// With every input quoted, the suggestion notes and filter have nothing to show.
if (!suggestedItems.length) {
  document.querySelector('[data-dialog="notes-dialog"]').hidden = true;
  document.querySelector('#status option[value="suggested"]').remove();
}
document.getElementById('category').innerHTML = '<option value="all">Todas as seções</option>' + [...new Set(catalog.map(item => item.section))].sort((a,b) => a.localeCompare(b,'pt-BR')).map(section => `<option>${section}</option>`).join('');
document.getElementById('origin').innerHTML = '<option value="all">Todas as origens</option>' + [...new Set(catalog.map(item => item.origin))].sort((a,b) => a.localeCompare(b,'pt-BR')).map(origin => `<option>${origin}</option>`).join('');
const referencePrice = item => item.status === 'suggested' ? item.suggested : item.median;
let visibleCatalog = catalog;
let currentPage = 0;
let pageSize = 10;
document.getElementById('catalog-summary').innerHTML = [
  [catalog.length, 'itens no catálogo'],
  [catalog.filter(item => item.isNew).length, 'novos desde a edição XLI'],
  ...(suggestedItems.length ? [[suggestedItems.length, 'preços sugeridos']] : [])
].map(([count, label]) => `<div><strong>${count}</strong><span>${label}</span></div>`).join('');

function renderItemNotes() {
  const openNotes = new Set([...document.querySelectorAll('#item-notes details[open]')].map(note => note.id));
  document.getElementById('item-notes').innerHTML = suggestedItems.map(item => `
  <details id="${noteId(item.name)}" class="item-note">
    <summary><span>${item.name}<small>${item.references.map(ref => ref.name).join(' · ')}</small></span><span class="suggested-value">${money(item.suggested, true)}<small>Preço sugerido / un.</small></span></summary>
    <div class="note-body"><p>${item.methodology}</p>
    <ol>${item.references.map(ref => `<li><strong>${ref.name}:</strong> (${money(ref.min, true)} + ${money(ref.max, true)}) ÷ 2 = <strong>${money(ref.value, true)} / un.</strong>.<br><span class="raw-detail">${ref.source} · ${ref.origin}</span></li>`).join('')}</ol>
    <p class="note-result">${item.references.length > 1 ? `Média simples: (${item.references.map(ref => money(ref.value, true)).join(' + ')}) ÷ ${item.references.length}` : 'Resultado da referência única'} = <strong>${money(item.suggested, true)} / un.</strong></p>
    <p class="raw-detail">Estimativa por itens correlatos, sem cotação específica nem garantia de margem. As notas mostram os valores completos para tornar a conta legível, mesmo quando a tabela está no modo de duas casas decimais.</p></div>
  </details>`).join('');
  for (const id of openNotes) document.getElementById(id).open = true;
}
renderItemNotes();

function openNoteFromHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches('details.item-note')) {
    showDialog('notes-dialog');
    target.open = true;
    target.querySelector('summary').focus();
  }
}
window.addEventListener('hashchange', openNoteFromHash);
openNoteFromHash();

const normalizeSearch = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function renderCatalog() {
  const query = normalizeSearch(document.getElementById('search').value.trim());
  const category = document.getElementById('category').value;
  const status = document.getElementById('status').value;
  const origin = document.getElementById('origin').value;
  const visible = catalog.filter(item => normalizeSearch([item.name, item.originalName || '', ...(item.aliases || [])].join(' ')).includes(query) && (category === 'all' || category === item.section) && (status === 'all' || (status === 'new' ? item.isNew : status === item.status)) && (origin === 'all' || origin === item.origin));
  const order = document.getElementById('sort').value;
  if (order === 'low') visible.sort((a, b) => referencePrice(a) - referencePrice(b));
  if (order === 'high') visible.sort((a, b) => referencePrice(b) - referencePrice(a));
  if (order === 'spread') visible.sort((a, b) => (b.status === 'listed' && b.max >= b.min ? b.max - b.min : -1) - (a.status === 'listed' && a.max >= a.min ? a.max - a.min : -1));
  visibleCatalog = visible;
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  currentPage = Math.min(currentPage, pages - 1);
  const first = currentPage * pageSize;
  document.getElementById('price-rows').innerHTML = visible.slice(first, first + pageSize).map(item => {
    const suggested = item.status === 'suggested';
    const hasLot = !suggested && item.lotSize > 1 && Number.isFinite(item.sourceMin) && Number.isFinite(item.sourceMax);
    const lotMinimum = hasLot ? money(item.sourceMin) : '—';
    const lotMaximum = hasLot ? money(item.sourceMax) : '—';
    const lotQuantity = hasLot ? `${item.lotSize.toLocaleString('pt-BR')} un./lote` : 'Sem lote';
    const action = suggested ? `data-note="${noteId(item.name)}"` : `data-source="${catalog.indexOf(item)}"`;
    return `<tr><th scope="row"><span class="item-name desktop-name" title="${item.name}">${item.name}</span><button type="button" class="item-name mobile-detail" ${action} title="${item.name} · Ver detalhes">${item.name} ↗</button><small title="${item.section} · ${item.origin}">${suggested || item.isNew ? `<span class="price-badge ${suggested ? 'is-suggested' : ''}" ${item.isNew ? `title="Item novo na ${item.newIn || 'edição XLII'} da Gazeta Comercial."` : ''}>${suggested ? 'Sugerido' : 'Novo'}</span> ` : ''}${item.section} · ${item.origin}</small></th><td class="price-number"><span class="unit-price">${suggested ? '—' : money(item.min)}</span><small class="lot-price" aria-label="Mínimo por lote">Lote: ${lotMinimum}</small></td><td class="price-number price-main"><span class="unit-price">${money(suggested ? item.suggested : item.median)}</span><small class="lot-quantity"${item.lotDerived ? ' title="Lote calculado: 100 × preço unitário"' : ''}>${lotQuantity}</small></td><td class="price-number"><span class="unit-price">${suggested ? '—' : money(item.max)}</span><small class="lot-price" aria-label="Máximo por lote">Lote: ${lotMaximum}</small></td><td class="detail-column"><button type="button" class="row-detail" ${action}>${suggested ? 'Cálculo ↗' : 'Fonte ↗'}</button></td></tr>`;
  }).join('');
  document.getElementById('page-range').textContent = visible.length ? `${first + 1}–${Math.min(first + pageSize, visible.length)} de ${visible.length}` : '0 resultados';
  document.getElementById('page-count').textContent = `${currentPage + 1} / ${pages}`;
  document.getElementById('previous-page').disabled = currentPage === 0;
  document.getElementById('next-page').disabled = currentPage >= pages - 1;
  document.getElementById('result-count').textContent = `${visible.length} de ${catalog.length} referências`;
  document.getElementById('no-results').hidden = visible.length > 0;
}
function showDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
}
for (const button of document.querySelectorAll('[data-dialog]')) button.addEventListener('click', () => showDialog(button.dataset.dialog));
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => button.closest('dialog').close());
document.getElementById('price-rows').addEventListener('click', event => {
  const noteButton = event.target.closest('[data-note]');
  if (noteButton) {
    const note = document.getElementById(noteButton.dataset.note);
    showDialog('notes-dialog'); note.open = true; note.querySelector('summary').focus();
    return;
  }
  const sourceButton = event.target.closest('[data-source]');
  if (!sourceButton) return;
  const item = catalog[Number(sourceButton.dataset.source)];
  document.getElementById('reference-title').textContent = item.name;
  const body = document.getElementById('reference-body'); body.replaceChildren();
  for (const line of [`${item.section} · ${item.origin}`, `${item.source}. Mínimo: ${money(item.min, true)} / un. · Mediano: ${money(item.median, true)} / un. · Máximo: ${money(item.max, true)} / un.`, item.sourceNote || 'Faixa cadastrada da Gazeta Comercial. Mediano = ponto médio entre mínimo e máximo.']) {
    const paragraph = document.createElement('p'); paragraph.textContent = line; body.append(paragraph);
  }
  showDialog('reference-dialog');
});
function resetPage() { currentPage = 0; renderCatalog(); }
document.getElementById('search').addEventListener('input', resetPage);
for (const id of ['category','status','origin','sort']) document.getElementById(id).addEventListener('change', resetPage);
document.getElementById('previous-page').addEventListener('click', () => {if(currentPage > 0) {currentPage--; renderCatalog();}});
document.getElementById('next-page').addEventListener('click', () => {if((currentPage + 1) * pageSize < visibleCatalog.length) {currentPage++; renderCatalog();}});
renderCatalog();
function fitPageToViewport() {
  const viewport = document.getElementById('table-viewport');
  if (!viewport.clientHeight) return;
  const headerHeight = document.querySelector('.catalog-table thead').getBoundingClientRect().height;
  const rowHeight = document.querySelector('#price-rows tr')?.getBoundingClientRect().height || 44;
  const nextSize = Math.max(1, Math.floor((viewport.clientHeight - headerHeight - 2) / rowHeight));
  if (nextSize !== pageSize) {
    currentPage = Math.floor(currentPage * pageSize / nextSize);
    pageSize = nextSize;
    renderCatalog();
  }
}
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitPageToViewport).observe(document.getElementById('table-viewport'));
window.addEventListener('resize', fitPageToViewport);
fitPageToViewport();

document.getElementById('export-csv').addEventListener('click', () => {
  const decimal = value => value == null ? '' : (value / 100).toFixed(8).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const rows = [['Item', 'Seção', 'Situação', 'Fonte', 'Obtenção', 'Mínimo ($/un.)', 'Mediano ($/un.)', 'Máximo ($/un.)', 'Sugerido ($/un.)', 'Unidades por lote', 'Mínimo do lote ($)', 'Máximo do lote ($)', 'Nota / metodologia'], ...visibleCatalog.map(item => [item.name, item.section, item.status === 'suggested' ? 'Preço sugerido' : item.isNew ? `Novo na ${item.newIn || 'edição XLII'}` : 'Cadastrado', item.source || 'Estimativa', item.origin, decimal(item.min), decimal(item.median), decimal(item.max), decimal(item.suggested), item.lotSize || '', decimal(item.sourceMin), decimal(item.sourceMax), item.sourceNote || (item.references ? item.methodology + ' ' + item.references.map(ref => `${ref.name}: (${decimal(ref.min)} + ${decimal(ref.max)}) ÷ 2 = ${decimal(ref.value)}`).join(' | ') + '; média simples dos pontos médios.' : item.source)])];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'economia-condado.csv';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

const shoppingLines = [];
const scenarioNames = {min:'Mínimo', median:'Mediano', max:'Máximo'};
let shoppingScenario = document.querySelector('input[name="shopping-scenario"]:checked')?.value || 'median';
// Five decimal dollars hold every unit, lot and midpoint price in the catalog.
const dollars = cents => (cents / 100).toFixed(5);
const linePrice = line => dollars(scenarioPrice(catalog[line.index], shoppingScenario, line.basis));
const shoppingItem = document.getElementById('shopping-item');
const shoppingBasis = document.getElementById('shopping-basis');
const shoppingSearch = document.getElementById('shopping-item-search');
const shoppingOptions = document.getElementById('shopping-options');
const itemLabel = item => item.name + (item.status === 'suggested' ? ' (sugerido)' : '');
let itemMatches = [];
let activeItemOption = 0;
let searchCloseTimer;
function closeItemOptions() {
  shoppingOptions.hidden = true;
  shoppingSearch.setAttribute('aria-expanded','false');
  shoppingSearch.removeAttribute('aria-activedescendant');
}
function highlightItemOption() {
  shoppingOptions.querySelectorAll('[role="option"]').forEach((option, index) => {
    option.setAttribute('aria-selected',String(index === activeItemOption));
  });
  if (itemMatches.length) shoppingSearch.setAttribute('aria-activedescendant',`shopping-option-${itemMatches[activeItemOption].index}`);
  else shoppingSearch.removeAttribute('aria-activedescendant');
  shoppingOptions.querySelector('[aria-selected="true"]')?.scrollIntoView?.({block:'nearest'});
}
function showItemOptions(showAll = false) {
  const query = showAll ? '' : normalizeSearch(shoppingSearch.value.trim());
  // Exact names first, then names starting with the query, so "Rosa" + Enter picks Rosa.
  const rank = item => {
    const names = [item.name, ...(item.aliases || [])].map(normalizeSearch);
    return names.includes(query) ? 0 : names.some(name => name.startsWith(query)) ? 1 : 2;
  };
  const matches = catalog.map((item,index)=>({item,index})).filter(({item})=>normalizeSearch([itemLabel(item),...(item.aliases || [])].join(' ')).includes(query)).sort((a,b)=>rank(a.item)-rank(b.item));
  itemMatches = matches.slice(0,12);
  activeItemOption = 0;
  shoppingOptions.innerHTML = itemMatches.length ? itemMatches.map(({item,index})=>`<li id="shopping-option-${index}" role="option" data-choice="${index}" aria-selected="false">${itemLabel(item)}<small>${item.origin}</small></li>`).join('') : '<li class="no-item-match" role="presentation">Nenhum item encontrado.</li>';
  shoppingOptions.hidden = false;
  shoppingSearch.setAttribute('aria-expanded','true');
  document.getElementById('shopping-search-status').textContent = matches.length > 12 ? `${matches.length} itens encontrados. Mostrando 12; continue digitando para refinar.` : `${matches.length} itens encontrados. Use as setas e Enter para selecionar.`;
  highlightItemOption();
}
function chooseShoppingItem(index) {
  shoppingItem.value = String(index);
  shoppingSearch.value = itemLabel(catalog[index]);
  shoppingSearch.setCustomValidity('');
  closeItemOptions();
  setShoppingBasis();
}
shoppingSearch.addEventListener('focus',()=>{clearTimeout(searchCloseTimer);shoppingSearch.select();showItemOptions(shoppingItem.value !== '' && shoppingSearch.value === itemLabel(catalog[shoppingItem.value]));});
shoppingSearch.addEventListener('input',()=>{
  shoppingItem.value = '';
  shoppingSearch.setCustomValidity('Selecione um item nos resultados da busca.');
  setShoppingBasis(); showItemOptions();
});
shoppingSearch.addEventListener('keydown',event=>{
  if (event.key === 'Escape' && !shoppingOptions.hidden) { event.preventDefault(); event.stopPropagation(); closeItemOptions(); return; }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (shoppingOptions.hidden) showItemOptions();
    else if (itemMatches.length) activeItemOption = (activeItemOption + (event.key === 'ArrowDown' ? 1 : -1) + itemMatches.length) % itemMatches.length;
    highlightItemOption();
    return;
  }
  if (event.key === 'Enter' && !shoppingOptions.hidden) {
    event.preventDefault();
    if (itemMatches.length) chooseShoppingItem(itemMatches[activeItemOption].index);
  }
});
shoppingOptions.addEventListener('mousedown',event=>event.preventDefault());
shoppingOptions.addEventListener('click',event=>{const option=event.target.closest('[data-choice]');if(option) chooseShoppingItem(Number(option.dataset.choice));});
shoppingSearch.addEventListener('blur',()=>{searchCloseTimer=setTimeout(closeItemOptions,100);});
shoppingItem.value = '0';
shoppingSearch.value = itemLabel(catalog[0]);
// A price typed in the form is kept when the scenario changes; a new item or basis resets it.
let formPriceTyped = false;
function setShoppingPrice() {
  const item = catalog[shoppingItem.value];
  if (!item) return;
  formPriceTyped = false;
  const lot = shoppingBasis.value === 'lot';
  document.getElementById('shopping-price').value = dollars(scenarioPrice(item, shoppingScenario, shoppingBasis.value));
  document.getElementById('quantity-label').textContent = lot ? 'Quantidade de lotes' : 'Quantidade de unidades';
  document.getElementById('price-label').textContent = lot ? 'Preço por lote ($)' : 'Preço por unidade ($)';
  document.getElementById('shopping-hint').textContent = `${lot ? `Cada lote contém ${item.lotSize} unidades.` : 'Quantidade em unidades individuais.'} ${item.status === 'suggested' ? 'Preço sugerido, igual nos três cenários; ajuste para o valor combinado.' : `Preço do cenário ${scenarioNames[shoppingScenario].toLowerCase()} preenchido; ajuste para o valor combinado.`}`;
}
function setShoppingBasis() {
  const item = catalog[shoppingItem.value];
  document.querySelector('#shopping-form .add-item').disabled = !item;
  if (!item) {
    shoppingBasis.innerHTML = '<option value="unit">Unidade</option>';
    document.getElementById('shopping-price').value = '';
    document.getElementById('shopping-hint').textContent = 'Selecione um item nos resultados para adicionar à conta.';
    return;
  }
  const hasLot = item.lotSize > 1 && Number.isFinite(item.sourceMin) && Number.isFinite(item.sourceMax);
  shoppingBasis.innerHTML = '<option value="unit">Unidade</option>' + (hasLot ? `<option value="lot">Lote de ${item.lotSize} un.</option>` : '');
  setShoppingPrice();
}
function renderShoppingTotals() {
  let invalid = false;
  for (const [index, line] of shoppingLines.entries()) {
    const row = document.getElementById(`shopping-line-${index}`);
    try {
      const result = calculateShoppingList([line]);
      row.querySelector('.line-subtotal').textContent = money(result.totalCents);
      row.classList.remove('invalid-line');
    } catch {
      invalid = true; row.querySelector('.line-subtotal').textContent = '—'; row.classList.add('invalid-line');
    }
  }
  document.getElementById('copy-shopping').disabled = invalid || shoppingLines.length === 0;
  document.getElementById('shopping-copy-status').textContent = '';
  document.getElementById('shopping-copy-fallback').hidden = true;
  document.getElementById('shopping-copy-text').value = '';
  document.getElementById('shopping-total').textContent = invalid ? '—' : money(calculateShoppingList(shoppingLines).totalCents);
  document.getElementById('shopping-message').textContent = invalid ? 'Corrija as linhas destacadas: quantidade inteira de 1 a 1.000.000 e preço de 0 a 1.000.000, com até cinco casas decimais.' : '';
}
const lineSource = (line, index) => `${line.basis === 'lot' ? `Lote de ${line.lotSize} un.` : 'Unidade'} · ${line.custom ? `Preço ajustado <button type="button" class="link-button" data-reset="${index}" aria-label="Usar preço do cenário ${scenarioNames[shoppingScenario].toLowerCase()} em ${line.name}">usar cenário</button>` : catalog[line.index].status === 'suggested' ? 'Sugerido' : scenarioNames[shoppingScenario]}`;
function renderShoppingList() {
  document.getElementById('shopping-rows').innerHTML = shoppingLines.map((line, index) => `<tr id="shopping-line-${index}"><th scope="row"><span>${line.name}</span><small class="line-source">${lineSource(line, index)}</small></th><td><div class="quantity-input"><input type="number" min="1" max="1000000" step="1" value="${line.quantity}" data-line="${index}" data-field="quantity" aria-label="Quantidade de ${line.name}" required><button type="button" class="plus-hundred" data-plus="${index}" aria-label="Somar 100 à quantidade de ${line.name}">+100</button></div></td><td><input type="number" min="0" max="1000000" step="0.00001" value="${line.price}" data-line="${index}" data-field="price" aria-label="Preço de ${line.name}" required></td><td class="line-subtotal"></td><td><button type="button" data-remove="${index}" aria-label="Remover ${line.name}">×</button></td></tr>`).join('');
  document.getElementById('shopping-empty').hidden = shoppingLines.length > 0;
  document.getElementById('clear-shopping').disabled = shoppingLines.length === 0;
  renderShoppingTotals();
}
document.getElementById('shopping-form').addEventListener('submit', event => {
  event.preventDefault();
  const item = catalog[shoppingItem.value];
  if (!item) { document.getElementById('shopping-message').textContent = 'Selecione um item nos resultados da busca.'; shoppingSearch.focus(); return; }
  const line = {name:item.name, index:Number(shoppingItem.value), basis:shoppingBasis.value, lotSize:item.lotSize, quantity:document.getElementById('shopping-quantity').value, price:document.getElementById('shopping-price').value};
  // A price typed in the form is a negotiated price: scenario changes keep it.
  line.custom = Number(line.price) !== Number(linePrice(line));
  try {
    calculateShoppingList([line]);
    shoppingLines.push(line); renderShoppingList();
    resetShoppingQuantity();
  } catch (error) { document.getElementById('shopping-message').textContent = error.message; }
});
shoppingItem.addEventListener('change', () => {if(catalog[shoppingItem.value]) chooseShoppingItem(Number(shoppingItem.value));});
shoppingBasis.addEventListener('change', setShoppingPrice);
document.getElementById('shopping-rows').addEventListener('input', event => {
  const input = event.target.closest('[data-line][data-field]');
  if (!input) return;
  const line = shoppingLines[Number(input.dataset.line)];
  line[input.dataset.field] = input.value;
  if (input.dataset.field === 'price' && !line.custom) {
    // Only the label changes, so the price field keeps focus while typing.
    line.custom = true;
    input.closest('tr').querySelector('.line-source').innerHTML = lineSource(line, Number(input.dataset.line));
  }
  renderShoppingTotals();
});
document.getElementById('shopping-rows').addEventListener('click', event => {
  const plus = event.target.closest('[data-plus]');
  if (plus) {
    const line = shoppingLines[Number(plus.dataset.plus)];
    line.quantity = String(plusHundred(line.quantity));
    plus.previousElementSibling.value = line.quantity;
    renderShoppingTotals();
    return;
  }
  // Re-rendering replaces the row, so focus moves to the matching control afterwards.
  const reset = event.target.closest('[data-reset]');
  if (reset) {
    const index = Number(reset.dataset.reset), line = shoppingLines[index];
    line.price = linePrice(line); line.custom = false;
    renderShoppingList();
    document.querySelector(`[data-line="${index}"][data-field="price"]`).focus();
    return;
  }
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  const index = Number(button.dataset.remove);
  shoppingLines.splice(index, 1); renderShoppingList();
  (document.querySelector(`[data-remove="${Math.min(index, shoppingLines.length - 1)}"]`) || shoppingSearch).focus();
});
document.getElementById('clear-shopping').addEventListener('click', () => { shoppingLines.length = 0; renderShoppingList(); });
document.getElementById('copy-shopping').addEventListener('click', async () => {
  if (!shoppingLines.length) return;
  const status = document.getElementById('shopping-copy-status');
  let text;
  try {
    const result = calculateShoppingList(shoppingLines);
    const priceText = price => '$' + new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:20}).format(price);
    text = `Botânica Johnsons — Conta de compras e vendas\nCenário: ${scenarioNames[shoppingScenario]}\n\n` + shoppingLines.map((line,index)=>{
      const quantity = Number(line.quantity).toLocaleString('pt-BR');
      const basis = line.basis === 'lot' ? `lote(s) de ${line.lotSize} un.` : 'un.';
      return `${index+1}. ${line.name}${line.custom ? ' (preço ajustado)' : ''}\n${quantity} ${basis} × ${priceText(line.price)} = ${money(result.items[index].subtotalCents,true)}`;
    }).join('\n\n') + `\n\nTOTAL: ${money(result.totalCents,true)}`;
  } catch (error) {status.textContent = error.message;return;}
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Conta completa copiada!';
  } catch {
    status.textContent = 'Não foi possível copiar automaticamente.';
    document.getElementById('shopping-copy-fallback').hidden = false;
    const field = document.getElementById('shopping-copy-text'); field.value = text; field.focus(); field.select();
  }
});
// +100 counts from zero while the field still shows the untouched default of 1.
const shoppingQuantity = document.getElementById('shopping-quantity');
const plusHundred = (value, fromDefault = false) => {
  const current = Number(value);
  return Math.min(1000000, (fromDefault || !Number.isInteger(current) || current < 1 ? 0 : current) + 100);
};
function resetShoppingQuantity() { shoppingQuantity.value = '1'; shoppingQuantity.dataset.pristine = 'true'; }
shoppingQuantity.addEventListener('input', () => { delete shoppingQuantity.dataset.pristine; });
document.getElementById('shopping-plus-100').addEventListener('click', () => {
  shoppingQuantity.value = String(plusHundred(shoppingQuantity.value, shoppingQuantity.dataset.pristine === 'true'));
  delete shoppingQuantity.dataset.pristine;
});
document.getElementById('shopping-price').addEventListener('input', () => { formPriceTyped = true; });
function applyShoppingScenario(value) {
  shoppingScenario = value;
  for (const line of shoppingLines) if (!line.custom) line.price = linePrice(line);
  if (formPriceTyped) {
    const item = catalog[shoppingItem.value];
    if (item) document.getElementById('shopping-hint').textContent = 'Preço digitado mantido; ele não muda com o cenário.';
  } else setShoppingPrice();
  renderShoppingList();
}
for (const input of document.querySelectorAll('input[name="shopping-scenario"]')) input.addEventListener('change', () => applyShoppingScenario(input.value));
// A restored history entry can keep another scenario checked; follow it.
window.addEventListener('pageshow', () => {
  const checked = document.querySelector('input[name="shopping-scenario"]:checked')?.value;
  if (checked && checked !== shoppingScenario) applyShoppingScenario(checked);
});
resetShoppingQuantity();
setShoppingBasis();
renderShoppingList();

// Presentation changes preserve filters, open notes and the shopping list.
document.getElementById('full-precision').addEventListener('change', () => {
  renderCatalog(); renderItemNotes(); renderShoppingTotals();
});
