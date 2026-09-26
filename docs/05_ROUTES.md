# 05 — ROUTES

## 1. Objetivo

Este documento define a estrutura de rotas HTTP do EcoByte.

As rotas devem:

- seguir a arquitetura definida em `docs/01_ARCHITECTURE.md`;
- respeitar as regras de negócio de `docs/03_BUSINESS_RULES.md`;
- respeitar os requisitos de `docs/04_REQUIREMENTS.md`;
- utilizar a API versionada em `/api/v1`;
- aplicar autenticação e autorização quando necessário;
- encaminhar as requisições para os controllers/services apropriados.

Este documento define a intenção e a responsabilidade de cada rota.

A implementação final pode ajustar detalhes internos sem alterar o contrato funcional sem atualizar a documentação correspondente.

---

# 2. Convenções

## 2.1 Base da API

Todas as rotas da API devem utilizar:

```text
/api/v1
```

Exemplo:

```text
/api/v1/auth/login
```

---

## 2.2 Métodos HTTP

Utilizar os métodos conforme a responsabilidade da operação:

```text
GET
POST
PATCH
DELETE
```

O método `DELETE` deve ser utilizado somente quando a remoção física fizer sentido.

Para recursos com histórico importante, preferir operações de desativação lógica.

---

## 2.3 Parâmetros de rota

Recursos específicos devem utilizar identificadores na URL:

```text
/api/v1/collections/:id
```

Exemplo:

```text
GET /api/v1/collections/65f123...
```

---

## 2.4 Autenticação

Rotas protegidas devem exigir autenticação.

O mecanismo específico de autenticação deve seguir `docs/09_AUTHENTICATION_SECURITY.md`.

O frontend nunca deve ser responsável por garantir sozinho a segurança das rotas.

---

## 2.5 Autorização

Além de verificar se o usuário está autenticado, o backend deve verificar sua `role`.

Roles existentes:

```text
CLIENTE
COLETOR
ADMIN
```

---

# 3. Convenção de resposta

## 3.1 Sucesso

Preferir o formato:

```json
{
  "status": "success",
  "message": "Operação realizada com sucesso.",
  "data": {}
}
```

---

## 3.2 Erro

Preferir o formato:

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

# 4. Rotas públicas

As seguintes rotas podem ser acessadas sem autenticação.

---

## 4.1 Health Check

```http
GET /api/v1/health
```

### Objetivo

Verificar se a API está operacional.

### Autenticação

```text
Não
```

### Exemplo de resposta

```json
{
  "status": "success",
  "message": "API operacional.",
  "data": {
    "status": "up"
  }
}
```

---

# 5. Autenticação

Prefixo:

```text
/api/v1/auth
```

---

## 5.1 Cadastro

```http
POST /api/v1/auth/register
```

### Objetivo

Criar uma nova conta de cliente.

### Autenticação

```text
Não
```

### Body conceitual

```json
{
  "nome": "Nome do usuário",
  "email": "usuario@email.com",
  "senha": "Senha@123",
  "confirmacaoSenha": "Senha@123",
  "telefone": "11999999999",
  "tipoCadastro": "PF"
}
```

Para PJ:

```json
{
  "nome": "Nome do responsável",
  "email": "empresa@email.com",
  "senha": "Senha@123",
  "confirmacaoSenha": "Senha@123",
  "tipoCadastro": "PJ",
  "dadosEmpresa": {
    "razaoSocial": "Empresa Exemplo Ltda.",
    "nomeFantasia": "Empresa Exemplo"
  }
}
```

Campos obrigatórios e opcionais: `DEC-066`. CPF/CNPJ não são coletados enquanto `OQ-044` estiver aberta.

Após o cadastro, o usuário já fica autenticado (sessão criada, `CA-001`).

### Regras importantes

- e-mail deve ser válido;
- e-mail deve ser único;
- senha deve atender aos requisitos mínimos;
- confirmação de senha deve coincidir;
- dados obrigatórios devem ser validados;
- a senha nunca deve ser armazenada em texto puro.

### Respostas esperadas

```text
201 Created
400 Bad Request
409 Conflict
429 Too Many Requests
```

---

## 5.2 Login

```http
POST /api/v1/auth/login
```

### Objetivo

Autenticar um usuário.

### Autenticação

```text
Não
```

### Body

```json
{
  "email": "usuario@email.com",
  "senha": "Senha@123"
}
```

### Respostas esperadas

```text
200 OK
400 Bad Request
401 Unauthorized
403 Forbidden
429 Too Many Requests
```

---

## 5.3 Logout

```http
POST /api/v1/auth/logout
```

### Objetivo

Encerrar a sessão autenticada.

### Autenticação

```text
Sim
```

### Resposta

```text
200 OK
```

---

## 5.4 Usuário autenticado

```http
GET /api/v1/auth/me
```

### Objetivo

Retornar informações básicas do usuário autenticado.

### Autenticação

```text
Sim
```

### Resposta

```text
200 OK
401 Unauthorized
```

---

## 5.5 Solicitar recuperação de senha

```http
POST /api/v1/auth/forgot-password
```

### Objetivo

Iniciar o processo de recuperação de senha.

### Autenticação

```text
Não
```

### Body

```json
{
  "email": "usuario@email.com"
}
```

### Observação

O mecanismo de envio da recuperação ainda depende das decisões registradas em:

```text
docs/OPEN_QUESTIONS.md
```

---

## 5.6 Redefinir senha

```http
POST /api/v1/auth/reset-password
```

### Objetivo

Redefinir uma senha utilizando um mecanismo seguro e temporário.

### Autenticação

```text
Não necessariamente
```

### Body conceitual

```json
{
  "token": "TOKEN_TEMPORARIO",
  "novaSenha": "NovaSenha@123",
  "confirmacaoSenha": "NovaSenha@123"
}
```

### Regras

- token deve ser válido;
- token deve estar dentro do período permitido;
- nova senha deve atender aos requisitos de segurança;
- senha anterior não deve ser retornada.

---

# 6. Perfil

Prefixo:

```text
/api/v1/profile
```

Todas as rotas desta seção exigem autenticação.

---

## 6.1 Visualizar perfil

```http
GET /api/v1/profile
```

### Objetivo

Retornar os dados permitidos do próprio usuário autenticado.

### Autenticação

```text
Sim
```

---

## 6.2 Atualizar perfil

```http
PATCH /api/v1/profile
```

### Objetivo

Atualizar os campos permitidos do perfil do usuário autenticado.

### Autenticação

```text
Sim
```

### Regras

- usuário só pode modificar o próprio perfil;
- campos protegidos não devem ser alterados arbitrariamente;
- alterações devem passar por validação;
- informações históricas das coletas não devem ser modificadas retroativamente.

---

# 7. Ecoponto

Prefixo:

```text
/api/v1/ecopoint
```

O MVP possui um único ecoponto físico central da EcoByte.

---

## 7.1 Visualizar ecoponto

```http
GET /api/v1/ecopoint
```

### Objetivo

Retornar as informações públicas do ecoponto central.

### Autenticação

```text
Pode ser pública
```

A decisão final sobre exigir autenticação deve permanecer alinhada ao fluxo de interface definido posteriormente.

### Dados possíveis

```text
nome
descricao
endereco
localizacao
horarios
status
```

---

## 7.2 Atualizar ecoponto

```http
PATCH /api/v1/ecopoint
```

### Objetivo

Atualizar as informações administrativas do ecoponto.

### Autenticação

```text
Sim
```

### Role

```text
ADMIN
```

---

# 8. Coletas — cliente

Prefixo:

```text
/api/v1/collections
```

---

## 8.1 Criar coleta

```http
POST /api/v1/collections
```

### Objetivo

Criar uma nova solicitação de coleta.

### Autenticação

```text
Sim
```

### Role

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

### Comportamento

A coleta deve ser criada com:

```text
status = PENDENTE
```

e:

```text
coletorId = null
```

---

## 8.2 Listar minhas coletas

```http
GET /api/v1/collections
```

### Objetivo

Retornar as coletas pertencentes ao cliente autenticado.

### Autenticação

```text
Sim
```

### Role

```text
CLIENTE
```

### Importante

O cliente não deve receber coletas pertencentes a outros usuários.

---

## 8.3 Visualizar minha coleta

```http
GET /api/v1/collections/:id
```

### Objetivo

Retornar detalhes de uma coleta específica.

### Autenticação

```text
Sim
```

### Regra de acesso

Um cliente somente pode consultar uma coleta à qual tenha direito de acesso.

Administradores podem consultar conforme suas permissões.

Coletores podem consultar coletas relacionadas à sua atuação operacional.

---

# 9. Coletas — coletor

As rotas desta seção são destinadas ao:

```text
COLETOR
```

---

## 9.1 Coletas disponíveis

```http
GET /api/v1/collections/available
```

### Objetivo

Listar coletas disponíveis para aceitação.

### Autenticação

```text
Sim
```

### Role

```text
COLETOR
```

### Regra

Devem ser consideradas disponíveis somente coletas que estejam:

```text
PENDENTE
```

---

## 9.1.1 Coletas atribuídas

```http
GET /api/v1/collections/assigned
```

### Objetivo

Listar as coletas atribuídas ao coletor autenticado (`RF-028`, `DEC-064`).

### Autenticação

```text
Sim
```

### Role

```text
COLETOR
```

### Regra

Retornar somente coletas com:

```text
coletorId = usuário autenticado
```

Os agrupamentos exibidos na interface permanecem dependentes de `OQ-047`.

### Observação de implementação

As rotas `/available` e `/assigned` devem ser registradas antes de `/:id` para não serem interpretadas como identificador.

---

## 9.2 Aceitar coleta

```http
POST /api/v1/collections/:id/accept
```

### Objetivo

Permitir que um coletor assuma uma coleta pendente.

### Autenticação

```text
Sim
```

### Role

```text
COLETOR
```

### Transição

```text
PENDENTE → ACEITA
```

### Efeitos esperados

```text
status = ACEITA
coletorId = ID_DO_COLETOR
acceptedAt = data/hora atual
```

### Concorrência

Se a coleta já tiver sido assumida por outro coletor:

```text
409 Conflict
```

---

## 9.3 Iniciar rota

```http
POST /api/v1/collections/:id/start
```

### Objetivo

Registrar o início da rota do coletor responsável.

### Autenticação

```text
Sim
```

### Role

```text
COLETOR
```

### Transição

```text
ACEITA → A_CAMINHO
```

### Efeitos

```text
status = A_CAMINHO
startedAt = data/hora atual
```

Somente o coletor associado à coleta pode executar esta operação.

---

## 9.4 Confirmar recolhimento

```http
POST /api/v1/collections/:id/collect
```

### Objetivo

Confirmar que o material foi recolhido.

### Autenticação

```text
Sim
```

### Role

```text
COLETOR
```

### Transição

```text
A_CAMINHO → RECOLHIDA
```

### Efeito

```text
status = RECOLHIDA
collectedAt = data/hora atual
```

Somente o coletor responsável pode executar esta operação.

---

## 9.5 Confirmar entrega no ecoponto

```http
POST /api/v1/collections/:id/deliver
```

### Objetivo

Registrar que os materiais foram entregues no ecoponto central EcoByte.

### Autenticação

```text
Sim
```

### Role

```text
COLETOR
```

### Transição

```text
RECOLHIDA → ENTREGUE_ECOPONTO
```

### Efeito

```text
status = ENTREGUE_ECOPONTO
deliveredAt = data/hora atual
ecopontoId = ID do ecoponto central ativo
```

Somente o coletor responsável pode executar esta operação.

---

## 9.6 Concluir coleta

```http
POST /api/v1/collections/:id/complete
```

### Objetivo

Finalizar o processo da coleta.

### Autenticação

```text
Sim
```

### Role

```text
COLETOR
```

### Transição

```text
ENTREGUE_ECOPONTO → CONCLUIDA
```

### Efeito

```text
status = CONCLUIDA
completedAt = data/hora atual
```

---

# 10. Status das coletas

A implementação deve manter uma única fonte de verdade para o status da coleta.

Estados:

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

# 11. Rota genérica de atualização de status

Não existe rota genérica de atualização de status (`DEC-064`).

```http
PATCH /api/v1/collections/:id/status
```

não deve ser implementada.

As transições ocorrem exclusivamente pelas rotas de ação da seção 9, cada uma validando o estado de origem, a role e o coletor responsável.

---

# 12. Coletas — administrador

Prefixo conceitual:

```text
/api/v1/admin/collections
```

Todas as rotas desta seção exigem:

```text
Autenticação
+
role = ADMIN
```

---

## 12.1 Listar coletas

```http
GET /api/v1/admin/collections
```

### Objetivo

Consultar as coletas existentes no sistema para acompanhamento administrativo.

---

## 12.2 Visualizar coleta

```http
GET /api/v1/admin/collections/:id
```

### Objetivo

Visualizar detalhes administrativos de uma coleta específica.

---

# 13. Usuários — administrador

Prefixo:

```text
/api/v1/admin/users
```

---

## 13.1 Listar usuários

```http
GET /api/v1/admin/users
```

### Objetivo

Consultar usuários cadastrados no sistema.

### Role

```text
ADMIN
```

---

## 13.2 Visualizar usuário

```http
GET /api/v1/admin/users/:id
```

### Objetivo

Visualizar informações administrativas permitidas de um usuário específico.

---

## 13.3 Atualizar status do usuário

```http
PATCH /api/v1/admin/users/:id/status
```

### Objetivo

Ativar ou desativar um usuário.

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

# 14. Notificações

Prefixo:

```text
/api/v1/notifications
```

---

## 14.1 Listar notificações

```http
GET /api/v1/notifications
```

### Objetivo

Listar as notificações do usuário autenticado.

### Autenticação

```text
Sim
```

Cada usuário somente pode acessar suas próprias notificações.

---

## 14.2 Marcar notificação como lida

```http
PATCH /api/v1/notifications/:id/read
```

### Objetivo

Marcar uma notificação como lida.

### Autenticação

```text
Sim
```

### Regra

O usuário só pode modificar uma notificação pertencente a ele.

---

# 15. Relatórios

Prefixo:

```text
/api/v1/admin/reports
```

---

## 15.1 Relatórios gerais

```http
GET /api/v1/admin/reports
```

### Objetivo

Disponibilizar informações agregadas para administração.

### Role

```text
ADMIN
```

### Observação

Os relatórios definitivos ainda dependem das decisões registradas em:

```text
docs/OPEN_QUESTIONS.md
```

---

# 16. Consultas e filtros

As rotas de listagem podem futuramente aceitar parâmetros de consulta.

Exemplo:

```http
GET /api/v1/admin/collections?status=PENDENTE
```

ou:

```http
GET /api/v1/admin/collections?page=1&limit=20
```

Possíveis parâmetros:

```text
status
page
limit
sort
search
dataInicial
dataFinal
```

Somente implementar filtros que possuam necessidade real no sistema.

Não adicionar parâmetros arbitrariamente.

---

# 17. Geolocalização

Quando houver suporte a consultas geográficas, os endpoints correspondentes podem receber parâmetros de localização.

Exemplo conceitual:

```http
GET /api/v1/ecopoint
```

retornando:

```json
{
  "localizacao": {
    "type": "Point",
    "coordinates": [
      -46.62,
      -23.68
    ]
  }
}
```

A ordem deve permanecer:

```text
[longitude, latitude]
```

---

# 18. Controle de acesso por rota

## CLIENTE

Rotas principais:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET   /api/v1/profile
PATCH /api/v1/profile

GET  /api/v1/ecopoint

POST /api/v1/collections
GET  /api/v1/collections
GET  /api/v1/collections/:id

GET /api/v1/notifications
PATCH /api/v1/notifications/:id/read
```

---

## COLETOR

Rotas principais:

```text
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET /api/v1/profile
PATCH /api/v1/profile

GET /api/v1/ecopoint

GET  /api/v1/collections/available
GET  /api/v1/collections/assigned
GET  /api/v1/collections/:id

POST /api/v1/collections/:id/accept
POST /api/v1/collections/:id/start
POST /api/v1/collections/:id/collect
POST /api/v1/collections/:id/deliver
POST /api/v1/collections/:id/complete

GET /api/v1/notifications
PATCH /api/v1/notifications/:id/read
```

---

## ADMIN

Rotas principais:

```text
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET   /api/v1/profile
PATCH /api/v1/profile

GET /api/v1/ecopoint
PATCH /api/v1/ecopoint

GET /api/v1/admin/users
GET /api/v1/admin/users/:id
PATCH /api/v1/admin/users/:id/status

GET /api/v1/admin/collections
GET /api/v1/admin/collections/:id

GET /api/v1/admin/reports
```

---

# 19. Rotas que não devem existir sem requisito

Não criar automaticamente endpoints para:

```text
DELETE /collections/:id
POST /collections/:id/cancel
POST /collections/:id/reopen
POST /collections/:id/reassign
PATCH /collections/:id/status
```

a menos que essas funcionalidades sejam oficialmente definidas nos requisitos e nas regras de negócio.

O mesmo princípio vale para qualquer outra rota não documentada.

---

# 20. Regras de implementação das rotas

## RT-001 — Rota não contém regra de negócio complexa

Routes devem ser responsáveis principalmente por:

- receber a requisição;
- validar aspectos básicos da entrada;
- identificar a rota;
- encaminhar para controller;
- retornar a resposta.

Regras de negócio devem permanecer nos serviços apropriados.

---

## RT-002 — Controller

O controller deve:

- interpretar a requisição;
- extrair parâmetros/body/query;
- chamar o service;
- definir a resposta HTTP apropriada.

---

## RT-003 — Service

O service deve concentrar as regras de negócio da operação.

Exemplos:

```text
aceitar coleta
iniciar rota
confirmar recolhimento
confirmar entrega
concluir coleta
```

---

## RT-004 — Autorização

A autorização deve ser realizada antes da execução da operação protegida.

---

## RT-005 — Identidade do usuário

O backend deve obter a identidade do usuário autenticado a partir do mecanismo oficial de autenticação.

Não confiar em:

```json
{
  "usuarioId": "..."
}
```

enviado arbitrariamente pelo frontend para determinar quem está realizando a operação.

---

## RT-006 — Status da coleta

Nenhuma rota deve alterar o status ignorando a máquina de estados definida em:

```text
docs/14_STATE_MACHINE.md
```

---

## RT-007 — Atualização atômica

Operações críticas como aceitar uma coleta devem utilizar mecanismos que reduzam risco de concorrência e dupla atribuição.

---

## RT-008 — Respostas HTTP

Utilizar códigos HTTP coerentes com o resultado da operação.

Exemplos:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

A escolha deve representar corretamente o motivo da falha.

---

# 21. Resumo das rotas

| Método | Rota | Acesso | Objetivo |
|---|---|---|---|
| GET | `/api/v1/health` | Público | Health check |
| POST | `/api/v1/auth/register` | Público | Cadastro |
| POST | `/api/v1/auth/login` | Público | Login |
| POST | `/api/v1/auth/logout` | Autenticado | Logout |
| GET | `/api/v1/auth/me` | Autenticado | Usuário atual |
| POST | `/api/v1/auth/forgot-password` | Público | Recuperação de senha |
| POST | `/api/v1/auth/reset-password` | Conforme fluxo | Redefinir senha |
| GET | `/api/v1/profile` | Autenticado | Visualizar perfil |
| PATCH | `/api/v1/profile` | Autenticado | Atualizar perfil |
| GET | `/api/v1/ecopoint` | Público/definido pelo fluxo | Visualizar ecoponto |
| PATCH | `/api/v1/ecopoint` | ADMIN | Atualizar ecoponto |
| POST | `/api/v1/collections` | CLIENTE | Criar coleta |
| GET | `/api/v1/collections` | CLIENTE | Minhas coletas |
| GET | `/api/v1/collections/:id` | Conforme recurso | Detalhes da coleta |
| GET | `/api/v1/collections/available` | COLETOR | Coletas disponíveis |
| GET | `/api/v1/collections/assigned` | COLETOR | Coletas atribuídas ao coletor |
| POST | `/api/v1/collections/:id/accept` | COLETOR | Aceitar coleta |
| POST | `/api/v1/collections/:id/start` | COLETOR | Iniciar rota |
| POST | `/api/v1/collections/:id/collect` | COLETOR | Confirmar recolhimento |
| POST | `/api/v1/collections/:id/deliver` | COLETOR | Confirmar entrega |
| POST | `/api/v1/collections/:id/complete` | COLETOR | Concluir coleta |
| GET | `/api/v1/admin/users` | ADMIN | Listar usuários |
| GET | `/api/v1/admin/users/:id` | ADMIN | Detalhes do usuário |
| PATCH | `/api/v1/admin/users/:id/status` | ADMIN | Ativar/desativar usuário |
| GET | `/api/v1/admin/collections` | ADMIN | Listar coletas |
| GET | `/api/v1/admin/collections/:id` | ADMIN | Detalhes administrativos |
| GET | `/api/v1/notifications` | Autenticado | Listar notificações |
| PATCH | `/api/v1/notifications/:id/read` | Autenticado | Marcar como lida |
| GET | `/api/v1/admin/reports` | ADMIN | Relatórios |

---

# 22. Fonte de verdade

A definição das rotas deve permanecer alinhada principalmente com:

```text
docs/01_ARCHITECTURE.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/06_API.md
docs/14_STATE_MACHINE.md
```

Quando uma alteração de rota modificar o contrato da API, atualizar também a documentação correspondente antes de considerar a implementação concluída.