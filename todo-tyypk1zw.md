# Project TODO

- [x] Adicionar rota e entrada de navegação para o mapa de campanha interativo de Shadowlords
- [x] Criar mapa visual com regiões, conexões e seleção de locais
- [x] Adicionar relógio de tensão da campanha com avanço e reinício local
- [x] Criar encontros iniciais baseados nos eventos adaptados de Trench Crusade
- [x] Adicionar painel de detalhes, estados vazios e responsividade móvel
- [x] Escrever testes unitários e DOM para mapa, relógio e encontros
- [x] Executar pnpm check e pnpm build; testes focados do mapa passam (a suíte completa mantém timeout legado registrado abaixo)
- [x] Validar visualmente em desktop e mobile
- [ ] Salvar checkpoint e publicar a versão compartilhada
- [x] Adicionar testes unitários separados para a lógica do mapa de campanha (estado inicial, avanço/reset do relógio, persistência local e resolução de encontros)
- [ ] Investigar timeout legado em client/src/pages/VampireSheet.dom.test.tsx observado durante pnpm test; não relacionado ao mapa de Shadowlords
