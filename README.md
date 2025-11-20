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

## Observabilidade & Performance 📊

A API implementa padrões de observabilidade e otimização para facilitar monitoramento, depuração e escalabilidade.

### Logging Estruturado 📝

Utiliza **Pino** para logging estruturado com níveis configuráveis:

-   **Configuração**: Defina `LOG_LEVEL` no `.env` (`trace`, `debug`, `info`, `warn`, `error`, `fatal`)
-   **Output**: Logs incluem metadados contextuais (método HTTP, path, duração, status code)
-   **Arquivos**:
    -   `src/utils/logger.ts`: instância centralizada do logger
    -   `src/api/middlewares/requestLogger.middleware.ts`: loga cada requisição (início/fim)
    -   `src/api/middlewares/errorHandler.ts`: loga erros com contexto completo

Exemplo de log:

```json
{
	"level": "info",
	"method": "GET",
	"path": "/api/users",
	"statusCode": 200,
	"durationMs": 42.5,
	"msg": "request:finish"
}
```

### Métricas Simples 📈

Middleware de métricas (`src/api/middlewares/metrics.middleware.ts`) acumula:

-   **Total de requisições**
-   **Total de erros** (status >= 500)
-   **Latência média** (em ms)

Snapshot logado automaticamente a cada 60s via logger.

### Health Check ✅

Endpoint público `GET /api/health` retorna:

```json
{
	"status": "ok",
	"uptime": 123.45,
	"timestamp": 1700000000000,
	"memory": 52428800,
	"pid": 1234,
	"host": "hostname"
}
```

### Rate Limiting 🚦

Proteção contra abuso em endpoints sensíveis (ex.: `/api/auth/login`):

-   **Implementação**: `src/api/middlewares/rateLimit.middleware.ts`
-   **Estratégia atual**: In-memory (Map) com chave composta `IP:email`
-   **Configuração**: `RATE_LIMIT_MAX_REQUESTS` e `RATE_LIMIT_WINDOW_MINUTES` no `.env`
-   **Abstração**: Interface `RateLimiter` permite futura troca para Redis sem alterar rotas
-   **Stub Redis**: `RedisRateLimiter` preparado; ative com `REDIS_URL` no `.env` (implementação real pendente)

### Otimizações de Query 🔍

-   **Selects seletivos**: Repositories (`user.repository.ts`, `project.repository.ts`) retornam apenas campos necessários
-   **Caching frontend**: React Query configurado com `staleTime` (30s) e `cacheTime` (5min) para reduzir chamadas desnecessárias
-   **Índices Prisma**: Campos filtrados/ordenados possuem índices (`User.status`, `User.role`, `Project.status`, etc.)

### Próximos Passos (Roadmap P2) 🛣️

-   Implementar cliente Redis real para rate limiting distribuído
-   Adicionar exportação de métricas (Prometheus, StatsD)
-   Integrar APM (Application Performance Monitoring) como New Relic ou Datadog
-   Implementar tracing distribuído (OpenTelemetry)

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
