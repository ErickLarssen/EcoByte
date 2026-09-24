# 17 — TESTING

## 1. Objetivo

Este documento define a estratégia de testes do EcoByte.

O objetivo é garantir que:

- funcionalidades estejam corretas;
- regras de negócio sejam respeitadas;
- API funcione conforme o contrato;
- autenticação seja segura;
- permissões sejam aplicadas corretamente;
- máquina de estados permaneça consistente;
- MongoDB armazene dados corretamente;
- interface seja responsiva;
- componentes sejam acessíveis;
- operações concorrentes não causem inconsistências;
- regressões sejam detectadas antes da entrega.

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
docs/08_MONGODB_QUERIES.md
docs/09_AUTHENTICATION_SECURITY.md
docs/10_DESIGN_SYSTEM.md
docs/11_COMPONENTS.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/13_COLLECTOR_FLOW.md
docs/14_STATE_MACHINE.md
docs/15_INTERACTIONS_MOTION.md
docs/16_ASSETS.md
```

---

# 2. Objetivos de qualidade

Os testes devem procurar garantir:

```text
correção
consistência
segurança
confiabilidade
usabilidade
acessibilidade
responsividade
performance adequada
manutenibilidade
```

---

# 3. Princípios

## TS-001 — Testar comportamento

Os testes devem verificar o comportamento esperado do sistema.

Preferir:

```text
entrada
→ comportamento
→ resultado
```

em vez de testar somente detalhes internos da implementação.

---

## TS-002 — Regras críticas devem possuir testes

Toda regra de negócio importante deve possuir cobertura automatizada quando aplicável.

Prioridade:

```text
autenticação
autorização
coletas
máquina de estados
concorrência
persistência
```

---

## TS-003 — Testes não devem depender de dados reais

Utilizar:

```text
dados fictícios
fixtures
factories
seed de teste
```

Não utilizar dados pessoais ou credenciais reais.

---

## TS-004 — Testes devem ser reproduzíveis

Um teste deve produzir o mesmo resultado quando executado nas mesmas condições.

Evitar dependências:

```text
horário atual
rede externa
serviços externos
ordem acidental de execução
estado residual
```

quando não forem parte explícita do teste.

---

# 4. Pirâmide de testes

A estratégia deve priorizar:

```text
                 E2E
               /     \
          Integração
          /          \
       Unitários   Componentes
```

Na prática:

```text
muitos testes unitários
muitos testes de componentes
quantidade moderada de testes de integração
quantidade menor de testes E2E
```

---

# 5. Tipos de testes

O projeto pode utilizar:

```text
Unit
Component
Integration
API
Database
E2E
Accessibility
Responsive
Security
Performance
Regression
```

---

# 6. Testes unitários

## Objetivo

Testar funções e regras isoladas.

Exemplos:

```text
validação de senha
normalização de e-mail
validação de transição
formatação
helpers
services
```

---

# 7. Testes de componentes

Devem verificar:

```text
renderização
interação
estados
props
acessibilidade
feedback
```

Exemplos:

```text
Button
Input
Dialog
CollectionStatusBadge
CollectionTimeline
```

---

# 8. Testes de integração

Devem verificar a interação entre camadas.

Exemplo:

```text
Route
↓
Controller
↓
Service
↓
Model
↓
MongoDB
```

Podem ser utilizados para testar operações reais do backend com banco de teste.

---

# 9. Testes de API

Devem validar o contrato HTTP.

Verificar:

```text
método
rota
status code
request
response
autenticação
autorização
erros
```

---

# 10. Testes de banco de dados

Devem validar:

```text
persistência
consulta
atualização
índices
agregações
referências
documentos embutidos
```

---

# 11. Testes E2E

Devem validar jornadas completas do usuário.

Prioridade:

```text
cadastro
login
solicitação de coleta
acompanhamento
fluxo do coletor
operações administrativas
```

---

# 12. Testes de acessibilidade

Devem verificar:

```text
semântica
labels
keyboard
focus
contraste
estados
leitor de tela
reduced motion
```

quando aplicável.

---

# 13. Testes de responsividade

Devem validar:

```text
mobile
tablet
desktop
```

e principalmente as jornadas críticas.

---

# 14. Testes de segurança

Devem validar pelo menos:

```text
autenticação
autorização
proteção de rotas
controle de propriedade
validação de entrada
proteção contra abuso
dados sensíveis
```

---

# 15. Testes de performance

Devem verificar principalmente:

```text
consultas
agregações
renderização
assets
páginas críticas
operações frequentes
```

Não é necessário criar benchmarks para todas as funcionalidades.

---

# 16. Ferramentas

Ferramentas adotadas (`DEC-062`):

```text
Vitest                 → testes unitários (frontend e backend)
Supertest              → testes de API
mongodb-memory-server  → testes de integração com MongoDB/Mongoose
Testing Library        → testes de componentes
Playwright             → testes E2E
axe                    → testes de acessibilidade
```

Trocar uma ferramenta exige nova decisão em `DECISIONS.md`, mas não altera a estratégia descrita neste documento.

Observação: o teste de concorrência da aceitação deve rodar contra um MongoDB real (memory-server ou local), nunca contra mocks, pois valida a atomicidade de `findOneAndUpdate`.

---

# 17. Testes unitários — backend

As regras de negócio devem ser testadas isoladamente sempre que possível.

Exemplos:

```text
CollectionService
AuthService
UserService
NotificationService
```

---

# 18. Testes unitários — máquina de estados

A máquina de estados deve possuir testes para:

```text
transições válidas
transições inválidas
estado terminal
guards
timestamps
permissões
```

---

# 19. Matriz de testes da máquina

| Estado atual | Evento | Esperado |
|---|---|---|
| `PENDENTE` | `accept` | `ACEITA` |
| `ACEITA` | `start` | `A_CAMINHO` |
| `A_CAMINHO` | `collect` | `RECOLHIDA` |
| `RECOLHIDA` | `deliver` | `ENTREGUE_ECOPONTO` |
| `ENTREGUE_ECOPONTO` | `complete` | `CONCLUIDA` |

---

# 20. Testes de transições inválidas

Devem ser testados exemplos como:

```text
PENDENTE → A_CAMINHO
PENDENTE → RECOLHIDA
PENDENTE → CONCLUIDA

ACEITA → RECOLHIDA
ACEITA → CONCLUIDA

A_CAMINHO → CONCLUIDA

RECOLHIDA → ACEITA

ENTREGUE_ECOPONTO → RECOLHIDA

CONCLUIDA → qualquer estado
```

---

# 21. Teste de estado terminal

Quando uma coleta estiver:

```text
CONCLUIDA
```

qualquer ação operacional posterior deve ser rejeitada.

---

# 22. Testes de timestamps

Verificar:

```text
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

de acordo com a transição correspondente.

---

# 23. Teste de sequência temporal

Quando todos os timestamps existirem:

```text
createdAt
≤ acceptedAt
≤ startedAt
≤ collectedAt
≤ deliveredAt
≤ completedAt
```

---

# 24. Testes de `coletorId`

Validar:

```text
PENDENTE
→ coletorId vazio/null
```

e:

```text
ACEITA
→ coletorId preenchido
```

---

# 25. Testes de concorrência

## Cenário

Dois coletores tentam aceitar a mesma coleta:

```text
Coleta = PENDENTE

Coletor A → accept
Coletor B → accept
```

## Resultado esperado

```text
um → sucesso
outro → 409 Conflict
```

Nunca:

```text
dois coletores associados
```

---

# 26. Teste de atomicidade

A operação de aceite deve atualizar de forma consistente:

```text
status
coletorId
acceptedAt
updatedAt
```

Não deve ocorrer estado parcial como:

```text
coletorId preenchido
+
status PENDENTE
```

após uma operação bem-sucedida.

---

# 27. Testes de idempotência

Repetir uma operação já concluída não deve causar uma segunda alteração inválida.

Exemplo:

```text
ACEITA → A_CAMINHO
```

Uma segunda tentativa de `start` deve ser rejeitada.

---

# 28. Testes de double-click

Simular duas requisições praticamente simultâneas causadas por interação duplicada.

O backend deve manter a consistência.

---

# 29. Testes de autenticação

## Cadastro

Testar:

```text
dados válidos
e-mail inválido
e-mail duplicado
senha curta
senha sem maiúscula
senha sem minúscula
senha sem número
senha sem caractere especial
confirmação diferente
campos obrigatórios ausentes
```

---

# 30. Testes de login

Testar:

```text
credenciais válidas
senha inválida
e-mail inexistente
usuário inativo
dados incompletos
```

---

# 31. Testes de logout

Verificar:

```text
logout
↓
sessão invalidada
↓
rota protegida
↓
401
```

---

# 32. Testes de `/auth/me`

Verificar:

```text
sessão válida
sessão inválida
sem sessão
usuário inativo
```

---

# 33. Testes de recuperação de senha

Testar:

```text
e-mail válido
e-mail inexistente
token válido
token expirado
token inválido
token reutilizado
nova senha válida
nova senha inválida
confirmação diferente
```

---

# 34. Testes de autorização

## Cliente

Não deve conseguir:

```text
aceitar coleta
iniciar rota
gerenciar usuários
alterar ecoponto
acessar recursos administrativos
```

---

## Coletor

Não deve conseguir:

```text
gerenciar usuários
acessar funções administrativas
operar coleta de outro coletor
```

---

## Administrador

Deve conseguir acessar somente operações administrativas previstas.

Não assumir automaticamente autorização para qualquer operação não documentada.

---

# 35. Testes de propriedade do recurso

Cenário:

```text
CLIENTE A
```

tenta acessar:

```text
coleta do CLIENTE B
```

Resultado:

```text
acesso negado
```

---

# 36. Testes de coletor responsável

Cenário:

```text
coleta.coletorId = A
```

Coletor B tenta:

```text
start
collect
deliver
complete
```

Resultado:

```text
operação rejeitada
```

---

# 37. Testes de usuário inativo

Usuário:

```text
status = INATIVO
```

não deve conseguir executar operações protegidas.

---

# 38. Testes de role

Testar explicitamente:

```text
CLIENTE
COLETOR
ADMIN
```

em cada rota protegida relevante.

---

# 39. Testes de API

Cada endpoint crítico deve possuir testes para:

```text
happy path
validation error
unauthorized
forbidden
not found
conflict
invalid state
```

quando aplicável.

---

# 40. Teste `POST /auth/register`

Esperado:

```text
201 Created
```

para cadastro válido.

Testar:

```text
400
409
```

nos casos correspondentes.

---

# 41. Teste `POST /auth/login`

Esperado:

```text
200 OK
```

para credenciais válidas.

Testar:

```text
400
401
403
```

quando aplicável.

---

# 42. Teste `POST /collections`

Validar:

```text
cliente autenticado
endereço válido
itens válidos
status inicial PENDENTE
usuarioId correto
```

---

# 43. Teste `GET /collections`

Validar que:

```text
cliente A
```

recebe somente:

```text
coletas de A
```

---

# 44. Teste `GET /collections/:id`

Testar:

```text
recurso existente
recurso inexistente
cliente proprietário
cliente não proprietário
coletor autorizado
admin autorizado
```

---

# 45. Teste `GET /collections/available`

Validar que retorna somente coletas elegíveis.

Principalmente:

```text
status = PENDENTE
```

---

# 46. Teste `POST /collections/:id/accept`

Testar:

```text
coletor ativo
coleta pendente
aceite
coletor associado
timestamp
```

Também:

```text
coleta já aceita
coletor não autorizado
usuário inativo
concorrência
```

---

# 47. Teste `POST /collections/:id/start`

Testar:

```text
coletor responsável
status ACEITA
→ A_CAMINHO
```

---

# 48. Teste `POST /collections/:id/collect`

Testar:

```text
coletor responsável
status A_CAMINHO
→ RECOLHIDA
```

---

# 49. Teste `POST /collections/:id/deliver`

Testar:

```text
coletor responsável
status RECOLHIDA
→ ENTREGUE_ECOPONTO
```

---

# 50. Teste `POST /collections/:id/complete`

Testar:

```text
coletor responsável
status ENTREGUE_ECOPONTO
→ CONCLUIDA
```

---

# 51. Testes de resposta da API

Verificar estrutura:

```json
{
  "status": "success",
  "message": "...",
  "data": {}
}
```

e:

```json
{
  "status": "error",
  "message": "...",
  "error": {},
  "data": null
}
```

---

# 52. Testes de códigos HTTP

Validar utilização apropriada de:

```text
200
201
204
400
401
403
404
409
422
429
500
```

somente quando aplicáveis ao endpoint.

---

# 53. Testes de segurança da API

Testar:

```text
rota protegida sem sessão
role incorreta
ID inválido
dados inesperados
filtros inválidos
payload excessivo
tentativas repetidas
```

---

# 54. Testes de entrada

Tentar entradas inválidas como:

```text
strings vazias
strings muito longas
IDs inválidos
status inexistente
enums inválidos
campos desconhecidos
tipos incorretos
```

---

# 55. Testes de MongoDB

Validar persistência:

```text
users
collections
ecopoints
notifications
```

---

# 56. Teste de e-mail único

Criar usuário:

```text
usuario@email.com
```

e tentar criar novamente.

Resultado:

```text
duplicidade rejeitada
```

---

# 57. Teste de senha armazenada

Após cadastro:

```text
senha original
```

não deve existir no documento persistido.

Validar:

```text
senhaHash existe
senha não existe
```

---

# 58. Testes de referências

Validar:

```text
usuarioId → users._id
coletorId → users._id
notifications.usuarioId → users._id
```

---

# 59. Testes de endereço embutido

Criar uma coleta.

Depois alterar o endereço do usuário.

Esperado:

```text
enderecoColeta da coleta
=
endereço original preservado
```

---

# 60. Testes dos itens de descarte

Validar:

```text
pelo menos um item
categoria
quantidade
condicao
```

conforme os requisitos oficiais.

---

# 61. Testes geoespaciais

Quando a funcionalidade estiver implementada, validar:

```text
GeoJSON válido
ordem [longitude, latitude]
índice 2dsphere
consultas por proximidade
```

---

# 62. Testes de aggregation

As aggregations utilizadas no sistema devem ser validadas.

Exemplos:

```text
coletas por status
coletas por período
itens por categoria
relatórios
```

---

# 63. Testes de índices

Verificar a existência e utilização dos índices relevantes quando isso impactar diretamente a aplicação.

Exemplos:

```text
users.email
collections.status
collections.usuarioId
collections.coletorId
geospatial indexes
```

---

# 64. Testes de notificações

Testar:

```text
criação
consulta
marcar como lida
restrição por usuário
```

---

# 65. Teste de isolamento de notificações

Cenário:

```text
Usuário A
```

não pode:

```text
ler
ou marcar como lida
```

uma notificação de:

```text
Usuário B
```

---

# 66. Testes de componentes

Os componentes principais devem ser testados em seus estados relevantes.

Prioridade:

```text
Button
Input
PasswordInput
FormField
Badge
Dialog
Toast
DataTable
CollectionStatusBadge
CollectionTimeline
CollectionActions
```

---

# 67. Teste de Button

Testar:

```text
renderização
click
disabled
loading
variants
keyboard
```

---

# 68. Teste de Input

Testar:

```text
valor
mudança
focus
erro
disabled
label
```

---

# 69. Teste de PasswordInput

Testar:

```text
entrada
mostrar senha
ocultar senha
estado de erro
acessibilidade
```

Nunca registrar valores reais de senha em snapshots ou logs.

---

# 70. Teste de Dialog

Testar:

```text
abertura
fechamento
Escape
foco
ações
```

---

# 71. Teste de CollectionStatusBadge

Cada estado deve possuir representação correta:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 72. Teste de CollectionTimeline

Validar:

```text
etapa atual
etapas concluídas
etapas futuras
```

para cada estado oficial.

---

# 73. Teste de CollectionActions

Exemplos:

```text
PENDENTE → aceitar
ACEITA → iniciar
A_CAMINHO → recolher
RECOLHIDA → entregar
ENTREGUE_ECOPONTO → concluir
CONCLUIDA → nenhuma ação
```

---

# 74. Teste de ações incompatíveis

A UI não deve oferecer ações incompatíveis com o estado.

Exemplo:

```text
PENDENTE
```

não deve apresentar:

```text
Concluir
```

como ação operacional principal.

---

# 75. Testes de formulários

Prioridade:

```text
LoginForm
RegistrationForm
CollectionRequestForm
AddressForm
WasteItemsForm
ForgotPasswordForm
ResetPasswordForm
```

---

# 76. LoginForm

Testar:

```text
submit
credenciais inválidas
loading
erro
sucesso
teclado
labels
```

---

# 77. RegistrationForm

Testar:

```text
PF
PJ
campos condicionais
senha
confirmação
validação
submit
erro
```

---

# 78. CollectionRequestForm

Testar:

```text
endereço
itens
quantidades
agendamento
revisão
submit
erro
sucesso
```

---

# 79. Testes de navegação

Verificar:

```text
links
rotas
redirecionamentos
protected routes
role-based routes
```

---

# 80. ProtectedRoute

Testar:

```text
usuário autenticado
usuário não autenticado
sessão carregando
role incompatível
```

---

# 81. Testes de acessibilidade

Validar automaticamente quando possível:

```text
labels
roles
aria
contraste
estrutura
nomes acessíveis
```

---

# 82. Testes de teclado

Principais componentes:

```text
modal
dropdown
sidebar
tabs
forms
buttons
```

Devem suportar navegação adequada.

---

# 83. Teste de foco

Verificar:

```text
focus visible
foco no modal
retorno do foco
ordem de tabulação
```

---

# 84. Teste de reduced motion

Simular:

```text
prefers-reduced-motion: reduce
```

e validar que animações não essenciais sejam reduzidas ou removidas.

---

# 85. Testes de responsividade

Validar os principais fluxos em:

```text
mobile
tablet
desktop
```

---

# 86. Viewports prioritários

A estratégia de testes deve considerar pelo menos:

```text
mobile pequeno
mobile grande
tablet
desktop
desktop grande
```

Os tamanhos exatos devem ser definidos conforme os dispositivos-alvo do projeto.

---

# 87. Testes de overflow

Verificar que não exista:

```text
scroll horizontal inesperado
texto cortado
botões fora da tela
modal maior que viewport
```

---

# 88. Testes de formulário mobile

Verificar:

```text
teclado virtual
scroll
inputs
botões
validação
submit
```

---

# 89. Testes do fluxo do coletor em mobile

Fluxo completo:

```text
login
↓
coletas disponíveis
↓
aceitar
↓
iniciar
↓
recolher
↓
entregar
↓
concluir
```

---

# 90. Testes E2E — cliente

Jornada principal:

```text
Cadastro
↓
Login
↓
Solicitar coleta
↓
Preencher endereço
↓
Adicionar itens
↓
Enviar
↓
Visualizar PENDENTE
```

---

# 91. Testes E2E — acompanhamento

```text
Cliente
↓
Minhas coletas
↓
Abrir coleta
↓
Visualizar status
↓
Visualizar timeline
```

---

# 92. Testes E2E — coletor

```text
Login
↓
Dashboard
↓
Coletas disponíveis
↓
Abrir coleta
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

# 93. Testes E2E — administrador

Jornadas prioritárias:

```text
Login
↓
Dashboard
↓
Usuários
↓
Consultar usuário
↓
Alterar status
```

e:

```text
Coletas
↓
Consultar coleta
↓
Filtros
↓
Detalhes
```

---

# 94. Testes de regressão

Após alteração relevante, repetir os fluxos impactados.

Principalmente quando houver alteração em:

```text
auth
collections
state machine
API
database
components
routing
```

---

# 95. Testes de integração completos

Priorizar:

```text
Auth
Collection creation
Collection acceptance
Collection state transitions
Notifications
Admin queries
```

---

# 96. Testes de erro de infraestrutura

Quando aplicável, simular:

```text
MongoDB indisponível
API indisponível
timeout
erro inesperado
```

A interface deve apresentar feedback adequado sem expor detalhes internos.

---

# 97. Teste de banco indisponível

Esperado:

```text
erro tratado
```

e não:

```text
stack trace para usuário
```

---

# 98. Testes de timeout

Verificar que uma operação pendente não deixe:

```text
botão eternamente em loading
```

quando houver falha de comunicação.

---

# 99. Retry

Retentativas automáticas devem ser utilizadas somente quando:

```text
forem seguras
```

e não puderem gerar duplicidade ou efeitos indevidos.

---

# 100. Não repetir automaticamente operações críticas sem segurança

Evitar retry automático indiscriminado para:

```text
accept
collect
deliver
complete
```

sem considerar idempotência e consistência.

---

# 101. Testes de performance

Prioridade:

```text
landing page
dashboard
listas
tabelas
consultas administrativas
aggregations
```

---

# 102. Performance de MongoDB

Usar ferramentas como:

```text
explain("executionStats")
```

quando necessário.

Avaliar:

```text
tempo
docsExamined
nReturned
índices
```

---

# 103. Performance de frontend

Avaliar:

```text
tempo de carregamento
renderização
re-renderizações
bundle
assets
motion
```

---

# 104. Performance de listas

Listas grandes devem considerar:

```text
paginação
filtros
virtualização quando realmente necessária
```

Não implementar virtualização prematuramente.

---

# 105. Performance de tabelas

O `DataTable` deve evitar renderizar quantidades excessivas de linhas de uma vez quando a API já oferece paginação.

---

# 106. Performance de imagens

Verificar:

```text
peso
formato
lazy loading
dimensões
```

conforme `docs/16_ASSETS.md`.

---

# 107. Performance de motion

Verificar:

```text
scroll
FPS
layout shift
uso excessivo de blur
animações contínuas
```

---

# 108. Testes de segurança

## Entrada

Testar:

```text
payload inválido
campos inesperados
strings longas
IDs inválidos
filtros inválidos
```

---

# 109. Teste de enumeração

Verificar se endpoints como:

```text
login
forgot-password
```

não revelam informações desnecessárias sobre contas existentes.

---

# 110. Teste de proteção contra abuso

Quando rate limiting estiver implementado, testar:

```text
requisições acima do limite
```

e verificar:

```text
429 Too Many Requests
```

---

# 111. Testes de segredo

Verificar que respostas não contenham:

```text
senha
senhaHash
connection string
session secret
tokens internos
```

---

# 112. Testes de autorização horizontal

Testar acesso:

```text
usuário A
→ recurso de usuário B
```

deve ser rejeitado quando não houver permissão.

---

# 113. Testes de autorização vertical

Testar:

```text
CLIENTE
→ rota ADMIN

COLETOR
→ rota ADMIN
```

deve ser rejeitado.

---

# 114. Testes de escala de privilégio

Verificar que um cliente não possa enviar:

```json
{
  "role": "ADMIN"
}
```

para obter privilégios administrativos.

---

# 115. Testes de segurança do banco

Verificar que filtros enviados pelo usuário não sejam interpretados como operadores MongoDB não autorizados.

---

# 116. Testes de documentação

Quando uma mudança modificar:

```text
endpoint
status
campo
componente
regra
```

verificar se a documentação correspondente também foi atualizada.

---

# 117. Testes de contrato

O frontend deve continuar compatível com o formato documentado pela API.

Validar:

```text
request
response
status
campos
erros
```

---

# 118. Testes de seed

O seed de desenvolvimento deve criar dados suficientes para testar:

```text
ADMIN
CLIENTE PF
CLIENTE PJ
COLETOR
ECOPONTO
```

e coletas em todos os estados oficiais.

---

# 119. Estados para seed

Devem existir exemplos de:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 120. Fixtures

Fixtures devem ser:

```text
previsíveis
mínimas
reutilizáveis
independentes
```

---

# 121. Factories

Factories podem ser usadas para gerar entidades de teste.

Exemplos:

```text
UserFactory
CollectionFactory
NotificationFactory
EcopointFactory
```

A implementação depende da stack escolhida.

---

# 122. Isolamento dos testes

Cada teste deve possuir ambiente controlado.

Evitar que:

```text
teste A
```

modifique o estado usado por:

```text
teste B
```

---

# 123. Cleanup

Após testes que alterem banco:

```text
cleanup
```

ou:

```text
rollback
```

deve ser utilizado conforme a estratégia do ambiente de testes.

---

# 124. Testes determinísticos

Evitar dependências como:

```text
new Date()
Math.random()
ordem não garantida
serviços externos
```

sem controle apropriado.

Quando necessário, utilizar:

```text
mock
fake
fixed date
seeded data
```

---

# 125. Testes de data/hora

Como o fluxo depende de timestamps, testes podem congelar ou controlar o horário quando necessário.

---

# 126. Testes de timezone

Datas exibidas na interface devem continuar coerentes com a política de timezone do projeto.

Validar:

```text
API
→ storage
→ frontend
```

---

# 127. Testes de geolocalização

Quando implementada:

```text
GeoJSON
longitude/latitude
2dsphere
near
geoNear
```

devem possuir testes.

---

# 128. Testes de localização inválida

Exemplos:

```text
longitude fora do intervalo
latitude fora do intervalo
coordinates ausentes
type incorreto
ordem invertida
```

devem ser tratados conforme a validação implementada.

---

# 129. Testes de notificações

Validar que eventos relevantes produzam notificações quando essa funcionalidade estiver habilitada.

Não assumir que toda transição precisa gerar notificação se o requisito não estiver definido.

---

# 130. Testes de componentes visuais

Além de comportamento, verificar:

```text
variantes
estados
responsive behavior
accessibility
```

---

# 131. Visual Regression

Pode ser utilizada uma estratégia de visual regression para componentes e páginas importantes.

Prioridade:

```text
landing page
login
dashboard
collection request
collector dashboard
admin dashboard
```

A ferramenta pode variar conforme a stack.

---

# 132. Snapshots

Snapshots podem ser utilizados com moderação.

Não utilizar snapshot gigante como substituto de testes comportamentais.

---

# 133. Testes de contrato visual

Quando houver mudança no Design System:

```text
Button
Input
Badge
Dialog
Card
```

verificar componentes dependentes.

---

# 134. Testes do Design System

Componentes base devem possuir testes de:

```text
props
variants
states
keyboard
accessibility
responsive behavior
```

---

# 135. Testes dos assets

Assets críticos devem ser verificados quanto a:

```text
existência
carregamento
fallback
dimensões
```

quando necessário.

---

# 136. Testes de fontes

Verificar que a aplicação possua fallback quando a fonte customizada não carregar.

---

# 137. Testes de vídeo

Quando houver vídeo:

```text
carregamento
poster
fallback
muted
responsive
reduced motion
```

---

# 138. Testes de motion

Verificar:

```text
entrada
saída
loading
success
error
reduced motion
```

---

# 139. Testes sem JavaScript

Quando fizer sentido, validar se falhas de JavaScript não deixam a aplicação em estado completamente incompreensível.

Não é necessário garantir funcionalidade completa sem JavaScript em uma aplicação React, salvo requisito específico.

---

# 140. Console

Durante testes E2E e manuais, evitar:

```text
console errors
unhandled promise rejection
404 de assets
```

---

# 141. Network

Verificar que não existam:

```text
requisições duplicadas inesperadas
endpoints inexistentes
loops de requests
payloads incorretos
```

---

# 142. Testes de loading

Todos os fluxos assíncronos importantes devem possuir estados de:

```text
loading
success
error
```

quando aplicável.

---

# 143. Testes de empty state

Testar:

```text
nenhuma coleta
nenhuma notificação
nenhum usuário
nenhum resultado de busca
```

---

# 144. Testes de filtros

Quando filtros forem implementados:

```text
filtro individual
filtros combinados
limpar filtros
paginação
```

---

# 145. Testes de paginação

Validar:

```text
primeira página
página intermediária
última página
sem resultados
limit
```

---

# 146. Testes de ordenação

Quando suportada:

```text
ordem crescente
ordem decrescente
```

e consistência entre frontend e backend.

---

# 147. Testes de tabelas mobile

Validar:

```text
scroll
layout alternativo
leitura
ações
```

---

# 148. Testes de acessibilidade mobile

Validar:

```text
touch
focus
teclado virtual
zoom
orientação
```

quando aplicável.

---

# 149. Testes com leitor de tela

Prioridade:

```text
Login
Cadastro
Solicitação de coleta
Acompanhamento
Operação do coletor
```

---

# 150. Testes de reduced motion

Executar páginas e componentes com:

```text
prefers-reduced-motion: reduce
```

e garantir que:

```text
informação
feedback
navegação
```

continuem funcionando.

---

# 151. Critério de qualidade para uma feature

Uma feature não deve ser considerada concluída apenas porque:

```text
"funciona manualmente"
```

Ela deve possuir, conforme seu impacto:

```text
implementação
validação
testes
tratamento de erro
acessibilidade
responsividade
documentação
```

---

# 152. Definition of Done

Uma tarefa funcional importante deve cumprir:

```text
[ ] Requisito implementado
[ ] Regras de negócio respeitadas
[ ] API documentada
[ ] Banco atualizado quando necessário
[ ] Testes criados
[ ] Testes passando
[ ] Erros tratados
[ ] Responsividade validada
[ ] Acessibilidade validada
[ ] Sem erros no console
[ ] Documentação atualizada
```

---

# 153. Feature crítica — checklist

Para:

```text
auth
collection flow
state machine
admin
```

exigir especialmente:

```text
[ ] Unit
[ ] Integration
[ ] API
[ ] E2E
[ ] Security
[ ] Error paths
```

---

# 154. Critério para merge

Antes de integrar uma alteração:

```text
testes automatizados passando
lint passando
build passando
typecheck passando
```

quando essas etapas fizerem parte da stack.

---

# 155. CI

Quando CI estiver configurado, o pipeline deve executar pelo menos:

```text
install
↓
lint
↓
typecheck
↓
unit tests
↓
integration tests
↓
build
```

E E2E conforme a estratégia definida.

---

# 156. Pull Request

Uma alteração relevante deve informar:

```text
o que mudou
por que mudou
testes executados
impacto
```

---

# 157. Regressão

Após alterações críticas, executar novamente testes relacionados.

Exemplo:

Mudança em:

```text
CollectionService
```

deve reavaliar:

```text
aceitar
iniciar
recolher
entregar
concluir
```

---

# 158. Regressão de API

Mudança em:

```text
06_API.md
```

deve provocar revisão dos:

```text
frontend hooks
API client
integration tests
E2E
```

afetados.

---

# 159. Regressão do banco

Mudança em:

```text
07_DATABASE_MONGODB.md
```

deve revisar:

```text
schemas
queries
indexes
services
tests
seed
```

---

# 160. Regressão do Design System

Mudança em:

```text
10_DESIGN_SYSTEM.md
```

deve revisar os componentes afetados.

---

# 161. Regressão dos componentes

Mudança em:

```text
11_COMPONENTS.md
```

deve revisar:

```text
pages
features
tests visuais
acessibilidade
responsividade
```

---

# 162. Testes manuais

Nem todo comportamento precisa de automação completa.

Testes manuais podem ser utilizados para:

```text
UX
motion
visual
responsive
acessibilidade exploratória
```

---

# 163. Checklist manual de desktop

```text
[ ] Navegação
[ ] Formulários
[ ] Botões
[ ] Modais
[ ] Tabelas
[ ] Filtros
[ ] Gráficos
[ ] Motion
[ ] Assets
```

---

# 164. Checklist manual de mobile

```text
[ ] Navegação
[ ] Touch
[ ] Formulários
[ ] Teclado virtual
[ ] Scroll
[ ] Modal
[ ] Tabelas
[ ] Overflow
[ ] Safe areas
```

---

# 165. Checklist manual de acessibilidade

```text
[ ] Teclado
[ ] Focus
[ ] Contraste
[ ] Labels
[ ] Semântica
[ ] Leitor de tela
[ ] Reduced motion
```

---

# 166. Testes de jornada completa

## Cliente

```text
Cadastro
↓
Login
↓
Solicitar coleta
↓
Acompanhar
```

## Coletor

```text
Login
↓
Visualizar
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

## Administrador

```text
Login
↓
Dashboard
↓
Usuários
↓
Coletas
↓
Relatórios
```

---

# 167. Teste de jornada com erro

As jornadas também devem ser avaliadas quando algo falha.

Exemplo:

```text
Cliente
↓
Solicitar coleta
↓
API falha
↓
mensagem
↓
tentar novamente
```

---

# 168. Teste de recuperação

Depois de uma falha:

```text
usuário consegue continuar?
```

quando isso for apropriado.

---

# 169. Testes de estado inconsistente

Simular dados anômalos quando necessário:

```text
ACEITA sem coletor
CONCLUIDA sem completedAt
PENDENTE com coletor
```

O sistema deve tratar ou identificar inconsistências sem produzir comportamento silenciosamente incorreto.

---

# 170. Testes de auditoria de banco

As queries de auditoria documentadas em:

```text
docs/08_MONGODB_QUERIES.md
```

podem ser utilizadas para validar a integridade dos dados após testes.

---

# 171. Testes de relatórios

Relatórios devem ser comparados com dados conhecidos.

Exemplo:

```text
5 coletas concluídas
```

deve produzir:

```text
5
```

e não depender somente de inspeção visual.

---

# 172. Testes de agregação

Para cada aggregation importante:

```text
fixture conhecida
↓
aggregation
↓
resultado esperado
```

---

# 173. Tolerância de datas

Quando cálculos envolverem tempo:

```text
```

definir claramente a precisão esperada.

Exemplo:

```text
milissegundos
segundos
minutos
```

Não comparar timestamps de maneira frágil quando pequenas diferenças forem esperadas.

---

# 174. Testes de timezone

Utilizar timezone controlado para evitar:

```text
teste passa no computador A
teste falha no computador B
```

---

# 175. Ambiente de teste

O ambiente de teste deve possuir configuração própria.

Exemplo:

```text
.env.test
```

ou mecanismo equivalente.

Não utilizar banco de produção.

---

# 176. Banco de teste

Preferir um banco separado para testes.

Exemplo conceitual:

```text
ecobyte_test
```

---

# 177. Dados de produção

Nunca executar testes destrutivos no banco de produção.

---

# 178. Secrets de teste

Secrets de teste devem ser fictícios ou específicos do ambiente.

---

# 179. Testes externos

Quando integrações externas forem adicionadas futuramente:

```text
email
mapas
storage
```

preferir mocks/fakes no teste unitário e integração real somente nos testes específicos.

---

# 180. Não depender de serviços externos em todos os testes

Evitar:

```text
teste → internet → serviço externo → resultado
```

para toda a suíte.

Isso aumenta:

```text
lentidão
flakiness
custo
```

---

# 181. Flaky tests

Testes instáveis devem ser tratados como problema.

Não simplesmente ignorar uma falha porque:

```text
"às vezes passa"
```

---

# 182. Testes lentos

Identificar testes lentos e avaliar:

```text
fixture
setup
queries
network
E2E desnecessário
```

---

# 183. Testes paralelos

Testes podem executar em paralelo quando forem independentes.

Não permitir que concorrência entre testes altere resultados.

---

# 184. Cobertura

A cobertura deve ser usada como indicador, não como objetivo isolado.

Não buscar:

```text
100%
```

apenas para aumentar número.

Priorizar cobertura de:

```text
regras críticas
fluxos importantes
erros
segurança
```

---

# 185. Cobertura mínima conceitual

Priorizar cobertura especialmente para:

```text
AuthService
CollectionService
State Machine
Authorization
Collection API
Critical Components
```

Os percentuais exatos devem ser definidos conforme a evolução do projeto.

---

# 186. Testes de contrato de tipos

Se TypeScript for utilizado:

```text
typecheck
```

deve fazer parte da qualidade automatizada.

---

# 187. Lint

Se ESLint for utilizado:

```text
lint
```

deve ser executado antes da integração.

---

# 188. Build

O projeto deve possuir build reproduzível.

Testar:

```text
build
```

antes de considerar uma alteração concluída.

---

# 189. Testes no CI

O CI não deve executar somente:

```text
build
```

quando a funcionalidade depender de regras complexas.

Deve executar os testes relevantes.

---

# 190. Falha de teste

Quando um teste falhar:

```text
investigar causa
```

e não:

```text
remover teste
```

sem entender o motivo.

---

# 191. Teste obsoleto

Quando uma regra mudar oficialmente, atualizar o teste junto com a documentação.

Não manter um teste antigo apenas para fazê-lo passar artificialmente.

---

# 192. Testes e documentação

Quando um requisito novo for criado:

```text
requisito
↓
implementação
↓
teste
```

preferencialmente no mesmo ciclo de trabalho.

---

# 193. Traceability

Requisitos importantes devem possuir ligação com testes.

Exemplo:

```text
BR-024
→ teste de concorrência

RF-026
→ teste de aceitação

RF-030
→ teste de recolhimento
```

---

# 194. Matriz de rastreabilidade

Pode ser mantida uma matriz simplificada:

| Requisito / Regra | Teste |
|---|---|
| Cadastro | Auth tests |
| Login | Auth tests |
| RF-026 Aceitar coleta | Collection integration/E2E |
| BR-024 Concorrência | Concurrency test |
| State Machine | State transition tests |
| Permissões | Authorization tests |
| Responsividade | Responsive tests |
| Acessibilidade | Accessibility tests |

A matriz pode ser expandida conforme o projeto.

---

# 195. Testes críticos

Os seguintes fluxos são considerados críticos:

```text
Cadastro
Login
Autorização
Criação de coleta
Aceitação
Máquina de estados
Concorrência
Conclusão
```

---

# 196. Testes prioritários antes da entrega

No mínimo:

```text
[ ] Cadastro
[ ] Login
[ ] Logout
[ ] Criação de coleta
[ ] Listagem de coletas
[ ] Aceitação
[ ] Concorrência
[ ] Fluxo completo do coletor
[ ] Permissões
[ ] API errors
[ ] Persistência MongoDB
[ ] Responsividade
[ ] Acessibilidade
```

---

# 197. Smoke Test

Antes de uma entrega ou deploy:

```text
1. API sobe
2. Banco conecta
3. Frontend carrega
4. Login funciona
5. Cliente cria coleta
6. Coletor aceita coleta
7. Fluxo continua
8. Admin acessa painel
```

---

# 198. Smoke Test pós-deploy

Após deploy:

```text
health check
login
API
database
assets
rotas principais
```

devem ser verificados.

---

# 199. Health Check

Endpoint:

```http
GET /api/v1/health
```

deve retornar estado esperado da API.

---

# 200. Regressão pós-deploy

Quando possível, executar smoke tests automatizados após deploy.

---

# 201. Critério de aprovação

Uma funcionalidade é aprovada quando:

```text
requisitos atendidos
+
regras atendidas
+
testes críticos passando
+
sem regressões conhecidas
```

---

# 202. Critério de bloqueio

Uma entrega deve ser bloqueada quando houver:

```text
falha crítica de autenticação
falha de autorização
corrupção de estado
dupla atribuição de coleta
perda de histórico
erro crítico de persistência
quebra severa de fluxo principal
```

---

# 203. Bugs

Bugs encontrados devem registrar:

```text
descrição
passos para reproduzir
resultado esperado
resultado atual
ambiente
impacto
```

---

# 204. Prioridade de bugs

A prioridade deve ser baseada no impacto real.

Exemplos de alto impacto:

```text
usuário consegue acessar recurso sem permissão
coleta muda para estado inválido
dados são perdidos
login quebra
```

---

# 205. Regressão após correção

Toda correção importante deve receber um teste que impeça a repetição do mesmo bug.

Fluxo:

```text
bug
↓
correção
↓
teste
↓
regressão protegida
```

---

# 206. Testes e documentação de decisões

Quando um teste revelar necessidade de alterar uma regra:

```text
não alterar somente o teste
```

Primeiro verificar:

```text
regra de negócio
requisito
arquitetura
decisão
```

e documentar a alteração.

---

# 207. Testes como fonte de confiança

Testes devem aumentar confiança na implementação.

Não devem ser criados apenas para:

```text
atingir cobertura
```

ou:

```text
cumprir uma formalidade acadêmica
```

---

# 208. Estratégia para novas features

Para cada feature importante:

```text
Requisito
    ↓
Casos de uso
    ↓
Regras
    ↓
Testes
    ↓
Implementação
    ↓
Testes passando
```

Ou, quando apropriado:

```text
teste
    ↓
implementação
```

seguindo TDD ou abordagem equivalente.

---

# 209. TDD

Test-Driven Development pode ser utilizado para regras críticas.

Especialmente:

```text
máquina de estados
serviços
validações
regras de autorização
```

Não é obrigatório para todas as partes do projeto.

---

# 210. Testes de contrato da máquina

A máquina deve possuir um conjunto central de casos.

Exemplo:

```text
PENDENTE + accept → ACEITA
ACEITA + start → A_CAMINHO
A_CAMINHO + collect → RECOLHIDA
RECOLHIDA + deliver → ENTREGUE_ECOPONTO
ENTREGUE_ECOPONTO + complete → CONCLUIDA
```

---

# 211. Testes negativos da máquina

Exemplo:

```text
PENDENTE + complete → erro
ACEITA + deliver → erro
RECOLHIDA + start → erro
CONCLUIDA + accept → erro
```

---

# 212. Testes de invariantes

Invariantes importantes:

```text
PENDENTE → não possui coletor
ACEITA → possui coletor
CONCLUIDA → possui completedAt
```

conforme o modelo adotado.

---

# 213. Teste de histórico

Verificar que, após alterações no perfil do cliente:

```text
coletas antigas
```

continuam contendo:

```text
enderecoColeta
```

original.

---

# 214. Teste de desativação

Ao desativar um usuário:

```text
status = INATIVO
```

o histórico existente deve permanecer.

---

# 215. Teste de notificações

Ao marcar uma notificação:

```text
lida = true
```

somente a notificação correta deve ser alterada.

---

# 216. Teste de ecoponto

Validar:

```text
consulta
dados
status
localização
admin update
```

quando aplicável.

---

# 217. Testes de localização

Quando habilitado:

```text
coordenadas válidas
GeoJSON
2dsphere
consulta geográfica
```

---

# 218. Testes de assets

Validar que a aplicação não possua:

```text
404 de assets
imagens quebradas
fontes inexistentes
vídeos inexistentes
```

---

# 219. Testes de console

Após a execução dos principais fluxos:

```text
console sem erros críticos
```

---

# 220. Testes de rede

Verificar:

```text
nenhuma chamada inesperada
nenhum endpoint inexistente
nenhum loop
```

---

# 221. Testes de memória

Não são obrigatórios em todas as alterações, mas devem ser considerados em funcionalidades com:

```text
listas grandes
vídeos
animações complexas
gráficos
processamento pesado
```

---

# 222. Testes de compatibilidade

Quando necessário, validar navegadores suportados pela aplicação.

A lista oficial deve ser definida pela estratégia de suporte do projeto.

---

# 223. Critério de browser support

Não garantir comportamento perfeito em navegadores fora da matriz oficialmente suportada.

---

# 224. Testes de acessibilidade automatizados

Ferramentas automatizadas podem identificar problemas em:

```text
aria
labels
contraste
estrutura
```

Mas não substituem avaliação manual.

---

# 225. Testes de acessibilidade manuais

Devem avaliar:

```text
navegação
compreensão
foco
ordem
interação
```

---

# 226. Testes de UX

Podem avaliar:

```text
clareza
feedback
hierarquia
navegação
mensagens
```

Especialmente nas jornadas críticas.

---

# 227. Teste de mensagens

Mensagens de erro e sucesso devem ser:

```text
claras
não técnicas
contextuais
```

quando destinadas ao usuário final.

---

# 228. Testes de idioma

A aplicação deve manter consistência linguística.

No frontend principal:

```text
Português-BR
```

quando essa for a configuração do produto.

---

# 229. Teste de formatação

Validar:

```text
datas
horários
números
quantidades
```

de acordo com a localização utilizada.

---

# 230. Testes de dados vazios

Testar campos opcionais ausentes.

A interface não deve mostrar:

```text
undefined
null
NaN
```

ao usuário.

---

# 231. Testes de dados inválidos

A API e a UI devem tratar:

```text
campos ausentes
tipos incorretos
valores fora do domínio
```

---

# 232. Testes de limite

Quando existirem limites de negócio, testar:

```text
mínimo
máximo
abaixo do mínimo
acima do máximo
```

Os limites devem ser definidos nos requisitos antes de serem testados.

---

# 233. Testes de strings

Considerar:

```text
vazia
normal
muito longa
caracteres especiais
acentos
Unicode
```

---

# 234. Testes de busca

Considerar:

```text
texto vazio
texto normal
maiúsculas
minúsculas
acentos
nenhum resultado
```

---

# 235. Testes de filtros combinados

Quando suportados:

```text
status
+
data
+
search
```

devem produzir resultados coerentes.

---

# 236. Testes de paginação e filtros

Ao mudar filtro:

```text
page
```

deve voltar ao estado apropriado.

Evitar:

```text
filtro novo
+
página inválida
```

---

# 237. Testes de atualização da UI

Após mutations:

```text
dados relevantes devem ser atualizados
```

Evitar UI mostrando estado antigo indefinidamente.

---

# 238. Testes de cache

Quando houver cache de servidor:

```text
mutation
↓
invalidation/update
↓
dados consistentes
```

---

# 239. Testes de optimistic UI

Quando utilizada:

```text
sucesso
erro
rollback
```

devem ser testados.

---

# 240. Testes offline

O MVP não exige operação offline completa.

Quando a conexão cair durante uma ação:

```text
não confirmar artificialmente a operação
```

---

# 241. Teste de reconnect

Quando aplicável:

```text
conexão perdida
↓
conexão restabelecida
↓
estado real consultado
```

---

# 242. Testes de múltiplas abas

Quando autenticação ou notificações compartilhadas forem sensíveis a múltiplas abas, testar comportamento conforme a arquitetura final.

---

# 243. Testes de sessão expirada

Simular:

```text
sessão expirada
```

durante uma operação protegida.

Esperado:

```text
401
↓
frontend trata
↓
usuário redirecionado ou reautenticado
```

---

# 244. Teste de sessão inválida

Sessão inválida ou adulterada deve resultar em:

```text
401 Unauthorized
```

quando aplicável.

---

# 245. Teste de CORS

Quando CORS estiver configurado:

```text
origem autorizada → permitido
origem não autorizada → bloqueado
```

---

# 246. Teste de cookies

Quando cookies forem utilizados:

```text
HttpOnly
Secure
SameSite
```

devem ser verificados no ambiente apropriado.

---

# 247. Teste de CSRF

Quando aplicável à arquitetura:

```text
requisição legítima → aceita
requisição cross-site indevida → rejeitada
```

---

# 248. Teste de rate limiting

Quando implementado:

```text
abaixo do limite → permitido
acima do limite → 429
```

---

# 249. Testes de logs

Verificar que logs não contenham:

```text
senha
senhaHash
tokens
segredos
connection strings
```

---

# 250. Testes de produção

Antes do deploy final:

```text
build
lint
typecheck
testes
smoke
configuração
assets
```

---

# 251. Checklist final de testes

```text
[ ] Unit tests
[ ] Component tests
[ ] Integration tests
[ ] API tests
[ ] Database tests
[ ] E2E tests
[ ] Security tests
[ ] Accessibility tests
[ ] Responsive tests
[ ] Performance checks
[ ] Regression checks
[ ] Smoke test
```

---

# 252. Checklist da autenticação

```text
[ ] Cadastro
[ ] Login
[ ] Logout
[ ] /auth/me
[ ] Sessão
[ ] Usuário inativo
[ ] Recuperação
[ ] Reset
[ ] Autorização
```

---

# 253. Checklist da coleta

```text
[ ] Criar
[ ] Listar
[ ] Detalhar
[ ] Aceitar
[ ] Iniciar
[ ] Recolher
[ ] Entregar
[ ] Concluir
[ ] Histórico
```

---

# 254. Checklist da máquina de estados

```text
[ ] Todas as transições válidas
[ ] Todas as transições inválidas
[ ] Estado terminal
[ ] Timestamps
[ ] coletorId
[ ] Concorrência
[ ] Idempotência
[ ] Guards
```

---

# 255. Checklist do coletor

```text
[ ] Dashboard
[ ] Disponíveis
[ ] Aceitar
[ ] Iniciar
[ ] Recolher
[ ] Entregar
[ ] Concluir
[ ] Histórico
[ ] Mobile
```

---

# 256. Checklist administrativo

```text
[ ] Usuários
[ ] Status
[ ] Coletas
[ ] Filtros
[ ] Relatórios
[ ] Permissões
```

---

# 257. Checklist de frontend

```text
[ ] Loading
[ ] Empty
[ ] Error
[ ] Success
[ ] Responsividade
[ ] Acessibilidade
[ ] Focus
[ ] Keyboard
[ ] Reduced Motion
[ ] Sem console errors
```

---

# 258. Checklist de banco

```text
[ ] Persistência
[ ] Referências
[ ] Embedding
[ ] Índices
[ ] Queries
[ ] Aggregations
[ ] Geo queries
[ ] Integridade
```

---

# 259. Checklist de segurança

```text
[ ] Auth
[ ] Authorization
[ ] Validation
[ ] Rate limit
[ ] CORS
[ ] CSRF quando necessário
[ ] Secrets
[ ] Logs
[ ] Dados sensíveis
[ ] MongoDB injection
```

---

# 260. Regra final

O sistema deve ser considerado confiável somente quando seus principais fluxos tiverem sido validados em múltiplas camadas:

```text
Unit
    ↓
Component
    ↓
Integration
    ↓
API
    ↓
E2E
    ↓
Manual
```

Os testes devem acompanhar a evolução do projeto.

Sempre que uma regra, requisito, endpoint, estado, componente ou modelo de dados for alterado:

```text
implementar
    ↓
revisar impacto
    ↓
atualizar testes
    ↓
executar testes
    ↓
atualizar documentação
```

A prioridade é proteger os comportamentos críticos do EcoByte, especialmente:

```text
autenticação
autorização
solicitação de coleta
máquina de estados
concorrência
persistência
fluxo do coletor
```

Nenhum teste deve ser tratado como mera formalidade. Cada teste deve existir para aumentar a confiança de que o sistema continuará funcionando corretamente após mudanças futuras.