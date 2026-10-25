// Hand-drawn SVG icons for the point of sale: one stroke style on a 24px grid,
// tinted per product (--tint main colour, --tint2 secondary) so every device shows the same art.
const PdvIcons = (() => {
const shapes = {
  perfume: '<rect class="t" x="6" y="10" width="12" height="11" rx="3"/><path d="M10 10V7h4v3M9 7h6"/><circle cx="18.5" cy="4.5" r="1.5"/><path d="M14 6h3"/><path d="M9 15c1.7-1.4 4.3-1.4 6 0"/>',
  oil: '<path class="t" d="M9 9h6l1.5 3v8a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 20v-8z"/><path d="M10 9V5.5h4V9M9.5 5.5h5"/><circle class="t2" cx="12" cy="15.5" r="2"/>',
  sack: '<path class="t2" d="M8 7c-2.5 2.5-4 6-3.5 10 .3 2.3 2.3 3.5 4.5 3.5h6c2.2 0 4.2-1.2 4.5-3.5.5-4-1-7.5-3.5-10z"/><path d="M8 7 7 4h10l-1 3M9.5 7h5M12 17.5v-4"/><path class="t" d="M12 13.5c-1.6 0-2.7-1.1-2.7-2.7 1.6 0 2.7 1.1 2.7 2.7zM12 15c1.6 0 2.7-1.1 2.7-2.7-1.6 0-2.7 1.1-2.7 2.7z"/>',
  gift: '<rect class="t2" x="4" y="10" width="16" height="10" rx="1.5"/><rect class="t2" x="3" y="7" width="18" height="3" rx="1"/><path class="t" d="M10.8 7h2.4v13h-2.4z"/><path d="M12 7c-1-2.5-4.5-3-4.5-1S10.5 7 12 7zM12 7c1-2.5 4.5-3 4.5-1S13.5 7 12 7z"/>',
  smudge: '<path class="t" d="m4.5 17.5 8-8 3 3-8 8a2.1 2.1 0 0 1-3-3z"/><path d="m8 14 2.5 2.5M10.5 11.5 13 14"/><path d="M16 8c1-1 0-2 1-3s0-2 1-3M19 10c1-1 0-2 1-3"/>',
  sprig: '<path d="M12 21V5"/><path class="t" d="M12 9c-3 0-5-2-5-4 3 0 5 2 5 4zM12 13c3 0 5-2 5-4-3 0-5 2-5 4zM12 17c-3 0-5-2-5-4 3 0 5 2 5 4z"/>',
  medleaf: '<path class="t" d="M4.5 19.5C4.5 10.5 9.5 4.5 19.5 4.5c0 10-6 15-15 15z"/><path d="m4.5 19.5 8-8"/><path class="t2" d="M15.2 13.6h2.6v2.2H20v2.6h-2.2v2.2h-2.6v-2.2H13v-2.6h2.2z"/>',
  bouquet: '<path class="t2" d="m7.5 12.5 4.5 9 4.5-9z"/><path d="m9 10.5 2.5 3.5M15 10.5l-2.5 3.5M12 8.5v5"/><circle class="t" cx="8.5" cy="8.5" r="2.6"/><circle class="t" cx="15.5" cy="8.5" r="2.6"/><circle class="t" cx="12" cy="5.5" r="2.6"/><path d="M10.4 16.5h3.2"/>',
  rose: '<path d="M12 13v8"/><path class="t2" d="M12 17.5c-2 0-3.5-1-4-2.5 2 0 3.5.8 4 2.5zM12 19c2 0 3.5-1 4-2.5-2 0-3.5.8-4 2.5z"/><path class="t" d="M12 3.5c3 0 5 2 5 4.7S15 13 12 13s-5-2-5-4.8 2-4.7 5-4.7z"/><path d="M12 6.3c1.4 0 2.3.9 2.3 2.1s-1 2-2.3 2c-.9 0-1.5-.6-1.5-1.3"/>',
  sunflower: '<path d="M12 14.5V21M12 18c-2-.2-3.3-1.3-3.8-2.8 2 .1 3.3 1 3.8 2.8z"/><circle class="t" cx="12" cy="8.5" r="6"/><circle class="t2" cx="12" cy="8.5" r="2.8"/><path d="M12 2.5v1.5M12 13v1.5M6 8.5h1.5M16.5 8.5H18M7.8 4.3l1 1M15.2 11.7l1 1M7.8 12.7l1-1M15.2 5.3l1-1"/>',
  lavender: '<path d="M12 21V9M12 17c-2-.5-3.5-2-4-4M12 17c2-.5 3.5-2 4-4"/><ellipse class="t" cx="12" cy="4.5" rx="1.6" ry="2"/><ellipse class="t" cx="10.3" cy="7.6" rx="1.4" ry="1.8"/><ellipse class="t" cx="13.7" cy="7.6" rx="1.4" ry="1.8"/><ellipse class="t" cx="10.5" cy="11" rx="1.3" ry="1.6"/><ellipse class="t" cx="13.5" cy="11" rx="1.3" ry="1.6"/>',
  posy: '<path d="m9 9 3 7 3-7M12 12v4m0 0-2 5m2-5 2 5M10.4 16h3.2"/><circle class="t" cx="8.8" cy="7" r="2.1"/><circle class="t2" cx="15.2" cy="7" r="2.1"/><circle class="t" cx="12" cy="9.8" r="2.1"/>',
  seed: '<rect class="t2" x="6" y="3" width="12" height="18" rx="1.5"/><path d="M6 7h12M12 18v-4.5"/><path class="t" d="M12 13.5c-2 0-3.4-1.4-3.4-3.4 2 0 3.4 1.4 3.4 3.4zM12 15c2 0 3.4-1.4 3.4-3.4-2 0-3.4 1.4-3.4 3.4z"/>',
  wormbox: '<rect class="t2" x="3.5" y="10" width="17" height="10" rx="1"/><path d="M3.5 14h17M8 10v10M16 10v10"/><path class="w" d="M5.5 7.5c1.4-2 2.9-2 4.3 0s2.9 2 4.3 0 2.9-2 4.3 0"/>',
  leaf: '<path class="t" d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z"/><path d="m5 19 8-8M10 14h3.5M12 12V8.5"/>',
  wheat: '<path d="M12 21V7"/><path class="t" d="M12 8c-1.6-.4-2.5-1.8-2.5-3.5 1.6.4 2.5 1.8 2.5 3.5zm0 0c1.6-.4 2.5-1.8 2.5-3.5-1.6.4-2.5 1.8-2.5 3.5zm0 4c-1.6-.4-2.5-1.8-2.5-3.5 1.6.4 2.5 1.8 2.5 3.5zm0 0c1.6-.4 2.5-1.8 2.5-3.5-1.6.4-2.5 1.8-2.5 3.5zm0 4c-1.6-.4-2.5-1.8-2.5-3.5 1.6.4 2.5 1.8 2.5 3.5zm0 0c1.6-.4 2.5-1.8 2.5-3.5-1.6.4-2.5 1.8-2.5 3.5z"/>',
  spool: '<rect class="t" x="8.5" y="6" width="7" height="12"/><rect class="t2" x="7" y="3" width="10" height="3" rx="1"/><rect class="t2" x="7" y="18" width="10" height="3" rx="1"/><path d="m8.5 9 7 3m-7 1 7 3"/>',
  horseshoe: '<path class="t" d="M6 20v-9a6 6 0 0 1 12 0v9h-3v-9a3 3 0 0 0-6 0v9z"/><path d="M7.5 17h.01M7.5 13.5h.01M16.5 17h.01M16.5 13.5h.01"/>',
  medkit: '<rect class="t2" x="3.5" y="8" width="17" height="12" rx="2"/><path d="M9 8V6h6v2"/><path class="t" d="M10.7 10.5h2.6v2.2h2.2v2.6h-2.2v2.2h-2.6v-2.2H8.5v-2.6h2.2z"/>',
  pipe: '<path class="t2" d="M4 11h9v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M13 12.5h4l3-3"/><path d="M7 8c0-1 1-1.5 1-2.5M10 8c0-1 1-1.5 1-2.5"/>',
  page: '<path class="t2" d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3M9 10h6M9 13h6M9 16h4"/>',
  gear: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle class="t2" cx="12" cy="12" r="5"/><circle class="t" cx="12" cy="12" r="2"/>',
  crate: '<path class="t2" d="m4 8 8-4 8 4v9l-8 4-8-4z"/><path d="m4 8 8 4 8-4M12 12v9M8 6l8 4"/>',
  target: '<circle class="t2" cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle class="t" cx="12" cy="12" r="1.6"/>',
  feather: '<path class="t" d="M19 4C12 4 6 9 6 16v3h3c7 0 11-6 10-15z"/><path d="m5 21 9-9M10 15h4M12 12h4"/>',
  bowl: '<path class="t2" d="M4 12h16a8 8 0 0 1-16 0z"/><path d="M3 12h18M9 9c0-1 1-1.5 1-2.5M13 9c0-1 1-1.5 1-2.5"/>',
  gem: '<path class="t" d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9 4 7 9l5 11 5-11-2-5"/>',
  basket: '<path class="t2" d="M4 10h16l-2 10H6z"/><path d="m8 10 3-6m5 6-3-6M5 14h14M9 10v10M15 10v10"/>',
  log: '<rect class="t2" x="2.5" y="8.5" width="16" height="8" rx="4"/><ellipse class="t" cx="18.5" cy="12.5" rx="3" ry="4"/><path d="M18.5 12.5h.01M6 11h5M8 14h4"/>',
  coin: '<circle class="t" cx="12" cy="12" r="8"/><path d="M14.5 9.5c-.4-.9-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2.1-.6-2.5-1.5M12 6.5v11"/>'
};
const colors = {rose:'#c2414f', yellow:'#e2a72a', lavender:'#8f74c6', amber:'#d9913a', green:'#6f9a52', herb:'#7d9a5d', kraft:'#d8bd8f', brown:'#7a4b25', pink:'#e39aa8', wood:'#c79b6a', cream:'#efe2c4', red:'#b23a48', grey:'#9aa3a8', blue:'#5a7fa8'};
const c = colors;
// Botica products and common plants get their own drawing and colours.
const items = {
  'Perfume':['perfume',c.rose], 'Perfume Silvestre':['perfume',c.yellow], 'Perfume de Lavanda':['perfume',c.lavender],
  'Óleo de Girassol':['oil',c.amber,c.yellow], 'Fertilizante':['sack',c.green,c.kraft], 'Combo Botânicos':['gift',c.red,c.kraft],
  'Ervas para Defumação':['smudge',c.herb], 'Ervas Aromáticas':['sprig',c.herb], 'Ervas Medicinais':['medleaf',c.herb,c.red],
  'Buquê de Flores':['bouquet',c.pink,c.kraft], 'Buquê de Rosas':['bouquet',c.rose,c.kraft], 'Buquê de Lavanda':['bouquet',c.lavender,c.kraft],
  'Buquê de Girassóis':['bouquet',c.yellow,c.kraft], 'Minhocário':['wormbox',c.pink,c.wood], 'Ramalhete Silvestre':['posy',c.pink,c.yellow],
  'Semente Melhorada':['seed',c.green,c.kraft], 'Semente Selecionada':['seed',c.amber,c.cream],
  'Rosa':['rose',c.rose,c.green], 'Rosa (coleta)':['rose',c.rose,c.green], 'Girassol':['sunflower',c.yellow,c.brown], 'Lavanda':['lavender',c.lavender],
  'Mel':['oil',c.amber,c.yellow], 'Tomilho':['sprig',c.herb], 'Húmus':['sack',c.brown,c.kraft], 'Esterco':['sack',c.brown,c.kraft],
  'Fibra Vegetal':['sprig',c.wood], 'Tronco de Madeira':['log',c.wood,c.wood], 'Tora Boa':['log',c.wood,c.wood], 'Tora Ruim':['log',c.grey,c.wood]
};
const sections = {
  'Fazendas':['wheat',c.yellow], 'Botânicos':['leaf',c.green], 'Ateliês':['spool',c.blue,c.cream], 'Estábulos':['horseshoe',c.grey],
  'Hospital':['medkit',c.red,c.cream], 'Tabacarias':['pipe',c.brown,c.wood], 'Tipografias':['page',c.grey,c.cream], 'Fábricas':['gear',c.grey,c.cream],
  'Armazém':['crate',c.wood,c.kraft], 'Armarias':['target',c.red,c.cream], 'Nativos':['feather',c.amber], 'Salões':['bowl',c.amber,c.cream],
  'Minérios':['gem',c.blue], 'Coleta':['basket',c.green,c.kraft], 'Lenhador':['log',c.wood,c.wood]
};
function iconFor(item) {
  const own = items[item.name]
    || (/^(Semente|Pacote de Semente)/.test(item.name) && ['seed', c.green, c.kraft])
    || (item.origin === 'Fazenda Venda' && ['leaf', c.green])
    || sections[item.section] || ['coin', c.amber];
  const [shape, tint, tint2 = c.cream] = own;
  return {shape, tint, tint2};
}
function svg(item, className = 'ico') {
  const {shape, tint, tint2} = iconFor(item);
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="--tint:${tint};--tint2:${tint2}">${shapes[shape]}</svg>`;
}
return {shapes, iconFor, svg};
})();
if (typeof module !== 'undefined') module.exports = PdvIcons;
