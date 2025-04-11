# Sistema de Biblioteca Universitária - BIBLIOTECH API 2.0

Um sistema administrativo back-end, fechado (apenas administradores) e objetivo, desenvolvido para gerenciar uma biblioteca universitária. Construído com NestJS, Node.js, Express e TypeScript, seguindo boas práticas de arquitetura e organização de código.

## Funcionalidades

### Funcionalidades Principais

- Gerenciamento de Autores, Livros, Estudantes e Empréstimos (criar, visualizar, atualizar, deletar)
- Empréstimo e devolução de livros com controle de status (ativo/inativo)
- Verificação de disponibilidade de livros antes de realizar o empréstimo
- Histórico de empréstimos e devoluções por estudante
- Regras de negócio aplicadas, como prazos de devolução
- Filtros de busca por título, gênero, ISBN, disponibilidade, ano de publicação, etc.
- Paginação e ordenação por título ou ano de publicação nos endpoints de listagem

### Funcionalidades Técnicas

- Manipulação de banco de dados com PrismaORM e MySQL
- Autenticação com JWT utilizando passport strategy
- Seed para criação do usuário administrador padrão
- Validação e transformação de dados com DTOs (utilizando class-validator e class-transformer)
- Tratamento de erros centralizado no NestJS
- Documentação interativa da API com Swagger
- Testes automatizados com Jest (serviços e controllers)
- Limite de taxa de requisições
- Estrutura modular

### Novidades EXCLUSIVAS da versão 2.0

- Autenticação baseada em JWT utilizando passport strategy
- Criptografia de Senha (Apenas do ADMIN) no banco de dados
- Mais campos detalhados em todas as tabelas (Ex: Adicionado ISBN para os livros)
- Buscas páginadas e com novos filtros
- Proteção contra ataques de força bruta (Limite de taxa de requisições por minuto)
- Testes unitários automatizados de todos as funções em serviços e controllers
- Documentação completa da API com Swagger

## Stack Tecnológica

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL com Prisma

## Pré-requisitos

- Node.js (v18.18.1 ou superior)
- MySQL (Server and Workbench)

## Instalação

1. Clone o repositório:

```bash
git clone <repository-url>
cd bibliotech-api
```

2. Instale as dependências:

```bash
npm install
```

3. Configuração do Banco de Dados: Certifique-se de que você tenha um banco de dados MySQL criado. Crie o arquivo .env com suas credenciais de banco de dados seguindo o seguinte formato:

```bash
cp .env.example .env
```

```bash
DATABASE_URL="mysql://<usuário>:<senha>@<host>:<porta>/<nome_do_database>"
```

4. Execute as migrações do prisma para criar as tabelas:

```bash
npx prisma migrate deploy
```

5. Inicie a aplicação:

```bash
npm run dev
```

## Configuração de Ambiente

Certifique-se de configurar seu .env com estas variáveis de ambiente principais:

```env
# APLICAÇÃO
PORT=3000

# BANCO DE DADOS
DATABASE_URL="YOUR DATABASE URL..."

# AUTENTICAÇÃO
SEED_USER_NAME="YOUR_SYSTEM_USERNAME..."
SEED_USER_EMAIL="YOUR_SYSTEM_USER_EMAIL..."
SEED_USER_PASSWORD="YOUR_SYSTEM_USER_PASSWORD..."
JWT_SECRET_KEY="YOUR_SECRET_KEY"
EXPIRES_IN='EXPIRES_TIME'

# CORS Configuração Examplo
# Defina seus domínios permitidos para acesso CORS. Exemplo:
CORS_ORIGIN="http://localhost:3003,http://example.com"
# Defina os métodos HTTP permitidos para CORS. Exemplo:
CORS_METHODS="GET,POST,PUT,DELETE,PATCH,OPTIONS"
# Defina os cabeçalhos permitidos para CORS. Exemplo:
CORS_ALLOWED_HEADERS="Content-Type,Authorization,Accept"
# Defina os cabeçalhos expostos para CORS. Exemplo:
CORS_EXPOSED_HEADERS="Content-Range,X-Content-Range"
# Defina se o CORS permite credenciais (cookies, etc.). Exemplo:
CORS_CREDENTIALS=true
# Defina o tempo de cache do CORS (em segundos). Exemplo:
CORS_MAX_AGE=3600

# API Rate Limit
THROTTLE_TTL=10000
THROTTLE_LIMIT=60
```

## Documentação da API

Para acessar a documentação interativa da BibliotechAPI via Swagger clique [aqui](https://bibliotech-api-swagger.vercel.app/)

### Endpoints Principais

#### Autores

- `POST /authors` - Criar um autor
- `GET /authors` - Consultar todos os autores
- `GET /authors/:authorId` - Consultar autor detalhadamente
- `DELETE /authors/:authorId` - Excluir um autor

#### Livros

- `POST /books` - Criar livro
- `GET /books` - Consultar todos os livros
- `GET /books/:bookId` - Consultar livro detalhadamente
- `PATCH /books/:bookId` - Atualizar um livro existente
- `DELETE /books/:bookId` - Excluir um livro

#### Alunos

- `POST /students` - Cadastrar aluno na biblioteca
- `GET /students` - Consultar todos os alunos
- `GET /students/:studentId` - Consultar aluno detalhadamente
- `PATCH /students/:studentId` - Atualizar um aluno existente
- `DELETE /students/:studentId` - Excluir um aluno

#### Empréstimos

- `POST /loans` - Registrar um empréstimo
- `GET /loans` - Consultar todos os empréstimos (?available=true/false para consultar empréstimos ativos/inativos)
- `GET /loans/:loanId` - Consultar empréstimo detalhadamente
- `PATCH /loans/:loanId/return` - Realizar a devolução do empréstimo (ao mesmo tempo libera o livro e estudante para fazer um novo empréstimo)
- `DELETE /loans/:loanId` - Excluir um empréstimo

## Testes

### Testes Unitários

```bash
npm run test
```

## Arquitetura

### Esquema do Banco de Dados

#### Tabela users (admin seed)

- id (int)
- username
- email
- password
- createdAt
- updatedAt

#### Tabela authors

- id (int)
- name
- birthYear
- nationality
- createdAt
- updatedAt

#### Tabela books

- id (int)
- title
- genre
- isbn
- yearPublished
- authorId (Foreign Key)
- isAvailable (padrão true)
- createdAt
- updatedAt

#### Tabela students

- id (int)
- name
- email (único)
- phone
- academicRegistration (único)
- createdAt
- updatedAt

#### Tabela loans

- id (int)
- studentId (Foreign Key)
- bookId (Foreign Key)
- loanDate
- dueDate
- isActive
- returnDate (padrão null)
- createdAt
- updatedAt
