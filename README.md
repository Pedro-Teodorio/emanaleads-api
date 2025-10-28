# Emanaleads API 🚀

## Descrição 📖

A **Emanaleads API** é uma aplicação backend desenvolvida para gerenciar autenticação, usuários e outras funcionalidades relacionadas ao sistema Emanaleads. Esta API foi construída utilizando Node.js, TypeScript e Prisma ORM, e é executada em um ambiente Docker para facilitar o desenvolvimento e a implantação.

## Estrutura do Projeto 🗂️

A estrutura do projeto está organizada da seguinte forma:

```
.
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── api/
│   │   ├── routes.ts
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   └── user/
│   ├── config/
│   └── utils/
└── ai/
```

## Tecnologias Utilizadas 🛠️

-   **Node.js**: Ambiente de execução JavaScript.
-   **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
-   **Prisma ORM**: Ferramenta para manipulação de banco de dados.
-   **Docker**: Plataforma para desenvolvimento e execução de aplicações em contêineres.
-   **Express.js**: Framework web para Node.js.

## Configuração do Ambiente ⚙️

### Variáveis de Ambiente 🌐

As variáveis de ambiente necessárias para executar a aplicação estão listadas no arquivo `env.example`. Certifique-se de criar um arquivo `.env` na raiz do projeto e preencher as variáveis de acordo com sua configuração.

### Instalação 📦

1. Clone o repositório:
    ```bash
    git clone https://github.com/Pedro-Teodorio/emanaleads-api.git
    ```
2. Navegue até o diretório do projeto:
    ```bash
    cd emanaleads-api
    ```
3. Instale as dependências utilizando o PNPM:
    ```bash
    pnpm install
    ```

### Execução ▶️

#### Desenvolvimento 🧑‍💻

Para rodar a aplicação em modo de desenvolvimento:

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`.

#### Produção 🚀

Para rodar a aplicação em modo de produção:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Scripts Disponíveis 📝

-   `pnpm dev`: Inicia a aplicação em modo de desenvolvimento.
-   `pnpm build`: Compila o código TypeScript para JavaScript.
-   `pnpm start`: Inicia a aplicação em modo de produção.

## Estrutura de Pastas 📂

-   **src/api/modules**: Contém os módulos principais da aplicação, como autenticação e gerenciamento de usuários.
-   **src/config**: Configurações da aplicação, como variáveis de ambiente e conexão com o banco de dados.
-   **src/utils**: Utilitários e classes auxiliares.
-   **prisma**: Arquivos relacionados ao Prisma ORM, incluindo o schema e as migrações.

## Migrações do Prisma 🗃️

Para gerenciar o banco de dados utilizando o Prisma, siga os passos abaixo:

### Executar Migrações

1. Certifique-se de que as variáveis de ambiente estão configuradas corretamente no arquivo `.env`.
2. Para aplicar as migrações ao banco de dados, execute o comando:
    ```bash
    pnpm prisma migrate dev
    ```
    Este comando aplicará as migrações pendentes e atualizará o banco de dados de desenvolvimento.

### Criar Nova Migração

Caso precise criar uma nova migração após alterar o schema do Prisma:

```bash
pnpm prisma migrate dev --name nome-da-migracao
```

Substitua `nome-da-migracao` por um nome descritivo para a alteração.

### Visualizar o Banco de Dados

Para abrir o Prisma Studio e visualizar os dados no banco:

```bash
pnpm prisma studio
```

## Contribuição 🤝

1. Faça um fork do projeto.
2. Crie uma nova branch:
    ```bash
    git checkout -b minha-feature
    ```
3. Faça suas alterações e commit:
    ```bash
    git commit -m "Minha nova feature"
    ```
4. Envie suas alterações:
    ```bash
    git push origin minha-feature
    ```
5. Abra um Pull Request.

## Licença 📜

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
