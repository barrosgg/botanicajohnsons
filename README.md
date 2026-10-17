# Botânica Johnsons

Calculadora web de produção com as oito receitas fornecidas. Sem dependências de instalação.

## Executar

Na raiz do repositório:

```sh
python3 -m http.server 3000 --bind 0.0.0.0
```

Abra a aplicação pela porta 3000. Informe unidades desejadas: cada receita é arredondada para lotes completos de 5 unidades (50 para fertilizante). A lista soma ingredientes compartilhados. A opção de produzir ingredientes compostos calcula lotes adicionais de perfume, buquê e óleo e apresenta eventuais excedentes. Pilão é contabilizado conforme a quantidade exibida nas receitas; não é presumido reutilizável. O tempo estimado soma 30 segundos por lote, incluindo ingredientes compostos quando habilitados.

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

Layout validado com as oito receitas preenchidas e compostos ativados, sem rolagem da página em 1280×720, 1366×768, 1920×1080 e nas abas em 375×812. Zoom, tamanhos menores e textos maiores podem exigir rolagem; o conteúdo permanece acessível. Não há bloqueio artificial de rolagem.


## Economia geral

`/economia/` é uma consulta compacta, com filtros, ordenação e paginação que adapta o número de linhas à altura disponível. A tela principal reúne a tabela, contagens e ações; fontes, notas das sugestões, detalhes de cada item e calculadora de compras e vendas abrem em janelas. Os estudos de preços médios por setor foram removidos. O layout procura caber na altura da tela sem rolagem da página; em telas muito baixas ou com zoom, o conteúdo continua acessível.

Por orientação do usuário, a consulta, a calculadora e o CSV ocultam **somente Fazenda Coleta e Fazenda Plantação**. As demais origens permanecem: Coleta, Lenhador, Mineração, Fazenda Venda e Gazeta Comercial. `buildEconomyCatalog` tem 401 referências: 399 cadastradas e duas sugestões (Mel e Tomilho). Plantas de Fazenda Venda aparecem sem `(v)`. A faixa independente da Gazeta continua visível quando a cotação de Fazenda Coleta é ocultada (Leite). A exportação inclui todos os resultados dos filtros, não apenas a página atual.

Os dados completos são preservados em `buildPriceCatalog` (463 referências), `county-prices.js`, `gazette.js` e nos arquivos de origem em `data/`. A primeira planilha contém 134 linhas, consolidadas em 132 após remover duas repetições idênticas de Papoula-da-pradaria; o complemento de Coleta contém 16 linhas. Os cinco itens de Fazenda Coleta reenviados são idênticos aos da primeira fonte. Preços unitários e por lote foram conferidos em todas as linhas, sem dividir novamente os valores unitários. “Rosa (coleta)” preserva essa faixa e Humus é padronizado como Húmus. Minérios usam os nomes da nova fonte, com pesquisa pelos nomes anteriores.

Os preços sugeridos são a média simples dos pontos médios de itens correlatos: Tomilho usa sete ervas de Fazenda Venda; Mel usa Melado de Cana e Xarope de Açúcar. As notas item por item mostram as referências, contas e limitações, sempre com os decimais completos. A tabela também exibe os valores completos por padrão; desmarcar a opção reduz a exibição a duas casas, usando `< $0,01` para valores positivos que arredondariam para zero.

Os custos do planejamento principal continuam usando **Fazenda Venda** para a compra das plantas, conforme escolha do usuário. Esterco usa Fazenda Coleta e Húmus usa Coleta; ocultar essas origens em Economia não altera os custos da produção. A memória de cálculo identifica a origem. Os oito preços de venda dos produtos prontos continuam sendo os da Gazeta. Somente Mel e Tomilho permanecem sem cotação nos custos; sugestões não são usadas automaticamente.


A tabela compacta exibe valores por unidade na primeira linha e os preços mínimo/máximo do lote na segunda linha, junto da quantidade de unidades. Os valores dos lotes vêm diretamente de `sourceMin`/`sourceMax`, sem dividir ou multiplicar novamente. Entradas sem lote com mais de uma unidade informado mostram “Sem lote” e “Lote: —”; sugestões não recebem lotes inventados.


A calculadora de compras e vendas substitui o simulador de um único produto. Permite adicionar vários itens, escolher unidade ou lote quando informado, ajustar quantidade e preço em cada linha, remover itens e limpar a lista. O total é a soma dos subtotais, com até cinco casas decimais por preço informado e soma inteira em escala decimal para evitar perda de precisão. A lista permanece ao fechar e reabrir a janela durante a sessão. Valores completos continuam ativados por padrão.
