# Revisão Técnica da Implementação de Autenticação

Realize as seguintes correções para garantir a consistência, segurança e manutenibilidade do sistema de autenticação.

### 1. Padronização de Controllers e Services

**Problema:** Inconsistência na implementação dos controllers e services. O `UserController` e `UserService` utilizam classes, enquanto o `AuthController` e `AuthService` utilizam objetos literais.

**Correção:** Refatore o `AuthController` e o `AuthService` para utilizarem classes, seguindo o padrão já estabelecido no módulo de usuário. Exporte uma instância da classe em cada arquivo.

**Exemplo (`auth.controller.ts`):**
```typescript
class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    // ... lógica do controller
  }
}

export const authController = new AuthController();
```

### 2. Inclusão do `role` no Token JWT

**Problema:** O token JWT gerado no `AuthService` não inclui o `role` (perfil) do usuário. Isso impede a implementação de controle de acesso baseado em função (RBAC) nas rotas protegidas.

**Correção:** Adicione o `role` do usuário ao payload do token JWT no método `login` do `AuthService`.

**Exemplo (`auth.service.ts`):**
```typescript
const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
  expiresIn: '1d',
});
```

### 3. Tipagem Correta no Middleware de Autenticação

**Problema:** A tipagem do `req.user` no `auth.middleware.ts` está incompleta, faltando o `role`.

**Correção:** Atualize a declaração global do `Express.Request` para incluir o `role`.

**Exemplo (`auth.middleware.ts`):**
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}
```

### 4. Centralização das Configurações do JWT

**Problema:** O tempo de expiração do token (`expiresIn: '1d'`) está hardcoded no `AuthService`.

**Correção:** Mova o tempo de expiração para as variáveis de ambiente (`.env`) e consuma-o através do `env.ts` para permitir uma configuração mais flexível entre ambientes.

**Exemplo (`.env`):**
```
JWT_EXPIRES_IN=1d
```

**Exemplo (`auth.service.ts`):**
```typescript
const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
  expiresIn: env.JWT_EXPIRES_IN,
});
```

### 5. Adição de Testes Unitários e de Integração

**Problema:** A funcionalidade de autenticação foi implementada sem testes automatizados, o que compromete a garantia de qualidade e a segurança contra regressões.

**Correção:** Crie os seguintes testes:
- **Testes de Integração:**
  - `POST /api/auth/login`: Teste o login com credenciais válidas e inválidas.
  - `GET /api/users/me`: Teste o acesso à rota protegida com um token válido e sem token (ou com um token inválido).
- **Testes Unitários:**
  - `AuthService`: Teste a lógica de validação de senha e geração de token.

### 6. Remoção de Importações Não Utilizadas

**Problema:** O arquivo `user.controller.ts` possui uma importação de `ApiError` que não está sendo utilizada.

**Correção:** Remova a linha `import { ApiError } from '../../../utils/ApiError';` do arquivo `user.controller.ts`.
