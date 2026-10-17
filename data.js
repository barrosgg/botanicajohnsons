const BotanicaData = (() => {
const county = typeof module !== 'undefined' ? require('./county-prices.js') : CountyPrices;
const recipes = [
 {id:'perfume',name:'Perfume',yield:5,ingredients:{'Rosa':5,'Garrafa de Álcool':2,'Frasco Vazio':2,'Cera de Abelha':2,'Girassol':5}},
 {id:'oleo',name:'Óleo de Girassol',yield:5,ingredients:{'Mel':5,'Frasco Vazio':5,'Girassol':5}},
 {id:'fertilizante',name:'Fertilizante',yield:50,ingredients:{'Húmus':15,'Esterco':15,'Saca Vazia':1}},
 {id:'combo',name:'Combo Botânicos',yield:5,ingredients:{'Perfume':2,'Buquê de Flores':2,'Óleo de Girassol':2,'Caixa de Madeira':1}},
 {id:'defumacao',name:'Ervas para Defumação',yield:5,ingredients:{'Tabaco':5,'Sálvia-beija-flor':5,'Hortelã-brava':5,'Embalagem de Papel':2}},
 {id:'aromaticas',name:'Ervas Aromáticas',yield:5,ingredients:{'Orégano':5,'Sálvia-beija-flor':5,'Tomilho':5,'Embalagem de Papel':2,'Pilão':1}},
 {id:'medicinais',name:'Ervas Medicinais',yield:5,ingredients:{'Milefólio':5,'Ginseng do Alasca':5,'Tanaceto':5,'Pilão':1,'Embalagem de Papel':1}},
 {id:'buque',name:'Buquê de Flores',yield:5,ingredients:{'Rosa':10,'Papoula-da-pradaria':10,'Girassol':10,'Linha de Algodão':5}}
];
// Unit prices in cents, transcribed from the supplied Gazeta Comercial tables.
const ingredientPrices = {
 'Perfume':[12,16], 'Buquê de Flores':[10,15], 'Óleo de Girassol':[10,15],
 'Cera de Abelha':[12,15], 'Garrafa de Álcool':[4,6], 'Embalagem de Papel':[6,8],
 'Frasco Vazio':[2,3], 'Pilão':[2,3], 'Caixa de Madeira':[11,14], 'Saca Vazia':[4,6], 'Linha de Algodão':[3,5]
};
// Selling prices per finished unit, in cents (Gazeta Comercial, Botânicos).
const salePrices = {
 perfume:[12,16], oleo:[10,15], fertilizante:[1,2], combo:[18,23],
 defumacao:[5,7], aromaticas:[6,8], medicinais:[4,6], buque:[10,15]
};
// Procurement uses Fazenda Venda when available, as selected by the user.
// Collection references apply to inputs without a separate sale row.
const ingredientPriceSources = {};
for (const name of new Set(recipes.flatMap(recipe => Object.keys(recipe.ingredients)))) {
 const updated = county.find(name, true);
 if (!updated) continue;
 ingredientPrices[name] = [updated.min, updated.max];
 ingredientPriceSources[name] = {name: updated.name, origin: updated.origin};
}
// Both pages read the same recipe and price source; suggestions stay separate.
return {recipes, ingredientPrices, salePrices, ingredientPriceSources};
})();
if (typeof module !== 'undefined') module.exports = BotanicaData;
