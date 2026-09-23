# CLAUDE.md

Este arquivo define as instruções operacionais para o Claude Code trabalhar no projeto EcoByte.

---

## 1. Objetivo

O EcoByte é uma plataforma full-stack de descarte de lixo eletrônico voltada inicialmente para Diadema-SP.

O sistema possui três perfis operacionais:

- Cliente;
- Coletor;
- Administrador.

O EcoByte possui três papéis dentro do domínio:

1. plataforma digital;
2. agente responsável pelo recolhimento;
3. ecoponto físico central.

O objetivo do projeto é facilitar a solicitação de coleta e o encaminhamento do material até o ecoponto físico do EcoByte.

---

## 2. Fonte da Verdade

Antes de implementar uma funcionalidade, consulte os documentos relacionados em `/docs`.

Nunca invente regras de negócio que não estejam documentadas.

Classifique informações como:

- DEFINIDA;
- INFERIDA;
- EM ABERTO.

Informações DEFINIDAS podem ser implementadas.

Informações INFERIDAS podem ser sugeridas, mas não devem virar regra de negócio sem confirmação.

Informações EM ABERTO não devem ser inventadas.

Questões sem definição devem ser registradas em:

`docs/OPEN_QUESTIONS.md`

---

## 3. Ordem de Leitura

Sempre leia:

1. `CLAUDE.md`
2. `docs/00_PROJECT_OVERVIEW.md`

Depois leia os documentos específicos da tarefa.

### Arquitetura
`docs/01_ARCHITECTURE.md`

### Domínio
`docs/02_DOMAIN_MODEL.md`

### Regras
`docs/03_BUSINESS_RULES.md`

### Requisitos
`docs/04_REQUIREMENTS.md`

### Rotas
`docs/05_ROUTES.md`

### API
`docs/06_API.md`

### Banco
`docs/07_DATABASE_MONGODB.md`

### Consultas MongoDB
`docs/08_MONGODB_QUERIES.md`

### Autenticação e segurança
`docs/09_AUTHENTICATION_SECURITY.md`

### UI
`docs/10_DESIGN_SYSTEM.md`
`docs/11_COMPONENTS.md`

### Responsividade e acessibilidade
`docs/12_RESPONSIVENESS_ACCESSIBILITY.md`

### Coletor
`docs/13_COLLECTOR_FLOW.md`

### Status
`docs/14_STATE_MACHINE.md`

### Interações
`docs/15_INTERACTIONS_MOTION.md`

### Assets
`docs/16_ASSETS.md`

### Testes
`docs/17_TESTING.md`

### Desenvolvimento
`docs/18_DEVELOPMENT.md`

### Deploy
`docs/19_DEPLOYMENT.md`

### Dados de demonstração
`docs/20_SEED_DATA.md`

### Decisões arquiteturais
`docs/DECISIONS.md`

### Questões abertas
`docs/OPEN_QUESTIONS.md`

---

## 4. Stack

Frontend:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- Shadcn UI;
- Framer Motion;
- Lucide React.

Backend:

- Node.js;
- Express.js;
- TypeScript.

Banco:

- MongoDB;
- Mongoose.

O backend Express é a API oficial de negócio.

O frontend NÃO deve mover regras de negócio para Next.js Route Handlers, Server Actions ou soluções equivalentes.

---

## 5. Regras Fundamentais

- Não alterar a stack sem atualizar `docs/DECISIONS.md`.
- Não adicionar frameworks sem necessidade.
- Não criar funcionalidades fora do escopo.
- Não inventar dados.
- Não duplicar componentes existentes.
- Não criar componentes visualmente equivalentes quando já existe um componente reutilizável.
- Não quebrar funcionalidades existentes.
- Não armazenar senhas em texto puro.
- Não confiar em validações feitas somente no frontend.
- Toda autorização deve ser validada no backend.
- Nunca utilizar o frontend como fonte de verdade para permissões.
- Toda alteração significativa deve possuir teste adequado.
- Alterações de domínio devem refletir na documentação.

---

## 6. Arquitetura

A aplicação segue:

Frontend
→ HTTP
→ Express API
→ Mongoose
→ MongoDB

O frontend é responsável por:

- apresentação;
- interação;
- navegação;
- estado visual;
- consumo da API.

O backend é responsável por:

- regras de negócio;
- autenticação;
- autorização;
- validação;
- acesso ao MongoDB;
- transições de status;
- respostas HTTP.

---

## 7. Banco de Dados

MongoDB é o banco obrigatório.

Não introduzir banco relacional.

Utilizar Mongoose para:

- schemas;
- validações;
- índices;
- models.

Explorar documentos e arrays de objetos quando fizer sentido.

Endereço de coleta deve ser embutido na coleta para preservar o estado histórico daquele momento.

---

## 8. Autenticação

O usuário acessa utilizando e-mail e senha.

Cadastro deve possuir:

- e-mail;
- senha;
- confirmação de senha.

Senha deve exigir:

- mínimo de 8 caracteres;
- letra maiúscula;
- letra minúscula;
- número;
- caractere especial.

Senha nunca pode ser armazenada em texto puro.

As permissões devem ser verificadas pelo backend.

---

## 9. Coleta

A coleta possui uma máquina de estados definida em:

`docs/14_STATE_MACHINE.md`

Nunca criar novos status sem atualizar esse documento.

As transições devem ser validadas no backend.

---

## 10. EcoPonto

O projeto atual possui um único ecoponto físico:

EcoByte.

Não criar um marketplace ou mapa de ecopontos terceiros.

A coleção MongoDB `ecopontos` existe para representar o ecoponto central e permitir expansão futura.

---

## 11. Mobile-First

Mobile-first é requisito estrutural.

Prioridade especial:

- Solicitar Coleta;
- Painel do Coletor;
- Login;
- Cadastro.

Não usar uma versão desktop como referência e simplesmente "encolher" para mobile.

---

## 12. Processo de Trabalho

Sempre seguir:

Analyze
→ Plan
→ Implement
→ Test
→ Review
→ Update Docs

Não modificar arquivos não relacionados à tarefa.

---

## 13. Alteração de Arquitetura

Se uma tarefa exigir mudança de arquitetura:

1. identificar o problema;
2. consultar `docs/DECISIONS.md`;
3. explicar o impacto;
4. atualizar a documentação;
5. só então implementar.

---

## 14. Entrega de Código

Não criar ZIPs de substituição.

Não criar pastas destinadas a substituir o projeto inteiro.

Quando apresentar código:

- identificar o caminho do arquivo;
- mostrar somente a alteração necessária;
- utilizar blocos de código;
- evitar sobrescrever arquivos não relacionados.

---

## 15. Regra de Ouro

O projeto deve ser:

CLARO
+
EXPLICÁVEL
+
SEGURO
+
RESPONSIVO
+
ESCALÁVEL
+
COERENTE COM A DOCUMENTAÇÃO.

Não implementar "porque seria legal".

Implementar porque existe uma necessidade documentada.