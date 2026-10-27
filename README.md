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

Por orientação do usuário, a consulta, a calculadora e o CSV ocultam **somente Fazenda Coleta e Fazenda Plantação**. As demais origens permanecem: Coleta, Lenhador, Mineração, Fazenda Venda e Gazeta Comercial. `buildEconomyCatalog` tem 464 referências, todas com cotação da edição XLII, da atualização de 27/10/2026 ou da planilha confirmada pela XLII; 73 são novas na edição XLII e aparecem com o selo “Novo”. Plantas de Fazenda Venda aparecem sem `(v)`. A exportação inclui todos os resultados dos filtros, não apenas a página atual.

Os dados completos são preservados em `buildPriceCatalog` (528 referências), `county-prices.js`, `gazette.js` e nos arquivos de origem em `data/`. A primeira planilha contém 134 linhas, consolidadas em 132 após remover duas repetições idênticas de Papoula-da-pradaria; o complemento de Coleta contém 16 linhas. Os cinco itens de Fazenda Coleta reenviados são idênticos aos da primeira fonte. Preços unitários e por lote foram conferidos em todas as linhas, sem dividir novamente os valores unitários. “Rosa (coleta)” preserva essa faixa e Humus é padronizado como Húmus. Minérios usam os nomes da nova fonte, com pesquisa pelos nomes anteriores.

Desde a edição XLII não há preços sugeridos: Mel e Tomilho têm cotação. O mecanismo continua disponível para um insumo futuro sem cotação (média simples dos pontos médios de itens correlatos, com notas item por item); sem sugestões, o botão de notas e o filtro de sugeridos ficam ocultos. A tabela também exibe os valores completos por padrão; desmarcar a opção reduz a exibição a duas casas, usando `< $0,01` para valores positivos que arredondariam para zero.

Os custos do planejamento principal continuam usando **Fazenda Venda** para a compra das plantas, conforme escolha do usuário. Esterco usa Fazenda Coleta e Húmus usa Coleta; ocultar essas origens em Economia não altera os custos da produção. A memória de cálculo identifica a origem. Os oito preços de venda dos produtos prontos continuam sendo os da Gazeta. Todos os insumos das receitas têm cotação: Mel vem da Gazeta e Tomilho, de Coleta.


A tabela compacta exibe valores por unidade na primeira linha e os preços mínimo/máximo do lote na segunda linha, junto da quantidade de unidades. Um lote é de 100 unidades. Quando a fonte informa o lote (Coleta, Plantação, Venda de Fazenda, Lenhador, Minérios), os valores vêm diretamente de `sourceMin`/`sourceMax`, inclusive os tamanhos impressos diferentes de 100 (Ouro: 10; Prata: 20). Quando a fonte informa só o preço por unidade, como nos itens da Gazeta, o lote é calculado: 100 × preço unitário (365 itens, sinalizados nos detalhes). Semente Melhorada e Semente Selecionada são as exceções da Gazeta: o usuário confirmou que os preços são do lote, de 100 e de 1.000 unidades. Assim todos os itens podem ser negociados por unidade ou por lote na calculadora; sugestões, se houver, não recebem lote.


A calculadora de compras e vendas substitui o simulador de um único produto. Permite adicionar vários itens, escolher unidade ou lote quando informado, ajustar quantidade e preço em cada linha, remover itens e limpar a lista. O total é a soma dos subtotais, com até cinco casas decimais por preço informado e soma inteira em escala decimal para evitar perda de precisão. A lista permanece ao fechar e reabrir a janela durante a sessão. Valores completos continuam ativados por padrão.


Na calculadora, o seletor de itens permite busca sem acentos, navegação com setas e seleção por Enter ou clique. Uma busca ainda não confirmada não adiciona o item anterior por engano. “Copiar conta” inclui todos os itens da lista com unidade/lote, quantidade, preço combinado, subtotal e total, sempre com a precisão completa. Linhas inválidas bloqueiam a cópia; se a área de transferência falhar, o texto fica disponível para cópia manual.


A calculadora tem o seletor de cenário **Mínimo / Mediano / Máximo** (Mediano por padrão). O preço preenchido no formulário e o de cada linha seguem o cenário: por unidade, usa o mínimo, o ponto médio ou o máximo da faixa unitária; por lote, a faixa do lote informada na fonte. Uma sugestão, se houver, tem um único preço nos três cenários. Trocar o cenário recalcula todas as linhas, exceto as de **preço ajustado**: um preço digitado à mão, no formulário ou na linha, é mantido, e “usar cenário” devolve a linha ao cenário. “Copiar conta” informa o cenário e marca as linhas ajustadas.

O botão **+100** soma 100 à quantidade, no formulário e em cada linha, até o limite de 1.000.000. No formulário, enquanto o campo mostra o 1 inicial sem edição, o primeiro clique leva a 100, não a 101.


## Gazeta Comercial, edição XLII

A edição XLII (25 de outubro de 1899) foi transcrita das 29 páginas enviadas (a página 30 está em branco).

- **Páginas 1–21** estão em `gazette.js`: 374 itens (376 depois da atualização de 27/10/2026), sendo 60 novos e 106 com faixa diferente da edição XLI. Salões passaram a $0,30–$0,35. Minérios ganharam Diamante, Esmeralda, Rubi e Safira ($2,50–$3,50 por unidade) e Enxofre ($0,40–$0,60 o lote de 100). Rainha Mansa, Rainha Selvagem e Ramalhete Silvestre passaram de Armazém para Botânicos. Cerveja aparece duas vezes na página 16, com a mesma faixa, e foi consolidada. Os nomes das receitas foram mantidos: “Saca Vazia” (na edição: “Saca”) e “Garrafa de Álcool” (na edição: “Garrafa de Alcool”); a busca encontra as duas grafias. Tônico Cura Equino passou a Tônico de Cura Equino.
- **Páginas 20–29** (Minérios, Coleta, Coleta de Fazenda, Lenhador, Plantação e Venda de Fazenda) republicam a planilha do condado. `county-prices.js` mantém a planilha original (`spreadsheetRows`, conferida com os arquivos de `data/`) e aplica a XLII: Tronco de Madeira sobe de $0,18–$0,26 para $0,70–$0,82 o lote; entram Tora Ruim, Tora Boa, Enxofre, as quatro gemas, Tomilho, Minhoca Viva, oito sementes de Coleta, Café (grão) e Ameixa-do-riacho (plantação e venda). As demais faixas foram confirmadas.

**Mel** ($0,04 a $0,05 por unidade, Gazeta) e **Tomilho** ($0,22 a $0,25 o lote de 100, Coleta) passaram a ter cotação. Os custos de Óleo de Girassol e Ervas Aromáticas ficam completos na calculadora principal.

Cada item novo ou alterado traz a origem da mudança nos detalhes, e os novos têm o selo “Novo” na tabela. A edição XLII é a tabela oficial completa, então os itens que não constam nela foram removidos, por orientação do usuário: Polpa de Manga, cinco Pacotes de Semente, Essência de Fertilidade, Tocha e Tomahawk (edição XLI), e Ayuhasca, Peyote, Leite de Fazenda Coleta e Carne de Peixe de Coleta (planilha do condado). Leite e Carne de Peixe continuam no catálogo pela cotação da Gazeta ($0,04–$0,06 e $0,07–$0,11). A planilha original segue íntegra em `data/` e em `spreadsheetRows`.


## Atualização de preços da Gazeta (27/10/2026)

Preços enviados pelo usuário em 27/10/2026, sem número de edição. Estão em `gazette.js` (`fromPriceUpdate`); os demais itens seguem a edição XLII.

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

A atualização não informa a seção dos três itens novos; por orientação do usuário, eles ficam em Armazém. A mensagem chama o combo de “Combo de Tabacaria”; o item mantém o nome “Combo Tabacaria”, como os outros combos, e a busca encontra as duas formas. Fósforo, Goma de Tabaco e Tabaco Curado não constam da atualização e mantêm a faixa da edição XLII. Por orientação do usuário, os itens da atualização não têm o selo “Novo” nem nota com a faixa anterior; esta tabela é o registro da mudança.

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
  - O filtro “Novidades” mostra só os 73 itens novos da edição XLII.
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
