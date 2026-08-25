# Arquitetura inicial — RPG Atlas

O RPG Atlas separa **conteúdo de campanha** de **regras de sistema**. Personagens, campanhas, sessões, biblioteca e permissões são entidades de plataforma; os detalhes de atributo, perícia, recursos e rolagem são resolvidos por uma definição de sistema versionável.

| Camada | Responsabilidade na primeira fundação |
|---|---|
| Interface React | Dossiê público, aplicação autenticada e fluxos de criação. |
| tRPC | Contratos tipados para leitura e escrita; nenhuma chamada de dados direta pelo cliente. |
| Serviços de domínio | Autorização por dono e por participação em campanha, regras de rolagem e normalização de fichas. |
| Repositórios Drizzle | Consultas por usuário, campanha e sistema. |
| Banco relacional | Identidade, sistemas, campanhas, membros, fichas e registros de rolagem. |
| Armazenamento | Arquivos em S3; somente chave, URL e metadados ficam no banco. |

## Entidades da primeira entrega

| Entidade | Responsabilidade | Limite de sistema |
|---|---|---|
| `users` | Identidade OAuth e papel global. | Independente. |
| `rpg_systems` | Catálogo de sistemas e versão ativa. | Define o adaptador de regras. |
| `campaigns` | Espaço narrativo, proprietário e sistema escolhido. | Uma campanha usa um sistema. |
| `campaign_members` | Papéis de narrador, jogador e observador por campanha. | Independente. |
| `characters` | Ficha, autoria, vínculo opcional com campanha e visibilidade. | Dados específicos residem em `sheetData`. |
| `dice_rolls` | Auditoria de rolagens de personagem ou campanha. | Resultado detalhado reside em `resultData`. |

## Extensibilidade

O catálogo em `shared/rpg-systems.ts` define os contratos iniciais para **Vampiro: A Máscara V5** e **O Um Anel**. Um futuro sistema — como **Lobisomem: O Apocalipse** — entra por uma nova definição, adaptador de rolagem e campos de ficha, sem alterar as entidades centrais.

## Regras de acesso

O proprietário controla seus personagens privados e campanhas. Uma associação em `campaign_members` concede acesso apenas à campanha correspondente, e o papel de narrador autoriza operações editoriais da mesa. O papel global `admin` permanece reservado à moderação e à administração da plataforma.
