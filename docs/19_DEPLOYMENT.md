# 19 — DEPLOYMENT

## 1. Objetivo

Este documento define o processo oficial de publicação do EcoByte em ambientes de:

```text
development
staging
production
```

Ele estabelece:

- preparação para deployment;
- configuração de ambientes;
- build;
- publicação do frontend;
- publicação do backend;
- configuração do MongoDB;
- variáveis de ambiente;
- CI/CD;
- migrations;
- segurança;
- health checks;
- monitoramento;
- rollback;
- verificação pós-deploy.

Este documento é a referência operacional de deployment do projeto.

Deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
docs/09_AUTHENTICATION_SECURITY.md
docs/16_ASSETS.md
docs/17_TESTING.md
docs/18_DEVELOPMENT.md
```

---

# 2. Princípio geral

O deployment deve ser reproduzível.

Fluxo oficial:

```text
Código
    ↓
Validação
    ↓
Testes
    ↓
Build
    ↓
Staging
    ↓
Validação
    ↓
Production
    ↓
Smoke Test
    ↓
Monitoramento
```

Nenhuma etapa crítica deve depender de conhecimento pessoal não documentado.

---

# 3. Ambientes

## 3.1 Development

Utilizado para:

```text
desenvolvimento local
debug
testes unitários
testes de integração
testes manuais
```

Deve utilizar:

```text
MongoDB de desenvolvimento
dados fictícios
secrets de desenvolvimento
```

---

## 3.2 Staging

Quando utilizado, deve representar uma versão próxima da produção.

Objetivos:

```text
integração
QA
E2E
validação de build
teste de deployment
```

Não utilizar dados reais sem necessidade e proteção adequada.

---

## 3.3 Production

Ambiente de uso real.

Deve utilizar:

```text
HTTPS
MongoDB protegido
secrets seguros
CORS configurado
cookies seguros
logs controlados
monitoramento
backup
```

---

# 4. Separação de ambientes

Cada ambiente deve possuir suas próprias configurações.

```text
Development
    ↓
MongoDB Development

Staging
    ↓
MongoDB Staging

Production
    ↓
MongoDB Production
```

Nunca apontar:

```text
development
```

ou:

```text
testes
```

para o banco de produção.

---

# 5. Arquitetura de deployment

Arquitetura conceitual:

```text
                    ┌─────────────────┐
                    │     Usuário     │
                    └────────┬────────┘
                             │
                           HTTPS
                             │
                             ▼
                    ┌─────────────────┐
                    │    Frontend     │
                    └────────┬────────┘
                             │
                           HTTPS
                             │
                             ▼
                    ┌─────────────────┐
                    │ Backend / API   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    └─────────────────┘
```

---

# 6. Frontend

O frontend é uma aplicação Next.js (App Router, `DEC-062`) executada como servidor Node.js:

```bash
npm run build --workspace frontend
npm run start --workspace frontend
```

O build gera o diretório:

```text
frontend/.next/
```

O servidor Next.js também atua como proxy de `/api/v1/*` para o backend (`DEC-063`), portanto o frontend precisa alcançar o backend pela rede interna configurada em `API_INTERNAL_URL`.

Os rewrites do Next.js são avaliados durante o `next build`. Por isso `API_INTERNAL_URL` deve estar definida **no momento do build** de produção; sem ela, o build é interrompido com erro. Alterar a URL do backend exige novo build do frontend.

---

# 7. Backend

O backend deve ser executado em um ambiente Node.js compatível com a versão oficial utilizada pelo projeto.

Fluxo:

```text
instalar dependências
    ↓
configurar ambiente
    ↓
executar testes
    ↓
iniciar aplicação
    ↓
conectar MongoDB
    ↓
expor API
```

---

# 8. MongoDB

O MongoDB pode ser disponibilizado por:

```text
MongoDB local
MongoDB Atlas
outro serviço compatível
```

A decisão final de infraestrutura deve ser registrada em:

```text
docs/DECISIONS.md
```

quando definida.

---

# 9. Variáveis de ambiente

Configurações específicas do ambiente devem permanecer fora do código.

Exemplo de backend:

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=
FRONTEND_URL=
SESSION_SECRET=
```

Exemplo de frontend:

```env
API_INTERNAL_URL=
```

`API_INTERNAL_URL` é lida somente no servidor Next.js para o proxy (`DEC-063`) e não é exposta ao navegador.

Os nomes finais devem seguir a implementação real.

---

# 10. Secrets

Nunca versionar:

```text
MONGODB_URI com credenciais
SESSION_SECRET
API keys
SMTP credentials
tokens
private keys
```

---

# 11. `.env`

O arquivo:

```text
.env
```

pode ser utilizado localmente.

Não deve ser commitado quando contiver informações sensíveis.

---

# 12. `.env.example`

O repositório deve possuir:

```text
.env.example
```

com apenas os nomes das variáveis.

Exemplo:

```env
NODE_ENV=
PORT=
MONGODB_URI=
FRONTEND_URL=
SESSION_SECRET=
```

---

# 13. `.gitignore`

O projeto deve impedir o versionamento de arquivos sensíveis.

Exemplo:

```gitignore
.env
.env.*
!.env.example
node_modules/
logs/
dist/
.next/
```

A configuração final deve refletir as necessidades reais do projeto.

---

# 14. Build do frontend

Processo:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Os scripts disponíveis devem corresponder ao `package.json`.

---

# 15. Build do backend

Quando o backend utilizar TypeScript ou processo de compilação:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Caso o backend seja executado diretamente em JavaScript, o processo deve ser adaptado.

---

# 16. Instalação determinística

Em CI/CD e ambientes de deployment que utilizem `package-lock.json`, preferir:

```bash
npm ci
```

em vez de:

```bash
npm install
```

quando apropriado.

---

# 17. Node.js

A versão de Node.js deve ser consistente entre:

```text
development
CI
staging
production
```

A versão pode ser definida por:

```text
engines
.nvmrc
ou mecanismo equivalente
```

---

# 18. Package Manager

Utilizar um único gerenciador de pacotes como padrão do projeto.

Exemplo:

```text
npm
```

Não alternar entre:

```text
npm
yarn
pnpm
```

sem decisão documentada.

---

# 19. Scripts obrigatórios

O projeto deve possuir scripts equivalentes aos necessários para:

```text
dev
build
start
test
lint
typecheck
```

Nem todos precisam existir em cada pacote, desde que a necessidade da stack seja atendida.

---

# 20. Configuração do frontend

O frontend utiliza:

```env
API_INTERNAL_URL=http://backend-interno:4000
```

lida somente no servidor Next.js para o proxy (`DEC-063`).

Variáveis com prefixo:

```text
NEXT_PUBLIC_*
```

são incorporadas ao bundle do navegador e nunca devem conter secrets.

---

# 21. Configuração do backend

O backend deve carregar as configurações do ambiente através de uma camada centralizada.

Exemplo conceitual:

```text
config/
```

Essa camada pode validar:

```text
MONGODB_URI
FRONTEND_URL
SESSION_SECRET
PORT
```

Implementação: `backend/src/config/env.ts`. Em produção, o backend não inicia sem:

```text
MONGODB_URI
SESSION_SECRET   (mínimo de 32 caracteres, exclusivo do ambiente)
FRONTEND_URL     (origem pública do frontend, DEC-069)
TRUST_PROXY      (proxies confiáveis, DEC-068)
```

---

# 21.1 Proxy de borda e identificação do cliente (DEC-068)

O proxy do Next.js não informa o IP real do cliente nem o protocolo original. Por isso, em produção:

1. o tráfego público deve passar por um proxy de borda (plataforma de hospedagem, balanceador ou servidor web) que defina `X-Forwarded-For` com o IP real e `X-Forwarded-Proto: https`;
2. o backend Express não deve ser acessível publicamente sem passar por esse proxy (somente pela rede interna, via `API_INTERNAL_URL`);
3. `TRUST_PROXY` deve refletir quantos proxies confiáveis existem à frente do backend.

Sem essas condições:

- o rate limiting (`DEC-067`) passa a tratar todos os usuários como um único IP, ou pode ser burlado com headers forjados;
- o cookie de sessão `Secure` não é emitido, pois o backend não reconhece a conexão original como HTTPS, e o login deixa de funcionar.

Com a hospedagem do `DEC-086` (Vercel à frente do Render), o valor é `TRUST_PROXY=2`. Ele deve ser validado com o teste de fumaça do §21.2 após o primeiro deploy.

---

# 21.2 Publicação no Atlas, Render e Vercel (DEC-086)

Ordem do primeiro deploy: banco, backend, frontend, inicialização e teste de fumaça.

## 1. MongoDB Atlas

1. Crie um cluster **M0** (gratuito) em `mongodb.com`, provedor AWS, região N. Virginia (`us-east-1`).
2. **Security > Database & Network Access**, aba **Database Users**, **Add New Database User**: crie um usuário só para a aplicação (ex.: `ecobyte-app`), com **Autogenerate Secure Password** e a função **Read and write to any database**.
3. Na mesma página, na lista de IPs: o plano free do Render não tem IP fixo, então libere `0.0.0.0/0`. A proteção fica com o usuário e a senha do banco (19 §32).
4. Copie a connection string (`mongodb+srv://...`) e inclua o nome do banco: `.../ecobyte?retryWrites=true&w=majority`.

## 2. Backend no Render

1. Em `render.com`, **New > Blueprint** e selecione o repositório: o `render.yaml` cria o serviço `ecobyte-api`.
2. Informe os segredos pedidos:
   - `MONGODB_URI`: a string do Atlas;
   - `FRONTEND_URL`: o endereço da Vercel, que pode ser ajustado depois do passo 3;
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` e `MAIL_FROM`: os dados do provedor de e-mail.
3. `SESSION_SECRET` é gerada pelo Render. `SMTP_PORT` já vem como 2525, porque o plano free bloqueia 25, 465 e 587.
4. Confira `https://<serviço>.onrender.com/api/v1/health`.

O build usa `npm ci --include=dev`: com `NODE_ENV=production`, que também vale no build do Render, o `npm ci` pularia as devDependencies (`typescript`, `@types/*`), e o `tsc` falharia com `TS2688: Cannot find type definition file for node`.

## 3. Frontend na Vercel

1. **Add New > Project** e importe o repositório. Em **Root Directory**, escolha `frontend`. O framework (Next.js) e a instalação pelo workspace npm são detectados.
2. Em **Environment Variables**, defina `API_INTERNAL_URL=https://<serviço>.onrender.com`. Ela é lida no build (§6): ao mudar, faça um novo deploy.
3. Depois do deploy, copie o domínio (`https://<projeto>.vercel.app`) para `FRONTEND_URL` no Render. Os links dos e-mails e a validação de Origin dependem dele.

## 4. Inicialização (DEC-087)

Na máquina do responsável, sem gravar valores em arquivos versionados:

```bash
MONGODB_URI="mongodb+srv://..." \
BOOTSTRAP_ADMIN_NOME="..." BOOTSTRAP_ADMIN_EMAIL="..." BOOTSTRAP_ADMIN_SENHA="..." \
ECOPONTO_NOME="..." ECOPONTO_LOGRADOURO="..." ECOPONTO_NUMERO="..." ECOPONTO_BAIRRO="..." \
ECOPONTO_CIDADE="Diadema" ECOPONTO_ESTADO="SP" ECOPONTO_CEP="..." \
npm run bootstrap --workspace backend
```

O seed **nunca** é executado nesse banco (§36).

## 5. Teste de fumaça (§78, §79)

1. `/api/v1/health` pela Vercel: `https://<projeto>.vercel.app/api/v1/health`.
2. Login do administrador, troca da senha provisória e conferência do ecoponto.
3. **Cookie seguro:** depois do login, o cookie `ecobyte.sid` deve ter `Secure`. Se o login não persistir, `TRUST_PROXY` está baixo.
4. **IP real:** dez logins errados seguidos devem bloquear só o seu IP, com `429`, e não os outros usuários. Se bloquear todos, revise `TRUST_PROXY`.
5. Cadastro de cliente, e-mail de confirmação, solicitação de coleta e o fluxo do coletor até a conclusão.

## Riscos conhecidos dos planos gratuitos

- **Primeiro acesso lento:** o Render "dorme" após 15 minutos sem tráfego, e a primeira requisição leva cerca de 1 minuto. Antes de uma apresentação, abra `/api/v1/health` alguns minutos antes.
- **Backend com endereço público:** no Render free, o endereço `onrender.com` é público, e não só a rede interna do item 2 do §21.1. Quem chamar a API direto pode forjar `X-Forwarded-For` e contornar o limite de tentativas por IP (`DEC-067`). Autenticação, autorização, validação de Origin e o hash Argon2id continuam valendo. Para uma operação real, restrinja o acesso ao backend, por exemplo com um plano que ofereça rede privada.
- **Sem backup automático no M0** (`OQ-036`).

---

# 22. Validação das variáveis

Variáveis obrigatórias devem ser verificadas durante o startup.

Exemplo:

```text
MONGODB_URI ausente
        ↓
startup interrompido
        ↓
erro claro no log
```

Evitar deixar a aplicação iniciar parcialmente configurada.

---

# 23. Startup

Sequência recomendada:

```text
1. carregar environment
2. validar configuração
3. conectar MongoDB
4. configurar middleware
5. registrar rotas
6. iniciar servidor
7. disponibilizar health check
```

A implementação pode adaptar a ordem quando houver necessidade técnica.

---

# 24. Health Check

Endpoint:

```http
GET /api/v1/health
```

Deve permitir verificar se a API está operacional.

Resposta conceitual:

```json
{
  "status": "success",
  "message": "API operacional.",
  "data": {
    "status": "up"
  }
}
```

Não retornar:

```text
credentials
connection strings
stack traces
```

---

# 25. Health Check do banco

Quando fizer sentido, o health check pode verificar a conectividade com o MongoDB.

Caso isso seja implementado, a resposta pública deve continuar sem informações internas sensíveis.

---

# 26. Readiness e Liveness

Caso a infraestrutura suporte:

```text
liveness
readiness
```

podem ser utilizados.

Conceitualmente:

```text
liveness
→ processo está executando

readiness
→ aplicação está pronta para receber tráfego
```

Não adicionar endpoints extras sem necessidade real.

---

# 27. HTTPS

Production deve utilizar:

```text
HTTPS
```

em:

```text
frontend
backend
```

quando ambos forem acessíveis diretamente.

---

# 28. Cookies

Quando cookies forem utilizados para autenticação em production, revisar:

```text
HttpOnly
Secure
SameSite
```

de acordo com a arquitetura final.

---

# 29. CORS

O backend deve permitir somente origens necessárias.

Exemplo:

```env
FRONTEND_URL=https://ecobyte.example.com
```

Evitar:

```text
Access-Control-Allow-Origin: *
```

quando não for necessário.

---

# 30. MongoDB Production

O MongoDB de production deve possuir:

```text
autenticação
controle de rede
credenciais seguras
backup
monitoramento
```

conforme o provedor adotado.

---

# 31. Connection String

A connection string deve vir de:

```env
MONGODB_URI=
```

Nunca diretamente do código.

---

# 32. Acesso de rede ao MongoDB

Quando o provedor disponibilizar controle de rede, permitir somente os acessos necessários.

Evitar liberar o banco indiscriminadamente para toda a internet.

---

# 33. Banco de testes

Os testes devem utilizar:

```text
MongoDB de teste
```

ou uma estratégia equivalente.

Nunca executar testes destrutivos no banco de production.

---

# 34. Seed

O seed deve ser utilizado principalmente para:

```text
development
staging
```

e deve conter dados fictícios.

Exemplos:

```text
1 ADMIN
1 CLIENTE PF
1 CLIENTE PJ
1 COLETOR
1 ECOPONTO
```

---

# 35. Estados para seed

O ambiente de desenvolvimento deve possuir exemplos de coletas:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 36. Nunca usar seed destrutivo em production

Evitar processos automáticos que executem:

```javascript
deleteMany({})
dropDatabase()
```

ou equivalentes em production.

---

# 37. Migrations

Quando uma alteração estrutural exigir transformação de documentos:

```text
migration
```

deve ser criada e testada.

Alterar o Mongoose Schema não significa que documentos existentes serão automaticamente transformados.

---

# 38. Compatibilidade de schema

Antes de uma mudança de schema:

```text
avaliar documentos existentes
avaliar API
avaliar frontend
avaliar queries
avaliar índices
```

---

# 39. Estratégia de migração

Quando apropriado:

```text
versão compatível
    ↓
migration
    ↓
validação
    ↓
nova versão
```

---

# 40. Alterações destrutivas

Alterações que removam ou transformem dados devem ser consideradas críticas.

Antes de executar:

```text
backup
```

deve ser avaliado conforme o impacto.

---

# 41. API versioning

A versão atual é:

```text
/api/v1
```

Mudanças incompatíveis podem exigir:

```text
/api/v2
```

---

# 42. Breaking changes

Evitar quebrar o contrato da API sem planejamento.

Exemplo:

```text
remover campo utilizado pelo frontend
```

deve ser tratado como alteração potencialmente incompatível.

---

# 43. Compatibilidade frontend/backend

Antes do deployment:

```text
frontend
+
backend
+
database
```

devem ser compatíveis.

---

# 44. Deploy do frontend

Processo conceitual:

```text
Git
 ↓
CI
 ↓
install
 ↓
test
 ↓
build
 ↓
dist
 ↓
hosting
```

---

# 45. Deploy do backend

Processo conceitual:

```text
Git
 ↓
CI
 ↓
install
 ↓
test
 ↓
build
 ↓
runtime
 ↓
server
```

---

# 46. Ordem recomendada

Para uma nova versão:

```text
1. validar código
2. executar testes
3. gerar build
4. publicar staging
5. executar smoke/E2E
6. aprovar
7. publicar production
8. verificar health
9. executar smoke
10. monitorar
```

---

# 47. CI/CD

Quando CI/CD for utilizado:

```text
Push / Pull Request
        ↓
Lint
        ↓
Typecheck
        ↓
Tests
        ↓
Build
        ↓
Deploy Staging
        ↓
E2E
        ↓
Deploy Production
```

A pipeline real pode conter etapas adicionais.

Implementação (`DEC-089`): `.github/workflows/ci.yml`, com lint, typecheck, testes e build do backend e do frontend em cada pull request e push para `main`. O Render publica a `main` só depois do CI aprovado. Staging e E2E continuam fora do escopo.

---

# 48. Falha no CI

Se uma etapa crítica falhar:

```text
deployment deve ser interrompido
```

para evitar publicação de uma versão conhecida como inválida.

---

# 49. Pull Request

Alterações importantes devem informar:

```text
o que mudou
impacto
testes realizados
alterações de banco
alterações de deployment
```

---

# 50. Branch de production

A estratégia de branches é definida pelo workflow do projeto.

A branch de production deve representar somente versões aptas à publicação.

---

# 51. Tags

Versões publicadas podem utilizar tags:

```text
v1.0.0
v1.1.0
v1.1.1
```

quando isso fizer sentido.

---

# 52. Semantic Versioning

Se Semantic Versioning for utilizado:

```text
MAJOR
MINOR
PATCH
```

podem representar:

```text
breaking change
feature compatível
correção
```

respectivamente.

---

# 53. Changelog

Alterações de production relevantes podem ser registradas em:

```text
CHANGELOG.md
```

quando adotado pelo projeto.

---

# 54. Rollback

Deve existir uma estratégia para retornar à versão anterior.

Fluxo:

```text
problema detectado
    ↓
identificar versão estável
    ↓
rollback
    ↓
health check
    ↓
smoke test
```

---

# 55. Rollback de frontend

O hosting deve, quando possível, permitir retorno para uma versão anterior do build.

---

# 56. Rollback de backend

O runtime deve, quando possível, permitir retorno para uma versão anterior da aplicação.

---

# 57. Rollback de banco

Rollback de código não implica rollback automático do banco.

Antes de alterações incompatíveis de schema:

```text
avaliar estratégia de compatibilidade
```

---

# 58. Database backup

Production deve possuir estratégia de backup.

Avaliar:

```text
frequência
retenção
restauração
integridade
```

---

# 59. Restore

Um backup só deve ser considerado confiável quando existir uma estratégia de restauração testável.

---

# 60. Dados reais

Dados de production não devem ser copiados para development ou staging sem uma estratégia apropriada de:

```text
anonimização
proteção
controle de acesso
```

---

# 61. Rotas do frontend

O frontend Next.js é servido pelo próprio servidor Next.js, que resolve as rotas de página (App Router).

Não é necessário fallback de SPA em servidor estático.

O mapa definitivo de páginas do frontend ainda não está documentado e deve ser definido antes da implementação das telas.

---

# 62. API routing

As rotas da API devem permanecer sob:

```text
/api/v1
```

e não devem conflitar com as rotas do frontend.

---

# 63. Assets

Após deployment, verificar:

```text
logo
favicon
imagens
SVG
fontes
vídeos
```

---

# 64. Asset paths

Não utilizar referências locais.

Incorreto:

```text
C:\project\assets\logo.svg
```

ou:

```text
file:///...
```

---

# 65. Cache

Assets estáticos versionados podem possuir cache longo.

Dados dinâmicos da API devem possuir cache compatível com sua natureza.

Não armazenar recursos privados em cache público de forma indevida.

---

# 66. Cache busting

O build deve possuir estratégia para evitar que assets incompatíveis permaneçam em cache.

Quando suportado pelo bundler:

```text
hash dos arquivos
```

pode ser utilizado.

---

# 67. CDN

CDN pode ser utilizada para:

```text
assets
imagens
vídeos
```

quando houver necessidade.

Não é requisito obrigatório do MVP.

---

# 68. Compression

A infraestrutura pode utilizar compressão para:

```text
HTML
CSS
JS
JSON
```

quando suportado.

---

# 69. Logs

Logs de production devem ser suficientes para diagnosticar:

```text
erros
latência
falhas de conexão
erros de autenticação
falhas operacionais
```

---

# 70. Informações que nunca devem aparecer nos logs

Nunca registrar:

```text
senha
senhaHash
session secret
tokens completos
connection string com credencial
API keys privadas
```

---

# 71. Logging estruturado

Quando possível, utilizar logs com campos estruturados.

Exemplo:

```json
{
  "level": "error",
  "message": "Falha ao processar coleta.",
  "route": "/api/v1/collections/:id/accept",
  "requestId": "REQUEST_ID"
}
```

---

# 72. Request ID

Um identificador de requisição pode ser utilizado para correlacionar:

```text
request
logs
erro
```

É opcional.

---

# 73. Monitoramento

Production deve possuir mecanismos para acompanhar:

```text
disponibilidade
erros
latência
MongoDB
deployment
```

---

# 74. Alertas

Quando suportado pela infraestrutura, considerar alertas para:

```text
API indisponível
5xx elevado
MongoDB indisponível
deploy falhou
```

---

# 75. Métricas da API

Pode-se acompanhar:

```text
requests
4xx
5xx
latência
timeouts
```

---

# 76. Métricas do banco

Quando disponíveis:

```text
conexões
latência
operações
erros
uso de recursos
```

---

# 77. Health pós-deploy

Após deployment:

```http
GET /api/v1/health
```

deve ser verificado.

---

# 78. Smoke test pós-deploy

Executar, no mínimo:

```text
frontend abre
API responde
login funciona
rota protegida funciona
MongoDB persiste dados
```

---

# 79. Smoke test do fluxo de coleta

Quando o fluxo for impactado:

```text
criar coleta
↓
PENDENTE
↓
aceitar
↓
ACEITA
↓
iniciar
↓
A_CAMINHO
↓
recolher
↓
RECOLHIDA
↓
entregar
↓
ENTREGUE_ECOPONTO
↓
concluir
↓
CONCLUIDA
```

---

# 80. Dados de teste em production

Evitar criar dados fictícios permanentes em production.

Quando um teste controlado for indispensável:

```text
identificar
executar
validar
limpar
```

conforme procedimento específico.

---

# 81. Segurança do deployment

Antes da publicação, verificar:

```text
HTTPS
CORS
cookies
secrets
MongoDB access
rate limiting
logs
```

---

# 82. Frontend secrets

Nunca colocar no frontend:

```text
MONGODB_URI
SESSION_SECRET
private API key
```

---

# 83. Variáveis `NEXT_PUBLIC_*`

No Next.js:

```text
NEXT_PUBLIC_*
```

deve ser tratado como informação potencialmente pública.

Nunca considerar essa variável como armazenamento seguro de secrets.

---

# 84. Backend secrets

Secrets devem permanecer exclusivamente no ambiente do backend ou infraestrutura correspondente.

---

# 85. Runtime

A versão de Node.js utilizada em production deve ser compatível com:

```text
package.json
dependencies
framework
MongoDB driver
```

---

# 86. Compatibilidade MongoDB

A versão do MongoDB deve ser compatível com:

```text
MongoDB Driver
Mongoose
Node.js
```

antes de upgrades relevantes.

---

# 87. Dependências

Atualizações de dependências críticas devem ser tratadas como alterações relevantes.

Evitar grandes upgrades imediatamente antes de um deployment importante sem testes suficientes.

---

# 88. Infraestrutura externa

Serviços externos futuros, como:

```text
email
storage
mapas
```

devem possuir:

```text
credentials
environment variables
timeouts
error handling
```

próprios.

---

# 89. Não adicionar infraestrutura desnecessária

O MVP não exige obrigatoriamente:

```text
Redis
RabbitMQ
Kubernetes
microservices
CDN
```

Essas tecnologias somente devem ser adicionadas quando houver necessidade real.

---

# 90. Monolito

O backend pode permanecer como uma aplicação única enquanto isso atender ao projeto.

Não separar serviços prematuramente.

---

# 91. Escalabilidade

A arquitetura deve permitir evolução futura, mas o deployment inicial deve permanecer proporcional ao escopo do projeto.

Priorizar:

```text
simplicidade
confiabilidade
custo
manutenção
```

---

# 92. Performance do frontend

Após deployment, verificar:

```text
bundle
assets
imagens
fontes
vídeos
renderização
```

---

# 93. Performance da API

Avaliar:

```text
latência
consultas
agregações
paginação
índices
```

---

# 94. Performance do MongoDB

Queries frequentes devem possuir índices apropriados quando necessário.

Antes de adicionar índice:

```text
identificar query
↓
analisar explain
↓
criar índice
↓
medir novamente
```

---

# 95. Deployment e documentação

Toda alteração de infraestrutura relevante deve ser refletida na documentação.

Exemplos:

```text
novo provedor
novo domínio
novo banco
nova variável
novo pipeline
```

---

# 96. Registro de decisões

Decisões importantes de infraestrutura devem ser registradas em:

```text
docs/DECISIONS.md
```

Exemplos:

```text
provedor de frontend
provedor do backend
MongoDB Atlas
política de deploy
CI/CD
domínios
```

---

# 97. Open Questions

Itens ainda não definidos devem permanecer em:

```text
docs/OPEN_QUESTIONS.md
```

Não inventar infraestrutura definitiva para lacunas não decididas.

---

# 98. Checklist antes do deploy

```text
[ ] Requisitos validados
[ ] Testes passando
[ ] Lint passando
[ ] Typecheck passando
[ ] Build funcionando
[ ] Environment configurado
[ ] MongoDB correto
[ ] CORS correto
[ ] HTTPS
[ ] Secrets configurados
[ ] API URL correta
[ ] Assets verificados
```

---

# 99. Checklist do frontend

```text
[ ] Build
[ ] Proxy /api/v1 → backend
[ ] API_INTERNAL_URL
[ ] Assets
[ ] Favicon
[ ] Responsividade
[ ] Sem erros de console
```

---

# 100. Checklist do backend

```text
[ ] Runtime correto
[ ] Environment validado
[ ] MongoDB conectado
[ ] Health check
[ ] CORS
[ ] Cookies
[ ] Rate limiting
[ ] Logs
```

---

# 101. Checklist do MongoDB

```text
[ ] Banco correto
[ ] Credenciais
[ ] Network access
[ ] Índices
[ ] Backup
[ ] Migration
[ ] Nenhum dado destruído
```

---

# 102. Checklist pós-deploy

```text
[ ] Frontend acessível
[ ] API acessível
[ ] Health check
[ ] Login
[ ] Cadastro
[ ] Cliente
[ ] Coletor
[ ] Admin
[ ] MongoDB
[ ] Assets
[ ] Logs
```

---

# 103. Processo oficial

O deployment deve seguir:

```text
1. Desenvolver
2. Revisar
3. Testar
4. Buildar
5. Publicar staging
6. Validar
7. Publicar production
8. Executar health check
9. Executar smoke test
10. Monitorar
```

---

# 104. Processo de rollback

Quando houver incidente crítico:

```text
1. identificar problema
2. interromper propagação
3. avaliar impacto
4. selecionar versão estável
5. executar rollback
6. verificar banco
7. executar health check
8. executar smoke test
9. monitorar
10. registrar incidente
```

---

# 105. Incidentes

Após incidente relevante, registrar:

```text
causa
impacto
tempo
ação executada
correção
prevenção
```

quando aplicável.

---

# 106. Rollback e banco

Nunca executar rollback destrutivo no MongoDB automaticamente sem avaliar:

```text
versão do schema
dados criados
migrations
compatibilidade
backup
```

---

# 107. Compatibilidade progressiva

Quando uma alteração de banco for necessária, preferir estratégias que permitam:

```text
versão anterior
+
versão nova
```

coexistirem durante a transição quando possível.

---

# 108. Deployment de nova feature

Fluxo:

```text
Feature
    ↓
Development
    ↓
Testes
    ↓
Staging
    ↓
E2E
    ↓
Production
```

---

# 109. Deployment de correção crítica

Correções críticas devem:

```text
ser reproduzidas em teste
ser validadas
ser publicadas
ser monitoradas
```

e não devem ignorar completamente a suíte de segurança e regressão.

---

# 110. Deployment de migration

Antes de uma migration:

```text
backup quando necessário
↓
testar migration
↓
validar dados
↓
executar
↓
validar aplicação
```

---

# 111. Regra contra alterações manuais ocultas

Não executar alterações manuais de production que não sejam registradas.

Exemplos:

```text
alteração direta no banco
mudança de variável
mudança de CORS
alteração de domínio
```

devem ser documentadas quando representarem configuração permanente ou mudança operacional importante.

---

# 112. Regra contra secrets manuais não documentados

Não depender de:

```text
senha salva no computador de alguém
API key guardada em mensagem
configuração somente no navegador
```

Secrets devem permanecer no mecanismo oficial de configuração da infraestrutura.

---

# 113. Fonte de verdade

Este documento é a fonte de verdade operacional para deployment do EcoByte.

Documentos relacionados:

```text
docs/01_ARCHITECTURE.md
docs/09_AUTHENTICATION_SECURITY.md
docs/16_ASSETS.md
docs/17_TESTING.md
docs/18_DEVELOPMENT.md
docs/19_DEPLOYMENT.md
```

---

# 114. Regra final

O deployment do EcoByte deve ser:

```text
reproduzível
seguro
testável
observável
reversível
documentado
```

A regra principal é:

```text
Código
    ↓
Testes
    ↓
Build
    ↓
Staging
    ↓
Validação
    ↓
Production
    ↓
Health Check
    ↓
Smoke Test
    ↓
Monitoramento
```

Nenhuma publicação deve depender de:

```text
credenciais dentro do código
passos ocultos
alterações manuais não documentadas
dados de teste permanentes
```

Quando uma alteração de infraestrutura ou deployment for necessária, atualizar este documento e registrar decisões importantes em:

```text
docs/DECISIONS.md
```