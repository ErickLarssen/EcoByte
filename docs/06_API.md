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
```

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
  "documento": "00000000000",
  "tipoCadastro": "PF"
}
```

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
      "status": "ATIVO"
    }
  }
}
```

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

---

# 13. Coletas

## 13.1 Criar coleta

```http
POST /api/v1/collections
```

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
      "categoria": "NOTEBOOK",
      "quantidade": 1,
      "condicao": "FUNCIONANDO"
    }
  ],
  "dataAgendada": "2026-10-10",
  "observacoes": "Retirar no período da manhã."
}
```

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

---

## 13.2 Listar minhas coletas

```http
GET /api/v1/collections
```

### Acesso

```text
CLIENTE
```

A API deve filtrar os resultados pelo usuário autenticado.

---

## 13.3 Consultar coleta

```http
GET /api/v1/collections/:id
```

O backend deve verificar se o usuário possui permissão para visualizar o recurso.

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