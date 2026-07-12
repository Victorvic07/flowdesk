# Instalação do FlowDesk

Este documento apresenta o passo a passo para executar o FlowDesk em ambiente local.

## Pré-requisitos

Antes de iniciar, instale:

- Git
- Python 3.11 ou superior
- Node.js
- npm
- Angular CLI
- PostgreSQL
- VS Code ou outro editor de código

## Clonar o repositório

No terminal, execute:

```powershell
git clone URL_DO_REPOSITORIO
cd flowdesk
```

Substitua `URL_DO_REPOSITORIO` pela URL do projeto no GitHub.

## Estrutura do projeto

```text
flowdesk/
├── backend/
├── frontend/
│   └── flowdesk-web/
├── docs/
└── README.md
```

## Configuração do backend

Entre na pasta do backend:

```powershell
cd backend
```

## Criar ambiente virtual

```powershell
python -m venv venv
```

## Ativar o ambiente virtual

No Windows:

```powershell
venv\Scripts\activate
```

Quando o ambiente estiver ativo, o terminal exibirá algo parecido com:

```text
(venv)
```

## Instalar dependências

```powershell
pip install -r requirements.txt
```

## Configurar variáveis de ambiente

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

## Criar o banco de dados

No PostgreSQL, crie um banco chamado:

```text
flowdesk
```

Exemplo SQL:

```sql
CREATE DATABASE flowdesk;
```

## Aplicar migrations

Com o ambiente virtual ativo, execute:

```powershell
alembic upgrade head
```

## Iniciar o backend

```powershell
uvicorn app.main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

A documentação Swagger ficará disponível em:

```text
http://127.0.0.1:8000/docs
```

## Configuração do frontend

Abra outro terminal.

Entre na pasta do Angular:

```powershell
cd frontend\flowdesk-web
```

## Instalar dependências

```powershell
npm install
```

## Iniciar o frontend

```powershell
ng serve
```

A aplicação ficará disponível em:

```text
http://localhost:4200
```

## Executar backend e frontend juntos

Mantenha dois terminais abertos.

### Terminal do backend

```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal do frontend

```powershell
cd frontend\flowdesk-web
ng serve
```

## Primeiro acesso

Após iniciar o sistema:

1. abra `http://localhost:4200`;
2. informe e-mail e senha;
3. acesse o dashboard;
4. teste criação de chamados, usuários e categorias.

## Testar a API

Abra:

```text
http://127.0.0.1:8000/docs
```

No Swagger, é possível testar:

- login;
- usuários;
- categorias;
- chamados;
- comentários;
- histórico.

## Comandos úteis

### Atualizar dependências do backend

```powershell
pip install -r requirements.txt
```

### Atualizar dependências do frontend

```powershell
npm install
```

### Criar nova migration

```powershell
alembic revision --autogenerate -m "descricao da alteracao"
```

### Aplicar migrations

```powershell
alembic upgrade head
```

### Ver migration atual

```powershell
alembic current
```

### Parar os servidores

Nos terminais do backend e frontend, pressione:

```text
Ctrl + C
```

## Problemas comuns

## Backend não inicia

Verifique:

- se o ambiente virtual está ativo;
- se as dependências foram instaladas;
- se o PostgreSQL está ligado;
- se a variável `DATABASE_URL` está correta;
- se as migrations foram aplicadas.

## Frontend não inicia

Verifique:

- se o Node.js está instalado;
- se o `npm install` foi executado;
- se o Angular CLI está instalado;
- se a porta `4200` está livre.

## Erro de autenticação

Verifique:

- se o token ainda é válido;
- se o backend está em execução;
- se o usuário está ativo;
- se o interceptor está registrado;
- se o relógio do sistema está correto.

## Erro de conexão com a API

Confirme que o backend está disponível em:

```text
http://127.0.0.1:8000
```

## Erro de conexão com o banco

Confirme:

- usuário;
- senha;
- porta;
- nome do banco;
- serviço do PostgreSQL;
- valor de `DATABASE_URL`.

## Variáveis sensíveis

Nunca envie para o GitHub:

- `.env`;
- senha do banco;
- `SECRET_KEY`;
- tokens;
- credenciais pessoais.

Utilize um arquivo de exemplo, como:

```text
backend/.env.example
```

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/flowdesk
SECRET_KEY=adicione-sua-chave
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

## Gitignore recomendado

```gitignore
.env
venv/
__pycache__/
node_modules/
dist/
.angular/
*.log
```

## Requisitos para produção

Antes de publicar em produção, recomenda-se configurar:

- HTTPS;
- servidor de aplicação;
- banco gerenciado;
- variáveis de ambiente seguras;
- logs;
- backup;
- domínio;
- CORS restrito;
- monitoramento;
- testes automatizados.