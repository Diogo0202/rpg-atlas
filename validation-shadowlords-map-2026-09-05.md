# Validação — Mapa de campanha Shadowlords

## Escopo

A rota `/mapa-shadowlords` recebeu um mapa interativo da campanha **O Sinalizador sob a Colina**, com seis marcos, rotas pontilhadas, seleção de região, relógio de tensão de 0 a 6, encontros iniciais baseados nos eventos adaptados de Trench Crusade e persistência local do estado.

## Validação técnica

Os testes focados passaram: `client/src/pages/ShadowlordsCampaignMap.test.tsx` contém 4 casos DOM e `shared/campaign-atlas-map.test.ts` contém 5 casos unitários. O TypeScript check e o build de produção também passaram.

A suíte completa `pnpm test` executou 74 arquivos e 198 testes, todos aprovados. O teste de inventário de `client/src/pages/VampireSheet.dom.test.tsx` passa isoladamente em aproximadamente 12,7 s; o timeout de 15 s era limítrofe sob carga da suíte. O limite explícito foi ajustado para 25 s, sem desabilitar as asserções.

## Validação visual

Em desktop, a rota preserva o Arquivo Obsidiano com trilha lateral autenticada, selo de Veyr, placa cartográfica, mapa central e painel editorial de registro. Em mobile, a trilha lateral desaparece para liberar espaço, o mapa permanece legível em uma coluna e os painéis de relógio, marco, encontro e registro ficam empilhados sem overflow horizontal visível.

Os nós cartográficos têm foco visível, rótulos acessíveis e seleção por teclado. O relógio e os encontros apresentam estados vazios, ações desabilitadas no limite e reinício explícito.
