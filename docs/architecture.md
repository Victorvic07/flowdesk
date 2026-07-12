# Arquitetura do FlowDesk

O FlowDesk é uma aplicação full stack para gerenciamento de chamados técnicos, composta por frontend, backend e banco de dados.

## Visão geral

```text
Usuário
   ↓
Angular
   ↓ HTTP / JSON
FastAPI
   ↓ SQLAlchemy
PostgreSQL
```

A aplicação foi desenvolvida com separação clara de responsabilidades, facilitando manutenção, evolução e testes.

## Frontend

O frontend foi desenvolvido com Angular e utiliza:

- TypeScript
- SCSS
- Angular Router
- HttpClient
- RxJS
- componentes standalone
- guard de autenticação
- interceptor HTTP
- layout compartilhado

### Responsabilidades

O frontend é responsável por:

- exibir as telas do sistema;
- realizar login;
- armazenar o token JWT;
- enviar requisições para a API;
- proteger rotas privadas;
- tratar sessão expirada;
- apresentar dados de chamados, usuários e categorias;
- atualizar a interface após operações assíncronas.

### Estrutura principal

```text
src/app/
├── guards/
├── interceptors/
├── layout/
├── pages/
├── app.config.ts
└── app.routes.ts
```

### Páginas principais

- Login
- Dashboard
- Chamados
- Novo chamado
- Detalhes do chamado
- Categorias
- Usuários

### Autenticação no frontend

O frontend utiliza:

- `authGuard` para proteger páginas privadas;
- `authInterceptor` para adicionar o token JWT;
- redirecionamento automático para o login em respostas `401 Unauthorized`.

## Backend

O backend foi desenvolvido com FastAPI.

### Tecnologias principais

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Alembic
- JWT
- Uvicorn

### Estrutura principal

```text
backend/app/
├── api/
├── core/
├── database/
├── models/
├── repositories/
├── schemas/
└── main.py
```

### Camadas

#### `api`

Contém as rotas HTTP e dependências de autenticação.

Exemplos:

- autenticação;
- usuários;
- categorias;
- chamados;
- comentários;
- histórico.

#### `core`

Contém recursos compartilhados de segurança.

Exemplos:

- geração de token JWT;
- leitura de token;
- hash de senha;
- validação de credenciais.

#### `database`

Contém a configuração da conexão com PostgreSQL e a base utilizada pelos modelos SQLAlchemy.

#### `models`

Contém as entidades que representam as tabelas do banco.

Principais modelos:

- `User`
- `Category`
- `Ticket`
- `Comment`
- `TicketHistory`

#### `repositories`

Contém funções de acesso ao banco, separando consultas e alterações das rotas HTTP.

#### `schemas`

Contém os modelos Pydantic utilizados para:

- validar dados recebidos;
- definir respostas da API;
- controlar os campos expostos ao frontend.

## Banco de dados

O FlowDesk utiliza PostgreSQL.

### Principais relacionamentos

```text
User 1 ─── N Ticket como solicitante
User 1 ─── N Ticket como técnico
Category 1 ─── N Ticket
Ticket 1 ─── N Comment
Ticket 1 ─── N TicketHistory
User 1 ─── N Comment
User 1 ─── N TicketHistory
```

### Observações importantes

- `technician_id` pode ser nulo;
- usuários inativos permanecem no banco;
- chamados resolvidos preservam o técnico responsável;
- comentários e histórico são removidos antes da exclusão de um chamado;
- categorias vinculadas a chamados não podem ser excluídas.

## Fluxo de autenticação

```text
Usuário informa e-mail e senha
        ↓
Frontend envia POST /auth/login
        ↓
Backend valida as credenciais
        ↓
API gera um token JWT
        ↓
Frontend salva o token
        ↓
Interceptor adiciona o token às requisições
        ↓
Backend valida usuário e permissões
```

## Fluxo de uma requisição

1. O usuário realiza uma ação no Angular.
2. O frontend envia uma requisição HTTP.
3. O interceptor adiciona o token JWT.
4. O FastAPI valida o token.
5. A rota verifica o perfil e as permissões.
6. O repository consulta ou altera o banco.
7. A API retorna uma resposta JSON.
8. O Angular atualiza a interface.

## Controle de acesso

O sistema possui três perfis:

### Administrador

- gerencia usuários;
- gerencia categorias;
- visualiza todos os chamados;
- altera status;
- assume chamados;
- adiciona comentários;
- exclui chamados.

### Técnico

- visualiza chamados disponíveis ou atribuídos;
- assume chamados;
- altera status;
- adiciona comentários;
- consulta histórico.

### Solicitante

- cria chamados;
- visualiza os próprios chamados;
- adiciona comentários;
- acompanha o atendimento.

## Decisões de arquitetura

### Separação entre frontend e backend

O Angular consome uma API REST independente, permitindo evolução separada das duas aplicações.

### Repository Pattern

As operações de banco ficam isoladas em repositories, evitando consultas SQLAlchemy diretamente em todas as rotas.

### JWT

A autenticação é stateless, baseada em token.

### Usuários inativos

Usuários são desativados em vez de excluídos para preservar auditoria e histórico.

### Exclusão segura

Chamados são excluídos em ordem controlada:

```text
Comentários
   ↓
Histórico
   ↓
Chamado
```

## Melhorias futuras

- refresh token;
- upload de anexos;
- recuperação de senha;
- notificações por e-mail;
- paginação;
- filtros avançados;
- nomes de usuários e categorias no lugar de IDs;
- testes automatizados;
- Docker;
- deploy em produção;
- logs estruturados;
- observabilidade;
- tema claro e escuro.