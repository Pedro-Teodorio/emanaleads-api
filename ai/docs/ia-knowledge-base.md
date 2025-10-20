
# Base de Conhecimento da IA para o Projeto emanaleads-api

## 1. Visão Geral

O `emanaleads-api` é um projeto de backend construído com **Node.js**, **Express** e **TypeScript**. Ele serve como uma API RESTful para gerenciar usuários e posts. A aplicação utiliza **Prisma** como ORM para interagir com um banco de dados **PostgreSQL** e **Zod** para validação de schemas.

### Tecnologias Principais
- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express**: Framework web para construção da API.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Prisma**: ORM para interação com o banco de dados.
- **PostgreSQL**: Banco de dados relacional.
- **Zod**: Biblioteca para validação de schemas.
- **Docker**: Utilizado para orquestrar o ambiente de desenvolvimento, especificamente o banco de dados PostgreSQL.

## 2. Estrutura do Projeto

A estrutura de pastas é modular e organizada, separando as responsabilidades em diferentes camadas.

```
/
├── .env                  # Arquivo de variáveis de ambiente (não versionado)
├── .gitignore            # Arquivos e pastas ignorados pelo Git
├── docker-compose.yml    # Define o serviço do banco de dados PostgreSQL
├── package.json          # Metadados do projeto e dependências
├── pnpm-lock.yaml        # Lockfile do gerenciador de pacotes pnpm
├── tsconfig.json         # Configurações do compilador TypeScript
├── prisma/
│   └── schema.prisma     # Definição do schema do banco de dados para o Prisma
└── src/
    ├── app.ts            # Configuração principal da aplicação Express (middlewares, rotas)
    ├── server.ts         # Ponto de entrada da aplicação (inicializa o servidor)
    ├── api/
    │   ├── routes.ts       # Roteador principal da API
    │   └── middlewares/
    │       ├── errorHandler.ts     # Middleware para tratamento de erros
    │       └── validateRequest.ts  # Middleware para validação de requisições com Zod
    │   └── modules/
    │       └── user/
    │           ├── user.controller.ts  # Camada de controle (recebe requisições)
    │           ├── user.routes.ts      # Rotas específicas do módulo de usuário
    │           ├── user.service.ts     # Camada de serviço (lógica de negócio)
    │           └── user.validation.ts  # Schemas de validação Zod para o módulo
    ├── config/
    │   ├── env.ts          # Carrega e valida as variáveis de ambiente
    │   └── prisma.ts       # Inicializa e exporta o cliente Prisma
    └── utils/
        └── ApiError.ts     # Classe de erro customizada para a API
```

### Descrição dos Arquivos e Pastas

- **`prisma/schema.prisma`**: Define os modelos de dados (`User`, `Post`), o provedor do banco de dados (PostgreSQL) e o gerador do cliente Prisma.
- **`src/app.ts`**: Cria a instância do Express, aplica middlewares globais como `cors` e `express.json`, anexa as rotas principais da API em `/api` e, por fim, adiciona o middleware de tratamento de erros.
- **`src/server.ts`**: Importa a instância do `app` e as variáveis de ambiente (`env`) para iniciar o servidor na porta configurada.
- **`src/api/routes.ts`**: Agrega todas as rotas dos módulos. Atualmente, apenas as rotas de usuário (`userRoutes`) estão registradas sob o prefixo `/users`.
- **`src/api/middlewares/`**:
    - **`errorHandler.ts`**: Captura erros lançados na aplicação. Se for uma instância de `ApiError`, retorna o status e a mensagem customizados. Caso contrário, retorna um erro 500 genérico.
    - **`validateRequest.ts`**: Middleware de alta ordem que recebe um schema Zod e valida o `body`, `query` e `params` da requisição. Retorna um erro 400 com os detalhes da validação em caso de falha.
- **`src/api/modules/user/`**: Módulo responsável pela funcionalidade de usuários.
    - **`user.controller.ts`**: Recebe as requisições HTTP, chama o serviço correspondente e envia a resposta. O método `create` remove a senha do objeto de usuário antes de enviá-lo na resposta.
    - **`user.routes.ts`**: Define os endpoints do módulo. A rota `POST /` é protegida pelo middleware `validateRequest` que utiliza o `createUserSchema`.
    - **`user.service.ts`**: Contém a lógica de negócio. O método `createUser` verifica se o e-mail já existe (lançando um `ApiError` se for o caso) e cria um novo usuário no banco.
    - **`user.validation.ts`**: Define os schemas Zod para validação das entradas do módulo de usuário.
- **`src/config/`**:
    - **`env.ts`**: Utiliza o Zod para validar as variáveis de ambiente (`NODE_ENV`, `PORT`, `DATABASE_URL`) e as exporta em um objeto tipado `env`.
    - **`prisma.ts`**: Cria e exporta uma instância única do `PrismaClient`.
- **`src/utils/ApiError.ts`**: Classe de erro personalizada que permite a criação de erros com um `statusCode` HTTP específico.

## 3. Banco de Dados

- **Tecnologia**: PostgreSQL
- **ORM**: Prisma

O schema do banco de dados é definido no arquivo `prisma/schema.prisma`.

### Modelos

1.  **`User`**
    - `id`: `String` (UUID, Chave Primária)
    - `email`: `String` (Único)
    - `name`: `String`
    - `password`: `String`
    - `createdAt`: `DateTime`
    - `updatedAt`: `DateTime`
    - **Relacionamento**: Um usuário pode ter muitos `Post`s.

2.  **`Post`**
    - `id`: `String` (UUID, Chave Primária)
    - `title`: `String`
    - `content`: `String` (Opcional)
    - `published`: `Boolean` (Default: `false`)
    - `createdAt`: `DateTime`
    - `updatedAt`: `DateTime`
    - **Relacionamento**: Um post pertence a um `User` (através de `authorId`).

## 4. API

A API é estruturada em módulos, com um ponto de entrada em `/api`.

### Módulo de Usuário (`/api/users`)

- **`POST /`**: Cria um novo usuário.
    - **Validação**: O corpo da requisição é validado pelo `createUserSchema`.
        - `name`: Mínimo de 3 caracteres.
        - `email`: Deve ser um e-mail válido.
        - `password`: Mínimo de 6 caracteres.
    - **Resposta de Sucesso (201)**: Retorna o objeto do usuário criado sem o campo `password`.
    - **Respostas de Erro**:
        - **400 (Bad Request)**: Se a validação do corpo da requisição falhar.
        - **409 (Conflict)**: Se o e-mail fornecido já estiver em uso.
        - **500 (Internal Server Error)**: Para erros inesperados.

## 5. Configuração

As configurações são gerenciadas na pasta `src/config`.

- **Variáveis de Ambiente**: O arquivo `.env` é usado para definir variáveis de ambiente em desenvolvimento. O arquivo `src/config/env.ts` é responsável por carregar, validar e tipar essas variáveis usando Zod.
- **Banco de Dados**: A conexão com o banco de dados é gerenciada pelo Prisma. A URL de conexão é fornecida pela variável de ambiente `DATABASE_URL`.

## 6. Executando o Projeto

1.  **Clone o repositório.**
2.  **Crie o arquivo `.env`** na raiz do projeto, com base no `.env.example` (se existir) ou definindo as seguintes variáveis:
    ```
    DATABASE_URL="postgresql://emanaleads:emanaleads123@localhost:5432/emanaleads?schema=public"
    ```
3.  **Instale as dependências** com o comando:
    ```bash
    pnpm install
    ```
4.  **Inicie o banco de dados** com Docker:
    ```bash
    docker-compose up -d
    ```
5.  **Execute as migrações do Prisma** (se houver):
    ```bash
    npx prisma migrate dev
    ```
6.  **Inicie o servidor de desenvolvimento**:
    ```bash
    pnpm dev
    ```
O servidor estará rodando em `http://localhost:3000` (ou na porta definida em `.env`).
