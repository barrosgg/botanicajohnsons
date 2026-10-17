const {test} = require('node:test');
const assert = require('node:assert/strict');
const {recipes, ingredientPrices, salePrices, ingredientPriceSources} = require('./data.js');
const county = require('./county-prices.js');
const {readFileSync}=require('node:fs');
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
  const expected = new Set([...gazetteItems.map(row => county.canonicalName(row.name)), ...county.rows.map(row => row.name), ...recipes.map(r => r.name), ...recipes.flatMap(r => Object.keys(r.ingredients))]);
  assert.equal(catalog.length, 463);
  assert.deepEqual(new Set(catalog.map(row => row.name)), expected);
  assert.equal(catalog.filter(row => row.status === 'suggested').length, 2);
  for (const row of catalog) assert.ok((row.suggested ?? row.median) > 0);
});

test('original calculator price ranges and precise midpoints stay intact', () => {
  for (const [name, [min, max]] of Object.entries(ingredientPrices)) {
    const quote=item(ingredientPriceSources[name]?.name || name);
    assert.equal(quote.status, 'listed');
    assert.equal(quote.min,min);assert.equal(quote.max,max);close(quote.median,(min+max)/2);
  }
  for (const recipe of recipes) assert.deepEqual([item(recipe.name).min, item(recipe.name).max], salePrices[recipe.id]);
});

test('remaining suggestions average official comparable prices without rounding first', () => {
  assert.equal(item('Mel').suggested, (6 + 1.5) / 2);
  assert.equal(item('Tomilho').suggested, 0.325);
  assert.equal(item('Tomilho').references.length,7);
  for (const row of catalog.filter(row => row.status === 'suggested')) for (const ref of row.references) {
    assert.equal(item(ref.name).status,'listed');
    close(ref.value,(ref.min+ref.max)/2);
  }
  assert.deepEqual(estimateCosts({'Mel':10,'Tomilho':10}).missing,['Mel','Tomilho']);
});

test('official update replaces twelve prior suggestions and preserves separate plant origins', () => {
  for(const name of ['Esterco','Húmus','Ginseng do Alasca','Girassol','Hortelã-brava','Milefólio','Orégano','Papoula-da-pradaria','Rosa','Sálvia-beija-flor','Tabaco','Tanaceto']) {
    assert.equal(item(name).status,'listed');
    assert.equal(item(name).source,'Atualização do condado');
  }
  assert.equal(item('Rosa').min,0.22);
  assert.equal(item('Rosa (v)').min,0.3);
  assert.equal(item('Rosa (coleta)').min,0.15);
  assert.deepEqual(ingredientPrices.Rosa,[0.3,0.35]);
  assert.equal(ingredientPriceSources.Rosa.origin,'Fazenda Venda');
  assert.equal(ingredientPriceSources['Húmus'].origin,'Coleta');
  assert.equal(item('Leite').min,0.3);
  assert.equal(item('Leite').previousPrice.min,4);
  assert.equal(item('Carne de Peixe').min,0.2);
  assert.equal(item('Carne de Peixe').previousPrice.min,4);
});

test('all supplied unit and lot prices match the catalog and identical duplicates occur once', () => {
  let sourceRows=0;
  for(const file of ['data/atualizacao-condado.tsv','data/atualizacao-coleta.tsv']) {
    const lines=readFileSync(file,'utf8').trim().split(/\r?\n/).slice(1);
    const currency=text=>Number(text.replace('$','').replace(',','.'))*100;
    for(const line of lines){
      sourceRows++;
      const [original,,origin,min,max,lotMin,lotMax,lot]=line.split('\t');
      const name=original==='Humus'?'Húmus':original==='Rosa'&&origin==='Coleta'?'Rosa (coleta)':original;
      const quote=item(name);
      assert.equal(quote.origin,origin);
      close(quote.min,currency(min));close(quote.max,currency(max));
      close(quote.sourceMin,currency(lotMin));close(quote.sourceMax,currency(lotMax));
      assert.equal(quote.lotSize,Number(lot));
      close(quote.min*quote.lotSize,quote.sourceMin);close(quote.max*quote.lotSize,quote.sourceMax);
    }
  }
  assert.equal(sourceRows,150);
  assert.equal(county.rows.length,148);
  assert.equal(catalog.filter(row=>row.name==='Papoula-da-pradaria').length,1);
  assert.equal(catalog.filter(row=>row.name==='Papoula-da-pradaria (v)').length,1);
  assert.equal(item('Semente de Agarita').min,0.22);
  assert.equal(item('Pacote de Semente de Agarita').min,3);
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
  assert.equal(item('Carvão Bruto').lotSize, 100);
  assert.equal(item('Carvão Bruto').min, 0.13);
  assert.equal(item('Carvão Bruto').sourceMin, 13);
  assert.equal(item('Ouro').min, 2);
  assert.equal(item('Prata').max, 1);
  assert.equal(simulateTrade(item('Carvão Bruto'),100,0.14).minTotal,13);
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
