const {test}=require('node:test');const assert=require('node:assert/strict');const {calculate,recipes}=require('./app.js');
test('eight unique recipes and empty selection',()=>{assert.equal(recipes.length,8);assert.equal(new Set(recipes.map(r=>r.id)).size,8);assert.deepEqual(calculate({}).totals,{});});
test('rounds perfume to full batches',()=>{const r=calculate({perfume:6});assert.equal(r.units,10);assert.equal(r.totals.Rosa,10);assert.equal(r.totals['Frasco Vazio'],4);});
test('fertilizer yields fifty units',()=>{const r=calculate({fertilizante:51});assert.equal(r.units,100);assert.equal(r.totals['Húmus'],30);assert.equal(r.totals['Saca Vazia'],2);});
test('shared ingredients aggregate',()=>{const r=calculate({perfume:5,buque:5,oleo:5});assert.equal(r.totals.Rosa,15);assert.equal(r.totals.Girassol,20);assert.equal(r.totals['Frasco Vazio'],7);});
test('combo lists purchased intermediates by default',()=>{assert.deepEqual(calculate({combo:5}).totals,{'Perfume':2,'Buquê de Flores':2,'Óleo de Girassol':2,'Caixa de Madeira':1});});
test('expanded combo rounds intermediate batches and aggregates',()=>{const r=calculate({combo:5},true);assert.equal(r.batches,4);assert.equal(r.totals.Rosa,15);assert.equal(r.totals.Girassol,20);assert.equal(r.totals.Perfume,undefined);assert.equal(r.totals['Caixa de Madeira'],1);});
