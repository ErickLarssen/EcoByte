# 12 — RESPONSIVENESS & ACCESSIBILITY

## 1. Objetivo

Este documento define as diretrizes de responsividade e acessibilidade do EcoByte.

O objetivo é garantir que a aplicação seja:

```text
responsiva
mobile-first
acessível
consistente
navegável por teclado
compreensível
usável em diferentes dispositivos
```

As diretrizes deste documento devem orientar:

- Layouts
- Componentes
- Formulários
- Navegação
- Dashboards
- Tabelas
- Modais
- Feedbacks
- Animações
- Interações
- Tipografia
- Contraste
- Touch
- Teclado
- Leitores de tela

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/04_REQUIREMENTS.md
docs/10_DESIGN_SYSTEM.md
docs/11_COMPONENTS.md
docs/15_INTERACTIONS_MOTION.md
docs/16_ASSETS.md
```

---

# 2. Princípios gerais

## RA-001 — Mobile First

O frontend deve ser desenvolvido partindo de telas pequenas.

Fluxo:

```text
Mobile
    ↓
Tablet
    ↓
Desktop
    ↓
Telas maiores
```

A interface desktop não deve ser tratada como ponto de partida obrigatório.

---

## RA-002 — Progressive Enhancement

Começar com uma experiência funcional e clara em telas pequenas.

Depois adicionar:

```text
colunas
sidebars
informações adicionais
gráficos
ações secundárias
```

conforme o espaço disponível aumentar.

---

## RA-003 — Conteúdo primeiro

O layout deve priorizar o conteúdo e as ações mais importantes.

Quando o espaço diminuir:

```text
conteúdo secundário
↓
é reduzido, agrupado ou reorganizado
```

e não simplesmente comprimido até ficar ilegível.

---

## RA-004 — Não criar layouts dependentes de uma única resolução

Não construir páginas que funcionem adequadamente somente em:

```text
1920x1080
```

ou qualquer outra resolução específica.

A interface deve se adaptar continuamente.

---

# 3. Breakpoints

Os breakpoints devem ser centralizados na configuração visual do projeto.

Estrutura conceitual:

```text
sm
md
lg
xl
2xl
```

Os valores exatos devem ser definidos pela stack adotada e não repetidos arbitrariamente em componentes individuais.

---

# 4. Layout fluido

Preferir:

```text
width: 100%
max-width
min-width
flex
grid
clamp()
responsive spacing
```

em vez de larguras fixas sempre que possível.

---

# 5. Containers

Conteúdo principal deve possuir uma largura máxima apropriada.

Estrutura:

```text
Viewport
└── Container
    └── Content
```

O conteúdo não deve permanecer colado às bordas da tela.

---

# 6. Espaçamento responsivo

Os espaçamentos podem diminuir conforme o viewport.

Exemplo conceitual:

```text
Mobile
→ espaçamento compacto

Tablet
→ espaçamento intermediário

Desktop
→ espaçamento ampliado
```

Não exagerar no espaçamento em telas pequenas.

---

# 7. Grid responsivo

Grids devem adaptar o número de colunas.

Exemplo:

```text
Mobile
1 coluna

Tablet
2 colunas

Desktop
3–4 colunas
```

A quantidade final deve depender do conteúdo.

---

# 8. Flexbox

Utilizar Flexbox para:

```text
alinhamento
grupos de ações
headers
botões
componentes horizontais
```

Quando o eixo horizontal deixar de comportar o conteúdo:

```text
row
↓
column
```

deve ser considerado.

---

# 9. CSS Grid

Utilizar Grid para:

```text
dashboards
cards
formulários
áreas com múltiplas colunas
layouts complexos
```

---

# 10. Overflow

Evitar overflow horizontal involuntário.

Não permitir que:

```text
textos
cards
inputs
botões
imagens
tabelas
```

quebrem a viewport.

---

# 11. Tabelas em mobile

Tabelas largas não devem ser simplesmente reduzidas até se tornarem ilegíveis.

Soluções possíveis:

```text
scroll horizontal
cards
colunas prioritárias
layout alternativo
```

A solução deve considerar o contexto.

---

# 12. DataTable responsiva

O `DataTable` deve possuir estratégia para:

```text
mobile
tablet
desktop
```

No mobile, pode ser necessário ocultar visualmente colunas secundárias e disponibilizar os detalhes em uma ação adicional.

---

# 13. Sidebar responsiva

No desktop:

```text
Sidebar fixa ou persistente
```

No mobile:

```text
Drawer
Sheet
Menu
```

A navegação deve ocupar o mínimo necessário da tela.

---

# 14. Header responsivo

Desktop pode apresentar:

```text
logo
navegação
notificações
perfil
```

Mobile pode reorganizar para:

```text
menu
logo
notificações
perfil
```

A ordem real deve priorizar as ações mais importantes.

---

# 15. Navegação mobile

A navegação deve ser simples.

Evitar menus excessivamente profundos.

Quando houver muitas opções:

```text
agrupar
priorizar
ocultar itens secundários
```

---

# 16. Áreas de toque

Elementos interativos devem possuir área de toque adequada.

Isso se aplica especialmente a:

```text
botões
links
IconButtons
checkboxes
tabs
menus
```

---

# 17. IconButton em mobile

Um botão de ícone não deve possuir uma área de toque minúscula apenas para ocupar menos espaço.

O tamanho visual do ícone pode ser menor que a área interativa.

---

# 18. Formulários responsivos

Formulários devem se adaptar ao viewport.

Desktop:

```text
2 colunas
```

pode ser apropriado para campos independentes.

Mobile:

```text
1 coluna
```

deve ser utilizado quando duas colunas dificultarem a leitura ou interação.

---

# 19. Endereço

Campos de endereço podem utilizar:

Desktop:

```text
CEP | Número
Cidade | Estado
```

Mobile:

```text
CEP
Número
Cidade
Estado
```

A organização deve privilegiar leitura e preenchimento rápido.

---

# 20. Solicitação de coleta no mobile

A principal jornada do cliente deve funcionar completamente em dispositivos móveis.

Fluxo prioritário:

```text
login
    ↓
solicitar coleta
    ↓
endereço
    ↓
itens
    ↓
agendamento
    ↓
confirmação
```

---

# 21. Painel do coletor no mobile

O coletor deve conseguir executar operações essenciais sem depender de desktop.

Priorizar:

```text
coletas disponíveis
coletas atribuídas
endereço
status
próxima ação
```

---

# 22. Ações do coletor

A ação principal da etapa atual deve ser facilmente identificável.

Exemplo:

```text
ACEITA
→ Iniciar rota

A_CAMINHO
→ Confirmar recolhimento

RECOLHIDA
→ Confirmar entrega

ENTREGUE_ECOPONTO
→ Concluir coleta
```

---

# 23. Dashboard administrativo

No mobile, o dashboard administrativo pode reorganizar:

```text
cards
gráficos
filtros
tabelas
```

Priorizar primeiro:

```text
métricas principais
```

e posteriormente:

```text
detalhes
```

---

# 24. Gráficos responsivos

Gráficos devem:

- adaptar largura;
- evitar textos sobrepostos;
- possuir legendas legíveis;
- respeitar áreas de toque quando interativos;
- permitir leitura sem depender exclusivamente de cor.

Quando necessário, simplificar a visualização em telas pequenas.

---

# 25. Modais em mobile

Modais muito largos ou altos devem ser adaptados.

Em mobile, considerar:

```text
full width
bottom sheet
full screen
```

conforme o contexto.

---

# 26. Conteúdo de modal

Evitar conteúdo que ultrapasse o viewport sem permitir rolagem adequada.

Um modal pode possuir:

```text
header fixo
content scrollável
footer fixo
```

quando necessário.

---

# 27. Tipografia responsiva

Tamanhos tipográficos devem se adaptar quando necessário.

Pode utilizar:

```css
clamp()
```

para títulos e elementos de destaque.

Evitar títulos tão grandes no mobile que ocupem toda a primeira viewport.

---

# 28. Line-height

A altura das linhas deve permanecer confortável em qualquer viewport.

Textos longos não devem parecer comprimidos.

---

# 29. Quebra de texto

Textos de tamanho variável devem permitir:

```text
wrap
```

quando isso preservar a legibilidade.

Evitar depender de:

```text
nowrap
```

em conteúdos potencialmente longos.

---

# 30. Truncamento

Utilizar truncamento somente quando a perda visual de parte do texto for aceitável.

Quando a informação for importante:

```text
mostrar completa
```

ou:

```text
permitir expansão
```

---

# 31. Contraste

Todos os elementos importantes devem possuir contraste adequado.

Prioridade:

```text
texto
botões
links
inputs
ícones funcionais
badges
status
```

---

# 32. Não depender apenas de cor

Informações importantes não podem ser comunicadas exclusivamente através de:

```text
verde
vermelho
azul
amarelo
```

Sempre que necessário, combinar:

```text
cor
+
texto
+
ícone
+
estado
```

---

# 33. Status de coleta

Exemplo:

```text
● PENDENTE
● ACEITA
● A_CAMINHO
● RECOLHIDA
● ENTREGUE_ECOPONTO
● CONCLUIDA
```

A cor complementa o significado.

O texto continua sendo a fonte principal de compreensão.

---

# 34. Links

Links devem ser reconhecíveis como elementos interativos.

Não utilizar somente mudança sutil de cor como indicação.

---

# 35. Focus

Todos os elementos interativos devem possuir estado de foco visível.

Aplicável a:

```text
button
a
input
select
textarea
checkbox
radio
tabs
menus
```

---

# 36. Não remover outline sem alternativa

Evitar:

```css
outline: none;
```

sem implementar um indicador de foco equivalente.

---

# 37. Foco visível

O foco deve possuir:

```text
contraste
espessura suficiente
visibilidade
```

e não desaparecer em fundos semelhantes.

---

# 38. Ordem de tabulação

A navegação por teclado deve seguir a ordem lógica do conteúdo.

Exemplo:

```text
Header
↓
Navegação
↓
Conteúdo
↓
Ações
```

Evitar manipulação artificial da ordem com valores de `tabindex` desnecessários.

---

# 39. `tabindex`

Preferir:

```text
tabindex="0"
```

somente quando necessário.

Evitar valores positivos como:

```text
tabindex="1"
tabindex="2"
```

que podem criar uma ordem de navegação difícil de manter.

---

# 40. Navegação por teclado

O usuário deve conseguir acessar as principais funções sem mouse.

Prioridade:

```text
login
cadastro
formulários
navegação
menus
modais
ações de coleta
tabelas
```

---

# 41. Tecla Enter

Elementos interativos devem responder adequadamente à tecla Enter quando semanticamente apropriado.

---

# 42. Tecla Escape

Componentes como:

```text
modal
dropdown
drawer
```

devem considerar:

```text
Escape → fechar
```

quando isso não entrar em conflito com o contexto.

---

# 43. Modal e gerenciamento de foco

Ao abrir um modal:

```text
foco
↓
modal
```

O foco não deve escapar para elementos atrás do modal enquanto ele estiver ativo.

Ao fechar:

```text
foco
↓
elemento que abriu o modal
```

quando aplicável.

---

# 44. Drawer e navegação mobile

Quando um menu lateral ou drawer estiver aberto:

```text
foco
```

deve permanecer adequadamente dentro do contexto interativo.

---

# 45. Semântica HTML

Preferir elementos HTML semanticamente adequados.

Exemplos:

```html
<button>
<a>
<nav>
<header>
<main>
<section>
<article>
<footer>
<form>
<label>
```

Evitar construir elementos interativos complexos somente com:

```html
<div>
```

---

# 46. Botão vs link

Utilizar:

```text
button
```

para ações.

Utilizar:

```text
a
```

para navegação.

Exemplo:

```text
Aceitar coleta
→ button

Ir para coletas
→ link
```

---

# 47. Labels de formulário

Todo campo de formulário deve possuir um label identificável.

Evitar depender apenas de placeholder.

---

# 48. Placeholder

Placeholder deve fornecer orientação complementar.

Não deve substituir permanentemente o label.

---

# 49. Campos obrigatórios

Campos obrigatórios devem ser identificados de maneira clara.

Exemplo:

```text
Nome *
```

O sistema não deve depender somente de cor para indicar obrigatoriedade.

---

# 50. Mensagens de erro

Erros devem:

```text
ser claros
estar próximos do campo
orientar correção
ser compreensíveis
```

Exemplo:

```text
Senha
[****************]

A senha deve possuir pelo menos 8 caracteres.
```

---

# 51. Associação de erros

A mensagem de erro deve estar semanticamente associada ao campo correspondente.

Quando apropriado, utilizar:

```text
aria-describedby
aria-invalid
```

---

# 52. Erros de formulário

Além da mensagem visual, o campo deve comunicar seu estado de erro de maneira semântica.

Exemplo:

```html
aria-invalid="true"
```

quando aplicável.

---

# 53. Validação em tempo real

Validação em tempo real deve ser usada com cautela.

Priorizar:

```text
feedback útil
```

e evitar:

```text
mensagens agressivas enquanto o usuário ainda está digitando
```

---

# 54. Formulários longos

Quando um formulário possuir muitas etapas:

```text
progressive disclosure
```

pode ser utilizada.

Exemplo:

```text
1. Endereço
2. Itens
3. Agendamento
4. Revisão
```

---

# 55. Indicador de progresso

Fluxos multi-etapas podem apresentar:

```text
etapa atual
etapas concluídas
etapas restantes
```

O indicador não deve ser apenas visual; deve possuir uma alternativa textual apropriada.

---

# 56. Leitores de tela

A aplicação deve funcionar adequadamente com tecnologias assistivas.

Priorizar:

```text
semântica HTML
labels
landmarks
aria somente quando necessário
nomes acessíveis
mensagens de estado
```

---

# 57. Accessible Name

Elementos interativos devem possuir nome acessível.

Exemplo:

```text
IconButton
→ aria-label="Abrir notificações"
```

---

# 58. Ícones decorativos

Ícones puramente decorativos não devem gerar conteúdo desnecessário para leitores de tela.

Quando aplicável:

```text
aria-hidden="true"
```

---

# 59. Imagens

Imagens informativas devem possuir:

```text
alt
```

adequado.

Imagens decorativas podem utilizar:

```text
alt=""
```

quando apropriado.

---

# 60. Logo

A logo utilizada como link deve possuir alternativa textual adequada.

Exemplo conceitual:

```text
EcoByte — página inicial
```

---

# 61. Headings

Títulos devem respeitar uma estrutura lógica.

Exemplo:

```text
h1
├── h2
│   ├── h3
│   └── h3
└── h2
```

Não escolher headings apenas pelo tamanho visual.

---

# 62. Um H1 por página

Preferencialmente, cada página deve possuir um título principal claro.

Exemplo:

```text
Minhas coletas
```

como `h1`.

---

# 63. Landmarks

A estrutura semântica deve considerar:

```text
header
nav
main
aside
footer
```

quando aplicável.

---

# 64. `main`

Toda página deve possuir uma área principal claramente identificável.

---

# 65. Navigation

Navegações principais devem utilizar:

```html
<nav>
```

quando aplicável.

---

# 66. Form

Formulários devem utilizar:

```html
<form>
```

em vez de simular formulários com elementos genéricos.

---

# 67. Tabelas acessíveis

Tabelas devem utilizar corretamente:

```text
caption
th
scope
```

quando necessário.

---

# 68. Tabela complexa

Quando uma tabela possuir muitos níveis de cabeçalho, relações devem ser comunicadas semanticamente de forma adequada.

---

# 69. Tabelas em mobile

O modo alternativo de apresentação também deve manter:

```text
ordem
contexto
relação entre dados
```

---

# 70. Toasts e mudanças de estado

Alterações importantes da interface devem ser comunicadas também para tecnologias assistivas quando aplicável.

Exemplo:

```text
Coleta aceita com sucesso.
```

pode ser comunicada por uma área apropriada de status.

---

# 71. Loading acessível

Loading não deve ser comunicado somente por animação.

Utilizar texto ou mecanismo semântico apropriado quando necessário.

Exemplo:

```text
Carregando suas coletas...
```

---

# 72. Skeleton

Skeleton é visualmente útil, mas não deve substituir completamente uma comunicação acessível do carregamento quando a informação for necessária.

---

# 73. Estados de erro

Um erro importante deve ser percebido por:

```text
visual
+
texto
+
semântica apropriada
```

quando necessário.

---

# 74. Movimento

A interface deve respeitar:

```text
prefers-reduced-motion
```

---

# 75. Reduced Motion

Quando o usuário solicitar redução de movimento:

```text
animações decorativas
↓
reduzir ou remover
```

Transições funcionais essenciais podem permanecer quando necessário para compreensão.

---

# 76. Parallax

Parallax deve ser utilizado somente quando contribuir para a experiência.

Em mobile ou com `prefers-reduced-motion`:

```text
reduzir
```

ou:

```text
desativar
```

quando apropriado.

---

# 77. Vídeos

Vídeos não devem ser necessários para compreender a funcionalidade principal.

Quando utilizados:

```text
controls
alternativa
pausa
```

devem ser considerados conforme o contexto.

---

# 78. Autoplay

Conteúdo com autoplay deve ser utilizado com cautela.

Evitar áudio automático.

---

# 79. Animações contínuas

Evitar movimentos permanentes em elementos que não precisam chamar atenção continuamente.

---

# 80. Flashing

Não utilizar efeitos que possam causar desconforto por:

```text
flashes
piscadas rápidas
mudanças bruscas
```

---

# 81. Contraste de foco

O indicador de foco deve permanecer visível mesmo quando o elemento utilizar:

```text
background colorido
gradient
imagem
```

---

# 82. Zoom

A interface deve permanecer utilizável quando o usuário ampliar o conteúdo.

Não bloquear:

```text
zoom
```

sem necessidade.

---

# 83. Conteúdo em viewport ampliada

Quando o usuário aumentar o zoom:

```text
texto
inputs
botões
menus
```

não devem ficar inacessíveis devido a overflow rígido.

---

# 84. Reflow

A interface deve suportar reflow do conteúdo sem exigir rolagem horizontal desnecessária para tarefas comuns.

---

# 85. Inputs no mobile

Inputs devem facilitar a entrada de dados.

Utilizar tipos apropriados:

```html
<input type="email">
<input type="tel">
<input type="number">
<input type="date">
```

quando aplicável.

---

# 86. Teclados virtuais

Escolher tipos e atributos de input que acionem teclados adequados em dispositivos móveis.

---

# 87. Autocomplete

Campos apropriados podem utilizar:

```text
autocomplete
```

para facilitar preenchimento.

Exemplos:

```text
name
email
tel
new-password
current-password
postal-code
street-address
```

A configuração deve ser compatível com o campo real.

---

# 88. Password Input

Campos de senha devem utilizar mecanismos apropriados para:

```text
autocomplete
```

e gerenciamento de senha.

---

# 89. Área de toque e espaçamento

Elementos interativos próximos demais podem causar toques acidentais.

Manter espaçamento suficiente entre:

```text
ações
botões
ícones
checkboxes
```

especialmente no mobile.

---

# 90. Gestos

Gestos nunca devem ser a única forma de realizar uma ação importante.

Exemplo:

```text
swipe
```

pode complementar:

```text
button
```

mas não substituí-lo em funções críticas.

---

# 91. Orientação

A aplicação deve funcionar em:

```text
portrait
landscape
```

quando o dispositivo suportar.

Não bloquear orientação sem requisito.

---

# 92. Teclado físico

A experiência em desktop deve permitir navegação utilizando:

```text
Tab
Shift + Tab
Enter
Space
Escape
Arrow Keys
```

quando aplicável ao componente.

---

# 93. Menus acessíveis

Menus devem suportar:

```text
foco
teclado
Escape
setas
Enter
```

conforme a natureza do componente.

---

# 94. Tabs acessíveis

Tabs devem comunicar:

```text
aba selecionada
relação com painel
estado ativo
```

Utilizar padrões semânticos apropriados quando necessário.

---

# 95. Accordion acessível

Accordion deve comunicar:

```text
aberto
fechado
```

e permitir operação por teclado.

---

# 96. Dialog acessível

Dialog deve possuir:

```text
nome acessível
foco controlado
fechamento previsível
```

---

# 97. Feedback de ação

Quando uma ação modificar dados importantes:

```text
usuário
    ↓
ação
    ↓
processamento
    ↓
resultado
```

O sistema deve comunicar o resultado.

---

# 98. Operações do coletor

Após ações como:

```text
aceitar
iniciar
recolher
entregar
concluir
```

o sistema deve atualizar claramente:

```text
status
timeline
ação disponível
feedback
```

---

# 99. Navegação em mobile

Ações principais devem permanecer acessíveis sem exigir múltiplos níveis de menus.

---

# 100. Bottom Navigation

Pode ser utilizada no mobile quando existirem poucas áreas principais.

Exemplo:

```text
Início
Coletas
Notificações
Perfil
```

Não utilizar para dezenas de opções.

---

# 101. Scroll

A página deve permitir:

```text
scroll natural
```

Evitar bloquear o scroll global sem motivo.

---

# 102. Scroll em modais

Se o conteúdo do modal exceder a altura disponível:

```text
modal content
→ scroll
```

O restante da página não deve interferir na leitura do conteúdo.

---

# 103. Sticky Elements

Elementos `sticky` podem ser utilizados para:

```text
header
filtros
ações principais
```

mas não devem ocupar grande parte da viewport.

---

# 104. Sticky no mobile

Ter atenção especial para:

```text
header + browser controls + teclado virtual
```

Não esconder campos ou botões importantes.

---

# 105. Teclado virtual e formulários

Ao abrir o teclado mobile:

```text
input ativo
```

deve permanecer visível.

Evitar layouts fixos que posicionem o campo atrás do teclado.

---

# 106. Safe Areas

Em dispositivos com áreas especiais da tela, considerar:

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

quando necessário.

Especialmente em:

```text
bottom navigation
fixed buttons
mobile drawer
```

---

# 107. Fixed Bottom Actions

Ações fixas na parte inferior devem:

- respeitar safe areas;
- não esconder o conteúdo;
- possuir contraste;
- possuir área de toque adequada.

---

# 108. Orientação do conteúdo

Não esconder conteúdo essencial somente porque o viewport está em landscape.

---

# 109. Imagens responsivas

Imagens devem:

```text
max-width: 100%
height: auto
```

quando apropriado.

---

# 110. Aspect Ratio

Componentes de imagem devem preservar proporções definidas.

Evitar distorções.

---

# 111. Performance mobile

A experiência mobile deve reduzir:

```text
assets desnecessários
animações pesadas
imagens grandes
scripts desnecessários
```

---

# 112. Lazy Loading

Recursos abaixo da primeira viewport podem utilizar carregamento tardio quando apropriado.

Não atrasar conteúdo essencial.

---

# 113. Fontes

Fontes devem ser utilizadas com estratégia para evitar carregamento desnecessariamente pesado.

---

# 114. Motion Performance

Preferir propriedades de animação eficientes.

Evitar animações contínuas de:

```text
width
height
top
left
```

quando alternativas mais eficientes estiverem disponíveis.

---

# 115. Componentes responsivos críticos

Prioridade de validação:

```text
Header
Sidebar
MobileNav
LoginForm
RegistrationForm
CollectionRequestForm
CollectionCard
CollectionTimeline
CollectionActions
CollectorRouteCard
DataTable
Dialog
NotificationCenter
```

---

# 116. Páginas críticas

Testar especialmente:

```text
Login
Cadastro
Dashboard do cliente
Solicitação de coleta
Detalhes da coleta
Dashboard do coletor
Operação de rota
Dashboard administrativo
Gerenciamento de usuários
Gerenciamento de coletas
```

---

# 117. Testes por viewport

Validar pelo menos:

```text
mobile pequeno
mobile grande
tablet
desktop
desktop grande
```

Os tamanhos exatos devem ser definidos na estratégia de testes.

---

# 118. Testes por interação

Cada componente interativo importante deve ser testado com:

```text
mouse
teclado
touch
```

quando aplicável.

---

# 119. Testes com teclado

Checklist mínimo:

```text
[ ] Tab
[ ] Shift + Tab
[ ] Enter
[ ] Space
[ ] Escape
[ ] setas quando aplicável
```

---

# 120. Testes de leitor de tela

Os fluxos principais devem ser avaliados com tecnologia assistiva quando possível.

Prioridade:

```text
login
cadastro
solicitação de coleta
acompanhamento
painel do coletor
```

---

# 121. Testes de zoom

Verificar a interface com diferentes níveis de ampliação.

Validar:

```text
texto
botões
menus
modais
formulários
tabelas
```

---

# 122. Testes de contraste

Validar:

```text
texto
background
botões
links
status
foco
placeholders
```

Não utilizar apenas percepção visual informal quando ferramentas de análise estiverem disponíveis.

---

# 123. Testes de reduced motion

Verificar o comportamento quando:

```text
prefers-reduced-motion: reduce
```

estiver ativo.

---

# 124. Testes de mobile

Verificar:

```text
scroll
teclado
touch
orientação
safe area
overflow
formulários
menus
modais
```

---

# 125. Critério de aceite de responsividade

A aplicação deve permitir que o usuário execute as principais jornadas sem:

```text
quebra de layout
scroll horizontal desnecessário
texto ilegível
botões inacessíveis
conteúdo oculto
sobreposição de componentes
```

---

# 126. Critério de aceite de acessibilidade

Os componentes principais devem:

```text
possuir semântica adequada
ser navegáveis por teclado
possuir foco visível
possuir labels
comunicar estados
possuir contraste apropriado
respeitar reduced motion
```

---

# 127. Não criar acessibilidade apenas visual

Não considerar um componente acessível apenas porque:

```text
"parece acessível"
```

A acessibilidade deve envolver:

```text
visual
teclado
semântica
assistive technology
interação
```

---

# 128. Não criar responsividade por exceções infinitas

Evitar:

```text
@media
@media
@media
@media
```

para corrigir individualmente dezenas de problemas.

Quando isso ocorrer:

```text
reavaliar layout
```

e corrigir a estrutura.

---

# 129. Tokens responsivos

Valores recorrentes devem ser centralizados.

Exemplos:

```text
breakpoints
spacing
font-size
container width
radius
```

---

# 130. Composição responsiva

Preferir componentes que se adaptem naturalmente.

Exemplo:

```text
Card
→ width: 100%
→ max-width conforme contexto
```

em vez de criar:

```text
DesktopCard
MobileCard
```

sem necessidade.

---

# 131. Conteúdo prioritário

Quando espaço for limitado:

```text
1. ação principal
2. informação principal
3. status
4. contexto
5. informações secundárias
```

Essa ordem pode variar conforme a tela.

---

# 132. Progressive Disclosure

Informações secundárias podem ser apresentadas apenas quando necessárias.

Exemplos:

```text
accordion
modal
details
expand
```

Não esconder informações essenciais.

---

# 133. Acessibilidade de estado

Estados como:

```text
loading
success
error
disabled
selected
expanded
collapsed
```

devem possuir representação além de apenas cor.

---

# 134. Acessibilidade de seleção

Elementos selecionados devem possuir:

```text
estado visual
```

e, quando apropriado:

```text
estado semântico
```

---

# 135. Acessibilidade de disabled

Um elemento desabilitado deve:

```text
parecer desabilitado
```

sem reduzir tanto o contraste que fique indistinguível.

Quando a explicação for importante, fornecer contexto adicional.

---

# 136. Componentes com tooltip

Não esconder informações essenciais somente em tooltip.

Tooltips são complementares.

---

# 137. Content Density

A densidade deve ser adequada ao dispositivo.

```text
Mobile
→ menos elementos simultaneamente

Desktop
→ mais informações em paralelo
```

---

# 138. Responsividade da jornada do cliente

A jornada mais importante do cliente deve ser totalmente utilizável em mobile:

```text
Cadastro
↓
Login
↓
Solicitar coleta
↓
Acompanhar coleta
```

---

# 139. Responsividade da jornada do coletor

A jornada operacional deve ser totalmente utilizável em mobile:

```text
Visualizar coleta
↓
Aceitar
↓
Iniciar
↓
Recolher
↓
Entregar
↓
Concluir
```

---

# 140. Responsividade da jornada administrativa

A área administrativa deve ser responsiva, porém pode priorizar produtividade desktop para tarefas densas.

Mesmo assim:

```text
consulta
navegação
visualização básica
```

devem permanecer acessíveis em telas menores.

---

# 141. Regra de fallback

Quando um recurso visual avançado não funcionar adequadamente em determinado dispositivo:

```text
degradar visualmente
```

sem:

```text
quebrar funcionalidade
```

---

# 142. Exemplo

Se um efeito de blur não estiver disponível:

```text
fallback:
surface opaca
```

A funcionalidade continua normal.

---

# 143. Fonte de verdade

Este documento define as regras de:

```text
responsividade
acessibilidade
interação responsiva
layout adaptativo
```

Para componentes:

```text
docs/11_COMPONENTS.md
```

Para linguagem visual:

```text
docs/10_DESIGN_SYSTEM.md
```

Para motion:

```text
docs/15_INTERACTIONS_MOTION.md
```

---

# 144. Regra final

O EcoByte deve ser projetado para funcionar de maneira consistente em diferentes tamanhos de tela e diferentes formas de interação.

Prioridade:

```text
funcionalidade
    ↓
clareza
    ↓
acessibilidade
    ↓
responsividade
    ↓
estética
```

A interface não deve exigir que o usuário:

```text
use mouse
tenha uma tela grande
veja cores específicas
desative zoom
dependa de animações
```

para realizar uma tarefa essencial.

Toda nova funcionalidade deve ser analisada considerando:

```text
mobile
tablet
desktop
teclado
touch
leitor de tela
contraste
reduced motion
```

antes de ser considerada concluída.