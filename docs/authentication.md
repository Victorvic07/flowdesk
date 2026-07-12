# Autenticação e autorização

O FlowDesk utiliza autenticação baseada em JWT para controlar o acesso às áreas privadas do sistema.

## Visão geral

```text
Usuário informa e-mail e senha
        ↓
Frontend envia POST /auth/login
        ↓
Backend valida as credenciais
        ↓
API gera um token JWT
        ↓
Frontend armazena o token
        ↓
Interceptor adiciona o token às requisições
        ↓
Backend valida identidade e permissões
```

## Login

O usuário realiza login informando e-mail e senha.

### Endpoint

```http
POST /auth/login
```

### Exemplo de requisição

```json
{
  "email": "usuario@flowdesk.com",
  "password": "Senha123"
}
```

Quando as credenciais são válidas, a API retorna um token JWT.

## Armazenamento do token

O frontend armazena o token no `localStorage` com a chave:

```text
flowdesk_token
```

Esse token é utilizado para autenticar as requisições feitas para a API.

## Cabeçalho de autenticação

O token é enviado no cabeçalho HTTP:

```http
Authorization: Bearer TOKEN_JWT
```

## Interceptor HTTP

O frontend utiliza um interceptor para centralizar o tratamento de autenticação.

### Responsabilidades

- adicionar o token JWT automaticamente;
- enviar o cabeçalho `Authorization`;
- detectar respostas `401 Unauthorized`;
- remover tokens inválidos ou expirados;
- redirecionar o usuário para a tela de login.

## Guard de autenticação

O Angular utiliza um guard para proteger as rotas privadas.

### Rotas protegidas

```text
/dashboard
/tickets
/tickets/:id
/new-ticket
/categories
/users
```

Quando não existe token salvo, o usuário é redirecionado para a página de login.

## Sessão expirada

O token possui tempo de expiração definido no backend.

Exemplo de configuração:

```env
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

Quando o token expira:

1. a API retorna `401 Unauthorized`;
2. o interceptor remove o token;
3. o usuário é redirecionado para o login;
4. uma nova autenticação é necessária.

## Tratamento no backend

O backend valida o token antes de liberar acesso às rotas protegidas.

A validação verifica:

- assinatura do token;
- algoritmo utilizado;
- data de expiração;
- identificador do usuário;
- existência do usuário;
- status ativo da conta.

Quando o token é inválido ou expirado, a API retorna:

```http
401 Unauthorized
```

## Hash de senha

As senhas não são armazenadas em texto puro.

O backend gera um hash antes de salvar a senha no banco de dados.

Isso reduz o risco de exposição em caso de acesso indevido ao banco.

## Perfis de acesso

O sistema possui três perfis.

## Administrador

Identificador:

```text
ADMIN
```

Permissões principais:

- visualizar todos os chamados;
- cadastrar usuários;
- listar usuários;
- ativar e desativar usuários;
- cadastrar categorias;
- excluir categorias sem vínculos;
- assumir chamados;
- alterar status;
- adicionar comentários;
- excluir chamados.

## Técnico

Identificador:

```text
TECHNICIAN
```

Permissões principais:

- visualizar chamados disponíveis;
- visualizar chamados atribuídos;
- assumir chamados;
- alterar status dos chamados sob sua responsabilidade;
- adicionar comentários;
- consultar histórico.

## Solicitante

Identificador:

```text
REQUESTER
```

Permissões principais:

- criar chamados;
- visualizar os próprios chamados;
- adicionar comentários;
- acompanhar o andamento.

Restrições principais:

- não pode alterar status;
- não pode excluir chamados;
- não pode gerenciar usuários;
- não pode gerenciar categorias.

## Usuários inativos

Usuários com:

```json
{
  "is_active": false
}
```

não podem utilizar o sistema.

A conta permanece armazenada para preservar:

- chamados abertos;
- chamados concluídos;
- comentários;
- histórico;
- auditoria.

## Proteção contra autodesativação

Um administrador não pode desativar a própria conta.

Essa regra evita que o sistema fique sem acesso administrativo por erro operacional.

## Desativação de técnicos

Ao desativar um técnico:

- chamados abertos ficam sem técnico;
- chamados em andamento ficam sem técnico;
- chamados aguardando usuário ficam sem técnico;
- chamados resolvidos preservam o técnico anterior;
- chamados fechados preservam o técnico anterior.

## Segurança das rotas

As rotas protegidas utilizam dependências de autenticação no FastAPI.

Exemplo conceitual:

```python
current_user = Depends(get_current_user)
```

Após autenticar o usuário, cada rota verifica o perfil necessário para executar a ação.

## Respostas de erro comuns

### 401 Unauthorized

Usado quando:

- o token não foi enviado;
- o token é inválido;
- o token expirou;
- o usuário não existe;
- o usuário está inativo.

### 403 Forbidden

Usado quando:

- o usuário está autenticado;
- mas não possui permissão para executar a ação.

### 409 Conflict

Usado quando:

- um administrador tenta desativar a própria conta;
- existe conflito com uma regra de negócio.

## Boas práticas adotadas

- senhas armazenadas com hash;
- autenticação baseada em JWT;
- expiração de token;
- proteção de rotas no frontend;
- interceptor HTTP;
- autorização por perfil;
- bloqueio de usuários inativos;
- preservação de histórico;
- tratamento centralizado de sessão expirada.

## Melhorias futuras

- refresh token;
- recuperação de senha;
- autenticação em dois fatores;
- encerramento de todas as sessões;
- rotação de chave JWT;
- cookies HTTP-only;
- limitação de tentativas de login;
- registro de tentativas suspeitas;
- expiração configurável por ambiente.