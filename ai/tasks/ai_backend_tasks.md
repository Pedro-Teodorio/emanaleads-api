# Plano de Execução da Tarefa: Filtro de Status em Projetos

## 1.1. Análise da Arquitetura Backend

- [x] Identificar a tecnologia/framework backend em uso (Express.js com TypeScript)
- [x] Analisar estrutura de camadas existente (Controller, Service, Prisma como Repositório)
- [x] Verificar padrões de autenticação e autorização implementados (Middlewares de `auth` e `validateRole`)
- [x] Validar conformidade com as regras do `AI-INSTRUCTIONS.md`

## 1.2. Análise do Banco de Dados

- [x] Identificar tipo de banco (SQL/PostgreSQL via Prisma)
- [x] Analisar schema/models existentes relacionados à tarefa (`Project` e o enum `ProjectStatus`)
- [x] Verificar migrations e estratégias de versionamento do banco (Prisma Migrate)
- [x] Identificar relacionamentos e constraints necessários (N/A para esta tarefa)

## 1.3. Design das APIs

- [x] Definir endpoints RESTful necessários (Modificar `GET /projects`)
- [x] Especificar estrutura de request/response (Adicionar query param `status`)
- [x] Definir códigos de status HTTP apropriados para sucesso e erro (200 OK)
- [x] Estabelecer como a documentação será gerada (N/A, mas seguir padrão se houver)

## 1.4. Plano de Implementação da Camada de Persistência

- [ ] Modificar `project.service.ts` para incluir o filtro de status na query do Prisma.

## 1.5. Plano de Implementação da Camada de Negócio (Services)

- [ ] Atualizar a assinatura do método `listProjectsAsRoot` em `project.service.ts` para aceitar o novo parâmetro de filtro.

## 1.6. Plano de Implementação da Camada de Controle (Controllers)

- [ ] Atualizar `project.controller.ts` para extrair o parâmetro `status` da query string.
- [ ] Adicionar validação para o novo parâmetro `status` em `project.validation.ts`.

## 1.7. Plano de Testes e Validação

- [ ] Definir checklist para testes unitários (N/A neste escopo)
- [ ] Definir checklist para testes de integração (Verificar se a API retorna projetos filtrados corretamente por status)
- [ ] Validar rotas de autenticação e autorização (Garantir que apenas `ROOT` pode listar projetos)
- [ ] Testar cenários de erro e casos de borda (Filtro com status inválido, filtro com status válido mas sem resultados)

## 1.8. Critérios de Sucesso para a Tarefa

- [ ] A API `GET /projects` aceita um query param `status`.
- [ ] A API retorna a lista de projetos filtrada corretamente pelo status fornecido.
- [ ] A validação impede o uso de valores de status inválidos.
- [ ] A funcionalidade existente (paginação, busca por nome) continua funcionando em conjunto com o novo filtro.
