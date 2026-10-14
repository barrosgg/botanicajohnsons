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
node --test calculator.test.cjs
```

## GitHub Pages

Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. O workflow `.github/workflows/pages.yml` valida os cálculos e publica os arquivos estáticos a cada push em `main`; também pode ser executado manualmente pela aba Actions.

Após a publicação, o endereço esperado é https://barrosgg.github.io/botanicajohnsons/. Os caminhos dos recursos são relativos, compatíveis com a subpasta do GitHub Pages.
