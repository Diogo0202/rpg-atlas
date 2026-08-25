# Direções de design — RPG Atlas: Terras de Veyr

## Três abordagens consideradas

### 1. Arquivo Obsidiano
**Very Brief Intro:** Um atlas de campanha tratado como um dossiê recuperado: escuro, tátil e meticulosamente anotado. A experiência mistura o rigor de um arquivo histórico com a tensão do horror gótico.

**Probability:** 0.07

### 2. Cartografia de Cinzas
**Very Brief Intro:** Uma abordagem geográfica e mineral, inspirada em mapas queimados, fornalhas e rotas de peregrinação. O foco visual fica nos territórios e nas marcas deixadas por juramentos, guerra e memória.

**Probability:** 0.04

### 3. Salão dos Juramentos
**Very Brief Intro:** Uma biblioteca cerimonial de alta fantasia sombria, com grandes superfícies claras, pigmento rubro e detalhes heráldicos. A sensação é de entrar em uma câmara onde cada escolha é registrada.

**Probability:** 0.09

---

## Direção escolhida: Arquivo Obsidiano

### Design Movement
**Editorial gothic revival** com referências a arquivos policiais, tomos de ocultismo e sinalização industrial. Não é uma interface de jogo genérica: deve parecer um artefato de campanha que organiza riscos, mapas, facções e memória.

### Core Principles
1. **Informação como relíquia:** textos, selos e marcadores aparecem como registros físicos preservados por um cronista.
2. **Contraste disciplinado:** superfícies profundas e carvão servem de base; cobre oxidado e sal pálido revelam apenas o que importa.
3. **Navegação por investigação:** cada seção se comporta como uma pista, com âncoras claras e hierarquia editorial.
4. **Lacunas intencionais:** espaço vazio, ruído e pequenas anotações laterais criam suspense sem comprometer a leitura.

### Color Philosophy
O preto mineral **#111312** estabelece peso e noite; o osso envelhecido **#EAE3D5** ilumina a leitura como papel recuperado; o cobre de brasa **#B55B32** marca ameaça, ação e legado; o verde de sal **#83A89A** identifica conhecimento, rotas e memórias recuperadas. A cor existe para sinalizar estado narrativo, não para decorar.

### Layout Paradigm
Uma composição de **dossiê lateral**: navegação vertical compacta à esquerda no desktop, com conteúdo principal em colunas editoriais de largura variável. O herói usa um grande bloco de contexto e uma janela de "registro de campanha" deslocada, evitando o clássico centro simétrico. Em telas menores, a navegação vira uma faixa horizontal de capítulos.

### Signature Elements
1. Linhas pontilhadas e coordenadas discretas, como mapas de investigação.
2. Selos circulares monogramados e marcadores de capítulo em cobre.
3. Textura de grão muito sutil em superfícies escuras, lembrando tinta, pedra e papel carbonizado.

### Interaction Philosophy
As interações devem parecer descobertas: cartões de facções revelam contexto em foco, a navegação faz rolagem suave até os capítulos, e os controles respondem com mudanças breves de cor, opacidade e deslocamento. Nenhuma animação deve competir com o conteúdo.

### Animation
Entradas de seções com opacidade e deslocamento vertical de 10–16 px, em 180–260 ms, respeitando `prefers-reduced-motion`. Os itens de navegação respondem em até 160 ms; marcadores e chips mudam apenas cor e opacidade. Não usar animações contínuas, loop ou efeitos neon.

### Typography System
**Cormorant Garamond** em títulos, nomes de facções e trechos de lore; **Manrope** para navegação, dados, cartões e corpo. Títulos usam peso 600–700 e espaçamento ligeiramente fechado; metadados são em caixa alta pequena com tracking amplo; corpo mantém 16–18 px e altura de linha generosa.

### Brand Essence
**RPG Atlas é um arquivo de campanha para mestres que transformam memória, território e consequência em jogo vivo.** Personalidade: **sombrio, preciso, conspiratório**.

### Brand Voice
Headlines falam como registro e convocação, nunca como marketing genérico. CTAs soam como atos de consulta ou preparação.

Exemplos: "Abra o registro de Véspera do Vau." e "Nenhum juramento some sem deixar rastro."

### Wordmark & Logo
Um monograma abstrato que une a letra **V** a um marco de vau e um arco de eclipse; o símbolo deve parecer um selo de cartografia e não conter texto. O wordmark combina Cormorant Garamond em caixa alta com espaçamento de manuscrito.

### Signature Brand Color
**Cobre de Brasa — #B55B32**. Uma cor de ação e memória que identifica o atlas de imediato.

## Style Decisions

- O site adotará a direção **Arquivo Obsidiano** integralmente.
- O herói deve usar imagem gerada escura; todo texto sobre imagem terá camada de contraste sólida.
- O site terá uma landing page editorial com seções: universo, campanha, facções, pipeline de criação e guia de mesa.
- O conteúdo será baseado apenas no documento de contexto anexado; itens de export criptografado permanecerão explicitamente fora do escopo.
- Em telas desktop, a navegação será uma **trilha lateral de dossiê**, com capítulos verticais e selo de autenticação; a barra superior deixa de ser a navegação principal.
- Toda seção terá ao menos um artefato de arquivo recorrente: coordenada, linha de investigação pontilhada, carimbo de cobre, anotação marginal ou rótulo de registro.
- O selo de Veyr será repetido como marca de autenticação na trilha lateral, nos registros principais e no rodapé, para tornar a marca reconhecível sem o wordmark.
- As seções claras receberão textura de papel antigo, campos regrados e marcações de documento para evitar o aspecto de página editorial genérica.
- Em telas desktop, a trilha lateral permanece como assinatura obrigatória: ela mostra âncoras de capítulo, selo de autenticação, numeração e progressão vertical; a barra superior apenas identifica o arquivo.
- O selo de Veyr combina um monograma V, arco de eclipse e marca de travessia, aparecendo em herói, trilha lateral, registros principais e rodapé como carimbo de autenticação.
- O cobre de Brasa será reservado a ações, selos, avisos, registros ativos e marcadores de legado; linhas investigativas, coordenadas e anotações marginais reforçarão a continuidade do dossiê entre as seções.
- Todo painel interativo deve se comportar visualmente como formulário de arquivo, livro-caixa, ficha de caso ou registro carimbado; rótulos e controles adotam a voz de consulta, preparação e manuseio de evidências.
- Fichas, cofre local, trilhas de dano e rolagens rápidas devem aparecer como instrumentos de arquivo: registros numerados, campos clínicos, estados carimbados e marcações de consulta, sem linguagem de painel SaaS genérico.
