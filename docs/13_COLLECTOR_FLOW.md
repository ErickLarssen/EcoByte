# 13 — COLLECTOR FLOW

## 1. Objetivo

Este documento define o fluxo operacional do usuário com:

```text
role = COLETOR
```

O objetivo é estabelecer de forma clara:

- jornada do coletor;
- visualização das coletas;
- aceitação;
- início da rota;
- confirmação do recolhimento;
- entrega no ecoponto;
- conclusão;
- permissões;
- estados da interface;
- regras de transição;
- comportamento esperado no mobile.

Este documento deve permanecer alinhado com:

```text
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/06_API.md
docs/11_COMPONENTS.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/14_STATE_MACHINE.md
```

---

# 2. Papel do coletor

O coletor é o usuário responsável pela operação física de coleta dos resíduos.

Seu fluxo principal é:

```text
visualizar coleta disponível
        ↓
aceitar coleta
        ↓
iniciar rota
        ↓
confirmar recolhimento
        ↓
entregar no ecoponto EcoByte
        ↓
concluir coleta
```

---

# 3. Objetivo operacional

O painel do coletor deve permitir que ele identifique rapidamente:

```text
o que precisa ser coletado
onde
quando
qual o status
qual a próxima ação
```

A interface deve reduzir informações secundárias durante a execução da operação.

---

# 4. Acesso

Somente usuários que possuam:

```text
role = COLETOR
```

e:

```text
status = ATIVO
```

podem executar as operações do fluxo.

Usuários:

```text
CLIENTE
ADMIN
```

não devem executar as ações operacionais exclusivas do coletor.

---

# 5. Entrada no painel

Após autenticação, o coletor deve ser direcionado para sua área operacional.

Estrutura conceitual:

```text
Login
  ↓
Autenticação
  ↓
Validação da role
  ↓
Dashboard do Coletor
```

---

# 6. Dashboard do coletor

O dashboard deve priorizar:

```text
coletas disponíveis
coletas atribuídas
coleta em andamento
próxima ação
status operacional
```

---

# 7. Seções principais

A interface pode possuir:

```text
Dashboard
Coletas disponíveis
Minhas coletas
Rota atual
Notificações
Perfil
```

A nomenclatura final deve permanecer consistente com a navegação real implementada.

---

# 8. Coletas disponíveis

O coletor deve possuir uma área para visualizar coletas que podem ser assumidas.

Endpoint:

```http
GET /api/v1/collections/available
```

---

# 9. Critério de disponibilidade

Uma coleta está disponível quando:

```text
status = PENDENTE
```

e ainda não possui coletor responsável.

---

# 10. Informações de uma coleta disponível

O card/lista da coleta pode apresentar:

```text
data agendada
endereço
bairro
cidade
quantidade de itens
categorias principais
observações relevantes
status
```

Não apresentar informações desnecessárias para a execução.

---

# 11. Visualização de detalhes

O coletor deve poder abrir os detalhes de uma coleta antes de aceitá-la.

Exemplo:

```text
Coleta #123
────────────────────
Data
Endereço
Itens
Quantidade
Observações

[Aceitar coleta]
```

---

# 12. Aceitar coleta

Endpoint:

```http
POST /api/v1/collections/:id/accept
```

Pré-condições:

```text
usuário autenticado
role = COLETOR
status = PENDENTE
```

---

# 13. Resultado da aceitação

Quando a operação for concluída:

```text
status = ACEITA
coletorId = ID_DO_COLETOR
acceptedAt = data/hora atual
```

---

# 14. Concorrência

Dois coletores podem visualizar simultaneamente a mesma coleta.

Somente um deve conseguir aceitá-la.

Exemplo:

```text
Coletor A → aceita
Coletor B → tenta aceitar depois
```

Resultado:

```text
Coletor A → sucesso
Coletor B → 409 Conflict
```

---

# 15. Feedback após aceitação

Após sucesso:

```text
Coleta aceita.
```

A interface deve:

```text
remover a coleta da lista disponível
atualizar a coleta atribuída
mostrar a próxima ação
```

---

# 16. Coleta atribuída

Depois de aceitar uma coleta, ela passa a fazer parte da operação do coletor.

Estado:

```text
ACEITA
```

O painel deve indicar claramente:

```text
Você é o coletor responsável.
```

---

# 17. Próxima ação

Enquanto a coleta estiver:

```text
ACEITA
```

a próxima ação principal deve ser:

```text
Iniciar rota
```

---

# 18. Iniciar rota

Endpoint:

```http
POST /api/v1/collections/:id/start
```

Pré-condições:

```text
role = COLETOR
coletorId = usuário autenticado
status = ACEITA
```

---

# 19. Resultado do início da rota

Após sucesso:

```text
status = A_CAMINHO
startedAt = data/hora atual
```

---

# 20. Interface em A_CAMINHO

A interface deve priorizar:

```text
endereço
cliente
itens
próxima ação
```

A ação principal passa a ser:

```text
Confirmar recolhimento
```

---

# 21. Informações necessárias para a rota

O coletor deve ter acesso às informações necessárias para executar a coleta, como:

```text
endereço
número
complemento
bairro
cidade
estado
CEP
itens
quantidades
observações
```

Somente informações pessoais adicionais necessárias para a operação devem ser exibidas.

---

# 22. Localização

Quando houver coordenadas disponíveis, a coleta poderá apresentar:

```text
localizacao
```

em GeoJSON:

```json
{
  "type": "Point",
  "coordinates": [
    -46.62,
    -23.68
  ]
}
```

A ordem permanece:

```text
[longitude, latitude]
```

---

# 23. Navegação externa

Caso exista integração com serviço de mapas ou navegação, ela deve ser considerada uma funcionalidade complementar.

O fluxo principal não deve depender exclusivamente dela.

A implementação dessa funcionalidade depende dos requisitos aprovados do projeto.

---

# 24. Confirmar recolhimento

Endpoint:

```http
POST /api/v1/collections/:id/collect
```

Pré-condições:

```text
role = COLETOR
coletorId = usuário autenticado
status = A_CAMINHO
```

---

# 25. Resultado do recolhimento

Após confirmação:

```text
status = RECOLHIDA
collectedAt = data/hora atual
```

---

# 26. Ação principal após recolhimento

Com:

```text
status = RECOLHIDA
```

a próxima ação deve ser:

```text
Confirmar entrega no ecoponto
```

---

# 27. Ecoponto central

O destino físico da coleta no MVP é:

```text
EcoByte
```

O EcoByte funciona como:

```text
plataforma digital
+
agente coletor
+
ecoponto central
```

---

# 28. Entrega no ecoponto

Endpoint:

```http
POST /api/v1/collections/:id/deliver
```

Pré-condições:

```text
role = COLETOR
coletorId = usuário autenticado
status = RECOLHIDA
```

---

# 29. Resultado da entrega

Após confirmação:

```text
status = ENTREGUE_ECOPONTO
deliveredAt = data/hora atual
ecopontoId = ID do ecoponto central ativo
```

---

# 30. Conclusão da coleta

Endpoint:

```http
POST /api/v1/collections/:id/complete
```

Pré-condições:

```text
role = COLETOR
coletorId = usuário autenticado
status = ENTREGUE_ECOPONTO
```

---

# 31. Resultado da conclusão

Após sucesso:

```text
status = CONCLUIDA
completedAt = data/hora atual
```

---

# 32. Coleta concluída

Quando:

```text
status = CONCLUIDA
```

a operação está encerrada.

Não existem ações operacionais posteriores no fluxo principal.

---

# 33. Fluxo completo

```text
┌───────────────────────┐
│       PENDENTE        │
│ Coleta disponível     │
└───────────┬───────────┘
            │
            │ aceitar
            ▼
┌───────────────────────┐
│        ACEITA         │
│ Coletor atribuído     │
└───────────┬───────────┘
            │
            │ iniciar rota
            ▼
┌───────────────────────┐
│      A_CAMINHO        │
│ Deslocamento          │
└───────────┬───────────┘
            │
            │ confirmar recolhimento
            ▼
┌───────────────────────┐
│      RECOLHIDA        │
│ Material recolhido    │
└───────────┬───────────┘
            │
            │ entregar
            ▼
┌────────────────────────────┐
│    ENTREGUE_ECOPONTO       │
│ Material entregue          │
└────────────┬───────────────┘
             │
             │ concluir
             ▼
┌───────────────────────┐
│      CONCLUIDA        │
│ Operação encerrada    │
└───────────────────────┘
```

---

# 34. Máquina de estados

As transições permitidas são exclusivamente:

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

---

# 35. Transições inválidas

O coletor nunca deve conseguir executar:

```text
PENDENTE → A_CAMINHO
PENDENTE → RECOLHIDA
PENDENTE → CONCLUIDA
ACEITA → RECOLHIDA
A_CAMINHO → CONCLUIDA
CONCLUIDA → qualquer estado anterior
```

---

# 36. Regra da próxima ação

A interface deve calcular a ação principal com base no estado atual.

| Status | Próxima ação |
|---|---|
| `PENDENTE` | Aceitar coleta |
| `ACEITA` | Iniciar rota |
| `A_CAMINHO` | Confirmar recolhimento |
| `RECOLHIDA` | Confirmar entrega |
| `ENTREGUE_ECOPONTO` | Concluir |
| `CONCLUIDA` | Nenhuma |

---

# 37. Uma coleta por vez

A aplicação não deve assumir que o coletor precisa operar somente uma coleta por vez, a menos que isso seja definido pelos requisitos.

O modelo atual permite que um coletor possua múltiplas coletas atribuídas.

A interface pode organizar essas coletas por:

```text
data
status
prioridade operacional
```

quando esses critérios forem definidos.

---

# 38. Lista de coletas atribuídas

O coletor deve poder visualizar suas próprias coletas operacionais.

Endpoint (`DEC-064`):

```http
GET /api/v1/collections/assigned
```

Os agrupamentos e os status exibidos em cada um permanecem dependentes de `OQ-047`.

A lista pode separar:

```text
Em andamento
Agendadas
Concluídas
```

desde que os agrupamentos sejam derivados dos estados oficiais.

---

# 39. Coletas em andamento

Considerar como operações ativas, conforme contexto:

```text
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
```

A categorização visual não deve criar novos estados de domínio.

---

# 40. Histórico

O coletor deve poder consultar suas coletas concluídas quando essa funcionalidade fizer parte do painel.

Cada registro deve preservar:

```text
data
endereço
itens
status
timestamps
```

---

# 41. Notificações

O coletor pode receber notificações relacionadas às suas operações.

Exemplos:

```text
nova coleta disponível
coleta atribuída
atualização da coleta
```

O conteúdo final das notificações deve acompanhar os requisitos implementados.

---

# 42. Notificação e ação

Uma notificação pode direcionar o coletor para:

```text
detalhes da coleta
lista de coletas
rota
```

quando houver uma ação relacionada.

---

# 43. Dashboard operacional

Estrutura conceitual:

```text
┌──────────────────────────────────┐
│ Olá, [Nome]                      │
│                                  │
│ Coletas disponíveis      12      │
│ Coletas em andamento      2      │
│                                  │
│ ──────────────────────────────── │
│ Próxima coleta                   │
│ Endereço                         │
│ Status                           │
│                                  │
│ [Ação principal]                 │
└──────────────────────────────────┘
```

Os números devem ser carregados da API.

---

# 44. Card de rota

O `CollectorRouteCard` pode apresentar:

```text
status
data agendada
endereço
bairro
cliente, quando necessário
quantidade de itens
ação principal
```

---

# 45. Organização da rota

O conceito de "rota" no MVP está relacionado à execução das coletas atribuídas ao coletor.

Não assumir automaticamente a existência de:

```text
otimização matemática de rota
GPS em tempo real
tracking
roteirização automática
```

sem requisito explícito.

---

# 46. Roteirização automática

A otimização automática das rotas não faz parte das regras atualmente definidas.

Não implementar algoritmo de:

```text
shortest path
vehicle routing problem
```

sem decisão de produto.

---

# 47. Rastreamento em tempo real

O MVP não define rastreamento GPS contínuo do coletor.

Não implementar tracking em tempo real sem requisito.

---

# 48. Localização do coletor

A localização do coletor não deve ser coletada continuamente por padrão.

Somente implementar geolocalização do coletor quando houver requisito específico.

---

# 49. Confirmação de recolhimento

A confirmação representa que:

```text
o material foi fisicamente recolhido
```

Não deve ser tratada somente como uma alteração visual.

O backend deve registrar:

```text
status
collectedAt
```

---

# 50. Confirmação de entrega

A confirmação representa que:

```text
o material foi entregue no ecoponto central EcoByte
```

O backend deve registrar:

```text
status
deliveredAt
```

---

# 51. Conclusão

A conclusão representa:

```text
fluxo operacional encerrado
```

O backend deve registrar:

```text
status
completedAt
```

---

# 52. Proteção contra alterações indevidas

As operações do coletor devem verificar:

```text
autenticação
role
coletorId
status atual
transição permitida
```

---

# 53. Cliente não executa fluxo operacional

O cliente acompanha a coleta, mas não executa:

```text
aceitar
iniciar
recolher
entregar
concluir
```

---

# 54. Administrador e fluxo operacional

O administrador possui acesso administrativo conforme suas permissões.

Não criar automaticamente mecanismos para que o administrador altere livremente qualquer status operacional.

Caso uma ação administrativa sobre o fluxo seja necessária, ela deve ser definida nas regras de negócio.

---

# 55. Segurança da UI

O frontend pode ocultar ações incompatíveis.

Exemplo:

```text
status = ACEITA
```

mostrar:

```text
[Iniciar rota]
```

e não:

```text
[Concluir]
```

Porém, isso é apenas comportamento visual.

A API continua responsável por impedir operações inválidas.

---

# 56. Estado de loading

Ao executar uma ação:

```text
Aceitar
Iniciar
Recolher
Entregar
Concluir
```

o botão deve apresentar estado de processamento.

Exemplo:

```text
[Aceitar coleta]
        ↓
[Aceitando...]
```

---

# 57. Prevenção de ações duplicadas

Enquanto uma operação assíncrona estiver em andamento:

```text
botão → disabled/loading
```

quando apropriado.

O backend continua responsável por garantir consistência em caso de múltiplas requisições.

---

# 58. Sucesso

Após sucesso:

```text
API
 ↓
atualização do status
 ↓
atualização da interface
 ↓
feedback
```

---

# 59. Erro

Em caso de erro:

```text
API
 ↓
erro
 ↓
mensagem clara
 ↓
estado da interface preservado
```

Exemplo:

```text
Não foi possível aceitar esta coleta.
Ela pode ter sido assumida por outro coletor.
```

---

# 60. Conflito de aceitação

Se outro coletor tiver aceitado a coleta primeiro:

```text
HTTP 409
```

A interface deve:

```text
informar o conflito
atualizar a lista
remover a coleta indisponível
```

quando apropriado.

---

# 61. Coleta inexistente

Se a coleta não existir:

```text
404 Not Found
```

O frontend deve apresentar uma mensagem apropriada.

---

# 62. Coleta de outro coletor

Se um coletor tentar executar uma ação sobre uma coleta atribuída a outro coletor, a API deve negar a operação.

O código de resposta deve seguir o contrato da API e a estratégia de exposição de recursos adotada.

Estratégia adotada (`DEC-070`): a resposta é `404 RESOURCE_NOT_FOUND`, sem revelar que a coleta existe e pertence a outro coletor.

---

# 63. Mobile First

O fluxo do coletor deve ser totalmente utilizável em mobile.

Prioridade:

```text
visualizar
aceitar
iniciar
confirmar
```

---

# 64. Ação principal no mobile

A ação atualmente válida deve possuir destaque visual.

Exemplo:

```text
┌─────────────────────────────┐
│ Coleta #123                 │
│                             │
│ Status: A_CAMINHO           │
│ Endereço: ...               │
│                             │
│ [ Confirmar recolhimento ]  │
└─────────────────────────────┘
```

---

# 65. Botões de ação

Evitar apresentar múltiplas ações operacionais concorrentes quando somente uma é válida.

A interface deve favorecer:

```text
próxima ação
```

---

# 66. Timeline

A timeline deve exibir:

```text
✓ PENDENTE
✓ ACEITA
● A_CAMINHO
○ RECOLHIDA
○ ENTREGUE_ECOPONTO
○ CONCLUIDA
```

A representação exata pode variar visualmente.

O estado real continua vindo do backend.

---

# 67. Timestamps

Quando disponíveis, a timeline pode exibir:

```text
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

Exemplo:

```text
Aceita
10/10/2026 às 10:15

Em rota
10/10/2026 às 10:40
```

---

# 68. Histórico operacional

O histórico deve preservar a sequência real de eventos.

Não reconstruir artificialmente o fluxo apenas a partir de:

```text
status atual
```

quando os timestamps estiverem disponíveis.

---

# 69. Comunicação com API

O frontend deve utilizar os endpoints documentados.

Exemplo:

```text
GET  /api/v1/collections/available
POST /api/v1/collections/:id/accept
POST /api/v1/collections/:id/start
POST /api/v1/collections/:id/collect
POST /api/v1/collections/:id/deliver
POST /api/v1/collections/:id/complete
```

---

# 70. Estado do frontend

O frontend pode derivar:

```text
ação disponível
texto
badge
timeline
layout
```

a partir do status retornado pela API.

---

# 71. Estado do backend

O backend permanece responsável por determinar:

```text
status real
coletor responsável
transição válida
permissão
timestamps
```

---

# 72. Fluxo de comunicação

Exemplo de aceite:

```text
CollectorRouteCard
        ↓
useAcceptCollection()
        ↓
API Client
        ↓
POST /collections/:id/accept
        ↓
Backend
        ↓
Service
        ↓
MongoDB
        ↓
Response
        ↓
Cache/UI atualizado
```

---

# 73. Cache

Após mutações relevantes, a aplicação deve atualizar ou invalidar dados relacionados.

Exemplo:

```text
Aceitar coleta
    ↓
remove da lista "disponíveis"
    ↓
adiciona/atualiza "minhas coletas"
```

---

# 74. Offline

O MVP não define operação completa offline.

Não assumir que ações críticas podem ser executadas sem comunicação com o backend.

---

# 75. Falha de conexão

Quando não houver conexão:

```text
mostrar estado de erro
```

e não marcar a coleta visualmente como concluída antes da confirmação do servidor.

---

# 76. Regra de confirmação

A UI só deve considerar uma transição concluída após confirmação bem-sucedida da API.

Exemplo:

```text
clique em "Concluir"
        ↓
request
        ↓
API confirma
        ↓
CONCLUIDA
```

Não:

```text
clique
↓
mostrar CONCLUIDA imediatamente
```

sem confirmação, salvo mecanismos de optimistic update devidamente reconciliados.

---

# 77. Optimistic Update

Optimistic updates podem ser utilizados em operações adequadas, mas não devem comprometer a consistência da máquina de estados.

Quando houver conflito ou erro:

```text
reverter estado visual
```

e sincronizar novamente com a API.

---

# 78. Acessibilidade

Todas as ações do fluxo devem ser:

```text
navegáveis por teclado
visíveis
claramente nomeadas
compatíveis com leitores de tela
```

---

# 79. Reduced Motion

Animações da timeline ou transições de estado devem respeitar:

```text
prefers-reduced-motion
```

---

# 80. Feedback acessível

Mudanças de estado importantes devem possuir feedback textual.

Não depender apenas de:

```text
animação
cor
ícone
```

---

# 81. Erros acessíveis

Mensagens como:

```text
Não foi possível aceitar a coleta.
```

devem estar disponíveis para tecnologias assistivas quando necessário.

---

# 82. Dados exibidos

A interface deve mostrar somente os dados necessários para a operação.

Evitar exposição desnecessária de:

```text
documentos pessoais
dados administrativos
informações internas
```

---

# 83. Histórico do coletor

O coletor pode visualizar suas operações anteriores quando essa funcionalidade estiver implementada.

O histórico deve ser filtrado pelo usuário autenticado no backend.

---

# 84. Ordenação das coletas

Quando a aplicação precisar ordenar as coletas, utilizar critérios documentados.

Possíveis critérios:

```text
dataAgendada
createdAt
status
```

Não inventar uma prioridade operacional sem requisito.

---

# 85. Filtros

Podem existir filtros como:

```text
status
data
bairro
cidade
```

quando houver necessidade real.

Os filtros devem ser suportados pelo backend.

---

# 86. Busca

A busca pode utilizar:

```text
endereço
identificador
bairro
cidade
```

conforme os campos suportados pela API.

---

# 87. Não criar roteirização implícita

A simples ordenação das coletas não significa que o sistema possui:

```text
rota otimizada
```

Não utilizar esse termo sem implementação correspondente.

---

# 88. Ecoponto como destino

O ecoponto da EcoByte é o destino oficial do fluxo.

Não permitir seleção arbitrária de terceiros no MVP.

---

# 89. Terceiros

O MVP não define:

```text
rede de ecopontos parceiros
```

Portanto, o coletor não deve escolher entre múltiplos ecopontos.

---

# 90. Responsabilidade operacional

O fluxo representa:

```text
Cliente
    ↓
solicita
    ↓
EcoByte / Coletor
    ↓
recolhe
    ↓
EcoByte / Ecoponto
    ↓
recebe
```

---

# 91. Critério de conclusão

Uma coleta é considerada concluída somente quando:

```text
status = CONCLUIDA
```

após:

```text
PENDENTE
→ ACEITA
→ A_CAMINHO
→ RECOLHIDA
→ ENTREGUE_ECOPONTO
→ CONCLUIDA
```

---

# 92. Checklist operacional

Antes de uma coleta ser considerada encerrada:

```text
[ ] Coleta foi aceita
[ ] Coletor está associado
[ ] Rota foi iniciada
[ ] Material foi recolhido
[ ] Material foi entregue no ecoponto
[ ] Coleta foi concluída
```

---

# 93. Checklist de implementação

```text
[ ] Dashboard do coletor
[ ] Lista de coletas disponíveis
[ ] Detalhes da coleta
[ ] Aceitar coleta
[ ] Controle de concorrência
[ ] Iniciar rota
[ ] Confirmar recolhimento
[ ] Confirmar entrega
[ ] Concluir coleta
[ ] Timeline
[ ] Status badges
[ ] Feedback de sucesso
[ ] Feedback de erro
[ ] Loading states
[ ] Mobile
[ ] Acessibilidade
[ ] Atualização de cache
[ ] Testes das transições
```

---

# 94. Testes principais

## Aceitação

```text
coleta PENDENTE
+
coletor autenticado
=
ACEITA
```

---

## Início

```text
coleta ACEITA
+
coletor responsável
=
A_CAMINHO
```

---

## Recolhimento

```text
coleta A_CAMINHO
+
coletor responsável
=
RECOLHIDA
```

---

## Entrega

```text
coleta RECOLHIDA
+
coletor responsável
=
ENTREGUE_ECOPONTO
```

---

## Conclusão

```text
coleta ENTREGUE_ECOPONTO
+
coletor responsável
=
CONCLUIDA
```

---

# 95. Testes de falha

Devem ser testados:

```text
coletor não autenticado
cliente tentando aceitar
coletor inativo
coleta inexistente
coleta já aceita
coleta de outro coletor
transição inválida
dupla aceitação
erro de conexão
```

---

# 96. Relação com a máquina de estados

Este documento descreve a experiência operacional.

A definição formal da máquina de estados deve permanecer em:

```text
docs/14_STATE_MACHINE.md
```

Este documento não deve criar estados adicionais.

---

# 97. Relação com a API

Os endpoints utilizados pelo fluxo devem permanecer documentados em:

```text
docs/05_ROUTES.md
docs/06_API.md
```

---

# 98. Relação com componentes

A implementação visual deve utilizar, quando apropriado:

```text
CollectorDashboard
CollectorRouteList
CollectorRouteCard
CollectionSummary
CollectionStatusBadge
CollectionTimeline
CollectionActions
AddressCard
NotificationCenter
```

conforme especificado em:

```text
docs/11_COMPONENTS.md
```

---

# 99. Relação com responsividade

O fluxo deve seguir:

```text
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
```

Especialmente para:

```text
mobile
touch
teclado
feedback
focus
reduced motion
```

---

# 100. Fonte de verdade

As regras operacionais deste fluxo devem permanecer alinhadas com:

```text
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/06_API.md
docs/14_STATE_MACHINE.md
```

Em caso de conflito entre a interface e as regras de negócio:

```text
regra de negócio
    ↓
API
    ↓
interface
```

A interface deve refletir o comportamento autorizado pelo backend.

---

# 101. Regra final

O fluxo do coletor deve ser simples, seguro e orientado à próxima ação.

A experiência ideal deve seguir:

```text
Ver
 ↓
Aceitar
 ↓
Ir
 ↓
Recolher
 ↓
Entregar
 ↓
Concluir
```

Cada etapa deve:

```text
possuir uma ação clara
respeitar o estado atual
registrar o evento correspondente
atualizar a interface
preservar o histórico
```

O sistema não deve inventar etapas, estados ou responsabilidades além das oficialmente definidas para o EcoByte.