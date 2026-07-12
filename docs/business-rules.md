# Regras de negócio

Este documento descreve as principais regras de negócio implementadas no FlowDesk.

## Perfis de usuário

O sistema possui três perfis de acesso:

- `ADMIN`
- `TECHNICIAN`
- `REQUESTER`

Cada perfil possui permissões diferentes dentro da aplicação.

## Administrador

O administrador pode:

- visualizar todos os chamados;
- cadastrar usuários;
- listar usuários;
- ativar e desativar usuários;
- cadastrar categorias;
- excluir categorias sem vínculos;
- assumir chamados;
- alterar o status dos chamados;
- adicionar comentários;
- visualizar históricos;
- excluir chamados.

## Técnico

O técnico pode:

- visualizar chamados disponíveis;
- visualizar chamados atribuídos a ele;
- assumir chamados sem técnico responsável;
- alterar o status dos chamados sob sua responsabilidade;
- adicionar comentários;
- visualizar o histórico dos chamados acessíveis.

O técnico não pode:

- gerenciar usuários;
- gerenciar categorias;
- excluir chamados;
- assumir chamados já atribuídos a outro técnico.

## Solicitante

O solicitante pode:

- criar chamados;
- visualizar os próprios chamados;
- adicionar comentários;
- acompanhar o andamento do atendimento.

O solicitante não pode:

- alterar o status dos chamados;
- excluir chamados;
- gerenciar usuários;
- gerenciar categorias;
- visualizar chamados de outros solicitantes.

## Usuários

## Cadastro

Todo usuário deve possuir:

- nome;
- e-mail;
- senha;
- perfil de acesso.

O e-mail deve ser único.

Quando já existe um usuário com o mesmo e-mail, o cadastro deve ser bloqueado.

## Ativação e desativação

Usuários podem estar ativos ou inativos.

Um usuário inativo:

- permanece no banco;
- não pode utilizar o sistema;
- mantém seus chamados;
- mantém seus comentários;
- mantém seus registros de histórico.

A desativação é utilizada no lugar da exclusão para preservar auditoria e integridade dos dados.

## Proteção da conta administrativa

Um administrador não pode desativar a própria conta.

Essa regra evita a perda acidental do acesso administrativo ao sistema.

## Desativação de técnicos

Quando um técnico é desativado:

- chamados com status `OPEN` ficam sem técnico;
- chamados com status `IN_PROGRESS` ficam sem técnico;
- chamados com status `WAITING_USER` ficam sem técnico;
- chamados com status `RESOLVED` preservam o técnico anterior;
- chamados com status `CLOSED` preservam o técnico anterior.

Essa regra permite que atendimentos ainda em andamento sejam redistribuídos.

## Categorias

## Cadastro

Apenas administradores podem cadastrar categorias.

Toda categoria deve possuir:

- nome;
- descrição.

O nome da categoria deve ser único.

## Uso em chamados

Um chamado só pode ser criado com uma categoria existente e ativa.

Categorias inativas não podem ser utilizadas em novos chamados.

## Exclusão

Uma categoria pode ser excluída somente quando não possui chamados vinculados.

Quando existe vínculo com algum chamado, a API retorna conflito e impede a exclusão.

## Chamados

## Criação

Todo chamado deve possuir:

- título;
- descrição;
- prioridade;
- categoria.

O chamado é criado com:

```text
status = OPEN
```

O usuário autenticado é registrado como solicitante.

A criação do chamado também gera um registro no histórico.

## Prioridades

As prioridades disponíveis são:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

## Status

Os status disponíveis são:

- `OPEN`
- `IN_PROGRESS`
- `WAITING_USER`
- `RESOLVED`
- `CLOSED`

### Significado dos status

#### OPEN

Chamado aberto e aguardando atendimento.

#### IN_PROGRESS

Chamado em atendimento.

#### WAITING_USER

Chamado aguardando retorno do solicitante.

#### RESOLVED

Problema resolvido.

#### CLOSED

Chamado encerrado.

## Visualização

### Administrador

Pode visualizar todos os chamados.

### Técnico

Pode visualizar:

- chamados sem técnico;
- chamados atribuídos a ele.

### Solicitante

Pode visualizar apenas os próprios chamados.

## Atribuição

Apenas técnicos e administradores podem assumir chamados.

Um chamado só pode ser assumido quando:

- ainda não possui técnico;
- ou já está atribuído ao próprio usuário autenticado.

Quando o chamado já pertence a outro técnico, a atribuição é bloqueada.

Toda atribuição gera um registro no histórico.

## Alteração de status

Solicitantes não podem alterar o status de chamados.

Técnicos só podem alterar o status de chamados atribuídos a eles.

Administradores podem alterar o status de qualquer chamado.

Toda alteração de status registra:

- valor anterior;
- novo valor;
- usuário responsável;
- data e hora.

## Comentários

Usuários com acesso ao chamado podem adicionar comentários.

Cada comentário registra:

- conteúdo;
- chamado;
- autor;
- data e hora.

A criação de comentário também gera um registro no histórico.

## Histórico

O histórico registra as principais ações realizadas no chamado.

Ações possíveis incluem:

- `TICKET_CREATED`
- `TICKET_ASSIGNED`
- `STATUS_CHANGED`
- `COMMENT_ADDED`

Cada registro pode conter:

- usuário responsável;
- valor anterior;
- valor novo;
- data e hora.

## Exclusão de chamados

Apenas administradores podem excluir chamados.

A exclusão é realizada na seguinte ordem:

```text
Comentários
   ↓
Histórico
   ↓
Chamado
```

Essa ordem evita conflitos de chave estrangeira.

Após a exclusão, o chamado deixa de aparecer nas listagens e não pode mais ser acessado.

## Sessão e autenticação

Rotas privadas exigem um token JWT válido.

Quando o token está inválido ou expirado:

- a API retorna `401 Unauthorized`;
- o frontend remove o token;
- o usuário é redirecionado para o login.

## Respostas de erro

### 401 Unauthorized

Utilizado quando:

- o token está ausente;
- o token é inválido;
- o token expirou;
- o usuário está inativo.

### 403 Forbidden

Utilizado quando:

- o usuário está autenticado;
- mas não possui permissão para executar a ação.

### 404 Not Found

Utilizado quando:

- usuário não existe;
- categoria não existe;
- chamado não existe.

### 409 Conflict

Utilizado quando:

- já existe usuário com o e-mail informado;
- já existe categoria com o nome informado;
- categoria possui chamados vinculados;
- chamado já está atribuído a outro técnico;
- administrador tenta desativar a própria conta.

### 422 Unprocessable Entity

Utilizado quando os dados enviados não atendem ao formato esperado pela API.

## Regras de integridade

- usuários com histórico não são excluídos;
- técnicos inativos deixam chamados ativos sem responsável;
- chamados concluídos preservam o técnico anterior;
- categorias em uso não podem ser excluídas;
- chamados excluem dados dependentes antes do registro principal;
- e-mails de usuários devem ser únicos;
- nomes de categorias devem ser únicos.