# 10 — DESIGN SYSTEM

## 1. Objetivo

Este documento define o Design System do EcoByte.

O objetivo é estabelecer uma linguagem visual consistente para:

- Interface pública
- Autenticação
- Cadastro
- Painel do cliente
- Painel do coletor
- Painel administrativo
- Formulários
- Cards
- Tabelas
- Modais
- Notificações
- Feedbacks
- Estados de carregamento
- Responsividade
- Acessibilidade
- Microinterações

O Design System deve ser utilizado como referência antes da criação de novos componentes.

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/04_REQUIREMENTS.md
docs/11_COMPONENTS.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/15_INTERACTIONS_MOTION.md
docs/16_ASSETS.md
```

---

# 2. Direção visual

A identidade visual do EcoByte deve transmitir:

```text
tecnologia
sustentabilidade
confiabilidade
clareza
modernidade
eficiência
```

A interface deve possuir aparência:

```text
premium
sofisticada
moderna
limpa
profissional
tecnológica
```

A estética não deve depender de excesso de efeitos.

---

# 3. Princípios visuais

## DS-001 — Clareza

A interface deve priorizar compreensão rápida.

Elementos importantes devem possuir:

```text
hierarquia visual clara
espaçamento adequado
contraste suficiente
textos objetivos
```

---

## DS-002 — Consistência

Componentes equivalentes devem possuir aparência e comportamento equivalentes em todo o sistema.

Não criar versões visualmente diferentes do mesmo componente sem justificativa.

---

## DS-003 — Hierarquia

A interface deve apresentar uma hierarquia visual perceptível entre:

```text
Título
    ↓
Subtítulo
    ↓
Conteúdo
    ↓
Informações secundárias
```

---

## DS-004 — Sofisticação controlada

Efeitos como:

```text
gradientes
blur
glassmorphism
sombras
animações
```

podem ser utilizados, mas com moderação.

Não utilizar glassmorphism em todos os elementos apenas por aparência.

---

## DS-005 — Funcionalidade

Elementos decorativos nunca devem prejudicar:

```text
legibilidade
acessibilidade
performance
usabilidade
```

---

# 4. Personalidade visual

O EcoByte deve combinar:

```text
Tecnologia
+
Sustentabilidade
+
Operação logística
```

A interface deve evitar dois extremos:

```text
tecnologia excessivamente futurista
```

e:

```text
identidade ambiental excessivamente orgânica
```

O resultado deve comunicar uma plataforma tecnológica real de gestão e coleta.

---

# 5. Paleta de cores

A paleta utiliza como base:

```text
Azul profundo
Verde sustentável
Branco
Cinza
Grafite
```

Os valores exatos devem permanecer centralizados em tokens de design e não espalhados pelo código.

---

# 6. Tokens de cor

Estrutura recomendada:

```text
--color-primary
--color-primary-hover
--color-primary-active

--color-secondary
--color-secondary-hover
--color-secondary-active

--color-success
--color-warning
--color-error
--color-info

--color-background
--color-surface
--color-surface-muted

--color-text-primary
--color-text-secondary
--color-text-muted
--color-text-inverse

--color-border
--color-border-strong
```

---

# 7. Cor primária

A cor primária representa a identidade tecnológica principal do produto.

Uso:

```text
CTAs principais
links importantes
foco
elementos selecionados
indicadores ativos
ações principais
```

A cor primária não deve ser aplicada indiscriminadamente em grandes áreas da interface.

---

# 8. Cor secundária

A cor secundária deve representar a dimensão sustentável do EcoByte.

Uso:

```text
destaques ambientais
status positivos relacionados à sustentabilidade
elementos de apoio
gráficos
badges
ícones
```

---

# 9. Estados semânticos

As cores semânticas devem possuir significado consistente.

```text
SUCCESS → operação concluída
WARNING → atenção
ERROR   → erro ou operação crítica
INFO    → informação
```

Não utilizar cores semânticas apenas como decoração.

---

# 10. Background

A interface pode utilizar diferentes níveis de superfície:

```text
background principal
surface
surface elevada
surface secundária
```

Hierarquia conceitual:

```text
Background
    ↓
Surface
    ↓
Card
    ↓
Elemento interativo
```

---

# 11. Texto

Hierarquia:

```text
Text Primary
Text Secondary
Text Muted
Text Inverse
```

### Primary

Informações principais.

### Secondary

Informações de apoio.

### Muted

Metadados e textos menos importantes.

### Inverse

Texto utilizado sobre superfícies escuras ou preenchidas.

---

# 12. Contraste

A combinação entre fundo e texto deve permanecer legível.

Priorizar contraste adequado para:

```text
textos
botões
inputs
links
badges
ícones funcionais
```

Nunca comunicar uma informação importante somente através da cor.

---

# 13. Tipografia

A tipografia deve transmitir:

```text
modernidade
clareza
profissionalismo
tecnologia
```

Preferir uma família sans-serif moderna.

A família definitiva deve ser centralizada em tokens/configuração do projeto.

Não utilizar diversas famílias tipográficas simultaneamente.

---

# 14. Escala tipográfica

Utilizar uma escala consistente.

Exemplo conceitual:

```text
text-xs
text-sm
text-base
text-lg
text-xl
text-2xl
text-3xl
text-4xl
text-5xl
```

Aplicação sugerida:

```text
xs  → metadados
sm  → textos auxiliares
base → conteúdo
lg  → destaque
xl+ → títulos
```

---

# 15. Hierarquia de títulos

Estrutura sugerida:

```text
Display
H1
H2
H3
H4
Body
Caption
Label
```

Não utilizar tamanho grande apenas para criar impacto visual.

A hierarquia deve refletir a importância do conteúdo.

---

# 16. Peso tipográfico

Utilizar pesos com propósito.

Exemplo:

```text
400 → regular
500 → medium
600 → semibold
700 → bold
```

Evitar utilizar:

```text
800+
```

constantemente.

---

# 17. Espaçamento

A interface deve utilizar uma escala de espaçamento consistente.

Exemplo:

```text
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
96px
```

Os valores devem ser tratados como tokens.

---

# 18. Regra de espaçamento

Priorizar:

```text
consistência
```

em vez de escolher valores arbitrários para cada componente.

---

# 19. Grid

A interface deve utilizar layout baseado em grid.

Desktop pode utilizar:

```text
12 colunas
```

quando apropriado.

Mobile deve simplificar a estrutura para evitar conteúdo comprimido.

---

# 20. Container

O conteúdo deve possuir largura máxima adequada.

Estrutura conceitual:

```text
Viewport
└── Container
    ├── Header
    ├── Content
    └── Footer
```

Evitar conteúdo encostado nas bordas da tela.

---

# 21. Border Radius

A identidade pode utilizar cantos suavemente arredondados.

Escala conceitual:

```text
sm
md
lg
xl
full
```

Uso recomendado:

```text
sm → inputs menores
md → botões
lg → cards
xl → elementos destacados
full → badges / pills
```

Evitar excesso de formas completamente arredondadas.

---

# 22. Bordas

Bordas devem ser discretas.

Uso:

```text
inputs
cards
tabelas
divisores
containers
```

Não utilizar bordas fortes em todos os elementos.

---

# 23. Sombras

As sombras devem comunicar elevação.

Escala conceitual:

```text
shadow-sm
shadow-md
shadow-lg
shadow-xl
```

Uso:

```text
sm → elementos discretamente elevados
md → cards
lg → dropdowns
xl → modais
```

Evitar sombras excessivamente pesadas.

---

# 24. Glassmorphism

Glassmorphism pode ser utilizado em elementos específicos:

```text
hero
overlays
cards destacados
navegação
elementos decorativos
```

Não utilizar como padrão global.

Evitar:

```text
blur excessivo
transparência excessiva
baixo contraste
```

---

# 25. Gradientes

Gradientes podem ser utilizados para reforçar a identidade visual.

Uso recomendado:

```text
hero
backgrounds especiais
CTAs destacados
elementos decorativos
gráficos
```

Evitar aplicar gradientes em:

```text
todos os botões
todos os cards
todo texto
```

---

# 26. Ícones

Biblioteca preferencial:

```text
Lucide React
```

Os ícones devem:

- possuir estilo consistente;
- utilizar tamanhos coerentes;
- comunicar função;
- não substituir textos importantes quando o significado não for óbvio.

---

# 27. Tamanhos de ícones

Escala sugerida:

```text
16px
18px
20px
24px
32px
```

Uso:

```text
16px → ações compactas
18px → inputs
20px → botões
24px → navegação
32px → destaque
```

---

# 28. Botões

Tipos principais:

```text
Primary
Secondary
Ghost
Outline
Destructive
Link
```

---

# 29. Primary Button

Utilizado para a principal ação da interface.

Exemplos:

```text
Solicitar coleta
Entrar
Cadastrar
Salvar
Confirmar
```

Uma área não deve possuir diversos CTAs concorrendo pela mesma prioridade.

---

# 30. Secondary Button

Utilizado para ações importantes, porém secundárias.

Exemplo:

```text
Cancelar
Voltar
Editar
Ver detalhes
```

---

# 31. Destructive Button

Utilizado em ações potencialmente destrutivas.

Exemplo:

```text
Desativar usuário
```

Deve possuir confirmação quando a operação possuir impacto significativo.

---

# 32. Botão desabilitado

O estado `disabled` deve ser visualmente distinguível.

Não depender somente de redução extrema de opacidade.

O componente deve comunicar:

```text
não disponível
```

sem parecer um erro.

---

# 33. Loading em botões

Durante uma operação assíncrona:

```text
button
    ↓
loading
```

O usuário deve receber feedback visual.

Exemplo:

```text
Enviando...
```

O botão pode ser temporariamente desabilitado para evitar duplicidade.

---

# 34. Inputs

Inputs devem possuir:

```text
label
campo
placeholder quando necessário
helper text quando necessário
estado de erro
estado de sucesso quando relevante
```

---

# 35. Labels

Labels devem possuir identificação clara.

Não utilizar placeholder como substituto permanente do label.

---

# 36. Estados dos inputs

Estados:

```text
default
hover
focus
filled
disabled
error
```

---

# 37. Focus

Elementos interativos devem possuir estado de foco claramente perceptível.

Nunca remover o outline sem fornecer alternativa equivalente.

---

# 38. Mensagens de erro

Mensagens de erro devem:

```text
explicar o problema
```

e, quando possível:

```text
orientar a correção
```

Exemplo:

```text
A senha deve possuir pelo menos 8 caracteres.
```

---

# 39. Formulários

Formulários complexos devem possuir estrutura visual clara.

Exemplo:

```text
Informações pessoais
        ↓
Endereço
        ↓
Itens de descarte
        ↓
Agendamento
        ↓
Confirmação
```

---

# 40. Cadastro

O fluxo de cadastro deve distinguir:

```text
Pessoa Física
Pessoa Jurídica
```

quando aplicável.

Os campos devem aparecer de acordo com:

```text
tipo_cadastro
```

---

# 41. Validação de senha

O campo de senha pode apresentar requisitos visualmente.

Exemplo:

```text
✓ 8 caracteres
✓ letra maiúscula
✓ letra minúscula
✓ número
✓ caractere especial
```

O componente deve fornecer feedback sem expor informações sensíveis.

---

# 42. Cards

Cards devem possuir função clara.

Estrutura possível:

```text
┌──────────────────────────────┐
│ ícone / badge                │
│ Título                       │
│ Informação principal         │
│ Informação secundária        │
│                              │
│ Ação                         │
└──────────────────────────────┘
```

---

# 43. Cards de métricas

Podem ser utilizados no dashboard administrativo.

Exemplos:

```text
Total de coletas
Coletas pendentes
Coletas em andamento
Coletas concluídas
```

A métrica deve possuir:

```text
valor
título
contexto
```

quando necessário.

---

# 44. Status badges

Status devem utilizar componentes visuais consistentes.

Exemplo:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 45. Cores dos status

As cores dos status devem ser semânticas e consistentes.

Exemplo conceitual:

```text
PENDENTE            → atenção
ACEITA              → informação
A_CAMINHO           → informação
RECOLHIDA           → positivo
ENTREGUE_ECOPONTO   → positivo
CONCLUIDA           → sucesso
```

A combinação final deve permanecer acessível e não depender somente da cor.

---

# 46. Status do usuário

Também utilizar componentes consistentes para:

```text
ATIVO
INATIVO
```

---

# 47. Tabelas

Tabelas devem ser utilizadas quando a comparação entre registros for importante.

Exemplo:

```text
Usuários
Coletas
Relatórios
```

---

# 48. Estrutura de tabela

```text
Header
Rows
Pagination
Empty state
Loading state
Error state
```

---

# 49. Tabela responsiva

Em telas pequenas, não forçar tabelas largas.

Alternativas:

```text
scroll horizontal
cards
lista adaptada
colunas prioritárias
```

A solução deve depender do contexto.

---

# 50. Modal

Modais devem ser utilizados para:

```text
confirmação
edição contextual
detalhes
ações importantes
```

Não utilizar modal para fluxos longos quando uma página dedicada for mais adequada.

---

# 51. Confirmações destrutivas

Ações como:

```text
desativar usuário
```

devem solicitar confirmação quando houver impacto relevante.

A confirmação deve explicar:

```text
ação
consequência
opções
```

---

# 52. Toast / Feedback

Utilizar feedback temporário para operações como:

```text
salvo com sucesso
coleta aceita
dados atualizados
erro de comunicação
```

O feedback não deve ser a única forma de comunicar um erro crítico.

---

# 53. Alertas

Alertas persistentes são apropriados quando a informação precisa permanecer visível.

Exemplo:

```text
sistema temporariamente indisponível
```

---

# 54. Empty States

Quando não houver dados, a interface deve explicar o estado.

Exemplo:

```text
Nenhuma coleta encontrada.
```

Pode existir:

```text
ícone
mensagem
ação relacionada
```

quando apropriado.

---

# 55. Loading States

O sistema deve possuir estados de carregamento para operações assíncronas.

Possibilidades:

```text
spinner
skeleton
progress indicator
```

A solução deve depender do componente.

---

# 56. Skeleton

Skeleton é preferível quando o layout final puder ser antecipado.

Exemplo:

```text
Card loading
Table loading
Dashboard loading
```

---

# 57. Erro de carregamento

Quando uma consulta falhar, mostrar estado apropriado.

Exemplo:

```text
Não foi possível carregar as coletas.
Tente novamente.
```

A interface pode apresentar:

```text
Retry
```

quando apropriado.

---

# 58. Navegação

A navegação deve possuir estrutura previsível.

Cliente:

```text
Dashboard
Minhas coletas
Solicitar coleta
Ecoponto
Notificações
Perfil
```

Coletor:

```text
Dashboard
Coletas disponíveis
Minhas coletas
Rotas
Notificações
Perfil
```

Administrador:

```text
Dashboard
Usuários
Coletas
Ecoponto
Relatórios
Perfil
```

As rotas reais devem permanecer alinhadas ao produto implementado.

---

# 59. Sidebar

Dashboards podem utilizar sidebar em desktop.

A sidebar deve:

- destacar a página atual;
- possuir ícones consistentes;
- permitir colapso quando fizer sentido;
- não ocupar espaço excessivo.

---

# 60. Header

O header pode conter:

```text
logo
nome da área
notificações
perfil
ações globais
```

Não sobrecarregar o header com ações secundárias.

---

# 61. Logo

A logo do EcoByte deve manter suas proporções.

Não:

```text
deformar
esticar
comprimir
```

---

# 62. Identidade da marca

A identidade visual deve permanecer consistente entre:

```text
landing page
login
cadastro
dashboard
painel do coletor
painel administrativo
```

A intensidade visual pode variar conforme o contexto, mas a linguagem deve permanecer reconhecível.

---

# 63. Landing Page

A landing page pode possuir uma linguagem visual mais expressiva.

Pode utilizar:

```text
hero
gradientes
fotografia
ilustração
motion
cards
estatísticas
```

O conteúdo deve continuar claro e orientado à ação.

---

# 64. Área autenticada

A área autenticada deve priorizar:

```text
clareza
densidade adequada
produtividade
leitura rápida
```

Evitar excesso de:

```text
gradientes
glassmorphism
animações decorativas
```

---

# 65. Dashboard do cliente

Prioridades:

```text
solicitar coleta
acompanhar coleta
visualizar status
consultar histórico
```

A principal ação deve ser facilmente identificável.

---

# 66. Dashboard do coletor

Prioridades:

```text
coletas disponíveis
rotas
coletas atribuídas
próxima ação operacional
status atual
```

O layout deve favorecer uso rápido, inclusive em dispositivos móveis.

---

# 67. Dashboard administrativo

Prioridades:

```text
visão geral
usuários
coletas
status operacionais
relatórios
```

Pode utilizar:

```text
cards
gráficos
tabelas
filtros
```

---

# 68. Fluxo de solicitação de coleta

O fluxo deve ser simples e progressivo.

Estrutura conceitual:

```text
1. Endereço
       ↓
2. Itens
       ↓
3. Agendamento
       ↓
4. Revisão
       ↓
5. Confirmação
```

O fluxo final deve refletir os requisitos definitivos.

---

# 69. Mobile First

A interface deve ser projetada primeiro considerando telas pequenas.

Priorizar:

```text
conteúdo essencial
áreas de toque
formulários
ações principais
navegação simples
```

---

# 70. Touch Targets

Elementos interativos devem possuir área de toque confortável.

Priorizar tamanho suficiente para:

```text
botões
links
ícones clicáveis
checkboxes
inputs
```

Não depender de elementos minúsculos em dispositivos móveis.

---

# 71. Breakpoints

Os breakpoints devem ser tratados como tokens/configuração central.

Exemplo conceitual:

```text
sm
md
lg
xl
2xl
```

Não espalhar valores arbitrários pelo código.

---

# 72. Responsividade de layout

O sistema deve adaptar:

```text
grid
flex
sidebar
navigation
cards
tables
forms
modals
```

conforme a largura disponível.

---

# 73. Motion Design

As animações devem:

```text
orientar
confirmar
hierarquizar
dar feedback
```

Não devem existir apenas para ornamentação.

---

# 74. Princípios de animação

Priorizar:

```text
rápida
suave
intencional
consistente
```

Evitar:

```text
animações longas
movimentos excessivos
efeitos constantes
```

---

# 75. Microinterações

Podem existir microinterações em:

```text
hover
focus
press
loading
success
error
navigation
```

---

# 76. Hover

Hover deve ser tratado como comportamento adicional, não como requisito exclusivo.

Toda ação importante deve continuar compreensível em touch.

---

# 77. Motion com respeito ao usuário

A aplicação deve considerar:

```text
prefers-reduced-motion
```

Quando solicitado pelo sistema operacional, reduzir ou desativar animações não essenciais.

---

# 78. Ícones com texto

Quando o significado de um ícone não for universalmente claro, utilizar texto de apoio.

Evitar interfaces compostas exclusivamente por ícones sem contexto.

---

# 79. Acessibilidade

O Design System deve considerar:

```text
contraste
foco
semântica
teclado
labels
feedback
redução de movimento
```

As regras detalhadas devem permanecer em:

```text
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
```

---

# 80. Estados de componentes

Todo componente interativo relevante deve considerar:

```text
default
hover
focus
active
disabled
loading
error
success
```

Nem todo componente necessariamente utilizará todos os estados.

---

# 81. Componentes reutilizáveis

Os componentes devem ser construídos para reutilização.

Exemplos:

```text
Button
Input
Select
Checkbox
Textarea
Card
Badge
Modal
Dialog
Toast
Spinner
Skeleton
Table
Pagination
Dropdown
Tabs
Sidebar
Header
```

A especificação detalhada deve permanecer em:

```text
docs/11_COMPONENTS.md
```

---

# 82. Tokens

Valores visuais importantes devem ser centralizados.

Categorias:

```text
colors
spacing
typography
radius
shadows
breakpoints
z-index
motion
```

---

# 83. Tokens não devem ser duplicados

Evitar:

```css
padding: 17px;
```

em dezenas de componentes quando existir um token apropriado.

Preferir:

```text
spacing token
```

---

# 84. Z-Index

Utilizar uma escala controlada.

Exemplo conceitual:

```text
base
dropdown
sticky
overlay
modal
toast
```

Não criar números arbitrários como:

```text
z-index: 999999
```

sem necessidade.

---

# 85. Formatação de números

Números exibidos ao usuário devem seguir uma apresentação consistente.

Exemplo:

```text
1.250
```

quando a localização brasileira estiver sendo utilizada.

A formatação deve ser centralizada quando utilizada em diversos componentes.

---

# 86. Datas

Datas devem ser exibidas de maneira compreensível para o usuário.

Exemplo:

```text
10/10/2026
```

ou:

```text
10 out. 2026
```

conforme o contexto.

A representação interna da API pode continuar utilizando ISO 8601.

---

# 87. Status com texto

Nunca comunicar status importante somente por cor.

Preferir:

```text
badge colorido
+
texto
```

Exemplo:

```text
● PENDENTE
```

---

# 88. Feedback positivo

Operações bem-sucedidas devem possuir feedback adequado.

Exemplo:

```text
Coleta aceita com sucesso.
```

---

# 89. Feedback negativo

Erros devem ser claros, mas não alarmistas.

Exemplo:

```text
Não foi possível aceitar esta coleta.
Ela pode já ter sido assumida por outro coletor.
```

---

# 90. Conteúdo

A linguagem da interface deve ser:

```text
clara
direta
profissional
humana
```

Evitar mensagens excessivamente técnicas para o usuário final.

---

# 91. Linguagem técnica

Termos técnicos podem aparecer quando fizerem parte do contexto operacional.

Por exemplo:

```text
status
coleta
ecoponto
rota
```

não devem ser substituídos por termos artificiais apenas para evitar linguagem técnica.

---

# 92. Consistência de nomenclatura

Utilizar sempre os mesmos termos.

Preferir:

```text
coleta
coletor
ecoponto
cliente
administrador
```

Evitar alternar arbitrariamente entre:

```text
pedido
solicitação
requisição
ordem
```

quando estiverem representando a mesma entidade.

---

# 93. Design de formulários

Campos relacionados devem permanecer agrupados.

Exemplo:

```text
Dados pessoais
───────────────
Nome
E-mail
Telefone
Documento

Endereço
─────────
CEP
Logradouro
Número
Complemento
Bairro
Cidade
Estado
```

---

# 94. Divulgação de erros

Erros devem aparecer próximos ao contexto responsável.

Exemplo:

```text
Senha
[________________]

A senha deve possuir pelo menos 8 caracteres.
```

Evitar mostrar somente um erro genérico no topo quando o problema estiver em um campo específico.

---

# 95. Confirmação de ações

Ações relevantes devem oferecer feedback imediato e compreensível.

Exemplo:

```text
Aceitar coleta
      ↓
Processando...
      ↓
Coleta aceita
```

---

# 96. Destructive Actions

Ações como:

```text
desativar
remover
encerrar
```

devem ser visualmente diferenciadas.

O uso de vermelho deve ser reservado para ações realmente destrutivas ou estados de erro.

---

# 97. Empty State de coletas

Exemplo:

```text
Nenhuma coleta encontrada.

Quando houver uma solicitação,
ela aparecerá nesta área.
```

Quando existir uma ação relevante:

```text
Solicitar coleta
```

pode ser apresentada.

---

# 98. Empty State do coletor

Quando não houver coletas disponíveis:

```text
Nenhuma coleta disponível no momento.
```

Evitar sugerir que houve erro quando simplesmente não existem registros.

---

# 99. Empty State administrativo

Quando não houver resultados de pesquisa:

```text
Nenhum registro encontrado.
```

Pode oferecer:

```text
Limpar filtros
```

quando apropriado.

---

# 100. Error State global

Se o backend estiver indisponível:

```text
Não foi possível conectar ao servidor.
Tente novamente.
```

Não mostrar:

```text
ECONNREFUSED
MongoServerError
500 Internal Server Error
```

diretamente ao usuário final.

---

# 101. Loading global

Operações rápidas podem utilizar:

```text
spinner
```

Operações que carregam estruturas maiores podem utilizar:

```text
skeleton
```

---

# 102. Performance visual

Evitar efeitos custosos em excesso.

Especialmente:

```text
blur intenso
sombras gigantes
animações contínuas
filtros pesados
```

A aparência premium não deve prejudicar a performance.

---

# 103. Imagens

Imagens utilizadas na interface devem:

- possuir propósito;
- ser otimizadas;
- respeitar proporções;
- possuir `alt` quando necessário;
- não causar layout shift significativo.

---

# 104. Ilustrações

Ilustrações devem seguir a mesma linguagem visual.

Evitar misturar estilos incompatíveis como:

```text
3D hiper-realista
flat illustration
hand-drawn
neon cyberpunk
```

sem uma decisão visual intencional.

---

# 105. Sustentabilidade na interface

A dimensão ambiental pode aparecer através de:

```text
cores
ícones
ilustrações
microcopy
gráficos
dados sobre descarte
```

Mas não deve transformar a interface inteira em uma estética exclusivamente "verde".

O produto continua sendo uma plataforma tecnológica.

---

# 106. Tecnologia na interface

A dimensão tecnológica pode aparecer através de:

```text
layout
tipografia
motion
cards
dados
gráficos
gradientes
```

Sem transformar a interface em uma estética excessivamente futurista.

---

# 107. Equilíbrio visual

A linguagem principal do EcoByte pode ser resumida como:

```text
Tecnologia confiável
+
Sustentabilidade
+
Operação eficiente
```

---

# 108. Regra para novos componentes

Antes de criar um novo componente, verificar:

```text
Já existe componente semelhante?
```

Se existir:

```text
reutilizar
```

Se não existir:

```text
avaliar necessidade
definir estados
definir responsividade
definir acessibilidade
documentar
implementar
```

---

# 109. Regra contra componentes duplicados

Evitar criar:

```text
PrimaryButton
MainButton
ActionButton
SubmitButton
```

quando todos representam essencialmente o mesmo componente.

Preferir um componente configurável:

```text
Button
```

com variantes.

---

# 110. Variantes

Componentes devem utilizar variantes quando houver diferenças legítimas.

Exemplo:

```text
Button
├── primary
├── secondary
├── outline
├── ghost
└── destructive
```

---

# 111. Composição

Preferir composição de componentes reutilizáveis.

Exemplo:

```text
Card
├── CardHeader
├── CardContent
└── CardFooter
```

---

# 112. Consistência entre perfis

Cliente, coletor e administrador podem possuir layouts diferentes.

Porém:

```text
cores
tipografia
inputs
botões
badges
feedbacks
ícones
```

devem continuar pertencendo à mesma linguagem visual.

---

# 113. Densidade

A densidade visual deve variar conforme o contexto.

```text
Landing Page
→ menor densidade

Dashboard
→ densidade média

Tabela administrativa
→ maior densidade
```

---

# 114. Mobile

No mobile, priorizar:

```text
ação principal
informação principal
navegação
status
```

Informações secundárias podem ser recolhidas, agrupadas ou apresentadas em telas adicionais.

---

# 115. Desktop

No desktop, aproveitar o espaço adicional para:

```text
sidebars
cards
colunas
tabelas
gráficos
informações auxiliares
```

sem criar espaços vazios excessivos.

---

# 116. Consistência de espaçamento

Componentes próximos devem possuir relações espaciais previsíveis.

Exemplo:

```text
label
↓
8px
input
↓
16px
próximo campo
```

Os valores definitivos devem seguir os tokens do projeto.

---

# 117. Sistema de cores semânticas

As cores devem possuir significado consistente.

Exemplo:

```text
Primary
→ ação principal

Success
→ concluído / sucesso

Warning
→ atenção / pendência

Error
→ erro / ação destrutiva

Info
→ informação
```

---

# 118. Não usar cor arbitrariamente

Não utilizar:

```text
azul
verde
amarelo
vermelho
```

somente porque "fica bonito".

Toda cor aplicada a um elemento funcional deve possuir propósito.

---

# 119. Dark Mode

O modo escuro pode ser considerado futuramente.

Caso implementado:

```text
não inverter cores mecanicamente
```

Criar tokens específicos para:

```text
background
surface
text
border
status
```

A implementação não deve ser iniciada sem requisito ou decisão explícita.

---

# 120. Themes

Valores visuais devem permitir evolução para temas sem exigir alteração de centenas de componentes.

Preferir:

```text
tokens
CSS variables
theme configuration
```

---

# 121. Stack visual preferencial

A direção visual pode utilizar:

```text
Tailwind CSS
Lucide React
Shadcn UI
```

conforme a stack definitiva do projeto.

Essas ferramentas devem servir ao Design System, e não substituí-lo.

---

# 122. Shadcn UI

Quando Shadcn UI for utilizado, seus componentes devem ser adaptados à identidade do EcoByte.

Não utilizar os estilos padrão sem personalização quando eles não estiverem alinhados ao produto.

---

# 123. Tailwind CSS

Classes Tailwind devem preferencialmente utilizar os tokens definidos pelo sistema.

Evitar valores arbitrários repetidos.

Exemplo a evitar:

```text
p-[17px]
text-[#123456]
rounded-[13px]
```

quando já existir token equivalente.

---

# 124. Lucide React

Os ícones devem possuir:

```text
stroke
peso
tamanho
alinhamento
```

consistentes.

---

# 125. Estados de foco

Elementos como:

```text
button
input
select
textarea
a
checkbox
```

devem possuir estado de foco perceptível.

---

# 126. Navegação por teclado

A ordem de foco deve acompanhar a ordem lógica do conteúdo.

Evitar componentes que prendam o foco de maneira incorreta.

Modais devem implementar gerenciamento adequado de foco.

---

# 127. Modal acessível

Um modal deve:

```text
possuir título
possuir descrição quando necessário
permitir fechamento adequado
tratar foco
responder a teclado
```

---

# 128. Toast acessível

Toasts importantes devem utilizar mecanismos apropriados para comunicação de status.

Não depender exclusivamente de animação ou cor.

---

# 129. Formulários acessíveis

Cada campo deve possuir:

```text
label associado
descrição quando necessário
mensagem de erro associada
```

---

# 130. Componentes com loading

Enquanto uma operação estiver em andamento, o componente deve comunicar:

```text
processamento em curso
```

Não deixar o usuário sem feedback.

---

# 131. Prevenção de ações duplicadas

Ações assíncronas críticas podem bloquear temporariamente o botão enquanto estão sendo processadas.

Exemplo:

```text
Aceitar coleta
       ↓
Aceitando...
       ↓
Coleta aceita
```

O backend continua responsável por proteger a operação contra concorrência.

---

# 132. Consistência com API

A interface deve refletir os estados reais retornados pelo backend.

Não criar um estado visual inexistente na máquina oficial.

---

# 133. Status oficiais

A interface deve reconhecer somente:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 134. Fonte de verdade

Este documento representa a fonte de verdade visual do EcoByte.

Em caso de dúvida sobre:

```text
cores
tipografia
espaçamento
componentes
hierarquia
estados
feedback visual
```

consultar este documento antes de criar uma solução nova.

---

# 135. Documentação complementar

Este documento deve ser utilizado em conjunto com:

```text
docs/11_COMPONENTS.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/15_INTERACTIONS_MOTION.md
docs/16_ASSETS.md
```

---

# 136. Regra final

O Design System do EcoByte deve produzir uma interface:

```text
consistente
clara
premium
moderna
tecnológica
sustentável
acessível
responsiva
performática
```

A estética nunca deve ser priorizada em detrimento de:

```text
usabilidade
clareza
acessibilidade
performance
consistência
```

Toda nova decisão visual relevante deve ser incorporada ao Design System antes de ser replicada em múltiplas partes da aplicação.