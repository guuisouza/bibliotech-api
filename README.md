# Sistema de Biblioteca Universitária

Um simples sistema administrativo (fechado) back-end para a biblioteca da FATEC Franca construído com NestJS, Node, Express e TypeScript para a disciplina de Desenvolvimento Web III do curso de Desenvolvimento de Software Multiplataforma (3 Semestre)

## Funcionalidades

### Funcionalidades Principais

- Gerenciamento de Autores/Livros, Estudantes e Empréstimos (criar, visualizar, atualizar, deletar)
- Processamento de Empréstimos (ativo/inativo)
- Gerenciamento de livros disponíveis e emprestados
- Histórico de empréstimos e devoluções
- Validação de regras para prazos de devolução

### Funcionalidades Técnicas

- Manipulação de banco de dados com Prisma e MySQL
- Uso do ORM Prisma para consultas eficientes
- Padrão de desenvolvimento baseado em POO (Solicitado pelo professor)
- Validação de dados com DTO
- Tratamento de erros centralizado

### Funcionalidades Futuras

- Autenticação baseada em JWT
- Criptografia de Senha (Apenas do ADMIN)
- Registro detalhado de operações no sistema
- Limitação de Taxa de Requisições
- Implementação de um mecanismo de notificação via email para alunos em caso de prazo de devolução ultrapassado
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

Variáveis de ambiente principais:

```env
# Aplicação
PORT=3000

# Banco de Dados
DATABASE_URL="mysql://<usuário>:<senha>@<host>:<porta>/<nome_do_database>"
```

## Documentação da API

A documentação da API estará disponível via Swagger UI em futuras versões

### Endpoints Principais - USE O POSTMAN/INSOMNIA PARA TESTAR

#### Autores

- `POST /authors` - Criar um autor
- `GET /authors` - Consultar todos os autores
- `GET /authors/:authorId` - Consultar autor detalhadamente
- `DELETE /authors/:authorId` - Excluir um autor

#### Livros

- `POST /books` - Criar livro
- `GET /books` - Consultar todos os livros
- `GET /books?available=true` - Consultar apenas os livros diponiveis
- `GET /books?available=false` - Consultar apenas os livros emprestados
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
- `PATCH /loans/:loanId/return` - Realizar a devolução do empréstimo
- `DELETE /loans/:loanId` - Excluir um empréstimo

## Testes

Será implementado no futuro

## Arquitetura

### Esquema do Banco de Dados

#### Tabela authors

- id (int)
- name
- createdAt
- updatedAt

#### Tabela books

- id (int)
- title
- authorId (Foreign Key)
- available (padrão true)
- createdAt
- updatedAt

#### Tabela students

- id (int)
- name
- email (único)
- phone
- academicRegistration
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
