# FlowDesk

Sistema full stack para gerenciamento de chamados técnicos, desenvolvido com Angular, FastAPI e PostgreSQL.

O FlowDesk permite que solicitantes abram chamados, técnicos realizem atendimentos e administradores gerenciem usuários, categorias e permissões do sistema.

## Demonstração

> Adicione aqui imagens ou um GIF demonstrando o sistema.

<!--
![Dashboard do FlowDesk](docs/screenshots/dashboard.png)
![Listagem de chamados](docs/screenshots/tickets.png)
![Detalhes do chamado](docs/screenshots/ticket-details.png)
-->

## Funcionalidades

- Autenticação com JWT
- Controle de acesso por perfil
- Proteção de rotas no frontend
- Tratamento automático de sessão expirada
- Dashboard com indicadores
- Criação de chamados
- Listagem e filtro de chamados
- Visualização dos detalhes do chamado
- Atribuição de chamados para técnicos
- Alteração do status dos chamados
- Inclusão de comentários
- Histórico de alterações
- Exclusão de chamados por administradores
- Cadastro e listagem de categorias
- Exclusão segura de categorias
- Cadastro e listagem de usuários
- Ativação e desativação de usuários
- Remoção automática de técnicos inativos dos chamados em andamento
- Interface responsiva e layout compartilhado

## Perfis de acesso

### Administrador

- Gerencia usuários
- Ativa e desativa contas
- Gerencia categorias
- Visualiza todos os chamados
- Assume chamados
- Altera status
- Adiciona comentários
- Exclui chamados

### Técnico

- Visualiza chamados disponíveis ou atribuídos
- Assume chamados
- Altera o status dos seus atendimentos
- Adiciona comentários
- Consulta o histórico

### Solicitante

- Cria chamados
- Visualiza os próprios chamados
- Adiciona comentários
- Acompanha o andamento do atendimento

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

## Arquitetura

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
└── README.md