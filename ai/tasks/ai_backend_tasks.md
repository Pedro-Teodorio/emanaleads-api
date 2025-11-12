# Plano de Execução da Tarefa: Auditoria de Código Backend

## 1.1. Análise da Arquitetura Backend

- [ ] Identificar a tecnologia/framework backend em uso (Express.js com TypeScript).
- [ ] Analisar estrutura de camadas existente (Controller, Service, e Prisma como camada de persistência).
- [ ] Verificar padrões de autenticação e autorização implementados (JWT, middlewares de RBAC).
- [ ] Validar a estrutura geral do projeto e a separação de módulos.

## 1.2. Análise do Banco de Dados (Prisma)

- [ ] Analisar o arquivo `prisma/schema.prisma` em detalhes.
- [ ] Verificar a corretude dos tipos de dados e o uso de atributos (`@id`, `@default`, `@unique`, `@relation`).
- [ ] Avaliar a nomenclatura de modelos e campos (consistência).
- [ ] Identificar a necessidade de índices para otimizar consultas comuns (ex: em colunas de status, chaves estrangeiras).
- [ ] Analisar as migrações existentes para entender a evolução do schema.

## 1.3. Análise das APIs e Endpoints

- [ ] Mapear todos os endpoints a partir de `src/api/routes.ts` e dos arquivos de rotas modulares.
- [ ] Verificar a consistência do design RESTful (uso de verbos HTTP, nomenclatura de recursos no plural).
- [ ] Analisar a estrutura de request/response, incluindo o uso de códigos de status HTTP.
- [ ] Avaliar a paginação e os filtros (consistência na implementação entre os módulos).

## 1.4. Análise das Validações e Regras de Negócio

- [ ] Revisar todos os schemas de validação Zod em `*.validation.ts` para cada módulo.
- [ ] Verificar se as validações são suficientemente rigorosas e cobrem os casos de borda.
- [ ] Analisar a lógica de negócio na camada de serviço (`*.service.ts`).
- [ ] Checar o tratamento de erros e o uso da classe `ApiError`.
- [ ] Validar a implementação das regras de RBAC nos middlewares e serviços.

## 1.5. Análise de Boas Práticas (Clean Code, SOLID, KISS)

- [ ] **Clean Code:** Avaliar a legibilidade, uso de nomes significativos, tamanho e complexidade de funções/métodos.
- [ ] **SOLID:**
    - **SRP:** Verificar se controllers, services e outros componentes têm responsabilidades únicas e bem definidas.
    - **OCP/DIP:** Analisar se o código favorece a composição e o uso de abstrações em vez de acoplamento direto.
- [ ] **KISS:** Identificar se existem complexidades desnecessárias que poderiam ser simplificadas.
- [ ] Avaliar o uso de `async/await` e o tratamento de promises.

## 1.6. Plano de Criação do Relatório

- [ ] Estruturar o arquivo `CODE_REVIEW.md` com seções claras para cada área analisada.
- [ ] Para cada seção, listar os pontos positivos (boas práticas encontradas).
- [ ] Para cada seção, listar os pontos de melhoria com sugestões claras e exemplos de código, se aplicável.
- [ ] Concluir o relatório com um resumo geral do estado do projeto e as principais recomendações.

## 1.7. Critérios de Sucesso para a Tarefa

- [ ] A análise cobre todos os pontos definidos no plano.
- [ ] O arquivo `CODE_REVIEW.md` é criado na raiz do projeto `emanaleads-api`.
- [ ] O relatório é claro, objetivo e fornece insights acionáveis para melhorar a qualidade do código.