const catalogData = typeof module !== 'undefined' ? require('./data.js') : BotanicaData;
const catalogGazette = typeof module !== 'undefined' ? require('./gazette.js').gazetteItems : gazetteItems;

function buildPriceCatalog(data = catalogData) {
  const {recipes, ingredientPrices, salePrices} = data;
  const names = new Set([...recipes.map(r => r.name), ...recipes.flatMap(r => Object.keys(r.ingredients)), ...Object.keys(ingredientPrices), ...catalogGazette.map(item => item.name)]);
  return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(name => {
    const product = recipes.find(r => r.name === name);
    const gazette = catalogGazette.find(item => item.name === name);
    const price = gazette ? [gazette.min, gazette.max] : ingredientPrices[name] || (product && salePrices[product.id]);
    const usedIn = recipes.filter(r => Object.hasOwn(r.ingredients, name)).map(r => r.name);
    if (price) return {name, category: product ? 'Produto' : Object.hasOwn(ingredientPrices, name) ? 'Insumo' : 'Mercadoria', section: gazette?.section || 'Insumos do planejamento', sourceNote: gazette?.sourceNote, lotSize: gazette?.lotSize || 1, sourceMin: gazette?.sourceMin, sourceMax: gazette?.sourceMax, status: 'listed', min: price[0], median: (price[0] + price[1]) / 2, max: price[1], usedIn};

    // Only original price ranges feed the estimate. No suggested price is reused.
    const references = recipes.filter(r => Object.hasOwn(r.ingredients, name)).map(recipe => {
      const range = salePrices[recipe.id];
      const raw = Object.entries(recipe.ingredients).filter(([ingredient]) => !ingredientPrices[ingredient]);
      const quantity = raw.reduce((sum, [, count]) => sum + count, 0);
      if (!range || !quantity) throw new Error(`Referência insuficiente para ${name}`);
      const midpoint = (range[0] + range[1]) / 2;
      return {name: recipe.name, midpoint, yield: recipe.yield, quantity, ingredients: raw.map(([ingredient, count]) => ({name: ingredient, quantity: count})), value: midpoint * recipe.yield / quantity};
    });
    if (!references.length) throw new Error(`Sem referência para ${name}`);
    const suggested = references.reduce((sum, ref) => sum + ref.value, 0) / references.length;
    return {name, category: 'Matéria-prima', section: 'Matérias-primas da Botânica', status: 'suggested', suggested, references, usedIn};
  });
}

function summarizeSectors(catalog) {
  const sectors = [...new Set(catalogGazette.map(item => item.section))];
  return sectors.map(section => {
    const listed = catalog.filter(item => item.section === section && item.status === 'listed');
    const valid = listed.filter(item => item.min <= item.max);
    const values = valid.map(item => item.median).sort((a, b) => a - b);
    const center = Math.floor(values.length / 2);
    return {section, count: listed.length, analyzed: valid.length, median: values.length % 2 ? values[center] : (values[center - 1] + values[center]) / 2, min: Math.min(...valid.map(item => item.min)), max: Math.max(...valid.map(item => item.max)), averageSpread: valid.reduce((sum, item) => sum + item.max - item.min, 0) / valid.length};
  });
}

function simulateTrade(item, quantity, price, totalCost = null) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000000 || !Number.isFinite(price) || price < 0 || price > 100000000) throw new Error('Informe quantidade inteira de 1 a 1.000.000 e preço válido.');
  if (totalCost !== null && (!Number.isFinite(totalCost) || totalCost < 0 || totalCost > 100000000000000)) throw new Error('Informe um custo total válido.');
  const reference = item.status === 'suggested' ? item.suggested : item.median;
  const revenue = quantity * price;
  const deviation = reference ? (price / reference - 1) * 100 : 0;
  return {referenceTotal: quantity * reference, minTotal: item.status === 'listed' && item.min <= item.max ? quantity * item.min : null, maxTotal: item.status === 'listed' && item.min <= item.max ? quantity * item.max : null, revenue, deviation, profit: totalCost === null ? null : revenue - totalCost, margin: totalCost === null || revenue === 0 ? null : (revenue - totalCost) / revenue * 100};
}

if (typeof module !== 'undefined') module.exports = {buildPriceCatalog, summarizeSectors, simulateTrade};
