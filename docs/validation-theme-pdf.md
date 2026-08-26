# Validação — tema e PDF da ficha V5

Data de validação: 26 de agosto de 2026.

## Evidências confirmadas

As capturas de pré-visualização de `/ficha-v5` em desktop e mobile confirmaram a presença do botão **Exportar PDF**, do comando de tema **Luz do alvorecer** no trilho autenticado e do bloco de inventário com os estados de arma e armadura ativas.

As verificações automatizadas concluídas foram `pnpm test`, `pnpm check` e `pnpm build`. A suíte terminou com 8 arquivos e 23 testes aprovados. Entre os testes adicionados estão a transição clara/escura, a serialização do inventário equipado e do histórico de experiência e a emissão de bytes iniciados por `%PDF` com `jsPDF`.

O tema claro foi verificado visualmente em `/ficha-v5` nas larguras de 1280×720 e 375×812, confirmando fundo de papel, textos escuros, bordas em cobre e controles legíveis. Após a verificação, a configuração foi restaurada para o modo escuro padrão, também capturado em 1280×720, mantendo o carvão, o cobre e o verde-sal do Arquivo Obsidiano. Em ambos os estados, o botão de exportação em PDF se manteve visível.

## Observação operacional

A tentativa de acionar os controles no navegador conectado não foi concluída porque a extensão do navegador retornou tempo esgotado (HTTP 504), inclusive por índice e por coordenada. Um navegador isolado também não pôde acessar os controles porque não herda a sessão autenticada. O código de alternância, o download no cliente e o PDF foram verificados por testes e pela compilação de produção; a pré-visualização local permaneceu operacional.
