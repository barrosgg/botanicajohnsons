const {test} = require('node:test');
const assert = require('node:assert/strict');
const {recipes, ingredientPrices, salePrices, ingredientPriceSources} = require('./data.js');
const county = require('./county-prices.js');
const {readFileSync}=require('node:fs');
const {gazetteItems} = require('./gazette.js');
const {buildPriceCatalog, buildEconomyCatalog, simulateTrade} = require('./price-catalog.js');
const {estimateCosts} = require('./app.js');
const catalog = buildPriceCatalog();
const item = name => catalog.find(row => row.name === name);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('gazette XLIV entries match the supplied pages and entries absent from it are removed', () => {
  const sections = rows => rows.reduce((totals, row) => (totals[row.section] = (totals[row.section] || 0) + 1, totals), {});
  assert.equal(gazetteItems.length, 379);
  assert.equal(new Set(gazetteItems.map(row => row.name)).size, 379);
  assert.ok(gazetteItems.every(row => row.edition === 'XLIV'));
  // Sidebar card counts of the edition; Salões prints Cerveja twice (106 cards).
  assert.deepEqual(sections(gazetteItems), {'Fazendas':49,'Botânicos':19,'Ateliês':5,'Estábulos':9,'Hospital':6,'Tabacarias':8,'Tipografias':17,'Fábricas':25,'Armazém':29,'Armarias':47,'Nativos':47,'Salões':105,'Minérios':13});
  for (const name of ['Polpa de Manga','Pacote de Semente de Agarita','Essência de Fertilidade','Tomahawk','Pena de Ave Pequena','Flecha de Rastreio','Carne de Galinha']) assert.equal(gazetteItems.some(row => row.name === name), false, name);
  assert.deepEqual(gazetteItems.filter(row => row.isNew).map(row => row.name), ['Cruza de Cavalos (por cruza)', 'Moedor Fixo', 'Rede de Pesca Grande', 'Tocha']);
  assert.ok(gazetteItems.filter(row => row.isNew).every(row => row.sourceNote.includes('Novo na edição XLIV')));
  assert.equal(gazetteItems.filter(row => /Na (edição XLII|atualização de 27\/10\/2026): \$/.test(row.sourceNote || '')).length, 31);
  assert.ok(gazetteItems.filter(row => row.section === 'Salões').every(row => row.min === 30 && row.max === 35));
  const gazette = name => gazetteItems.find(row => row.name === name);
  assert.deepEqual([gazette('Mel').min, gazette('Mel').max], [4, 5]);
  assert.deepEqual([gazette('Carne Bovina').min, gazette('Carne Bovina').max], [22, 34]);
  assert.deepEqual([gazette('Minhocário').min, gazette('Minhocário').max], [115, 135]);
  assert.ok(gazette('Semente Melhorada').aliases.includes('Semente Melhorada de Milho'));
  assert.deepEqual([gazette('Semente Melhorada').min, gazette('Semente Melhorada').max, gazette('Semente Melhorada').lotSize], [0.4, 0.6, 100]);
  // $1,00 is the price of a lot of 1,000, as confirmed by the user.
  assert.deepEqual([gazette('Semente Selecionada').min, gazette('Semente Selecionada').lotSize, gazette('Semente Selecionada').sourceMin], [0.1, 1000, 100]);
  assert.equal(gazette('Rainha Mansa').section, 'Botânicos');
  assert.deepEqual(gazette('Saca Vazia').aliases, ['Saca']);
  assert.ok(gazette('Cerveja').sourceNote.includes('duas vezes'));
  assert.deepEqual([gazette('Enxofre').min, gazette('Enxofre').lotSize], [0.4, 100]);
  assert.deepEqual([gazette('Diamante').min, gazette('Diamante').max], [250, 350]);
});

test('edition XLIV changes 31 ranges, renames, moves and adds Gazeta items', () => {
  const gazette = name => gazetteItems.find(row => row.name === name);
  const changed = {'Chocolate':[5, 7], 'Geléia de Pimenta':[5, 7], 'Iogurte':[9, 11], 'Queijo':[10, 12], 'Linha de Algodão':[4, 6],
    'Ração de Cavalo':[12, 14], 'Tônico de Cura Equino':[15, 17], 'Bala de Mel':[7, 9], 'Caixa de Cigarros':[68, 88], 'Charuto':[22, 28],
    'Combo Tabacaria':[39, 50], 'Fósforo':[10, 13], 'Goma de Tabaco':[9, 12], 'Isqueiro':[26, 34], 'Jornal':[130, 150],
    'Cantil Vazio':[70, 90], 'Combo Armazém':[48, 62], 'Kit de Reparo de Arma':[20, 25], 'Caixa de Munição Espingarda (N)':[65, 70],
    'Caixa de Munição Pistola (E)':[68, 73], 'Caixa de Munição Pistola (N)':[40, 45], 'Caixa de Munição Repetidora (E)':[98, 103],
    'Caixa de Munição Repetidora (N)':[68, 73], 'Caixa de Munição Revólver (E)':[63, 68], 'Caixa de Munição Revólver (N)':[43, 48],
    'Caixa de Munição Rifle (E)':[83, 88], 'Caixa de Munição Rifle (N)':[48, 53], 'Caixa de Munição Rifle de Caça…':[67, 72],
    'Caixa de Munição Rifle de Elefante…':[147, 157], 'Combo Armaria':[107, 125], 'Flecha (N)':[50, 75]};
  assert.equal(Object.keys(changed).length, 31);
  for (const [name, [min, max]] of Object.entries(changed)) assert.deepEqual([gazette(name).min, gazette(name).max, gazette(name).isNew], [min, max, false], name);
  // The note names where the previous range came from.
  assert.equal(gazette('Fósforo').sourceNote, 'Na edição XLII: $0,07 a $0,09.');
  assert.equal(gazette('Bala de Mel').sourceNote, 'Na atualização de 27/10/2026: $0,06 a $0,08.');
  assert.equal(gazette('Kit de Reparo de Arma').sourceNote, 'Na edição XLII: $0,16 a $0,20, em Armazém.');
  const added = {'Cruza de Cavalos (por cruza)':['Estábulos', 2000, 3000], 'Moedor Fixo':['Fábricas', 600, 840], 'Rede de Pesca Grande':['Armazém', 40, 50], 'Tocha':['Nativos', 200, 400]};
  for (const [name, [section, min, max]] of Object.entries(added)) assert.deepEqual([gazette(name).section, gazette(name).min, gazette(name).max, gazette(name).isNew], [section, min, max, true], name);
  assert.deepEqual([gazette('Kit de Reparo de Arma').section, gazette('Lanterna').section, gazette('Lanterna').min, gazette('Lanterna').max], ['Armarias', 'Armarias', 800, 950]);
  assert.deepEqual([gazette('Carne de Ave').min, gazette('Carne de Ave').max, gazette('Carne de Ave').aliases, gazette('Carne de Ave').isNew], [4, 6, ['Carne de Galinha'], false]);
  assert.equal(item('Carne de Galinha'), undefined);
  assert.deepEqual(gazette('Combo Tabacaria').aliases, ['Combo de Tabacaria']);
  // Martelo de Reparo and Vela keep their ranges and stay in Armazém.
  assert.deepEqual([gazette('Martelo de Reparo').section, gazette('Martelo de Reparo').min, gazette('Martelo de Reparo').sourceNote], ['Armazém', 16, undefined]);
  assert.deepEqual([item('Lanterna').median, item('Vela').median], [875, 25]);
});

test('XLIV origin tables raise farm plant lots, sell Ovo by 50 and add Semente de Tabaco', () => {
  assert.equal(county.spreadsheetRows.length, 148);
  assert.equal(county.rows.length, 164);
  const row = name => county.rows.find(entry => entry.name === name);
  const origins = county.rows.reduce((totals, entry) => (totals[entry.origin] = (totals[entry.origin] || 0) + 1, totals), {});
  assert.deepEqual(origins, {'Fazenda Coleta':4, 'Fazenda Plantação':59, 'Fazenda Venda':59, 'Lenhador':5, 'Mineração':13, 'Coleta':24});
  // Cannabis, Coca and Papoula-do-ópio keep their lots; every other plant doubles or almost.
  const kept = new Set(['Cannabis', 'Coca', 'Papoula-do-ópio']);
  for (const entry of county.rows.filter(entry => entry.origin === 'Fazenda Plantação')) assert.deepEqual([entry.lotSize, entry.sourceMin, entry.sourceMax], kept.has(entry.name) ? [100, 22, 25] : [100, 45, 50], entry.name);
  for (const entry of county.rows.filter(entry => entry.origin === 'Fazenda Venda')) assert.deepEqual([entry.lotSize, entry.sourceMin, entry.sourceMax], kept.has(entry.name.replace(' (v)', '')) ? [100, 30, 35] : [100, 60, 70], entry.name);
  assert.deepEqual([row('Rosa (v)').min, row('Rosa (v)').max, row('Rosa (v)').note], [0.6, 0.7, 'Na edição XLII: $0,30 a $0,35 o lote de 100.']);
  assert.deepEqual([row('Ovo').lotSize, row('Ovo').sourceMin, row('Ovo').sourceMax, row('Ovo').min, row('Ovo').max], [50, 50, 80, 1, 1.6]);
  assert.deepEqual([row('Mocotó').lotSize, row('Mocotó').sourceMin, row('Mocotó').sourceMax], [20, 10, 20]);
  assert.deepEqual([row('Tronco de Madeira').sourceMin, row('Tronco de Madeira').sourceMax, row('Tronco de Madeira').min], [70, 82, 0.7]);
  assert.deepEqual([row('Tora Ruim').min, row('Tora Boa').max], [0.18, 0.5]);
  assert.deepEqual([row('Tomilho').origin, row('Tomilho').min, row('Tomilho').max], ['Coleta', 0.22, 0.25]);
  assert.deepEqual([row('Minhoca Viva').min, row('Minhoca Viva').sourceMax], [1.5, 200]);
  assert.equal(county.rows.filter(entry => entry.name.startsWith('Semente de')).length, 14);
  assert.deepEqual(county.rows.filter(entry => entry.isNew).map(entry => [entry.name, entry.origin, entry.sourceMin, entry.sourceMax]), [['Semente de Tabaco', 'Coleta', 22, 25]]);
  for (const name of [...county.absentFromXLII, ...county.absentFromXLIV]) assert.equal(county.rows.some(entry => entry.name === name), false, name);
  assert.ok(row('Café (grão)') && row('Café (grão) (v)'));
  assert.ok(county.rows.every(entry => entry.note));
  // Leite and Carne de Peixe left the origin tables but remain quoted by the Gazeta.
  assert.deepEqual([item('Leite').origin, item('Leite').min], ['Gazeta Comercial', 4]);
  assert.deepEqual([item('Carne de Peixe').origin, item('Carne de Peixe').min], ['Gazeta Comercial', 7]);
  for (const name of ['Ayuhasca', 'Peyote', 'Café', 'Café (v)']) assert.equal(item(name), undefined, name);
  assert.equal(ingredientPriceSources.Tomilho.origin, 'Coleta');
});

test('catalog covers every gazette entry, product and ingredient exactly once', () => {
  const expected = new Set([...gazetteItems.map(row => county.canonicalName(row.name)), ...county.rows.map(row => row.name), ...recipes.map(r => r.name), ...recipes.flatMap(r => Object.keys(r.ingredients))]);
  assert.equal(catalog.length, 530);
  assert.deepEqual(new Set(catalog.map(row => row.name)), expected);
  assert.equal(catalog.filter(row => row.status === 'suggested').length, 0);
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

test('Mel and Tomilho are quoted since Gazeta XLII, so no suggestion remains', () => {
  assert.deepEqual([item('Mel').status, item('Mel').min, item('Mel').max], ['listed', 4, 5]);
  assert.deepEqual([item('Tomilho').status, item('Tomilho').min, item('Tomilho').max], ['listed', 0.22, 0.25]);
  assert.deepEqual(estimateCosts({'Mel':10,'Tomilho':10}).missing,[]);
});

test('official update replaces twelve prior suggestions and preserves separate plant origins', () => {
  for(const name of ['Esterco','Húmus','Ginseng do Alasca','Girassol','Hortelã-brava','Milefólio','Orégano','Papoula-da-pradaria','Rosa','Sálvia-beija-flor','Tabaco','Tanaceto']) {
    assert.equal(item(name).status,'listed');
    // Esterco and Húmus keep the county quote; XLIV re-prices the farm plants.
    assert.equal(item(name).source,['Esterco','Húmus'].includes(name) ? 'Atualização do condado' : 'Gazeta Comercial XLIV');
  }
  assert.equal(item('Rosa').min,0.45);
  assert.equal(item('Rosa (v)').min,0.6);
  assert.equal(item('Rosa (coleta)').min,0.15);
  assert.deepEqual(ingredientPrices.Rosa,[0.6,0.7]);
  assert.equal(ingredientPriceSources.Rosa.origin,'Fazenda Venda');
  assert.equal(ingredientPriceSources['Húmus'].origin,'Coleta');
  assert.equal(item('Rosa (coleta)').previousPrice,undefined);
});

test('all supplied unit and lot prices match the catalog and identical duplicates occur once', () => {
  let sourceRows=0;
  // The spreadsheets are the original county source; XLII changes are checked separately.
  const sheet=name=>county.spreadsheetRows.find(row=>row.name===name);
  for(const file of ['data/atualizacao-condado.tsv','data/atualizacao-coleta.tsv']) {
    const lines=readFileSync(file,'utf8').trim().split(/\r?\n/).slice(1);
    const currency=text=>Number(text.replace('$','').replace(',','.'))*100;
    for(const line of lines){
      sourceRows++;
      const [original,,origin,min,max,lotMin,lotMax,lot]=line.split('\t');
      const name=original==='Humus'?'Húmus':original==='Rosa'&&origin==='Coleta'?'Rosa (coleta)':original;
      const quote=sheet(name);
      assert.equal(quote.origin,origin);
      close(quote.min,currency(min));close(quote.max,currency(max));
      close(quote.sourceMin,currency(lotMin));close(quote.sourceMax,currency(lotMax));
      assert.equal(quote.lotSize,Number(lot));
      close(quote.min*quote.lotSize,quote.sourceMin);close(quote.max*quote.lotSize,quote.sourceMax);
    }
  }
  assert.equal(sourceRows,150);
  assert.equal(county.spreadsheetRows.length,148);
  assert.equal(catalog.filter(row=>row.name==='Papoula-da-pradaria').length,1);
  assert.equal(catalog.filter(row=>row.name==='Papoula-da-pradaria (v)').length,1);
  assert.equal(item('Semente de Agarita').min,0.22);
});

test('anomalies and fixed prices are preserved', () => {
  const escova = item('Escova Equina');
  assert.deepEqual([escova.min, escova.max], [5, 6]);
  assert.ok(escova.sourceNote.includes('invertida'));
  assert.equal(item('Ave · Águia').median, 150000);
  assert.deepEqual([item('Peças Importadas').min, item('Peças Importadas').max], [800,800]);

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
  const suggestion = {status:'suggested', suggested:0.325};
  assert.equal(simulateTrade(suggestion, 10, 5).profit, null);
  assert.equal(simulateTrade(suggestion, 10, 5).minTotal, null);
  assert.equal(simulateTrade(item('Perfume'), 2, 0, 10).margin, null);
  assert.equal(simulateTrade(item('Perfume'), 2, 0, 10).profit, -10);
  assert.equal(simulateTrade({status:'listed', min:6, max:5, median:5.5}, 2, 5).minTotal, null);
  for (const quantity of [-1, 0, 1.5, Infinity, NaN]) assert.throws(() => simulateTrade(item('Perfume'), quantity, 10));
  assert.throws(() => simulateTrade(item('Perfume'), 2, -1));
  assert.throws(() => simulateTrade(item('Perfume'), 2, 1, -1));
});

test('Economia hides only the two requested farm origins and preserves all other channels', () => {
  const visible=buildEconomyCatalog();
  assert.equal(visible.length,467);
  assert.equal(new Set(visible.map(row=>row.name)).size,467);
  assert.deepEqual(visible.filter(row=>row.isNew).map(row=>row.name),['Cruza de Cavalos (por cruza)','Moedor Fixo','Rede de Pesca Grande','Semente de Tabaco','Tocha']);
  assert.ok(visible.every(row=>!['Fazenda Coleta','Fazenda Plantação'].includes(row.origin)));
  for(const origin of ['Coleta','Lenhador','Mineração','Fazenda Venda','Gazeta Comercial']) assert.ok(visible.some(row=>row.origin===origin));
  for(const row of county.rows.filter(row=>!['Fazenda Coleta','Fazenda Plantação'].includes(row.origin))) {
    const name=row.name.replace(/ \(v\)$/, '');
    const shown=visible.find(item=>item.name===name);
    assert.equal(shown.origin,row.origin);assert.equal(shown.min,row.min);assert.equal(shown.max,row.max);
  }
  assert.equal(visible.find(row=>row.name==='Rosa').min,0.6);
  assert.equal(visible.find(row=>row.name==='Rosa (coleta)').min,0.15);
  assert.equal(visible.find(row=>row.name==='Leite').origin,'Gazeta Comercial');
  assert.equal(visible.find(row=>row.name==='Leite').min,4);
  assert.equal(visible.some(row=>row.name==='Esterco'),false);
  assert.deepEqual(ingredientPrices.Esterco,[0.22,0.25]);
  assert.deepEqual(ingredientPrices.Rosa,[0.6,0.7]);
});
