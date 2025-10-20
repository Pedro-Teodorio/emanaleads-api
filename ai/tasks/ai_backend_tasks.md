# Plano de Execução da Tarefa: Correções da Implementação de Autenticação

## 1.1. Análise da Arquitetura Backend

- [x] Identificar a tecnologia/framework backend em uso (TypeScript com Express)
- [x] Analisar estrutura de camadas existente (Controller, Service, Repository)
- [x] Verificar padrões de autenticação e autorização implementados (JWT)
- [x] Validar conformidade com as regras do `AI-INSTRUCTIONS.md`

## 1.2. Análise do Banco de Dados

- [x] Identificar tipo de banco (SQL/PostgreSQL) e tecnologia específica (Prisma)
- [x] Analisar schema/models existentes relacionados à tarefa (`user` model)
- [x] Verificar migrations e estratégias de versionamento do banco (Prisma Migrate)
- [x] Identificar relacionamentos e constraints necessários (nenhum novo relacionamento)

## 1.3. Design das APIs

- [x] Definir endpoints RESTful necessários (POST /auth/login)
- [x] Especificar estrutura de request/response (DTOs) para cada endpoint (LoginDto, AuthResponseDto)
- [x] Definir códigos de status HTTP apropriados para sucesso e erro (200, 401, 500)
- [x] Estabelecer como a documentação será gerada (nenhuma documentação automática por enquanto)

## 1.4. Plano de Implementação da Camada de Persistência

- [ ] Nenhuma alteração necessária.

## 1.5. Plano de Implementação da Camada de Negócio (Services)

- [x] Refatorar `AuthService` para usar classe.
- [x] Adicionar `role` ao payload do token JWT.
- [x] Mover a configuração de expiração do JWT para as variáveis de ambiente.

## 1.6. Plano de Implementação da Camada de Controle (Controllers)

- [x] Refatorar `AuthController` para usar classe.
- [x] Remover importação não utilizada em `UserController`.

## 1.7. Plano de Testes e Validação

- [ ] Testes removidos a pedido do usuário.


## 1.8. Critérios de Sucesso para a Tarefa

- [x] Todas as correções solicitadas no arquivo `ai/reviews/ai_tech_lead_review.md` foram implementadas e a API continua funcional.