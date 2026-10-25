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
 {id:'buque',name:'Buquê de Flores',yield:5,ingredients:{'Rosa':10,'Papoula-da-pradaria':10,'Girassol':10,'Linha de Algodão':5}},
 // Botica recipes from the in-game book. The book's "Perfume Floral (Silvestre)" is
 // the Gazeta's "Perfume Silvestre", so it uses the Gazeta name to share its price.
 {id:'perfumeSilvestre',name:'Perfume Silvestre',yield:1,ingredients:{'Papoula-da-pradaria':5,'Milefólio':5,'Garrafa de Álcool':1,'Frasco Vazio':1,'Cera de Abelha':1}},
 {id:'perfumeLavanda',name:'Perfume de Lavanda',yield:1,ingredients:{'Lavanda':10,'Garrafa de Álcool':1,'Frasco Vazio':1,'Cera de Abelha':1}},
 {id:'buqueRosas',name:'Buquê de Rosas',yield:1,ingredients:{'Rosa':30,'Linha de Algodão':3}},
 {id:'buqueLavanda',name:'Buquê de Lavanda',yield:1,ingredients:{'Lavanda':30,'Linha de Algodão':3}},
 {id:'buqueGirassois',name:'Buquê de Girassóis',yield:1,ingredients:{'Girassol':30,'Linha de Algodão':3}},
 {id:'minhocario',name:'Minhocário',yield:1,time:45,ingredients:{'Madeira Beneficiada':4,'Fibra Vegetal':4,'Pregos':3}},
 {id:'ramalhete',name:'Ramalhete Silvestre',yield:10,ingredients:{'Rosa':1,'Girassol':1,'Fibra Vegetal':1}},
 // Every improved seed variety (de Milho, de Cana, de Pimenta...) shares this recipe.
 {id:'sementeMelhorada',name:'Semente Melhorada',yield:100,ingredients:{'Semente Selecionada':100,'Embalagem de Papel':2,'Húmus':10}}
].map(recipe => ({time:30, ...recipe}));
// Unit prices in cents, transcribed from the supplied Gazeta Comercial tables (edition XLII).
const ingredientPrices = {
 'Perfume':[12,16], 'Buquê de Flores':[10,15], 'Óleo de Girassol':[10,15],
 'Cera de Abelha':[12,15], 'Garrafa de Álcool':[4,6], 'Embalagem de Papel':[6,8],
 'Frasco Vazio':[2,3], 'Pilão':[2,3], 'Caixa de Madeira':[11,14], 'Saca Vazia':[4,6], 'Linha de Algodão':[3,5],
 'Mel':[4,5], 'Madeira Beneficiada':[14,16], 'Pregos':[3,5], 'Semente Selecionada':[100,100]
};
// Selling prices per finished unit, in cents (Gazeta Comercial, Botânicos).
const salePrices = {
 perfume:[12,16], oleo:[10,15], fertilizante:[1,2], combo:[18,23],
 defumacao:[5,7], aromaticas:[6,8], medicinais:[4,6], buque:[10,15],
 perfumeSilvestre:[35,45], perfumeLavanda:[35,45], buqueRosas:[30,40], buqueLavanda:[30,40], buqueGirassois:[30,40], minhocario:[115,135], ramalhete:[1,2], sementeMelhorada:[40,60]
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
