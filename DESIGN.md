# Sistema visual da Essência Pizzaria

Site do TCC "Plano de Negócios: Pizzaria Essência". O tom é calmo, legível e previsível: o público inclui famílias com pessoas com deficiência, autismo, TDAH e seletividade alimentar. Contenção vence enfeite.

## Cores (`styles.css :root`)

| Token | Valor | Uso |
|---|---|---|
| `--green-950` | `#0b2b22` | fundos escuros, texto sobre amarelo |
| `--green-900` | `#10372a` | texto de navegação, botões escuros |
| `--green-700` | `#1d7247` | marca, links, chamadas (texto em branco 5,9:1) |
| `--cream` | `#fffaf0` | fundo das páginas |
| `--ink` | `#173029` | texto principal |
| `--muted` | `#424f4a` | texto de apoio (7,3:1 no creme, para baixa visão) |
| `--yellow` | `#f2b632` | destaque e botão principal do hero |
| `--red` | `#c8402f` | só preços e alertas |
| `--blue` | `#0b5fb0` | foco do teclado, informação |
| `--purple` | `#744a91` | neurodiversidade (cor da marca) |

O cardápio (`cardapio/styles.css`) e o painel (`cardapio/admin.html`) usam os mesmos valores.

**Alto contraste** (`body.high-contrast`): fundo preto, texto branco, destaque amarelo `#ffe100`. No cardápio o alto contraste é branco e preto.

## Tipografia

- Fonte única: **Atkinson Hyperlegible** (feita para baixa visão), 400 e 700.
- Texto do corpo: 16 px; "Texto maior" muda para 19 px e aumenta também tudo que usa `rem` (fonte no `<html>`).
- Títulos com `text-wrap: balance`; parágrafos com `text-wrap: pretty`.
- Números (preços, tabelas, contadores) com `font-variant-numeric: tabular-nums`.

## Forma

- Raios: 18 px (`--radius-md`) para cards, 28 px (`--radius-lg`) para blocos grandes, 999 px para botões e etiquetas.
- Sombra única: `--shadow`.
- Alvo de toque mínimo: 44 × 44 px.

## Movimento (`movimento.css` / `movimento.js`)

- Entradas ao rolar: 450 ms, deslocamento de 12 px, 50 ms entre itens.
- Barras dos gráficos: 700 ms com `transform: scaleX`, nunca `width`.
- Diálogos: entrada de 200 ms (fade + escala 0,97).
- Hover só em aparelhos com mouse (`@media (hover: hover) and (pointer: fine)`); no toque, `:active` com escala 0,97.
- "Modo foco" e "reduzir movimento" do sistema desligam todos os deslocamentos.
- Nada gira sozinho: o 3D começa parado e o logo do plano não gira.

## Acessibilidade

- Preferências (texto maior, alto contraste, modo foco, áudio) em todas as páginas, salvas no aparelho e compartilhadas com o cardápio.
- VLibras no início e no cardápio.
- Alérgenos em todo card, no resumo, no pedido e no sucesso, sempre com o aviso de contato cruzado.
- No celular, o 3D não prende a rolagem: o giro só liga com o botão "Tocar para girar o 3D".

## Regras de conteúdo

- Nada inventado: sem depoimentos, sem fotos falsas, sem schema de restaurante (a empresa ainda não existe).
- O que depende do grupo aparece como **pendente**.
- As URLs e os nomes das pastas não mudam (o QR Code aponta para elas).
