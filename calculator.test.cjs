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
 assert.equal(cost.min,0.57);assert.equal(cost.median,0.67);assert.equal(cost.max,0.77);
 assert.deepEqual(cost.missing.sort(),['Rosa','Girassol','Papoula-da-pradaria','Linha de Algodão','Mel'].sort());
});
test('unknown prices stay missing and a midpoint is not rounded per unit',()=>{
 assert.deepEqual(estimateCosts({'Rosa':10}),{min:0,median:0,max:0,priced:0,missing:['Rosa']});
 assert.equal(estimateCosts({'Frasco Vazio':100}).median,2.5);
 assert.deepEqual(estimateCosts({}),{min:0,median:0,max:0,priced:0,missing:[]});
});
