# EcoByte — Architecture

## 1. Visão Geral

O EcoByte é uma aplicação web full-stack composta por três camadas principais:

```text
Frontend
   ↓ HTTP/HTTPS
Backend API
   ↓
MongoDB
```

A arquitetura deve manter clara a separação entre apresentação, regras de negócio e persistência.

---

## 2. Frontend

O frontend é responsável por:

- Interface;
- Navegação;
- Formulários;
- Interações;
- Responsividade;
- Estado visual;
- Consumo da API.

O frontend **não deve acessar o MongoDB diretamente**.

---

## 3. Backend

O backend é responsável por:

- API;
- Autenticação;
- Autorização;
- Validação;
- Regras de negócio;
- Controle das coletas;
- Acesso ao MongoDB;
- Tratamento de erros;
- Respostas HTTP.

Estrutura conceitual:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Model / Data Access
  ↓
MongoDB
```

### Route

Define o endpoint e o método HTTP.

### Controller

Recebe a requisição e produz a resposta.

### Service

Executa as regras de negócio.

### Model / Data Access

Responsável pela persistência utilizando MongoDB/Mongoose.

---

## 4. Comunicação HTTP

O frontend se comunica exclusivamente com a API por HTTP/HTTPS.

Exemplo:

```text
Frontend
   ↓
POST /api/v1/coletas
   ↓
Express
   ↓
Controller
   ↓
Service
   ↓
MongoDB
   ↓
HTTP Response
   ↓
Frontend
```

As requisições e respostas devem utilizar JSON quando aplicável.

---

## 5. Métodos HTTP

Utilizar:

- `GET` — consulta;
- `POST` — criação;
- `PATCH` — alteração parcial;
- `DELETE` — somente quando a exclusão física for realmente necessária.

Recursos que possuem histórico importante devem utilizar desativação lógica sempre que aplicável.

---

## 6. Status HTTP

Utilizar códigos HTTP de acordo com o resultado da operação:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

---

## 7. Backend e Regras de Negócio

As regras importantes devem permanecer no backend.

O frontend pode controlar a experiência visual, mas não deve ser a autoridade sobre:

- Permissões;
- Roles;
- Transições de coleta;
- Integridade dos dados;
- Operações administrativas.

---

## 8. MongoDB

O MongoDB é o banco de dados oficial do EcoByte.

O acesso será realizado através do Mongoose.

O backend deve ser o único responsável por acessar o banco.

Fluxo:

```text
Frontend
   ↓
Express API
   ↓
Mongoose
   ↓
MongoDB
```

---

## 9. Estrutura Conceitual

```text
Ecobyte/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── data/
│   └── public/
│
├── backend/
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── models/
│       ├── middlewares/
│       ├── validators/
│       └── config/
│
└── docs/
```

A estrutura poderá evoluir conforme o projeto crescer, mas novas camadas não devem ser criadas sem necessidade.

---

## 10. Autenticação e Autorização

A autenticação pertence ao backend.

O sistema possui os seguintes roles:

- `CLIENTE`
- `COLETOR`
- `ADMIN`

O tipo de cadastro é uma informação separada do role:

- `PF`
- `PJ`

O frontend pode ocultar opções que o usuário não pode utilizar, mas toda autorização deve ser validada novamente pelo backend.

---

## 11. Coletas

A coleta possui uma máquina de estados definida em:

`docs/14_STATE_MACHINE.md`

As transições devem ser validadas no backend.

O frontend apenas apresenta e solicita as ações permitidas.

---

## 12. Mobile First

O projeto deve ser desenvolvido com abordagem mobile-first.

Prioridade especial:

- Login;
- Cadastro;
- Solicitação de coleta;
- Acompanhamento de coleta;
- Painel do coletor.

A interface desktop deve ser uma expansão da experiência mobile, e não o contrário.

---

## 13. Responsabilidades por Camada

| Camada | Responsabilidade |
|---|---|
| Frontend | UI, navegação, interação e consumo da API |
| Route | Definição dos endpoints |
| Controller | Request/Response |
| Service | Regras de negócio |
| Model/Data Access | Persistência |
| MongoDB | Armazenamento dos dados |

---

## 14. Regra Arquitetural Principal

Não utilizar:

```text
Frontend → MongoDB
```

Utilizar obrigatoriamente:

```text
Frontend → HTTP → Backend → MongoDB
```

A arquitetura deve permanecer simples, explicável e compatível com os requisitos acadêmicos de Desenvolvimento Web III e Banco de Dados Não Relacional.