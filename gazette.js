// Cents per unit, transcribed from the two Gazeta Comercial screenshots supplied
// in this conversation (edition XLI, 17 October 1899).
// Truncated labels and the inverted Escova Equina range are retained explicitly.
const gazetteSections = {
  'Fazendas': [
    ['Amido de Milho',4,6], ['Açúcar Refinado',5,7], ['Caixa de Agarita',18,22], ['Caixa de Gaulteria',18,22],
    ['Caixa de Groselha Dourada',18,22], ['Caixa de Mirtilo-silvestre',18,22], ['Caixa de Orégano',18,22], ['Carne de Peixe',4,5],
    ['Cera de Abelha',12,15], ['Chocolate',4,6], ['Creme de Leite',9,11], ['Farinha',5,7],
    ['Garrafa de Álcool',4,6], ['Geléia de Frutas Amarelas',8,10], ['Geléia de Frutas Cítricas',8,10], ['Geléia de Frutas Vermelhas',8,10],
    ['Geléia de Morango',8,10], ['Geléia de Pimenta',4,6], ['Iogurte',6,8], ['Leite',4,6],
    ['Levedura',8,10], ['Manteiga',10,13], ['Melado de Cana',5,7], ['Molho de Pimenta',8,10],
    ['Polpa de Amora',5,7], ['Polpa de Banana',5,7], ['Polpa de Cereja',5,7], ['Polpa de Framboesa',5,7],
    ['Polpa de Groselha',5,7], ['Polpa de Laranja',5,7], ['Polpa de Limão',5,7], ['Polpa de Maçã',5,7],
    ['Polpa de Manga',5,7], ['Polpa de Pera',5,7], ['Polpa de Pêssego',5,7], ['Polpa de Uva',5,7],
    ['Pó de Café',6,8], ['Queijo',7,9], ['Ração',2,3], ['Sal',8,10], ['Óleo de Milho',5,7]
  ],
  'Botânicos': [
    ['Buquê de Flores',10,15], ['Combo Botânicos',18,23], ['Ervas Aromáticas',6,8], ['Ervas Medicinais',4,6],
    ['Ervas para Defumação',5,7], ['Fertilizante',1,2], ['Pacote de Semente de Agarita',3,4], ['Pacote de Semente de Gaulteria',3,4],
    ['Pacote de Semente de Groselha…',3,4,'Nome truncado na imagem; complemento a confirmar.'],
    ['Pacote de Semente de Mirtilo-…',3,4,'Nome truncado na imagem; complemento a confirmar.'],
    ['Pacote de Semente de Orégano',3,4], ['Perfume',12,16], ['Óleo de Girassol',10,15]
  ],
  'Ateliês': [
    ['Cera de Cabelo',17,19], ['Combo Ateliê',18,22], ['Linha de Algodão',3,5], ['Tecido',5,7]
  ],
  'Estábulos': [
    ['Combo Estábulo',10,22], ['Escova Equina',6,5,'Faixa invertida na imagem: mínimo $0,06 e máximo $0,05. Valores preservados; confirmar na fonte.'],
    ['Estimulante Equino',9,11], ['Estimulante de Cruza',4500,5500], ['Ração de Cavalo',10,13],
    ['Seringa de Reanimação…',8,10,'Nome truncado na imagem; complemento a confirmar.'], ['Tônico Cura Equino',11,13]
  ],
  'Hospital': [
    ['Antídoto Cobras',15,20], ['Bandagem',5,7], ['Kit de Primeiros Socorros',15,20], ['Tônico de Ervas',10,15]
  ],
  'Tabacarias': [
    ['Bala de Mel',5,7], ['Caixa de Cigarros',60,70], ['Charuto',14,17], ['Combo Tabacaria',17,22],
    ['Fósforo',7,9], ['Goma de Tabaco',7,9], ['Isqueiro',25,35], ['Tabaco Curado',6,8]
  ],
  'Tipografias': [
    ['Cartão de Visita',5,7], ['Combo Tipografia',18,25], ['Diagrama de Escopeta',67,71], ['Diagrama de Munição',20,23],
    ['Diagrama de Pistola',45,50], ['Diagrama de Repetidora',82,90], ['Diagrama de Revólver',38,45], ['Diagrama de Rifle',64,70],
    ['Embalagem de Papel',6,8], ['Folheto',10,12], ['Jornal',14,17], ['Manual de Cruza',1000,1500],
    ['Mapa',10,15], ['Papel de Projeto de Arma',120,180], ['Papel de Rolo',6,9], ['Seda',21,24]
  ],
  'Fábricas': [
    ['Carvão Mineral',4,6], ['Celulose',2,4], ['Combo Fábrica',21,27], ['Couro Curtido',11,13],
    ['Cápsula de Munição',2,4], ['Defumador',15,20], ['Ferradura',7,10], ['Frasco Vazio',2,3],
    ['Garrafa de Vidro',2,4], ['Lingote de Aço',9,11], ['Lingote de Cobre',5,8], ['Lingote de Ferro',7,10],
    ['Lingote de Ouro',9,12], ['Lingote de Prata',9,12], ['Madeira Beneficiada',14,16], ['Moedor',5,7],
    ['Pilão',2,3], ['Pregos',3,5], ['Pólvora',3,5], ['Seringa de Vidro',3,4],
    ['Tinta de Imprensa',7,9], ['Tábua',1,2], ['Varal de Secar',19,22]
  ],
  'Armazém': [
    ['Balde Vazio',20,22], ['Bolsa Térmica',25,28], ['Caixa de Colmeia',5,8], ['Caixa de Madeira',11,14],
    ['Combo Armazém',29,40], ['Cutelo',25,30], ['Câmera',500,700], ['Faca de Caça',20,25],
    ['Facas de Arremesso',30,35], ['Kit de Reparo de Arma',16,20], ['Machado',14,16], ['Machado Reforçado',27,30],
    ['Mochila de Couro',20,22], ['Peneira',5,7], ['Peneira Avançada',14,16], ['Picareta',22,24],
    ['Picareta Reforçada',25,27], ['Pomada de Picada',2,3], ['Rainha Mansa',2,3], ['Rainha Selvagem',4,6],
    ['Ramalhete Silvestre',1,2], ['Rastelo',15,17], ['Rede de Pesca',12,15], ['Saca Vazia',4,6],
    ['Vara de Pesca',30,35], ['Vela',19,21], ['Verniz',10,12], ['Véu de Apicultor',3,5], ['Xarope de Açúcar',1,2]
  ],
  'Armarias': [
    ['Caixa de Munição Espingarda (N)',55,60], ['Caixa de Munição Pistola (E)',55,60], ['Caixa de Munição Pistola (N)',35,40], ['Caixa de Munição Repetidora (E)',80,85],
    ['Caixa de Munição Repetidora (N)',55,60], ['Caixa de Munição Revólver (E)',50,55], ['Caixa de Munição Revólver (N)',35,40], ['Caixa de Munição Rifle (E)',70,75],
    ['Caixa de Munição Rifle (N)',42,47], ['Caixa de Munição Rifle de Caça…',60,65,'Nome truncado na imagem; complemento a confirmar.'],
    ['Caixa de Munição Rifle de Elefante…',120,130,'Nome truncado na imagem; complemento a confirmar.'], ['Carabina Repetidora',4800,5300],
    ['Combo Armaria',66,77], ['Espingarda Cano Duplo',5500,6000], ['Evans Repetidora',5000,5500], ['Henry Repetidora',5500,6000],
    ['Pano de Limpeza de Arma',25,30], ['Peças Importadas',800,800], ['Pistola M1899',5500,6000], ['Pistola Mauser',4800,5300],
    ['Pistola Volcanic',4500,5000], ['Revólver Ação Dupla',3500,4000], ['Revólver Cattleman',1800,2000], ['Revólver LeMat',4500,5500],
    ['Revólver Schofield',4000,4500], ['Rifle Springfield',6000,6500], ['Rifle de Ferrolho',7000,7500], ['Winchester Repetidora',5700,6200]
  ],
  'Nativos': [
    ['Arco Padrão',1000,1500], ['Essência de Fertilidade',1000,1500], ['Flecha (N)',11,14], ['Laço Reforçado',47,56],
    ['Tocha',19,24], ['Tomahawk',12,15], ['Ave · Pombo',30000,30000], ['Ave · Corrupião',30000,30000],
    ['Ave · Tordo',30000,30000], ['Ave · Canário',30000,30000], ['Ave · Cardeal',32500,32500], ['Ave · Gaio-azul',35000,35000],
    ['Ave · Pato',30000,30000], ['Ave · Ganso-do-Canadá',30000,30000], ['Ave · Gaivota',30000,30000], ['Ave · Mergulhão',37500,37500],
    ['Ave · Biguá',37500,37500], ['Ave · Colhereiro',32500,32500], ['Ave · Corvo',55000,55000], ['Ave · Arara',55000,55000],
    ['Ave · Pica-pau',55000,55000], ['Ave · Condor',55000,55000], ['Ave · Falcão',92500,92500], ['Ave · Coruja',82500,82500],
    ['Ave · Águia',150000,150000], ['Lendário · Bluegill',500,500], ['Lendário · Perca',500,500], ['Lendário · Achigã-de-Pedra',500,500],
    ['Lendário · Bagre Cabeça-de-Touro',500,500], ['Lendário · Lúcio Chain',500,500],
    ['Lendário · Lúcio Barbatana-…',500,500,'Nome truncado na imagem; complemento a confirmar.'], ['Lendário · Achigã Boca-Pequena',700,700],
    ['Lendário · Achigã Boca-Grande',700,700], ['Lendário · Truta Arco-íris',700,700], ['Lendário · Muskie',1000,1000], ['Lendário · Lúcio do Norte',1000,1000],
    ['Lendário · Peixe-Jacaré',1000,1000], ['Lendário · Esturjão do Lago',1000,1000], ['Lendário · Salmão Sockeye',1000,1000]
  ],
  'Salões': [
    ['Absinto',20,25], ['Almôndegas com Purê de Batatas',20,25], ['Bacalhau ao Forno',20,25], ['Batido de Amora',15,20],
    ['Batido de Pera',15,20], ['Batido de Pêssego',15,20], ['Bife com Fritas',20,25], ['Biscoito de Chocolate',15,20],
    ['Bolo Três Leches',15,20], ['Bolo de Chocolate',15,20], ['Bombom de Laranja',15,20], ['Broa de Milho com Geléia',15,20],
    ['Burrito de Frango',20,25], ['Cachaça',20,25], ['Café Espresso',15,20], ['Café Preto',15,20],
    ['Café au Lait',15,20], ['Capuccino',15,20], ['Carne de Porco com Molho',20,25], ['Cassoulet',20,25],
    ['Cerveja',20,25], ['Chilli com Carne',20,25], ['Chocolate Quente',15,20], ['Churros',15,20],
    ['Chá de Amora',15,20], ['Chá de Ervas',15,20], ['Chá de Frutas',15,20], ['Chá de Menta',15,20],
    ['Chá de Pêssego',15,20], ['Conhaque',20,25], ['Costelinha de Porco',20,25], ['Cozido de Carne',20,25],
    ['Doce de Leite com Chocolate',15,20], ['Ensopado de Carne',20,25], ['Escondidinho',20,25], ['Fajitas Chaparras',20,25],
    ['Feijão Tropeiro',20,25], ['Flan de Chocolate',15,20], ['Frango com Legumes',20,25], ['Frango com Polenta',20,25],
    ['Frutas com Mel',15,20], ['Galinhada',20,25], ['Gim',20,25], ['Hidromel',20,25],
    ['Jacaré Ensopado',20,25], ['Kallops',20,25], ['Leite com Mel',15,20], ['Limonada Francesa',15,20],
    ['Macarrão a Bolognesa',20,25], ['Mezcal',20,25], ['Mousse de Chocolate',15,20], ['Mousse de Limão',15,20],
    ['Mustikkapiirakka',15,20], ['Paleta de Chocolate',15,20], ['Parfait de Morango',15,20], ['Pato ao Vinho',20,25],
    ['Pavê de Chocolate',15,20], ['Peixe Empanado',20,25], ['Peru Recheado',20,25], ['Picolé de Limão',15,20],
    ['Pudim de Leite',15,20], ['Pão de Mel',15,20], ['Quesadilla',20,25], ['Quibebe',20,25],
    ['Quiche Lorraine',20,25], ['Rabanada',15,20], ['Rocambole de Carne',20,25], ['Rosbife com Batatas',20,25],
    ['Rum',20,25], ['Salmão com Manteiga de Sálvia',20,25], ['Skause',20,25], ['Sopa de Legumes',20,25],
    ['Sorvete de Amora',15,20], ['Sorvete de Framboesa',15,20], ['Sorvete de Uva',15,20], ['Suco de Amora',15,20],
    ['Suco de Framboesa',15,20], ['Suco de Frutas Vermelhas',15,20], ['Suco de Groselha',15,20], ['Suco de Laranja',15,20],
    ['Suco de Limão',15,20], ['Suco de Maçã',15,20], ['Suco de Morango',15,20], ['Suco de Pera',15,20],
    ['Suco de Pêssego',15,20], ['Sundae de Morango',15,20], ['Taco com Machaca',20,25], ['Tacos de Frango',20,25],
    ['Tequila',20,25], ['Torta de Frango',20,25], ['Torta de Maçã',15,20], ['Torta de Morango',15,20],
    ['Tábua de Frios',20,25], ['Vaca Atolada',20,25], ['Veado Assado',20,25], ['Veado Braseado',20,25],
    ['Vinho',20,25], ['Vitamina de Banana',15,20], ['Vitamina de Frutas',15,20], ['Vodka',20,25],
    ['Whiskey',20,25], ['Água Fresca de Limão',15,20], ['Água Fresca de Morango',15,20]
  ],
  'Minérios': [
    ['Carvão',13,15,undefined,100], ['Cobre bruto',22,25,undefined,100], ['Ferro bruto',29,34,undefined,100], ['Ouro bruto',20,30,undefined,10],
    ['Pedra',9,12,undefined,100], ['Prata bruta',16,20,undefined,20], ['Quartzo',30,50,undefined,100], ['Salitre',45,65,undefined,100]
  ]
};
// The user confirmed mineral prices apply to the displayed lot, not each unit.
const gazetteItems = Object.entries(gazetteSections).flatMap(([section, rows]) => rows.map(([name, sourceMin, sourceMax, sourceNote, lotSize = 1]) => ({name, min: sourceMin / lotSize, max: sourceMax / lotSize, section, lotSize, sourceMin, sourceMax, sourceNote: sourceNote || (lotSize > 1 ? `Lote de ${lotSize} un.: $${(sourceMin / 100).toFixed(2)} a $${(sourceMax / 100).toFixed(2)} na Gazeta. Valores da tabela divididos por ${lotSize}, conforme confirmação de que a faixa é por lote.` : undefined)})));
if (typeof module !== 'undefined') module.exports = {gazetteItems};
