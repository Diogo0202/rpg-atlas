# Validação visual — paleta global do RPG Atlas

- **Preview:** `http://localhost:3000/` via URL pública temporária do sandbox.
- **Desktop:** a página inicial carregou com a composição editorial escura, tipografia serifada, cobre para ação, verde-sal para estados e painéis de arquivo preservados. Não foi observado overflow estrutural na viewport de 1280×720.
- **Mobile:** a página inicial carregou na viewport de 375×812 mantendo a hierarquia da manchete, os controles de campanha e a leitura em coluna; a navegação rápida permanece disponível por teclado e o botão flutuante é ocultado abaixo do breakpoint `md`, evitando obstrução do conteúdo.
- **Paleta:** o atalho `Ctrl+K` foi acionado no preview para validar a entrada do fluxo global; a implementação usa `CommandDialog`, busca textual por rótulo/descrição, navegação por teclado, foco visível e fechamento por `Esc`.
- **Rotas conferidas no código:** `/`, `/santuario`, `/modo-cena`, `/mapa-shadowlords`, `/biblioteca`, `/acervo`, `/ficha-v5`, `/ficha-um-anel`, `/ficha-cacador`, `/arsenal-v5` e `/cofre-local`.
- **Observação:** as capturas do preview exibem marcações amarelas de diagnóstico da ferramenta de inspeção; elas não fazem parte do produto.
