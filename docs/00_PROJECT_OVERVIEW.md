# EcoByte — Project Overview

## 1. Visão Geral

O EcoByte é uma plataforma web full-stack para facilitar o descarte adequado de resíduos eletroeletrônicos em Diadema-SP.

A solução combina:

- plataforma digital;
- operação de coleta;
- ecoponto físico próprio.

O usuário utiliza a plataforma para solicitar o recolhimento de lixo eletrônico.

A equipe EcoByte atua como agente responsável pela coleta e encaminhamento do material até o ecoponto físico do próprio EcoByte.

---

## 2. Problema

O descarte adequado de resíduos eletroeletrônicos pode envolver uma barreira prática para o cidadão:

- identificar como realizar o descarte;
- transportar o material;
- organizar uma solicitação;
- acompanhar o processo.

O projeto procura reduzir esse atrito por meio de uma experiência digital centralizada.

### Problema central

> Como facilitar o caminho entre uma pessoa que possui lixo eletrônico e o local adequado para seu descarte?

---

## 3. Oportunidade

Em vez de exigir que o usuário descubra sozinho como transportar e entregar seu material, o EcoByte propõe uma experiência na qual:

1. o usuário solicita;
2. a equipe EcoByte recolhe;
3. o material é encaminhado;
4. o descarte é concluído no ecoponto EcoByte.

---

## 4. Solução

O EcoByte disponibiliza uma plataforma onde pessoas físicas e jurídicas podem:

- criar uma conta;
- realizar login;
- solicitar coleta;
- informar endereço;
- informar materiais;
- selecionar data/horário;
- acompanhar solicitações;
- consultar histórico;
- receber atualizações.

A operação EcoByte permite:

- visualizar coletas;
- assumir coletas;
- atualizar o status;
- confirmar recolhimento;
- registrar a entrega no ecoponto.

Administradores podem:

- gerenciar usuários;
- gerenciar coletas;
- gerenciar o ecoponto;
- consultar relatórios.

---

## 5. Proposta de Valor

### Para o usuário

Tornar o descarte mais simples e conveniente.

### Para a operação

Centralizar e organizar as solicitações e rotas.

### Para o ecoponto

Registrar a entrada dos materiais encaminhados.

### Para o projeto

Demonstrar como software pode reduzir atritos de um processo físico e logístico.

---

## 6. Público-Alvo

### Público principal

- moradores de Diadema;
- pessoas físicas com eletrônicos sem uso;
- empresas e instituições que geram resíduos eletroeletrônicos.

### Público secundário

- condomínios;
- pequenos comércios;
- organizações com descarte recorrente.

O público-alvo definitivo poderá ser refinado após pesquisa/validação.

---

## 7. Atores

### Cliente

Pessoa física ou jurídica que utiliza a plataforma para solicitar a coleta.

### Coletor

Integrante da operação EcoByte responsável por executar a coleta.

### Administrador

Responsável pela gestão operacional e administrativa do sistema.

---

## 8. Identidade dos Usuários

O sistema separa duas dimensões:

### Tipo de Cadastro

- PF — Pessoa Física;
- PJ — Pessoa Jurídica.

### Papel no Sistema

- CLIENTE;
- COLETOR;
- ADMIN.

Isso evita misturar perfil de cadastro com permissão operacional.

---

## 9. Fluxo Principal

```text
Usuário
   ↓
Cadastro/Login
   ↓
Solicitar Coleta
   ↓
Informar Resíduos
   ↓
Informar Endereço
   ↓
Escolher Data/Horário
   ↓
Confirmar Solicitação
   ↓
PENDENTE
   ↓
Coletor assume
   ↓
A CAMINHO
   ↓
RECOLHIDA
   ↓
ENTREGUE NO ECOPONTO
   ↓
CONCLUÍDA

## 10. Escopo do MVP

### O MVP deverá contemplar:

- página pública;
- autenticação;
- cadastro PF/PJ;
- painel do cliente;
- solicitação de coleta;
- acompanhamento;
- painel do coletor;
- atualização de status;
- painel administrativo;
- gerenciamento de usuários;
- gerenciamento de coletas;
- gerenciamento do ecoponto;
- relatórios básicos;
- MongoDB;
- API REST;
- responsividade mobile-first.

## 11. Fora do Escopo Inicial

### Não fazem parte do MVP:

- pagamentos;
- marketplace;
- venda de produtos;
- rastreamento GPS em tempo real;
- aplicativo nativo;
- múltiplos ecopontos operacionais;
- cálculo automático de rotas complexas;
- integração obrigatória com cooperativas;
- chatbot;
- IA generativa.

### Esses recursos podem ser considerados futuramente.

## 12. Cenário do Ecoponto

### No escopo atual:

O EcoByte possui e opera seu próprio ecoponto físico.

Portanto, o sistema atual não representa uma rede de ecopontos terceiros.

A entidade Ecoponto representa o ecoponto central EcoByte.

A arquitetura pode permitir expansão futura para múltiplos pontos, mas isso não deve alterar o comportamento atual do MVP.

## 13. Objetivos Acadêmicos

### O projeto deve demonstrar integração entre diferentes conhecimentos do curso.

Desenvolvimento Web III

### Demonstrar:

- Node.js;
- Express;
- arquitetura cliente-servidor;
- HTTP;
- request/response;
- rotas;
- API REST;
- status HTTP.
- Banco de Dados Não Relacional

### Demonstrar:

- MongoDB;
- documentos;
- coleções;
- schema flexível;
- documentos embutidos;
- arrays;
- índices;
- consultas;
- aggregation;
- geospatial queries.

Desenvolvimento de Software Multiplataforma

### Integrar:

- frontend;
- backend;
- banco;
- UX;
- modelagem;
- documentação;
- arquitetura.

## 14. Critérios de Sucesso

### O projeto será considerado bem-sucedido quando:

- o usuário conseguir solicitar uma coleta;
- a coleta puder ser assumida pelo coletor;
- o status puder evoluir corretamente;
- o administrador puder acompanhar o processo;
- os dados forem persistidos no MongoDB;
- as permissões forem respeitadas;
- o sistema funcionar bem em mobile;
- as APIs forem claras;
- o projeto for demonstrável;
- a arquitetura puder ser explicada pela equipe.

## 15. Princípios do Produto

### Simplicidade

Reduzir o número de passos desnecessários.

### Transparência

O usuário deve saber o status de sua solicitação.

### Conveniência

A solução deve reduzir o atrito do descarte.

### Confiabilidade

Uma coleta não pode ser assumida por dois coletores simultaneamente.

### Responsabilidade

O sistema deve registrar o processo de forma rastreável.

### Mobile First

Fluxos operacionais devem funcionar excepcionalmente bem no celular.

## 16. Status do Documento

Este documento representa a visão consolidada do projeto.

Alterações estruturais devem ser registradas em:

docs/DECISIONS.md