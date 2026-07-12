# FlowDesk

Sistema full stack para gerenciamento de chamados técnicos, desenvolvido com Angular, FastAPI e PostgreSQL.

O FlowDesk permite que solicitantes abram chamados, técnicos realizem atendimentos e administradores gerenciem usuários, categorias e permissões.

## Visão geral

O projeto foi criado com foco em organização, segurança e separação de responsabilidades entre frontend, backend e banco de dados.

```text
Angular
   ↓ HTTP / JSON
FastAPI
   ↓ SQLAlchemy
PostgreSQL
```

## Funcionalidades

- autenticação com JWT;
- proteção de rotas no frontend;
- interceptor HTTP para envio automático do token;
- tratamento de sessão expirada;
- dashboard com indicadores;
- criação de chamados;
- listagem e filtro de chamados;
- visualização dos detalhes do chamado;
- atribuição de técnico;
- alteração de status;
- inclusão de comentários;
- histórico de alterações;
- exclusão de chamados;
- cadastro e listagem de categorias;
- exclusão segura de categorias;
- cadastro e listagem de usuários;
- ativação e desativação de usuários;
- remoção automática de técnicos inativos dos chamados em andamento;
- controle de acesso por perfil;
- layout compartilhado e interface responsiva.

## Perfis de acesso

### Administrador

- visualiza todos os chamados;
- gerencia usuários;
- ativa e desativa contas;
- gerencia categorias;
- assume chamados;
- altera status;
- adiciona comentários;
- exclui chamados.

### Técnico

- visualiza chamados disponíveis ou atribuídos;
- assume chamados;
- altera o status dos seus atendimentos;
- adiciona comentários;
- consulta o histórico.

### Solicitante

- cria chamados;
- visualiza os próprios chamados;
- adiciona comentários;
- acompanha o andamento do atendimento.

## Tecnologias utilizadas

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- JWT
- Passlib / Bcrypt
- Uvicorn

### Frontend

- Angular
- TypeScript
- SCSS
- RxJS
- Angular Router
- Angular HttpClient

## Estrutura do projeto

```text
flowdesk/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── flowdesk-web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── layout/
│       │   │   └── pages/
│       │   └── styles.scss
│       └── package.json
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── authentication.md
│   ├── business-rules.md
│   ├── database.md
│   ├── installation.md
│   └── screenshots/
│
└── README.md
```

## Documentação

- [Arquitetura](docs/architecture.md)
- [API](docs/api.md)
- [Autenticação](docs/authentication.md)
- [Regras de negócio](docs/business-rules.md)
- [Banco de dados](docs/database.md)
- [Instalação](docs/installation.md)

## Instalação rápida

### Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```powershell
cd frontend\flowdesk-web
npm install
ng serve
```

A aplicação ficará disponível em:

```text
http://localhost:4200
```

## Variáveis de ambiente

Crie o arquivo:

```text
backend/.env
```

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/flowdesk
SECRET_KEY=adicione-uma-chave-segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

Nunca envie o arquivo `.env` para o GitHub.

## Principais endpoints

### Autenticação

```http
POST /auth/login
```

### Usuários

```http
POST  /users
GET   /users
GET   /users/me
PATCH /users/{user_id}/status
```

### Categorias

```http
POST   /categories
GET    /categories
DELETE /categories/{category_id}
```

### Chamados

```http
POST   /tickets
GET    /tickets
GET    /tickets/{ticket_id}
DELETE /tickets/{ticket_id}

PATCH /tickets/{ticket_id}/assign-to-me
PATCH /tickets/{ticket_id}/status
```

### Comentários e histórico

```http
POST /tickets/{ticket_id}/comments
GET  /tickets/{ticket_id}/comments
GET  /tickets/{ticket_id}/history
```

## Regras importantes

- apenas administradores podem gerenciar usuários e categorias;
- apenas administradores podem excluir chamados;
- técnicos podem assumir chamados disponíveis;
- solicitantes não podem alterar status;
- categorias em uso não podem ser excluídas;
- usuários inativos permanecem no banco;
- técnicos inativos deixam chamados em andamento sem responsável;
- chamados resolvidos e fechados preservam o técnico anterior.

## Segurança

O projeto implementa:

- senha com hash;
- autenticação JWT;
- expiração de token;
- guard de rotas;
- interceptor HTTP;
- controle de acesso por perfil;
- bloqueio de usuários inativos;
- tratamento de `401 Unauthorized`;
- proteção contra desativação da própria conta administrativa.

## Melhorias futuras

- refresh token;
- recuperação de senha;
- notificações por e-mail;
- upload de anexos;
- paginação;
- filtros avançados;
- pesquisa global;
- nomes no lugar de IDs;
- relatórios e gráficos;
- testes automatizados;
- Docker;
- deploy em produção;
- logs estruturados;
- tema claro e escuro.

## Autor

Desenvolvido por **João Victor Silva Santos**.

## Licença


Este projeto está licenciado sob a licença MIT.

Consulte o arquivo [LICENSE](LICENSE) para mais informações.
