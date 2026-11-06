# Botânica Johnsons

Calculadora web de produção com as 16 receitas do livro da Botica. Sem dependências de instalação.

## Executar

Na raiz do repositório:

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Abra a aplicação pela porta 3000. Informe unidades desejadas: cada receita é arredondada para lotes completos, conforme o rendimento do livro: 5 unidades nas oito receitas originais, 50 no Fertilizante, 10 no Ramalhete Silvestre, 100 na Semente Melhorada e 1 nos perfumes de Lavanda e Silvestre, nos três buquês novos e no Minhocário. A lista soma ingredientes compartilhados. A opção de produzir ingredientes compostos calcula lotes adicionais de perfume, buquê e óleo e apresenta eventuais excedentes; quando o mesmo produto também é pedido diretamente, os dois usos dividem os mesmos lotes (Perfume 3 + Combo 5 = 1 lote de Perfume), e só o que sobra do consumo do Combo entra como venda. Pilão é contabilizado conforme a quantidade exibida nas receitas; não é presumido reutilizável. O tempo estimado soma o tempo de cada lote (30 segundos; Minhocário, 45 segundos), incluindo ingredientes compostos quando habilitados.

Fontes externas são opcionais; há fontes locais de fallback.

## Validar cálculos

```sh
node --test *.test.cjs
```

## GitHub Pages

Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. O workflow `.github/workflows/pages.yml` valida os cálculos e publica os arquivos estáticos a cada push em `main`; também pode ser executado manualmente pela aba Actions.

Após a publicação, o endereço esperado é https://barrosgg.github.io/botanicajohnsons/. Os caminhos dos recursos são relativos, compatíveis com a subpasta do GitHub Pages.

## Preenchimento e acompanhamento

- Ao entrar em uma quantidade, o valor é selecionado para facilitar a substituição. `Tab` ou `Enter` avança diretamente à quantidade seguinte; `Shift + Tab` volta. Ao terminar, o foco segue para a opção de ingredientes compostos. Os botões de ajuste continuam disponíveis.
- Produtos preenchidos mostram os lotes, a produção real e os excedentes. O campo em foco ganha destaque.
- Marque os ingredientes conforme forem separados. Uma marcação é removida automaticamente se a quantidade necessária daquele ingrediente mudar.
- Quantidades, opção de ingredientes compostos e marcações são salvas no armazenamento local do navegador. `Limpar` zera o preenchimento e as marcações. Não há sincronização entre dispositivos.

## Custos estimados das encomendas

A lista mostra mínimo, mediano estimado (ponto médio da faixa) e máximo em $, com base nos preços unitários da Gazeta Comercial e da atualização do condado enviada. Os preços estão em `ingredientPrices` no `data.js`, em centavos. O ponto médio mantém a precisão e apenas os totais exibidos são arredondados para duas casas.

Além dos preços originais dos produtos e insumos, a atualização do condado informa preços de compra das plantas e referências para Esterco e Húmus. Ingredientes sem preço são identificados e excluídos do subtotal, que aparece como **parcial**; eles nunca são considerados gratuitos. A opção de produzir ingredientes compostos recalcula os custos pela lista expandida, sem somar também os intermediários. Marcar um ingrediente como separado não desconta seu custo. A lista copiada inclui a estimativa e os preços pendentes.

A memória de cálculo fica abaixo dos custos, recolhida por padrão, e detalha preço unitário × quantidade = subtotal para cada cenário e ingrediente. Também acompanha a lista copiada.

Na coluna de produção, cada produto mostra os preços de **venda por unidade** (mínimo, ponto médio estimado e máximo) da Gazeta Comercial, separados dos custos da encomenda. Os valores unitários mantêm até três casas decimais.

O quadro de lucro bruto na coluna de produção simula a venda de todas as unidades produzidas, incluindo excedentes, sem receita para intermediários consumidos. O cenário mínimo usa venda mínima menos custo máximo; o mediano usa os pontos médios; o máximo usa venda máxima menos custo mínimo. Quando faltam preços, o resultado é parcial e superestimado, com os custos pendentes identificados. Não inclui outras despesas.

Cada produto também exibe o lucro bruto da sua produção individual, abaixo dos preços unitários de venda, conforme a quantidade e a opção de produzir compostos. Os custos desconhecidos são identificados junto do produto. O quadro geral continua calculando os lotes compartilhados em conjunto; ao produzir compostos, ele pode diferir da soma de simulações individuais devido ao arredondamento de lotes.

O faturamento da produção aparece junto ao lucro bruto em cada produto e no quadro geral, com cenários mínimo, mediano e máximo. Faturamento representa a venda de todas as unidades produzidas antes de descontar ingredientes.

## Organização da tela

A tela de desktop reúne produção, encomenda e resultado em três painéis. O seletor Mínimo / Mediano / Máximo muda as colunas de venda unitária, faturamento e lucro por produto; o resultado geral mantém os três cenários para comparação. Ingredientes e totais ficam visíveis sem abrir os detalhes. A memória, os lotes/tempo e as regras de cálculo abrem em janelas acessíveis por teclado (Escape fecha). Em telas estreitas, abas alternam os três painéis.

Layout validado com as 16 receitas, sem rolagem da página em 1280×720, 1366×768, 1920×1080 e nas abas em 375×812: a lista de produtos rola dentro do próprio painel. Zoom, tamanhos menores e textos maiores podem exigir rolagem; o conteúdo permanece acessível. Não há bloqueio artificial de rolagem.


## Economia geral

`/economia/` é uma consulta compacta, com filtros, ordenação e paginação que adapta o número de linhas à altura disponível. A tela principal reúne a tabela, contagens e ações; fontes, notas das sugestões, detalhes de cada item e calculadora de compras e vendas abrem em janelas. Os estudos de preços médios por setor foram removidos. O layout procura caber na altura da tela sem rolagem da página; em telas muito baixas ou com zoom, o conteúdo continua acessível.

Por orientação do usuário, a consulta, a calculadora e o CSV ocultam **somente Fazenda Coleta e Fazenda Plantação**. As demais origens permanecem: Coleta, Lenhador, Mineração, Fazenda Venda e Gazeta Comercial. `buildEconomyCatalog` tem 467 referências, todas com cotação da edição XLIV (diretamente ou pela planilha do condado confirmada ou atualizada por ela); 5 são novas na edição XLIV e aparecem com o selo “Novo”. Plantas de Fazenda Venda aparecem sem `(v)`. A exportação inclui todos os resultados dos filtros, não apenas a página atual.

Os dados completos são preservados em `buildPriceCatalog` (530 referências), `county-prices.js`, `gazette.js` e nos arquivos de origem em `data/`. A primeira planilha contém 134 linhas, consolidadas em 132 após remover duas repetições idênticas de Papoula-da-pradaria; o complemento de Coleta contém 16 linhas. Os cinco itens de Fazenda Coleta reenviados são idênticos aos da primeira fonte. Preços unitários e por lote foram conferidos em todas as linhas, sem dividir novamente os valores unitários. “Rosa (coleta)” preserva essa faixa e Humus é padronizado como Húmus. Minérios usam os nomes da nova fonte, com pesquisa pelos nomes anteriores.

Desde a edição XLII não há preços sugeridos: Mel e Tomilho têm cotação. O mecanismo continua disponível para um insumo futuro sem cotação (média simples dos pontos médios de itens correlatos, com notas item por item); sem sugestões, o botão de notas e o filtro de sugeridos ficam ocultos. A tabela também exibe os valores completos por padrão; desmarcar a opção reduz a exibição a duas casas, usando `< $0,01` para valores positivos que arredondariam para zero.

Os custos do planejamento principal continuam usando **Fazenda Venda** para a compra das plantas, conforme escolha do usuário. Esterco usa Fazenda Coleta e Húmus usa Coleta; ocultar essas origens em Economia não altera os custos da produção. A memória de cálculo identifica a origem. Os oito preços de venda dos produtos prontos continuam sendo os da Gazeta. Todos os insumos das receitas têm cotação: Mel vem da Gazeta e Tomilho, de Coleta.


A tabela compacta exibe valores por unidade na primeira linha e os preços mínimo/máximo do lote na segunda linha, junto da quantidade de unidades. Um lote é de 100 unidades. Quando a fonte informa o lote (Coleta, Plantação, Venda de Fazenda, Lenhador, Minérios), os valores vêm diretamente de `sourceMin`/`sourceMax`, inclusive os tamanhos impressos diferentes de 100 (Ouro: 10; Prata: 20). Quando a fonte informa só o preço por unidade, como nos itens da Gazeta, o lote é calculado: 100 × preço unitário (368 itens, sinalizados nos detalhes). Semente Melhorada e Semente Selecionada são as exceções da Gazeta: o usuário confirmou que os preços são do lote, de 100 e de 1.000 unidades. Assim todos os itens podem ser negociados por unidade ou por lote na calculadora; sugestões, se houver, não recebem lote.


A calculadora de compras e vendas substitui o simulador de um único produto. Permite adicionar vários itens, escolher unidade ou lote quando informado, ajustar quantidade e preço em cada linha, remover itens e limpar a lista. O total é a soma dos subtotais, com até cinco casas decimais por preço informado e soma inteira em escala decimal para evitar perda de precisão. A lista permanece ao fechar e reabrir a janela durante a sessão. Valores completos continuam ativados por padrão.


Na calculadora, o seletor de itens permite busca sem acentos, navegação com setas e seleção por Enter ou clique. Uma busca ainda não confirmada não adiciona o item anterior por engano. “Copiar conta” inclui todos os itens da lista com unidade/lote, quantidade, preço combinado, subtotal e total, sempre com a precisão completa. Linhas inválidas bloqueiam a cópia; se a área de transferência falhar, o texto fica disponível para cópia manual.


A calculadora tem o seletor de cenário **Mínimo / Mediano / Máximo** (Mediano por padrão). O preço preenchido no formulário e o de cada linha seguem o cenário: por unidade, usa o mínimo, o ponto médio ou o máximo da faixa unitária; por lote, a faixa do lote informada na fonte. Uma sugestão, se houver, tem um único preço nos três cenários. Trocar o cenário recalcula todas as linhas, exceto as de **preço ajustado**: um preço digitado à mão, no formulário ou na linha, é mantido, e “usar cenário” devolve a linha ao cenário. “Copiar conta” informa o cenário e marca as linhas ajustadas.

O botão **+100** soma 100 à quantidade, no formulário e em cada linha, até o limite de 1.000.000. No formulário, enquanto o campo mostra o 1 inicial sem edição, o primeiro clique leva a 100, não a 101.


## Gazeta Comercial, edição XLIV (vigente)

A edição XLIV (6 de novembro de 1899) foi transcrita das 29 páginas enviadas em 06/11/2026 (a página 30 está em branco). É a tabela oficial completa: os itens que não constam dela foram removidos. A barra lateral da Gazeta soma 531 cartões e cada seção bate com o código; Salões tem 106 cartões porque Cerveja aparece duas vezes na página 16, e o catálogo guarda 105. Cada item alterado traz a faixa anterior nos detalhes; os novos têm o selo “Novo”.

**Páginas 1–21 (`gazette.js`).** Mudaram 31 faixas, por unidade. A marca * indica faixa anterior vinda da atualização de 27/10/2026; as demais vêm da edição XLII.

| Item | Seção | Antes | XLIV |
|---|---|---|---|
| Chocolate | Fazendas | $0,04–$0,06 | $0,05–$0,07 |
| Geléia de Pimenta | Fazendas | $0,04–$0,06 | $0,05–$0,07 |
| Iogurte | Fazendas | $0,06–$0,08 | $0,09–$0,11 |
| Queijo | Fazendas | $0,07–$0,09 | $0,10–$0,12 |
| Linha de Algodão | Ateliês | $0,03–$0,05 | $0,04–$0,06 |
| Ração de Cavalo | Estábulos | $0,10–$0,13 | $0,12–$0,14 |
| Tônico de Cura Equino | Estábulos | $0,11–$0,13 | $0,15–$0,17 |
| Bala de Mel | Tabacarias | $0,06–$0,08* | $0,07–$0,09 |
| Caixa de Cigarros | Tabacarias | $0,53–$0,68* | $0,68–$0,88 |
| Charuto | Tabacarias | $0,18–$0,22* | $0,22–$0,28 |
| Combo Tabacaria | Tabacarias | $0,22–$0,29* | $0,39–$0,50 |
| Fósforo | Tabacarias | $0,07–$0,09 | $0,10–$0,13 |
| Goma de Tabaco | Tabacarias | $0,07–$0,09 | $0,09–$0,12 |
| Isqueiro | Tabacarias | $0,18–$0,23* | $0,26–$0,34 |
| Jornal | Tipografias | $0,14–$0,17 | $1,30–$1,50 |
| Cantil Vazio | Armazém | $0,45–$0,58* | $0,70–$0,90 |
| Combo Armazém | Armazém | $0,29–$0,40 | $0,48–$0,62 |
| Kit de Reparo de Arma | Armarias (antes Armazém) | $0,16–$0,20 | $0,20–$0,25 |
| Caixa de Munição Espingarda (N) | Armarias | $0,55–$0,60 | $0,65–$0,70 |
| Caixa de Munição Pistola (E) | Armarias | $0,55–$0,60 | $0,68–$0,73 |
| Caixa de Munição Pistola (N) | Armarias | $0,35–$0,40 | $0,40–$0,45 |
| Caixa de Munição Repetidora (E) | Armarias | $0,80–$0,85 | $0,98–$1,03 |
| Caixa de Munição Repetidora (N) | Armarias | $0,55–$0,60 | $0,68–$0,73 |
| Caixa de Munição Revólver (E) | Armarias | $0,50–$0,55 | $0,63–$0,68 |
| Caixa de Munição Revólver (N) | Armarias | $0,35–$0,40 | $0,43–$0,48 |
| Caixa de Munição Rifle (E) | Armarias | $0,70–$0,75 | $0,83–$0,88 |
| Caixa de Munição Rifle (N) | Armarias | $0,42–$0,47 | $0,48–$0,53 |
| Caixa de Munição Rifle de Caça… | Armarias | $0,60–$0,65 | $0,67–$0,72 |
| Caixa de Munição Rifle de Elefante… | Armarias | $1,20–$1,30 | $1,47–$1,57 |
| Combo Armaria | Armarias | $0,66–$0,77 | $1,07–$1,25 |
| Flecha (N) | Nativos | $0,11–$0,14 | $0,50–$0,75 |

- **Novos:** Cruza de Cavalos (por cruza), Estábulos, $20,00–$30,00; Moedor Fixo, Fábricas, $6,00–$8,40; Rede de Pesca Grande, Armazém, $0,40–$0,50; Tocha, Nativos, $2,00–$4,00.
- **Removido:** Flecha de Rastreio.
- **Renomeado:** Carne de Galinha passa a Carne de Ave, com a mesma faixa ($0,04–$0,06). A busca encontra os dois nomes, e uma venda salva no PDV com o nome antigo passa ao novo.
- **Mudança de seção:** Kit de Reparo de Arma e Lanterna saem de Armazém para Armarias. A Lanterna estava em Armazém por orientação do usuário, porque a atualização de 27/10/2026 não dava a seção; a XLIV a põe em Armarias, com a mesma faixa ($8,00–$9,50).
- Os demais itens das páginas 1–21 têm a mesma faixa de antes, inclusive os da atualização de 27/10/2026 que não estão na tabela acima (Vela e Martelo de Reparo).

**Páginas 21–29 (`county-prices.js`).** Preços por lote, como impressos:

- **Plantação:** 56 das 59 plantas passam de $0,22–$0,25 para $0,45–$0,50 o lote de 100. Cannabis, Coca e Papoula-do-ópio continuam a $0,22–$0,25.
- **Venda de Fazenda:** as mesmas 56 passam de $0,30–$0,35 para $0,60–$0,70 o lote de 100; as três exceções continuam a $0,30–$0,35.
- **Ovo** (Coleta de Fazenda) passa a lote de 50 a $0,50–$0,80; antes, lote de 20 a $0,10–$0,20.
- **Coleta** ganha Semente de Tabaco, a $0,22–$0,25 o lote de 100.
- A XLIV lista só Café (grão). O “Café” da planilha do condado, que convivia com Café (grão), foi removido.
- Minérios, Lenhador e as demais faixas de Coleta e Coleta de Fazenda foram confirmados.

**Efeito na produção.** O planejamento compra as plantas na Venda de Fazenda, então o custo sobe nas receitas com plantas. Lucro bruto de um lote (pior caso / mediano / melhor caso):

| Receita (lote) | Antes | XLIV |
|---|---|---|
| Perfume (5) | $0,085 / $0,247 / $0,410 | $0,050 / $0,215 / $0,380 |
| Óleo de Girassol (5) | $0,083 / $0,259 / $0,435 | $0,065 / $0,242 / $0,420 |
| Ervas para Defumação (5) | $0,037 / $0,111 / $0,185 | -$0,015 / $0,063 / $0,140 |
| Ervas Aromáticas (5) | $0,063 / $0,141 / $0,219 | $0,028 / $0,108 / $0,189 |
| Ervas Medicinais (5) | $0,037 / $0,106 / $0,175 | -$0,015 / $0,058 / $0,130 |
| Buquê de Flores (5) | $0,145 / $0,328 / $0,510 | -$0,010 / $0,180 / $0,370 |
| Perfume Silvestre ou de Lavanda (1) | $0,075 / $0,158 / $0,240 | $0,040 / $0,125 / $0,210 |
| Buquê de Rosas, Lavanda ou Girassóis (1) | $0,045 / $0,133 / $0,220 | -$0,090 / $0,005 / $0,100 |
| Ramalhete Silvestre (10) | $0,090 / $0,141 / $0,192 | $0,084 / $0,135 / $0,186 |

Combo Botânicos (compra os intermediários prontos), Fertilizante, Minhocário e Semente Melhorada não mudam. Valores em dólar com três casas, sem arredondar ao centavo.

## Gazeta Comercial, edição XLII (anterior)

Registro da edição anterior, substituída pela XLIV.

A edição XLII (25 de outubro de 1899) foi transcrita das 29 páginas enviadas (a página 30 está em branco).

- **Páginas 1–21** estão em `gazette.js`: 374 itens (376 depois da atualização de 27/10/2026), sendo 60 novos e 106 com faixa diferente da edição XLI. Salões passaram a $0,30–$0,35. Minérios ganharam Diamante, Esmeralda, Rubi e Safira ($2,50–$3,50 por unidade) e Enxofre ($0,40–$0,60 o lote de 100). Rainha Mansa, Rainha Selvagem e Ramalhete Silvestre passaram de Armazém para Botânicos. Cerveja aparece duas vezes na página 16, com a mesma faixa, e foi consolidada. Os nomes das receitas foram mantidos: “Saca Vazia” (na edição: “Saca”) e “Garrafa de Álcool” (na edição: “Garrafa de Alcool”); a busca encontra as duas grafias. Tônico Cura Equino passou a Tônico de Cura Equino.
- **Páginas 20–29** (Minérios, Coleta, Coleta de Fazenda, Lenhador, Plantação e Venda de Fazenda) republicam a planilha do condado. `county-prices.js` mantém a planilha original (`spreadsheetRows`, conferida com os arquivos de `data/`) e aplica a XLII: Tronco de Madeira sobe de $0,18–$0,26 para $0,70–$0,82 o lote; entram Tora Ruim, Tora Boa, Enxofre, as quatro gemas, Tomilho, Minhoca Viva, oito sementes de Coleta, Café (grão) e Ameixa-do-riacho (plantação e venda). As demais faixas foram confirmadas.

**Mel** ($0,04 a $0,05 por unidade, Gazeta) e **Tomilho** ($0,22 a $0,25 o lote de 100, Coleta) passaram a ter cotação. Os custos de Óleo de Girassol e Ervas Aromáticas ficam completos na calculadora principal.

Na XLII, o selo “Novo” e as notas com a faixa anterior marcavam o que a XLII trouxe; desde a XLIV, marcam o que a XLIV trouxe. A edição XLII era a tabela oficial completa, então os itens que não constavam nela foram removidos, por orientação do usuário: Polpa de Manga, cinco Pacotes de Semente, Essência de Fertilidade, Tocha e Tomahawk (edição XLI), e Ayuhasca, Peyote, Leite de Fazenda Coleta e Carne de Peixe de Coleta (planilha do condado). Leite e Carne de Peixe continuam no catálogo pela cotação da Gazeta ($0,04–$0,06 e $0,07–$0,11). A planilha original segue íntegra em `data/` e em `spreadsheetRows`.


## Atualização de preços da Gazeta (27/10/2026)

Substituída pela edição XLIV, que traz todos esses itens; a tabela da XLIV mostra o que mudou. Registro: preços enviados pelo usuário em 27/10/2026, sem número de edição; os demais itens seguiam a edição XLII.

| Item | Seção | Edição XLII | Atualização |
|---|---|---|---|
| Vela | Armazém | $0,19–$0,21 | $0,22–$0,28 |
| Bala de Mel | Tabacarias | $0,05–$0,07 | $0,06–$0,08 |
| Caixa de Cigarros | Tabacarias | $0,60–$0,70 | $0,53–$0,68 |
| Charuto | Tabacarias | $0,14–$0,17 | $0,18–$0,22 |
| Combo Tabacaria | Tabacarias | $0,17–$0,22 | $0,22–$0,29 |
| Isqueiro | Tabacarias | $0,25–$0,35 | $0,18–$0,23 |
| Cantil Vazio | Armazém | — | $0,45–$0,58 |
| Lanterna | Armazém | — | $8,00–$9,50 |
| Martelo de Reparo | Armazém | — | $0,16–$0,20 |
| Pena de Ave Pequena | Armazém | $0,02 | removida |

A atualização não informava a seção dos três itens novos; por orientação do usuário, eles ficaram em Armazém (a XLIV pôs a Lanterna em Armarias). A mensagem chama o combo de “Combo de Tabacaria”; o item mantém o nome “Combo Tabacaria”, como os outros combos, e a busca encontra as duas formas. Fósforo, Goma de Tabaco e Tabaco Curado não constavam da atualização e mantiveram a faixa da edição XLII. Por orientação do usuário, os itens da atualização não tiveram selo “Novo” nem nota com a faixa anterior; esta tabela é o registro da mudança.

## Receitas do livro da Botica

Além das oito receitas originais, conferidas com o livro, entram oito receitas:

| Receita | Rende / lote | Tempo | Ingredientes |
|---|---|---|---|
| Perfume Silvestre | 1 | 30 s | Papoula-da-pradaria 5, Milefólio 5, Garrafa de Álcool 1, Frasco Vazio 1, Cera de Abelha 1 |
| Perfume de Lavanda | 1 | 30 s | Lavanda 10, Garrafa de Álcool 1, Frasco Vazio 1, Cera de Abelha 1 |
| Buquê de Rosas | 1 | 30 s | Rosa 30, Linha de Algodão 3 |
| Buquê de Lavanda | 1 | 30 s | Lavanda 30, Linha de Algodão 3 |
| Buquê de Girassóis | 1 | 30 s | Girassol 30, Linha de Algodão 3 |
| Minhocário | 1 | 45 s | Madeira Beneficiada 4, Fibra Vegetal 4, Pregos 3 |
| Ramalhete Silvestre | 10 | 30 s | Rosa 1, Girassol 1, Fibra Vegetal 1 |
| Semente Melhorada | 100 | 30 s | Semente Selecionada 100, Embalagem de Papel 2, Húmus 10 |

O livro chama o perfume de “Perfume Floral (Silvestre)”; a calculadora usa o nome da Gazeta, “Perfume Silvestre”, para ligar o preço de venda. As Sementes Melhoradas (de Milho, de Cana, de Pimenta e demais variedades) têm a mesma receita e entram como uma só, “Semente Melhorada”, com a faixa da Gazeta. Conforme confirmado pelo usuário, as duas sementes são cotadas por lote de 100: Semente Melhorada a $0,40–$0,60 o lote ($0,004–$0,006 por unidade) e Semente Selecionada a $1,00 o lote de 1.000 ($0,001 por unidade). Cada lote de 100 sementes melhoradas custa $0,24–$0,29 em ingredientes e vende $0,40–$0,60: lucro bruto de $0,12 (pior caso), $0,24 (mediano) e $0,36 (melhor caso).

Valores negativos aparecem com o sinal antes do símbolo: -$1,20.

## Auditoria (25/10/2026)

Revisão das duas calculadoras, com cada problema reproduzido antes da correção:

1. Compostos pedidos diretamente e consumidos pelo Combo saíam em lotes separados (um lote e 30 s a mais, até +$0,52 de custo). Agora dividem os lotes.
2. Ao voltar pelo histórico do navegador, o cenário marcado não era o aplicado aos valores. As duas páginas passam a ler o cenário marcado.
3. Em telas abaixo de 1100 px, Tab no último produto prendia o foco. Agora segue para “Ver lotes e tempo”.
4. Na calculadora de compras, “Rosa” + Enter escolhia “Buquê de Rosas”. O nome exato vem primeiro, depois os que começam com o termo.
5. Lucro calculado em ponto flutuante podia mostrar “$0,00” em vermelho para um prejuízo de meio centavo. A subtração passa a ser feita em inteiros e o arredondamento segue o valor decimal.
6. Remover uma linha ou “usar cenário” perdia o foco do teclado. O foco vai para o controle correspondente.
7. Um preço digitado no formulário era trocado ao mudar o cenário. Agora é mantido, como as linhas ajustadas.

## Custo, faturamento e lucro bruto

O quadro de resultado cruza os três cenários de venda (linhas, com o faturamento) com os três cenários de custo de produção (colunas, com o custo no cabeçalho). Cada célula é faturamento − custo daquela combinação, calculada em inteiros. As três células em destaque são os cenários usados no resto da página: venda mínima com custo máximo (pior caso), medianos e venda máxima com custo mínimo (melhor caso). A linha do cenário selecionado fica sombreada.

## Interface compacta

- **Planejamento:**
  - O seletor de cenário fica no cabeçalho.
  - A lista de produtos tem linhas mais baixas e o filtro “Só preenchidos”, salvo no navegador, que mostra só o que tem quantidade. O Tab e o Enter pulam os produtos ocultos.
  - O rodapé da produção mostra unidades, lotes e o tempo de bancada.
  - O resultado abre com o resumo do cenário selecionado (custo de produção, faturamento e lucro bruto) e segue com a grade venda × custo. Os custos não aparecem mais duplicados.
- **Economia:**
  - A coluna “Situação” saiu. Os selos “Novo” e “Sugerido” aparecem ao lado da origem.
  - O filtro “Novidades” mostra só os 5 itens novos da edição XLIV.
  - As linhas são mais baixas: 10 itens por página em 1366×768.
- Validado sem rolagem da página em 1280×720, 1366×768, 1920×1080, 800×900 e 375×812.

## PDV (experimental)

`/pdv/` é um ponto de venda para registrar uma venda rápido, como no caixa de mercado. Fica em uma tela; no celular, abas alternam Produtos e Venda.

- **Produtos em blocos** grandes, com ícone e cor por seção. Os ícones são desenhos SVG próprios (`pdv/icons.js`), no mesmo traço e iguais em qualquer aparelho: cada produto da Botica tem o seu (frasco de perfume na cor da essência, buquês com a flor de cada tipo, minhocário, pacote de semente), plantas comuns também, e as demais seções usam o ícone da seção. A aba ⭐ Botica traz os 16 produtos da casa; as demais abas trazem cada seção da Gazeta e todos os itens. Cada bloco mostra o preço por unidade e o do lote de 100.
- **Um toque adiciona.** “Toque soma” define quanto cada toque acrescenta: +1, +10 ou +100. O mesmo produto acumula na mesma linha.
- **Busca de caixa:** digite `10*rosa`, `10x rosa` ou `10 rosa` e aperte Enter para lançar 10 Rosas. O nome exato vem primeiro; Esc limpa.
- **Venda:** − e + por linha, quantidade e preço editáveis (o preço editado fica como “ajustado” e não muda com o cenário), remover e o mesmo seletor Mínimo / Mediano / Máximo.
- **Total e troco:** o total exato é somado em inteiros e cobrado arredondado ao centavo (meio centavo para cima; o valor exato aparece abaixo quando difere). “Recebido” calcula o troco ou quanto falta.
- **Fechamento:** “Copiar comprovante” gera o texto da venda. “Concluir venda” limpa a venda e oferece “Desfazer”. A venda em andamento fica salva no navegador. Ao reabrir o PDV, as linhas salvas passam aos preços atuais do catálogo, como depois de uma atualização da Gazeta; uma linha com preço ajustado mantém o valor digitado.

- **Sem rolagem:** a grade de produtos é paginada (‹ › e Page Up/Down) e o número de blocos por página se ajusta à tela. As abas de seção ficam visíveis quando cabem em até duas linhas; senão, Botica e Todos continuam como abas e as demais seções vão para um seletor. Só a lista da venda rola quando tem muitas linhas.
- **Tamanho grande:** blocos largos com ícone de 38 px, nomes em 15 px, preços em 17 px, botões de toque de 40–44 px e total em 46 px.
- **Lotes:** quando a quantidade forma lote, a linha mostra o selo (“1 lote de 100”, “2 lotes de 100 + 30 un.”, “1 lote de 1.000”), e o mesmo texto vai para a mensagem e para o comprovante.
- **Concluir venda** registra o valor cobrado na mensagem, libera o caixa e permite desfazer.

A lógica testável está em `pdv/pdv-core.js` (`pdv.test.cjs`). O workflow do GitHub Pages publica a pasta `pdv/`.
