const catalogData = typeof module !== 'undefined' ? require('./data.js') : BotanicaData;
const catalogGazette = typeof module !== 'undefined' ? require('./gazette.js').gazetteItems : gazetteItems;
const catalogCounty = typeof module !== 'undefined' ? require('./county-prices.js') : CountyPrices;
// Current official prices resolve to hundredths of a cent (four decimal dollars).
// Average in that integer scale to avoid floating point tails such as 0.0032499999.
const rangeMidpoint = (min, max) => (Math.round(min * 100) + Math.round(max * 100)) / 200;

function buildPriceCatalog(data = catalogData) {
  const {recipes, ingredientPrices, salePrices} = data;
  const registered = new Map(catalogGazette.map(item => [catalogCounty.canonicalName(item.name), {...item, name: catalogCounty.canonicalName(item.name), source: 'Gazeta Comercial', origin: 'Gazeta Comercial'}]));
  const currency = cents => '$' + (cents / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 8});
  for (const row of catalogCounty.rows) {
    const previous = registered.get(row.name);
    const section = row.origin === 'Mineração' ? 'Minérios' : row.origin === 'Lenhador' ? 'Lenhador' : row.origin === 'Coleta' ? 'Coleta' : 'Fazendas';
    const history = previous && (previous.min !== row.min || previous.max !== row.max)
      ? ` Substitui a faixa anterior da Gazeta: ${currency(previous.min)} a ${currency(previous.max)} por unidade.` : '';
    registered.set(row.name, {...row, section, aliases: Object.entries(catalogCounty.aliases).filter(([, target]) => target === row.name).map(([alias]) => alias), source: 'Atualização do condado', previousPrice: previous,
      sourceNote: `${row.origin}.${row.originalName ? ` Nome na fonte: ${row.originalName}; identificado aqui como ${row.name}.` : ''} Lote de ${row.lotSize} un.: ${currency(row.sourceMin)} a ${currency(row.sourceMax)}. A planilha já informa preços unitários; não foram divididos novamente.${history}`});
  }
  const names = new Set([...recipes.map(r => r.name), ...recipes.flatMap(r => Object.keys(r.ingredients)), ...Object.keys(ingredientPrices), ...registered.keys()]);
  const comparableNames = {
    'Tomilho': ['Orégano (v)', 'Hortelã-brava (v)', 'Sálvia-beija-flor (v)', 'Sálvia-vermelha (v)', 'Milefólio (v)', 'Tanaceto (v)', 'Lavanda (v)']
  };
  const reasons = {
    'Tomilho': 'Média dos preços de venda de sete ervas e plantas aromáticas ou medicinais. Usa Fazenda Venda, a mesma base escolhida para a compra dos insumos no planejamento.'
  };
  return [...names].sort((a,b) => a.localeCompare(b,'pt-BR')).map(name => {
    const product = recipes.find(r => r.name === name);
    const quote = registered.get(name);
    const price = quote ? [quote.min, quote.max] : ingredientPrices[name] || (product && salePrices[product.id]);
    const usedIn = recipes.filter(r => Object.hasOwn(r.ingredients, name)).map(r => r.name);
    if (price) return {...quote, name, category: product ? 'Produto' : Object.hasOwn(ingredientPrices, name) || quote?.source === 'Atualização do condado' ? 'Insumo' : 'Mercadoria', section: quote?.section || 'Insumos do planejamento', source: quote?.source || 'Gazeta Comercial', origin: quote?.origin || 'Gazeta Comercial', lotSize: quote?.lotSize || 1, status: 'listed', min:price[0], median:rangeMidpoint(price[0],price[1]), max:price[1], usedIn};
    if (!comparableNames[name]) throw new Error(`Sem referência para ${name}`);
    const references = comparableNames[name].map(refName => {
      const ref = registered.get(refName);
      if (!ref) throw new Error(`Referência ausente: ${refName}`);
      return {name:ref.name, min:ref.min, max:ref.max, value:rangeMidpoint(ref.min,ref.max), source:ref.source, origin:ref.origin};
    });
    const suggested = references.reduce((sum, ref) => sum + Math.round(ref.min * 100) + Math.round(ref.max * 100), 0) / (references.length * 200);
    return {name, category:'Matéria-prima', section:'Matérias-primas da Botânica', origin:'Estimado por similares', status:'suggested', suggested, references, methodology:reasons[name], usedIn};
  });
}

function buildEconomyCatalog(data = catalogData) {
  const excluded = new Set(['Fazenda Coleta', 'Fazenda Plantação']);
  const saleName = name => name.replace(/ \(v\)$/, '');
  return buildPriceCatalog(data).flatMap(item => {
    let quote = item;
    if (excluded.has(item.origin)) {
      // A collection quote must not hide an independently supplied Gazeta quote.
      if (!item.previousPrice || excluded.has(item.previousPrice.origin)) return [];
      quote = {...item.previousPrice, category:item.category, status:'listed', median:rangeMidpoint(item.previousPrice.min,item.previousPrice.max)};
    }
    const name = quote.origin === 'Fazenda Venda' ? saleName(quote.name) : quote.name;
    return [{...quote, name, aliases:[...(quote.aliases || []), ...(name === quote.name ? [] : [quote.name])], references:quote.references?.map(ref => ({...ref, name:saleName(ref.name)}))}];
  }).sort((a,b) => a.name.localeCompare(b.name,'pt-BR'));
}

function simulateTrade(item, quantity, price, totalCost = null) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000000 || !Number.isFinite(price) || price < 0 || price > 100000000) throw new Error('Informe quantidade inteira de 1 a 1.000.000 e preço válido.');
  if (totalCost !== null && (!Number.isFinite(totalCost) || totalCost < 0 || totalCost > 100000000000000)) throw new Error('Informe um custo total válido.');
  const reference = item.status === 'suggested' ? item.suggested : item.median;
  const revenue = quantity * price;
  const deviation = reference ? (price / reference - 1) * 100 : 0;
  return {referenceTotal: quantity * reference, minTotal: item.status === 'listed' && item.min <= item.max ? quantity * item.min : null, maxTotal: item.status === 'listed' && item.min <= item.max ? quantity * item.max : null, revenue, deviation, profit: totalCost === null ? null : revenue - totalCost, margin: totalCost === null || revenue === 0 ? null : (revenue - totalCost) / revenue * 100};
}

// Shopping calculator prices per scenario, in cents. Lot prices come straight from
// the source lot range; suggestions have a single estimate for every scenario.
function scenarioPrice(item, scenario, basis = 'unit') {
  if (item.status === 'suggested') return item.suggested;
  const [min, max] = basis === 'lot' ? [item.sourceMin, item.sourceMax] : [item.min, item.max];
  if (!['min', 'median', 'max'].includes(scenario) || !Number.isFinite(min) || !Number.isFinite(max)) throw new Error('Cenário ou preço indisponível.');
  return scenario === 'min' ? min : scenario === 'max' ? max : rangeMidpoint(min, max);
}

function calculateShoppingList(lines) {
  // Five decimal dollars cover the supplied unit prices and their midpoints.
  // Sum integer amounts so small prices and large quantities stay exact.
  const asCents = amount => `${amount / 1000n}.${String(amount % 1000n).padStart(3, '0')}`;
  let total = 0n;
  const items = lines.map(line => {
    const quantity = Number(line.quantity);
    const price = String(line.price).trim();
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000000) throw new Error('Informe uma quantidade inteira de 1 a 1.000.000.');
    if (!/^\d+(?:\.\d{1,5})?$/.test(price) || Number(price) > 1000000) throw new Error('Informe um preço de 0 a 1.000.000, com até cinco casas decimais.');
    const [whole, fraction = ''] = price.split('.');
    const scaledPrice = BigInt(whole) * 100000n + BigInt(fraction.padEnd(5, '0'));
    const subtotal = BigInt(quantity) * scaledPrice;
    total += subtotal;
    return {subtotalCents: asCents(subtotal)};
  });
  return {items, totalCents: asCents(total)};
}

if (typeof module !== 'undefined') module.exports = {buildPriceCatalog, buildEconomyCatalog, simulateTrade, scenarioPrice, calculateShoppingList};
