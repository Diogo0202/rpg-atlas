# Validação visual — backup JSON, Modo de Cena e Cofre Local

As capturas de `/modo-cena` e `/cofre-local` em 1280×720 mostraram os novos controles integrados ao design Obsidiano, sem sobreposição aparente no viewport. O Modo de Cena apresenta exportação do histórico no cabeçalho, condições no foco selecionado e hierarquia visual consistente. O Cofre Local apresenta importação, exportação de backup, pesquisa e ordenação na biblioteca.

Em 375×812, o cabeçalho das duas rotas se adapta para empilhamento vertical. A barra de ações rápidas do Modo de Cena quebra em botões verticais e mantém o botão de próximo turno acessível; o restante da cena continua disponível por rolagem. O Cofre Local mantém título, contador e cartões legíveis no mobile, com os controles da biblioteca abaixo da dobra. Não foram observadas falhas de contraste ou overflow horizontal nas áreas capturadas.

## Revisão final da expansão

As capturas finais em 1280×720 continuam mostrando a pesquisa, o contador, o seletor de ordenação e os botões de importação/exportação no mesmo bloco visual do Cofre. A ordenação por sistema não introduz alteração de layout. No Modo de Cena, o cabeçalho mantém exportação do histórico e o painel de foco mantém o bloco de condições visível.

Em 375×812, o empilhamento permanece legível e sem overflow horizontal. Os controles do Cofre continuam abaixo da dobra depois dos cartões de sistemas, enquanto a navegação do Modo de Cena mantém ações rápidas e próximo turno acessíveis na primeira área operacional. O build visual não apresentou console error nas capturas.

## Expansão de compartilhamento e filtros

As capturas em 1280×720 mostraram o Modo de Cena com a composição operacional preservada e o Cofre Local com pesquisa, nível, tags, ordenação e ações de backup alinhados no bloco da biblioteca. A rota `/compartilhar/json` apresenta o estado inválido de forma clara, com contraste e instrução de recuperação.

Em 375×812, os controles principais do Modo de Cena empilham-se sem sair da viewport inicial. O Cofre Local mantém título, descrição, contador e cartões dos sistemas em coluna; os controles da biblioteca seguem em fluxo vertical. A tela de link inválido mantém a mensagem legível dentro do cartão.

As capturas foram feitas com o cofre vazio e sem `payload` na rota compartilhada, portanto não exercitam visualmente o cartão de QR code nem a listagem filtrada com registros. Esses fluxos possuem cobertura DOM dedicada nos testes.

## Compressão e visualizações — 2026-08-27

Em 1280×720, a barra de visualizações salvas aparece integrada ao bloco da Biblioteca do navegador, com seletor, campo de nome e ações de salvar/excluir alinhados acima dos filtros existentes. A hierarquia visual permanece consistente com o design Obsidiano.

Em 375×812, a mesma área é estruturada em coluna pelo grid responsivo, evitando overflow horizontal. Como o cofre está vazio na captura, o seletor não apresenta registros; a persistência e aplicação de visualizações são cobertas pelos testes DOM e unitários.
