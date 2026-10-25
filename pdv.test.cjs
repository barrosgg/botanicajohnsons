const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('./pdv/pdv-core.js');
const {buildEconomyCatalog}=require('./price-catalog.js');
const catalog=buildEconomyCatalog().filter(item=>item.status==='listed');
const item=name=>catalog.find(entry=>entry.name===name);

test('entries accept quantity shortcuts like a supermarket till',()=>{
 assert.deepEqual(P.parseEntry('10*rosa'),{quantity:10,term:'rosa'});
 assert.deepEqual(P.parseEntry('10 x Buquê de Rosas'),{quantity:10,term:'Buquê de Rosas'});
 assert.deepEqual(P.parseEntry('3 rosa'),{quantity:3,term:'rosa'});
 assert.deepEqual(P.parseEntry('rosa'),{quantity:1,term:'rosa'});
 assert.deepEqual(P.parseEntry('99999999*rosa'),{quantity:1,term:'99999999*rosa'});
});
test('search puts the exact product first',()=>{
 assert.equal(P.rankMatches(catalog,'rosa')[0].name,'Rosa');
 assert.equal(P.rankMatches(catalog,'mel')[0].name,'Mel');
 assert.equal(P.rankMatches(catalog,'saca')[0].name,'Saca Vazia');
 assert.equal(P.rankMatches(catalog,'semente melhorada de milho')[0].name,'Semente Melhorada');
});
test('the same product adds to one line and totals stay exact',()=>{
 const lines=[];
 P.addLine(lines,item('Perfume'),1,'median');P.addLine(lines,item('Perfume'),1,'median');
 P.addLine(lines,item('Buquê de Rosas'),10,'median');P.addLine(lines,item('Rosa'),100,'median');P.addLine(lines,item('Minhocário'),2,'median');
 assert.deepEqual(lines.map(line=>[line.name,line.quantity,line.price]),[['Perfume',2,'0.14000'],['Buquê de Rosas',10,'0.35000'],['Rosa',100,'0.00325'],['Minhocário',2,'1.25000']]);
 const totals=P.saleTotals(lines);
 // 0.28 + 3.50 + 0.325 + 2.50 = 6.605; the charge rounds half up to $6.61.
 assert.deepEqual([totals.exact,totals.charge,totals.items],[660500n,661000n,114]);
 assert.equal(P.formatAmount(totals.exact,5),'$6,605');
 assert.equal(P.formatAmount(P.changeDue(totals.charge,'10')),'$3,39');
 assert.equal(P.formatAmount(P.changeDue(totals.charge,'5,00')),'-$1,61');
 assert.equal(P.changeDue(totals.charge,'abc'),null);
});
test('quantities are capped at one million per line',()=>{
 const lines=[];P.addLine(lines,item('Rosa'),999999,'min');P.addLine(lines,item('Rosa'),10,'min');
 assert.equal(lines[0].quantity,1000000);
});
test('every sellable item gets a drawn icon',()=>{
 const I=require('./pdv/icons.js');
 for(const entry of catalog){const icon=I.iconFor(entry);assert.ok(I.shapes[icon.shape],entry.name);assert.match(icon.tint,/^#/);}
 assert.equal(I.iconFor(item('Perfume de Lavanda')).shape,'perfume');
 assert.equal(I.iconFor(item('Semente de Trigo')).shape,'seed');
 assert.match(I.svg(item('Rosa')),/^<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"/);
});
test('lines say when the quantity makes whole lots',()=>{
 assert.equal(P.lotLabel(99,100),'');
 assert.equal(P.lotLabel(100,100),'1 lote de 100');
 assert.equal(P.lotLabel(230,100),'2 lotes de 100 + 30 un.');
 assert.equal(P.lotLabel(1000,1000),'1 lote de 1.000');
 assert.equal(P.lotLabel(25,10),'2 lotes de 10 + 5 un.');
 assert.equal(P.lotLabel(5,1),'');
});
