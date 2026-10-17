const catalog = buildPriceCatalog();
const money = cents => {
  // Shift the decimal as a string so formatting 0.325 cents yields $0.00325,
  // without introducing a binary division tail in the full precision view.
  const [coefficient, exponent = '0'] = String(cents).split('e');
  return '$' + new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: document.getElementById('full-precision').checked ? 20 : 2}).format(`${coefficient}e${Number(exponent) - 2}`);
};
const noteId = name => 'nota-' + name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const suggestedItems = catalog.filter(item => item.status === 'suggested');
document.getElementById('category').innerHTML = '<option value="all">Todas as seções</option>' + [...new Set(catalog.map(item => item.section))].sort((a,b) => a.localeCompare(b,'pt-BR')).map(section => `<option>${section}</option>`).join('');
document.getElementById('origin').innerHTML = '<option value="all">Todas as origens</option>' + [...new Set(catalog.map(item => item.origin))].sort((a,b) => a.localeCompare(b,'pt-BR')).map(origin => `<option>${origin}</option>`).join('');
const referencePrice = item => item.status === 'suggested' ? item.suggested : item.median;
let visibleCatalog = catalog;
document.getElementById('catalog-summary').innerHTML = [
  [catalog.length, 'itens no catálogo'],
  [catalog.length - suggestedItems.length, 'preços cadastrados'],
  [suggestedItems.length, 'preços sugeridos']
].map(([count, label]) => `<div><strong>${count}</strong><span>${label}</span></div>`).join('');

function renderItemNotes() {
  const openNotes = new Set([...document.querySelectorAll('#item-notes details[open]')].map(note => note.id));
  document.getElementById('item-notes').innerHTML = suggestedItems.map(item => `
  <details id="${noteId(item.name)}" class="item-note">
    <summary><span>${item.name}<small>${item.references.map(ref => ref.name).join(' · ')}</small></span><span class="suggested-value">${money(item.suggested)}<small>Preço sugerido / un.</small></span></summary>
    <div class="note-body"><p>${item.methodology}</p>
    <ol>${item.references.map(ref => `<li><strong>${ref.name}:</strong> (${money(ref.min)} + ${money(ref.max)}) ÷ 2 = <strong>${money(ref.value)} / un.</strong>.<br><span class="raw-detail">${ref.source} · ${ref.origin}</span></li>`).join('')}</ol>
    <p class="note-result">${item.references.length > 1 ? `Média simples: (${item.references.map(ref => money(ref.value)).join(' + ')}) ÷ ${item.references.length}` : 'Resultado da referência única'} = <strong>${money(item.suggested)} / un.</strong></p>
    <p class="raw-detail">Estimativa por itens correlatos, sem cotação específica nem garantia de margem. Valores exibidos são arredondados; a média usa os valores completos.</p></div>
  </details>`).join('');
  for (const id of openNotes) document.getElementById(id).open = true;
}
renderItemNotes();

function openNoteFromHash() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches('details.item-note')) target.open = true;
}
window.addEventListener('hashchange', openNoteFromHash);
openNoteFromHash();

const normalizeSearch = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function renderCatalog() {
  const query = normalizeSearch(document.getElementById('search').value.trim());
  const category = document.getElementById('category').value;
  const status = document.getElementById('status').value;
  const origin = document.getElementById('origin').value;
  const visible = catalog.filter(item => normalizeSearch([item.name, item.originalName || '', ...(item.aliases || [])].join(' ')).includes(query) && (category === 'all' || category === item.section) && (status === 'all' || status === item.status) && (origin === 'all' || origin === item.origin));
  const order = document.getElementById('sort').value;
  if (order === 'low') visible.sort((a, b) => referencePrice(a) - referencePrice(b));
  if (order === 'high') visible.sort((a, b) => referencePrice(b) - referencePrice(a));
  if (order === 'spread') visible.sort((a, b) => (b.status === 'listed' && b.max >= b.min ? b.max - b.min : -1) - (a.status === 'listed' && a.max >= a.min ? a.max - a.min : -1));
  visibleCatalog = visible;
  document.getElementById('price-rows').innerHTML = visible.map(item => {
    const suggested = item.status === 'suggested';
    return `<tr><th scope="row">${item.name}<small>${item.section} · ${item.category} · ${item.origin}</small></th><td><span class="price-badge ${suggested ? 'is-suggested' : ''}">${suggested ? 'Preço sugerido' : 'Cadastrado'}</span></td><td class="price-number">${suggested ? '—' : money(item.min)}</td><td class="price-number price-main">${money(suggested ? item.suggested : item.median)}</td><td class="price-number">${suggested ? '—' : money(item.max)}</td><td>${suggested ? `<a href="#${noteId(item.name)}">Ver cálculo ↗</a>` : `${item.source}${item.sourceNote ? `<small class="source-warning">${item.sourceNote}</small>` : ''}`}</td></tr>`;
  }).join('');
  document.getElementById('result-count').textContent = `${visible.length} de ${catalog.length} itens · ${visible.filter(item => item.status === 'suggested').length} com preço sugerido`;
  document.getElementById('no-results').hidden = visible.length > 0;
}
document.getElementById('price-rows').addEventListener('click', event => {
  const link = event.target.closest('a[href^="#nota-"]');
  if (!link) return;
  const note = document.getElementById(link.hash.slice(1));
  note.open = true;
  note.querySelector('summary').focus();
});
document.getElementById('search').addEventListener('input', renderCatalog);
document.getElementById('category').addEventListener('change', renderCatalog);
document.getElementById('status').addEventListener('change', renderCatalog);
document.getElementById('origin').addEventListener('change', renderCatalog);
document.getElementById('sort').addEventListener('change', renderCatalog);
renderCatalog();

document.getElementById('export-csv').addEventListener('click', () => {
  const decimal = value => value == null ? '' : (value / 100).toFixed(8).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const rows = [['Item', 'Seção', 'Situação', 'Fonte', 'Obtenção', 'Mínimo ($/un.)', 'Médio ($/un.)', 'Máximo ($/un.)', 'Sugerido ($/un.)', 'Unidades por lote', 'Mínimo do lote ($)', 'Máximo do lote ($)', 'Nota / metodologia'], ...visibleCatalog.map(item => [item.name, item.section, item.status === 'suggested' ? 'Preço sugerido' : 'Cadastrado', item.source || 'Estimativa', item.origin, decimal(item.min), decimal(item.median), decimal(item.max), decimal(item.suggested), item.lotSize || '', decimal(item.sourceMin), decimal(item.sourceMax), item.sourceNote || (item.references ? item.methodology + ' ' + item.references.map(ref => `${ref.name}: (${decimal(ref.min)} + ${decimal(ref.max)}) ÷ 2 = ${decimal(ref.value)}`).join(' | ') + '; média simples dos pontos médios.' : item.source)])];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'economia-condado.csv';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

function renderSectorSummary() {
  document.getElementById('sector-summary').innerHTML = summarizeSectors(catalog).map(sector => `<article class="sector-card"><h3>${sector.section}</h3><p>${sector.count} mercadorias · ${sector.analyzed} faixas analisadas</p><dl><div><dt>Mediana das referências</dt><dd>${money(sector.median)}</dd></div><div><dt>Menor mínimo / maior máximo</dt><dd>${money(sector.min)} / ${money(sector.max)}</dd></div><div><dt>Amplitude média das faixas</dt><dd>${money(sector.averageSpread)}</dd></div></dl></article>`).join('');
}
renderSectorSummary();

const simulationItem = document.getElementById('sim-item');
simulationItem.innerHTML = catalog.map((item, index) => `<option value="${index}">${item.name}${item.status === 'suggested' ? ' (sugerido)' : ''}</option>`).join('');
function setSimulationReference() {
  document.getElementById('sim-price').value = (referencePrice(catalog[simulationItem.value]) / 100).toFixed(5);
  updateSimulation();
}
function updateSimulation() {
  const selected = catalog[simulationItem.value];
  const quantityField = document.getElementById('sim-quantity');
  const priceField = document.getElementById('sim-price');
  const costField = document.getElementById('sim-cost');
  const resultElement = document.getElementById('simulation-result');
  const note = document.getElementById('simulation-note');
  try {
    if (!quantityField.value || !priceField.value) throw new Error('Informe a quantidade e o preço negociado para simular.');
    const result = simulateTrade(selected, Number(quantityField.value), Number(priceField.value) * 100, costField.value === '' ? null : Number(costField.value) * 100);
    const percent = value => value.toLocaleString('pt-BR', {maximumFractionDigits: 2}) + '%';
    resultElement.innerHTML = [
      ['Total pela referência', money(result.referenceTotal)],
      ['Total negociado', money(result.revenue)],
      ['Diferença da referência', percent(result.deviation)],
      ['Resultado bruto', result.profit === null ? 'Informe o custo' : money(result.profit)],
      ['Margem bruta sobre a venda', result.margin === null ? '—' : percent(result.margin)]
    ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    note.textContent = `${result.minTotal === null ? 'Sem faixa válida de mínimo e máximo.' : `Faixa de referência para a quantidade: ${money(result.minTotal)} a ${money(result.maxTotal)}.`} ${selected.status === 'suggested' ? 'Referência sugerida pela média dos preços de itens correlatos.' : 'Referência central: ponto médio da faixa cadastrada.'} Resultado bruto = total negociado − custo total informado. Margem = resultado bruto ÷ total negociado; não se aplica a venda de valor zero. Não inclui despesas que você não informar.${selected.sourceNote ? ' ' + selected.sourceNote : ''}`;
  } catch (error) {
    resultElement.textContent = error.message;
    note.textContent = '';
  }
}
simulationItem.addEventListener('change', setSimulationReference);
for (const id of ['sim-quantity', 'sim-price', 'sim-cost']) document.getElementById(id).addEventListener('input', updateSimulation);
setSimulationReference();

// Change presentation only; keep filters, open notes and entered simulation values.
document.getElementById('full-precision').addEventListener('change', () => {
  renderCatalog();
  renderItemNotes();
  renderSectorSummary();
  updateSimulation();
});
