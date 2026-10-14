const recipes = [
 {id:'perfume',name:'Perfume',yield:5,ingredients:{'Rosa':5,'Garrafa de Álcool':2,'Frasco Vazio':2,'Cera de Abelha':2,'Girassol':5}},
 {id:'oleo',name:'Óleo de Girassol',yield:5,ingredients:{'Mel':5,'Frasco Vazio':5,'Girassol':5}},
 {id:'fertilizante',name:'Fertilizante',yield:50,ingredients:{'Húmus':15,'Esterco':15,'Saca Vazia':1}},
 {id:'combo',name:'Combo Botânicos',yield:5,ingredients:{'Perfume':2,'Buquê de Flores':2,'Óleo de Girassol':2,'Caixa de Madeira':1}},
 {id:'defumacao',name:'Ervas para Defumação',yield:5,ingredients:{'Tabaco':5,'Sálvia-do-deserto':5,'Hortelã-brava':5,'Embalagem de Papel':2}},
 {id:'aromaticas',name:'Ervas Aromáticas',yield:5,ingredients:{'Orégano':5,'Sálvia-do-deserto':5,'Tomilho':5,'Embalagem de Papel':2,'Pilão':1}},
 {id:'medicinais',name:'Ervas Medicinais',yield:5,ingredients:{'Milefólio':5,'Ginseng do Alasca':5,'Tanaceto':5,'Pilão':1,'Embalagem de Papel':1}},
 {id:'buque',name:'Buquê de Flores',yield:5,ingredients:{'Rosa':10,'Papoula-da-pradaria':10,'Girassol':10,'Linha de Algodão':5}}
];
function calculate(quantities, expand=false) {
 const totals={}, production=[], pending={};let batches=0,units=0;
 function addIngredients(recipe,count){for(const [name,quantity] of Object.entries(recipe.ingredients))pending[name]=(pending[name]||0)+quantity*count;}
 for(const r of recipes){const wanted=quantities[r.id]||0;if(!wanted)continue;const count=Math.ceil(wanted/r.yield);batches+=count;units+=count*r.yield;production.push({name:r.name,wanted,produced:count*r.yield,batches:count});addIngredients(r,count);}
 // Resolve in dependency order so shared intermediate requirements use combined batches.
 if(expand)for(const name of ['Combo Botânicos','Perfume','Buquê de Flores','Óleo de Girassol']){
  if(!pending[name])continue;const recipe=recipes.find(r=>r.name===name);const count=Math.ceil(pending[name]/recipe.yield);production.push({name,wanted:pending[name],produced:count*recipe.yield,batches:count,intermediate:true});batches+=count;delete pending[name];addIngredients(recipe,count);
 }
 Object.assign(totals,pending);return {totals,production,batches,units};
}
if(typeof module!=='undefined')module.exports={recipes,calculate};
if(typeof document!=='undefined'){
 const products=document.getElementById('products');const fmt=n=>n.toLocaleString('pt-BR');let result;
 products.innerHTML=recipes.map(r=>`<article class="product"><div class="product-info"><h3>${r.name}</h3><small>${r.yield} unidades / lote · 30s</small></div><div class="stepper"><button data-id="${r.id}" data-step="-1" aria-label="Diminuir ${r.name}">−</button><input id="${r.id}" type="number" min="0" max="1000000" step="1" value="0" aria-label="Quantidade de ${r.name}"><button data-id="${r.id}" data-step="1" aria-label="Aumentar ${r.name}">+</button></div></article>`).join('');
 function update(){const quantities={};for(const r of recipes){const input=document.getElementById(r.id);quantities[r.id]=Math.min(1000000,Math.max(0,Math.floor(Number(input.value)||0)));}result=calculate(quantities,document.getElementById('expand').checked);document.getElementById('units').textContent=fmt(result.units);document.getElementById('batches').textContent=fmt(result.batches);const entries=Object.entries(result.totals).sort((a,b)=>a[0].localeCompare(b[0],'pt-BR'));document.getElementById('ingredients').innerHTML=entries.length?entries.map(([name,n])=>`<div class="ingredient"><span>${name}</span><strong>${fmt(n)}</strong></div>`).join(''):'<div class="empty"><span>❧</span>Sua bancada ainda está vazia.<br>Escolha uma quantidade para começar.</div>';document.getElementById('details').innerHTML=result.batches?`<section class="details" aria-label="Plano de produção"><h3>Plano de produção · ${fmt(Math.floor(result.batches*30/60))} min ${result.batches*30%60}s</h3><div class="production-list">${result.production.map(p=>`<span>${p.intermediate?'↳ ':''}${p.name}: ${fmt(p.produced)} un.${p.produced>p.wanted?` (${fmt(p.produced-p.wanted)} ${p.produced-p.wanted===1?'excedente':'excedentes'})`:''}</span>`).join('')}</div></section>`:'';document.getElementById('copy').disabled=!entries.length;document.getElementById('copy-status').textContent='';}
 products.addEventListener('input',update);products.addEventListener('change',e=>{if(e.target.matches('input')){e.target.value=Math.min(1000000,Math.max(0,Math.floor(Number(e.target.value)||0)));update();}});products.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;const input=document.getElementById(button.dataset.id);input.value=Math.min(1000000,Math.max(0,(Number(input.value)||0)+Number(button.dataset.step)));update();});document.getElementById('expand').addEventListener('change',update);document.getElementById('clear').addEventListener('click',()=>{recipes.forEach(r=>document.getElementById(r.id).value=0);update();});
 document.getElementById('copy').addEventListener('click',async()=>{const text='Botânica Johnsons — Lista de ingredientes\n'+Object.entries(result.totals).sort((a,b)=>a[0].localeCompare(b[0],'pt-BR')).map(([name,n])=>`${fmt(n)} × ${name}`).join('\n');try{await navigator.clipboard.writeText(text);document.getElementById('copy-status').textContent='Lista copiada!';}catch{document.getElementById('copy-status').textContent='Não foi possível copiar automaticamente. Selecione a lista para copiar.';}});update();
}
