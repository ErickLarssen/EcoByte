# 18 — DEPLOYMENT

## 1. Objetivo

Este documento define as diretrizes de preparação, configuração, publicação, atualização e operação do EcoByte em ambientes de desenvolvimento, homologação e produção.

O objetivo é garantir que o sistema possa ser publicado de forma:

```text
segura
reproduzível
previsível
documentada
manutenível
```

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/04_REQUIREMENTS.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
docs/09_AUTHENTICATION_SECURITY.md
docs/16_ASSETS.md
docs/17_TESTING.md
docs/19_DEPLOYMENT.md
```

> Observação:
>
> Este arquivo é o documento de deployment do projeto.
> Caso este documento seja posteriormente renumerado ou consolidado, atualizar as referências cruzadas dos demais documentos.

---

# 2. Ambientes

O projeto deve considerar, conforme a necessidade:

```text
development
staging
production
```

---

# 3. Development

Ambiente utilizado para:

```text
desenvolvimento local
testes manuais
debug
experimentação controlada
```

Características esperadas:

```text
dados fictícios
logs mais detalhados
configurações de desenvolvimento
MongoDB de desenvolvimento
```

---

# 4. Staging

Quando utilizado, o ambiente de staging deve representar uma versão próxima da produção.

Finalidades:

```text
teste integrado
validação antes de produção
testes E2E
QA
verificação de build
```

Não utilizar dados reais sensíveis sem necessidade e autorização apropriada.

---

# 5. Production

Ambiente destinado ao uso real do sistema.

Deve utilizar:

```text
HTTPS
segredos externos ao código
MongoDB protegido
configuração de produção
logs controlados
monitoramento apropriado
```

---

# 6. Separação entre ambientes

Cada ambiente deve possuir configurações próprias.

Exemplo:

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

Nunca utilizar o banco de produção durante desenvolvimento ou testes comuns.

---

# 7. Arquitetura de publicação

O EcoByte possui três partes conceituais:

```text
Frontend
    ↓
Backend / API
    ↓
MongoDB
```

Uma arquitetura possível:

```text
Usuário
   ↓
Frontend hospedado
   ↓ HTTPS
Backend / API hospedado
   ↓
MongoDB
```

A infraestrutura específica pode variar conforme os serviços escolhidos pelo projeto.

---

# 8. Frontend

O frontend deve ser publicado como aplicação web produzida pelo processo de build da stack utilizada.

Quando Vite for utilizado:

```text
npm run build
```

deve gerar os arquivos de produção.

---

# 9. Backend

O backend deve ser publicado como aplicação Node.js.

O processo deve:

```text
instalar dependências
↓
carregar variáveis de ambiente
↓
iniciar aplicação
↓
conectar ao MongoDB
↓
expor API
```

---

# 10. MongoDB

O MongoDB deve ser executado em infraestrutura apropriada ao ambiente.

Possibilidades:

```text
MongoDB local
MongoDB Atlas
ou serviço equivalente
```

A escolha definitiva depende da infraestrutura do projeto.

---

# 11. Variáveis de ambiente

Configurações específicas do ambiente não devem ser armazenadas diretamente no código.

Exemplo:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=
FRONTEND_URL=
SESSION_SECRET=
```

As variáveis exatas devem seguir a implementação real.

---

# 12. `.env`

Durante desenvolvimento, o projeto pode utilizar:

```text
.env
```

Esse arquivo não deve ser commitado quando possuir informações sensíveis.

---

# 13. `.env.example`

O repositório deve possuir:

```text
.env.example
```

contendo somente os nomes das variáveis necessárias.

Exemplo:

```env
NODE_ENV=
PORT=
MONGODB_URI=
FRONTEND_URL=
SESSION_SECRET=
```

---

# 14. Segredos

Nunca versionar:

```text
MONGODB_URI com credenciais reais
SESSION_SECRET
JWT_SECRET
API keys
SMTP credentials
tokens
private keys
```

---

# 15. Configuração do frontend

O frontend deve possuir configuração para saber onde está localizada a API.

Exemplo conceitual:

```env
VITE_API_URL=https://api.exemplo.com
```

A variável e seu nome final devem seguir a configuração do frontend.

---

# 16. Configuração do backend

O backend deve utilizar configurações externas para:

```text
porta
MongoDB
frontend permitido
sessão
cookies
rate limiting
integrações futuras
```

---

# 17. CORS

O backend deve permitir somente as origens necessárias.

Exemplo conceitual:

```env
FRONTEND_URL=https://ecobyte.example.com
```

Evitar configurar produção como:

```text
*
```

quando isso não for necessário.

---

# 18. HTTPS

A aplicação de produção deve utilizar:

```text
HTTPS
```

Especialmente para:

```text
login
cadastro
sessão
dados pessoais
API
```

---

# 19. Cookies em produção

Quando cookies forem utilizados para autenticação, revisar:

```text
HttpOnly
Secure
SameSite
```

conforme a arquitetura adotada.

---

# 20. Domínio

A infraestrutura pode possuir:

```text
frontend:
https://dominio-do-frontend

backend:
https://api.dominio-do-backend
```

Os domínios reais devem ser definidos quando a infraestrutura for escolhida.

Não inserir domínios fictícios diretamente no código final.

---

# 21. Build do frontend

Processo conceitual:

```text
Código
    ↓
npm install
    ↓
typecheck / lint / testes
    ↓
npm run build
    ↓
artefatos de produção
```

---

# 22. Build do backend

O backend deve possuir um processo reprodutível para produção.

Exemplo conceitual:

```text
npm install
↓
testes
↓
build quando aplicável
↓
start
```

---

# 23. Dependências

Antes do deployment:

```text
dependencies
```

devem estar corretamente separadas de:

```text
devDependencies
```

conforme as necessidades do projeto.

---

# 24. Instalação determinística

Preferir:

```text
npm ci
```

em ambientes automatizados quando houver:

```text
package-lock.json
```

e isso for compatível com o projeto.

---

# 25. Lockfile

O repositório deve manter o lockfile correspondente ao gerenciador de pacotes utilizado.

Exemplo:

```text
package-lock.json
```

Não remover o lockfile sem motivo.

---

# 26. Scripts

O `package.json` deve possuir scripts claros.

Exemplos:

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "start": "...",
    "test": "...",
    "lint": "...",
    "typecheck": "..."
  }
}
```

Os comandos reais devem refletir a stack implementada.

---

# 27. Health Check

A API deve possuir:

```http
GET /api/v1/health
```

para verificar se a aplicação está operacional.

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

---

# 28. Health Check e banco

Quando apropriado, o health check pode verificar também a conectividade do banco.

Porém, a resposta deve ser desenhada de modo que não exponha detalhes internos.

---

# 29. Startup do backend

O backend deve iniciar seguindo uma sequência previsível:

```text
carregar configuração
    ↓
validar configuração necessária
    ↓
conectar MongoDB
    ↓
iniciar servidor
```

A implementação exata pode variar.

---

# 30. Falha no MongoDB

Se o banco for obrigatório para o funcionamento da API, a aplicação deve lidar de forma clara com falha de conexão.

Não considerar a aplicação plenamente operacional se ela não conseguir realizar suas operações essenciais.

---

# 31. Logs de inicialização

Logs de startup podem informar:

```text
ambiente
porta
estado da conexão
servidor iniciado
```

Não registrar:

```text
senhas
tokens
credenciais
connection strings completas
```

---

# 32. Logs de produção

Produção deve possuir logs suficientes para diagnosticar:

```text
erros
requisições relevantes
falhas de banco
problemas de autenticação
falhas de operações críticas
```

sem expor dados sensíveis.

---

# 33. Tratamento de erros

Erros internos não devem resultar em respostas contendo:

```text
stack trace
caminho do servidor
credenciais
configurações privadas
```

---

# 34. Build antes de deploy

Nenhuma versão deve ser publicada sem:

```text
build
```

bem-sucedido.

---

# 35. Testes antes de deploy

Antes de produção, executar pelo menos:

```text
lint
typecheck
unit tests
integration tests
build
```

e os testes adicionais definidos para a alteração.

---

# 36. E2E antes de produção

Alterações importantes devem passar pelos fluxos E2E críticos:

```text
login
cadastro
solicitação de coleta
fluxo do coletor
admin
```

quando forem afetados.

---

# 37. Smoke test

Antes ou imediatamente após o deployment:

```text
API sobe
↓
health check
↓
frontend carrega
↓
login
↓
API autenticada
```

deve funcionar.

---

# 38. Smoke test da coleta

Quando a alteração afetar o fluxo de coleta:

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
```

e continuar conforme o fluxo implementado.

---

# 39. Rollout

O processo de publicação deve ser:

```text
build
↓
testes
↓
deploy
↓
health check
↓
smoke test
↓
monitoramento
```

---

# 40. Rollback

Deve existir uma estratégia para retornar à versão anterior quando uma publicação causar problema crítico.

Conceitualmente:

```text
versão atual
    ↓
problema detectado
    ↓
rollback
    ↓
versão anterior
```

O mecanismo específico depende da plataforma utilizada.

---

# 41. Rollback de frontend

O frontend deve permitir retorno para uma versão funcional anterior quando a infraestrutura suportar versionamento de deploy.

---

# 42. Rollback de backend

O backend deve possuir mecanismo equivalente para retornar a uma versão anterior quando necessário.

---

# 43. Banco de dados e rollback

Rollback de código não implica necessariamente rollback de banco.

Antes de alterar o modelo de dados em produção:

```text
avaliar compatibilidade
```

e:

```text
planejar migração
```

quando necessário.

---

# 44. Alterações de schema

Mudanças em:

```text
users
collections
ecopoints
notifications
```

devem ser avaliadas antes do deploy.

---

# 45. Migrações

Se uma mudança exigir transformação de documentos existentes:

```text
migration script
```

deve ser criado quando necessário.

Não assumir que modificar um Mongoose Schema altera automaticamente documentos existentes.

---

# 46. Backward Compatibility

Sempre que possível, preferir mudanças compatíveis com a versão atualmente publicada.

Exemplo:

```text
adicionar campo opcional
```

tende a ser menos arriscado que:

```text
remover campo utilizado pelo frontend
```

---

# 47. API versioning

A API atual utiliza:

```text
/api/v1
```

Mudanças incompatíveis podem exigir nova versão:

```text
/api/v2
```

Não criar uma nova versão sem necessidade real.

---

# 48. Frontend e backend

Durante uma atualização de API, considerar:

```text
frontend antigo
+
backend novo
```

e:

```text
frontend novo
+
backend antigo
```

quando houver possibilidade de versões coexistirem.

---

# 49. Deploy atômico

Quando a infraestrutura permitir, preferir mecanismos em que uma nova versão seja disponibilizada como unidade.

---

# 50. Secrets em deploy

Segredos devem ser configurados na plataforma de hospedagem ou sistema de gerenciamento de secrets.

Nunca inserir secrets no repositório.

---

# 51. Variáveis públicas do frontend

Variáveis de ambiente do frontend podem acabar incorporadas ao bundle.

Portanto:

```text
não considerar variável VITE_* como segredo
```

quando Vite for utilizado.

Nunca colocar credenciais privadas em variáveis destinadas ao frontend.

---

# 52. Variáveis privadas do backend

Informações como:

```text
MONGODB_URI
SESSION_SECRET
```

devem permanecer somente no ambiente do backend.

---

# 53. Banco em produção

O MongoDB de produção deve possuir:

```text
credenciais
controle de acesso
backup
monitoramento
conexão segura
```

conforme a infraestrutura utilizada.

---

# 54. Connection String

A connection string de produção deve ser obtida por variável de ambiente.

Exemplo:

```env
MONGODB_URI=
```

Nunca escrever a string completa diretamente no código.

---

# 55. IP / Network Access

Quando a infraestrutura do MongoDB possuir controle de rede, permitir somente as origens necessárias.

Não ampliar o acesso indiscriminadamente.

A configuração exata depende do provedor escolhido.

---

# 56. Backup

O banco de produção deve possuir estratégia de backup adequada.

O projeto deve considerar:

```text
frequência
retenção
restauração
teste do backup
```

Os detalhes dependem do serviço escolhido.

---

# 57. Backup não testado

Um backup não deve ser considerado suficiente apenas porque:

```text
"existe um arquivo de backup"
```

A estratégia deve considerar testes periódicos de restauração quando aplicável.

---

# 58. Dados de produção

Dados reais não devem ser copiados para:

```text
development
staging
```

sem uma estratégia apropriada de proteção e anonimização.

---

# 59. Seed

Seeds de desenvolvimento devem utilizar dados fictícios.

Não executar seed destrutivo de desenvolvimento em produção.

---

# 60. Comandos destrutivos

Comandos como:

```text
deleteMany({})
dropDatabase()
```

não devem fazer parte do processo normal de production deployment.

---

# 61. Migrações e deployment

Quando houver migração:

```text
1. revisar
2. testar em development
3. testar em staging
4. criar backup quando necessário
5. executar migration
6. verificar dados
7. publicar aplicação compatível
```

---

# 62. Ordem de migração

Sempre avaliar se a ordem deve ser:

```text
migration → backend → frontend
```

ou:

```text
backend compatível → migration → frontend
```

conforme a natureza da alteração.

---

# 63. Breaking Changes

Evitar realizar:

```text
breaking change
```

sem planejamento.

Exemplo:

```text
remover endpoint
```

enquanto o frontend ainda depende dele.

---

# 64. Assets em produção

Verificar:

```text
imagens
fontes
SVGs
vídeos
favicon
```

após deployment.

---

# 65. URLs de assets

Não utilizar caminhos locais como:

```text
C:\Users\...
```

ou:

```text
file:///
```

na aplicação publicada.

---

# 66. Base URL

URLs de API e recursos externos devem ser configuráveis por ambiente.

---

# 67. Frontend SPA

Se o frontend utilizar roteamento client-side, a hospedagem deve estar configurada para direcionar rotas conhecidas ao documento principal da aplicação.

Exemplo conceitual:

```text
/collections
/admin
/profile
```

não devem resultar em 404 do servidor estático quando a rota pertence à SPA.

---

# 68. Fallback da SPA

O mecanismo de fallback depende da plataforma utilizada.

Não criar configurações específicas de uma plataforma sem necessidade.

---

# 69. Backend routing

Rotas da API devem permanecer distintas das rotas do frontend.

Exemplo:

```text
/api/v1/...
```

para API.

---

# 70. Health endpoint público

O endpoint:

```text
/api/v1/health
```

pode ser público para facilitar monitoramento.

Não retornar dados sensíveis.

---

# 71. Monitoramento

A produção deve possuir, conforme a infraestrutura disponível:

```text
health check
logs
erros
disponibilidade
performance
```

---

# 72. Alertas

Quando a infraestrutura suportar, considerar alertas para:

```text
API indisponível
erro elevado
banco indisponível
deployment falhou
```

---

# 73. Monitoramento de banco

Quando disponível, monitorar:

```text
conexões
latência
uso de recursos
erros
consultas problemáticas
```

---

# 74. Monitoramento da API

Observar:

```text
latência
5xx
4xx
volume
timeouts
```

Especialmente nos endpoints críticos.

---

# 75. Logs estruturados

Quando possível, utilizar logs estruturados para facilitar busca e correlação.

Exemplo conceitual:

```json
{
  "level": "error",
  "message": "Erro ao processar coleta.",
  "route": "/api/v1/collections/:id/accept"
}
```

Não incluir segredos ou dados desnecessários.

---

# 76. Request ID

Pode ser utilizado um identificador de requisição para correlacionar logs.

Exemplo:

```text
requestId
```

Isso é opcional e depende da infraestrutura.

---

# 77. Timeouts

Operações externas ou potencialmente lentas devem possuir timeout apropriado quando aplicável.

---

# 78. Erros externos

Falhas de:

```text
MongoDB
SMTP futuro
serviços externos futuros
```

devem resultar em tratamento adequado e mensagens seguras.

---

# 79. Performance de produção

Monitorar especialmente:

```text
tempo de resposta da API
consultas MongoDB
tempo de carregamento do frontend
peso de assets
```

---

# 80. Cache

Assets estáticos podem utilizar cache.

Dados de API devem utilizar cache somente quando compatível com a natureza dos dados.

Não armazenar informações sensíveis em cache público.

---

# 81. CDN

Uma CDN pode ser utilizada para:

```text
assets estáticos
imagens
vídeos
```

quando houver necessidade.

Não é requisito obrigatório do MVP.

---

# 82. Compression

Produção deve utilizar mecanismos adequados de compressão de respostas quando suportados pela infraestrutura.

---

# 83. HTTP caching

Headers de cache devem ser configurados de acordo com o tipo de recurso.

Exemplo:

```text
assets versionados
→ cache longo

dados dinâmicos
→ cache controlado
```

---

# 84. Banco e cache

Não adicionar Redis ou outro sistema de cache sem necessidade real.

O MVP atual não exige uma camada de cache distribuído.

---

# 85. CDN e dados privados

Dados privados de usuários não devem ser publicados como recursos públicos de CDN sem controle de acesso.

---

# 86. Domínios e CORS

Depois de definidos os domínios finais:

```text
frontend
backend
```

atualizar a configuração de CORS.

---

# 87. Ambiente local

Exemplo conceitual:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:3000

MongoDB:
mongodb://localhost:27017/ecobyte
```

Esses valores são apenas referências de desenvolvimento.

---

# 88. Ambiente de staging

Exemplo conceitual:

```text
Frontend:
https://staging.example.com

Backend:
https://api-staging.example.com

MongoDB:
staging database
```

Não reutilizar automaticamente os valores de production.

---

# 89. Ambiente de produção

Exemplo conceitual:

```text
Frontend:
https://example.com

Backend:
https://api.example.com

MongoDB:
production database
```

Os domínios reais serão definidos posteriormente.

---

# 90. Processo de desenvolvimento até produção

Fluxo recomendado:

```text
Feature
    ↓
Development
    ↓
Testes
    ↓
Code Review
    ↓
Staging
    ↓
Smoke / E2E
    ↓
Production
```

---

# 91. Pull Request

Antes do merge:

```text
testes passando
lint passando
typecheck passando
build funcionando
documentação atualizada
```

quando aplicável.

---

# 92. Branch principal

A branch principal deve representar uma versão que possa ser publicada de maneira confiável.

A estratégia exata de branching pode ser definida no documento de desenvolvimento.

---

# 93. Tags de versão

Quando necessário, versões de produção podem utilizar tags.

Exemplo:

```text
v1.0.0
v1.1.0
v1.1.1
```

A estratégia de versionamento pode seguir Semantic Versioning quando fizer sentido.

---

# 94. Changelog

Alterações relevantes de produção devem ser registráveis.

Exemplo:

```text
features
fixes
breaking changes
security
```

---

# 95. Deploy manual

Deploy manual pode ser utilizado durante desenvolvimento.

Entretanto, os passos devem ser reproduzíveis e documentados.

---

# 96. Deploy automatizado

Quando CI/CD for adotado:

```text
push / merge
↓
pipeline
↓
testes
↓
build
↓
deploy
```

---

# 97. CI/CD

Uma pipeline possível:

```text
Install
↓
Lint
↓
Typecheck
↓
Unit Tests
↓
Integration Tests
↓
Build
↓
Deploy Staging
↓
E2E
↓
Deploy Production
```

O fluxo real depende da infraestrutura escolhida.

---

# 98. Deploy condicional

Production deve preferencialmente exigir:

```text
pipeline verde
```

e revisão apropriada quando isso fizer parte do workflow do grupo.

---

# 99. Falha no pipeline

Quando uma etapa falhar:

```text
deploy não deve prosseguir automaticamente
```

para production, salvo uma estratégia explicitamente definida.

---

# 100. Variáveis por ambiente

Valores que mudam por ambiente devem ser configuráveis.

Exemplos:

```text
API URL
MongoDB URI
frontend URL
cookie settings
rate limits
```

---

# 101. Não duplicar configuração

Evitar espalhar URLs e configurações por múltiplos arquivos.

Preferir:

```text
environment variables
config module
```

ou mecanismo equivalente.

---

# 102. Configuração centralizada

O backend pode possuir um módulo:

```text
config/
```

responsável por carregar e validar as variáveis de ambiente.

---

# 103. Validação de environment

A aplicação pode validar no startup variáveis obrigatórias.

Exemplo:

```text
MONGODB_URI ausente
→ startup falha claramente
```

em vez de apresentar erro obscuro posteriormente.

---

# 104. Produção sem `.env` versionado

O arquivo:

```text
.env
```

não deve ser utilizado como mecanismo para transportar secrets pelo Git.

Secrets devem ser configurados diretamente no ambiente de deployment.

---

# 105. Segurança do deployment

Verificar:

```text
HTTPS
CORS
cookies
secrets
MongoDB access
logs
rate limiting
```

antes da publicação.

---

# 106. Checklist de frontend deployment

```text
[ ] Build concluído
[ ] Variáveis corretas
[ ] API URL correta
[ ] SPA fallback configurado
[ ] Assets carregando
[ ] Favicon funcionando
[ ] HTTPS ativo
[ ] Sem erros no console
```

---

# 107. Checklist de backend deployment

```text
[ ] Build/start funcionando
[ ] Variáveis configuradas
[ ] MongoDB conectado
[ ] Health check funcionando
[ ] CORS configurado
[ ] Cookies configurados
[ ] Logs funcionando
[ ] Secrets protegidos
```

---

# 108. Checklist de banco

```text
[ ] Banco correto
[ ] Credenciais corretas
[ ] Network access configurado
[ ] Índices presentes
[ ] Backup configurado
[ ] Migrations revisadas
[ ] Dados de produção preservados
```

---

# 109. Checklist de segurança

```text
[ ] HTTPS
[ ] Secrets fora do Git
[ ] CORS
[ ] Cookies
[ ] Rate limiting
[ ] MongoDB protegido
[ ] Logs sem segredos
[ ] Dados sensíveis não expostos
```

---

# 110. Checklist de testes

```text
[ ] Unit
[ ] Integration
[ ] API
[ ] E2E
[ ] Security
[ ] Responsive
[ ] Accessibility
[ ] Build
[ ] Smoke
```

---

# 111. Checklist pós-deploy

```text
[ ] Frontend abre
[ ] API responde
[ ] Health check
[ ] Login
[ ] Cadastro
[ ] Cliente cria coleta
[ ] Coletor acessa painel
[ ] Assets carregam
[ ] MongoDB persiste dados
[ ] Sem erros críticos
```

---

# 112. Fluxo completo de deployment

```text
Código
   ↓
Review
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

---

# 113. Rollback

Se houver problema crítico:

```text
identificar versão problemática
        ↓
interromper propagação
        ↓
rollback código
        ↓
verificar banco
        ↓
health check
        ↓
smoke test
```

---

# 114. Incidente

Em caso de incidente em produção:

```text
1. identificar
2. conter
3. avaliar impacto
4. corrigir ou reverter
5. validar
6. documentar
```

---

# 115. Banco durante incidente

Nunca executar alterações destrutivas no banco de produção como primeira resposta sem entender o impacto.

Priorizar:

```text
observação
backup
diagnóstico
rollback seguro
```

---

# 116. Migração problemática

Se uma migration causar problemas:

```text
não improvisar rollback destrutivo
```

Avaliar:

```text
versão do schema
dados afetados
compatibilidade
backup
script de correção
```

---

# 117. Compatibilidade após deployment

Depois da publicação, verificar:

```text
frontend
backend
database
```

como conjunto.

Uma aplicação pode estar "online" e ainda assim estar funcionalmente quebrada.

---

# 118. Testes de produção

Os testes de produção devem ser seguros.

Preferir:

```text
health check
login controlado
dados de teste específicos
```

quando necessários.

Não criar dados reais desnecessários somente para testar.

---

# 119. Dados de teste em produção

Evitar criar contas ou coletas fictícias em produção.

Quando um teste controlado for inevitável, possuir procedimento específico de limpeza.

---

# 120. Domínio final

Quando os domínios oficiais forem definidos, atualizar:

```text
frontend configuration
backend CORS
cookies
API URL
documentação
```

---

# 121. SEO e frontend público

Se a aplicação possuir páginas públicas relevantes, considerar:

```text
title
meta description
favicon
Open Graph
robots
sitemap
```

conforme a estratégia do projeto.

Esses itens não são obrigatórios para áreas autenticadas.

---

# 122. Robots

Não indexar áreas autenticadas como:

```text
dashboard
admin
perfil
coletas privadas
```

quando isso fizer sentido para a infraestrutura da aplicação.

---

# 123. Headers de segurança

A hospedagem pode configurar headers como:

```text
X-Content-Type-Options
Referrer-Policy
Content-Security-Policy
```

conforme a estratégia de segurança adotada.

---

# 124. Não copiar configuração de segurança sem análise

Headers e políticas devem ser introduzidos considerando:

```text
frontend
API
assets
CORS
iframe
scripts
```

para evitar quebrar a aplicação.

---

# 125. Performance após deploy

Validar:

```text
tempo de carregamento
fontes
imagens
vídeos
bundle
API
```

quando relevante.

---

# 126. Observabilidade mínima

Produção deve possuir ao menos:

```text
health check
logs
erros
```

A infraestrutura pode fornecer mecanismos adicionais.

---

# 127. Uptime

Quando houver infraestrutura adequada, monitorar disponibilidade do:

```text
frontend
backend
MongoDB
```

ou serviços correspondentes.

---

# 128. Expiração de certificados

Quando HTTPS depender de certificados administrados pelo projeto, verificar sua renovação.

Se a plataforma gerenciar automaticamente, a responsabilidade pode ser delegada à própria plataforma.

---

# 129. Deployment de assets

Assets devem ser publicados juntamente com a versão correspondente do frontend.

Evitar situações em que:

```text
HTML novo
+
assets antigos incompatíveis
```

causem erros.

---

# 130. Cache busting

Builds devem possuir estratégia para evitar uso prolongado de assets antigos após atualização.

Bundlers modernos normalmente fornecem hash de arquivos.

---

# 131. Service Worker

Não adicionar PWA/service worker sem necessidade.

Caso exista:

```text
cache strategy
update strategy
offline behavior
```

devem ser documentados.

---

# 132. Offline

O MVP não exige funcionamento completo offline.

Não prometer:

```text
operações offline
```

sem implementação correspondente.

---

# 133. Deployment mobile

Não existe processo separado de deployment para mobile web.

O mesmo frontend deve responder adequadamente aos diferentes viewports.

---

# 134. Compatibilidade do navegador

A infraestrutura de deployment não deve introduzir recursos incompatíveis com os navegadores suportados pelo projeto.

---

# 135. Build reproducível

Dado o mesmo código e configuração:

```text
build
```

deve produzir resultado previsível.

---

# 136. Dependências externas

Antes de production deployment:

```text
verificar dependências críticas
```

e mudanças importantes de versão.

Não atualizar dezenas de dependências imediatamente antes de um deploy crítico sem testes suficientes.

---

# 137. Deploy de dependência

Uma atualização de:

```text
React
Node
Mongoose
MongoDB driver
framework
```

deve ser tratada como alteração relevante e testada adequadamente.

---

# 138. Node.js

A versão de Node.js utilizada deve ser definida de maneira consistente entre:

```text
development
CI
staging
production
```

Pode ser registrada em:

```text
engines
.nvmrc
ou mecanismo equivalente
```

---

# 139. Package manager

Utilizar o mesmo gerenciador de pacotes no desenvolvimento e CI.

Exemplo:

```text
npm
```

Não alternar indiscriminadamente entre:

```text
npm
yarn
pnpm
```

sem necessidade.

---

# 140. Database version

A compatibilidade entre:

```text
MongoDB
MongoDB Driver
Mongoose
```

deve ser verificada antes de atualizações importantes.

---

# 141. Runtime configuration

Preferir configuração externa para:

```text
URLs
secrets
portas
flags
```

---

# 142. Feature flags

Feature flags podem ser utilizadas futuramente para liberar funcionalidades gradualmente.

Não implementar um sistema de feature flags sem necessidade real.

---

# 143. Deploy gradual

Quando a infraestrutura oferecer suporte, alterações maiores podem ser liberadas gradualmente.

Não é requisito do MVP.

---

# 144. Post-deployment verification

Após cada deploy relevante:

```text
health
↓
auth
↓
API
↓
database
↓
main journeys
```

devem ser avaliados.

---

# 145. Regra contra deploy sem validação

Não considerar um deployment concluído somente porque:

```text
"o site abriu"
```

É necessário verificar os fluxos principais afetados.

---

# 146. Fonte de verdade

As decisões de infraestrutura devem permanecer alinhadas com:

```text
docs/01_ARCHITECTURE.md
docs/09_AUTHENTICATION_SECURITY.md
docs/17_TESTING.md
docs/18_DEPLOYMENT.md
docs/19_DEPLOYMENT.md
```

> O projeto deve evitar duplicação de documentação de deployment. Caso `docs/19_DEPLOYMENT.md` seja o nome definitivo utilizado posteriormente, este documento deve ser renomeado e as referências atualizadas.

---

# 147. Regra final

O deployment do EcoByte deve seguir:

```text
Desenvolver
    ↓
Testar
    ↓
Buildar
    ↓
Validar
    ↓
Publicar
    ↓
Verificar
    ↓
Monitorar
```

Nenhuma publicação deve depender de configurações ocultas, credenciais dentro do código ou passos manuais não documentados.

O objetivo é que outro desenvolvedor consiga compreender:

```text
como configurar
como testar
como publicar
como verificar
como reverter
```

o sistema sem depender de conhecimento pessoal não registrado no projeto.