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
