const {test}=require('node:test');const assert=require('node:assert/strict');const {calculate,recipes}=require('./app.js');
test('sixteen unique recipes and empty selection',()=>{assert.equal(recipes.length,16);assert.equal(new Set(recipes.map(r=>r.id)).size,16);assert.deepEqual(calculate({}).totals,{});});
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
 // Mel is quoted since Gazeta XLII: 5 units at $0.04–$0.05 add 0.20, 0.225 and 0.25 cents.
 assert.equal(cost.min,1.055);assert.equal(cost.median,1.24125);assert.equal(cost.max,1.4275);
 assert.deepEqual(cost.missing,[]);
});
test('unknown prices stay missing and a midpoint is not rounded per unit',()=>{
 assert.deepEqual(estimateCosts({'Item sem cotação':10}),{min:0,median:0,max:0,priced:0,missing:['Item sem cotação']});
 assert.deepEqual(estimateCosts({'Rosa':1000}),{min:3,median:3.25,max:3.5,priced:1,missing:[]});
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
 assert.deepEqual(r.missing,[]);
 // Tomilho is quoted in Coleta since Gazeta XLII, so aromatic herbs are fully priced.
 assert.deepEqual(estimateProfit(calculate({aromaticas:5})).missing,[]);
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

test('fertilizer and incense use new official costs without per-unit rounding',()=>{
 const fertilizer=estimateCosts(calculate({fertilizante:50}).totals);
 assert.deepEqual(fertilizer,{min:0.106,median:0.1205,max:0.135,priced:3,missing:[]});
 const incense=estimateCosts(calculate({defumacao:5}).totals);
 assert.deepEqual(incense,{min:0.165,median:0.18875,max:0.2125,priced:4,missing:[]});
});

test('Botica recipes yield one unit per batch with their book ingredients and time',()=>{
 const r=calculate({perfumeLavanda:2,buqueRosas:1,buqueLavanda:1,buqueGirassois:1,minhocario:3});
 assert.deepEqual(r.totals,{'Lavanda':50,'Garrafa de Álcool':2,'Frasco Vazio':2,'Cera de Abelha':2,'Rosa':30,'Linha de Algodão':9,'Girassol':30,'Madeira Beneficiada':12,'Fibra Vegetal':12,'Pregos':9});
 assert.equal(r.units,8);assert.equal(r.batches,8);
 // Five 30-second batches plus three 45-second Minhocário batches.
 assert.equal(r.seconds,5*30+3*45);
 assert.equal(calculate({perfume:5,fertilizante:1}).seconds,60);
});
test('Botica recipes are fully priced from the Gazeta and origin tables',()=>{
 const cost=estimateCosts(calculate({minhocario:1}).totals);
 // 4 × Madeira Beneficiada (14–16) + 4 × Fibra Vegetal (0.22–0.25) + 3 × Pregos (3–5), in cents.
 assert.deepEqual([cost.min,cost.max,cost.missing],[0.6588,0.8,[]]);
 const profit=estimateProfit(calculate({buqueLavanda:1}));
 // Sale 30–40; cost 30 × Lavanda (Fazenda Venda 0.30–0.35) + 3 × Linha de Algodão (3–5).
 assert.deepEqual([profit.revenue.min,profit.revenue.max],[0.3,0.4]);
 assert.ok(Math.abs(profit.profit.min-(0.3-0.255))<1e-10);
 assert.deepEqual(profit.missing,[]);
});
test('Perfume Silvestre and Ramalhete Silvestre follow the book',()=>{
 assert.deepEqual(calculate({perfumeSilvestre:2}).totals,{'Papoula-da-pradaria':10,'Milefólio':10,'Garrafa de Álcool':2,'Frasco Vazio':2,'Cera de Abelha':2});
 const r=calculate({ramalhete:11});
 assert.deepEqual([r.units,r.batches,r.seconds],[20,2,60]);
 assert.deepEqual(r.totals,{'Rosa':2,'Girassol':2,'Fibra Vegetal':2});
 assert.deepEqual(estimateProfit(calculate({perfumeSilvestre:1})).missing,[]);
});
test('improved seeds share one recipe yielding one hundred per batch',()=>{
 const r=calculate({sementeMelhorada:150});
 assert.deepEqual([r.units,r.batches,r.seconds],[200,2,60]);
 assert.deepEqual(r.totals,{'Semente Selecionada':200,'Embalagem de Papel':4,'Húmus':20});
 const p=estimateProfit(calculate({sementeMelhorada:100}));
 // Both seeds are quoted per lot of 100: sale 100 × $0.004–$0.006;
 // cost 100 × $0.01 + 2 × $0.06–$0.08 + 10 × $0.0022–$0.0025.
 assert.deepEqual([p.revenue.min,p.revenue.median,p.revenue.max],[0.4,0.5,0.6]);
 assert.deepEqual([p.profit.min,p.profit.median,p.profit.max],[-0.785,-0.6635,-0.542]);
 assert.deepEqual(p.missing,[]);
});
test('negative amounts put the sign before the currency symbol',()=>{
 const {formatCost}=require('./app.js');
 assert.equal(formatCost(-119.17),'-$119,17');
 assert.equal(formatCost(0.32),'$0,32');
 assert.equal(formatCost(-0.001),'$0,00');
});
test('expanded intermediates share batches with the same product ordered directly',()=>{
 const r=calculate({perfume:3,combo:5},true);
 // 3 Perfumes ordered + 2 inside the combo fit in one batch of 5.
 assert.equal(r.production.filter(p=>p.name==='Perfume').reduce((n,p)=>n+p.batches,0),1);
 assert.deepEqual([r.batches,r.seconds,r.units],[4,120,8]);
 const p=estimateProfit(r);
 // Revenue sells the 5 combos and the 3 remaining perfumes; the combo's 2 are consumed.
 assert.deepEqual([p.revenue.min,p.revenue.max],[1.26,1.63]);
});
test('profits subtract exact amounts and half cents round up when formatted',()=>{
 const {formatCost}=require('./app.js');
 assert.equal(formatCost(-0.005),'-$0,01');
 assert.equal(formatCost(1.665),'$1,67');
 assert.equal(estimateProfit(calculate({buqueLavanda:37})).profit.min,1.665);
});
