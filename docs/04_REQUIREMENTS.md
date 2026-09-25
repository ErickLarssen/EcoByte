# 04 — REQUIREMENTS

## 1. Objetivo

Este documento define os requisitos funcionais e não funcionais do EcoByte.

Os requisitos devem orientar:

- Desenvolvimento do frontend
- Desenvolvimento do backend
- Modelagem do banco de dados
- API
- Autenticação
- Autorização
- Fluxo de coleta
- Painéis dos usuários
- Responsividade
- Testes
- Critérios de aceite

Os requisitos devem permanecer alinhados com:

```text
docs/00_PROJECT_OVERVIEW.md
docs/01_ARCHITECTURE.md
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
```

---

# 2. Requisitos Funcionais

## RF-001 — Cadastro de usuário

O sistema deve permitir que novos usuários criem uma conta.

O cadastro deve contemplar os dados necessários de acordo com o tipo:

```text
PF
PJ
```

---

## RF-002 — Cadastro de Pessoa Física

O sistema deve permitir o cadastro de clientes como Pessoa Física.

O formulário deve solicitar os dados definidos para PF, incluindo documento de identificação quando aplicável.

---

## RF-003 — Cadastro de Pessoa Jurídica

O sistema deve permitir o cadastro de clientes como Pessoa Jurídica.

O formulário deve solicitar os dados empresariais definidos para PJ.

Exemplos:

```text
Razão Social
Nome Fantasia
CNPJ
```

Os campos definitivos devem permanecer alinhados ao domínio implementado.

---

## RF-004 — Validação de e-mail

O sistema deve validar o formato do e-mail durante o cadastro.

O backend deve impedir o cadastro de e-mail já existente.

---

## RF-005 — Validação de senha

O sistema deve exigir uma senha que cumpra os critérios mínimos:

```text
mínimo de 8 caracteres
1 letra maiúscula
1 letra minúscula
1 número
1 caractere especial
```

---

## RF-006 — Confirmação de senha

O formulário de cadastro deve solicitar a confirmação da senha.

As duas senhas devem ser iguais antes do envio do formulário.

A validação deve existir no frontend e ser complementada pelas regras de segurança do backend.

---

# 3. Autenticação

## RF-007 — Login

O sistema deve permitir que usuários cadastrados realizem login utilizando suas credenciais.

---

## RF-008 — Logout

O sistema deve permitir que usuários autenticados encerrem sua sessão.

---

## RF-009 — Identificação do usuário autenticado

O sistema deve disponibilizar uma forma segura para identificar o usuário atualmente autenticado.

A API deve possuir um endpoint equivalente a:

```text
GET /api/v1/auth/me
```

---

## RF-010 — Recuperação de senha

O sistema deve possuir estrutura para recuperação de senha por meio de mecanismo seguro.

O processo definitivo de envio de e-mail e provedor utilizado ainda deve ser definido em:

```text
docs/OPEN_QUESTIONS.md
```

---

# 4. Perfil do usuário

## RF-011 — Visualização do perfil

Usuários autenticados devem conseguir visualizar seus próprios dados permitidos.

---

## RF-012 — Atualização do perfil

Usuários autenticados devem conseguir atualizar os dados permitidos de seu próprio perfil.

---

## RF-013 — Preservação do histórico

Alterações no perfil não devem modificar retroativamente informações históricas já registradas em uma coleta.

---

# 5. Solicitação de coleta

## RF-014 — Criar solicitação de coleta

Um cliente autenticado deve poder solicitar uma coleta de lixo eletrônico.

---

## RF-015 — Informar endereço de coleta

O cliente deve poder informar o endereço onde o material deverá ser recolhido.

O endereço deve ser associado à coleta.

---

## RF-016 — Informar itens de descarte

O cliente deve poder informar os itens que deseja descartar.

Cada item deve possuir, no mínimo, informações compatíveis com:

```text
categoria
quantidade
condicao
```

---

## RF-017 — Observações da coleta

O cliente deve poder informar observações adicionais relacionadas à coleta quando essa funcionalidade estiver disponível no formulário.

---

## RF-018 — Agendamento

A solicitação deve possuir campo para:

```text
dataAgendada
```

quando o fluxo de agendamento estiver definido.

A política de horários e disponibilidade permanece dependente das definições registradas em:

```text
docs/OPEN_QUESTIONS.md
```

---

## RF-019 — Status inicial

Toda nova solicitação deve ser criada com:

```text
PENDENTE
```

---

## RF-020 — Identificação do solicitante

Toda coleta deve registrar o identificador do usuário que realizou a solicitação.

---

# 6. Acompanhamento de coleta pelo cliente

## RF-021 — Listar minhas coletas

O cliente deve poder visualizar as próprias solicitações de coleta.

A consulta deve retornar somente os registros aos quais o usuário possui acesso.

---

## RF-022 — Visualizar detalhes da coleta

O cliente deve poder visualizar os detalhes de uma coleta própria.

Os detalhes podem incluir:

```text
endereço
itens
data agendada
status
observações
coletor responsável, quando aplicável
datas do fluxo
```

---

## RF-023 — Acompanhar status

O cliente deve conseguir visualizar o estado atual da coleta.

Os estados oficiais são:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 7. Fluxo do coletor

## RF-024 — Painel do coletor

O sistema deve possuir um painel específico para usuários com:

```text
role = COLETOR
```

---

## RF-025 — Visualizar coletas disponíveis

O coletor deve poder visualizar coletas que estejam disponíveis para aceitação.

Uma coleta disponível deve estar em:

```text
PENDENTE
```

---

## RF-026 — Aceitar coleta

O coletor deve poder aceitar uma coleta pendente.

Ao aceitar:

```text
PENDENTE → ACEITA
```

O sistema deve associar o coletor à coleta.

---

## RF-027 — Prevenir dupla aceitação

O sistema deve impedir que dois coletores assumam simultaneamente a mesma coleta.

Caso uma tentativa ocorra depois que outro coletor tenha assumido a coleta, a API deve retornar:

```text
409 Conflict
```

---

## RF-028 — Visualizar coletas atribuídas

O coletor deve poder visualizar as coletas que estão associadas ao seu usuário.

Endpoint: `GET /api/v1/collections/assigned` (`DEC-064`).

---

## RF-029 — Iniciar rota

O coletor responsável deve poder iniciar o deslocamento para uma coleta aceita.

Transição:

```text
ACEITA → A_CAMINHO
```

---

## RF-030 — Confirmar recolhimento

O coletor responsável deve poder confirmar que o material foi recolhido.

Transição:

```text
A_CAMINHO → RECOLHIDA
```

---

## RF-031 — Confirmar entrega no ecoponto

O coletor responsável deve poder confirmar que o material foi entregue no ecoponto central da EcoByte.

Transição:

```text
RECOLHIDA → ENTREGUE_ECOPONTO
```

---

## RF-032 — Finalizar coleta

O fluxo deve permitir concluir a coleta após a confirmação de entrega no ecoponto.

Transição:

```text
ENTREGUE_ECOPONTO → CONCLUIDA
```

---

# 8. Máquina de estados

## RF-033 — Respeitar transições válidas

O sistema deve aceitar somente as transições estabelecidas na máquina de estados.

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

## RF-034 — Impedir transições inválidas

O backend deve rejeitar transições que não estejam previstas no fluxo.

Exemplo:

```text
PENDENTE → RECOLHIDA
```

deve ser rejeitado.

---

## RF-035 — Registrar timestamps

Cada etapa relevante do fluxo deve registrar seu timestamp correspondente quando aplicável:

```text
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

---

# 9. Ecoponto

## RF-036 — Visualizar informações do ecoponto

O sistema deve permitir que os usuários consultem informações do ecoponto central da EcoByte.

---

## RF-037 — Exibir localização

Quando configuradas, as informações do ecoponto devem incluir sua localização geográfica.

---

## RF-038 — Informações operacionais

O ecoponto pode apresentar informações como:

```text
nome
descrição
endereço
horários
status
localização
```

---

## RF-039 — Administração do ecoponto

Administradores devem possuir acesso às funcionalidades administrativas relacionadas ao ecoponto.

---

# 10. Administração

## RF-040 — Painel administrativo

O sistema deve possuir área administrativa para usuários com:

```text
role = ADMIN
```

---

## RF-041 — Gerenciamento de usuários

O administrador deve poder consultar usuários cadastrados.

---

## RF-042 — Visualização de dados de usuários

O administrador deve poder visualizar informações permitidas dos usuários para fins administrativos.

---

## RF-043 — Controle de status do usuário

O administrador deve possuir mecanismo para ativar ou desativar usuários conforme as permissões definidas pelo sistema.

---

## RF-044 — Gerenciamento de coletas

O administrador deve poder consultar as coletas do sistema para acompanhamento e gestão.

---

## RF-045 — Visualização de detalhes administrativos

O administrador deve poder consultar detalhes relevantes das coletas, incluindo informações necessárias para acompanhamento operacional.

---

## RF-046 — Relatórios

O sistema deve possuir estrutura para disponibilizar relatórios administrativos.

Os relatórios definitivos devem ser definidos em:

```text
docs/OPEN_QUESTIONS.md
```

e documentados posteriormente nos requisitos correspondentes.

---

# 11. Notificações

## RF-047 — Registrar notificações

O sistema deve possuir estrutura para registrar notificações relacionadas aos eventos importantes do sistema.

---

## RF-048 — Visualizar notificações

Usuários autenticados devem poder consultar suas próprias notificações.

---

## RF-049 — Marcar como lida

O usuário deve poder marcar uma notificação como lida.

---

## RF-050 — Eventos relacionados à coleta

As notificações podem ser disparadas por eventos como:

```text
coleta aceita
coleta em andamento
coleta recolhida
coleta entregue no ecoponto
coleta concluída
```

A implementação definitiva deve permanecer alinhada ao fluxo real do projeto.

---

# 12. Geolocalização

## RF-051 — Armazenar localização

Quando houver coordenadas geográficas disponíveis, o sistema deve armazená-las em formato GeoJSON:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

---

## RF-052 — Consultas geográficas

O backend deve possuir estrutura compatível com consultas geoespaciais utilizando MongoDB e índice:

```text
2dsphere
```

---

# 13. API

## RF-053 — API versionada

A API deve utilizar uma base versionada:

```text
/api/v1
```

---

## RF-054 — Endpoints de autenticação

A API deve possuir endpoints equivalentes a:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

---

## RF-055 — Endpoints de perfil

A API deve possuir endpoints equivalentes a:

```text
GET   /api/v1/profile
PATCH /api/v1/profile
```

---

## RF-056 — Endpoints de coleta do cliente

A API deve possuir estrutura equivalente a:

```text
POST /api/v1/collections
GET  /api/v1/collections
GET  /api/v1/collections/:id
```

---

## RF-057 — Endpoints operacionais do coletor

A API deve possuir estrutura equivalente a:

```text
GET  /api/v1/collections/available
GET  /api/v1/collections/assigned
POST /api/v1/collections/:id/accept
POST /api/v1/collections/:id/start
POST /api/v1/collections/:id/collect
POST /api/v1/collections/:id/deliver
POST /api/v1/collections/:id/complete
```

A implementação deve respeitar rigorosamente as transições permitidas.

Não existe endpoint genérico de alteração de status (`DEC-064`).

---

## RF-058 — Endpoints administrativos

A API deve possuir estrutura para recursos administrativos, incluindo:

```text
GET /api/v1/admin/users
GET /api/v1/admin/users/:id

GET /api/v1/admin/collections
GET /api/v1/admin/collections/:id

GET /api/v1/admin/reports
```

Os endpoints exatos podem ser refinados conforme a implementação final.

---

# 14. Respostas da API

## RF-059 — Resposta de sucesso

As respostas de sucesso devem utilizar estrutura consistente.

Exemplo:

```json
{
  "status": "success",
  "message": "Operação realizada com sucesso.",
  "data": {}
}
```

---

## RF-060 — Resposta de erro

As respostas de erro devem utilizar estrutura consistente.

Exemplo:

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

# 15. Requisitos Não Funcionais

## RNF-001 — Responsividade

A aplicação deve ser responsiva.

O desenvolvimento deve seguir abordagem:

```text
Mobile First
```

---

## RNF-002 — Compatibilidade

A interface deve funcionar adequadamente em:

- Smartphones
- Tablets
- Notebooks
- Desktops

---

## RNF-003 — Segurança

O sistema deve aplicar práticas adequadas de segurança para:

- autenticação
- autorização
- armazenamento de senhas
- proteção de credenciais
- validação de entrada
- controle de acesso
- proteção de rotas

---

## RNF-004 — Senhas

Senhas nunca devem ser armazenadas em texto puro.

Deve ser utilizado algoritmo de hash seguro.

---

## RNF-005 — Segredos de configuração

Segredos e credenciais não devem ser enviados ao Git.

Utilizar:

```text
.env
.env.example
```

---

## RNF-006 — Separação de responsabilidades

O frontend não deve acessar diretamente o banco de dados.

A comunicação deve seguir:

```text
Frontend
    ↓
HTTP
    ↓
Backend
    ↓
MongoDB
```

---

## RNF-007 — Arquitetura backend

O backend deve seguir separação lógica entre:

```text
Routes
    ↓
Controllers
    ↓
Services
    ↓
Models / Data Access
    ↓
MongoDB
```

---

## RNF-008 — Regras no backend

As regras críticas do sistema devem ser garantidas pelo backend.

---

## RNF-009 — Banco de dados

O banco de dados utilizado deve ser:

```text
MongoDB
```

A modelagem deve contemplar documentos, coleções, referências e documentos embutidos conforme definido na arquitetura e no domínio.

---

## RNF-010 — Integridade

O sistema deve impedir inconsistências de dados provocadas por:

- operações concorrentes
- transições inválidas
- usuários sem permissão
- dados obrigatórios ausentes
- identificadores inválidos

---

## RNF-011 — Histórico

Informações necessárias para reconstruir o histórico das coletas devem ser preservadas.

---

## RNF-012 — Desativação lógica

Quando um recurso possuir histórico relevante, deve-se preferir desativação lógica em vez de exclusão física.

---

## RNF-013 — Usabilidade

A interface deve apresentar:

- feedback visual para ações
- mensagens de erro claras
- estados de carregamento
- confirmação para ações sensíveis
- formulários compreensíveis
- navegação consistente

---

## RNF-014 — Acessibilidade

A interface deve considerar requisitos básicos de acessibilidade, incluindo:

- contraste adequado
- foco visível
- navegação por teclado
- labels apropriados
- textos alternativos quando aplicável
- elementos interativos semanticamente corretos

---

## RNF-015 — Performance

O sistema deve evitar operações e renderizações desnecessárias.

As consultas ao backend devem retornar somente os dados necessários para cada operação.

---

## RNF-016 — Tratamento de erros

Erros do frontend e backend devem ser tratados de forma previsível e apresentar mensagens apropriadas ao usuário.

Detalhes internos sensíveis não devem ser expostos ao cliente.

---

## RNF-017 — Consistência visual

A interface deve seguir o Design System definido em:

```text
docs/10_DESIGN_SYSTEM.md
```

Componentes reutilizáveis devem seguir:

```text
docs/11_COMPONENTS.md
```

---

## RNF-018 — Responsabilidade das camadas

### Frontend

Responsável principalmente por:

- apresentação
- interação
- navegação
- validações de experiência
- estados visuais
- consumo da API

### Backend

Responsável principalmente por:

- autenticação
- autorização
- regras de negócio
- validações críticas
- transições de estado
- persistência
- segurança

### MongoDB

Responsável pelo armazenamento persistente dos dados do sistema.

---

# 16. Critérios gerais de aceite

## CA-001 — Cadastro

Deve ser possível:

```text
abrir cadastro
→ preencher dados
→ validar campos
→ criar conta
→ autenticar usuário
```

---

## CA-002 — Login

Deve ser possível:

```text
informar credenciais
→ validar
→ autenticar
→ acessar área protegida
```

---

## CA-003 — Solicitação de coleta

Deve ser possível:

```text
cliente autenticado
→ informar endereço
→ informar itens
→ enviar solicitação
→ receber coleta PENDENTE
```

---

## CA-004 — Fluxo do coletor

Deve ser possível:

```text
visualizar PENDENTE
→ aceitar
→ A_CAMINHO
→ RECOLHIDA
→ ENTREGUE_ECOPONTO
→ CONCLUIDA
```

---

## CA-005 — Controle de acesso

Um usuário não deve conseguir acessar ou modificar recursos incompatíveis com sua role.

---

## CA-006 — Concorrência

Dois coletores não devem conseguir assumir a mesma coleta.

Uma tentativa concorrente inválida deve resultar em:

```text
409 Conflict
```

---

## CA-007 — Responsividade

As principais jornadas devem ser utilizáveis em dispositivos móveis.

Jornadas prioritárias:

```text
login
cadastro
solicitação de coleta
acompanhamento da coleta
painel do coletor
```

---

# 17. Requisitos ainda dependentes de definição

Os seguintes pontos não devem ser inventados durante a implementação.

Devem permanecer registrados em:

```text
docs/OPEN_QUESTIONS.md
```

até que uma decisão seja tomada:

- confirmação de e-mail
- endereço definitivo do ecoponto
- coordenadas do ecoponto
- horários de funcionamento
- horários disponíveis para coleta
- categorias definitivas de resíduos
- limites de quantidade
- aquisição de geolocalização
- sistema de notificações
- provedor de recuperação de senha
- relatórios definitivos
- possíveis parceiros externos
- demais regras ainda não aprovadas pelo grupo

---

# 18. Regra de implementação

Um requisito só deve ser considerado implementado quando:

```text
Requisito
    ↓
Implementação
    ↓
Validação
    ↓
Teste
    ↓
Documentação atualizada
```

Alterações relevantes nos requisitos devem ser refletidas nos documentos relacionados.

Nunca criar funcionalidades de negócio arbitrárias apenas para preencher lacunas da implementação.