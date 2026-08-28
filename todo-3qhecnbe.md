# Project TODO

- [x] Mapear a estrutura, as rotas e os componentes atuais do RPG Atlas relevantes ao acervo de consulta.
- [x] Examinar os dois diretórios de referência no Google Drive e consolidar o material utilizável sobre vampiros, caçadores e O Um Anel.
- [x] Incluir os 12 clãs de vampiros no acervo de consulta, com organização e detalhes consistentes.
- [x] Incluir os arquétipos de caçador no acervo de consulta, com organização e detalhes consistentes.
- [x] Incluir as linhagens de O Um Anel no acervo de consulta, com organização e detalhes consistentes.
- [x] Integrar navegação, pesquisa ou filtros para tornar os novos conteúdos encontráveis.
- [x] Criar ou atualizar testes unitários pertinentes para a organização do material.
- [x] Validar responsividade, acessibilidade básica, qualidade visual e ausência de erros de execução.
- [x] Exercitar em runtime a busca e as abas do acervo, além da escolha manual de disciplinas sem clã.
- [x] Registrar a revisão de acessibilidade básica, incluindo rótulos, foco visível, contraste e estados vazios.
- [x] Exibir o símbolo do clã ao lado do retrato do personagem na ficha V5.
- [x] Usar o símbolo do clã como imagem principal quando a ficha não tiver retrato.
- [x] Cobrir o retrato e o símbolo de clã com teste de interface.
- [x] Criar um checkpoint publicado com a atualização concluída.
- [x] Usar o PDF anexado “Cópia de Caçador — A Revanche” como fonte de dados dos arquétipos de caçador.
- [x] Validar e registrar todos os arquétipos e credos de Caçador diretamente a partir do PDF anexado.
- [x] Adicionar uma aba de Disciplinas na ficha V5.
- [x] Exibir automaticamente as disciplinas iniciais ao selecionar um clã na ficha V5.
- [x] Permitir que personagens sem clã selecionem manualmente as próprias disciplinas iniciais.
- [x] Mapear as rotas, os dados e o gerador de PDF atuais para a expansão do Acervo e da impressão.
- [x] Criar páginas de detalhe navegáveis para cada clã do Acervo.
- [x] Criar páginas de detalhe navegáveis para cada credo de Caçador do Acervo.
- [x] Criar páginas de detalhe navegáveis para cada linhagem de O Um Anel do Acervo.
- [x] Vincular os cartões do Acervo às respectivas páginas de detalhe.
- [x] Aprimorar e tornar explícita a exportação em PDF para impressão da ficha preenchida.
- [x] Cobrir páginas de detalhe e exportação em PDF com testes e validação visual.
- [x] Criar um checkpoint publicado com a expansão concluída.
- [x] Mapear os formatos de ficha e os exportadores atuais para persistência local e fundos temáticos.
- [x] Permitir salvar fichas de Vampiro localmente no navegador.
- [x] Permitir carregar fichas de Vampiro salvas no navegador.
- [x] Permitir salvar e carregar fichas de Caçador localmente no navegador.
- [x] Permitir salvar e carregar fichas de O Um Anel localmente no navegador.
- [x] Adicionar fundo temático ao PDF de Vampiro.
- [x] Adicionar fundo temático ao PDF de Caçador.
- [x] Adicionar fundo temático ao PDF de O Um Anel.
- [x] Criar testes e validar os fluxos locais e as exportações temáticas.
- [x] Criar um checkpoint publicado com a atualização concluída.
- [x] Ao carregar uma ficha local de Caçador, limpar `selectedId` e revisar estados correlatos para evitar sobrescrever personagens persistidos por engano.
- [x] Adicionar teste de interface cobrindo o carregamento local na ficha de Caçador após abrir uma ficha persistida, validando que o próximo salvamento cria nova ficha ou exige re-seleção explícita.
- [x] Salvar um checkpoint publicado após as alterações finais de persistência local e PDFs temáticos.
- [x] Confirmar o `version_id` retornado pelo checkpoint final antes de concluir a entrega.
- [x] Mapear a interface principal, o protótipo de Modo de Cena e o cofre local atual.
- [x] Integrar a barra de ações rápidas e o painel de rolagens na interface principal.
- [x] Criar uma área de gerenciamento das fichas salvas localmente.
- [x] Permitir renomear fichas locais sem alterar o personagem remoto.
- [x] Permitir duplicar fichas locais com novo identificador.
- [x] Permitir excluir fichas locais com confirmação e estado vazio.
- [x] Criar testes e validar navegação, estados e responsividade.
- [x] Criar um checkpoint publicado com a integração concluída.
- [x] Sincronizar a renomeação do cofre local com `record.sheet.name` e cobrir o recarregamento do nome atualizado.
- [x] Adicionar testes de navegação para os acessos a `/modo-cena` e `/cofre-local`.
- [x] Validar visualmente o Modo de Cena e o Cofre Local em desktop e mobile.
- [x] Adicionar teste de roteamento cobrindo a renderização de `/modo-cena` via App.
- [x] Adicionar teste de roteamento cobrindo a renderização de `/cofre-local` via App ou menu persistente.
- [x] Renderizar `App` em `/modo-cena` em teste e confirmar o conteúdo de `SceneMode`.
- [x] Renderizar `App` em `/cofre-local` em teste e confirmar o conteúdo de `LocalSheetManager`.
- [x] Corrigir o erro de tipos da integração concorrente de Favoritos V5 sem sobrescrever sua implementação.
- [x] Salvar um checkpoint publicado após a integração do Modo de Cena e do Cofre Local.
- [x] Confirmar que o checkpoint inclui as correções de roteamento via App, imports JSX e as validações finais.

# Próxima expansão — backup, sessão e busca

- [x] Definir um formato JSON versionado para exportar uma ficha local com metadados do sistema e data de criação.
- [x] Implementar exportação JSON de fichas a partir do Cofre Local.
- [x] Implementar importação JSON com validação, prevenção de sobrescrita e feedback de erro.
- [x] Integrar importação e exportação JSON aos fluxos das fichas de Vampiro, Caçador e O Um Anel.
- [x] Adicionar condições persistentes aos participantes do Modo de Cena.
- [x] Adicionar efeitos temporários com duração, origem e expiração no Modo de Cena.
- [x] Criar histórico de eventos da sessão com registro das ações principais.
- [x] Permitir exportar o histórico do Modo de Cena em formato JSON.
- [x] Adicionar barra de pesquisa ao Cofre Local.
- [x] Adicionar ordenação por nome, sistema, data de atualização e data de criação ao Cofre Local.
- [x] Cobrir os novos fluxos com testes unitários e de interface.
- [x] Validar responsividade em desktop e mobile, executar testes completos e publicar checkpoint.
- [x] Adicionar `createdAt` ao envelope JSON de ficha e aos backups, preservando esse campo na importação e exportação.
- [x] Implementar ordenação do Cofre Local por sistema e cobrir a nova opção com teste.
- [x] Adicionar teste de interface para importação JSON no Cofre Local, validando importação sem sobrescrita e feedback de erro.
- [x] Salvar um novo checkpoint publicado após a expansão de backup JSON, Modo de Cena e Cofre Local, confirmando o `version_id` retornado.

# Nova expansão — expiração, compartilhamento e organização

- [x] Adicionar animação visual quando um efeito temporário expirar no Modo de Cena.
- [x] Exibir notificação acessível quando um efeito temporário expirar durante a rodada.
- [x] Criar contrato de compartilhamento para fichas exportadas por link.
- [x] Implementar geração e cópia de link compartilhável para uma ficha JSON.
- [x] Implementar QR code para abrir ou transferir uma ficha compartilhada.
- [x] Adicionar metadados de nível e tags personalizadas às fichas do Cofre Local.
- [x] Adicionar filtros por nível e tags na interface de pesquisa do Cofre Local.
- [x] Cobrir as novas funções com testes unitários e de interface.
- [x] Validar responsividade, executar testes completos e publicar checkpoint.
- [x] Implementar um fluxo real de compartilhamento para fichas JSON exportadas com payload seguro e rota dedicada de leitura.
- [x] Integrar a geração e a cópia do link JSON no Cofre Local e nos painéis de exportação das fichas.
- [x] Adicionar leitura/preview da ficha compartilhada e testes do contrato, geração, cópia e abertura do link JSON.
- [x] Adicionar geração e cópia de link JSON também na página `/cofre-local` para compartilhar registros sem abrir a ficha.
- [x] Cobrir o compartilhamento JSON direto do Gerenciador com teste DOM.
- [x] Publicar um checkpoint final após essa integração e registrar o `version_id`.

# Nova expansão — compressão e visualizações do Cofre

- [x] Definir envelope comprimido versionado para links JSON, mantendo leitura retrocompatível de links não comprimidos.
- [x] Implementar compressão transparente de payloads grandes antes da geração da URL.
- [x] Cobrir compressão, descompressão, Unicode e rejeição de payload inválido com testes.
- [x] Criar modelo local persistente para visualizações personalizadas de filtros combinados.
- [x] Permitir salvar, selecionar, atualizar e excluir visualizações no Cofre Local.
- [x] Cobrir visualizações personalizadas com testes de persistência e interface.
- [x] Validar responsividade, executar testes completos e publicar checkpoint.
- [x] Salvar um novo checkpoint publicado após a expansão de compressão de payloads e visualizações salvas do Cofre Local, registrando o `version_id` retornado.

# Nova expansão — preview compartilhado e fichas fiéis aos universos

- [x] Criar modal de pré-visualização ao abrir link compartilhado, com dados básicos antes da importação.
- [x] Permitir confirmar ou cancelar a importação a partir do modal sem sobrescrever fichas locais.
- [x] Remodelar a ficha de Vampiro V5 com composição fiel ao fluxo de atributos, habilidades, disciplinas, vantagens, saúde e fome do universo.
- [x] Remodelar a ficha de O Um Anel com composição fiel ao fluxo de atributos, perícias, esperança, sombra, resistência, comunidade e jornada.
- [x] Preservar exportação JSON/PDF, cofre local, compartilhamento e compatibilidade dos dados durante a remodelação.
- [x] Cobrir modal, modelos e interações das fichas com testes unitários e de interface.
- [x] Validar responsividade, executar testes completos e publicar checkpoint.

# Correções de fidelidade e validação integrada

- [x] Remodelar de fato a ficha de Vampiro V5 reorganizando os blocos principais de criação, em vez de apenas adicionar painel complementar.
- [x] Remodelar de fato a ficha de O Um Anel com blocos explícitos de comunidade e jornada, além da hierarquia visual do sistema.
- [x] Executar testes integrados das fichas remodeladas cobrindo exportação PDF/JSON, Cofre Local, compartilhamento e carregamento de dados em Vampiro e O Um Anel.
- [x] Adicionar ou atualizar testes DOM específicos de O Um Anel e ampliar a cobertura integrada das interações das duas fichas.
- [x] Corrigir o warning `NaN` na folha principal V5 e validar valores derivados exibidos.
- [x] Adicionar testes integrados de página para exportação, Cofre Local, compartilhamento e carregamento em Vampiro e O Um Anel.
- [x] Interagir nos testes DOM com os novos painéis principais das duas fichas.
- [x] Adicionar asserções de Vitalidade e Força de Vontade na folha principal V5 para evitar regressão de NaN.
- [x] Exercitar exportação, ações do Cofre, compartilhamento e carregamento nas páginas remodeladas de Vampiro e O Um Anel.
- [x] Criar teste integrado de Vampiro V5 que acione exportação, salvamento, carregamento no Cofre e compartilhamento após a remodelação.
- [x] Criar teste integrado de O Um Anel que acione exportação, salvamento, carregamento no Cofre e compartilhamento após a remodelação.
- [x] Salvar checkpoint publicado com a nova folha principal fiel de Vampiro V5 e O Um Anel e o modal de preview compartilhado, registrando o `version_id` retornado.

# Nova expansão — temas por sistema e retratos

- [x] Definir tokens visuais específicos para Vampiro e O Um Anel, preservando acessibilidade e responsividade.
- [x] Criar contrato de retrato com limite de tamanho, tipo MIME permitido e compatibilidade retroativa.
- [x] Adicionar upload de retrato nas fichas e pré-visualização com remoção/substituição.
- [x] Persistir o retrato junto aos dados no Cofre Local, incluindo salvar, carregar, duplicar e importar/exportar JSON.
- [x] Aplicar tema vermelho escuro de Vampiro à ficha e ao contexto de criação.
- [x] Aplicar tema pergaminho de O Um Anel à ficha e ao contexto de jornada.
- [x] Cobrir temas, upload, persistência e compatibilidade com testes unitários e de interface.
- [x] Validar responsividade, executar testes completos e publicar checkpoint.

# Continuação — temas por sistema e editor de retrato

- [x] Aplicar tema escuro com tons de vermelho à ficha e ao contexto de Vampiro.
- [x] Aplicar estilo pergaminho à ficha e ao contexto de O Um Anel.
- [x] Criar editor de retrato com seleção de arquivo, recorte quadrado e redimensionamento.
- [x] Permitir confirmar, substituir e remover o retrato antes de salvar a ficha.
- [x] Persistir o retrato recortado no estado da ficha e no Cofre Local, mantendo compatibilidade com fichas antigas.
- [x] Cobrir temas e editor de retrato com testes unitários e de interface.
- [x] Validar responsividade e acessibilidade, executar testes completos e publicar checkpoint.
- [x] Aplicar overrides CSS completos para o tema de Vampiro em painéis, textos, bordas e acentos internos.
- [x] Adicionar testes de interface que verifiquem os temas renderizados nas fichas.
- [x] Ampliar os testes DOM das fichas para verificar o editor de retrato integrado.
