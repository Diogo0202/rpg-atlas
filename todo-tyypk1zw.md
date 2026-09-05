# Project TODO

- [x] Adicionar rota e entrada de navegação para o mapa de campanha interativo de Shadowlords
- [x] Criar mapa visual com regiões, conexões e seleção de locais
- [x] Adicionar relógio de tensão da campanha com avanço e reinício local
- [x] Criar encontros iniciais baseados nos eventos adaptados de Trench Crusade
- [x] Adicionar painel de detalhes, estados vazios e responsividade móvel
- [x] Escrever testes unitários e DOM para mapa, relógio e encontros
- [x] Executar pnpm check e pnpm build; testes focados do mapa passam (a suíte completa mantém timeout legado registrado abaixo)
- [x] Validar visualmente em desktop e mobile
- [x] Salvar checkpoint e publicar a versão compartilhada (checkpoint 9e85cfe7)
- [x] Adicionar testes unitários separados para a lógica do mapa de campanha (estado inicial, avanço/reset do relógio, persistência local e resolução de encontros)
- [x] Investigar timeout legado em client/src/pages/VampireSheet.dom.test.tsx: o teste passa isoladamente em 12,7 s; o timeout de 15 s era limítrofe sob carga da suíte e foi ajustado para 25 s
- [x] Reproduzir isoladamente o timeout em client/src/pages/VampireSheet.dom.test.tsx, identificar a causa e registrar diagnóstico ou correção
- [x] Reexecutar pnpm test após a investigação do timeout legado: 74 arquivos e 198 testes passaram
