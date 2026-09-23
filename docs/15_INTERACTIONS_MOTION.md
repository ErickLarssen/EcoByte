# 15 — INTERACTIONS & MOTION

## 1. Objetivo

Este documento define as diretrizes de interação, animação e motion design do EcoByte.

O objetivo é garantir que as animações:

- reforcem a hierarquia visual;
- comuniquem mudanças de estado;
- forneçam feedback;
- orientem o usuário;
- tornem a experiência mais fluida;
- mantenham consistência em toda a aplicação;
- respeitem acessibilidade;
- não prejudiquem performance.

Motion deve ser utilizado como parte da experiência do produto, e não apenas como decoração.

Este documento deve permanecer alinhado com:

```text
docs/10_DESIGN_SYSTEM.md
docs/11_COMPONENTS.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/13_COLLECTOR_FLOW.md
docs/14_STATE_MACHINE.md
docs/16_ASSETS.md
docs/17_TESTING.md
```

---

# 2. Filosofia de motion

O motion do EcoByte deve transmitir:

```text
fluidez
clareza
eficiência
tecnologia
confiança
```

A animação deve responder a uma pergunta:

```text
"Por que este elemento está se movendo?"
```

Se não houver uma função clara:

```text
não animar
```

---

# 3. Princípios

## IM-001 — Propósito

Toda animação deve possuir um propósito visual ou funcional.

Exemplos válidos:

```text
mostrar entrada de conteúdo
indicar carregamento
confirmar uma ação
indicar mudança de estado
orientar atenção
preservar continuidade espacial
```

---

## IM-002 — Consistência

Animações semelhantes devem possuir comportamento semelhante em toda a aplicação.

---

## IM-003 — Brevidade

Microinterações devem ser rápidas.

Evitar animações longas para ações simples.

---

## IM-004 — Naturalidade

Movimentos devem parecer naturais e previsíveis.

---

## IM-005 — Hierarquia

Elementos importantes podem receber maior destaque.

Não animar tudo com a mesma intensidade.

---

## IM-006 — Não bloquear

Uma animação de interface não deve impedir desnecessariamente uma ação do usuário.

---

## IM-007 — Acessibilidade

Toda animação não essencial deve respeitar:

```text
prefers-reduced-motion
```

---

# 4. Biblioteca principal

A preferência para motion de interface é:

```text
Framer Motion
```

Pode ser utilizado para:

- transições;
- entrada e saída;
- layout;
- microinterações;
- feedback;
- animações de componentes.

---

# 5. GSAP

GSAP pode ser utilizado quando houver necessidade de animações mais complexas.

Exemplos:

```text
hero complexo
timeline avançada
animações coordenadas
efeitos de grande escala
sequências complexas
```

---

# 6. Regra Framer Motion vs GSAP

Preferir:

```text
Framer Motion
```

para motion relacionado diretamente à interface React.

Utilizar:

```text
GSAP
```

quando a complexidade ou controle temporal justificar.

Não utilizar as duas bibliotecas para a mesma animação sem necessidade.

---

# 7. CSS Transitions

CSS pode ser suficiente para microinterações simples.

Exemplos:

```text
hover
focus
background
border
opacity
transform
```

Não utilizar JavaScript para uma interação que possa ser resolvida de maneira simples com CSS.

---

# 8. Hierarquia de animações

A intensidade recomendada é:

```text
Microinteração
    ↓
Transição de componente
    ↓
Transição de página
    ↓
Animação de destaque
    ↓
Hero / sequência complexa
```

Quanto maior a intensidade:

```text
maior deve ser a justificativa
```

---

# 9. Duração

Escala conceitual:

```text
instant
fast
normal
slow
```

Exemplo de referência:

```text
100–150ms
→ microinteração

150–250ms
→ componente

250–400ms
→ transição

400–700ms
→ sequência mais elaborada
```

Os valores finais devem ser centralizados em tokens de motion.

---

# 10. Evitar excesso de duração

Evitar:

```text
animações de 1–2 segundos
```

para interações simples como:

```text
hover
click
focus
dropdown
tooltip
```

---

# 11. Easing

Preferir curvas suaves e previsíveis.

Categorias conceituais:

```text
ease-out
ease-in
ease-in-out
spring
linear
```

---

# 12. Ease-out

Preferido para elementos que entram na interface.

Exemplo:

```text
modal aparecendo
card entrando
menu abrindo
```

Movimento:

```text
rápido
→ desacelera
```

---

# 13. Ease-in

Pode ser utilizado para elementos que saem da interface.

Exemplo:

```text
toast desaparecendo
modal fechando
menu fechando
```

---

# 14. Ease-in-out

Pode ser utilizado em transições equilibradas.

Exemplo:

```text
mudança de layout
movimento espacial
```

---

# 15. Spring

Pode ser utilizado em interações que se beneficiem de uma sensação mais física.

Exemplos:

```text
drawer
modal
cards interativos
elementos que deslizam
```

Evitar springs excessivamente elásticos.

---

# 16. Linear

Reservar principalmente para:

```text
progresso contínuo
spinners
efeitos constantes
```

Não utilizar linear indiscriminadamente em transições de interface.

---

# 17. Transform

Preferir propriedades eficientes para animação:

```text
transform
opacity
```

quando possível.

---

# 18. Opacity

Pode ser utilizado para:

```text
fade in
fade out
feedback
transição
```

Evitar utilizar somente opacity quando isso dificultar a percepção espacial do elemento.

---

# 19. Translate

Pode ser utilizado para:

```text
slide
entradas
saídas
hierarquia
```

Exemplo:

```text
translateY(8px)
→ opacity 0
```

para entrada discreta.

---

# 20. Scale

Scale pode ser utilizada para:

```text
feedback de press
entrada de modal
microinterações
```

Evitar escalas exageradas.

---

# 21. Rotação

Rotação deve ser usada com parcimônia.

Adequada para:

```text
ícones
chevrons
expand/collapse
loading
```

Evitar elementos de conteúdo girando sem função.

---

# 22. Hover

Hover deve oferecer feedback discreto.

Exemplos:

```text
mudança de background
mudança de border
leve elevação
pequeno deslocamento
```

Evitar:

```text
grandes saltos
rotações
escala excessiva
```

---

# 23. Hover não é requisito exclusivo

A interface não deve depender apenas de hover.

No touch:

```text
hover não existe da mesma maneira
```

Portanto, ações importantes precisam continuar claras.

---

# 24. Press

O estado de pressionamento pode utilizar:

```text
scale
opacity
background
```

Exemplo conceitual:

```text
scale: 0.98
```

A resposta deve ser sutil.

---

# 25. Focus

O focus deve ser claramente visível.

A animação pode complementar o foco, mas nunca substituir o indicador visual de foco.

---

# 26. Buttons

Interações de botão podem seguir:

```text
default
    ↓
hover
    ↓
press
    ↓
loading
    ↓
success / error
```

---

# 27. Button loading

Durante uma operação:

```text
Enviar
    ↓
Enviando...
```

Pode existir:

```text
spinner
```

ou:

```text
indicador de progresso
```

---

# 28. Feedback de sucesso

Após ações importantes:

```text
ação
↓
sucesso
```

pode existir:

```text
check icon
toast
status transition
subtle animation
```

---

# 29. Feedback de erro

O erro deve possuir feedback claro.

Pode utilizar:

```text
shake sutil
highlight
toast
mensagem contextual
```

Evitar animações agressivas.

---

# 30. Shake

Shake pode ser utilizado para indicar:

```text
campo inválido
credencial incorreta
ação rejeitada
```

Quando utilizado:

```text
curto
discreto
```

Nunca transformar erro em uma experiência visual exagerada.

---

# 31. Inputs

Inputs podem utilizar transições para:

```text
focus
error
success
disabled
```

Exemplo conceitual:

```text
border-color
box-shadow
```

---

# 32. FormField

Ao exibir um erro:

```text
campo
↓
mensagem de erro
```

A mensagem pode surgir com uma transição curta.

Evitar deslocamentos grandes no formulário.

---

# 33. Validation feedback

A validação deve possuir timing apropriado.

Evitar mostrar uma animação de erro a cada tecla.

Preferir:

```text
blur
submit
ou feedback realmente útil em tempo real
```

conforme o contexto.

---

# 34. Modal

Entrada de modal pode utilizar:

```text
opacity
+
scale pequeno
```

ou:

```text
opacity
+
translateY pequeno
```

---

# 35. Modal — abertura

Exemplo conceitual:

```text
overlay:
opacity 0 → 1

dialog:
opacity 0 → 1
scale 0.98 → 1
```

---

# 36. Modal — fechamento

O fechamento deve ser ligeiramente mais rápido que a abertura quando isso melhorar a percepção de resposta.

---

# 37. Overlay

O overlay deve:

```text
aparecer suavemente
```

e não piscar instantaneamente.

---

# 38. Drawer

Drawer pode utilizar:

```text
translateX
```

ou:

```text
translateY
```

dependendo da orientação.

---

# 39. Mobile Drawer

No mobile, drawer deve possuir transição curta e previsível.

Exemplo:

```text
fora da viewport
↓
entra
↓
posição final
```

---

# 40. Dropdown

Dropdown pode utilizar:

```text
opacity
scale
translateY
```

com duração curta.

---

# 41. Tooltip

Tooltip deve aparecer rapidamente, sem animações longas.

Pode utilizar:

```text
opacity
translateY
```

de pequena amplitude.

---

# 42. Toast

Entrada:

```text
opacity
+
translate
```

Saída:

```text
opacity
+
translate
```

---

# 43. Toast stacking

Quando vários toasts existirem, a entrada/saída deve manter continuidade visual.

Evitar que todos executem animações exageradas simultaneamente.

---

# 44. Page transitions

Transições entre páginas podem utilizar:

```text
fade
fade + translate
```

Somente quando ajudarem na continuidade.

---

# 45. Não bloquear navegação

A transição de página não deve impedir o conteúdo de aparecer por tempo excessivo.

Priorizar:

```text
conteúdo rápido
```

e:

```text
motion como complemento
```

---

# 46. Route transitions

Quando utilizadas:

```text
rota A
    ↓
transição
    ↓
rota B
```

deve ser curta e consistente.

---

# 47. Dashboard

A entrada de um dashboard pode apresentar:

```text
header
cards
listas
```

em sequência.

Porém:

```text
stagger
```

deve ser discreto.

---

# 48. Stagger

Stagger pode ser utilizado para grupos de elementos.

Exemplo:

```text
Card 1
↓
Card 2
↓
Card 3
```

A diferença entre elementos deve ser pequena.

---

# 49. Stagger excessivo

Evitar:

```text
20 cards
```

aparecendo um por um durante vários segundos.

Isso prejudica a percepção de velocidade.

---

# 50. Dashboard metrics

Metric cards podem utilizar animação de entrada:

```text
opacity
translateY
```

O valor numérico pode possuir animação de contagem quando isso acrescentar valor.

---

# 51. Number Counter

Animação de contagem pode ser utilizada para:

```text
total de coletas
usuários
itens
```

mas não deve atrasar o acesso ao valor final.

---

# 52. Counter accessibility

O valor final deve permanecer disponível para leitores de tela e usuários sem motion.

---

# 53. Skeleton

Skeleton deve possuir animação discreta, quando utilizada.

Exemplo:

```text
shimmer
```

O movimento deve ser sutil.

---

# 54. Shimmer

Evitar shimmer:

```text
rápido
intenso
constante em dezenas de elementos
```

---

# 55. Spinner

Spinner pode utilizar:

```text
rotation
```

com movimento contínuo.

---

# 56. Spinner accessibility

Spinner visual deve possuir contexto acessível.

Exemplo:

```text
Carregando...
```

---

# 57. Progress

Indicadores de progresso devem apresentar evolução real.

Não utilizar animação falsa de progresso quando o sistema não possuir essa informação.

---

# 58. Progress bar

A animação de progresso deve corresponder aos dados reais sempre que a porcentagem representar informação de negócio.

---

# 59. Collection status transition

A mudança de status de uma coleta deve possuir feedback visual discreto.

Exemplo:

```text
ACEITA
    ↓
A_CAMINHO
```

A interface pode:

```text
atualizar badge
ativar nova etapa da timeline
alterar ação principal
```

---

# 60. CollectionTimeline

A timeline pode animar:

```text
etapa atual
linha de progresso
ícone
```

---

# 61. Timeline motion

O progresso deve ocorrer na mesma direção da máquina de estados:

```text
PENDENTE
→ ACEITA
→ A_CAMINHO
→ RECOLHIDA
→ ENTREGUE_ECOPONTO
→ CONCLUIDA
```

Não animar progresso regressivo.

---

# 62. Collector Flow

Durante o fluxo do coletor:

```text
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

a animação deve reforçar a sensação de avanço operacional.

---

# 63. Feedback de aceite

Após aceitar uma coleta:

```text
botão
↓
loading
↓
sucesso
↓
card atualizado
```

A coleta pode sair da lista de disponíveis com uma transição.

---

# 64. Feedback de conflito

Se outro coletor assumir primeiro:

```text
409 Conflict
```

A interface deve informar a mudança sem dramatização.

Exemplo:

```text
Esta coleta já foi aceita por outro coletor.
```

---

# 65. Remoção de item da lista

Ao perder uma coleta disponível:

```text
fade out
+
collapse
```

pode ser utilizado.

Evitar que a remoção desloque abruptamente toda a interface.

---

# 66. Adição de item

Quando uma nova coleta aparecer:

```text
fade
+
slide curto
```

pode ser utilizada.

Isso deve acontecer somente quando houver atualização real dos dados.

---

# 67. Empty State transition

Quando uma lista passar de:

```text
com dados
```

para:

```text
sem dados
```

o EmptyState pode aparecer com transição suave.

---

# 68. Error State transition

O estado de erro pode substituir o conteúdo anterior com uma transição discreta.

---

# 69. Loading → Content

Após carregar:

```text
Skeleton
    ↓
Conteúdo
```

Pode utilizar:

```text
fade
```

Evitar uma transição tão longa que atrase a percepção de carregamento concluído.

---

# 70. Loading → Error

Quando houver falha:

```text
Skeleton
    ↓
ErrorState
```

A mudança deve ser clara.

---

# 71. Accordion

Abertura pode utilizar:

```text
height
opacity
```

ou mecanismo equivalente.

Evitar animações artificiais de altura quando houver alternativa eficiente.

---

# 72. Expand/Collapse

Elementos que expandem devem indicar claramente o novo estado.

Exemplo:

```text
chevron
```

pode rotacionar:

```text
0° → 180°
```

---

# 73. Tabs

Trocas entre tabs devem possuir transição curta.

Evitar grandes deslocamentos de conteúdo que dificultem a compreensão.

---

# 74. Sidebar collapse

Ao recolher a sidebar:

```text
largura
```

pode ser animada de maneira suave.

O conteúdo principal deve acompanhar o movimento.

---

# 75. Mobile navigation

Ao abrir menu:

```text
overlay
+
drawer
```

podem ser sincronizados.

---

# 76. Scroll reveal

Elementos podem aparecer conforme entram no viewport.

Uso apropriado:

```text
landing page
seções institucionais
hero
features
```

---

# 77. Scroll reveal no dashboard

Utilizar com moderação.

Dashboards devem priorizar:

```text
conteúdo rápido
```

e não apresentações cinematográficas.

---

# 78. Intersection Observer

Quando necessário, entradas por viewport podem utilizar mecanismos eficientes como:

```text
Intersection Observer
```

em vez de listeners de scroll pesados.

---

# 79. Parallax

Parallax pode ser utilizado na landing page ou hero.

Não é necessário em:

```text
forms
dashboards
tabelas
fluxos operacionais
```

---

# 80. Hero

O hero pode concentrar os efeitos de motion mais expressivos do produto.

Possíveis elementos:

```text
background
gradiente
ilustração
texto
CTA
elementos flutuantes
```

---

# 81. Hero motion

A sequência pode ser:

```text
background
    ↓
visual principal
    ↓
eyebrow
    ↓
headline
    ↓
description
    ↓
CTA
```

O tempo total deve permanecer curto.

---

# 82. Hero não deve bloquear conteúdo

Mesmo que exista uma sequência de entrada:

```text
conteúdo
```

deve permanecer rapidamente disponível.

---

# 83. Background motion

Backgrounds animados devem ser discretos.

Evitar:

```text
movimento constante intenso
```

que concorra com o conteúdo.

---

# 84. Gradients motion

Gradientes animados podem ser utilizados com baixa frequência.

Não animar o background inteiro continuamente sem necessidade.

---

# 85. Blur motion

Alterações de blur devem ser utilizadas com cautela devido ao custo visual e de performance.

---

# 86. Glassmorphism motion

Glassmorphism pode receber:

```text
hover
highlight
opacity
```

mas não deve possuir efeitos exagerados.

---

# 87. Card interaction

Cards interativos podem possuir:

```text
translateY pequeno
shadow
border
```

ao hover.

---

# 88. Card press

No touch, o feedback pode utilizar:

```text
scale pequeno
```

ou:

```text
opacity
```

de maneira sutil.

---

# 89. Card não interativo

Cards puramente informativos não devem necessariamente possuir hover animado.

---

# 90. Links

Links podem utilizar:

```text
color transition
underline transition
```

sem efeitos exagerados.

---

# 91. Icon animation

Ícones podem receber pequenas animações.

Exemplos:

```text
chevron
menu
check
refresh
notification
```

---

# 92. Check animation

Após sucesso:

```text
check
```

pode utilizar uma pequena animação de entrada.

---

# 93. Refresh

Ícone de refresh pode rotacionar enquanto a atualização estiver em andamento.

---

# 94. Notification

Uma nova notificação pode utilizar:

```text
badge update
fade
subtle pulse
```

O pulso deve ser limitado.

---

# 95. Pulse

Pulse pode ser utilizado para chamar atenção para:

```text
novo item
estado ativo
atividade recente
```

Evitar pulse contínuo em múltiplos elementos.

---

# 96. Attention

Elementos importantes devem chamar atenção por:

```text
hierarquia
posição
contraste
```

antes de utilizar animação.

---

# 97. Não usar motion para mascarar falta de hierarquia

Se todos os elementos precisam animar para serem percebidos:

```text
reavaliar design
```

---

# 98. Motion e acessibilidade

Quando:

```text
prefers-reduced-motion: reduce
```

o sistema deve:

```text
remover
ou
reduzir
```

animações não essenciais.

---

# 99. O que não deve ser desativado

Mesmo com reduced motion, manter:

```text
feedback
estado
estrutura
informação
```

A informação não deve desaparecer só porque a animação foi removida.

---

# 100. Reduced Motion por componente

Cada componente animado deve possuir um comportamento apropriado.

Exemplo:

```text
Modal
→ reduzir scale e movimento

Sidebar
→ remover movimento, manter abertura

Timeline
→ mostrar estado final diretamente

Hero
→ reduzir entrada
```

---

# 101. Motion e performance

Evitar animações que provoquem:

```text
layout thrashing
reflow excessivo
CPU/GPU desnecessária
```

---

# 102. Propriedades preferenciais

Priorizar:

```text
transform
opacity
```

quando possível.

---

# 103. Layout animation

Animações que alteram:

```text
width
height
top
left
```

devem ser avaliadas com cuidado.

Utilizar mecanismos apropriados para suavizar layout quando necessário.

---

# 104. Animações contínuas

Animações infinitas devem ser raras.

Exemplos aceitáveis:

```text
spinner
loading
indicador específico
```

---

# 105. Autoplay motion

Evitar iniciar sequências longas automaticamente sempre que o usuário entra na página.

---

# 106. Motion em formulários

A prioridade do formulário é:

```text
preenchimento
```

não animação.

---

# 107. Motion em autenticação

Login e cadastro podem utilizar motion discreto:

```text
fade
slide
input focus
feedback
```

Não utilizar sequências longas.

---

# 108. Motion em solicitação de coleta

A transição entre etapas pode utilizar:

```text
slide
fade
progress
```

A animação deve reforçar a progressão:

```text
Endereço
→ Itens
→ Agendamento
→ Revisão
```

---

# 109. Motion em painel do coletor

A interface operacional deve utilizar motion funcional.

Exemplos:

```text
nova coleta disponível
status atualizado
ação concluída
```

Evitar animações decorativas durante a execução da operação.

---

# 110. Motion em painel administrativo

Priorizar:

```text
dados
gráficos
filtros
tabelas
```

e utilizar motion somente para:

```text
transições
entrada
feedback
```

---

# 111. Chart animation

Gráficos podem animar sua entrada.

Porém:

```text
dados
```

devem continuar claros sem animação.

---

# 112. Chart reduced motion

Com reduced motion:

```text
renderizar estado final
```

sem animação prolongada.

---

# 113. Data updates

Quando uma métrica for atualizada:

```text
valor
```

pode utilizar uma pequena transição.

Não exagerar com contadores contínuos.

---

# 114. Motion e estado real

Uma animação nunca deve representar um estado que o backend ainda não confirmou.

Exemplo:

```text
CONCLUIDA
```

não deve ser mostrado como definitivo antes da confirmação da API.

---

# 115. Optimistic Motion

Quando optimistic UI for utilizada:

```text
estado temporário
```

deve ser reconciliado com o servidor.

Em caso de erro:

```text
reverter
```

---

# 116. Page loading

Não criar uma animação de carregamento longa antes de mostrar conteúdo útil.

---

# 117. Skeleton timing

Skeleton deve aparecer quando:

```text
carregamento
```

for perceptível o suficiente para justificá-lo.

Para operações muito rápidas, pode ser preferível evitar um flash de skeleton.

---

# 118. Delayed Loading Indicator

Uma estratégia possível:

```text
mostrar conteúdo imediatamente se carregamento terminar rápido
```

ou:

```text
mostrar skeleton após pequeno atraso
```

quando isso melhorar a percepção.

A implementação depende da stack.

---

# 119. Motion e notificações

Notificações importantes podem aparecer com:

```text
fade
slide
```

Mas não devem roubar foco ou interromper o fluxo sem necessidade.

---

# 120. Motion e foco

Animação nunca deve fazer o elemento perder foco ou ficar inacessível.

---

# 121. Motion e scroll

Ao abrir conteúdo novo, evitar scroll automático inesperado.

Quando um scroll automático for necessário:

```text
suave
```

pode ser utilizado, mas deve respeitar reduced motion.

---

# 122. Scroll restoration

Ao navegar entre páginas, o comportamento de scroll deve ser previsível.

---

# 123. Não usar smooth scroll globalmente sem necessidade

Nem todo scroll precisa ser:

```text
smooth
```

O comportamento deve ser usado quando melhorar navegação específica.

---

# 124. Anchor links

Links internos podem utilizar scroll suave quando apropriado.

Com reduced motion:

```text
scroll instantâneo
```

ou comportamento equivalente.

---

# 125. Focus após navegação

Quando uma rota mudar, o foco deve permanecer coerente.

Em páginas complexas, pode ser necessário direcionar foco para o conteúdo principal.

---

# 126. Animações sincronizadas

Quando vários elementos fazem parte de uma mesma sequência:

```text
timing
delay
easing
```

devem ser coordenados.

---

# 127. Sequências

Uma sequência pode ser:

```text
background
↓
headline
↓
description
↓
CTA
```

mas o total deve permanecer curto.

---

# 128. Delay

Evitar delays artificiais apenas para "deixar bonito".

Cada delay deve possuir função.

---

# 129. Stagger tokens

Quando houver stagger, utilizar valores consistentes.

Exemplo conceitual:

```text
40ms
60ms
80ms
```

Não criar dezenas de delays diferentes.

---

# 130. Motion tokens

Centralizar tokens de motion.

Estrutura conceitual:

```text
--motion-duration-fast
--motion-duration-normal
--motion-duration-slow

--motion-ease-standard
--motion-ease-emphasized

--motion-distance-sm
--motion-distance-md
```

---

# 131. Motion não deve ser hardcoded repetidamente

Evitar valores arbitrários espalhados:

```text
transition: 173ms
```

em vários arquivos.

Preferir tokens.

---

# 132. Componentes e motion

Componentes reutilizáveis devem encapsular sua animação quando ela fizer parte do comportamento padrão.

Exemplo:

```text
Dialog
```

deve controlar:

```text
open
close
```

sem cada página reinventar o comportamento.

---

# 133. Variantes de motion

Quando necessário, componentes podem receber variantes.

Exemplo:

```text
enter
exit
compact
reduced
```

Evitar APIs de motion excessivamente complexas.

---

# 134. Motion em componentes de domínio

Exemplo:

```text
CollectionTimeline
```

pode possuir animação específica relacionada à progressão do estado.

Porém, a lógica do domínio permanece fora da animação.

---

# 135. Motion não altera domínio

Uma animação não pode:

```text
alterar status
criar coleta
aceitar coleta
concluir operação
```

Motion é apresentação.

---

# 136. Motion e regras de negócio

O fluxo real permanece:

```text
Backend
    ↓
estado confirmado
    ↓
Frontend
    ↓
motion
```

Não:

```text
motion
    ↓
assume estado
```

---

# 137. Testes de motion

Animações importantes devem ser avaliadas para:

```text
visual
performance
reduced motion
acessibilidade
```

---

# 138. Testes sem motion

A interface deve continuar funcional quando as animações forem desativadas.

---

# 139. Testes em mobile

Validar motion em:

```text
mobile
tablet
desktop
```

especialmente:

```text
drawer
modal
forms
timeline
cards
navigation
```

---

# 140. Testes de performance

Observar:

```text
scroll
FPS
layout shifts
CPU/GPU
```

quando houver animações complexas.

---

# 141. Testes com reduced motion

Validar:

```text
prefers-reduced-motion: reduce
```

em:

```text
landing page
modal
drawer
timeline
page transitions
skeleton
charts
```

---

# 142. Critério de aceite

Uma animação será considerada adequada quando:

```text
possui propósito
é breve
é consistente
não atrapalha a tarefa
é acessível
respeita reduced motion
não causa problemas de performance
```

---

# 143. Checklist de microinterações

```text
[ ] Hover
[ ] Focus
[ ] Press
[ ] Loading
[ ] Success
[ ] Error
[ ] Disabled
```

---

# 144. Checklist de transições

```text
[ ] Modal
[ ] Drawer
[ ] Dropdown
[ ] Toast
[ ] Page transition
[ ] Tab
[ ] Accordion
[ ] Sidebar
```

---

# 145. Checklist do fluxo de coleta

```text
[ ] Aceitar
[ ] Iniciar
[ ] Recolher
[ ] Entregar
[ ] Concluir
[ ] Atualizar timeline
[ ] Atualizar badge
[ ] Atualizar ação principal
```

---

# 146. Checklist de acessibilidade

```text
[ ] prefers-reduced-motion
[ ] Foco preservado
[ ] Informação não depende de animação
[ ] Informação não depende de cor
[ ] Loading acessível
[ ] Feedback acessível
```

---

# 147. Checklist de performance

```text
[ ] Preferir transform/opacity
[ ] Evitar layout thrashing
[ ] Evitar animações infinitas
[ ] Evitar blur excessivo
[ ] Evitar filtros pesados
[ ] Testar mobile
[ ] Testar páginas com muitos elementos
```

---

# 148. O que evitar

Evitar:

```text
animação em todos os elementos
stagger excessivo
hover exagerado
scale exagerado
parallax em excesso
blur pesado
backgrounds continuamente animados
transições lentas
delays artificiais
motion sem propósito
```

---

# 149. Anti-pattern

Não fazer:

```text
Página
↓
fade de 2 segundos
↓
headline
↓
delay de 1 segundo
↓
cards
↓
delay de 1 segundo
↓
botão
```

O usuário deve conseguir utilizar o produto rapidamente.

---

# 150. Motion premium

O caráter premium do EcoByte deve vir principalmente de:

```text
timing
hierarquia
consistência
precisão
suavidade
```

e não da quantidade de animações.

---

# 151. Motion e identidade tecnológica

O movimento pode contribuir para a identidade tecnológica através de:

```text
transições precisas
microinterações
progressão de estados
gráficos
interfaces responsivas
```

---

# 152. Motion e sustentabilidade

A dimensão sustentável não exige animações orgânicas ou excessivamente naturais.

A linguagem pode permanecer:

```text
tecnológica
precisa
limpa
eficiente
```

---

# 153. Landing Page vs Dashboard

## Landing Page

Pode utilizar:

```text
mais expressão
hero motion
scroll reveal
parallax limitado
gradientes
```

## Dashboard

Priorizar:

```text
velocidade
clareza
feedback
microinterações
```

---

# 154. Fluxo operacional vs apresentação

Quanto mais operacional for a tela:

```text
menos motion decorativo
```

Quanto mais institucional/apresentacional:

```text
maior liberdade visual
```

---

# 155. Motion da tela do coletor

O painel do coletor deve priorizar:

```text
ação
status
velocidade
clareza
```

A animação não deve atrasar uma operação física.

---

# 156. Motion de confirmação

Após cada operação importante:

```text
request
    ↓
loading
    ↓
success
    ↓
novo estado
```

A transição deve ser perceptível sem ser demorada.

---

# 157. Motion de conflito

Em conflito:

```text
request
    ↓
409
    ↓
feedback
    ↓
sincronização
```

O sistema deve atualizar o estado real.

---

# 158. Motion de sincronização

Quando o frontend precisar atualizar dados após uma ação:

```text
estado anterior
    ↓
request
    ↓
response
    ↓
novo estado
```

A transição deve parecer contínua.

---

# 159. Motion de lista

Quando itens entrarem ou saírem de uma lista:

```text
layout animation
```

pode ser utilizada para reduzir deslocamentos abruptos.

---

# 160. Cuidado com layout animation

Não utilizar layout animation em listas enormes sem avaliar performance.

---

# 161. Motion em tabelas

Tabelas administrativas devem possuir motion mínimo.

Preferir:

```text
fade
highlight
row transition discreta
```

quando necessário.

---

# 162. Highlight de atualização

Quando um registro for atualizado, pode receber destaque temporário.

Exemplo:

```text
linha atualizada
→ highlight breve
→ estado normal
```

Não utilizar highlight permanente.

---

# 163. Motion e leitura

Nunca mover texto importante enquanto o usuário estiver tentando lê-lo.

---

# 164. Content stability

Evitar animações que causem:

```text
layout shift
```

inesperado.

Reservar espaço antes de carregar conteúdos quando necessário.

---

# 165. Motion e imagens

Quando imagens entrarem:

```text
fade
```

pode ser utilizado, desde que não atrase o conteúdo.

---

# 166. Motion e assets

Animações dependentes de assets devem permanecer alinhadas com:

```text
docs/16_ASSETS.md
```

---

# 167. Motion e componentes

Toda animação recorrente deve ser encapsulada no componente apropriado.

Exemplo:

```text
Toast
Dialog
Dropdown
Sidebar
```

Não duplicar animações em páginas diferentes.

---

# 168. Motion e arquitetura

Motion deve permanecer na camada de apresentação.

Fluxo:

```text
Data
↓
Component
↓
Motion
```

Não:

```text
Motion
↓
API
↓
Business Logic
```

---

# 169. Motion e estado do React

O estado necessário para animação pode existir na camada de UI.

Exemplos:

```text
isOpen
isHovered
isPressed
isExpanded
```

Mas o estado de domínio deve vir da aplicação.

---

# 170. Estado de domínio vs estado de animação

Exemplo:

```text
collection.status
```

é estado de domínio.

Enquanto:

```text
isAnimating
```

é estado de apresentação.

Não misturar os dois.

---

# 171. Regra para novas animações

Antes de adicionar uma animação:

```text
1. Qual é o objetivo?
2. É necessária?
3. Existe padrão semelhante?
4. Qual duração?
5. Qual easing?
6. Como funciona em mobile?
7. Como funciona com reduced motion?
8. Qual impacto na performance?
```

---

# 172. Regra para novas bibliotecas

Não adicionar outra biblioteca de animação sem necessidade.

A stack deve permanecer simples.

Preferência:

```text
CSS
↓
Framer Motion
↓
GSAP
```

utilizando o menor nível suficiente para resolver o problema.

---

# 173. Documentação

Quando uma nova animação se tornar padrão:

```text
documentar
```

em:

```text
docs/15_INTERACTIONS_MOTION.md
```

---

# 174. Fonte de verdade

Este documento é a fonte de verdade para:

```text
motion
animações
transições
microinterações
easing
duração
comportamento de movimento
```

A linguagem visual geral permanece em:

```text
docs/10_DESIGN_SYSTEM.md
```

---

# 175. Regra final

O motion do EcoByte deve seguir:

```text
Propósito
    ↓
Consistência
    ↓
Precisão
    ↓
Suavidade
    ↓
Performance
    ↓
Acessibilidade
```

A animação deve servir à interface.

Nunca o contrário.

Uma experiência premium não é aquela que mais se move, mas aquela em que cada movimento parece:

```text
natural
intencional
rápido
útil
```

e contribui para que o usuário compreenda o sistema com menos esforço.