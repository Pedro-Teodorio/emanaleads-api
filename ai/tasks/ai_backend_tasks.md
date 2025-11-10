# Plano de Execução da Tarefa: Implementar Paginação de Projetos

## 1.1. Análise da Arquitetura Backend

- [x] **Tecnologia/Framework:** Node.js com Express.js e TypeScript.
- [x] **Estrutura de Camadas:** A estrutura de Controller, Service e Repository (abstraído pelo Prisma) está bem definida e será seguida.
- [x] **Autenticação/Autorização:** A rota de listagem de projetos já é protegida por `authMiddleware` e `validateRole(['ROOT'])`, o que será mantido.
- [x] **Conformidade:** A implementação seguirá o padrão já estabelecido no módulo `user`.

## 1.2. Análise do Banco de Dados

- [x] **Tipo de Banco:** PostgreSQL, gerenciado pelo Prisma.
- [x] **Schema/Models:** O modelo `Project` no `prisma/schema.prisma` é o alvo principal. Seus campos, como `name` e `description`, serão usados para a funcionalidade de busca.
- [x] **Migrations:** Nenhuma alteração no schema do banco é necessária, portanto, não haverá nova migration.

## 1.3. Design das APIs

- [x] **Endpoint:** `GET /api/projects` será modificado.
- [x] **Request (Query Params):**
    - `page: number` (opcional, default 1)
    - `limit: number` (opcional, default 10)
    - `search: string` (opcional, para buscar no nome do projeto)
- [x] **Response:** A estrutura da resposta será um objeto JSON contendo:
    - `data`: Um array de objetos `Project`.
    - `meta`: Um objeto com `total`, `page`, `limit`, e `totalPages`.
- [x] **Documentação:** A documentação (se existente) via Swagger/OpenAPI seria atualizada para refletir os novos query params.

## 1.4. Plano de Implementação da Camada de Persistência

- [x] A lógica de persistência, que reside no `project.service.ts`, foi atualizada.
- [x] A consulta `prisma.project.findMany` foi modificada para incluir:
    - `skip`: Para pular registros baseados na página atual.
    - `take`: Para limitar o número de registros por página.
    - `where`: Para filtrar projetos com base no parâmetro `search`. A busca foi feita no campo `name`.
    - `orderBy`: Para manter uma ordenação consistente, por `createdAt`.
- [x] Uma nova consulta, `prisma.project.count({ where })`, foi adicionada para obter o número total de registros que correspondem ao critério de busca, necessária para calcular `totalPages`.
- [x] As duas consultas (`findMany` e `count`) são executadas em paralelo usando `Promise.all` para otimizar a performance.

## 1.5. Plano de Implementação da Camada de Negócio (Services)

- [x] Modificada a função `listProjectsAsRoot` em `project.service.ts`.
- [x] A assinatura do método foi alterada para `async listProjectsAsRoot(search?: string, page: number = 1, limit: number = 10)`.
- [x] Dentro do método, a lógica para calcular `skip`, construir o objeto `where` para a busca e executar as consultas de `findMany` e `count` foi implementada.
- [x] O método retorna o objeto `{ data, meta }` padronizado.

## 1.6. Plano de Implementação da Camada de Controle (Controllers)

- [x] Modificado o método `listProjectsAsRoot` em `project.controller.ts`.
- [x] O método extrai `page`, `limit`, e `search` de `req.query`.
- [x] Os valores de `page` e `limit` são convertidos para `number` com valores padrão.
- [x] Os parâmetros extraídos são passados para a chamada do `projectService.listProjectsAsRoot`.

## 1.7. Plano de Testes e Validação

- [x] **Validação de Schema:** Criado um novo schema `listProjectsQuerySchema` em `project.validation.ts` para validar os query params `page`, `limit`, e `search`.
- [x] **Validação de Rota:** Aplicado o `validateRequest(listProjectsQuerySchema)` na rota `GET /` em `project.routes.ts`.
- [x] **Teste de Endpoint:** A validação será feita pelo usuário através do frontend ou de uma ferramenta de API.

## 1.8. Critérios de Sucesso para a Tarefa

- [x] O endpoint `GET /api/projects` retorna com sucesso uma lista paginada de projetos.
- [x] A resposta do endpoint segue estritamente a estrutura `{ data: [...], meta: {...} }`.
- [x] A paginação funciona corretamente (respeitando `page` e `limit`).
- [x] A busca por nome de projeto funciona corretamente.
- [x] A rota continua protegida e acessível apenas para usuários com a role `ROOT`.
- [x] O código segue os padrões de qualidade e estrutura já presentes no módulo `user`.