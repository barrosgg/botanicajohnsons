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

A página `/economia/` usa as 323 referências originais da Gazeta e a atualização do condado enviada pelo usuário. A primeira planilha tem 134 linhas, consolidadas em 132 após remover duas repetições idênticas de Papoula-da-pradaria; o complemento de Coleta tem 16 linhas. Os cinco itens de Fazenda Coleta reenviados são idênticos aos da primeira planilha. Os arquivos originais estão em `data/` e a transcrição normalizada em `county-prices.js`. Cada faixa unitária confere com mínimo/máximo do lote divididos por seu tamanho; os valores unitários da planilha não são divididos novamente.

O catálogo consolidado tem 463 referências: 461 cadastradas e duas sugestões (Mel e Tomilho). A atualização prevalece sobre a Gazeta para os itens correspondentes. Plantação, Venda (v) e Coleta permanecem separados. “Rosa (coleta)” preserva a terceira faixa da Rosa; Humus é padronizado como Húmus. Os nomes de minérios passam a seguir a nova fonte (Carvão Bruto, Cobre, Ferro, Ouro e Prata), com pesquisa também pelos nomes anteriores e sem duplicatas. A faixa invertida de Escova Equina e os nomes truncados da Gazeta continuam sinalizados.

O preço sugerido é a média simples dos pontos médios dos preços unitários cadastrados de itens correlatos. Tomilho usa sete ervas de Fazenda Venda; Mel usa Melado de Cana e Xarope de Açúcar. As notas por item detalham as referências, a conta e suas limitações. Esta metodologia substitui a antiga aproximação por faturamento das receitas, agora que há preços de plantas comparáveis. Sugestões não são usadas como preços oficiais ou nos custos da calculadora.

Os custos do planejamento usam **Fazenda Venda** para a compra das plantas, conforme escolha do usuário. Esterco usa Fazenda Coleta e Húmus usa Coleta. A memória de cálculo informa a origem. Os preços de venda dos oito produtos prontos continuam sendo os da Gazeta. Somente Mel e Tomilho permanecem sem cotação, excluídos dos custos e explicitamente identificados como pendências.

Busca sem acentos, filtros por seção, obtenção e situação, ordenação, comparação de setores, CSV com origem e lotes e simulação de negociação permanecem disponíveis. Valores monetários são exibidos com duas casas por padrão; “Mostrar valores completos” revela a precisão disponível sem arredondar os cálculos. Entradas com origens diferentes são referências independentes na análise setorial.
