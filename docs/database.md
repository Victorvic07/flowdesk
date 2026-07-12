# Banco de dados

O FlowDesk utiliza PostgreSQL como banco de dados relacional.

O acesso ao banco é realizado com SQLAlchemy, enquanto o controle de alterações de estrutura é feito com Alembic.

## Visão geral

```text
Angular
   ↓
FastAPI
   ↓
SQLAlchemy
   ↓
PostgreSQL
```

## Tecnologias

- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- Python

## Entidades principais

O banco de dados possui as seguintes entidades:

- `User`
- `Category`
- `Ticket`
- `Comment`
- `TicketHistory`

## User

Representa os usuários do sistema.

### Tabela

```text
users
```

### Campos

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Integer | Chave primária |
| `name` | String | Obrigatório |
| `email` | String | Obrigatório e único |
| `password_hash` | String | Obrigatório |
| `role` | Enum | Obrigatório |
| `is_active` | Boolean | Obrigatório |
| `created_at` | DateTime | Data de criação |

### Perfis disponíveis

```text
ADMIN
TECHNICIAN
REQUESTER
```

### Observações

- o e-mail deve ser único;
- a senha é armazenada como hash;
- usuários inativos permanecem no banco;
- a permanência do usuário preserva chamados, comentários e histórico.

## Category

Representa as categorias utilizadas nos chamados.

### Tabela

```text
categories
```

### Campos

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Integer | Chave primária |
| `name` | String | Obrigatório e único |
| `description` | Text | Descrição da categoria |
| `is_active` | Boolean | Indica se pode ser utilizada |

### Observações

- categorias ativas podem ser utilizadas em novos chamados;
- categorias vinculadas a chamados não podem ser excluídas;
- o nome deve ser único.

## Ticket

Representa os chamados técnicos.

### Tabela

```text
tickets
```

### Campos

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Integer | Chave primária |
| `title` | String | Obrigatório |
| `description` | Text | Obrigatório |
| `status` | Enum | Obrigatório |
| `priority` | Enum | Obrigatório |
| `category_id` | Integer | Chave estrangeira, opcional |
| `requester_id` | Integer | Chave estrangeira, obrigatório |
| `technician_id` | Integer | Chave estrangeira, opcional |
| `created_at` | DateTime | Data de criação |
| `updated_at` | DateTime | Data de atualização |

### Status disponíveis

```text
OPEN
IN_PROGRESS
WAITING_USER
RESOLVED
CLOSED
```

### Prioridades disponíveis

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### Observações

- `requester_id` identifica quem abriu o chamado;
- `technician_id` identifica o responsável pelo atendimento;
- `technician_id` pode ser nulo;
- chamados podem ficar sem técnico atribuído;
- `updated_at` é atualizado automaticamente em alterações.

## Comment

Representa comentários feitos em chamados.

### Tabela

```text
comments
```

### Campos

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Integer | Chave primária |
| `content` | Text | Obrigatório |
| `ticket_id` | Integer | Chave estrangeira |
| `author_id` | Integer | Chave estrangeira |
| `created_at` | DateTime | Data de criação |

### Observações

- todo comentário pertence a um chamado;
- todo comentário possui um autor;
- a criação do comentário também gera registro no histórico.

## TicketHistory

Representa o histórico de ações realizadas em chamados.

### Tabela

```text
ticket_history
```

### Campos

| Campo | Tipo | Regra |
|---|---|---|
| `id` | Integer | Chave primária |
| `ticket_id` | Integer | Chave estrangeira |
| `user_id` | Integer | Chave estrangeira |
| `action` | String | Obrigatório |
| `old_value` | Text | Opcional |
| `new_value` | Text | Opcional |
| `created_at` | DateTime | Data de criação |

### Ações registradas

Exemplos:

```text
TICKET_CREATED
TICKET_ASSIGNED
STATUS_CHANGED
COMMENT_ADDED
```

### Observações

O histórico permite identificar:

- quem realizou a ação;
- qual chamado foi alterado;
- valor anterior;
- novo valor;
- data e hora.

## Relacionamentos

```text
User 1 ─── N Ticket como solicitante
User 1 ─── N Ticket como técnico
Category 1 ─── N Ticket
Ticket 1 ─── N Comment
Ticket 1 ─── N TicketHistory
User 1 ─── N Comment
User 1 ─── N TicketHistory
```

## Chaves estrangeiras

### Ticket

```text
category_id   → categories.id
requester_id  → users.id
technician_id → users.id
```

### Comment

```text
ticket_id → tickets.id
author_id → users.id
```

### TicketHistory

```text
ticket_id → tickets.id
user_id   → users.id
```

## Integridade dos dados

O projeto adota regras para preservar a consistência do banco.

### Exclusão de categorias

Uma categoria só pode ser excluída quando não possui chamados vinculados.

### Desativação de usuários

Usuários são desativados em vez de excluídos.

Isso preserva:

- chamados;
- comentários;
- histórico;
- auditoria.

### Desativação de técnicos

Ao desativar um técnico:

- chamados ativos ficam com `technician_id = null`;
- chamados resolvidos ou fechados preservam o técnico anterior.

### Exclusão de chamados

A exclusão ocorre nesta ordem:

```text
comments
   ↓
ticket_history
   ↓
tickets
```

Essa ordem evita conflitos de chave estrangeira.

## Migrações

O projeto utiliza Alembic para versionar alterações no banco.

### Aplicar migrations

```powershell
alembic upgrade head
```

### Criar nova migration

```powershell
alembic revision --autogenerate -m "descricao da alteracao"
```

### Voltar uma migration

```powershell
alembic downgrade -1
```

### Consultar migration atual

```powershell
alembic current
```

## Conexão com o banco

A conexão é configurada por variável de ambiente.

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/flowdesk
```

## Boas práticas adotadas

- uso de chaves primárias;
- uso de chaves estrangeiras;
- campos obrigatórios definidos com `nullable=False`;
- e-mails únicos;
- enums para status, prioridade e perfil;
- controle de migrations;
- preservação de histórico;
- exclusão segura de registros dependentes;
- uso de repositories para acesso ao banco.

## Melhorias futuras

- índices adicionais para buscas frequentes;
- paginação;
- soft delete para chamados;
- auditoria mais detalhada;
- logs de alterações administrativas;
- backup automatizado;
- monitoramento de performance;
- constraints adicionais;
- testes de integridade;
- uso de Docker para o PostgreSQL.