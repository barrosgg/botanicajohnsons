const {test} = require('node:test');
const assert = require('node:assert/strict');
const {recipes, ingredientPrices, salePrices} = require('./data.js');
const {gazetteItems} = require('./gazette.js');
const {buildPriceCatalog, summarizeSectors, simulateTrade} = require('./price-catalog.js');
const {estimateCosts} = require('./app.js');
const catalog = buildPriceCatalog();
const item = name => catalog.find(row => row.name === name);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('all 323 gazette entries match the visible section totals without duplicates', () => {
  assert.equal(gazetteItems.length, 323);
  assert.equal(new Set(gazetteItems.map(row => row.name)).size, 323);
  assert.deepEqual(gazetteItems.reduce((totals, row) => (totals[row.section] = (totals[row.section] || 0) + 1, totals), {}), {'Fazendas':41,'Botânicos':13,'Ateliês':4,'Estábulos':7,'Hospital':4,'Tabacarias':8,'Tipografias':16,'Fábricas':23,'Armazém':29,'Armarias':28,'Nativos':39,'Salões':103,'Minérios':8});
});

test('catalog covers every gazette entry, product and ingredient exactly once', () => {
  const expected = new Set([...gazetteItems.map(row => row.name), ...recipes.map(r => r.name), ...recipes.flatMap(r => Object.keys(r.ingredients))]);
  assert.equal(catalog.length, 337);
  assert.deepEqual(new Set(catalog.map(row => row.name)), expected);
  assert.equal(catalog.filter(row => row.status === 'suggested').length, 14);
  for (const row of catalog) assert.ok((row.suggested ?? row.median) > 0);
});

test('original calculator price ranges and precise midpoints stay intact', () => {
  for (const [name, [min, max]] of Object.entries(ingredientPrices)) {
    assert.equal(item(name).status, 'listed');
    assert.deepEqual([item(name).min, item(name).median, item(name).max], [min, (min + max) / 2, max]);
  }
  for (const recipe of recipes) assert.deepEqual([item(recipe.name).min, item(recipe.name).max], salePrices[recipe.id]);
});

test('single-reference suggestions account for batch yields and unpriced quantities', () => {
  assert.equal(item('Húmus').suggested, 1.5 * 50 / 30);
  assert.equal(item('Esterco').suggested, 2.5);
  close(item('Orégano').suggested, 7 * 5 / 15);
  assert.equal(item('Mel').suggested, 12.5 * 5 / 10);
});

test('shared ingredients average independent recipe references without early rounding', () => {
  close(item('Rosa').suggested, (14 * 5 / 10 + 12.5 * 5 / 30) / 2);
  close(item('Girassol').suggested, (14 * 5 / 10 + 12.5 * 5 / 10 + 12.5 * 5 / 30) / 3);
  close(item('Sálvia-beija-flor').suggested, (6 * 5 / 15 + 7 * 5 / 15) / 2);
  for (const row of catalog.filter(row => row.status === 'suggested')) for (const ref of row.references) {
    assert.equal(ref.ingredients.reduce((sum, ingredient) => sum + ingredient.quantity, 0), ref.quantity);
    assert.ok(ref.ingredients.every(ingredient => !ingredientPrices[ingredient.name]));
  }
  assert.deepEqual(estimateCosts({'Rosa': 10}).missing, ['Rosa']);
  assert.equal(ingredientPrices.Rosa, undefined);
});

test('anomalies and fixed prices are preserved; sector study excludes inverted ranges', () => {
  const escova = item('Escova Equina');
  assert.deepEqual([escova.min, escova.max], [6, 5]);
  assert.ok(escova.sourceNote.includes('invertida'));
  assert.equal(item('Ave · Águia').median, 150000);
  assert.deepEqual([item('Peças Importadas').min, item('Peças Importadas').max], [800,800]);
  const stable = summarizeSectors(catalog).find(sector => sector.section === 'Estábulos');
  assert.equal(stable.count, 7); assert.equal(stable.analyzed, 6);
  assert.equal(summarizeSectors(catalog).find(sector => sector.section === 'Salões').median, 17.5);
});

test('mineral lot prices are normalized per unit while source lots remain available', () => {
  assert.equal(item('Carvão').lotSize, 100);
  assert.equal(item('Carvão').min, 0.13);
  assert.equal(item('Carvão').sourceMin, 13);
  assert.equal(item('Ouro bruto').min, 2);
  assert.equal(item('Prata bruta').max, 1);
  assert.equal(simulateTrade(item('Carvão'),100,0.14).minTotal,13);
});

test('trade simulation handles profit, loss, missing costs, free sales and invalid input', () => {
  const trade = simulateTrade(item('Perfume'), 100, 15, 1000);
  assert.equal(trade.revenue, 1500); assert.equal(trade.profit, 500);
  close(trade.margin, 100/3); close(trade.deviation, (15/14-1)*100);
  assert.equal(trade.minTotal, 1200); assert.equal(trade.maxTotal, 1600);
  assert.equal(simulateTrade(item('Mel'), 10, 5).profit, null);
  assert.equal(simulateTrade(item('Mel'), 10, 5).minTotal, null);
  assert.equal(simulateTrade(item('Perfume'), 2, 0, 10).margin, null);
  assert.equal(simulateTrade(item('Perfume'), 2, 0, 10).profit, -10);
  assert.equal(simulateTrade(item('Escova Equina'), 2, 5).minTotal, null);
  for (const quantity of [-1, 0, 1.5, Infinity, NaN]) assert.throws(() => simulateTrade(item('Perfume'), quantity, 10));
  assert.throws(() => simulateTrade(item('Perfume'), 2, -1));
  assert.throws(() => simulateTrade(item('Perfume'), 2, 1, -1));
});
