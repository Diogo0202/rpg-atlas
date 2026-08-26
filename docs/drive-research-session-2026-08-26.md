# Notas de pesquisa da sessão — 26-08-2026

Este registro consolida apenas achados já confirmados nas fontes compartilhadas pelo usuário, para orientar a implementação do acervo de consulta sem depender de memória transitória.

## Vampiro V5

O projeto já possui um catálogo estruturado em `shared/vampire-v5.ts` com os clãs `Banu Haqim`, `Brujah`, `Gangrel`, `Hecata`, `Lasombra`, `Malkaviano`, `Ministério`, `Nosferatu`, `Ravnos`, `Salubri`, `Toreador`, `Tremere`, `Tzimisce`, `Ventrue`, além de `Caitiff` e `Sangue-Ralo`.

Os materiais do Drive já inventariados em `docs/v5-material-map.md` apontam especialmente para os PDFs `Cópia de Vampiro - REFERENCIA.pdf` (`1iznjjcr15VlPUOEqR1E68PqOCzAEfkVG`) e `Cópia de Guia Suplementar Personagem Expandido.pdf` (`13DbqWq4Zto_bWNP6fXZpqO2ato2lW9TA`) como fontes resumidas e adequadas para consulta.

Na referência `vampiro-referencia.pdf`, o sumário confirma a presença destacada de `Ravnos`, `Salubri` e `Tzimisce`, enquanto o corpo do texto e o índice evidenciam ainda `Banu Haqim`, `Brujah`, `Gangrel`, `Lasombra`, `Malkavianos`, `Ministério`, `Nosferatu`, `Toreador`, `Tremere` e `Ventrue`. Para a implementação, a seleção principal deverá respeitar o pedido do usuário por **12 clãs**, distinguindo-os de linhagens/variações como `Caitiff` e `Sangue-Ralo`.

## Caçador: A Revanche

O PDF anexado pelo usuário, `CópiadeCaçador-ARevanche.pdf`, passa a ser a **fonte prioritária** para os arquétipos de caçador nesta sessão. O arquivo local está em `/home/ubuntu/upload/CópiadeCaçador-ARevanche.pdf` e corresponde ao material visual consultado diretamente.

O PDF `Caçador - A Revanche.pdf` (`1M3ZYy7dr4d3UPmiklBu043JStYf29O4g`) foi usado apenas como apoio anterior para localizar seções e confirmar a estrutura geral dos credos no acervo compartilhado.

O índice do livro confirma que os **credos** jogáveis tratados como arquétipos de referência incluem `Devoto`, `Empreendedor`, `Inquisitivo`, `Marcial` e `Clandestino`, todos associados à criação de personagem e ao capítulo de referência de credo.

Na inspeção visual do PDF anexado, as páginas 33 a 37 mostram em detalhe os credos `Empreendedor` e `Devoto`. O credo **Empreendedor** é descrito como uma abordagem inovadora, instrumental e experimental para a Caçada, com ênfase em ferramentas, protocolos, protótipos e solução prática de problemas. O material também traz arquétipos internos para esse credo, incluindo `Trabalhador de Jornada Dupla`, `Negociador de Contratos`, `Influenciador` e `Promoter de Boates`.

O credo **Devoto** é descrito como uma perspectiva moldada pela fé, pela justiça e pela integridade moral, tratando a crença como recurso espiritual e interpretativo na Caçada. A inspeção visual do PDF anexado nas páginas 37 a 39 confirmou `Trunfos sugeridos` ligados a biblioteca e qualquer dote, `Ímpetos comuns` associados a juramento, expiação e vingança, e arquétipos internos como `Absolvedor`, `Convertido de Última Hora`, `Espécime Físico` e `Apóstata`.

O credo **Inquisitivo** aparece no livro como uma postura menos imediatista e mais investigativa, orientada por compreensão do oculto, coleta de informação, descoberta de padrões e preparo indireto para a Caçada. A inspeção visual do PDF anexado nas páginas 41 a 43 confirmou `Trunfos sugeridos` como biblioteca, acesso global, encantador de feras e sentir o sobrenatural, além de `Ímpetos comuns` ligados a curiosidade, orgulho e ganância. Nessas mesmas páginas, os arquétipos internos aparecem nomeados como `Libertador de Dados`, `Especialista em Sinistros`, `Professor Substituto` e `Motorista de Rota`.

O credo **Marcial** é descrito como uma abordagem direta, combativa e frequentemente violenta, centrada em neutralizar a presa antes que ela dite o ritmo do confronto. A inspeção visual do PDF anexado nas páginas 45 a 47 confirmou `Trunfos sugeridos` como arsenal, frota, artilharia e artefato, e `Ímpetos comuns` como vingança, orgulho e inveja. As mesmas páginas também nomeiam os arquétipos internos `Desistente`, `Engenheiro`, `Ativo Comprometido` e `Atirador de Elite`.

O credo **Clandestino** é descrito como uma perspectiva de combate ao oculto baseada em conhecimento da contracultura, proximidade com o submundo sobrenatural e uso de métodos não convencionais. Seus perfis se movem entre criminalidade, sabotagem, sobrevivência e resistência, com atenção a furtividade e subterfúgio. A inspeção visual do PDF anexado nas páginas 49 a 51 confirmou `Trunfos sugeridos` como arsenal, frota, equipamento improvisado e frustrar o sobrenatural; `Ímpetos comuns` como inveja, juramento e vingança; e os arquétipos internos `Pistoleiro`, `Dono de Galeria`, `Contrabandista` e `Infiltrado`.

Com isso, as cinco categorias principais de credo — `Empreendedor`, `Devoto`, `Inquisitivo`, `Marcial` e `Clandestino` — e os seus exemplos internos de arquétipo já foram identificados **diretamente no PDF anexado** para composição do acervo.

## O Um Anel

O PDF `toaz.info-o-um-anel-rpg-ediao-brasileira-beta-21-pr_780a4e0fb34f1798799ee57f43f9f125.pdf` (`1IncmiLhV10vXg7mJZa4b29jYfSx9NFoi`) foi baixado e convertido para texto.

Na seção de criação de personagem, o manual-base confirma **seis Culturas Heroicas** como base jogável: `Anões do Povo de Durin`, `Bardeses`, `Elfos de Lindon`, `Hobbits do Condado`, `Homens de Bri` e `Patrulheiros do Norte`.

Como o pedido do usuário usa o termo “linhagens”, a implementação deve tratar essas seis culturas heroicas como o conjunto principal de linhagens jogáveis de consulta, salvo se outra fonte do Drive trouxer um elenco adicional explicitamente nomeado como linhagem.

## Validação da interface

A rota `/acervo` foi verificada visualmente em 26 de agosto de 2026. Em desktop, a navegação lateral expõe o item **Acervo** e a página mostra os 12 cartões de clã em uma grade de três colunas, além do campo de busca e das abas para Caçador e O Um Anel. Em 375 px de largura, o índice, as abas e os cartões passam para uma única coluna sem cortes horizontais, preservando a leitura das disciplinas, perdições e compulsões.
