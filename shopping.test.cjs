const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calculateShoppingList}=require('./price-catalog.js');

test('shopping list sums different unit and lot negotiations exactly',()=>{
 const result=calculateShoppingList([{quantity:100,price:'0.00325'},{quantity:2,price:'0.30'},{quantity:3,price:'0.02'}]);
 assert.deepEqual(result.items.map(item=>item.subtotalCents),['32.500','60.000','6.000']);
 assert.equal(result.totalCents,'98.500');
});
test('shopping list handles empty, free and very small prices without rounding',()=>{
 assert.equal(calculateShoppingList([]).totalCents,'0.000');
 assert.equal(calculateShoppingList([{quantity:50,price:'0'}]).totalCents,'0.000');
 assert.equal(calculateShoppingList([{quantity:1,price:'0.00001'},{quantity:99999,price:'0.00001'}]).totalCents,'100.000');
});
test('large quantities remain exact beyond binary integer precision',()=>{
 assert.equal(calculateShoppingList([{quantity:1000000,price:'999999.99999'}]).totalCents,'99999999999000.000');
});
test('invalid quantities and prices cannot silently lower the total',()=>{
 for(const quantity of ['',0,-1,1.5,1000001,NaN]) assert.throws(()=>calculateShoppingList([{quantity,price:'0.3'}]));
 for(const price of ['',-1,'0.000001','1000000.00001','abc','Infinity']) assert.throws(()=>calculateShoppingList([{quantity:1,price}]));
});
const {buildEconomyCatalog,scenarioPrice}=require('./price-catalog.js');
test('scenarios price units and lots from the source ranges',()=>{
 const catalog=buildEconomyCatalog();
 const girassol=catalog.find(item=>item.name==='Girassol');
 assert.deepEqual(['min','median','max'].map(scenario=>scenarioPrice(girassol,scenario)),[0.3,0.325,0.35]);
 assert.deepEqual(['min','median','max'].map(scenario=>scenarioPrice(girassol,scenario,'lot')),[30,32.5,35]);
 const suggestion={status:'suggested',suggested:0.325};
 assert.deepEqual(['min','median','max'].map(scenario=>scenarioPrice(suggestion,scenario)),[0.325,0.325,0.325]);
 assert.throws(()=>scenarioPrice(girassol,'average'));
 assert.throws(()=>scenarioPrice({status:'listed',min:1,max:2},'min','lot'));
});
test('every scenario price fits the five decimal calculator without rounding',()=>{
 for(const item of buildEconomyCatalog()) for(const basis of item.lotSize>1&&Number.isFinite(item.sourceMin)?['unit','lot']:['unit']) for(const scenario of ['min','median','max']){
  const cents=scenarioPrice(item,scenario,basis);
  const price=(cents/100).toFixed(5);
  assert.ok(Math.abs(Number(price)*100-cents)<1e-9,`${item.name} ${basis} ${scenario}: ${price}`);
  calculateShoppingList([{quantity:1,price}]);
 }
});
test('every listed item has a lot: 100 units unless the source prints another size',()=>{
 const catalog=buildEconomyCatalog();
 assert.ok(catalog.every(item=>item.lotSize>1));
 const perfume=catalog.find(item=>item.name==='Perfume');
 assert.deepEqual([perfume.lotSize,perfume.sourceMin,perfume.sourceMax,perfume.lotDerived],[100,1200,1600,true]);
 assert.ok(perfume.sourceNote.includes('100 × preço unitário'));
 assert.deepEqual(['min','median','max'].map(scenario=>scenarioPrice(perfume,scenario,'lot')),[1200,1400,1600]);
 const ouro=catalog.find(item=>item.name==='Ouro'), girassol=catalog.find(item=>item.name==='Girassol');
 assert.deepEqual([ouro.lotSize,ouro.sourceMin,ouro.lotDerived],[10,20,undefined]);
 assert.deepEqual([girassol.lotSize,girassol.sourceMin,girassol.lotDerived],[100,30,undefined]);
 assert.equal(catalog.filter(item=>item.lotDerived).length,365);
});
