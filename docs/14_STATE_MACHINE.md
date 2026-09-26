# 14 — STATE MACHINE

## 1. Objetivo

Este documento define formalmente a máquina de estados das coletas do EcoByte.

A máquina de estados estabelece:

- estados válidos;
- transições permitidas;
- eventos responsáveis pelas transições;
- pré-condições;
- efeitos;
- timestamps;
- permissões;
- regras de concorrência;
- transições inválidas;
- comportamento esperado da API e da interface.

Este documento é a fonte de verdade para o ciclo de vida de uma coleta.

Deve permanecer alinhado com:

```text
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
docs/09_AUTHENTICATION_SECURITY.md
docs/13_COLLECTOR_FLOW.md
```

---

# 2. Conceito

Uma coleta possui exatamente um estado principal em determinado momento.

Fluxo oficial:

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

Não existem estados adicionais no fluxo oficial.

---

# 3. Estados oficiais

Os estados permitidos são:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 4. Estado `PENDENTE`

## 4.1 Significado

A coleta foi criada pelo cliente e está disponível para ser aceita por um coletor.

---

## 4.2 Características

```text
status = PENDENTE
```

A coleta ainda não possui coletor responsável.

Preferencialmente:

```text
coletorId = null
```

ou a convenção equivalente definida no modelo de dados.

---

## 4.3 Timestamps

Após a criação:

```text
createdAt = data/hora da criação
```

Os timestamps operacionais devem permanecer vazios:

```text
acceptedAt = null
startedAt = null
collectedAt = null
deliveredAt = null
completedAt = null
```

---

## 4.4 Ação disponível

Para o coletor:

```text
ACEITAR COLETA
```

---

# 5. Estado `ACEITA`

## 5.1 Significado

Um coletor assumiu a responsabilidade pela coleta.

---

## 5.2 Características

```text
status = ACEITA
coletorId = ID_DO_COLETOR
```

---

## 5.3 Timestamp

Registrar:

```text
acceptedAt = data/hora do aceite
```

---

## 5.4 Ação disponível

Para o coletor responsável:

```text
INICIAR ROTA
```

---

## 5.5 Regra de propriedade

Somente o coletor associado a:

```text
coletorId
```

pode avançar essa coleta para a próxima etapa.

---

# 6. Estado `A_CAMINHO`

## 6.1 Significado

O coletor responsável iniciou a rota e está se deslocando para realizar a coleta.

---

## 6.2 Características

```text
status = A_CAMINHO
```

O coletor continua sendo:

```text
coletorId = ID_DO_COLETOR
```

---

## 6.3 Timestamp

Registrar:

```text
startedAt = data/hora de início
```

---

## 6.4 Ação disponível

Para o coletor responsável:

```text
CONFIRMAR RECOLHIMENTO
```

---

# 7. Estado `RECOLHIDA`

## 7.1 Significado

O material foi fisicamente recolhido pelo coletor.

---

## 7.2 Características

```text
status = RECOLHIDA
```

---

## 7.3 Timestamp

Registrar:

```text
collectedAt = data/hora do recolhimento
```

---

## 7.4 Ação disponível

```text
CONFIRMAR ENTREGA NO ECOPONTO
```

---

# 8. Estado `ENTREGUE_ECOPONTO`

## 8.1 Significado

Os materiais recolhidos foram entregues no ecoponto central da EcoByte.

---

## 8.2 Características

```text
status = ENTREGUE_ECOPONTO
```

---

## 8.3 Timestamp

Registrar:

```text
deliveredAt = data/hora da entrega
```

---

## 8.4 Ação disponível

```text
CONCLUIR COLETA
```

---

# 9. Estado `CONCLUIDA`

## 9.1 Significado

Todas as etapas operacionais da coleta foram concluídas.

---

## 9.2 Características

```text
status = CONCLUIDA
```

---

## 9.3 Timestamp

Registrar:

```text
completedAt = data/hora da conclusão
```

---

## 9.4 Estado terminal

`CONCLUIDA` é um estado terminal da máquina atual.

Não possui transições posteriores no fluxo normal.

---

# 10. Diagrama oficial

```text
                    ┌───────────────┐
                    │   PENDENTE    │
                    └───────┬───────┘
                            │
                     aceitar coleta
                            │
                            ▼
                    ┌───────────────┐
                    │    ACEITA     │
                    └───────┬───────┘
                            │
                      iniciar rota
                            │
                            ▼
                    ┌───────────────┐
                    │   A_CAMINHO   │
                    └───────┬───────┘
                            │
                 confirmar recolhimento
                            │
                            ▼
                    ┌───────────────┐
                    │   RECOLHIDA   │
                    └───────┬───────┘
                            │
                  confirmar entrega
                            │
                            ▼
              ┌─────────────────────────┐
              │   ENTREGUE_ECOPONTO     │
              └────────────┬────────────┘
                           │
                       concluir
                           │
                           ▼
                    ┌───────────────┐
                    │   CONCLUIDA   │
                    └───────────────┘
```

---

# 11. Matriz de transições

| Estado atual | Evento | Estado seguinte | Responsável |
|---|---|---|---|
| `PENDENTE` | Aceitar coleta | `ACEITA` | `COLETOR` |
| `ACEITA` | Iniciar rota | `A_CAMINHO` | `COLETOR` responsável |
| `A_CAMINHO` | Confirmar recolhimento | `RECOLHIDA` | `COLETOR` responsável |
| `RECOLHIDA` | Confirmar entrega | `ENTREGUE_ECOPONTO` | `COLETOR` responsável |
| `ENTREGUE_ECOPONTO` | Concluir coleta | `CONCLUIDA` | `COLETOR` responsável |

---

# 12. Transições permitidas

A máquina possui exatamente cinco transições principais:

```text
T1:
PENDENTE
    →
ACEITA

T2:
ACEITA
    →
A_CAMINHO

T3:
A_CAMINHO
    →
RECOLHIDA

T4:
RECOLHIDA
    →
ENTREGUE_ECOPONTO

T5:
ENTREGUE_ECOPONTO
    →
CONCLUIDA
```

---

# 13. Transições proibidas

Qualquer transição que não esteja explicitamente definida como permitida deve ser rejeitada.

Exemplos:

```text
PENDENTE → A_CAMINHO
PENDENTE → RECOLHIDA
PENDENTE → ENTREGUE_ECOPONTO
PENDENTE → CONCLUIDA

ACEITA → PENDENTE
ACEITA → RECOLHIDA
ACEITA → CONCLUIDA

A_CAMINHO → PENDENTE
A_CAMINHO → ACEITA
A_CAMINHO → CONCLUIDA

RECOLHIDA → PENDENTE
RECOLHIDA → ACEITA
RECOLHIDA → A_CAMINHO
RECOLHIDA → CONCLUIDA

ENTREGUE_ECOPONTO → PENDENTE
ENTREGUE_ECOPONTO → ACEITA
ENTREGUE_ECOPONTO → A_CAMINHO
ENTREGUE_ECOPONTO → RECOLHIDA

CONCLUIDA → qualquer estado
```

---

# 14. Nenhum salto de estado

Não permitir:

```text
PENDENTE → RECOLHIDA
```

nem:

```text
ACEITA → CONCLUIDA
```

nem qualquer outra transição que pule etapas.

---

# 15. Nenhum retorno de estado

A máquina atual é progressiva.

Não permitir:

```text
ACEITA → PENDENTE
A_CAMINHO → ACEITA
RECOLHIDA → A_CAMINHO
ENTREGUE_ECOPONTO → RECOLHIDA
CONCLUIDA → qualquer estado anterior
```

---

# 16. Máquina determinística

Para uma coleta em determinado estado, cada evento válido deve produzir no máximo um estado seguinte.

Exemplo:

```text
PENDENTE + aceitar
    =
ACEITA
```

Não deve existir ambiguidade como:

```text
PENDENTE + aceitar
    → ACEITA
ou
    → A_CAMINHO
```

---

# 17. Regra geral de transição

Toda tentativa de alteração de estado deve validar:

```text
estado atual
+
evento solicitado
+
usuário autenticado
+
role
+
propriedade do recurso
```

Somente após essas verificações a alteração pode ser executada.

---

# 18. Estrutura conceitual de uma transição

```text
Request
    ↓
Autenticação
    ↓
Autorização
    ↓
Buscar coleta
    ↓
Verificar estado atual
    ↓
Verificar responsável
    ↓
Verificar transição permitida
    ↓
Atualizar estado
    ↓
Registrar timestamp
    ↓
Persistir
    ↓
Responder
```

---

# 19. Transição T1 — Aceitar

## Estado de origem

```text
PENDENTE
```

## Evento

```text
accept
```

## Estado de destino

```text
ACEITA
```

## Responsável

```text
COLETOR
```

## Pré-condições

```text
usuário autenticado
role = COLETOR
usuário ativo
coleta existente
status = PENDENTE
```

## Efeitos

```text
status = ACEITA
coletorId = usuário autenticado
acceptedAt = data/hora atual
updatedAt = data/hora atual
```

---

# 20. T1 — Concorrência

A transição de:

```text
PENDENTE
```

para:

```text
ACEITA
```

deve ser protegida contra concorrência.

Exemplo:

```text
Coletor A ─┐
           ├── tentar aceitar ──→ mesma coleta
Coletor B ─┘
```

Somente uma operação deve conseguir concluir a transição.

A outra deve falhar por conflito.

Resposta esperada pela API:

```text
409 Conflict
```

---

# 21. T1 — Condição atômica

A operação deve verificar simultaneamente:

```text
_id
status = PENDENTE
```

antes de atribuir o coletor.

Conceito:

```javascript
findOneAndUpdate(
  {
    _id: collectionId,
    status: "PENDENTE"
  },
  {
    $set: {
      status: "ACEITA",
      coletorId: collectorId,
      acceptedAt: new Date(),
      updatedAt: new Date()
    }
  }
)
```

A implementação pode utilizar mecanismo equivalente.

---

# 22. Transição T2 — Iniciar rota

## Estado de origem

```text
ACEITA
```

## Evento

```text
start
```

## Estado de destino

```text
A_CAMINHO
```

## Responsável

```text
COLETOR responsável
```

## Pré-condições

```text
usuário autenticado
role = COLETOR
usuário ativo
coleta existente
status = ACEITA
coletorId = usuário autenticado
```

## Efeitos

```text
status = A_CAMINHO
startedAt = data/hora atual
updatedAt = data/hora atual
```

---

# 23. Transição T3 — Confirmar recolhimento

## Estado de origem

```text
A_CAMINHO
```

## Evento

```text
collect
```

## Estado de destino

```text
RECOLHIDA
```

## Responsável

```text
COLETOR responsável
```

## Pré-condições

```text
usuário autenticado
role = COLETOR
usuário ativo
coleta existente
status = A_CAMINHO
coletorId = usuário autenticado
```

## Efeitos

```text
status = RECOLHIDA
collectedAt = data/hora atual
updatedAt = data/hora atual
```

---

# 24. Transição T4 — Confirmar entrega

## Estado de origem

```text
RECOLHIDA
```

## Evento

```text
deliver
```

## Estado de destino

```text
ENTREGUE_ECOPONTO
```

## Responsável

```text
COLETOR responsável
```

## Pré-condições

```text
usuário autenticado
role = COLETOR
usuário ativo
coleta existente
status = RECOLHIDA
coletorId = usuário autenticado
existe ecoponto com status = ATIVO
```

## Efeitos

```text
status = ENTREGUE_ECOPONTO
deliveredAt = data/hora atual
ecopontoId = ID do ecoponto central ativo
updatedAt = data/hora atual
```

`ecopontoId` permanece `null` nos estados anteriores e preenchido em `ENTREGUE_ECOPONTO` e `CONCLUIDA` (`DEC-053`).

---

# 25. Transição T5 — Concluir

## Estado de origem

```text
ENTREGUE_ECOPONTO
```

## Evento

```text
complete
```

## Estado de destino

```text
CONCLUIDA
```

## Responsável

```text
COLETOR responsável
```

## Pré-condições

```text
usuário autenticado
role = COLETOR
usuário ativo
coleta existente
status = ENTREGUE_ECOPONTO
coletorId = usuário autenticado
```

## Efeitos

```text
status = CONCLUIDA
completedAt = data/hora atual
updatedAt = data/hora atual
```

---

# 26. Estado terminal

Após:

```text
CONCLUIDA
```

não existe transição operacional normal.

```text
CONCLUIDA
    ↓
FIM
```

---

# 27. Timestamps

Cada transição deve registrar o timestamp correspondente.

| Evento | Timestamp |
|---|---|
| Criação | `createdAt` |
| Aceite | `acceptedAt` |
| Início | `startedAt` |
| Recolhimento | `collectedAt` |
| Entrega | `deliveredAt` |
| Conclusão | `completedAt` |

---

# 28. `updatedAt`

Toda alteração relevante no documento da coleta deve atualizar:

```text
updatedAt
```

---

# 29. Ordem temporal

Os timestamps do fluxo devem respeitar a sequência operacional.

Em condições normais:

```text
createdAt
    ≤
acceptedAt
    ≤
startedAt
    ≤
collectedAt
    ≤
deliveredAt
    ≤
completedAt
```

Timestamps ainda não alcançados devem permanecer ausentes ou `null`, de acordo com a convenção adotada.

---

# 30. Estado e timestamps

## `PENDENTE`

```text
acceptedAt = null
startedAt = null
collectedAt = null
deliveredAt = null
completedAt = null
```

---

## `ACEITA`

```text
acceptedAt != null
startedAt = null
collectedAt = null
deliveredAt = null
completedAt = null
```

---

## `A_CAMINHO`

```text
acceptedAt != null
startedAt != null
collectedAt = null
deliveredAt = null
completedAt = null
```

---

## `RECOLHIDA`

```text
acceptedAt != null
startedAt != null
collectedAt != null
deliveredAt = null
completedAt = null
```

---

## `ENTREGUE_ECOPONTO`

```text
acceptedAt != null
startedAt != null
collectedAt != null
deliveredAt != null
completedAt = null
```

---

## `CONCLUIDA`

```text
acceptedAt != null
startedAt != null
collectedAt != null
deliveredAt != null
completedAt != null
```

---

# 31. `coletorId` por estado

## `PENDENTE`

```text
coletorId = null
```

ou convenção equivalente.

---

## `ACEITA`

```text
coletorId = ID_DO_COLETOR
```

---

## `A_CAMINHO`

```text
coletorId = ID_DO_COLETOR
```

---

## `RECOLHIDA`

```text
coletorId = ID_DO_COLETOR
```

---

## `ENTREGUE_ECOPONTO`

```text
coletorId = ID_DO_COLETOR
```

---

## `CONCLUIDA`

```text
coletorId = ID_DO_COLETOR
```

O responsável histórico deve permanecer associado à coleta após sua conclusão.

---

# 31.1 `ecopontoId` por estado

```text
PENDENTE           → ecopontoId = null
ACEITA             → ecopontoId = null
A_CAMINHO          → ecopontoId = null
RECOLHIDA          → ecopontoId = null
ENTREGUE_ECOPONTO  → ecopontoId preenchido
CONCLUIDA          → ecopontoId preenchido
```

Referência: `DEC-053`.

---

# 32. Regra de imutabilidade do responsável

Depois de:

```text
PENDENTE → ACEITA
```

o `coletorId` não deve ser substituído arbitrariamente durante o fluxo normal.

O fluxo atual não define reatribuição de coleta.

---

# 33. Reatribuição

Não existe, no MVP, uma transição oficial para:

```text
Coletor A
→
Coletor B
```

Não implementar reatribuição sem requisito específico.

---

# 34. Cancelamento

A máquina de estados atual não possui estado:

```text
CANCELADA
```

Portanto, não criar:

```text
PENDENTE → CANCELADA
ACEITA → CANCELADA
```

sem alteração formal desta documentação e dos documentos relacionados.

---

# 35. Pausa

Não existe estado:

```text
PAUSADA
```

O coletor não deve criar um estado informal para representar pausa.

---

# 36. Reabertura

Não existe operação de:

```text
reabrir coleta
```

no fluxo oficial.

Uma coleta:

```text
CONCLUIDA
```

permanece encerrada.

---

# 37. Retentativa

Quando uma requisição falhar por erro técnico, a coleta não deve avançar de estado automaticamente.

Exemplo:

```text
A_CAMINHO
    ↓
request falha
    ↓
A_CAMINHO
```

O estado só muda após confirmação de sucesso da operação.

---

# 38. Falha de conexão

Se a conexão cair durante uma operação:

```text
estado do backend
=
fonte de verdade
```

O frontend não deve assumir que a transição ocorreu.

Após reconexão:

```text
consultar estado atual
```

e sincronizar a interface.

---

# 39. Optimistic Update

Optimistic update pode ser utilizado no frontend, mas deve possuir mecanismo de reconciliação.

Exemplo:

```text
UI assume temporariamente:
ACEITA
```

Se a API retornar erro:

```text
reverter
↓
buscar estado real
```

---

# 40. Fonte de verdade do estado

O estado persistido pelo backend/MongoDB é a fonte de verdade da coleta.

Não utilizar:

```text
estado local do React
```

como fonte definitiva.

---

# 41. Transição por API

As transições podem ser representadas por endpoints específicos:

```text
POST /api/v1/collections/:id/accept
POST /api/v1/collections/:id/start
POST /api/v1/collections/:id/collect
POST /api/v1/collections/:id/deliver
POST /api/v1/collections/:id/complete
```

Cada endpoint deve executar somente a transição correspondente.

---

# 42. Rota genérica de status

Não existe rota genérica de status (`DEC-064`).

```http
PATCH /api/v1/collections/:id/status
```

não deve ser implementada.

---

# 43. Request por evento

Cada transição é solicitada pelo endpoint do seu evento, sem body de status.

Exemplo: para `ACEITA → A_CAMINHO`:

```http
POST /api/v1/collections/:id/start
```

Esse pedido só é válido quando:

```text
estado atual = ACEITA
```

e:

```text
usuário = coletor responsável
```

---

# 44. Evento vs estado

Não confundir:

```text
evento
```

com:

```text
estado
```

Exemplos:

```text
accept
start
collect
deliver
complete
```

são eventos.

Enquanto:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

são estados.

---

# 45. Tabela de eventos

| Evento | Origem | Destino |
|---|---|---|
| `accept` | `PENDENTE` | `ACEITA` |
| `start` | `ACEITA` | `A_CAMINHO` |
| `collect` | `A_CAMINHO` | `RECOLHIDA` |
| `deliver` | `RECOLHIDA` | `ENTREGUE_ECOPONTO` |
| `complete` | `ENTREGUE_ECOPONTO` | `CONCLUIDA` |

---

# 46. Matriz completa de validade

| De | `accept` | `start` | `collect` | `deliver` | `complete` |
|---|---:|---:|---:|---:|---:|
| `PENDENTE` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `ACEITA` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `A_CAMINHO` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `RECOLHIDA` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `ENTREGUE_ECOPONTO` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `CONCLUIDA` | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# 47. Guardas das transições

## T1 — `accept`

```text
authenticated
AND role = COLETOR
AND user.status = ATIVO
AND collection.status = PENDENTE
```

---

## T2 — `start`

```text
authenticated
AND role = COLETOR
AND user.status = ATIVO
AND collection.status = ACEITA
AND collection.coletorId = user.id
```

---

## T3 — `collect`

```text
authenticated
AND role = COLETOR
AND user.status = ATIVO
AND collection.status = A_CAMINHO
AND collection.coletorId = user.id
```

---

## T4 — `deliver`

```text
authenticated
AND role = COLETOR
AND user.status = ATIVO
AND collection.status = RECOLHIDA
AND collection.coletorId = user.id
```

---

## T5 — `complete`

```text
authenticated
AND role = COLETOR
AND user.status = ATIVO
AND collection.status = ENTREGUE_ECOPONTO
AND collection.coletorId = user.id
```

---

# 48. Falha de guarda

Se qualquer guarda obrigatória falhar:

```text
transição não ocorre
```

O estado da coleta permanece inalterado.

---

# 49. Exemplo

Estado atual:

```text
ACEITA
```

Usuário:

```text
COLETOR responsável
```

Evento:

```text
start
```

Resultado:

```text
A_CAMINHO
```

---

# 50. Exemplo inválido

Estado atual:

```text
ACEITA
```

Usuário:

```text
COLETOR responsável
```

Evento:

```text
complete
```

Resultado:

```text
rejeitar
```

Motivo:

```text
evento não é permitido nesse estado
```

---

# 51. Exemplo de usuário incorreto

Estado:

```text
ACEITA
```

Coletor atribuído:

```text
coletorId = A
```

Usuário autenticado:

```text
coletorId = B
```

Evento:

```text
start
```

Resultado:

```text
rejeitar
```

O coletor B não pode iniciar a coleta atribuída ao coletor A.

---

# 52. Erros esperados

Dependendo da situação:

```text
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
```

A escolha deve seguir o contrato definido em:

```text
docs/06_API.md
```

---

# 53. Erro de transição

Quando a operação tentar executar uma transição inválida:

```text
422 Unprocessable Entity
```

Resposta conceitual:

```json
{
  "status": "error",
  "message": "Transição de status inválida.",
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "fields": {
      "currentStatus": "PENDENTE",
      "requestedStatus": "CONCLUIDA"
    }
  },
  "data": null
}
```

---

# 54. Conflito de aceitação

Quando dois coletores tentarem aceitar a mesma coleta:

```text
primeiro → sucesso
segundo → 409 Conflict
```

---

# 55. Estado visual

A interface deve derivar os elementos visuais do estado oficial.

Exemplo:

```text
status = A_CAMINHO
```

pode resultar em:

```text
Badge → A CAMINHO
Timeline → etapa atual
Action → Confirmar recolhimento
```

---

# 56. Próxima ação

| Estado | Ação principal |
|---|---|
| `PENDENTE` | Aceitar coleta |
| `ACEITA` | Iniciar rota |
| `A_CAMINHO` | Confirmar recolhimento |
| `RECOLHIDA` | Confirmar entrega |
| `ENTREGUE_ECOPONTO` | Concluir |
| `CONCLUIDA` | Nenhuma |

---

# 57. Timeline

A timeline deve representar a máquina de estados:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

Pode utilizar estados visuais:

```text
completed
current
upcoming
```

Esses estados visuais não são novos estados de domínio.

---

# 58. Estados visuais vs estados de domínio

Exemplo:

```text
current
```

é um estado visual.

Enquanto:

```text
A_CAMINHO
```

é um estado de domínio.

Não armazenar:

```text
current
completed
upcoming
```

como status da coleta.

---

# 59. Notificações por transição

As transições podem gerar notificações quando essa funcionalidade estiver implementada.

Exemplos:

```text
ACEITA
→ notificar cliente

A_CAMINHO
→ notificar cliente

RECOLHIDA
→ notificar cliente

ENTREGUE_ECOPONTO
→ notificar cliente

CONCLUIDA
→ notificar cliente
```

A implementação definitiva depende do sistema de notificações definido no projeto.

---

# 60. Não adicionar efeitos de negócio implicitamente

Uma mudança de estado não deve automaticamente gerar comportamentos não documentados.

Exemplo:

```text
ACEITA
```

não deve automaticamente:

```text
alterar endereço
cancelar outra coleta
criar nova coleta
```

sem regra explícita.

---

# 61. Persistência

A alteração de estado deve ser persistida no MongoDB.

Fluxo:

```text
evento
    ↓
validação
    ↓
service
    ↓
MongoDB
    ↓
novo estado persistido
```

---

# 62. Atomicidade

Sempre que possível, uma transição deve atualizar de forma atômica:

```text
status
+
identificador do responsável quando aplicável
+
timestamp correspondente
+
updatedAt
```

---

# 63. Aceite atômico

O caso mais crítico é:

```text
PENDENTE
→
ACEITA
```

A atribuição de:

```text
coletorId
```

deve ocorrer junto com a alteração do status.

Não fazer:

```text
1. definir coletor
2. depois alterar status
```

em operações separadas sem proteção contra concorrência.

---

# 64. Falha durante transição

Se a persistência falhar:

```text
estado anterior deve permanecer consistente
```

A API deve retornar erro e não informar sucesso ao usuário.

---

# 65. Idempotência

Repetir uma operação depois que a transição já tiver sido concluída não deve causar uma segunda mudança de estado.

Exemplo:

```text
ACEITA
+
start
→
A_CAMINHO
```

Uma nova chamada equivalente enquanto já estiver em:

```text
A_CAMINHO
```

não deve criar outro estado ou timestamp inválido.

---

# 66. Requisição duplicada

Em caso de double-click:

```text
usuário clica duas vezes
```

o frontend pode bloquear temporariamente o botão.

Mesmo assim:

```text
backend
```

deve permanecer protegido.

---

# 67. Timestamp duplicado

Uma transição já concluída não deve atualizar novamente seu timestamp operacional simplesmente por uma segunda tentativa inválida.

Exemplo:

```text
startedAt
```

não deve ser sobrescrito por uma chamada inválida depois que a coleta já estiver:

```text
A_CAMINHO
```

---

# 68. Histórico

A máquina atual preserva os timestamps das transições.

Isso permite reconstruir a sequência principal:

```text
criação
→ aceite
→ início
→ recolhimento
→ entrega
→ conclusão
```

---

# 69. Auditoria futura

Caso o projeto futuramente necessite de auditoria detalhada, pode ser criada uma estrutura adicional para registrar eventos individualmente.

Isso não faz parte da máquina de estados mínima atual.

Não implementar sem requisito.

---

# 70. Estados de falha

Não criar estados como:

```text
ERRO
FALHA
OFFLINE
```

para representar problemas técnicos.

Falhas técnicas devem ser tratadas como:

```text
erro da operação
```

enquanto a coleta mantém seu estado persistido.

---

# 71. Estado durante erro de rede

Exemplo:

```text
Estado persistido:
A_CAMINHO

Tentativa de collect:
falhou por rede
```

Resultado:

```text
estado continua A_CAMINHO
```

até que uma operação válida seja confirmada pelo backend.

---

# 72. Máquina de estados e banco

O campo principal persistido é:

```text
status
```

Os timestamps complementam o histórico.

---

# 73. Máquina de estados e frontend

O frontend deve:

```text
ler status
↓
determinar estado visual
↓
determinar próxima ação permitida
↓
mostrar UI correspondente
```

O frontend não deve inventar novas transições.

---

# 74. Máquina de estados e backend

O backend deve:

```text
receber evento
↓
identificar usuário
↓
verificar role
↓
buscar coleta
↓
verificar estado
↓
verificar responsável
↓
validar transição
↓
persistir
```

---

# 75. Máquina de estados e MongoDB

MongoDB armazena:

```text
status
coletorId
timestamps
```

A regra de transição é garantida pela camada de negócio.

---

# 76. Máquina de estados e segurança

A segurança deve impedir que um usuário:

```text
altere status arbitrariamente
```

ou:

```text
execute ação de outro coletor
```

---

# 77. Máquina de estados e permissões

Resumo:

```text
CLIENTE
→ não realiza transições operacionais

COLETOR
→ realiza transições operacionais permitidas

ADMIN
→ funções administrativas conforme regras definidas
```

---

# 78. Admin e transições

O administrador não deve ser automaticamente tratado como autorizado a executar qualquer transição operacional.

Caso operações administrativas excepcionais sejam necessárias, devem ser formalmente definidas.

---

# 79. Consistência terminológica

Utilizar exatamente os estados:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

Evitar substituições como:

```text
PENDENTE → AGUARDANDO
ACEITA → ATRIBUÍDA
A_CAMINHO → EM_ROTA
RECOLHIDA → COLETADA
CONCLUIDA → FINALIZADA
```

como valores persistidos.

A interface pode possuir labels amigáveis diferentes, mas o valor de domínio deve permanecer consistente.

---

# 80. Labels amigáveis

A UI pode exibir:

```text
A CAMINHO
```

em vez de:

```text
A_CAMINHO
```

ou:

```text
Concluída
```

em vez de:

```text
CONCLUIDA
```

mas a API e o banco devem utilizar os valores oficiais.

---

# 81. Mapeamento API → UI

Exemplo:

```text
PENDENTE
→ "Pendente"

ACEITA
→ "Aceita"

A_CAMINHO
→ "A caminho"

RECOLHIDA
→ "Recolhida"

ENTREGUE_ECOPONTO
→ "Entregue no ecoponto"

CONCLUIDA
→ "Concluída"
```

---

# 82. Mapeamento de ações

```text
PENDENTE
→ "Aceitar coleta"

ACEITA
→ "Iniciar rota"

A_CAMINHO
→ "Confirmar recolhimento"

RECOLHIDA
→ "Confirmar entrega"

ENTREGUE_ECOPONTO
→ "Concluir coleta"

CONCLUIDA
→ nenhuma ação operacional
```

---

# 83. Teste da máquina

Cada transição válida deve possuir pelo menos um teste automatizado.

---

# 84. Testes de transição

## T1

```text
PENDENTE → ACEITA
```

---

## T2

```text
ACEITA → A_CAMINHO
```

---

## T3

```text
A_CAMINHO → RECOLHIDA
```

---

## T4

```text
RECOLHIDA → ENTREGUE_ECOPONTO
```

---

## T5

```text
ENTREGUE_ECOPONTO → CONCLUIDA
```

---

# 85. Testes de transições inválidas

Devem ser testadas pelo menos:

```text
PENDENTE → A_CAMINHO
PENDENTE → CONCLUIDA
ACEITA → RECOLHIDA
ACEITA → CONCLUIDA
A_CAMINHO → CONCLUIDA
RECOLHIDA → ACEITA
ENTREGUE_ECOPONTO → RECOLHIDA
CONCLUIDA → qualquer estado
```

---

# 86. Testes de permissão

Testar:

```text
CLIENTE tentando aceitar
COLETOR não responsável tentando iniciar
COLETOR não responsável tentando recolher
COLETOR não responsável tentando entregar
COLETOR não responsável tentando concluir
ADMIN realizando operação não autorizada
```

---

# 87. Teste de concorrência

Cenário:

```text
coleta = PENDENTE

coletor A → accept
coletor B → accept
```

Resultado esperado:

```text
A → sucesso
B → conflito
```

ou o inverso, dependendo de qual operação vencer atomicamente.

O importante é:

```text
somente um coletor
```

ser associado.

---

# 88. Testes de timestamps

Validar que:

```text
acceptedAt
```

é preenchido somente após `accept`.

```text
startedAt
```

somente após `start`.

```text
collectedAt
```

somente após `collect`.

```text
deliveredAt
```

somente após `deliver`.

```text
completedAt
```

somente após `complete`.

---

# 89. Testes de ordem temporal

Validar que, quando todos os timestamps existirem:

```text
createdAt
≤ acceptedAt
≤ startedAt
≤ collectedAt
≤ deliveredAt
≤ completedAt
```

---

# 90. Testes do `coletorId`

Validar:

```text
PENDENTE
→ coletorId vazio/null
```

e:

```text
ACEITA+
→ coletorId preenchido
```

---

# 91. Estado persistido vs estado visual

Teste conceitual:

```text
Backend:
A_CAMINHO
```

Frontend deve exibir:

```text
A caminho
```

e:

```text
Confirmar recolhimento
```

Não deve exibir:

```text
Concluída
```

---

# 92. Não duplicar máquina de estados

A máquina de estados deve possuir uma definição central no código.

Evitar repetir listas de status de forma independente em:

```text
componentes
hooks
services
controllers
models
```

---

# 93. Enum central

Preferir uma definição compartilhada:

```ts
enum CollectionStatus {
  PENDENTE = "PENDENTE",
  ACEITA = "ACEITA",
  A_CAMINHO = "A_CAMINHO",
  RECOLHIDA = "RECOLHIDA",
  ENTREGUE_ECOPONTO = "ENTREGUE_ECOPONTO",
  CONCLUIDA = "CONCLUIDA"
}
```

A implementação pode utilizar outro mecanismo equivalente.

Implementação (Fase 2): `backend/src/domain/collection-status.ts` define `COLLECTION_STATUSES` como tupla `as const`, com o tipo `CollectionStatus` derivado, os eventos T1–T5 (`COLLECTION_EVENTS`) e a matriz `COLLECTION_TRANSITIONS`, derivada dos eventos para que não possam divergir.

A coerência entre status, `coletorId`, `ecopontoId` e timestamps (§29–§31.1) é verificada por `backend/src/domain/collection-invariants.ts`.

---

# 94. Transições centralizadas

As transições também devem permanecer centralizadas.

Exemplo conceitual:

```ts
const transitions = {
  PENDENTE: ["ACEITA"],
  ACEITA: ["A_CAMINHO"],
  A_CAMINHO: ["RECOLHIDA"],
  RECOLHIDA: ["ENTREGUE_ECOPONTO"],
  ENTREGUE_ECOPONTO: ["CONCLUIDA"],
  CONCLUIDA: []
}
```

---

# 95. Service de transição

A lógica pode ser concentrada em um service específico.

Exemplo conceitual:

```text
CollectionStateService
```

ou dentro do:

```text
CollectionService
```

O nome final depende da arquitetura.

---

# 96. Regra contra lógica duplicada

Não implementar uma lógica diferente de transição para:

```text
cliente
coletor
admin
```

sem necessidade.

As regras da máquina devem permanecer centralizadas.

---

# 97. Documentação e código

Quando uma nova regra alterar a máquina:

```text
1. atualizar documentação;
2. atualizar enum;
3. atualizar tabela de transições;
4. atualizar services;
5. atualizar API;
6. atualizar UI;
7. atualizar testes;
```

---

# 98. Alteração de estados

Adicionar um estado exige revisar no mínimo:

```text
03_BUSINESS_RULES.md
04_REQUIREMENTS.md
05_ROUTES.md
06_API.md
07_DATABASE_MONGODB.md
13_COLLECTOR_FLOW.md
14_STATE_MACHINE.md
11_COMPONENTS.md
17_TESTING.md
```

quando os documentos existirem e forem afetados.

---

# 99. Alteração de uma transição

Ao adicionar, remover ou alterar uma transição:

```text
origem
evento
destino
permissão
timestamp
endpoint
UI
teste
```

devem ser revisados.

---

# 100. Estado como fonte de verdade

A regra principal é:

```text
status persistido
=
estado real da coleta
```

Toda experiência visual deve derivar desse estado.

---

# 101. Fonte de verdade final

Este documento é a fonte de verdade para a máquina de estados da coleta.

A máquina oficial permanece:

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

Nenhuma transição adicional deve ser introduzida silenciosamente.

---

# 102. Regra final

A máquina de estados do EcoByte deve permanecer:

```text
determinística
progressiva
consistente
auditável
segura
previsível
```

Toda transição deve:

```text
ter estado de origem definido
ter evento definido
ter estado de destino definido
possuir pré-condições
respeitar permissões
registrar o timestamp correspondente
ser persistida pelo backend
ser refletida na interface
possuir cobertura de teste
```

O backend deve ser a autoridade final sobre o estado da coleta.

O frontend deve apenas representar e solicitar as transições permitidas pela máquina.