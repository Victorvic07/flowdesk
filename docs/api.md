# API do FlowDesk

A API do FlowDesk foi desenvolvida com **FastAPI** e fornece os recursos de autenticação, gerenciamento de usuários, categorias, chamados, comentários e histórico.

## Endereços locais

- **API:** `http://127.0.0.1:8000`
- **Swagger:** `http://127.0.0.1:8000/docs`

> As rotas protegidas exigem o envio de um token JWT no cabeçalho da requisição.

```http
Authorization: Bearer TOKEN_JWT
```

---

## Autenticação

### Realizar login

```http
POST /auth/login
```

Valida as credenciais do usuário e retorna um token JWT.

**Corpo da requisição:**

```json
{
  "email": "usuario@flowdesk.com",
  "password": "Senha123"
}
```

---

## Usuários

### Criar usuário

```http
POST /users
```

**Corpo da requisição:**

```json
{
  "name": "João Victor",
  "email": "joao@flowdesk.com",
  "password": "Senha123",
  "role": "REQUESTER"
}
```

Perfis disponíveis:

- `ADMIN`
- `TECHNICIAN`
- `REQUESTER`

### Listar usuários

```http
GET /users
```

Disponível apenas para administradores.

### Consultar o usuário autenticado

```http
GET /users/me
```

Retorna os dados do usuário autenticado.

### Ativar ou desativar usuário

```http
PATCH /users/{user_id}/status
```

**Exemplo para desativar:**

```json
{
  "is_active": false
}
```

**Exemplo para ativar:**

```json
{
  "is_active": true
}
```

Regras principais:

- apenas administradores podem alterar o status de usuários;
- um administrador não pode desativar a própria conta;
- ao desativar um técnico, os chamados em andamento ficam sem técnico responsável;
- chamados resolvidos ou fechados preservam o técnico anteriormente atribuído.

---

## Categorias

### Criar categoria

```http
POST /categories
```

**Corpo da requisição:**

```json
{
  "name": "Infraestrutura",
  "description": "Problemas relacionados a equipamentos e rede."
}
```

### Listar categorias

```http
GET /categories
```

### Excluir categoria

```http
DELETE /categories/{category_id}
```

A categoria só pode ser excluída quando não possui chamados vinculados.

---

## Chamados

### Criar chamado

```http
POST /tickets
```

**Corpo da requisição:**

```json
{
  "title": "Computador sem acesso à internet",
  "description": "O computador do setor financeiro não acessa a rede.",
  "priority": "HIGH",
  "category_id": 1
}
```

Prioridades disponíveis:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### Listar chamados

```http
GET /tickets
```

A listagem respeita o perfil do usuário autenticado:

- administradores visualizam todos os chamados;
- técnicos visualizam chamados livres ou atribuídos a eles;
- solicitantes visualizam apenas os próprios chamados.

### Consultar chamado

```http
GET /tickets/{ticket_id}
```

### Excluir chamado

```http
DELETE /tickets/{ticket_id}
```

Disponível apenas para administradores.

Ao excluir um chamado, o sistema remove primeiro os comentários e o histórico vinculados e, em seguida, o chamado.

### Atribuir chamado ao usuário autenticado

```http
PATCH /tickets/{ticket_id}/assign-to-me
```

Atribui o chamado ao técnico ou administrador autenticado.

### Alterar status do chamado

```http
PATCH /tickets/{ticket_id}/status
```

**Corpo da requisição:**

```json
{
  "status": "IN_PROGRESS"
}
```

Status disponíveis:

- `OPEN`
- `IN_PROGRESS`
- `WAITING_USER`
- `RESOLVED`
- `CLOSED`

---

## Comentários

### Adicionar comentário

```http
POST /tickets/{ticket_id}/comments
```

**Corpo da requisição:**

```json
{
  "content": "Iniciando análise do problema."
}
```

### Listar comentários

```http
GET /tickets/{ticket_id}/comments
```

---

## Histórico

### Consultar histórico do chamado

```http
GET /tickets/{ticket_id}/history
```

O histórico registra ações como:

- criação do chamado;
- atribuição de técnico;
- alteração de status;
- adição de comentário.

---

## Códigos de resposta mais comuns

| Código | Significado |
|---|---|
| `200 OK` | Operação realizada com sucesso |
| `201 Created` | Recurso criado com sucesso |
| `204 No Content` | Recurso excluído com sucesso |
| `401 Unauthorized` | Token ausente, inválido ou expirado |
| `403 Forbidden` | Usuário sem permissão para a operação |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Conflito de regra de negócio |
| `422 Unprocessable Entity` | Dados enviados são inválidos |