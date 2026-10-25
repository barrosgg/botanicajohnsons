// Cents per unit, transcribed from the Gazeta Comercial screenshots supplied
// in this conversation (edition XLII, 25 October 1899, pages 1–21; pages 21–29 are in county-prices.js).
// Truncated labels stay explicit; recipe names are kept where the edition spells them differently.
const gazetteSections = {
  "Fazendas": [
    ["Amido de Milho", 4, 6], ["Açúcar Refinado", 5, 7], ["Caixa de Agarita", 18, 22], ["Caixa de Gaulteria", 18, 22],
    ["Caixa de Groselha Dourada", 18, 22], ["Caixa de Mirtilo-silvestre", 18, 22], ["Caixa de Orégano", 18, 22], ["Carne Bovina", 22, 34],
    ["Carne Ovina", 16, 25], ["Carne de Galinha", 4, 6], ["Carne de Peixe", 7, 11], ["Carne de Porco", 7, 11],
    ["Cera de Abelha", 12, 15], ["Chocolate", 4, 6], ["Creme de Leite", 9, 11], ["Farinha", 5, 7],
    ["Garrafa de Álcool", 4, 6, "Grafado “Garrafa de Alcool” na edição XLII."], ["Geleia Real", 90, 120], ["Geléia de Frutas Amarelas", 8, 10], ["Geléia de Frutas Cítricas", 8, 10],
    ["Geléia de Frutas Vermelhas", 8, 10], ["Geléia de Morango", 8, 10], ["Geléia de Pimenta", 4, 6], ["Iogurte", 6, 8],
    ["Leite", 4, 6], ["Levedura", 8, 10], ["Manteiga", 10, 13], ["Mel", 4, 5],
    ["Melado de Cana", 5, 7], ["Molho de Pimenta", 8, 10], ["Polpa de Amora", 5, 7], ["Polpa de Banana", 5, 7],
    ["Polpa de Cereja", 5, 7], ["Polpa de Framboesa", 5, 7], ["Polpa de Groselha", 5, 7], ["Polpa de Laranja", 5, 7],
    ["Polpa de Limão", 5, 7], ["Polpa de Maçã", 5, 7], ["Polpa de Morango", 5, 7], ["Polpa de Pera", 5, 7],
    ["Polpa de Pimenta", 4, 5], ["Polpa de Pêssego", 5, 7], ["Polpa de Uva", 5, 7], ["Própolis", 18, 23],
    ["Pó de Café", 6, 8], ["Queijo", 7, 9], ["Ração", 2, 3], ["Sal", 8, 10],
    ["Óleo de Milho", 5, 7]
  ],
  "Botânicos": [
    ["Buquê de Flores", 10, 15], ["Buquê de Girassóis", 30, 40], ["Buquê de Lavanda", 30, 40], ["Buquê de Rosas", 30, 40],
    ["Combo Botânicos", 18, 23], ["Ervas Aromáticas", 6, 8], ["Ervas Medicinais", 4, 6], ["Ervas para Defumação", 5, 7],
    ["Fertilizante", 1, 2], ["Minhocário", 115, 135], ["Perfume", 12, 16], ["Perfume Silvestre", 35, 45],
    ["Perfume de Lavanda", 35, 45], ["Rainha Mansa", 2, 3], ["Rainha Selvagem", 4, 6], ["Ramalhete Silvestre", 1, 2],
    ["Óleo de Girassol", 10, 15], ["Semente Melhorada", 40, 60, "A Gazeta mostra “Semente Melhorada…”, cortado. No livro da Botica todas as variedades (de Milho, de Cana, de Pimenta etc.) têm a mesma receita; esta faixa é usada para todas."], ["Semente Selecionada", 100, 100, "A Gazeta mostra “Semente Selecionada…”, cortado; o nome completo vem do livro da Botica. O preço de $1,00 é por lote de 100, conforme confirmação do usuário.", 100]
  ],
  "Ateliês": [
    ["Cera de Cabelo", 17, 19], ["Combo Ateliê", 18, 22], ["Figurino Sob Medida", 56, 72], ["Linha de Algodão", 3, 5],
    ["Tecido", 5, 7]
  ],
  "Estábulos": [
    ["Combo Estábulo", 16, 22], ["Escova Equina", 5, 6], ["Estimulante Equino", 9, 11], ["Estimulante de Cruza", 4500, 5500],
    ["Ração de Cavalo", 10, 13], ["Seringa de Reanimação…", 8, 10, "Nome truncado na imagem; complemento a confirmar."], ["Tônico de Cura Equino", 11, 13], ["Treinamento de Cavalo (por treino)", 500, 1000]
  ],
  "Hospital": [
    ["Antibiótico Potente", 18, 23], ["Antídoto Cobras", 15, 20], ["Bandagem", 5, 7], ["Kit Cirúrgico", 42, 54],
    ["Kit de Primeiros Socorros", 15, 20], ["Tônico de Ervas", 10, 15]
  ],
  "Tabacarias": [
    ["Bala de Mel", 5, 7], ["Caixa de Cigarros", 60, 70], ["Charuto", 14, 17], ["Combo Tabacaria", 17, 22],
    ["Fósforo", 7, 9], ["Goma de Tabaco", 7, 9], ["Isqueiro", 25, 35], ["Tabaco Curado", 6, 8]
  ],
  "Tipografias": [
    ["Cartão de Visita", 5, 7], ["Combo Tipografia", 18, 25], ["Diagrama de Escopeta", 67, 71], ["Diagrama de Munição", 20, 23],
    ["Diagrama de Pistola", 45, 50], ["Diagrama de Repetidora", 82, 90], ["Diagrama de Revólver", 38, 45], ["Diagrama de Rifle", 64, 70],
    ["Embalagem de Papel", 6, 8], ["Folheto", 10, 12], ["Jornal", 14, 17], ["Manual de Cruza", 1000, 1500],
    ["Mapa", 10, 15], ["Papel de Imprensa", 11, 13], ["Papel de Projeto de Arma", 120, 180], ["Papel de Rolo", 6, 9],
    ["Seda", 21, 24]
  ],
  "Fábricas": [
    ["Carvão Mineral", 4, 6], ["Celulose", 2, 4], ["Combo Fábrica", 21, 27], ["Couro Curtido", 11, 13],
    ["Cápsula de Munição", 2, 4], ["Defumador", 15, 20], ["Ferradura", 7, 10], ["Frasco Vazio", 2, 3],
    ["Garrafa de Vidro", 2, 4], ["Lingote de Aço", 9, 11], ["Lingote de Cobre", 5, 8], ["Lingote de Ferro", 7, 10],
    ["Lingote de Ouro", 9, 12], ["Lingote de Prata", 9, 12], ["Madeira Beneficiada", 14, 16], ["Moedor", 5, 7],
    ["Parafusos", 3, 5], ["Pilão", 2, 3], ["Pregos", 3, 5], ["Pólvora", 3, 5],
    ["Seringa de Vidro", 3, 4], ["Tinta de Imprensa", 7, 9], ["Tábua", 1, 2], ["Varal de Secar", 19, 22]
  ],
  "Armazém": [
    ["Balde Vazio", 20, 22], ["Bolsa Térmica", 25, 28], ["Caixa de Colmeia", 5, 8], ["Caixa de Madeira", 11, 14],
    ["Combo Armazém", 29, 40], ["Corda", 10, 15], ["Cutelo", 25, 30], ["Câmera", 500, 700],
    ["Faca de Caça", 20, 25], ["Facas de Arremesso", 30, 35], ["Kit de Reparo de Arma", 16, 20], ["Machado", 14, 16],
    ["Machado Reforçado", 27, 30], ["Mochila de Couro", 20, 22], ["Pena de Ave Pequena", 2, 2], ["Peneira", 5, 7],
    ["Peneira Avançada", 14, 16], ["Picareta", 22, 24], ["Picareta Reforçada", 25, 27], ["Pomada de Picada", 2, 3],
    ["Rastelo", 15, 17], ["Rede de Pesca", 12, 15], ["Saca Vazia", 4, 6, "Chamado de “Saca” na edição XLII."], ["Vara de Pesca", 30, 35],
    ["Vela", 19, 21], ["Verniz", 10, 12], ["Véu de Apicultor", 3, 5], ["Xarope de Açúcar", 1, 2]
  ],
  "Armarias": [
    ["Cabo de Escopeta", 71, 92], ["Cabo de Pistola", 48, 62], ["Cabo de Repetidora", 40, 52], ["Cabo de Revólver", 48, 62],
    ["Cabo de Rifle", 57, 74], ["Caixa de Munição Espingarda (N)", 55, 60], ["Caixa de Munição Pistola (E)", 55, 60], ["Caixa de Munição Pistola (N)", 35, 40],
    ["Caixa de Munição Repetidora (E)", 80, 85], ["Caixa de Munição Repetidora (N)", 55, 60], ["Caixa de Munição Revólver (E)", 50, 55], ["Caixa de Munição Revólver (N)", 35, 40],
    ["Caixa de Munição Rifle (E)", 70, 75], ["Caixa de Munição Rifle (N)", 42, 47], ["Caixa de Munição Rifle de Caça…", 60, 65, "Nome truncado na imagem; complemento a confirmar."], ["Caixa de Munição Rifle de Elefante…", 120, 130, "Nome truncado na imagem; complemento a confirmar."],
    ["Cano de Escopeta", 32, 41], ["Cano de Pistola", 32, 41], ["Cano de Repetidora", 64, 83], ["Cano de Revólver", 32, 41],
    ["Cano de Rifle", 30, 39], ["Carabina Repetidora", 4800, 5300], ["Cilindro de Revólver", 21, 28], ["Combo Armaria", 66, 77],
    ["Corpo de Escopeta", 37, 47], ["Corpo de Pistola", 40, 52], ["Corpo de Repetidora", 46, 60], ["Corpo de Revólver", 23, 30],
    ["Corpo de Rifle", 59, 77], ["Espingarda Cano Duplo", 5500, 6000], ["Evans Repetidora", 5000, 5500], ["Henry Repetidora", 5500, 6000],
    ["Pano de Limpeza de Arma", 25, 30], ["Peças Importadas", 800, 800], ["Pistola M1899", 5500, 6000], ["Pistola Mauser", 4800, 5300],
    ["Pistola Volcanic", 4500, 5000], ["Revólver Ação Dupla", 3500, 4000], ["Revólver Cattleman", 1800, 2000], ["Revólver LeMat", 4500, 5500],
    ["Revólver Schofield", 4000, 4500], ["Rifle Springfield", 6000, 6500], ["Rifle de Ferrolho", 7000, 7500], ["Tambor de Repetidora", 29, 38],
    ["Winchester Repetidora", 5700, 6200]
  ],
  "Nativos": [
    ["Arco Melhorado", 1700, 2000], ["Arco Padrão", 1000, 1500], ["Flecha (Fogo)", 22, 28], ["Flecha (N)", 11, 14],
    ["Flecha (P)", 11, 14], ["Flecha (Veneno)", 22, 28], ["Flecha Farpada", 17, 21], ["Flecha de Exaustão", 22, 28],
    ["Flecha de Fumaça Sagrada", 22, 28], ["Flecha de Ocre", 17, 21], ["Flecha de Rastreio", 17, 21], ["Flecha de Sílex", 17, 21],
    ["Flecha de Trovão", 22, 28], ["Laço Reforçado", 47, 56], ["Ave · Pombo", 30000, 30000], ["Ave · Corrupião", 30000, 30000],
    ["Ave · Tordo", 30000, 30000], ["Ave · Canário", 30000, 30000], ["Ave · Cardeal", 32500, 32500], ["Ave · Gaio-azul", 35000, 35000],
    ["Ave · Pato", 30000, 30000], ["Ave · Ganso-do-Canadá", 30000, 30000], ["Ave · Gaivota", 30000, 30000], ["Ave · Mergulhão", 37500, 37500],
    ["Ave · Biguá", 37500, 37500], ["Ave · Colhereiro", 32500, 32500], ["Ave · Corvo", 55000, 55000], ["Ave · Arara", 55000, 55000],
    ["Ave · Pica-pau", 55000, 55000], ["Ave · Condor", 55000, 55000], ["Ave · Falcão", 92500, 92500], ["Ave · Coruja", 82500, 82500],
    ["Ave · Águia", 150000, 150000], ["Lendário · Bluegill", 500, 500], ["Lendário · Perca", 500, 500], ["Lendário · Achigã-de-Pedra", 500, 500],
    ["Lendário · Bagre Cabeça-de-Touro", 500, 500], ["Lendário · Lúcio Chain", 500, 500], ["Lendário · Lúcio Barbatana-…", 500, 500, "Nome truncado na imagem; complemento a confirmar."], ["Lendário · Achigã Boca-Pequena", 700, 700],
    ["Lendário · Achigã Boca-Grande", 700, 700], ["Lendário · Truta Arco-Íris", 700, 700], ["Lendário · Muskie", 1000, 1000], ["Lendário · Lúcio do Norte", 1000, 1000],
    ["Lendário · Peixe-Jacaré", 1000, 1000], ["Lendário · Esturjão do Lago", 1000, 1000], ["Lendário · Salmão Sockeye", 1000, 1000]
  ],
  "Salões": [
    ["Absinto", 30, 35], ["Almôndegas com Purê de Batatas", 30, 35], ["Aquavit", 30, 35], ["Bacalhau ao Forno", 30, 35],
    ["Batido de Amora", 30, 35], ["Batido de Pera", 30, 35], ["Batido de Pêssego", 30, 35], ["Bife com Fritas", 30, 35],
    ["Biscoito de Chocolate", 30, 35], ["Bolo Três Leches", 30, 35], ["Bolo de Chocolate", 30, 35], ["Bombom de Laranja", 30, 35],
    ["Broa de Milho com Geléia", 30, 35], ["Burrito de Frango", 30, 35], ["Cachaça", 30, 35], ["Café Espresso", 30, 35],
    ["Café Preto", 30, 35], ["Café au Lait", 30, 35], ["Capuccino", 30, 35], ["Carne de Porco com Molho", 30, 35],
    ["Cassoulet", 30, 35], ["Cerveja", 30, 35, "Aparece duas vezes na página 16, com a mesma faixa; consolidado em uma referência."], ["Chilli com Carne", 30, 35], ["Chocolate Quente", 30, 35],
    ["Churros", 30, 35], ["Chá de Amora", 30, 35], ["Chá de Ervas", 30, 35], ["Chá de Frutas", 30, 35],
    ["Chá de Menta", 30, 35], ["Chá de Pêssego", 30, 35], ["Conhaque", 30, 35], ["Costelinha de Porco", 30, 35],
    ["Cozido de Carne", 30, 35], ["Doce de Leite com Chocolate", 30, 35], ["Ensopado de Carne", 30, 35], ["Escondidinho", 30, 35],
    ["Fajitas Chaparras", 30, 35], ["Feijão Tropeiro", 30, 35], ["Flan de Chocolate", 30, 35], ["Frango com Legumes", 30, 35],
    ["Frango com Polenta", 30, 35], ["Frutas com Mel", 30, 35], ["Galinhada", 30, 35], ["Gim", 30, 35],
    ["Hidromel", 30, 35], ["Jacaré Braseado", 30, 35], ["Jacaré Ensopado", 30, 35], ["Kallops", 30, 35],
    ["Leite com Mel", 30, 35], ["Limonada Francesa", 30, 35], ["Macarrão a Bolognesa", 30, 35], ["Mezcal", 30, 35],
    ["Mousse de Chocolate", 30, 35], ["Mousse de Limão", 30, 35], ["Mustikkapiirakka", 30, 35], ["Paleta de Chocolate", 30, 35],
    ["Parfait de Morango", 30, 35], ["Pato ao Vinho", 30, 35], ["Pavê de Chocolate", 30, 35], ["Peixe Empanado", 30, 35],
    ["Peru Recheado", 30, 35], ["Picolé de Limão", 30, 35], ["Pudim de Leite", 30, 35], ["Pão de Mel", 30, 35],
    ["Quesadilla", 30, 35], ["Quibebe", 30, 35], ["Quiche Lorraine", 30, 35], ["Rabanada", 30, 35],
    ["Rocambole de Carne", 30, 35], ["Rosbife com Batatas", 30, 35], ["Rum", 30, 35], ["Salmão com Manteiga de Sálvia", 30, 35],
    ["Skause", 30, 35], ["Sopa de Legumes", 30, 35], ["Sorvete de Amora", 30, 35], ["Sorvete de Framboesa", 30, 35],
    ["Sorvete de Uva", 30, 35], ["Suco de Amora", 30, 35], ["Suco de Framboesa", 30, 35], ["Suco de Frutas Vermelhas", 30, 35],
    ["Suco de Groselha", 30, 35], ["Suco de Laranja", 30, 35], ["Suco de Limão", 30, 35], ["Suco de Maçã", 30, 35],
    ["Suco de Morango", 30, 35], ["Suco de Pera", 30, 35], ["Suco de Pêssego", 30, 35], ["Sundae de Morango", 30, 35],
    ["Taco com Machaca", 30, 35], ["Tacos de Frango", 30, 35], ["Tequila", 30, 35], ["Torta de Frango", 30, 35],
    ["Torta de Maçã", 30, 35], ["Torta de Morango", 30, 35], ["Tábua de Frios", 30, 35], ["Vaca Atolada", 30, 35],
    ["Veado Assado", 30, 35], ["Veado Braseado", 30, 35], ["Vinho", 30, 35], ["Vitamina de Banana", 30, 35],
    ["Vitamina de Frutas", 30, 35], ["Vodka", 30, 35], ["Whiskey", 30, 35], ["Água Fresca de Limão", 30, 35],
    ["Água Fresca de Morango", 30, 35]
  ],
  "Minérios": [
    ["Diamante", 250, 350], ["Esmeralda", 250, 350], ["Rubi", 250, 350], ["Safira", 250, 350],
    ["Carvão", 13, 15, undefined, 100], ["Cobre bruto", 22, 25, undefined, 100], ["Ferro bruto", 29, 34, undefined, 100], ["Ouro bruto", 20, 30, undefined, 10],
    ["Pedra", 9, 12, undefined, 100], ["Prata bruta", 16, 20, undefined, 20], ["Quartzo", 30, 50, undefined, 100], ["Salitre", 45, 65, undefined, 100],
    ["Enxofre", 40, 60, undefined, 100]
  ]
};
// Edition XLII is the complete official table: XLI entries absent from it were removed.
// XLI ranges of entries whose XLII range differs, shown in each item note.
const previousRanges = {
  "Carne de Peixe":[4, 5], "Combo Estábulo":[10, 22], "Escova Equina":[6, 5], "Absinto":[20, 25],
  "Almôndegas com Purê de Batatas":[20, 25], "Bacalhau ao Forno":[20, 25], "Batido de Amora":[15, 20], "Batido de Pera":[15, 20],
  "Batido de Pêssego":[15, 20], "Bife com Fritas":[20, 25], "Biscoito de Chocolate":[15, 20], "Bolo Três Leches":[15, 20],
  "Bolo de Chocolate":[15, 20], "Bombom de Laranja":[15, 20], "Broa de Milho com Geléia":[15, 20], "Burrito de Frango":[20, 25],
  "Cachaça":[20, 25], "Café Espresso":[15, 20], "Café Preto":[15, 20], "Café au Lait":[15, 20],
  "Capuccino":[15, 20], "Carne de Porco com Molho":[20, 25], "Cassoulet":[20, 25], "Cerveja":[20, 25],
  "Chilli com Carne":[20, 25], "Chocolate Quente":[15, 20], "Churros":[15, 20], "Chá de Amora":[15, 20],
  "Chá de Ervas":[15, 20], "Chá de Frutas":[15, 20], "Chá de Menta":[15, 20], "Chá de Pêssego":[15, 20],
  "Conhaque":[20, 25], "Costelinha de Porco":[20, 25], "Cozido de Carne":[20, 25], "Doce de Leite com Chocolate":[15, 20],
  "Ensopado de Carne":[20, 25], "Escondidinho":[20, 25], "Fajitas Chaparras":[20, 25], "Feijão Tropeiro":[20, 25],
  "Flan de Chocolate":[15, 20], "Frango com Legumes":[20, 25], "Frango com Polenta":[20, 25], "Frutas com Mel":[15, 20],
  "Galinhada":[20, 25], "Gim":[20, 25], "Hidromel":[20, 25], "Jacaré Ensopado":[20, 25],
  "Kallops":[20, 25], "Leite com Mel":[15, 20], "Limonada Francesa":[15, 20], "Macarrão a Bolognesa":[20, 25],
  "Mezcal":[20, 25], "Mousse de Chocolate":[15, 20], "Mousse de Limão":[15, 20], "Mustikkapiirakka":[15, 20],
  "Paleta de Chocolate":[15, 20], "Parfait de Morango":[15, 20], "Pato ao Vinho":[20, 25], "Pavê de Chocolate":[15, 20],
  "Peixe Empanado":[20, 25], "Peru Recheado":[20, 25], "Picolé de Limão":[15, 20], "Pudim de Leite":[15, 20],
  "Pão de Mel":[15, 20], "Quesadilla":[20, 25], "Quibebe":[20, 25], "Quiche Lorraine":[20, 25],
  "Rabanada":[15, 20], "Rocambole de Carne":[20, 25], "Rosbife com Batatas":[20, 25], "Rum":[20, 25],
  "Salmão com Manteiga de Sálvia":[20, 25], "Skause":[20, 25], "Sopa de Legumes":[20, 25], "Sorvete de Amora":[15, 20],
  "Sorvete de Framboesa":[15, 20], "Sorvete de Uva":[15, 20], "Suco de Amora":[15, 20], "Suco de Framboesa":[15, 20],
  "Suco de Frutas Vermelhas":[15, 20], "Suco de Groselha":[15, 20], "Suco de Laranja":[15, 20], "Suco de Limão":[15, 20],
  "Suco de Maçã":[15, 20], "Suco de Morango":[15, 20], "Suco de Pera":[15, 20], "Suco de Pêssego":[15, 20],
  "Sundae de Morango":[15, 20], "Taco com Machaca":[20, 25], "Tacos de Frango":[20, 25], "Tequila":[20, 25],
  "Torta de Frango":[20, 25], "Torta de Maçã":[15, 20], "Torta de Morango":[15, 20], "Tábua de Frios":[20, 25],
  "Vaca Atolada":[20, 25], "Veado Assado":[20, 25], "Veado Braseado":[20, 25], "Vinho":[20, 25],
  "Vitamina de Banana":[15, 20], "Vitamina de Frutas":[15, 20], "Vodka":[20, 25], "Whiskey":[20, 25],
  "Água Fresca de Limão":[15, 20], "Água Fresca de Morango":[15, 20]
};
const newInEdition = new Set([
  "Carne Bovina", "Carne Ovina", "Carne de Galinha", "Carne de Porco", "Geleia Real", "Mel",
  "Polpa de Morango", "Polpa de Pimenta", "Própolis", "Buquê de Girassóis", "Buquê de Lavanda", "Buquê de Rosas",
  "Minhocário", "Perfume Silvestre", "Perfume de Lavanda", "Semente Melhorada", "Semente Selecionada", "Figurino Sob Medida",
  "Treinamento de Cavalo (por treino)", "Antibiótico Potente", "Kit Cirúrgico", "Papel de Imprensa", "Parafusos", "Corda",
  "Pena de Ave Pequena", "Cabo de Escopeta", "Cabo de Pistola", "Cabo de Repetidora", "Cabo de Revólver", "Cabo de Rifle",
  "Cano de Escopeta", "Cano de Pistola", "Cano de Repetidora", "Cano de Revólver", "Cano de Rifle", "Cilindro de Revólver",
  "Corpo de Escopeta", "Corpo de Pistola", "Corpo de Repetidora", "Corpo de Revólver", "Corpo de Rifle", "Tambor de Repetidora",
  "Arco Melhorado", "Flecha (Fogo)", "Flecha (P)", "Flecha (Veneno)", "Flecha Farpada", "Flecha de Exaustão",
  "Flecha de Fumaça Sagrada", "Flecha de Ocre", "Flecha de Rastreio", "Flecha de Sílex", "Flecha de Trovão", "Aquavit",
  "Jacaré Braseado", "Diamante", "Esmeralda", "Rubi", "Safira", "Enxofre"
]);
// Searchable names: the XLII spelling, or the XLI name of a renamed entry.
const gazetteAliases = {"Semente Melhorada":["Semente Melhorada…", "Semente Melhorada de Milho", "Semente Melhorada de Cana", "Semente Melhorada de Milefólio", "Semente Melhorada de Mirtilo-silvestre", "Semente Melhorada de Pera", "Semente Melhorada de Pimenta", "Semente Melhorada de Repolho", "Semente Melhorada de Tanaceto", "Semente Melhorada de Gaulteria"], "Semente Selecionada":["Semente Selecionada…"], "Garrafa de Álcool":["Garrafa de Alcool"], "Saca Vazia":["Saca"], "Tônico de Cura Equino":["Tônico Cura Equino"], "Lendário · Truta Arco-Íris":["Lendário · Truta Arco-íris"]};
const gazetteMoney = cents => '$' + (cents / 100).toFixed(2).replace('.', ',');
const gazetteNote = (name, sourceNote) => [sourceNote,
  newInEdition.has(name) && 'Novo na edição XLII.',
  previousRanges[name] && `Na edição XLI: ${gazetteMoney(previousRanges[name][0])} a ${gazetteMoney(previousRanges[name][1])}${previousRanges[name][0] > previousRanges[name][1] ? ' (faixa invertida)' : ''}.`
].filter(Boolean).join(' ') || undefined;
// The user confirmed mineral prices apply to the displayed lot, not each unit.
const gazetteItems = [
  ...Object.entries(gazetteSections).flatMap(([section, rows]) => rows.map(([name, sourceMin, sourceMax, sourceNote, lotSize = 1]) => ({name, min: sourceMin / lotSize, max: sourceMax / lotSize, section, lotSize, sourceMin, sourceMax, edition: 'XLII', isNew: newInEdition.has(name), aliases: gazetteAliases[name] || [],
    sourceNote: gazetteNote(name, [sourceNote, lotSize > 1 && `Lote de ${lotSize} un.: ${gazetteMoney(sourceMin)} a ${gazetteMoney(sourceMax)} na Gazeta. Valores da tabela divididos por ${lotSize}, conforme confirmação de que a faixa é por lote.`].filter(Boolean).join(' '))})))
];
if (typeof module !== 'undefined') module.exports = {gazetteItems};
