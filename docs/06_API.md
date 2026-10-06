# 06 — API

## 1. Objetivo

Este documento define o contrato da API REST do EcoByte.

A API é responsável por intermediar toda comunicação entre o frontend e o MongoDB.

Fluxo obrigatório:

```text
Frontend
    ↓
HTTP Request
    ↓
API / Backend
    ↓
Business Rules
    ↓
MongoDB
    ↓
API / Backend
    ↓
HTTP Response
    ↓
Frontend
```

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/07_DATABASE_MONGODB.md
docs/09_AUTHENTICATION_SECURITY.md
docs/14_STATE_MACHINE.md
```

---

# 2. Base da API

A API deve ser versionada.

Base:

```text
/api/v1
```

Exemplo:

```text
https://dominio-do-backend/api/v1/auth/login
```

A URL real de produção deve ser configurada por variável de ambiente.

---

# 3. Padrão REST

A API deve utilizar princípios REST de forma consistente.

### GET

Utilizado para consultas.

```http
GET /api/v1/collections
```

### POST

Utilizado para criação ou execução de ações específicas.

```http
POST /api/v1/collections
POST /api/v1/collections/:id/accept
```

### PATCH

Utilizado para alterações parciais.

```http
PATCH /api/v1/profile
PATCH /api/v1/ecopoint
```

### PUT

Não utilizado no contrato atual (`DEC-065`).

---

# 4. Headers

## 4.1 Content-Type

Requisições com body JSON devem utilizar:

```http
Content-Type: application/json
```

---

## 4.2 Accept

O cliente pode informar:

```http
Accept: application/json
```

---

## 4.3 Autenticação

O mecanismo definitivo de autenticação deve seguir:

```text
docs/09_AUTHENTICATION_SECURITY.md
```

A API deve utilizar o mecanismo oficial definido pelo projeto e não aceitar identificadores de usuário arbitrários enviados pelo frontend para substituir a identidade autenticada.

Mecanismo adotado (`DEC-021`): sessão no servidor identificada por cookie HttpOnly enviado automaticamente pelo navegador. Não há header `Authorization` nem token no body das respostas.

O navegador acessa a API pela mesma origem do frontend, via proxy do Next.js (`DEC-063`).

---

# 5. Formato das respostas

## 5.1 Sucesso

Formato padrão:

```json
{
  "status": "success",
  "message": "Operação realizada com sucesso.",
  "data": {}
}
```

---

## 5.2 Erro

Formato padrão:

```json
{
  "status": "error",
  "message": "Não foi possível realizar a operação.",
  "error": {
    "code": "ERROR_CODE",
    "fields": {}
  },
  "data": null
}
```

---

## 5.3 Campos de erro

O campo `error.code` deve identificar o tipo do erro.

Exemplos:

```text
VALIDATION_ERROR
INVALID_CREDENTIALS
UNAUTHORIZED
FORBIDDEN
RESOURCE_NOT_FOUND
EMAIL_ALREADY_EXISTS
INVALID_STATUS_TRANSITION
COLLECTION_ALREADY_ACCEPTED
USER_INACTIVE
INVALID_TOKEN
TOKEN_EXPIRED
PAYLOAD_TOO_LARGE
INTERNAL_SERVER_ERROR
RATE_LIMIT_EXCEEDED
INVALID_ORIGIN
ECOPOINT_UNAVAILABLE
CONFLICT
USER_HAS_ACTIVE_COLLECTIONS
EMAIL_NOT_VERIFIED
EMAIL_ALREADY_VERIFIED
CEP_SERVICE_UNAVAILABLE
```

`RATE_LIMIT_EXCEEDED` (429): limite de requisições excedido (`DEC-067`).

`INVALID_ORIGIN` (403): requisição de alteração vinda de origem diferente do frontend (`DEC-069`).

`ECOPOINT_UNAVAILABLE` (409): entrega sem ecoponto `ATIVO` para receber o material (`DEC-053`, `DEC-070`).

`CONFLICT` (409): o recurso foi alterado por outra operação entre a tentativa e a verificação; a requisição pode ser repetida.

`USER_HAS_ACTIVE_COLLECTIONS` (409): desativação de um coletor que ainda tem coletas em andamento (`DEC-075`).

`EMAIL_NOT_VERIFIED` (403): solicitação de coleta antes de confirmar o e-mail (`DEC-082`).

`EMAIL_ALREADY_VERIFIED` (409): reenvio do link para uma conta já verificada (`DEC-082`).

`CEP_SERVICE_UNAVAILABLE` (503): o serviço externo de CEP não respondeu (`DEC-081`).

`INVALID_TOKEN` e `TOKEN_EXPIRED` (400) também respondem ao link de confirmação do e-mail inválido ou vencido (`DEC-082`).

O conjunto definitivo de códigos pode crescer conforme a implementação.

Não criar códigos duplicados para representar o mesmo problema.

---

# 6. Códigos HTTP

A API deve utilizar códigos HTTP semanticamente adequados.

| Código | Uso |
|---|---|
| `200 OK` | Operação realizada com sucesso |
| `201 Created` | Recurso criado |
| `204 No Content` | Operação concluída sem conteúdo de resposta |
| `400 Bad Request` | Requisição inválida |
| `401 Unauthorized` | Usuário não autenticado ou credenciais inválidas |
| `403 Forbidden` | Usuário autenticado sem permissão |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Conflito de estado ou recurso existente |
| `413 Payload Too Large` | Corpo da requisição acima do limite (09 §89) |
| `422 Unprocessable Entity` | Dados sintaticamente válidos, mas semanticamente inválidos |
| `429 Too Many Requests` | Excesso de requisições |
| `500 Internal Server Error` | Erro interno inesperado |

---

# 7. Paginação

Endpoints que possam retornar grandes quantidades de dados devem utilizar paginação.

Formato sugerido:

```http
GET /api/v1/admin/users?page=1&limit=20
```

---

## 7.1 Resposta paginada

Formato sugerido:

```json
{
  "status": "success",
  "message": "Usuários encontrados.",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

# 8. Ordenação e filtros

Endpoints de listagem podem utilizar query parameters quando houver requisito para isso.

Exemplo:

```http
GET /api/v1/admin/collections?status=PENDENTE&page=1&limit=20
```

Parâmetros possíveis:

```text
page
limit
status
search
sort
dataInicial
dataFinal
```

Somente implementar filtros realmente necessários ao projeto.

---

# 9. Autenticação

## 9.1 Cadastro

```http
POST /api/v1/auth/register
```

### Body

```json
{
  "nome": "Erick Silva",
  "email": "erick@email.com",
  "senha": "Senha@123",
  "confirmacaoSenha": "Senha@123",
  "telefone": "11999999999",
  "tipoCadastro": "PF"
}
```

Para `PJ`, `dadosEmpresa.razaoSocial` é obrigatório e `dadosEmpresa.nomeFantasia` é opcional (`DEC-066`). Para `PF`, `dadosEmpresa` não é aceito.

| Campo | Obrigatório | Regra |
|---|---|---|
| `nome` | Sim | texto, até 120 caracteres |
| `email` | Sim | formato válido; normalizado em minúsculas; único |
| `senha` | Sim | 8 a 128 caracteres; maiúscula, minúscula, número e caractere especial (`DEC-019`) |
| `confirmacaoSenha` | Sim | igual a `senha` |
| `tipoCadastro` | Sim | `PF` ou `PJ` |
| `telefone` | Não | texto, até 20 caracteres (formato em aberto, `OQ-045`) |
| `dadosEmpresa` | Somente PJ | `razaoSocial` obrigatório, `nomeFantasia` opcional |

Campos não previstos no contrato (incluindo `role` e `status`) são ignorados: o cadastro público sempre cria `CLIENTE` `ATIVO`.

### Respostas

| Status | Código | Situação |
|---|---|---|
| `201` | — | Cadastro realizado; sessão criada (usuário já autenticado) |
| `400` | `VALIDATION_ERROR` | Campo ausente ou inválido; `error.fields` indica cada campo |
| `409` | `EMAIL_ALREADY_EXISTS` | E-mail já cadastrado |
| `429` | `RATE_LIMIT_EXCEEDED` | Limite de cadastros por IP (`DEC-067`) |

---

## 9.2 Resposta de cadastro

Exemplo:

```json
{
  "status": "success",
  "message": "Cadastro realizado com sucesso.",
  "data": {
    "user": {
      "id": "USER_ID",
      "nome": "Erick Silva",
      "email": "erick@email.com",
      "role": "CLIENTE",
      "tipoCadastro": "PF",
      "status": "ATIVO"
    }
  }
}
```

Nunca retornar:

```text
senha
senhaHash
```

---

## 9.3 Login

```http
POST /api/v1/auth/login
```

### Body

```json
{
  "email": "erick@email.com",
  "senha": "Senha@123"
}
```

### Resposta conceitual

```json
{
  "status": "success",
  "message": "Login realizado com sucesso.",
  "data": {
    "user": {
      "id": "USER_ID",
      "nome": "Erick Silva",
      "email": "erick@email.com",
      "role": "CLIENTE",
      "tipoCadastro": "PF",
      "status": "ATIVO"
    }
  }
}
```

O mecanismo de sessão/token deve seguir:

```text
docs/09_AUTHENTICATION_SECURITY.md
```

### Respostas

| Status | Código | Situação |
|---|---|---|
| `200` | — | Login realizado; cookie de sessão emitido |
| `400` | `VALIDATION_ERROR` | E-mail ou senha ausentes ou com formato inválido |
| `401` | `INVALID_CREDENTIALS` | E-mail inexistente ou senha incorreta (mensagem única: "Credenciais inválidas.") |
| `403` | `USER_INACTIVE` | Credenciais corretas, mas usuário `INATIVO` |
| `429` | `RATE_LIMIT_EXCEEDED` | Limite de tentativas por IP (`DEC-067`) |

`USER_INACTIVE` só é informado após a senha ser verificada, para não revelar o status de contas a quem não conhece a senha (09 §81, §87).

---

## 9.4 Logout

```http
POST /api/v1/auth/logout
```

### Autenticação

```text
Sim
```

### Resposta

```json
{
  "status": "success",
  "message": "Logout realizado com sucesso.",
  "data": null
}
```

---

## 9.5 Usuário atual

```http
GET /api/v1/auth/me
```

### Autenticação

```text
Sim
```

### Resposta

```json
{
  "status": "success",
  "message": "Usuário autenticado.",
  "data": {
    "user": {
      "id": "USER_ID",
      "nome": "Erick Silva",
      "email": "erick@email.com",
      "role": "CLIENTE",
      "tipoCadastro": "PF",
      "status": "ATIVO",
      "emailVerificado": true
    }
  }
}
```

`emailVerificado` também aparece no cadastro e no login. Ele é `false` até o cliente confirmar o e-mail (`DEC-082`).

---

## 9.6 Verificação de e-mail (`DEC-082`)

```http
POST /api/v1/auth/verify-email
```

Pública. O corpo é `{ "token": "..." }`, com o token recebido no link `/verificar-email?token=...`. A resposta `200` traz a mensagem "E-mail confirmado com sucesso.". Erros: `400 INVALID_TOKEN` (token inválido ou já usado) e `400 TOKEN_EXPIRED` (vencido, depois de 24 horas).

```http
POST /api/v1/auth/verify-email/resend
```

Com sessão. Envia um novo link e invalida o anterior. Erro: `409 EMAIL_ALREADY_VERIFIED`.

---

## 9.7 Consulta de CEP (`DEC-081`)

```http
GET /api/v1/cep/:cep
```

Com sessão. O CEP pode vir com ou sem hífen.

```json
{
  "address": {
    "cep": "09910720",
    "logradouro": "Rua Manoel da Nóbrega",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "atendido": true
  }
}
```

Erros: `400` (formato), `404` (CEP não encontrado) e `503 CEP_SERVICE_UNAVAILABLE`.

---

# 10. Recuperação de senha

## 10.1 Solicitar recuperação

```http
POST /api/v1/auth/forgot-password
```

### Body

```json
{
  "email": "usuario@email.com"
}
```

### Observação

O sistema não deve revelar informações desnecessárias sobre a existência do e-mail.

A implementação deve seguir:

```text
docs/09_AUTHENTICATION_SECURITY.md
```

---

## 10.2 Redefinir senha

```http
POST /api/v1/auth/reset-password
```

### Body

```json
{
  "token": "TOKEN_TEMPORARIO",
  "novaSenha": "NovaSenha@123",
  "confirmacaoSenha": "NovaSenha@123"
}
```

---

# 11. Perfil

## 11.1 Consultar perfil

```http
GET /api/v1/profile
```

### Autenticação

```text
Sim
```

---

## 11.2 Atualizar perfil

```http
PATCH /api/v1/profile
```

### Body conceitual

```json
{
  "nome": "Novo Nome",
  "telefone": "11999999999"
}
```

Somente campos permitidos devem ser atualizados.

## 11.3 Implementação (`DEC-078`)

**Consultar:** `GET /api/v1/profile` responde `{ "user": { ... } }` no mesmo formato de usuário de §22.1. A resposta nunca traz `senhaHash` nem `documento`.

**Atualizar:** `PATCH /api/v1/profile` aceita só os campos abaixo e responde com a mensagem "Perfil atualizado.":

- `nome`;
- `telefone`: vazio ou `null` remove o telefone;
- `dadosEmpresa` `{ razaoSocial, nomeFantasia }`: somente para PJ. Se um PF enviar esse campo, a resposta é `400` em `fields.dadosEmpresa`.

Os campos `email`, `role`, `tipoCadastro`, `status` e `documento` não fazem parte do contrato e são descartados. Um corpo sem nenhum campo válido responde `400` em `fields.body`.

**Alterar senha:** `PATCH /api/v1/profile/password`.

```json
{
  "senhaAtual": "Senha@123",
  "novaSenha": "NovaSenha@456",
  "confirmacaoNovaSenha": "NovaSenha@456"
}
```

| HTTP | Código | Quando |
|---|---|---|
| `200` | — | senha alterada ("Senha alterada com sucesso."); a sessão atual continua, com novo identificador |
| `400` | `VALIDATION_ERROR` | `senhaAtual` incorreta (`fields.senhaAtual`), nova senha fora da política (`DEC-019`), confirmação diferente ou nova senha igual à atual |
| `429` | `RATE_LIMIT_EXCEEDED` | mais de 10 tentativas em 15 minutos (`DEC-067`) |

---

# 12. Ecoponto

## 12.1 Consultar ecoponto

```http
GET /api/v1/ecopoint
```

### Resposta conceitual

```json
{
  "status": "success",
  "message": "Ecoponto encontrado.",
  "data": {
    "ecopoint": {
      "id": "ECOPONTO_ID",
      "nome": "EcoByte",
      "descricao": "Ecoponto central da EcoByte.",
      "endereco": {},
      "localizacao": {
        "type": "Point",
        "coordinates": [
          -46.62,
          -23.68
        ]
      },
      "horarios": [],
      "status": "ATIVO"
    }
  }
}
```

Implementado (`DEC-076`): consulta pública, sem sessão. Retorna o ecoponto central mesmo `INATIVO`, e a resposta inclui também `updatedAt`. `endereco` segue o formato do endereço da coleta, sem `localizacao`, com `complemento` `null` quando ausente. Sem ecoponto cadastrado: `404 RESOURCE_NOT_FOUND`.

---

## 12.2 Atualizar ecoponto

```http
PATCH /api/v1/ecopoint
```

### Acesso

```text
ADMIN
```

Alteração parcial: somente os campos enviados são atualizados (`DEC-065`).

### Body conceitual

```json
{
  "nome": "EcoByte",
  "descricao": "Ecoponto central da EcoByte.",
  "endereco": {},
  "localizacao": {
    "type": "Point",
    "coordinates": [
      -46.62,
      -23.68
    ]
  },
  "horarios": [],
  "status": "ATIVO"
}
```

Implementado (`DEC-076`):

- campos aceitos: `nome`, `descricao` (vazio ou `null` remove), `endereco` (substituído por inteiro), `localizacao` (`null` remove) e `status` (`ATIVO`/`INATIVO`);
- `horarios` não é aceito enquanto `OQ-005` estiver aberta, e é descartado como qualquer campo não previsto;
- a resposta `200` é `{ "ecopoint": { ... } }`, com a mensagem "Ecoponto atualizado.".

| HTTP | Código | Quando |
|---|---|---|
| `400` | `VALIDATION_ERROR` | campo inválido, ou nenhum campo válido enviado (`fields.body`) |
| `401` | `UNAUTHORIZED` | sem sessão |
| `403` | `FORBIDDEN` | role diferente de `ADMIN` |
| `404` | `RESOURCE_NOT_FOUND` | nenhum ecoponto cadastrado |

---

# 13. Coletas

## 13.1 Criar coleta

```http
POST /api/v1/collections
```

Regras adicionais (`DEC-081`, `DEC-082`):

- **E-mail não confirmado:** responde `403 EMAIL_NOT_VERIFIED`;
- **Área de atendimento:** `enderecoColeta.cidade` e `estado` precisam ser Diadema-SP, senão `400` em `enderecoColeta.cidade`, e são gravados como `Diadema` e `SP`;
- **CEP:** inexistente ou de fora da área responde `400` em `enderecoColeta.cep`. Com o serviço de CEP indisponível, vale só a validação de cidade e UF.

### Acesso

```text
CLIENTE
```

### Body conceitual

```json
{
  "enderecoColeta": {
    "logradouro": "Rua Exemplo",
    "numero": "100",
    "complemento": "",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900000",
    "localizacao": {
      "type": "Point",
      "coordinates": [
        -46.62,
        -23.68
      ]
    }
  },
  "itensDescarte": [
    {
      "categoria": "INFORMATICA",
      "quantidade": 1,
      "condicao": "USADO"
    }
  ],
  "observacoes": "Retirar no período da manhã."
}
```

| Campo | Obrigatório | Regra |
|---|---|---|
| `enderecoColeta.logradouro`, `numero`, `bairro`, `cidade` | Sim | texto, até 120 caracteres (`numero` até 20) |
| `enderecoColeta.complemento` | Não | texto, até 120 caracteres |
| `enderecoColeta.estado` | Sim | sigla da UF, 2 letras |
| `enderecoColeta.cep` | Sim | 8 dígitos; hífen e pontos são removidos |
| `enderecoColeta.localizacao` | Não | GeoJSON `Point`, `[longitude, latitude]` dentro dos limites |
| `itensDescarte` | Sim | pelo menos 1 item |
| `itensDescarte[].categoria`, `condicao` | Sim | texto, até 60 caracteres, normalizado em maiúsculas (`OQ-007`, `OQ-010`) |
| `itensDescarte[].quantidade` | Sim | número maior que zero (unidade em aberto, `OQ-009`) |
| `observacoes` | Não | texto, até 1000 caracteres |

`dataAgendada` não é aceito enquanto `OQ-020` estiver aberta; se enviado, é ignorado. Campos não previstos também são ignorados, inclusive `status`, `usuarioId` e `coletorId`.

### Regras

A API deve:

1. autenticar o cliente;
2. validar os dados;
3. criar o documento;
4. associar `usuarioId` ao usuário autenticado;
5. definir:

```text
status = PENDENTE
```

6. manter:

```text
coletorId = null
```

quando a coleta ainda não estiver atribuída.

### Respostas

| Status | Código | Situação |
|---|---|---|
| `201` | — | Coleta criada; `data.collection` na visão do cliente (§13.4) |
| `400` | `VALIDATION_ERROR` | Campo ausente ou inválido |
| `401` | `UNAUTHORIZED` | Sem sessão |
| `403` | `FORBIDDEN` | Usuário não é `CLIENTE` |

---

## 13.2 Listar minhas coletas

```http
GET /api/v1/collections?page=1&limit=20
```

### Acesso

```text
CLIENTE
```

A API deve filtrar os resultados pelo usuário autenticado.

Resposta paginada (§7.1), mais recentes primeiro. `page` padrão `1`; `limit` padrão `20`, máximo `100`. Valores inválidos retornam `400 VALIDATION_ERROR`.

---

## 13.3 Consultar coleta

```http
GET /api/v1/collections/:id
```

O backend deve verificar se o usuário possui permissão para visualizar o recurso.

| Perfil | Pode consultar |
|---|---|
| `CLIENTE` | as próprias coletas |
| `COLETOR` | coletas `PENDENTE` e as atribuídas a ele |
| `ADMIN` | não utiliza esta rota (`403`); usa `/admin/collections/:id` |

Coleta inexistente, fora do alcance do usuário ou com `:id` inválido: `404 RESOURCE_NOT_FOUND` (`DEC-070`).

---

## 13.4 Representação da coleta

A API retorna visões diferentes conforme o perfil (`DEC-070`).

Campos comuns:

```json
{
  "id": "COLLECTION_ID",
  "status": "ACEITA",
  "enderecoColeta": {},
  "itensDescarte": [],
  "dataAgendada": null,
  "observacoes": null,
  "createdAt": "2026-09-26T10:00:00.000Z",
  "updatedAt": "2026-09-26T10:30:00.000Z",
  "acceptedAt": "2026-09-26T10:30:00.000Z",
  "startedAt": null,
  "collectedAt": null,
  "deliveredAt": null,
  "completedAt": null
}
```

Visão do cliente: acrescenta `coletor`, com `{ "nome": "..." }` ou `null` enquanto não houver coletor.

Visão do coletor: acrescenta `cliente`, com `{ "nome": "...", "telefone": "..." }` somente nas coletas atribuídas a ele; nas coletas `PENDENTE`, `cliente` é `null`.

Nas visões do cliente e do coletor, identificadores internos (`usuarioId`, `coletorId`, `ecopontoId`), e-mails e documentos não fazem parte da resposta. A visão administrativa (§23.2, `DEC-075`) inclui `id`, nome, e-mail e telefone do cliente e do coletor.

---

# 14. Coletas disponíveis

## 14.1 Listar coletas pendentes

```http
GET /api/v1/collections/available
```

### Acesso

```text
COLETOR
```

### Regra

Retornar somente coletas elegíveis para aceitação.

Regra principal:

```text
status = PENDENTE
```

Resposta paginada (§7.1) na visão do coletor, mais antigas primeiro (ordem de solicitação, `DEC-070`).

---

## 14.2 Listar coletas atribuídas

```http
GET /api/v1/collections/assigned
```

### Acesso

```text
COLETOR
```

### Regra

Retornar somente coletas com:

```text
coletorId = usuário autenticado
```

Referência: `RF-028`, `DEC-064`.

Resposta paginada (§7.1) na visão do coletor, mais recentes primeiro, em todos os status.

---

## 14.3 Respostas comuns das ações do coletor (§15–§19)

Todas as ações exigem `COLETOR` e respondem `200` com `data.collection` na visão do coletor.

| Status | Código | Situação |
|---|---|---|
| `401` | `UNAUTHORIZED` | Sem sessão |
| `403` | `FORBIDDEN` | Usuário não é `COLETOR` |
| `404` | `RESOURCE_NOT_FOUND` | Coleta inexistente, `:id` inválido ou coleta atribuída a outro coletor |
| `409` | `COLLECTION_ALREADY_ACCEPTED` | `accept` em coleta que não está mais `PENDENTE` |
| `409` | `ECOPOINT_UNAVAILABLE` | `deliver` sem ecoponto `ATIVO` |
| `422` | `INVALID_STATUS_TRANSITION` | Evento incompatível com o status atual; `error.fields` traz `currentStatus` e `requestedStatus` |
| `409` | `CONFLICT` | O estado mudou durante a operação (concorrência); a ação pode ser repetida |

Repetir uma ação já concluída (por exemplo, `start` em coleta `A_CAMINHO`) responde `422` e não altera status nem timestamps.

---

# 15. Aceitar coleta

## 15.1 Endpoint

```http
POST /api/v1/collections/:id/accept
```

### Acesso

```text
COLETOR
```

### Estado esperado

```text
PENDENTE
```

### Estado resultante

```text
ACEITA
```

### Operação

A atualização deve ser feita de forma segura contra concorrência.

Conceitualmente:

```text
UPDATE collection
WHERE id = :id
AND status = PENDENTE
```

Ao sucesso:

```text
coletorId = usuário autenticado
status = ACEITA
acceptedAt = data/hora atual
```

Se a coleta já tiver sido aceita:

```text
409 Conflict
```

---

# 16. Iniciar rota

## 16.1 Endpoint

```http
POST /api/v1/collections/:id/start
```

### Acesso

```text
COLETOR
```

### Pré-condições

```text
usuário = coletor responsável
status = ACEITA
```

### Transição

```text
ACEITA → A_CAMINHO
```

### Dados atualizados

```text
status
startedAt
```

---

# 17. Confirmar recolhimento

## 17.1 Endpoint

```http
POST /api/v1/collections/:id/collect
```

### Acesso

```text
COLETOR
```

### Pré-condições

```text
usuário = coletor responsável
status = A_CAMINHO
```

### Transição

```text
A_CAMINHO → RECOLHIDA
```

### Dados atualizados

```text
status
collectedAt
```

---

# 18. Confirmar entrega

## 18.1 Endpoint

```http
POST /api/v1/collections/:id/deliver
```

### Acesso

```text
COLETOR
```

### Pré-condições

```text
usuário = coletor responsável
status = RECOLHIDA
```

### Transição

```text
RECOLHIDA → ENTREGUE_ECOPONTO
```

### Dados atualizados

```text
status
deliveredAt
ecopontoId
```

`ecopontoId` recebe o identificador do ecoponto central com `status = ATIVO` (`DEC-053`).

Se não existir ecoponto ativo, a operação falha e nenhum campo é alterado.

---

# 19. Concluir coleta

## 19.1 Endpoint

```http
POST /api/v1/collections/:id/complete
```

### Acesso

```text
COLETOR
```

### Pré-condições

```text
usuário = coletor responsável
status = ENTREGUE_ECOPONTO
```

### Transição

```text
ENTREGUE_ECOPONTO → CONCLUIDA
```

### Dados atualizados

```text
status
completedAt
```

---

# 20. Atualização genérica de status

Não existe endpoint genérico de atualização de status (`DEC-064`).

```http
PATCH /api/v1/collections/:id/status
```

não faz parte do contrato e não deve ser implementado.

As transições ocorrem exclusivamente pelos endpoints de ação das seções 15 a 19.

---

# 21. Estados das coletas

A API deve utilizar exclusivamente os seguintes estados:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

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

---

# 22. Usuários — administrador

## 22.1 Listar usuários

```http
GET /api/v1/admin/users
```

### Acesso

```text
ADMIN
```

Pode utilizar:

```text
page
limit
search
role
tipoCadastro
status
```

quando esses filtros forem necessários.

Implementado (`DEC-075`): somente `page` e `limit` (06 §7), com os mais recentes primeiro. Cada item:

```json
{
  "id": "USER_ID",
  "nome": "Mariana Oliveira",
  "email": "mariana@ecobyte.local",
  "telefone": "11987654321",
  "role": "CLIENTE",
  "tipoCadastro": "PF",
  "dadosEmpresa": null,
  "status": "ATIVO",
  "createdAt": "2026-09-26T10:00:00.000Z",
  "updatedAt": "2026-09-26T10:00:00.000Z"
}
```

---

## 22.2 Consultar usuário

```http
GET /api/v1/admin/users/:id
```

### Acesso

```text
ADMIN
```

Nunca retornar informações sensíveis desnecessárias.

Resposta: `{ "user": { ... } }`, no mesmo formato da lista. `senhaHash` e `documento` nunca fazem parte da resposta.

---

## 22.3 Atualizar status

```http
PATCH /api/v1/admin/users/:id/status
```

### Body

```json
{
  "status": "INATIVO"
}
```

Valores permitidos:

```text
ATIVO
INATIVO
```

Resposta `200`: `{ "user": { ... } }`, com a mensagem "Usuário ativado." ou "Usuário desativado.". Repetir o status atual também responde `200`.

| HTTP | Código | Quando |
|---|---|---|
| `400` | `VALIDATION_ERROR` | `status` ausente ou fora de `ATIVO`/`INATIVO` |
| `403` | `FORBIDDEN` | usuário-alvo com role `ADMIN`, inclusive o próprio administrador |
| `404` | `RESOURCE_NOT_FOUND` | usuário inexistente ou `:id` inválido |
| `409` | `USER_HAS_ACTIVE_COLLECTIONS` | coletor com coletas de `ACEITA` a `ENTREGUE_ECOPONTO` |

---

# 23. Coletas — administrador

## 23.1 Listar coletas

```http
GET /api/v1/admin/collections
```

### Acesso

```text
ADMIN
```

Pode possuir filtros como:

```text
status
coletorId
usuarioId
dataInicial
dataFinal
page
limit
```

Somente implementar filtros realmente necessários.

Implementado (`DEC-075`): `page`, `limit` e `status`, que é opcional e aceita um dos status oficiais. Um valor fora da lista responde `400 VALIDATION_ERROR`. A lista vem com as mais recentes primeiro.

---

## 23.2 Consultar coleta

```http
GET /api/v1/admin/collections/:id
```

### Acesso

```text
ADMIN
```

Deve retornar as informações necessárias ao acompanhamento administrativo.

Visão administrativa (`DEC-075`): os campos comuns (§13.4), mais `cliente` e `coletor`, cada um como `{ "id", "nome", "email", "telefone" }` ou `null`. A lista usa a mesma representação. Os demais identificadores internos (`ecopontoId`) e documentos não fazem parte da resposta.

---

# 24. Notificações

## 24.1 Listar notificações

```http
GET /api/v1/notifications
```

### Acesso

```text
Autenticado
```

O usuário somente pode receber suas próprias notificações.

---

## 24.2 Marcar como lida

```http
PATCH /api/v1/notifications/:id/read
```

### Acesso

```text
Autenticado
```

A API deve verificar se a notificação pertence ao usuário autenticado.

---

## 24.3 Implementação (`DEC-077`)

**Listagem:** aceita `page` e `limit`, com as mais recentes primeiro, mais um filtro opcional `lida=true|false`. Com `lida=false&limit=1`, o `pagination.total` é o contador de não lidas usado pelo frontend. Cada item:

```json
{
  "id": "NOTIFICATION_ID",
  "tipo": "COLETA_ACEITA",
  "titulo": "Coleta aceita",
  "mensagem": "Um coletor EcoByte aceitou a sua coleta.",
  "referencia": { "tipo": "COLETA", "id": "COLLECTION_ID" },
  "lida": false,
  "createdAt": "2026-09-30T13:00:00.000Z"
}
```

**Marcar como lida:** responde `200` com `{ "notification": { ... } }` e pode ser repetida sem erro. Uma notificação de outro usuário, inexistente ou com `:id` inválido responde `404 RESOURCE_NOT_FOUND`.

**Geração:** a API registra uma notificação para o cliente da coleta após cada transição confirmada:

| Ação | Tipo |
|---|---|
| `accept` | `COLETA_ACEITA` |
| `start` | `COLETA_A_CAMINHO` |
| `collect` | `COLETA_RECOLHIDA` |
| `deliver` | `COLETA_ENTREGUE_ECOPONTO` |
| `complete` | `COLETA_CONCLUIDA` |

---

# 25. Relatórios

## 25.1 Relatórios administrativos

```http
GET /api/v1/admin/reports
```

### Acesso

```text
ADMIN
```

Os dados devem ser produzidos por consultas adequadas ao MongoDB, incluindo agregações quando necessário.

Os relatórios definitivos ainda dependem das decisões do projeto.

---

# 26. Regras de autorização

## 26.1 Cliente

O cliente pode:

```text
criar suas próprias coletas
consultar suas próprias coletas
consultar seu próprio perfil
atualizar seu próprio perfil
consultar informações públicas do ecoponto
consultar suas próprias notificações
```

Não pode:

```text
aceitar coletas
alterar status operacional
gerenciar usuários
alterar ecoponto
consultar dados administrativos
```

---

## 26.2 Coletor

O coletor pode:

```text
consultar coletas disponíveis
aceitar coleta
iniciar rota
confirmar recolhimento
confirmar entrega
concluir coleta
consultar coletas relacionadas à sua operação
```

Não pode:

```text
gerenciar usuários
alterar configurações administrativas
assumir coleta de outro coletor
ignorar a máquina de estados
```

---

## 26.3 Administrador

O administrador pode acessar as funcionalidades administrativas previstas no sistema.

As permissões devem continuar sendo verificadas pelo backend.

---

# 27. Erros de autenticação

## 27.1 Usuário não autenticado

Quando uma rota protegida for acessada sem autenticação:

```text
401 Unauthorized
```

Exemplo:

```json
{
  "status": "error",
  "message": "Autenticação necessária.",
  "error": {
    "code": "UNAUTHORIZED",
    "fields": {}
  },
  "data": null
}
```

---

## 27.2 Sem permissão

Quando o usuário estiver autenticado, mas não possuir a role ou permissão necessária:

```text
403 Forbidden
```

Código: `FORBIDDEN`.

---

## 27.3 Usuário desativado com sessão ativa

Se um usuário for desativado (`INATIVO`) enquanto possui sessão, a próxima requisição protegida retorna `403` com `USER_INACTIVE` e a sessão é encerrada no servidor (09 §19, `DEC-021`).

Se o usuário da sessão não existir mais, a sessão é encerrada e a resposta é `401 UNAUTHORIZED`.

---

# 28. Erros de recurso

## 28.1 Recurso inexistente

```text
404 Not Found
```

Exemplo:

```json
{
  "status": "error",
  "message": "Coleta não encontrada.",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "fields": {}
  },
  "data": null
}
```

---

# 29. Erros de validação

Quando dados forem inválidos:

```text
400 Bad Request
```

ou:

```text
422 Unprocessable Entity
```

conforme o caso e a convenção adotada pelo backend.

Exemplo:

```json
{
  "status": "error",
  "message": "Existem campos inválidos.",
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "email": "Informe um e-mail válido.",
      "senha": "A senha não atende aos requisitos mínimos."
    }
  },
  "data": null
}
```

---

# 30. Erro de conflito

Conflitos de estado ou unicidade devem utilizar:

```text
409 Conflict
```

Exemplo: dois coletores tentando aceitar a mesma coleta.

```json
{
  "status": "error",
  "message": "A coleta já foi aceita por outro coletor.",
  "error": {
    "code": "COLLECTION_ALREADY_ACCEPTED",
    "fields": {}
  },
  "data": null
}
```

---

# 31. Transições inválidas

Quando uma operação tentar executar uma transição não permitida:

```text
422 Unprocessable Entity
```

Exemplo:

```text
PENDENTE → CONCLUIDA
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

# 32. Dados sensíveis

A API nunca deve retornar:

```text
senha
senhaHash
tokens privados
segredos internos
credenciais de infraestrutura
```

exceto quando um token fizer parte explicitamente de um fluxo seguro e documentado.

Mesmo nesses casos, nunca retornar segredos internos da aplicação.

---

# 33. Segurança

A API deve:

- validar toda entrada recebida;
- autenticar rotas protegidas;
- autorizar operações por role;
- impedir acesso a recursos de outros usuários;
- proteger credenciais;
- utilizar variáveis de ambiente para segredos;
- evitar exposição de detalhes internos de erros;
- aplicar proteção contra abuso nas rotas sensíveis;
- respeitar as regras definidas em `docs/09_AUTHENTICATION_SECURITY.md`.

---

# 34. Rate Limiting

Rotas especialmente sensíveis devem considerar limitação de requisições.

Prioridade:

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Os limites definitivos devem ser definidos na configuração de segurança da aplicação.

---

# 35. Idempotência e operações críticas

Operações que podem ser reenviadas pelo cliente não devem causar inconsistências.

Especialmente:

```text
aceitar coleta
iniciar rota
confirmar recolhimento
confirmar entrega
concluir coleta
```

O backend deve sempre verificar o estado atual da coleta antes de executar a alteração.

---

# 36. Concorrência

A operação:

```http
POST /api/v1/collections/:id/accept
```

é especialmente sensível à concorrência.

O backend deve garantir:

```text
somente um coletor
        ↓
pode assumir
        ↓
uma determinada coleta
```

A alteração deve ocorrer de forma atômica ou utilizando mecanismo equivalente de controle de concorrência.

---

# 37. Validação do domínio

A API deve validar regras como:

```text
e-mail único
senha válida
usuário ativo
role autorizada
coleta existente
coleta disponível
coletor responsável
transição válida
ecoponto ativo
```

A lista pode crescer conforme os requisitos do sistema.

---

# 38. Contrato de datas

Datas devem seguir formato consistente.

Quando representadas em JSON como texto, utilizar formato ISO 8601.

Exemplo:

```text
2026-10-10T14:30:00.000Z
```

O backend deve manter uma política consistente de timezone.

A política definitiva deve ser documentada na configuração da aplicação.

---

# 39. Contrato de localização

Localizações geográficas devem utilizar GeoJSON.

Formato:

```json
{
  "type": "Point",
  "coordinates": [
    -46.62,
    -23.68
  ]
}
```

A ordem das coordenadas deve ser sempre:

```text
[longitude, latitude]
```

Nunca:

```text
[latitude, longitude]
```

---

# 40. Convenção de IDs

O identificador dos recursos deve seguir uma convenção única dentro do projeto.

Exemplo:

```text
_id
```

No MongoDB.

Na API, pode ser exposto como:

```json
{
  "id": "RESOURCE_ID"
}
```

A transformação entre `_id` e `id` deve ser consistente.

---

# 41. Versionamento

A primeira versão pública da API será:

```text
v1
```

Base:

```text
/api/v1
```

Alterações incompatíveis com clientes existentes devem exigir nova versão da API.

Exemplo:

```text
/api/v2
```

Não criar uma nova versão sem necessidade real.

---

# 42. Compatibilidade com o frontend

O frontend deve consumir a API exclusivamente através das interfaces documentadas.

Não deve:

- acessar MongoDB;
- depender diretamente de modelos internos;
- depender de campos não documentados;
- assumir que uma transição de estado é válida sem confirmação do backend.

---

# 43. Fluxo completo de uma coleta

## 43.1 Criação

```http
POST /api/v1/collections
```

Resultado:

```text
PENDENTE
```

---

## 43.2 Aceitação

```http
POST /api/v1/collections/:id/accept
```

Resultado:

```text
ACEITA
```

---

## 43.3 Início

```http
POST /api/v1/collections/:id/start
```

Resultado:

```text
A_CAMINHO
```

---

## 43.4 Recolhimento

```http
POST /api/v1/collections/:id/collect
```

Resultado:

```text
RECOLHIDA
```

---

## 43.5 Entrega

```http
POST /api/v1/collections/:id/deliver
```

Resultado:

```text
ENTREGUE_ECOPONTO
```

---

## 43.6 Conclusão

```http
POST /api/v1/collections/:id/complete
```

Resultado:

```text
CONCLUIDA
```

---

# 44. Resumo dos endpoints

| Método | Endpoint | Acesso | Objetivo |
|---|---|---|---|
| GET | `/api/v1/health` | Público | Health check |
| POST | `/api/v1/auth/register` | Público | Cadastro |
| POST | `/api/v1/auth/login` | Público | Login |
| POST | `/api/v1/auth/logout` | Autenticado | Logout |
| GET | `/api/v1/auth/me` | Autenticado | Usuário atual |
| POST | `/api/v1/auth/forgot-password` | Público | Recuperação de senha |
| POST | `/api/v1/auth/reset-password` | Conforme fluxo | Redefinição |
| GET | `/api/v1/profile` | Autenticado | Perfil |
| PATCH | `/api/v1/profile` | Autenticado | Atualização do perfil |
| GET | `/api/v1/ecopoint` | Público/definido pelo fluxo | Consultar ecoponto |
| PATCH | `/api/v1/ecopoint` | ADMIN | Atualizar ecoponto |
| POST | `/api/v1/collections` | CLIENTE | Criar coleta |
| GET | `/api/v1/collections` | CLIENTE | Listar minhas coletas |
| GET | `/api/v1/collections/:id` | Conforme recurso | Consultar coleta |
| GET | `/api/v1/collections/available` | COLETOR | Coletas disponíveis |
| GET | `/api/v1/collections/assigned` | COLETOR | Coletas atribuídas |
| POST | `/api/v1/collections/:id/accept` | COLETOR | Aceitar |
| POST | `/api/v1/collections/:id/start` | COLETOR | Iniciar rota |
| POST | `/api/v1/collections/:id/collect` | COLETOR | Confirmar recolhimento |
| POST | `/api/v1/collections/:id/deliver` | COLETOR | Confirmar entrega |
| POST | `/api/v1/collections/:id/complete` | COLETOR | Concluir |
| GET | `/api/v1/admin/users` | ADMIN | Listar usuários |
| GET | `/api/v1/admin/users/:id` | ADMIN | Consultar usuário |
| PATCH | `/api/v1/admin/users/:id/status` | ADMIN | Alterar status |
| GET | `/api/v1/admin/collections` | ADMIN | Listar coletas |
| GET | `/api/v1/admin/collections/:id` | ADMIN | Consultar coleta |
| GET | `/api/v1/notifications` | Autenticado | Listar notificações |
| PATCH | `/api/v1/notifications/:id/read` | Autenticado | Marcar como lida |
| GET | `/api/v1/admin/reports` | ADMIN | Relatórios |

---

# 45. Regras finais

## API-001 — Backend como autoridade

O backend é a autoridade final sobre:

```text
autenticação
autorização
validação
regras de negócio
status das coletas
persistência
```

---

## API-002 — Frontend não define regras críticas

O frontend pode antecipar validações para melhorar a experiência, mas nunca deve substituir a validação do backend.

---

## API-003 — Não inventar endpoints

Não criar endpoints que não estejam relacionados a requisitos ou regras oficialmente definidos.

---

## API-004 — Não inventar campos

Não adicionar campos de resposta ou requisição sem necessidade documentada.

Quando um novo campo for realmente necessário, atualizar o contrato da API e os documentos relacionados.

---

## API-005 — Consistência

Alterações na API devem ser refletidas também em:

```text
docs/05_ROUTES.md
docs/06_API.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
```

quando afetarem rotas, contratos ou regras de negócio.

---

# 46. Fonte de verdade

Este documento define o contrato funcional da API do EcoByte.

A implementação deve permanecer alinhada principalmente com:

```text
docs/01_ARCHITECTURE.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/07_DATABASE_MONGODB.md
docs/09_AUTHENTICATION_SECURITY.md
docs/14_STATE_MACHINE.md
```

Em caso de alteração do comportamento da API, atualizar a documentação antes de considerar a mudança concluída.