# Apêndice — Trocas HTTP reais com a API do EcoByte

Capturadas em 08/11/2026 com o backend rodando localmente (o mesmo código publicado), num banco temporário com os dados de demonstração. Cada bloco mostra a requisição enviada e a resposta recebida, sem edição.

**O que foi alterado na exibição:**

- **senhas:** aparecem como `••••••••`;
- **valor do cookie de sessão:** aparece como `s%3A…(assinado)`;
- **cabeçalhos:** só os relevantes para a explicação.

Em produção, o cookie se chama `__Host-ecobyte.sid` e tem o atributo `Secure` (HTTPS). Em desenvolvimento, sem HTTPS, ele se chama `ecobyte.sid`.

Texto principal: [Desenvolvimento Web III — Arquitetura, HTTP e request/response](../WEB3_ARQUITETURA_HTTP.md).

### 1. Verificação de saúde (GET sem estado)

Requisição mais simples: sem sessão, sem corpo.

**GET /health**

```http
GET /api/v1/health HTTP/1.1
```

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "success",
  "message": "API operacional.",
  "data": {
    "status": "up"
  }
}
```


### 2. Sessão: 401 sem cookie, login, cookie de sessão e reuso

Mostra o HTTP sem estado sendo complementado por uma sessão no servidor, identificada por cookie.

**Sem cookie: 401**

```http
GET /api/v1/auth/me HTTP/1.1
```

```http
HTTP/1.1 401 Unauthorized
content-type: application/json; charset=utf-8
cache-control: no-store
x-content-type-options: nosniff

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

**Login do cliente**

```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json
Origin: http://localhost:3000

{
  "email": "mariana@ecobyte.local",
  "senha": "••••••••"
}
```

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:29 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff
ratelimit-policy: "10-in-15min"; q=10; w=900; pk=:YmIwY2Q1MTM2YWU1:
ratelimit: "10-in-15min"; r=9; t=900

{
  "status": "success",
  "message": "Login realizado com sucesso.",
  "data": {
    "user": {
      "id": "6af132ebd4f0d74ce2fa4500",
      "nome": "Mariana Oliveira",
      "email": "mariana@ecobyte.local",
      "role": "CLIENTE",
      "tipoCadastro": "PF",
      "status": "ATIVO",
      "emailVerificado": true,
      "trocaSenhaObrigatoria": false
    }
  }
}
```

**Com o cookie: 200**

```http
GET /api/v1/auth/me HTTP/1.1
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:29 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "success",
  "message": "Usuário autenticado.",
  "data": {
    "user": {
      "id": "6af132ebd4f0d74ce2fa4500",
      "nome": "Mariana Oliveira",
      "email": "mariana@ecobyte.local",
      "role": "CLIENTE",
      "tipoCadastro": "PF",
      "status": "ATIVO",
      "emailVerificado": true,
      "trocaSenhaObrigatoria": false
    }
  }
}
```


### 3. Validação: 400 com erros por campo

O corpo é validado no servidor (zod) antes de chegar à regra de negócio.

**Solicitação incompleta**

```http
POST /api/v1/collections HTTP/1.1
Content-Type: application/json
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 400 Bad Request
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:29 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "error",
  "message": "Existem campos inválidos.",
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "enderecoColeta.logradouro": "Informe o logradouro.",
      "enderecoColeta.numero": "Informe o número.",
      "enderecoColeta.bairro": "Informe o bairro.",
      "enderecoColeta.cidade": "Informe a cidade.",
      "enderecoColeta.estado": "Informe a UF.",
      "enderecoColeta.cep": "O CEP deve ter 8 dígitos.",
      "itensDescarte": "Informe pelo menos um item de descarte."
    }
  },
  "data": null
}
```


### 4. Criação de recurso: 201 Created

O cliente solicita uma coleta; o servidor cria o documento com status inicial PENDENTE.

**POST /collections**

```http
POST /api/v1/collections HTTP/1.1
Content-Type: application/json
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 201 Created
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:29 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "success",
  "message": "Coleta solicitada com sucesso.",
  "data": {
    "collection": {
      "id": "6af133152395a6d13e3dda12",
      "status": "PENDENTE",
      "enderecoColeta": {
        "logradouro": "Rua Manoel da Nóbrega",
        "numero": "100",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "Diadema",
        "estado": "SP",
        "cep": "09910720",
        "localizacao": null
      },
      "itensDescarte": [
        {
          "categoria": "INFORMATICA",
          "quantidade": 2,
          "condicao": "USADO"
        }
      ],
      "dataAgendada": null,
      "observacoes": "Portão azul.",
      "createdAt": "2026-11-09T02:42:29.628Z",
      "updatedAt": "2026-11-09T02:42:29.628Z",
      "acceptedAt": null,
      "startedAt": null,
      "collectedAt": null,
      "deliveredAt": null,
      "completedAt": null,
      "coletor":
  … (resposta truncada)
```


### 5. Proteções: origem estranha (403) e perfil sem permissão (403)

Autorização sempre no servidor, mesmo que o frontend esconda o botão.

**Mesma requisição vinda de outro site**

```http
POST /api/v1/collections HTTP/1.1
Content-Type: application/json
Origin: https://site-malicioso.example
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 403 Forbidden
content-type: application/json; charset=utf-8
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "error",
  "message": "Origem da requisição não permitida.",
  "error": {
    "code": "INVALID_ORIGIN",
    "fields": {}
  },
  "data": null
}
```

**Cliente tentando rota de administrador**

```http
GET /api/v1/admin/users HTTP/1.1
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 403 Forbidden
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:29 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "error",
  "message": "Você não tem permissão para esta operação.",
  "error": {
    "code": "FORBIDDEN",
    "fields": {}
  },
  "data": null
}
```


### 6. Ação do coletor: POST /:id/accept

Transição de estado por endpoint de ação (DEC-064).

**Coletor aceita a coleta**

```http
POST /api/v1/collections/6af133152395a6d13e3dda12/accept HTTP/1.1
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:29 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "success",
  "message": "Coleta aceita.",
  "data": {
    "collection": {
      "id": "6af133152395a6d13e3dda12",
      "status": "ACEITA",
      "enderecoColeta": {
        "logradouro": "Rua Manoel da Nóbrega",
        "numero": "100",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "Diadema",
        "estado": "SP",
        "cep": "09910720",
        "localizacao": null
      },
      "itensDescarte": [
        {
          "categoria": "INFORMATICA",
          "quantidade": 2,
          "condicao": "USADO"
        }
      ],
      "dataAgendada": null,
      "observacoes": "Portão azul.",
      "createdAt": "2026-11-09T02:42:29.628Z",
      "updatedAt": "2026-11-09T02:42:29.863Z",
      "acceptedAt": "2026-11-09T02:42:29.861Z",
      "startedAt": null,
      "collectedAt": null,
      "deliveredAt": null,
      "completedAt": null,
      "clien
  … (resposta truncada)
```


### 7. Conflito: coleta já aceita por outro coletor (409)

O segundo coletor tenta aceitar a mesma coleta.

**Segundo coletor, depois do primeiro**

```http
POST /api/v1/collections/6af133152395a6d13e3dda12/accept HTTP/1.1
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 409 Conflict
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:30 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

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


### 8. Disputa simultânea: dois aceites ao mesmo tempo

Dois coletores disparam o aceite no mesmo instante. A atualização atômica no MongoDB garante um único vencedor.

**Coletor A (simultâneo)**

```http
POST /api/v1/collections/6af133162395a6d13e3dda17/accept HTTP/1.1
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:30 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "success",
  "message": "Coleta aceita.",
  "data": {
    "collection": {
      "id": "6af133162395a6d13e3dda17",
      "status": "ACEITA",
      "enderecoColeta": {
        "logradouro": "Rua Manoel da Nóbrega",
        "numero": "200",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "Diadema",
        "estado": "SP",
        "cep": "09910720",
        "localizacao": null
      },
      "itensDescarte": [
        {
          "categoria": "CELULARES",
          "quantidade": 1,
          "condicao": "DANIFICADO"
        }
      ],
      "dataAgendada": null,
      "observacoes": null,
      "createdAt": "2026-11-09T02:42:30.785Z",
      "updatedAt": "2026-11-09T02:42:30.803Z",
      "acceptedAt": "2026-11-09T02:42:30.803Z",
      "startedAt": null,
      "collectedAt": null,
      "deliveredAt": null,
      "completedAt": null,
      "cliente": {

  … (resposta truncada)
```

**Coletor B (simultâneo)**

```http
POST /api/v1/collections/6af133162395a6d13e3dda17/accept HTTP/1.1
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 409 Conflict
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:30 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

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

**Resultado: um aceite respondeu 200 e o outro 409.**

### 9. Transição inválida: 422

O coletor tenta concluir uma coleta que ainda está ACEITA.

**Concluir antes da hora**

```http
POST /api/v1/collections/6af133152395a6d13e3dda12/complete HTTP/1.1
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 422 Unprocessable Entity
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:30 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "error",
  "message": "Transição de status inválida.",
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "fields": {
      "currentStatus": "ACEITA",
      "requestedStatus": "CONCLUIDA"
    }
  },
  "data": null
}
```


### 10. Recurso de outro usuário: 404 (sem revelar que existe)

Outro cliente pede a coleta da Mariana pelo id.

**Coleta de outro cliente**

```http
GET /api/v1/collections/6af133152395a6d13e3dda12 HTTP/1.1
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 404 Not Found
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:30 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

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


### 11. O cliente acompanha a coleta (GET)

A leitura mostra o novo status e o coletor responsável.

**Detalhe da coleta**

```http
GET /api/v1/collections/6af133152395a6d13e3dda12 HTTP/1.1
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=s%3A…(assinado); Path=/; Expires=Mon, 16 Nov 2026 02:42:30 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "success",
  "message": "Coleta encontrada.",
  "data": {
    "collection": {
      "id": "6af133152395a6d13e3dda12",
      "status": "ACEITA",
      "enderecoColeta": {
        "logradouro": "Rua Manoel da Nóbrega",
        "numero": "100",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "Diadema",
        "estado": "SP",
        "cep": "09910720",
        "localizacao": null
      },
      "itensDescarte": [
        {
          "categoria": "INFORMATICA",
          "quantidade": 2,
          "condicao": "USADO"
        }
      ],
      "dataAgendada": null,
      "observacoes": "Portão azul.",
      "createdAt": "2026-11-09T02:42:29.628Z",
      "updatedAt": "2026-11-09T02:42:29.863Z",
      "acceptedAt": "2026-11-09T02:42:29.861Z",
      "startedAt": null,
      "collectedAt": null,
      "deliveredAt": null,
      "completedAt": null,
      "c
  … (resposta truncada)
```


### 12. Logout: o cookie é removido e a sessão deixa de valer

**Logout**

```http
POST /api/v1/auth/logout HTTP/1.1
Origin: http://localhost:3000
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: ecobyte.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax
cache-control: no-store
x-content-type-options: nosniff

{
  "status": "success",
  "message": "Logout realizado com sucesso.",
  "data": null
}
```

**Reusar o cookie antigo**

```http
GET /api/v1/auth/me HTTP/1.1
Cookie: ecobyte.sid=s%3A…(assinado)
```

```http
HTTP/1.1 401 Unauthorized
content-type: application/json; charset=utf-8
cache-control: no-store
x-content-type-options: nosniff

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


### 13. Limite de tentativas: 429 Too Many Requests

Tentativas seguidas de login a partir do mesmo IP. Só a última é exibida.

**Próxima tentativa**

```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json
Origin: http://localhost:3000

{
  "email": "ninguem@ecobyte.local",
  "senha": "••••••••"
}
```

```http
HTTP/1.1 429 Too Many Requests
content-type: application/json; charset=utf-8
cache-control: no-store
x-content-type-options: nosniff
ratelimit-policy: "10-in-15min"; q=10; w=900; pk=:YmIwY2Q1MTM2YWU1:
ratelimit: "10-in-15min"; r=0; t=897
retry-after: 897

{
  "status": "error",
  "message": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "fields": {}
  },
  "data": null
}
```

