# 09 — AUTHENTICATION & SECURITY

## 1. Objetivo

Este documento define as diretrizes de autenticação, autorização e segurança do EcoByte.

As regras deste documento devem orientar:

- Cadastro
- Login
- Logout
- Sessão
- Recuperação de senha
- Controle de acesso
- Proteção de dados
- Senhas
- Tokens
- Cookies
- Rotas protegidas
- Segurança da API
- Variáveis de ambiente
- Proteção contra abuso
- Auditoria e tratamento de erros

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
docs/14_STATE_MACHINE.md
```

---

# 2. Princípios gerais

A segurança deve seguir os seguintes princípios:

```text
mínimo privilégio
defesa em profundidade
validação no backend
separação de responsabilidades
não exposição de dados sensíveis
sessões seguras
controle de acesso por role
preservação de histórico
segredos fora do código-fonte
```

A segurança nunca deve depender exclusivamente do frontend.

---

# 3. Modelo de autenticação

O EcoByte deve possuir autenticação baseada em:

```text
e-mail
+
senha
```

A sessão é mantida no servidor (`DEC-021`):

```text
express-session
+
store no MongoDB (connect-mongo, coleção sessions)
+
cookie HttpOnly contendo somente o identificador da sessão
```

Nenhuma credencial de sessão fica acessível ao JavaScript do frontend.

O navegador acessa a API pela mesma origem do frontend, via proxy do Next.js (`DEC-063`).

---

# 4. Autenticação vs autorização

## Autenticação

Determina:

```text
"Quem é o usuário?"
```

## Autorização

Determina:

```text
"O que esse usuário pode fazer?"
```

As duas etapas são obrigatórias nas operações protegidas.

Fluxo:

```text
Request
   ↓
Autenticação
   ↓
Identidade do usuário
   ↓
Autorização
   ↓
Role/permissões
   ↓
Regra de negócio
   ↓
Operação
```

---

# 5. Roles

O sistema possui três roles:

```text
CLIENTE
COLETOR
ADMIN
```

A role deve controlar as permissões de acesso.

---

# 6. Tipo de cadastro

O tipo de cadastro é independente da role.

Valores:

```text
PF
PJ
```

Não utilizar:

```text
tipoCadastro
```

como substituto de:

```text
role
```

---

# 7. Cliente

A role:

```text
CLIENTE
```

pode representar:

```text
PF
PJ
```

O cliente pode:

- acessar seu perfil;
- solicitar coleta;
- consultar suas próprias coletas;
- acompanhar o status das coletas;
- consultar informações permitidas do ecoponto;
- consultar suas notificações.

O cliente não pode acessar funções administrativas ou operacionais do coletor.

---

# 8. Coletor

A role:

```text
COLETOR
```

é destinada ao usuário responsável pela operação de coleta.

O coletor pode:

- visualizar coletas disponíveis;
- aceitar uma coleta;
- iniciar uma rota;
- confirmar o recolhimento;
- confirmar a entrega no ecoponto;
- concluir a coleta;
- consultar informações necessárias para suas operações.

---

# 9. Administrador

A role:

```text
ADMIN
```

é destinada às funções administrativas do sistema.

O administrador pode, conforme as funcionalidades implementadas:

- consultar usuários;
- gerenciar status de usuários;
- consultar coletas;
- visualizar informações administrativas;
- gerenciar informações do ecoponto;
- acessar relatórios.

---

# 10. Cadastro

Endpoint:

```http
POST /api/v1/auth/register
```

O cadastro deve:

1. validar os dados recebidos;
2. validar o e-mail;
3. verificar duplicidade;
4. validar a senha;
5. validar a confirmação da senha;
6. gerar hash seguro da senha;
7. persistir o usuário;
8. evitar armazenamento da senha em texto puro.

---

# 11. E-mail

O e-mail deve:

- possuir formato válido;
- ser normalizado de maneira consistente;
- ser único;
- ser utilizado para autenticação.

A aplicação deve evitar duplicidade provocada apenas por diferenças de capitalização.

---

# 12. Senha

A senha deve possuir, no mínimo:

```text
8 caracteres
1 letra maiúscula
1 letra minúscula
1 número
1 caractere especial
```

Exemplo válido conceitual:

```text
Senha@123
```

A senha deve ser validada no backend.

---

# 13. Confirmação de senha

O cadastro deve possuir confirmação de senha.

Exemplo:

```json
{
  "senha": "Senha@123",
  "confirmacaoSenha": "Senha@123"
}
```

Os valores devem coincidir.

A confirmação de senha é uma validação do formulário e não precisa ser armazenada no banco.

---

# 14. Hash de senha

A senha original nunca deve ser armazenada.

Campo persistido:

```text
senhaHash
```

Preferência:

```text
Argon2id
```

Alternativa aceitável:

```text
bcrypt
```

Nunca utilizar:

```text
MD5
SHA-1
```

como mecanismo de armazenamento de senha.

---

# 15. Salt

O algoritmo de hash escolhido deve utilizar o mecanismo de salt fornecido pela própria implementação segura.

Não criar um salt manual inadequado ou reutilizar o mesmo salt entre usuários.

---

# 16. Comparação de senha

Durante o login:

```text
senha informada
      ↓
algoritmo de verificação
      ↓
senhaHash armazenado
```

A senha original não deve ser armazenada após a comparação.

---

# 17. Login

Endpoint:

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "usuario@email.com",
  "senha": "Senha@123"
}
```

Fluxo:

```text
Receber credenciais
        ↓
Validar formato
        ↓
Localizar usuário
        ↓
Verificar senha
        ↓
Verificar status
        ↓
Criar sessão/token
        ↓
Retornar resposta segura
```

A senha é verificada antes do status (ajuste de 2026-09-25): assim, `USER_INACTIVE` só é revelado a quem conhece a senha, evitando enumerar contas desativadas (§81, §87).

Quando o e-mail não existe, o backend ainda executa uma verificação de hash de referência, para que o tempo de resposta não revele se a conta existe.

---

# 18. Credenciais inválidas

Quando e-mail ou senha estiverem incorretos, a resposta deve evitar revelar desnecessariamente qual dos dois está errado.

Exemplo:

```text
Credenciais inválidas.
```

Não utilizar respostas como:

```text
E-mail existe, mas senha está errada.
```

quando isso puder facilitar enumeração de contas.

---

# 19. Usuário inativo

Usuário com:

```text
status = INATIVO
```

não deve conseguir utilizar as funcionalidades protegidas do sistema.

O backend deve verificar o status durante a autenticação e, quando necessário, durante operações protegidas.

---

# 20. Sessão

Após autenticação bem-sucedida, o servidor deve estabelecer um mecanismo seguro de sessão.

A solução escolhida deve garantir:

```text
identidade do usuário
expiração
revogação quando aplicável
proteção contra acesso indevido
```

Implementação (`DEC-021`):

- a sessão armazena somente o identificador do usuário;
- o identificador da sessão é regenerado no login, evitando fixação de sessão;
- a cada requisição protegida, o backend carrega o usuário e verifica `status = ATIVO`;
- o logout destrói a sessão no store e remove o cookie.

---

# 21. Cookie de sessão

Configuração adotada (`DEC-021`):

```text
HttpOnly = true
SameSite = Lax
Secure   = true em produção
```

`SameSite=Lax` é possível porque frontend e API compartilham a mesma origem (`DEC-063`).

---

# 22. HttpOnly

Cookies que armazenam identificadores sensíveis da sessão devem preferencialmente utilizar:

```text
HttpOnly
```

para impedir acesso direto pelo JavaScript da página.

---

# 23. Secure

Em produção, cookies sensíveis devem utilizar:

```text
Secure
```

quando a aplicação estiver sendo executada sobre HTTPS.

---

# 24. SameSite

Utilizar uma política adequada de:

```text
SameSite
```

para reduzir riscos relacionados a requisições cross-site.

A configuração exata deve seguir a arquitetura de frontend/backend adotada.

---

# 25. HTTPS

A aplicação em produção deve utilizar:

```text
HTTPS
```

Não transmitir credenciais por HTTP não criptografado em produção.

---

# 26. Expiração de sessão

A sessão deve possuir política de expiração.

O tempo é configurado fora do código:

```text
SESSION_MAX_AGE
```

O valor definitivo permanece em aberto em `OQ-062`.

---

# 27. Logout

Endpoint:

```http
POST /api/v1/auth/logout
```

O logout deve invalidar ou remover a sessão do usuário conforme o mecanismo adotado.

Após logout, uma requisição protegida não deve continuar autorizada pela sessão encerrada.

---

# 28. Endpoint `/auth/me`

Endpoint:

```http
GET /api/v1/auth/me
```

Deve retornar informações do usuário autenticado que sejam apropriadas para o frontend.

Exemplo:

```json
{
  "status": "success",
  "message": "Usuário autenticado.",
  "data": {
    "user": {
      "id": "USER_ID",
      "nome": "Usuário",
      "email": "usuario@email.com",
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
segredos internos
```

---

# 29. Autorização por role

Toda rota protegida deve verificar a role necessária.

Exemplo:

```text
POST /api/v1/collections/:id/accept
```

requer:

```text
role = COLETOR
```

Exemplo:

```text
GET /api/v1/admin/users
```

requer:

```text
role = ADMIN
```

---

# 30. Autorização por propriedade do recurso

A role não é suficiente em todos os casos.

O backend também deve verificar se o usuário possui acesso ao recurso específico.

Exemplo:

```text
CLIENTE A
```

não pode acessar uma coleta pertencente a:

```text
CLIENTE B
```

Mesmo que ambos possuam:

```text
role = CLIENTE
```

---

# 31. Regra de propriedade

Fluxo:

```text
usuário autenticado
       ↓
role válida
       ↓
recurso encontrado
       ↓
verificar propriedade/permissão
       ↓
executar operação
```

---

# 32. Identidade do usuário

Não confiar em um `usuarioId` enviado pelo frontend para definir quem realizou uma operação protegida.

Incorreto:

```json
{
  "usuarioId": "OUTRO_USUARIO"
}
```

como fonte de identidade.

A identidade deve vir do mecanismo de autenticação do backend.

---

# 33. Coletor responsável

Nas operações de uma coleta já atribuída, o backend deve verificar se:

```text
usuário autenticado
=
coletorId da coleta
```

antes de permitir operações como:

```text
iniciar
recolher
entregar
concluir
```

---

# 34. Aceite de coleta

Para aceitar uma coleta:

```text
role = COLETOR
```

e:

```text
status = PENDENTE
```

A operação deve ser atômica ou utilizar mecanismo equivalente para impedir dupla atribuição.

---

# 35. Concorrência

A operação:

```http
POST /api/v1/collections/:id/accept
```

deve possuir proteção contra concorrência.

Cenário:

```text
Coletor A → tenta aceitar
Coletor B → tenta aceitar
```

Somente um deve conseguir alterar:

```text
PENDENTE → ACEITA
```

A outra tentativa deve ser tratada como conflito.

Resposta esperada:

```text
409 Conflict
```

---

# 36. Máquina de estados

As transições oficiais são:

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

O backend nunca deve permitir que um usuário autenticado ignore essa sequência.

---

# 37. Proteção da máquina de estados

Exemplo inválido:

```text
PENDENTE → CONCLUIDA
```

Exemplo inválido:

```text
RECOLHIDA → ACEITA
```

A API deve rejeitar essas operações.

---

# 38. Validação no frontend

O frontend pode realizar validações para melhorar a experiência.

Exemplos:

```text
e-mail inválido
senha fraca
campos obrigatórios
senha diferente da confirmação
```

Porém:

```text
frontend validation
```

não substitui:

```text
backend validation
```

---

# 39. Validação no backend

O backend deve validar novamente:

- campos obrigatórios;
- formato de e-mail;
- senha;
- tipo de cadastro;
- role;
- status;
- IDs;
- permissões;
- transições;
- dados da coleta;
- referências;
- regras de domínio.

---

# 40. Sanitização e normalização

As entradas recebidas pela API devem ser normalizadas e validadas antes da persistência.

Exemplos:

```text
e-mail
telefone
documento
IDs
query parameters
filtros
texto livre
```

Não confiar no conteúdo recebido do cliente.

---

# 41. Injeção

A aplicação deve evitar construir consultas MongoDB diretamente a partir de objetos enviados pelo usuário.

Evitar:

```javascript
db.users.find(req.body)
```

sem validação.

Preferir construir filtros explicitamente.

---

# 42. Operadores MongoDB

Não permitir que o usuário envie arbitrariamente operadores como:

```text
$ne
$gt
$regex
$where
```

para serem utilizados diretamente em consultas internas sem validação.

Os filtros permitidos devem ser definidos explicitamente pela API.

---

# 43. IDs

IDs recebidos pela API devem ser validados antes de serem utilizados em consultas MongoDB.

Exemplo conceitual:

```text
:id
```

deve ser verificado antes de:

```javascript
ObjectId(id)
```

---

# 44. Erros internos

Nunca retornar stack traces, connection strings ou detalhes internos para o usuário final.

Evitar respostas como:

```text
MongoServerError ...
/app/src/services/...
MONGODB_URI=...
```

---

# 45. Tratamento de erros

A API deve retornar mensagens apropriadas.

Exemplo:

```json
{
  "status": "error",
  "message": "Não foi possível realizar a operação.",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "fields": {}
  },
  "data": null
}
```

Detalhes técnicos podem ser registrados internamente nos logs.

---

# 46. Logs

Os logs podem registrar informações úteis para diagnóstico, mas não devem registrar segredos.

Nunca registrar:

```text
senha
senhaHash
tokens completos
cookies de sessão
chaves privadas
credenciais
connection strings com senha
```

---

# 47. Logs de autenticação

Eventos importantes que podem ser registrados:

```text
login bem-sucedido
login malsucedido
logout
tentativa de acesso sem autorização
tentativa de alteração de recurso sem permissão
recuperação de senha solicitada
alteração de senha
```

Os registros devem evitar dados sensíveis.

---

# 48. Rate Limiting

Rotas sensíveis devem possuir proteção contra excesso de requisições.

Prioridade:

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Os limites exatos devem ser configurados conforme o ambiente e a infraestrutura.

Limites adotados (`DEC-067`): login 10 requisições a cada 15 minutos e cadastro 5 por hora, por IP, com resposta `429 RATE_LIMIT_EXCEEDED`.

O IP do cliente só é confiável quando a infraestrutura o fornece: ver `DEC-068` e a variável `TRUST_PROXY`.

---

# 49. Proteção contra brute force

O sistema deve considerar proteção contra tentativas repetidas de autenticação.

Mecanismos possíveis:

```text
rate limiting
cooldown
bloqueio temporário
monitoramento
```

Não aplicar bloqueios permanentes de maneira arbitrária.

---

# 50. Recuperação de senha

Endpoint:

```http
POST /api/v1/auth/forgot-password
```

O processo deve:

1. receber o e-mail;
2. iniciar o fluxo de recuperação;
3. utilizar um mecanismo temporário e seguro;
4. evitar exposição da existência da conta;
5. permitir redefinição da senha sem revelar a senha anterior.

---

# 51. Token de recuperação

Quando tokens forem utilizados para recuperação de senha, eles devem:

- possuir validade limitada;
- ser difíceis de adivinhar;
- não ser reutilizados indefinidamente;
- ser invalidados após utilização;
- não ser armazenados de forma insegura.

---

# 52. Não enviar senha por e-mail

O sistema nunca deve enviar a senha atual do usuário por e-mail.

Fluxo correto:

```text
solicitar recuperação
        ↓
receber link/token temporário
        ↓
definir nova senha
```

---

# 53. Alteração de senha

Quando uma senha for redefinida:

```text
senha antiga
```

não deve ser recuperável.

O novo valor deve gerar um novo:

```text
senhaHash
```

---

# 54. Confirmação de e-mail

A confirmação de e-mail ainda é uma decisão em aberto.

Não implementar um fluxo definitivo sem atualizar:

```text
docs/OPEN_QUESTIONS.md
```

e a documentação relacionada.

---

# 55. Sessões e múltiplos dispositivos

A política definitiva sobre múltiplas sessões simultâneas ainda não está definida.

Não implementar revogação global, lista de dispositivos ou gerenciamento avançado de sessões sem requisito.

---

# 56. Cookies em desenvolvimento e produção

A configuração de cookies pode variar conforme o ambiente.

Exemplo conceitual:

```text
development
    secure = false, quando HTTPS não estiver disponível

production
    secure = true
```

A configuração real deve refletir a infraestrutura utilizada.

---

# 57. CORS

O backend deve configurar CORS explicitamente.

Evitar permitir indiscriminadamente:

```text
*
```

em produção quando a aplicação depender de credenciais ou cookies.

As origens permitidas devem ser definidas por configuração.

Exemplo:

```env
FRONTEND_URL=https://dominio-do-frontend
```

Com a topologia de proxy (`DEC-063`), o navegador não faz requisições cross-origin à API. Mesmo assim, o backend não deve habilitar CORS aberto; a política definitiva permanece listada na seção 104.

---

# 58. CSRF

Caso autenticação baseada em cookies seja utilizada, avaliar proteção contra:

```text
Cross-Site Request Forgery
```

A solução deve ser escolhida de acordo com a arquitetura final.

Possíveis mecanismos:

```text
SameSite
CSRF token
validação de Origin
```

Já adotado (`DEC-021`, `DEC-063`):

```text
SameSite = Lax
operações que alteram estado nunca utilizam GET
```

Complemento adotado (`DEC-069`): validação do header `Origin`.

```text
POST, PUT, PATCH ou DELETE
com Origin diferente de FRONTEND_URL
→ 403 INVALID_ORIGIN
```

Requisições sem `Origin` (clientes que não são navegadores) seguem permitidas. CSRF token não é utilizado.

---

# 59. XSS

O frontend deve evitar inserir conteúdo de usuário no DOM de forma insegura.

Evitar utilizar mecanismos equivalentes a:

```javascript
dangerouslySetInnerHTML
```

sem necessidade e sem sanitização apropriada.

Dados recebidos da API devem ser tratados como não confiáveis.

---

# 60. Headers de segurança

O backend deve considerar headers de segurança apropriados para a aplicação.

A configuração pode utilizar middleware específico de segurança.

Não adicionar headers sem entender seu efeito sobre:

```text
frontend
CORS
cookies
assets
iframes
```

---

# 61. Content Security Policy

Uma política de:

```text
Content-Security-Policy
```

pode ser adotada conforme a arquitetura final.

Quando implementada, deve ser compatível com:

- scripts;
- fontes;
- imagens;
- APIs;
- assets;
- bibliotecas utilizadas.

---

# 62. Proteção de segredos

Nunca armazenar no Git:

```text
MONGODB_URI real
SESSION_SECRET
API keys
SMTP credentials
tokens
private keys
```

---

# 63. Arquivo `.env`

Informações sensíveis devem permanecer em:

```text
.env
```

O arquivo não deve ser commitado.

Exemplo:

```env
NODE_ENV=development
PORT=4000

MONGODB_URI=mongodb://localhost:27017/ecobyte

SESSION_SECRET=CHANGE_ME
FRONTEND_URL=http://localhost:3000
```

Os valores são apenas ilustrativos.

---

# 64. Arquivo `.env.example`

O repositório deve possuir:

```text
.env.example
```

com os nomes das variáveis necessárias, mas sem credenciais reais.

Exemplo:

```env
NODE_ENV=
PORT=

MONGODB_URI=

SESSION_SECRET=

FRONTEND_URL=
```

---

# 65. Git

Antes de realizar commits, verificar que arquivos sensíveis não estão sendo enviados.

O `.gitignore` deve incluir, conforme necessário:

```text
.env
.env.*
!.env.example
node_modules/
logs/
```

A configuração exata deve refletir o projeto.

---

# 66. Banco de dados

As credenciais do MongoDB devem permanecer fora do código.

O backend deve obter a connection string por variável de ambiente.

Nunca escrever:

```javascript
mongoose.connect(
  "mongodb://usuario:senha@servidor..."
)
```

diretamente no código.

---

# 67. Dados pessoais

O sistema pode armazenar dados pessoais necessários à operação, como:

```text
nome
e-mail
telefone
documento
endereço de coleta
dados empresariais
```

Esses dados devem ser utilizados somente para finalidades relacionadas ao sistema.

---

# 68. Minimização de dados

Não coletar ou armazenar dados que não possuam finalidade definida no sistema.

Antes de adicionar um novo campo:

```text
Qual a finalidade?
É realmente necessário?
Quem pode acessá-lo?
Por quanto tempo precisa existir?
```

---

# 69. Controle de acesso aos dados

Dados pessoais devem ser retornados somente quando necessários para a operação solicitada.

Exemplo:

Um cliente não deve receber dados pessoais completos de outros clientes.

---

# 70. Dados do coletor

O cliente deve receber somente as informações do coletor necessárias para o acompanhamento da coleta, conforme o fluxo final da aplicação.

Não retornar dados administrativos ou pessoais desnecessários.

---

# 71. Dados administrativos

Informações administrativas devem permanecer protegidas por:

```text
role = ADMIN
```

e por autorização específica quando necessário.

---

# 72. Privilégio mínimo

Cada usuário deve possuir somente os acessos necessários à sua função.

Modelo:

```text
CLIENTE
    ↓
operações de cliente

COLETOR
    ↓
operações de coleta

ADMIN
    ↓
operações administrativas
```

---

# 73. Middleware de autenticação

A aplicação deve possuir middleware ou mecanismo equivalente para proteger rotas autenticadas.

Fluxo conceitual:

```text
Request
   ↓
Auth Middleware
   ↓
Sessão válida?
   ├── NÃO → 401
   └── SIM
        ↓
        req.user
        ↓
        próxima camada
```

---

# 74. Middleware de autorização

Quando necessário, utilizar uma camada específica para autorização por role.

Exemplo conceitual:

```text
requireAuth()
    ↓
requireRole("ADMIN")
    ↓
Controller
```

---

# 75. Não confiar em role enviada pelo frontend

Não permitir que o frontend determine sua própria role.

Incorreto:

```json
{
  "role": "ADMIN"
}
```

como mecanismo de autorização.

A role deve vir da identidade autenticada e ser validada pelo backend.

---

# 76. Elevação de privilégio

Usuários não devem conseguir alterar:

```text
role
```

para obter permissões maiores.

Por exemplo, um cliente não pode enviar:

```json
{
  "role": "ADMIN"
}
```

para se tornar administrador.

Alterações administrativas de role devem seguir fluxo explicitamente autorizado.

---

# 77. Cadastro público

O endpoint público de cadastro não deve permitir criação arbitrária de:

```text
ADMIN
COLETOR
```

O cadastro público deve criar o perfil definido pelo fluxo de negócio.

Por padrão:

```text
role = CLIENTE
```

quando essa for a regra adotada.

---

# 78. Criação de coletor e administrador

A forma de criação de:

```text
COLETOR
ADMIN
```

não está definida por este documento como uma funcionalidade pública.

Não implementar autoelevação de privilégios.

O fluxo de criação dessas contas deve ser decidido e documentado antes de ser exposto.

---

# 79. Dados de autenticação na resposta

Respostas da API devem retornar somente dados necessários.

Evitar:

```json
{
  "user": {
    "senhaHash": "...",
    "tokenInterno": "...",
    "secret": "..."
  }
}
```

---

# 80. Status HTTP de segurança

## Não autenticado

```text
401 Unauthorized
```

## Autenticado sem permissão

```text
403 Forbidden
```

## Recurso inexistente

```text
404 Not Found
```

## Conflito

```text
409 Conflict
```

---

# 81. Política de respostas genéricas

Quando detalhar o erro puder expor informação sensível, utilizar mensagem genérica.

Exemplo:

```text
Credenciais inválidas.
```

em vez de:

```text
O e-mail existe, mas a senha está incorreta.
```

---

# 82. Segurança de notificações

Um usuário só pode acessar:

```text
notifications
```

associadas ao seu próprio identificador.

Exemplo:

```javascript
{
  _id: notificationId,
  usuarioId: authenticatedUserId
}
```

A verificação deve ocorrer no backend.

---

# 83. Segurança de coletas

Ao consultar uma coleta:

```text
GET /api/v1/collections/:id
```

o backend deve verificar se o usuário possui acesso.

Possíveis casos:

```text
CLIENTE → coleta pertence ao próprio cliente
COLETOR → coleta pertence à sua operação
ADMIN   → acesso administrativo
```

---

# 84. Segurança das ações do coletor

Para:

```text
accept
start
collect
deliver
complete
```

o backend deve validar:

```text
usuário autenticado
role = COLETOR
status atual
coletorId
transição permitida
```

---

# 85. Segurança do ecoponto

A consulta pública, quando habilitada, pode retornar somente informações públicas.

Alterações administrativas exigem:

```text
role = ADMIN
```

---

# 86. Segurança do perfil

Usuário autenticado:

```text
GET /api/v1/profile
PATCH /api/v1/profile
```

deve acessar apenas o próprio perfil.

Não utilizar um `:id` fornecido pelo frontend para permitir edição arbitrária de outro usuário.

---

# 87. Proteção contra enumeração

Operações públicas como recuperação de senha e autenticação devem evitar revelar informações excessivas sobre quais contas existem no sistema.

---

# 88. Proteção contra abuso

Além do rate limiting, considerar:

```text
limitação de tamanho de payload
limitação de paginação
validação de arquivos, caso existam futuramente
timeouts
logs
monitoramento
```

Somente implementar controles necessários ao escopo real.

---

# 89. Payloads

A API deve limitar o tamanho das requisições para evitar abuso e consumo excessivo de memória.

O limite deve ser configurado de acordo com os payloads reais do EcoByte.

---

# 90. Uploads

O MVP atual não define upload de arquivos como requisito principal.

Não criar sistema de upload sem requisito.

Caso uploads sejam adicionados futuramente, criar regras específicas de:

```text
tipo
tamanho
extensão
armazenamento
nome
sanitização
acesso
```

---

# 91. Segurança em desenvolvimento

O ambiente de desenvolvimento deve utilizar dados fictícios.

Não utilizar:

```text
senhas reais
documentos reais
tokens reais
credenciais de produção
```

em seeds ou exemplos.

---

# 92. Segurança em produção

Em produção:

```text
HTTPS
segredos protegidos
MongoDB protegido
logs controlados
cookies seguros
CORS configurado
rate limiting
variáveis de ambiente
```

devem ser tratados como requisitos operacionais.

---

# 93. Auditoria

O sistema pode registrar eventos importantes para auditoria.

Exemplos:

```text
alteração de status de usuário
aceite de coleta
mudança de status de coleta
alteração do ecoponto
```

Caso um sistema de auditoria completo seja implementado, seus requisitos devem ser documentados separadamente.

---

# 94. Preservação de histórico

Alterações de perfil não devem modificar retroativamente:

```text
enderecoColeta
```

ou outros dados históricos que pertençam à coleta.

---

# 95. Exclusão lógica

Para usuários ou recursos com histórico importante, preferir:

```text
status = INATIVO
```

em vez de exclusão física.

Isso ajuda a preservar:

```text
histórico
referências
auditoria
relatórios
```

---

# 96. Segurança da máquina de estados

Não permitir alterações diretas no banco que ignorem a camada de negócio durante operações normais da aplicação.

O fluxo deve ser:

```text
API
 ↓
Service
 ↓
validação da transição
 ↓
Database
```

Consultas administrativas de manutenção são exceção e devem ser cuidadosamente controladas.

---

# 97. Segredos e logs

Mesmo em mensagens de erro, nunca expor:

```text
MONGODB_URI
SESSION_SECRET
API_KEY
senha
senhaHash
tokens
```

---

# 98. Dependências

As dependências relacionadas à segurança devem ser mantidas atualizadas conforme a estratégia de manutenção do projeto.

Não adicionar bibliotecas de segurança sem entender:

```text
função
configuração
impacto
compatibilidade
```

---

# 99. Configurações de ambiente

Configurações relacionadas à segurança devem ser externas ao código quando forem específicas do ambiente.

Exemplos:

```env
NODE_ENV=
SESSION_SECRET=
MONGODB_URI=
FRONTEND_URL=
COOKIE_SECURE=
COOKIE_SAME_SITE=
RATE_LIMIT_WINDOW=
RATE_LIMIT_MAX=
```

Os nomes são exemplos e podem ser ajustados à implementação.

---

# 100. Checklist de autenticação

Antes de considerar autenticação concluída:

```text
[ ] Cadastro funcionando
[ ] E-mail validado
[ ] E-mail único
[ ] Senha validada
[ ] Confirmação de senha
[ ] Hash seguro
[ ] Login funcionando
[ ] Logout funcionando
[ ] Sessão protegida
[ ] /auth/me funcionando
[ ] Usuário inativo bloqueado
[ ] Rotas protegidas
[ ] Role validada
[ ] Propriedade do recurso validada
[ ] Erros tratados
[ ] Rate limiting considerado
[ ] Recuperação de senha segura
```

---

# 101. Checklist de segurança

```text
[ ] HTTPS em produção
[ ] Segredos fora do Git
[ ] .env ignorado
[ ] .env.example criado
[ ] MongoDB protegido
[ ] Senhas nunca armazenadas em texto puro
[ ] senhaHash nunca retornado
[ ] CORS configurado
[ ] Cookies configurados corretamente
[ ] CSRF avaliado quando necessário
[ ] Validação de entrada
[ ] Proteção contra operadores MongoDB arbitrários
[ ] Rate limiting
[ ] Mensagens de erro seguras
[ ] Logs sem dados sensíveis
[ ] Controle por role
[ ] Controle por propriedade
[ ] Máquina de estados protegida
[ ] Concorrência tratada
[ ] Dados históricos preservados
```

---

# 102. Testes obrigatórios

A suíte de testes deve cobrir pelo menos:

## Cadastro

```text
senha válida
senha inválida
confirmação diferente
e-mail inválido
e-mail duplicado
```

## Login

```text
credenciais válidas
senha incorreta
e-mail inexistente
usuário inativo
```

## Autorização

```text
cliente acessando rota de admin
coletor acessando rota de admin
cliente tentando aceitar coleta
coletor tentando acessar coleta de outro contexto
```

## Coletas

```text
aceite válido
dupla aceitação
transição inválida
coletor incorreto
```

## Segurança

```text
rota sem autenticação
ID inválido
filtro malformado
payload inválido
excesso de requisições
```

---

# 103. Critérios de aceite de segurança

A autenticação será considerada funcional quando:

```text
usuário
    ↓
cadastro
    ↓
login
    ↓
sessão
    ↓
rota protegida
    ↓
logout
    ↓
acesso bloqueado
```

O controle de autorização será considerado funcional quando:

```text
CLIENTE
    ↓
acessa somente recursos permitidos

COLETOR
    ↓
acessa somente operações permitidas

ADMIN
    ↓
acessa funções administrativas
```

---

# 104. Decisões ainda abertas

Os seguintes pontos permanecem dependentes de decisão do projeto:

```text
política de múltiplas sessões
confirmação de e-mail
provedor de recuperação de senha
política definitiva de CORS
limites de rate limiting para recuperação de senha
criação administrativa de COLETOR
criação administrativa de ADMIN
auditoria detalhada
```

Decididos em 2026-09-25: expiração da sessão (`DEC-021`), CSRF complementar (`DEC-069`), limites de login e cadastro (`DEC-067`) e identificação do cliente atrás de proxies (`DEC-068`).

CORS: até a decisão definitiva, o backend não emite headers CORS. Como o navegador acessa a API pela mesma origem (`DEC-063`), CORS não é necessário para o frontend oficial.

Não inventar valores definitivos para esses itens sem registrar a decisão.

---

# 105. Documentação relacionada

Este documento deve permanecer sincronizado com:

```text
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/05_ROUTES.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
docs/14_STATE_MACHINE.md
docs/DECISIONS.md
docs/OPEN_QUESTIONS.md
```

---

# 106. Regra final

A segurança do EcoByte deve ser tratada como responsabilidade de todas as camadas, mas as regras críticas devem ser garantidas pelo backend.

Fluxo principal:

```text
Frontend
    ↓
HTTP
    ↓
Autenticação
    ↓
Autorização
    ↓
Validação
    ↓
Regras de negócio
    ↓
MongoDB
```

Nenhuma camada externa ao backend deve ser considerada autoridade suficiente para garantir:

```text
identidade
permissão
status
role
propriedade do recurso
transição de estado
```

Alterações relevantes neste documento devem ser refletidas na implementação, nos testes e na documentação relacionada antes de serem consideradas concluídas.