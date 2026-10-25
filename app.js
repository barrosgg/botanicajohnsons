const {recipes, ingredientPrices, salePrices, ingredientPriceSources} = typeof module !== 'undefined' ? require('./data.js') : BotanicaData;
function calculate(quantities, expand=false) {
 const totals={}, production=[], pending={};let batches=0,units=0,seconds=0;
 function addIngredients(recipe,count){for(const [name,quantity] of Object.entries(recipe.ingredients))pending[name]=(pending[name]||0)+quantity*count;}
 // With expansion, intermediates ordered directly share batches with what the combo consumes.
 const intermediates=expand?['Perfume','Buquê de Flores','Óleo de Girassol']:[], direct={};
 for(const r of recipes){const wanted=quantities[r.id]||0;if(!wanted)continue;if(intermediates.includes(r.name)){direct[r.name]=wanted;continue;}const count=Math.ceil(wanted/r.yield);batches+=count;seconds+=count*r.time;units+=count*r.yield;production.push({name:r.name,wanted,produced:count*r.yield,batches:count});addIngredients(r,count);}
 for(const name of intermediates){
  const need=pending[name]||0, own=direct[name]||0;if(!need&&!own)continue;
  const recipe=recipes.find(r=>r.name===name);const count=Math.ceil((need+own)/recipe.yield);batches+=count;seconds+=count*recipe.time;delete pending[name];addIngredients(recipe,count);
  // Units left after the combo's share are sold, surplus included; intermediates alone are never sold.
  if(own){units+=count*recipe.yield-need;production.push({name,wanted:own,produced:count*recipe.yield-need,batches:count});}
  if(need)production.push({name,wanted:need,produced:own?need:count*recipe.yield,batches:own?0:count,intermediate:true});
 }
 Object.assign(totals,pending);return {totals,production,batches,units,seconds};
}
// Costs in 1/10000 dollar (hundredths of a cent), so profits subtract exact integers.
function costUnits(totals) {
 let min=0, max=0, priced=0;
 const missing=[];
 for(const [name,quantity] of Object.entries(totals)) {
  if(!quantity) continue;
  const price=ingredientPrices[name];
  if(!price) { missing.push(name); continue; }
  priced++;
  min+=Math.round(price[0]*100)*quantity;
  max+=Math.round(price[1]*100)*quantity;
 }
 return {min, max, priced, missing};
}
function estimateCosts(totals) {
 const {min, max, priced, missing}=costUnits(totals);
 // Keep the midpoint precise until formatting the final totals.
 return {min:min/10000, median:(min+max)/20000, max:max/10000, priced, missing};
}
function estimateProfit(result) {
 const cost=costUnits(result.totals);
 let min=0, max=0;
 for (const item of result.production) {
  if (item.intermediate) continue;
  const recipe=recipes.find(r=>r.name===item.name);
  const price=salePrices[recipe.id];
  // Same 1/10000-dollar scale as costs: sale prices can be fractions of a cent.
  min+=item.produced*Math.round(price[0]*100);
  max+=item.produced*Math.round(price[1]*100);
 }
 // Every sale scenario against every cost scenario, subtracted exactly in 1/20000 dollar.
 const keys=['min','median','max'], sale={min:2*min,median:min+max,max:2*max}, spend={min:2*cost.min,median:cost.min+cost.max,max:2*cost.max};
 const revenue=Object.fromEntries(keys.map(k=>[k,sale[k]/20000]));
 const matrix=Object.fromEntries(keys.map(s=>[s,Object.fromEntries(keys.map(c=>[c,(sale[s]-spend[c])/20000]))]));
 // The page's scenarios pair minimum sales with maximum cost, and maximum sales with minimum cost.
 return {revenue, profit:{min:matrix.min.max,median:matrix.median.median,max:matrix.max.min}, matrix, missing:cost.missing};
}
function formatCost(value, maximumFractionDigits=2) {
 // The sign goes before the currency symbol (-$1,20), and a loss that rounds to zero shows no sign.
 // Formatting the shortest decimal string rounds 1.665 up, as written, not its binary 1.66499….
 const text = new Intl.NumberFormat('pt-BR', {minimumFractionDigits:2, maximumFractionDigits}).format(String(Math.abs(value)));
 return (value < 0 && /[1-9]/.test(text) ? '-' : '') + '$' + text;
}
if(typeof module!=='undefined')module.exports={recipes,calculate,ingredientPrices,estimateCosts,salePrices,estimateProfit,formatCost};
if (typeof document !== 'undefined') {
  const products = document.getElementById('products');
  const ingredients = document.getElementById('ingredients');
  const expand = document.getElementById('expand');
  const fmt = n => n.toLocaleString('pt-BR');
  const storageKey = 'botanica-production-v1';
  const normalize = value => Math.min(1000000, Math.max(0, Math.floor(Number(value) || 0)));
  let gathered = {};
  let result;

  // A restored history entry can keep another scenario checked; read it instead of assuming.
  let scenario = document.querySelector('input[name="scenario"]:checked')?.value || 'median';
  products.innerHTML = recipes.map(r => `
    <article class="product">
      <div class="product-info"><h3><label for="${r.id}">${r.name}</label></h3><small id="${r.id}-feedback"></small></div>
      <div class="stepper"><button data-id="${r.id}" data-step="-1" aria-label="Diminuir ${r.name}">−</button><input id="${r.id}" type="number" inputmode="numeric" min="0" max="1000000" step="1" value="0" aria-label="Quantidade de ${r.name}" aria-describedby="${r.id}-feedback keyboard-hint"><button data-id="${r.id}" data-step="1" aria-label="Aumentar ${r.name}">+</button></div>
      <span class="row-money sale-value" id="${r.id}-sale"></span><span class="row-money" id="${r.id}-revenue"></span><span class="row-money row-profit" id="${r.id}-profit"></span>
    </article>`).join('');

  document.querySelectorAll('input[name="scenario"]').forEach(input => input.addEventListener('change', () => { scenario=input.value; update(); }));
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal()));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('nav [data-panel]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('.workspace').dataset.panel=button.dataset.panel;
    document.querySelectorAll('nav [data-panel]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
  }));

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object') {
      for (const r of recipes) document.getElementById(r.id).value = normalize(saved.quantities?.[r.id]);
      expand.checked = saved.expand === true;
      if (saved.gathered && typeof saved.gathered === 'object') gathered = saved.gathered;
    }
  } catch { /* Storage may be unavailable; calculations still work. */ }

  function quantities() {
    return Object.fromEntries(recipes.map(r => [r.id, normalize(document.getElementById(r.id).value)]));
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ quantities: quantities(), expand: expand.checked, gathered }));
      document.getElementById('save-status').textContent = 'Preenchimento salvo neste navegador.';
    } catch {
      document.getElementById('save-status').textContent = 'Preenchimento disponível nesta sessão.';
    }
  }

  function showProgress() {
    const total = Object.keys(result.totals).length;
    const ready = Object.keys(gathered).length;
    document.getElementById('gather-progress').textContent = total ? `${ready} de ${total} ingredientes separados` : '';
  }

  function costSummary() {
    const cost = estimateCosts(result.totals);
    if (!Object.keys(result.totals).length) return 'Selecione uma produção para estimar os custos.';
    if (!cost.priced) return `Estimativa indisponível. Sem preço: ${cost.missing.join(', ')}.`;
    return `${cost.missing.length ? 'Subtotal parcial' : 'Total estimado'} — Mínimo: ${formatCost(cost.min)} · Mediano estimado: ${formatCost(cost.median)} · Máximo: ${formatCost(cost.max)}`
      + (cost.missing.length ? `\nSem preço (não incluídos): ${cost.missing.join(', ')}.` : '');
  }

  function costBreakdown() {
    return Object.entries(result.totals).sort((a,b) => a[0].localeCompare(b[0], 'pt-BR')).map(([name, quantity]) => {
      const price = ingredientPrices[name];
      if (!price) return {name, lines: [`${fmt(quantity)} un. · Sem preço cadastrado; não incluído no subtotal.`]};
      const values = [price[0]/100, (price[0]+price[1])/200, price[1]/100];
      const source = ingredientPriceSources[name];
      return {name, lines: [`${fmt(quantity)} un.${source ? ` · Base: ${source.origin}` : ''} · ` + values.map((value, i) => `${['Mín', 'Med', 'Máx'][i]}: ${formatCost(value,5)} × ${fmt(quantity)} = ${formatCost(quantity*value,5)}`).join(' · ')]};
    });
  }

  function showCosts() {
    const cost = estimateCosts(result.totals);
    const hasItems = Object.keys(result.totals).length > 0;
    const memory = document.getElementById('cost-memory');
    memory.hidden = !hasItems;
    const rows = document.getElementById('cost-memory-rows');
    rows.replaceChildren();
    for (const item of costBreakdown()) {
      const row = document.createElement('div');
      row.className = 'cost-memory-row';
      const title = document.createElement('strong');
      title.textContent = item.name;
      row.append(title);
      for (const line of item.lines) {
        const text = document.createElement('div');
        text.textContent = line;
        row.append(text);
      }
      rows.append(row);
    }
    document.getElementById('cost-memory-total').textContent = costSummary();
    document.getElementById('cost-heading').textContent = cost.missing.length ? 'Custos da encomenda · parcial' : 'Custos estimados da encomenda';
    for (const key of ['min', 'median', 'max']) {
      document.getElementById(`cost-${key}`).textContent = !hasItems || !cost.priced ? '—' : formatCost(cost[key]);
    }
    document.getElementById('cost-status').textContent = !hasItems
      ? 'Selecione uma produção para estimar os custos.'
      : cost.missing.length
        ? `${cost.priced ? 'Custo parcial.' : 'Estimativa indisponível.'} Sem preço: ${cost.missing.join(', ')}.`
        : 'Todos os ingredientes desta encomenda têm preço cadastrado.';
  }

  function showProfit() {
    const estimate=estimateProfit(result);
    const cost=estimateCosts(result.totals);
    const active=result.units>0;
    const partial=cost.missing.length ? ' *' : '';
    for (const key of ['min','median','max']) {
      document.getElementById(`cost-head-${key}`).textContent=active && cost.priced ? formatCost(cost[key]) + partial : '—';
      document.getElementById(`revenue-${key}`).textContent=active ? formatCost(estimate.revenue[key]) : '—';
      document.getElementById(`revenue-${key}`).closest('tr').classList.toggle('median-row', key===scenario);
      for (const costKey of ['min','median','max']) {
        const cell=document.getElementById(`profit-${key}-${costKey}`), value=estimate.matrix[key][costKey];
        cell.textContent=active ? formatCost(value) + partial : '—';
        cell.classList.toggle('negative', active && value<0);
      }
    }
    document.getElementById('profit-status').textContent=!active ? 'Informe a produção para simular a venda.' : estimate.missing.length
      ? 'Lucro parcial e superestimado. Desconte os ingredientes sem preço antes de decidir.'
      : 'Receita menos custo dos ingredientes. Não inclui outras despesas.';
  }

  function update() {
    const amounts = quantities();
    result = calculate(amounts, expand.checked);
    for (const r of recipes) {
      const input = document.getElementById(r.id);
      input.closest('.product').classList.toggle('selected', amounts[r.id] > 0);
      const batches = Math.ceil(amounts[r.id] / r.yield);
      const surplus = batches * r.yield - amounts[r.id];
      const individual = estimateProfit(calculate({[r.id]:amounts[r.id]}, expand.checked));
      const price=salePrices[r.id];
      const sale={min:price[0]/100,median:(price[0]+price[1])/200,max:price[1]/100};
      document.getElementById(`${r.id}-sale`).textContent=formatCost(sale[scenario],3);
      document.getElementById(`${r.id}-sale`).setAttribute('aria-label',`Venda por unidade no cenário ${scenario === 'min' ? 'mínimo' : scenario === 'max' ? 'máximo' : 'mediano'}: ${formatCost(sale[scenario],3)}`);
      document.getElementById(`${r.id}-revenue`).textContent=batches ? formatCost(individual.revenue[scenario]) : '—';
      const profitBox=document.getElementById(`${r.id}-profit`);
      profitBox.textContent=batches ? formatCost(individual.profit[scenario]) + (individual.missing.length ? ' *' : '') : '—';
      profitBox.classList.toggle('negative',batches>0 && individual.profit[scenario]<0);
      profitBox.title=individual.missing.length ? `Lucro parcial. Falta descontar: ${individual.missing.join(', ')}.` : 'Lucro bruto da produção';
      profitBox.setAttribute('aria-label',profitBox.textContent + '. ' + profitBox.title);
      document.getElementById(`${r.id}-feedback`).textContent = batches
        ? `${fmt(batches)} ${batches === 1 ? 'lote' : 'lotes'} · ${fmt(batches * r.yield)} un.${surplus ? ` · +${fmt(surplus)} ${surplus === 1 ? 'excedente' : 'excedentes'}` : ''}`
        : `${r.yield} ${r.yield === 1 ? 'unidade' : 'unidades'} / lote · ${r.time}s`;
    }
    document.getElementById('units').textContent = fmt(result.units);
    document.getElementById('batches').textContent = fmt(result.batches);
    const entries = Object.entries(result.totals).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
    // A changed required quantity must be checked again; unchanged items stay marked.
    gathered = Object.fromEntries(entries.filter(([name, n]) => gathered[name] === n));
    ingredients.innerHTML = entries.length ? entries.map(([name, n]) => `
      <label class="ingredient${gathered[name] ? ' gathered' : ''}">
        <input type="checkbox" data-ingredient="${name}" ${gathered[name] ? 'checked' : ''} aria-label="${name}: ${fmt(n)} unidades separadas">
        <span>${name}</span><strong>${fmt(n)}</strong>
      </label>`).join('') : '<div class="empty">Sua bancada ainda está vazia.<br>Escolha uma quantidade para começar.</div>';
    showProgress();
    showCosts();
    showProfit();
    document.getElementById('details').innerHTML = result.batches ? `
      <section class="details" aria-label="Plano de produção">
        <h3>Plano de produção · ${fmt(Math.floor(result.seconds / 60))} min ${result.seconds % 60}s</h3>
        <div class="production-list">${result.production.map(p => `<span>${p.intermediate ? '↳ ' : ''}${p.name}: ${fmt(p.produced)} un.${p.produced > p.wanted ? ` (${fmt(p.produced - p.wanted)} ${p.produced - p.wanted === 1 ? 'excedente' : 'excedentes'})` : ''}</span>`).join('')}</div>
      </section>` : '';
    document.getElementById('copy').disabled = !entries.length;
    document.getElementById('copy-status').textContent = '';
    save();
  }

  products.addEventListener('input', update);
  products.addEventListener('change', e => {
    if (!e.target.matches('input')) return;
    e.target.value = normalize(e.target.value);
    update();
  });
  products.addEventListener('focusin', e => {
    if (e.target.matches('input')) e.target.select();
  });
  products.addEventListener('keydown', e => {
    if (!e.target.matches('input') || !['Tab', 'Enter'].includes(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
    const index = recipes.findIndex(r => r.id === e.target.id);
    const next = index + (e.shiftKey ? -1 : 1);
    e.preventDefault();
    // On narrow screens the ingredients panel is hidden, so Tab moves on to the plan button.
    const visible = element => element.getClientRects().length > 0;
    (next < 0 ? document.getElementById('clear') : next >= recipes.length ? (visible(expand) ? expand : document.querySelector('[data-dialog="plan-dialog"]')) : document.getElementById(recipes[next].id)).focus();
  });
  products.addEventListener('click', e => {
    if (e.target.matches('input')) { e.target.select(); return; }
    const button = e.target.closest('button');
    if (!button) return;
    const input = document.getElementById(button.dataset.id);
    input.value = normalize(normalize(input.value) + Number(button.dataset.step));
    update();
  });
  ingredients.addEventListener('change', e => {
    const name = e.target.dataset.ingredient;
    if (!Object.hasOwn(result.totals, name)) return;
    if (e.target.checked) gathered[name] = result.totals[name];
    else delete gathered[name];
    e.target.closest('.ingredient').classList.toggle('gathered', e.target.checked);
    showProgress();
    save();
  });
  expand.addEventListener('change', update);
  document.getElementById('clear').addEventListener('click', () => {
    recipes.forEach(r => document.getElementById(r.id).value = 0);
    gathered = {};
    update();
    document.getElementById(recipes[0].id).focus();
  });
  document.getElementById('copy').addEventListener('click', async () => {
    const text = 'Botânica Johnsons — Lista de ingredientes\n' + Object.entries(result.totals)
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([name, n]) => `${fmt(n)} × ${name}`).join('\n')
      + '\n\nMemória de cálculo\n' + costBreakdown().map(item => item.name + '\n' + item.lines.join('\n')).join('\n\n')
      + '\n\n' + costSummary() + '\nMediano estimado: ponto médio entre mínimo e máximo.';
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById('copy-status').textContent = 'Lista copiada!';
    } catch {
      document.getElementById('copy-status').textContent = 'Não foi possível copiar automaticamente. Selecione a lista para copiar.';
    }
  });
  window.addEventListener('pageshow', () => {
    const checked = document.querySelector('input[name="scenario"]:checked')?.value;
    if (checked && checked !== scenario) { scenario = checked; update(); }
  });
  update();
}
