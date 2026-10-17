const {test}=require('node:test');const assert=require('node:assert/strict');const {calculate,recipes}=require('./app.js');
test('eight unique recipes and empty selection',()=>{assert.equal(recipes.length,8);assert.equal(new Set(recipes.map(r=>r.id)).size,8);assert.deepEqual(calculate({}).totals,{});});
test('rounds perfume to full batches',()=>{const r=calculate({perfume:6});assert.equal(r.units,10);assert.equal(r.totals.Rosa,10);assert.equal(r.totals['Frasco Vazio'],4);});
test('fertilizer yields fifty units',()=>{const r=calculate({fertilizante:51});assert.equal(r.units,100);assert.equal(r.totals['Húmus'],30);assert.equal(r.totals['Saca Vazia'],2);});
test('shared ingredients aggregate',()=>{const r=calculate({perfume:5,buque:5,oleo:5});assert.equal(r.totals.Rosa,15);assert.equal(r.totals.Girassol,20);assert.equal(r.totals['Frasco Vazio'],7);});
test('combo lists purchased intermediates by default',()=>{assert.deepEqual(calculate({combo:5}).totals,{'Perfume':2,'Buquê de Flores':2,'Óleo de Girassol':2,'Caixa de Madeira':1});});
test('expanded combo rounds intermediate batches and aggregates',()=>{const r=calculate({combo:5},true);assert.equal(r.batches,4);assert.equal(r.totals.Rosa,15);assert.equal(r.totals.Girassol,20);assert.equal(r.totals.Perfume,undefined);assert.equal(r.totals['Caixa de Madeira'],1);});

const {estimateCosts}=require('./app.js');
test('combo prices all purchased intermediates with a precise midpoint',()=>{
 const cost=estimateCosts(calculate({combo:5}).totals);
 assert.equal(cost.min,0.75);assert.equal(cost.median,0.905);assert.equal(cost.max,1.06);
 assert.equal(cost.priced,4);assert.deepEqual(cost.missing,[]);
});
test('expanded combo charges raw ingredients without double counting intermediates',()=>{
 const cost=estimateCosts(calculate({combo:5},true).totals);
 assert.equal(cost.min,0.72);assert.equal(cost.median,0.87);assert.equal(cost.max,1.02);
 assert.deepEqual(cost.missing.sort(),['Rosa','Girassol','Papoula-da-pradaria','Mel'].sort());
});
test('unknown prices stay missing and a midpoint is not rounded per unit',()=>{
 assert.deepEqual(estimateCosts({'Rosa':10}),{min:0,median:0,max:0,priced:0,missing:['Rosa']});
 assert.equal(estimateCosts({'Frasco Vazio':100}).median,2.5);
 assert.deepEqual(estimateCosts({}),{min:0,median:0,max:0,priced:0,missing:[]});
});

const {estimateProfit}=require('./app.js');
test('profit includes full rounded output and permits a loss',()=>{
 const r=estimateProfit(calculate({combo:1}));
 assert.equal(r.revenue.min,0.9);assert.equal(r.revenue.max,1.15);
 assert.ok(Math.abs(r.profit.min-(-0.16))<1e-10);
 assert.ok(Math.abs(r.profit.median-0.12)<1e-10);
 assert.ok(Math.abs(r.profit.max-0.4)<1e-10);
 assert.deepEqual(r.missing,[]);
});
test('expanded intermediates generate no extra sales and flag missing costs',()=>{
 const r=estimateProfit(calculate({combo:5},true));
 assert.equal(r.revenue.min,0.9);assert.equal(r.revenue.max,1.15);
 assert.ok(r.missing.includes('Rosa'));
 assert.equal(estimateProfit(calculate({})).profit.min,0);
});

test('aromatic and incense herbs aggregate hummingbird sage',()=>{
 assert.deepEqual(calculate({aromaticas:5}).totals,{
  'Orégano':5,'Sálvia-beija-flor':5,'Tomilho':5,'Embalagem de Papel':2,'Pilão':1
 });
 const combined=calculate({aromaticas:6,defumacao:5});
 assert.equal(combined.totals['Sálvia-beija-flor'],15);
 assert.equal(combined.totals['Sálvia-do-deserto'],undefined);
});

test('incense recipe matches supplied card and rounds full batches',()=>{
 assert.equal(recipes.find(r=>r.id==='defumacao').yield,5);
 const expected={'Tabaco':5,'Sálvia-beija-flor':5,'Hortelã-brava':5,'Embalagem de Papel':2};
 assert.deepEqual(calculate({defumacao:5}).totals,expected);
 const r=calculate({defumacao:6});
 assert.equal(r.units,10);assert.equal(r.batches,2);
 assert.deepEqual(r.totals,Object.fromEntries(Object.entries(expected).map(([k,v])=>[k,v*2])));
});
