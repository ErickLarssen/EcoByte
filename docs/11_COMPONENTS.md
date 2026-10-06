# 11 — COMPONENTS

## 1. Objetivo

Este documento define a arquitetura, responsabilidades, variantes, estados e regras dos componentes visuais do EcoByte.

O objetivo é garantir:

- reutilização;
- consistência visual;
- previsibilidade;
- acessibilidade;
- responsividade;
- manutenção simplificada;
- separação de responsabilidades;
- alinhamento com o Design System.

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/04_REQUIREMENTS.md
docs/10_DESIGN_SYSTEM.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/15_INTERACTIONS_MOTION.md
docs/16_ASSETS.md
```

---

# 2. Princípios de componentes

## CP-001 — Reutilização

Antes de criar um novo componente, verificar se já existe um componente que possa ser reutilizado ou estendido.

---

## CP-002 — Composição

Preferir composição a duplicação.

Exemplo:

```text
Card
├── CardHeader
├── CardContent
└── CardFooter
```

---

## CP-003 — Responsabilidade única

Cada componente deve possuir uma responsabilidade clara.

Evitar componentes que concentrem:

```text
UI
+
regra de negócio
+
requisições HTTP
+
persistência
```

---

## CP-004 — Componentes visuais não devem conhecer regras de negócio

Componentes genéricos como:

```text
Button
Input
Modal
Card
Badge
Table
```

não devem depender diretamente das regras de negócio do EcoByte.

---

## CP-005 — Componentes de domínio

Componentes específicos do EcoByte podem conhecer o domínio quando necessário.

Exemplos:

```text
CollectionStatusBadge
CollectionTimeline
CollectionCard
CollectorRouteCard
WasteItemList
```

Esses componentes devem continuar separados dos componentes puramente visuais.

---

# 3. Camadas de componentes

A organização recomendada é:

```text
UI Primitives
    ↓
Components
    ↓
Domain Components
    ↓
Feature Components
    ↓
Pages
```

---

# 4. UI Primitives

São componentes básicos e altamente reutilizáveis.

Exemplos:

```text
Button
Input
Textarea
Select
Checkbox
Radio
Label
Badge
Separator
Spinner
Skeleton
```

---

# 5. Components

São componentes compostos que combinam primitives.

Exemplos:

```text
SearchInput
FormField
DatePicker
Dialog
DropdownMenu
Card
Table
Pagination
Toast
Tabs
```

---

# 6. Domain Components

Representam conceitos específicos do EcoByte.

Exemplos:

```text
CollectionStatusBadge
CollectionSummary
CollectionTimeline
WasteItems
EcopointCard
CollectorRouteCard
NotificationItem
```

---

# 7. Feature Components

Representam funcionalidades completas.

Exemplos:

```text
CollectionRequestForm
CollectionDetails
CollectorRoutePanel
UserManagementTable
ReportsDashboard
```

---

# 8. Pages

Pages organizam componentes e representam rotas da aplicação.

Exemplo:

```text
LoginPage
RegisterPage
ClientDashboardPage
CollectionRequestPage
CollectorDashboardPage
AdminDashboardPage
```

Pages não devem concentrar toda a lógica visual em um único arquivo.

---

# 9. Estrutura de diretórios

Estrutura conceitual recomendada:

```text
frontend/src/
├── app/            (rotas do Next.js App Router: page.tsx e layout.tsx)
│
├── components/
│   ├── ui/         (primitivos shadcn/ui)
│   ├── common/
│   ├── domain/
│   └── features/
│
├── hooks/
├── lib/            (cliente da API, formatação, utilitários)
└── assets/
```

No Next.js App Router, as "Pages" e "Layouts" descritos neste documento correspondem aos arquivos `page.tsx` e `layout.tsx` dentro de `app/` (`DEC-062`).

Os arquivos de `app/` não implementam regras de negócio: consomem a API e compõem componentes.

Uma implementação pode utilizar outra organização caso a arquitetura definitiva do frontend determine uma estrutura diferente.

O princípio de separação deve ser preservado.

Implementado na Fase 5: `ui/` recebe os componentes gerados pelo shadcn/ui (base Radix); `common/` os componentes compartilhados (`FormField`, `PasswordInput`, `PasswordRequirements`, `Logo`, `PageLoader`); `features/auth/` os formulários e guardas de autenticação; `layouts/` o `AuthLayout` e o `DashboardLayout`. A camada de API fica em `lib/api/`.

---

# 10. Button

## Responsabilidade

Representar ações interativas.

---

## Variantes

```text
primary
secondary
outline
ghost
destructive
link
```

---

## Tamanhos

```text
sm
md
lg
icon
```

---

## Estados

```text
default
hover
focus
active
disabled
loading
```

---

## Props conceituais

```ts
variant
size
loading
disabled
fullWidth
type
onClick
children
```

---

## Regras

O Button deve:

- possuir foco visível;
- impedir interação durante loading quando necessário;
- possuir área de toque adequada;
- permitir uso como elemento semântico apropriado.

Implementação: `components/ui/button.tsx` (shadcn), personalizado com a prop `loading`, que desabilita o botão, marca `aria-busy` e mostra um indicador.

---

# 11. IconButton

## Responsabilidade

Representar ações cuja interface seja baseada principalmente em um ícone.

---

## Uso

Exemplos:

```text
abrir menu
fechar modal
marcar notificação
ações compactas
```

---

## Regras

Quando o significado não for óbvio:

```text
aria-label
```

é obrigatório.

---

# 12. Input

## Responsabilidade

Entrada de texto simples.

---

## Estados

```text
default
hover
focus
disabled
error
success
```

---

## Estrutura

```text
Label
Input
Helper / Error
```

---

## Props conceituais

```ts
label
name
type
placeholder
value
defaultValue
disabled
required
error
helperText
onChange
```

---

# 13. PasswordInput

## Responsabilidade

Entrada segura de senha.

---

## Funcionalidades

Pode possuir:

```text
mostrar/ocultar senha
indicador de requisitos
estado de erro
```

---

## Regras

Nunca registrar a senha em logs.

O componente deve evitar qualquer mecanismo que exponha o valor desnecessariamente.

---

# 14. PasswordRequirements

## Responsabilidade

Apresentar visualmente os requisitos mínimos da senha.

Requisitos:

```text
mínimo de 8 caracteres
letra maiúscula
letra minúscula
número
caractere especial
```

---

## Estados

Cada requisito pode possuir:

```text
não atendido
atendido
```

Exemplo conceitual:

```text
✓ Pelo menos 8 caracteres
✓ Uma letra maiúscula
○ Uma letra minúscula
✓ Um número
○ Um caractere especial
```

---

# 15. FormField

## Responsabilidade

Padronizar a estrutura de um campo de formulário.

Composição:

```text
Label
Input / Select / Textarea
HelperText
ErrorMessage
```

Implementação: `components/common/form-field.tsx`, sobre o `Field` do shadcn/ui. Associa descrição e erro ao controle via `aria-describedby`, aplica `aria-invalid` e `aria-required` e marca campos obrigatórios com `*` visual (12 §47–§52).

---

# 16. Select

## Responsabilidade

Permitir seleção entre opções predefinidas.

---

## Estados

```text
default
focus
disabled
error
```

---

## Regras

As opções devem possuir:

```text
label compreensível
value consistente
```

Não utilizar valores arbitrários incompatíveis com o domínio.

---

# 17. Checkbox

Utilizado para:

```text
aceites
preferências
filtros
seleções múltiplas
```

Deve possuir label associado.

---

# 18. RadioGroup

Utilizado quando somente uma opção pode ser selecionada.

Exemplos:

```text
PF / PJ
opções de preferência
filtros mutuamente exclusivos
```

---

# 19. Textarea

Utilizado para textos maiores.

Exemplo:

```text
observações da coleta
```

Deve possuir limite de caracteres quando houver necessidade de negócio.

---

# 20. DatePicker

## Responsabilidade

Selecionar datas.

Uso previsto:

```text
dataAgendada
filtros por período
relatórios
```

---

## Regras

O componente deve:

- respeitar formato definido pela aplicação;
- ser utilizável em mobile;
- possuir navegação por teclado quando aplicável;
- impedir datas inválidas conforme regra do fluxo.

---

# 21. SearchInput

## Responsabilidade

Permitir busca em listas e tabelas.

Pode possuir:

```text
ícone de pesquisa
limpar busca
debounce
```

O debounce deve ser utilizado apenas quando a consulta justificar.

---

# 22. Card

## Responsabilidade

Agrupar conteúdo relacionado.

Estrutura recomendada:

```text
Card
├── CardHeader
├── CardContent
└── CardFooter
```

---

## Variantes possíveis

```text
default
elevated
outlined
interactive
featured
```

Não criar variantes sem necessidade real.

---

# 23. MetricCard

## Responsabilidade

Exibir uma métrica resumida.

Estrutura:

```text
ícone
label
valor
contexto
```

Exemplo:

```text
Coletas concluídas

128
+12 este mês
```

O valor deve ser fornecido pelos dados reais da aplicação.

---

# 24. Badge

## Responsabilidade

Representar estados, categorias ou pequenas classificações.

Variantes semânticas:

```text
default
success
warning
error
info
neutral
```

---

# 25. CollectionStatusBadge

## Responsabilidade

Representar visualmente o status de uma coleta.

Estados oficiais:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

Cada estado deve possuir:

```text
label
variante visual
```

Implementação: `components/domain/collection-status-badge.tsx`. Labels e tons vêm de `lib/collection-status.ts`, fonte única dos status no frontend (§125).

---

# 26. UserStatusBadge

Estados:

```text
ATIVO
INATIVO
```

---

# 27. RoleBadge

Representar:

```text
CLIENTE
COLETOR
ADMIN
```

Pode ser utilizado em contextos administrativos.

---

# 28. Alert

## Responsabilidade

Comunicar informações persistentes.

Variantes:

```text
info
success
warning
error
```

---

# 29. Toast

## Responsabilidade

Comunicar feedback temporário.

Exemplos:

```text
Coleta aceita com sucesso.
Perfil atualizado.
Erro ao carregar dados.
```

---

## Regras

Toasts não devem ser a única forma de comunicar erros críticos.

---

# 30. Spinner

## Responsabilidade

Indicar uma operação em andamento.

Uso:

```text
botões
ações rápidas
carregamento curto
```

---

# 31. Skeleton

## Responsabilidade

Representar a estrutura visual durante carregamento.

Uso:

```text
cards
dashboard
listas
tabelas
detalhes
```

---

# 32. EmptyState

## Responsabilidade

Representar ausência de dados.

Estrutura:

```text
ícone
título
descrição
ação opcional
```

Exemplo:

```text
Nenhuma coleta encontrada.
```

---

# 33. ErrorState

## Responsabilidade

Representar falha no carregamento de uma seção.

Estrutura:

```text
ícone
título
mensagem
ação de tentativa novamente
```

Implementação (Fase 6): `components/common/empty-state.tsx`, `components/common/error-state.tsx` (com "Tentar novamente") e `components/ui/skeleton.tsx` com `common/collection-card-skeleton.tsx`.

---

# 34. Dialog / Modal

## Responsabilidade

Apresentar conteúdo contextual ou confirmação.

---

## Variantes

```text
default
confirmation
destructive
```

---

## Regras

Modal deve:

- possuir título;
- possuir foco apropriado;
- ser fechável quando permitido;
- possuir comportamento de teclado;
- não bloquear o usuário de maneira inesperada.

---

# 35. ConfirmDialog

## Responsabilidade

Confirmar uma ação relevante.

Exemplo:

```text
Desativar usuário?
```

Estrutura:

```text
Título
Descrição
Cancelar
Confirmar
```

Implementação (Fase 8, `DEC-075`): `components/common/confirm-dialog.tsx`, sobre o `AlertDialog` do shadcn/ui (`components/ui/alert-dialog.tsx`). O diálogo permanece aberto, com o botão de confirmação em processamento, até a resposta da API.

---

# 36. DropdownMenu

## Responsabilidade

Apresentar ações ou opções contextuais.

Exemplo:

```text
Perfil
Configurações
Sair
```

---

# 37. Tabs

## Responsabilidade

Separar conteúdo relacionado dentro de uma mesma área.

Exemplo:

```text
Dados
Histórico
Notificações
```

Não utilizar tabs para ocultar informações que precisam ser vistas conjuntamente.

---

# 38. Accordion

## Responsabilidade

Expandir e recolher conteúdo secundário.

Uso:

```text
FAQ
detalhes complementares
informações extensas
```

Implementação (Fase 12): `components/ui/accordion.tsx` (shadcn/ui), nas dúvidas frequentes de `/como-funciona`.

---

# 39. Separator

## Responsabilidade

Separar visualmente conteúdos relacionados.

Pode ser:

```text
horizontal
vertical
```

---

# 40. Tooltip

## Responsabilidade

Explicar elementos compactos ou pouco óbvios.

Especialmente útil para:

```text
IconButton
ícones
ações compactas
```

Não utilizar tooltip como substituto de conteúdo essencial.

---

# 41. Breadcrumb

## Responsabilidade

Mostrar a posição do usuário na hierarquia de navegação.

Exemplo:

```text
Dashboard
/
Coletas
/
Detalhes
```

---

# 42. Pagination

## Responsabilidade

Navegar entre páginas de resultados.

Deve suportar conceitos como:

```text
page
limit
total
totalPages
next
previous
```

Deve refletir a paginação real da API.

Implementação: `components/common/pagination.tsx`. Anterior/Próxima são links reais (`?pagina=N`), o que preserva o histórico do navegador.

---

# 43. Table

## Responsabilidade

Apresentar dados tabulares.

Deve possuir estados:

```text
loading
empty
error
data
```

---

# 44. DataTable

Pode combinar:

```text
Table
Pagination
Filters
Search
Sorting
EmptyState
```

---

# 45. TableFilters

## Responsabilidade

Agrupar filtros relacionados.

Exemplo administrativo:

```text
status
data
role
tipo de cadastro
```

Os filtros devem corresponder aos parâmetros realmente suportados pela API.

---

# 46. SortableHeader

## Responsabilidade

Permitir ordenação de colunas quando suportada pelo backend.

Não implementar ordenação visual que não possua suporte real ou lógica correspondente.

---

# 47. Sidebar

## Responsabilidade

Navegação principal da área autenticada.

Pode possuir:

```text
logo
menu
item ativo
seções
collapse
perfil
logout
```

---

# 48. Header

## Responsabilidade

Apresentar contexto e ações globais.

Pode possuir:

```text
menu mobile
título
notificações
perfil
```

---

# 49. MobileNav

## Responsabilidade

Adaptar a navegação para telas pequenas.

Pode utilizar:

```text
drawer
sheet
bottom navigation
```

conforme a experiência definida.

Implementação: barra inferior nas áreas autenticadas (`DEC-073`); no site público, menu lateral em `components/ui/sheet.tsx`, aberto pelo botão "Abrir menu" do `PublicHeader` (Fase 12, `DEC-079`). O botão de fechar do sheet foi ajustado para "Fechar" e para área de toque adequada (12 §16).

Implementação (Fase 6, `DEC-073`): `components/layouts/area-navigation.tsx`, com barra inferior no celular e links no cabeçalho a partir de `md`; o item ativo é o destino mais específico da URL atual.

---

# 50. UserMenu

## Responsabilidade

Apresentar ações relacionadas ao usuário autenticado.

Exemplo:

```text
Meu perfil
Configurações
Sair
```

---

# 51. NotificationCenter

## Responsabilidade

Apresentar as notificações do usuário.

Pode incluir:

```text
contador de não lidas
lista
marcar como lida
visualização de detalhes
```

Implementação (Fase 10, `DEC-077`): `features/notifications/notification-center.tsx`, nas páginas `/cliente/notificacoes` e `/coletor/notificacoes`. O contador fica no sino do cabeçalho, `components/layouts/notification-bell.tsx`, e a consulta periódica em `hooks/use-notifications.ts`.

---

# 52. NotificationItem

## Estrutura

```text
ícone
título
mensagem
data
estado de leitura
```

Implementação (Fase 10): `components/domain/notification-item.tsx`. O estado "Não lida" aparece em texto, não só por cor, e há ações para marcar como lida e ver a coleta relacionada.

---

# 53. CollectionCard

## Responsabilidade

Exibir um resumo de uma coleta.

Pode conter:

```text
status
data
endereço resumido
quantidade de itens
ação principal
```

---

# 54. CollectionSummary

## Responsabilidade

Apresentar os principais dados de uma coleta.

Exemplo:

```text
Status
Data agendada
Endereço
Itens
Coletor
```

---

# 55. CollectionTimeline

## Responsabilidade

Representar visualmente o progresso da coleta.

Fluxo:

```text
PENDENTE
    ↓
ACEITA
    ↓
A_CAMINHO
    ↓
RECOLHIDA
    ↓
ENTREGUE_ECOPONTO
    ↓
CONCLUIDA
```

O componente deve destacar:

```text
etapa atual
etapas concluídas
etapas futuras
```

---

# 56. CollectionActions

## Responsabilidade

Apresentar a ação válida para a etapa atual da coleta.

Exemplo:

```text
PENDENTE
→ disponível para aceitar

ACEITA
→ iniciar rota

A_CAMINHO
→ confirmar recolhimento

RECOLHIDA
→ confirmar entrega

ENTREGUE_ECOPONTO
→ concluir
```

O componente não deve permitir ações incompatíveis com o status.

Implementação (Fase 7, `DEC-074`): `components/domain/collection-actions.tsx`, com a regra de próxima ação em `lib/collector-actions.ts` (`NEXT_ACTION`, 13 §36). A execução e o feedback ficam em `features/collector/collector-collection-detail.tsx`, via `useCollectorEvent`.

---

# 57. WasteItemsList

## Responsabilidade

Listar os itens de descarte associados à coleta.

Exemplo:

```text
Notebook
Quantidade: 2
Condição: Danificado
```

---

# 58. WasteItemCard

Pode ser utilizado em mobile para representar um item individual.

Estrutura:

```text
categoria
quantidade
condição
```

---

# 59. AddressCard

## Responsabilidade

Exibir um endereço formatado.

Pode ser utilizado em:

```text
coletas
ecoponto
```

Implementação (Fase 6): `components/domain/` — `collection-card.tsx`, `collection-timeline.tsx`, `waste-items-list.tsx`, `address-card.tsx`. O detalhe (`CollectionSummary`) é composto em `features/collections/client-collection-detail.tsx`.

---

# 60. LocationDisplay

## Responsabilidade

Exibir informação geográfica.

Pode apresentar:

```text
endereço
coordenadas
mapa
link de navegação
```

Somente implementar mapa ou navegação quando houver requisito correspondente.

---

# 61. EcopointCard

## Responsabilidade

Apresentar informações do ecoponto central.

Pode conter:

```text
nome
endereço
horários
status
localização
```

Implementação (Fase 9, `DEC-076`): `components/domain/ecopoint-card.tsx`, com nome, descrição, endereço (`AddressCard`) e aviso de indisponibilidade quando `INATIVO`. Os horários aparecem como "a definir" (`OQ-005`), e a localização não é exibida enquanto não houver mapa (§60). A consulta e os estados de carregamento, erro e ausência ficam em `features/ecopoint/ecopoint-info.tsx`, usado na página inicial e em `/cliente/ecoponto`. A edição fica em `features/admin/admin-ecopoint.tsx`.

---

# 62. CollectorRouteCard

## Responsabilidade

Representar uma coleta na operação do coletor.

Pode conter:

```text
cliente
endereço
data agendada
status
ação atual
```

Exibir somente informações necessárias à operação.

---

# 63. CollectorRouteList

## Responsabilidade

Agrupar as coletas relevantes para a operação do coletor.

Pode utilizar:

```text
CollectorRouteCard
EmptyState
Loading
Error
Filters
```

Implementação (Fase 7, `DEC-074`): `features/collector/collector-collection-list.tsx` (variantes `available` e `assigned`), sem agrupamentos nem filtros enquanto `OQ-047` estiver aberta. Desde o `DEC-084`, a variante `assigned` tem as abas "Em andamento" e "Concluídas" (`?grupo=`), e o detalhe da coleta tem "Como chegar" e, em `RECOLHIDA`, a seção "Entrega no ecoponto" (`EcopointInfo`). O `CollectorRouteCard` não é um componente separado: é o `CollectionCard` com a propriedade `nextAction` (§135).

---

# 64. CollectionRequestForm

## Responsabilidade

Gerenciar a interface de solicitação de coleta.

Pode ser dividido em etapas:

```text
Endereço
    ↓
Itens
    ↓
Agendamento
    ↓
Revisão
```

O fluxo definitivo deve refletir os requisitos aprovados.

---

# 65. AddressForm

Campos possíveis:

```text
CEP
logradouro
número
complemento
bairro
cidade
estado
localização
```

Os campos obrigatórios devem seguir os requisitos definitivos.

---

# 66. WasteItemsForm

## Responsabilidade

Permitir adicionar um ou mais itens de descarte.

Operações:

```text
adicionar item
editar item
remover item
alterar quantidade
```

---

# 67. CollectionReview

## Responsabilidade

Apresentar um resumo antes da confirmação da coleta.

Pode apresentar:

```text
endereço
itens
data
observações
```

---

# 68. CollectionSuccess

## Responsabilidade

Apresentar confirmação após criação bem-sucedida.

Exemplo:

```text
Coleta solicitada com sucesso.
```

Pode incluir:

```text
identificador
status
data
próxima ação
```

Implementação (Fase 6): `features/collections/collection-request-form.tsx` (etapas), `AddressForm` (movido na Fase 9 para `components/common/address-fields.tsx`, compartilhado com o ecoponto). Desde o `DEC-081`, o CEP preenche logradouro e bairro pela API, e com `serviceArea` cidade e UF ficam fixas em Diadema-SP, `waste-items-fields.tsx` (`WasteItemsForm`), `collection-review.tsx` (`CollectionReview`). A confirmação (`CollectionSuccess`) é exibida no detalhe da nova coleta. Nas etapas intermediárias, "Continuar" é o botão de envio do formulário, para que o Enter avance de etapa conforme a especificação HTML, sem enviar a solicitação antes da revisão.

---

# 69. UserForm

## Responsabilidade

Formulário reutilizável para dados de usuário.

Pode ser utilizado em:

```text
cadastro
edição de perfil
administração
```

Campos devem variar conforme:

```text
PF
PJ
```

quando aplicável.

---

# 70. RegistrationForm

## Responsabilidade

Cadastro de cliente.

Deve suportar:

```text
PF
PJ
```

e validação de:

```text
e-mail
senha
confirmação
dados obrigatórios
```

---

# 71. LoginForm

## Responsabilidade

Autenticação por:

```text
e-mail
senha
```

Deve possuir:

```text
loading
erro
feedback
link para recuperação
```

quando a funcionalidade estiver disponível.

Formulários com credenciais (login e cadastro) declaram `method="post"`. Se forem enviados antes de o JavaScript carregar, o navegador não coloca e-mail e senha na URL (verificado em 2026-09-26).

---

# 72. ForgotPasswordForm

## Responsabilidade

Solicitar recuperação de senha.

Campo principal:

```text
e-mail
```

Não revelar ao usuário detalhes sobre a existência da conta quando isso puder facilitar enumeração.

---

# 73. ResetPasswordForm

## Responsabilidade

Redefinir a senha através de mecanismo seguro.

Campos:

```text
nova senha
confirmação
```

Pode utilizar:

```text
PasswordInput
PasswordRequirements
```

---

# 74. DashboardLayout

## Responsabilidade

Layout compartilhado das áreas autenticadas.

Estrutura:

```text
DashboardLayout
├── Sidebar
├── Header
└── MainContent
```

---

# 75. AuthLayout

## Responsabilidade

Layout compartilhado por:

```text
login
cadastro
recuperação
redefinição
```

Implementação (`DEC-083`): `components/layouts/auth-layout.tsx`, com o link "Voltar ao site" para `/` acima do logo. É usado em `/entrar`, `/cadastro`, `/verificar-email` e `/trocar-senha`. A troca obrigatória da senha provisória fica em `features/profile/change-password-required.tsx`, que reaproveita o `PasswordForm` do perfil.

---

# 76. PublicLayout

## Responsabilidade

Layout da área pública.

Pode conter:

```text
Header
Main
Footer
```

Implementação (Fase 12, `DEC-079`): `components/layouts/public-layout.tsx`, com `public-header.tsx` e `site-footer.tsx`. Os blocos das páginas (`PageHero`, `SiteSection`, `StepList`, `SectionImage`, `FeatureSplit`, `ServiceCards`, `GradientCta`, `CheckList`, `Eyebrow`) ficam em `features/site/site-blocks.tsx` (`DEC-080`), e as ações de solicitação em `features/site/request-collection-actions.tsx`. Os dropdowns do cabeçalho usam `components/ui/navigation-menu.tsx` (shadcn/ui).

---

# 77. AdminDashboard

## Responsabilidade

Compor a área administrativa.

Pode utilizar:

```text
MetricCard
Charts
Table
Filters
RecentCollections
```

Não deve concentrar consultas diretamente; dados devem vir de hooks/services apropriados.

---

# 78. ClientDashboard

## Responsabilidade

Compor a área principal do cliente.

Prioridades:

```text
solicitar coleta
coletas recentes
status atual
notificações
```

---

# 79. CollectorDashboard

## Responsabilidade

Compor a área principal do coletor.

Prioridades:

```text
coletas disponíveis
coletas atribuídas
próxima ação
status operacional
```

Implementação (Fase 7, `DEC-074`): `features/collector/collector-dashboard.tsx`. Os blocos compartilhados dos detalhes (`DetailSection`, `BackLink`, `DetailSkeleton`) ficam em `components/common/detail-parts.tsx`, usados pelo cliente e pelo coletor.

---

# 80. UserManagementTable

## Responsabilidade

Apresentar usuários para o administrador.

Pode incluir:

```text
nome
e-mail
role
tipo
status
data de cadastro
ações
```

Implementação (Fase 8, `DEC-075`): `features/admin/admin-user-list.tsx`. No celular, cartões; a partir de `md`, tabela com `caption` e `th scope` (12 §11, §67). As ações ficam no detalhe (`admin-user-detail.tsx`), e o status aparece em `components/domain/user-status-badge.tsx`.

Cadastro de coletor (`DEC-083`): `features/admin/admin-collector-form.tsx`, em `/admin/usuarios/novo`, aberto pelo botão "Cadastrar coletor" da lista. O esquema fica em `lib/validation/collector.ts`.

---

# 81. CollectionManagementTable

## Responsabilidade

Apresentar coletas ao administrador.

Pode incluir:

```text
ID
cliente
coletor
status
data
criação
ações
```

Implementação (Fase 8, `DEC-075`): `features/admin/admin-collection-list.tsx`, com filtro por status na URL. No celular, a lista usa o `CollectionCard`; a partir de `md`, uma tabela com endereço, cliente, coletor, status e data. Não há coluna de ID nem ações: a administração de coletas é somente leitura (`OQ-055`). O `CountTile` dos painéis fica em `components/common/count-tile.tsx`.

---

# 82. ReportsDashboard

## Responsabilidade

Exibir informações agregadas do sistema.

Pode utilizar:

```text
MetricCard
charts
tables
filters
```

Os dados devem vir de endpoints de relatório reais.

---

# 83. Componentes de gráfico

Caso gráficos sejam utilizados, criar componentes específicos e reutilizáveis.

Exemplos:

```text
CollectionsByStatusChart
CollectionsByMonthChart
WasteByCategoryChart
```

Os componentes devem receber dados externos.

Não devem buscar diretamente no banco.

---

# 84. Componentes de gráficos não devem inventar dados

Um gráfico deve renderizar dados recebidos pela aplicação.

Não criar:

```text
dados fictícios permanentes
```

em produção apenas para preencher a interface.

Seeds podem fornecer dados de desenvolvimento.

---

# 85. Domain Components vs UI Components

## UI

Exemplo:

```text
Badge
Button
Card
Dialog
```

Conhecem apenas comportamento visual.

## Domain

Exemplo:

```text
CollectionStatusBadge
CollectionTimeline
```

Conhecem conceitos do EcoByte.

---

# 86. Props

Props devem ser:

```text
claras
previsíveis
tipadas
```

Evitar objetos gigantes quando somente poucos campos forem necessários.

---

# 87. Evitar prop drilling excessivo

Quando muitos níveis precisarem do mesmo estado, avaliar:

```text
context
store
query cache
composition
```

conforme a arquitetura definida.

Não criar estado global para qualquer pequeno valor.

---

# 88. Estado local

Preferir estado local quando:

```text
o estado pertence a um único componente
```

Exemplo:

```text
modal aberto
campo expandido
dropdown aberto
```

---

# 89. Estado compartilhado

Utilizar soluções apropriadas quando o estado for compartilhado.

Exemplos:

```text
estado de autenticação
dados de usuário
filtros compartilhados
cache de servidor
```

A solução definitiva deve seguir a arquitetura do frontend.

---

# 90. Server State

Dados vindos da API devem ser tratados como estado do servidor.

Exemplos:

```text
coletas
usuários
notificações
ecoponto
relatórios
```

Não duplicar desnecessariamente esses dados em múltiplos estados locais.

Implementação: TanStack Query (`DEC-073`). Hooks em `hooks/use-client-collections.ts`; criar uma coleta invalida as listas do cliente (§96). O cache é limpo no login, no cadastro e no logout, para não exibir dados de outra conta no mesmo navegador.

---

# 91. Form State

Estado dos formulários deve permanecer separado do estado do servidor quando apropriado.

Pode utilizar bibliotecas adequadas à stack definida.

---

# 92. Componentes controlados

Componentes de formulário devem suportar integração consistente com a estratégia de formulários escolhida.

---

# 93. Composição de formulário

Estrutura conceitual:

```text
Form
├── FormField
│   ├── Label
│   ├── Input
│   └── Error
├── FormField
└── Submit Button
```

---

# 94. Loading e Mutation

Operações de mutação como:

```text
criar coleta
aceitar coleta
iniciar rota
confirmar recolhimento
confirmar entrega
concluir
```

devem possuir estados claros de processamento.

---

# 95. Feedback após mutation

Após uma mutação:

```text
sucesso
→ atualizar UI
→ atualizar cache quando necessário
→ feedback visual
```

Em caso de erro:

```text
erro
→ manter contexto
→ apresentar mensagem
→ permitir nova tentativa quando apropriado
```

---

# 96. Invalidação de dados

Quando uma operação alterar dados exibidos em outra parte da interface, atualizar ou invalidar o cache correspondente.

Exemplo:

```text
aceitar coleta
    ↓
atualizar lista de coletas disponíveis
    ↓
atualizar coleta atribuída
```

---

# 97. Componentes não devem acessar banco

Nenhum componente React deve executar acesso direto ao MongoDB.

Fluxo:

```text
Component
    ↓
Hook / Query
    ↓
API Client
    ↓
Backend
    ↓
MongoDB
```

---

# 98. API Client

A comunicação HTTP deve preferencialmente estar centralizada em uma camada de acesso à API.

Exemplo conceitual:

```text
api/
├── auth
├── collections
├── users
├── ecopoint
└── notifications
```

Os componentes não devem repetir lógica de configuração HTTP indiscriminadamente.

---

# 99. Hooks

Hooks podem encapsular acesso a dados e comportamento.

Exemplos:

```text
useAuth
useProfile
useCollections
useCollection
useNotifications
useEcopoint
```

---

# 100. Hooks de domínio

Exemplos:

```text
useAcceptCollection
useStartCollection
useCollectCollection
useDeliverCollection
useCompleteCollection
```

A nomenclatura deve permanecer consistente com a API.

---

# 101. Separação de hooks

Hooks de consulta e mutation podem permanecer separados quando isso melhorar clareza.

Exemplo:

```text
useCollections
useCreateCollection
useAcceptCollection
```

---

# 102. Comportamento de erro

Componentes devem receber ou derivar estados de erro de forma previsível.

Não capturar erros silenciosamente.

---

# 103. Acessibilidade dos componentes

Todo componente interativo deve considerar:

```text
teclado
foco
semântica
labels
estado
mensagens
contraste
```

---

# 104. ARIA

Utilizar atributos ARIA somente quando necessários.

Preferir HTML semântico quando disponível.

Exemplo:

```html
<button>
```

em vez de:

```html
<div role="button">
```

quando a intenção for realmente um botão.

---

# 105. Modal e foco

Ao abrir um modal:

```text
foco → modal
```

Ao fechar:

```text
foco → elemento que abriu
```

quando aplicável.

---

# 106. Dropdown e teclado

Dropdowns devem permitir navegação apropriada por teclado.

---

# 107. Inputs e erros

Mensagens de erro devem estar semanticamente associadas ao campo correspondente.

---

# 108. Componentes mobile-first

Todos os componentes devem possuir comportamento adequado para mobile.

Especial atenção:

```text
Button
Input
Form
Table
Sidebar
Modal
CollectionCard
CollectorRouteCard
```

---

# 109. Componentes para touch

Áreas clicáveis devem possuir tamanho adequado.

Não criar:

```text
IconButton
```

com área extremamente pequena apenas para economizar espaço.

---

# 110. Componentes responsivos

Um componente deve evitar assumir uma largura fixa quando puder funcionar de maneira fluida.

Preferir:

```text
width: 100%
max-width
responsive grid
flex
```

conforme o contexto.

---

# 111. Tabelas em mobile

O `DataTable` deve possuir estratégia para telas pequenas.

Opções:

```text
scroll horizontal
layout alternativo
cards
colunas prioritárias
```

A escolha depende da quantidade e importância das informações.

---

# 112. Componentes e motion

Animações devem ser adicionadas somente quando contribuírem para:

```text
feedback
transição
hierarquia
orientação
```

---

# 113. Framer Motion / GSAP

Quando houver necessidade de animação:

```text
Framer Motion
```

pode ser utilizado para:

```text
transições
microinterações
entrada/saída
layout
```

GSAP pode ser utilizado para animações mais específicas e complexas.

Não utilizar ambas indiscriminadamente para o mesmo efeito.

A decisão deve seguir:

```text
docs/15_INTERACTIONS_MOTION.md
```

---

# 114. `prefers-reduced-motion`

Componentes animados devem respeitar:

```text
prefers-reduced-motion
```

Animações não essenciais devem ser reduzidas ou removidas.

---

# 115. Componentes de navegação

Componentes de navegação devem comunicar claramente:

```text
item atual
itens disponíveis
hierarquia
```

---

# 116. Active State

O item atual da navegação deve possuir estado visual distinto.

Não depender somente de mudança de cor.

---

# 117. Componentes de status

Todos os componentes de status devem utilizar a mesma linguagem visual.

Exemplo:

```text
CollectionStatusBadge
```

e uma timeline de coleta devem apresentar os estados de maneira coerente.

---

# 118. Data formatting

Componentes que exibem:

```text
datas
horários
números
quantidades
```

devem utilizar funções de formatação centralizadas.

Evitar formatação manual repetida em cada componente.

---

# 119. Text overflow

Componentes que exibem texto variável devem tratar:

```text
overflow
wrap
truncate
```

quando necessário.

Nunca permitir que conteúdo inesperadamente longo quebre o layout.

---

# 120. Testabilidade

Componentes devem ser construídos de forma que possam ser testados isoladamente.

Priorizar testes para:

```text
interações
estados
acessibilidade
renderização condicional
erros
loading
```

---

# 121. Componentes críticos

Prioridade de testes:

```text
LoginForm
RegistrationForm
CollectionRequestForm
CollectionActions
CollectionStatusBadge
CollectionTimeline
UserManagementTable
```

---

# 122. Componentes de domínio e segurança

Componentes visuais podem esconder ou mostrar ações conforme contexto, mas isso é apenas UX.

Exemplo:

```text
Cliente
→ não exibir botão "Aceitar coleta"
```

Ainda assim:

```text
Backend
→ deve negar a operação
```

se houver tentativa indevida.

---

# 123. Componentes de ação de coleta

As ações devem ser derivadas do estado real.

Exemplo:

```text
PENDENTE
→ aceitar

ACEITA
→ iniciar

A_CAMINHO
→ confirmar recolhimento

RECOLHIDA
→ confirmar entrega

ENTREGUE_ECOPONTO
→ concluir

CONCLUIDA
→ nenhuma ação operacional
```

---

# 124. CollectionTimeline e fonte do estado

O timeline deve receber o status atual do backend.

Não criar uma lógica paralela de status independente da aplicação.

---

# 125. CollectionStatusBadge e enum

O componente deve utilizar uma definição central de status.

Evitar repetir:

```text
"PENDENTE"
"ACEITA"
"A_CAMINHO"
```

em vários componentes sem uma fonte compartilhada.

---

# 126. Componentes com dados ausentes

Quando uma informação opcional não estiver disponível, utilizar uma representação consistente.

Exemplo:

```text
Não informado
```

Evitar:

```text
undefined
null
[object Object]
```

na interface.

---

# 127. Componentes com permissões

A UI pode utilizar componentes como:

```text
RoleGuard
PermissionGuard
```

para controlar visibilidade.

Isso é apenas uma camada de interface.

A autorização real continua no backend.

---

# 128. Guard de rota

Páginas protegidas podem utilizar mecanismo equivalente a:

```text
ProtectedRoute
```

para redirecionamento e experiência do usuário.

Isso não substitui autenticação no backend.

---

# 129. Componente ProtectedRoute

Responsabilidades:

```text
verificar estado de autenticação no frontend
redirecionar usuário não autenticado
exibir loading durante restauração da sessão
```

Não deve ser tratado como mecanismo de segurança suficiente.

---

# 130. Componentes de autenticação

A área de autenticação deve utilizar:

```text
AuthLayout
LoginForm
RegistrationForm
PasswordInput
PasswordRequirements
ForgotPasswordForm
ResetPasswordForm
```

mantendo consistência visual.

---

# 131. Componentes administrativos

A área administrativa pode utilizar:

```text
AdminDashboard
UserManagementTable
CollectionManagementTable
ReportsDashboard
TableFilters
MetricCard
```

---

# 132. Componentes do coletor

A área operacional pode utilizar:

```text
CollectorDashboard
CollectorRouteList
CollectorRouteCard
CollectionTimeline
CollectionActions
AddressCard
```

---

# 133. Componentes do cliente

A área do cliente pode utilizar:

```text
ClientDashboard
CollectionCard
CollectionSummary
CollectionTimeline
CollectionRequestForm
EcopointCard
NotificationCenter
```

---

# 134. Componentes compartilhados entre perfis

Podem ser reutilizados:

```text
CollectionCard
CollectionSummary
CollectionTimeline
CollectionStatusBadge
AddressCard
EcopointCard
NotificationItem
```

desde que recebam propriedades adequadas ao contexto.

---

# 135. Evitar duplicação por perfil

Não criar:

```text
ClientCollectionCard
CollectorCollectionCard
AdminCollectionCard
```

se a diferença puder ser resolvida com composição ou variantes de:

```text
CollectionCard
```

Somente separar componentes quando as responsabilidades forem realmente diferentes.

---

# 136. Variantes de componente de domínio

Um componente pode possuir variantes legítimas.

Exemplo:

```text
CollectionCard
├── compact
├── default
└── detailed
```

As variantes devem possuir propósito claro.

---

# 137. Props de componentes de domínio

Preferir props específicas.

Exemplo:

```ts
type CollectionCardProps = {
  collection: Collection
  variant?: "compact" | "default" | "detailed"
  showActions?: boolean
}
```

Evitar dezenas de flags independentes quando a composição puder resolver o problema.

---

# 138. Evitar componente "Deus"

Não criar componentes gigantes como:

```text
Dashboard.tsx
```

contendo:

```text
sidebar
header
cards
charts
tabelas
modais
formulários
consultas
mutations
```

Dividir em componentes menores.

---

# 139. Regra de tamanho

Não existe um número rígido de linhas por componente.

O critério principal deve ser:

```text
clareza
coesão
responsabilidade
reutilização
testabilidade
```

---

# 140. Componentes e documentação

Componentes importantes devem possuir documentação suficiente para explicar:

```text
responsabilidade
props
variantes
estados
exemplo de uso
restrições
```

---

# 141. Componentes e Design System

Todo componente visual deve utilizar os tokens e padrões definidos em:

```text
docs/10_DESIGN_SYSTEM.md
```

Não criar estilos isolados sem justificativa.

---

# 142. Componentes e assets

Imagens, ilustrações e ícones especiais devem seguir:

```text
docs/16_ASSETS.md
```

---

# 143. Componentes e motion

Animações devem seguir:

```text
docs/15_INTERACTIONS_MOTION.md
```

---

# 144. Componentes e acessibilidade

Comportamentos de acessibilidade devem seguir:

```text
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
```

---

# 145. Regra de criação de novo componente

Antes de criar:

```text
1. Verificar se já existe componente equivalente.
2. Verificar o Design System.
3. Definir responsabilidade.
4. Definir props.
5. Definir estados.
6. Definir comportamento responsivo.
7. Definir acessibilidade.
8. Definir necessidade de motion.
9. Implementar.
10. Testar.
11. Documentar quando necessário.
```

---

# 146. Regra contra abstração prematura

Não criar componentes excessivamente genéricos antes de existir um caso real de reutilização.

Evitar abstrações como:

```text
UniversalDataRenderer
GenericBusinessCard
SuperForm
MegaModal
```

sem necessidade concreta.

---

# 147. Regra contra duplicação

Também não duplicar componentes simplesmente porque dois contextos possuem pequenas diferenças.

Primeiro avaliar:

```text
props
variants
composition
slots
```

---

# 148. Biblioteca de componentes

A stack visual preferencial pode utilizar:

```text
Tailwind CSS
Shadcn UI
Lucide React
```

conforme a definição final da arquitetura frontend.

A biblioteca não deve substituir a organização interna do Design System.

---

# 149. Personalização de componentes da biblioteca

Componentes de bibliotecas externas devem ser adaptados ao EcoByte.

Exemplo:

```text
Shadcn Button
        ↓
tokens EcoByte
        ↓
Button do projeto
```

O restante da aplicação deve consumir os componentes internos padronizados.

---

# 150. Regra de dependência

Pages não devem importar diretamente múltiplas bibliotecas visuais diferentes para reproduzir o mesmo padrão.

Preferir:

```text
Page
  ↓
Feature Component
  ↓
Project Component
  ↓
UI Primitive
```

---

# 151. Regra de consistência

Quando uma alteração visual for necessária em um componente global:

```text
alterar componente base
```

em vez de corrigir cada uso individualmente.

---

# 152. Regra de propagação

Alterações em:

```text
Button
Input
Badge
Card
Dialog
Table
```

devem refletir automaticamente nos lugares onde os componentes são reutilizados.

---

# 153. Fonte de verdade

Este documento define a arquitetura de componentes do EcoByte.

Para dúvidas:

```text
Design System
    ↓
Components
    ↓
Pages
```

O Design System define a linguagem.

Este documento define os componentes.

As pages definem composição de funcionalidades.

---

# 154. Documentos relacionados

```text
docs/10_DESIGN_SYSTEM.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/15_INTERACTIONS_MOTION.md
docs/16_ASSETS.md
docs/17_TESTING.md
```

---

# 155. Regra final

Os componentes do EcoByte devem ser:

```text
reutilizáveis
consistentes
acessíveis
responsivos
testáveis
compreensíveis
performáticos
```

A prioridade deve ser:

```text
clareza
    ↓
reutilização
    ↓
consistência
    ↓
acessibilidade
    ↓
estética
```

Nenhum componente deve introduzir comportamento que contradiga:

```text
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/06_API.md
```

ou qualquer outra fonte de verdade do projeto.