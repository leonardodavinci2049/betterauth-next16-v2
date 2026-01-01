# AuthService - Documentação de Migração

Este documento descreve a migração das operações de banco de dados do **Prisma ORM** para o **AuthService** com conexão direta via **MySQL2**.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Arquivos Migrados](#arquivos-migrados)
- [Mapeamento de Métodos](#mapeamento-de-métodos)
- [Tipos e Interfaces](#tipos-e-interfaces)
- [Exemplos de Uso](#exemplos-de-uso)
- [Padrão de Resposta](#padrão-de-resposta)
- [Tratamento de Erros](#tratamento-de-erros)

---

## Visão Geral

O **AuthService** foi criado para substituir as operações do Prisma ORM por queries SQL diretas usando o pacote `mysql2/promise`. Isso permite:

- ✅ Maior controle sobre as queries SQL
- ✅ Queries otimizadas com JOINs e subqueries
- ✅ Redução do número de roundtrips ao banco de dados
- ✅ Preparação para migração completa do Prisma
- ✅ Tipagem forte com TypeScript

---

## Estrutura de Arquivos

```
src/services/db/auth/
├── auth.service.ts    # Serviço principal com métodos de acesso ao banco
├── auth.types.ts      # Tipos, interfaces e funções de mapeamento
└── README.md          # Esta documentação
```

---

## Arquivos Migrados

### 1. `src/server/members.ts`

| Função | Antes (Prisma) | Depois (AuthService) |
|--------|----------------|----------------------|
| `removeMember()` | `prisma.member.delete()` | `AuthService.deleteMember()` |

**Código Anterior:**
```typescript
import { prisma } from "@/lib/prisma";

export const removeMember = async (memberId: string) => {
  // ...
  await prisma.member.delete({
    where: { id: memberId },
  });
};
```

**Código Atual:**
```typescript
import { AuthService } from "@/services/db/auth/auth.service";

export const removeMember = async (memberId: string) => {
  // ...
  const result = await AuthService.deleteMember({ memberId });
  
  if (!result.success) {
    return { success: false, error: result.error };
  }
  
  return { success: true, error: null };
};
```

---

### 2. `src/server/organizations.ts`

| Função | Antes (Prisma) | Depois (AuthService) |
|--------|----------------|----------------------|
| `getOrganizations()` | 2 queries separadas | `AuthService.findUserOrganizations()` |
| `getActiveOrganization()` | 2 queries separadas | `AuthService.findActiveOrganization()` |
| `getOrganizationBySlug()` | `prisma.organization.findFirst()` com include | `AuthService.findOrganizationBySlugWithMembers()` |

**Melhorias de Performance:**

```typescript
// ANTES: 2 queries separadas
const members = await prisma.member.findMany({ where: { userId } });
const organizationIds = members.map((m) => m.organizationId);
const organizations = await prisma.organization.findMany({
  where: { id: { in: organizationIds } },
});

// DEPOIS: 1 query otimizada com JOIN
const response = await AuthService.findUserOrganizations({ userId });
```

---

### 3. `src/server/users.ts`

| Função | Antes (Prisma) | Depois (AuthService) |
|--------|----------------|----------------------|
| `getCurrentUser()` | `prisma.user.findUnique()` | `AuthService.findUserById()` |
| `getUsers()` | 2 queries separadas | `AuthService.findNonMemberUsers()` |

**Melhorias de Performance:**

```typescript
// ANTES: 2 queries separadas
const members = await prisma.member.findMany({ where: { organizationId } });
const users = await prisma.user.findMany({
  where: { id: { notIn: members.map((m) => m.userId) } },
});

// DEPOIS: 1 query otimizada com subquery
const response = await AuthService.findNonMemberUsers({ organizationId });
```

---

## Mapeamento de Métodos

### Métodos de Usuário (User)

| Método AuthService | Equivalente Prisma |
|-------------------|-------------------|
| `findUserById({ userId })` | `prisma.user.findUnique({ where: { id } })` |
| `findUsersExcludingIds({ excludeUserIds })` | `prisma.user.findMany({ where: { id: { notIn } } })` |

### Métodos de Membro (Member)

| Método AuthService | Equivalente Prisma |
|-------------------|-------------------|
| `findMembersByOrganization({ organizationId })` | `prisma.member.findMany({ where: { organizationId } })` |
| `findFirstMemberByUser({ userId })` | `prisma.member.findFirst({ where: { userId } })` |
| `findMembersByUser({ userId })` | `prisma.member.findMany({ where: { userId } })` |
| `deleteMember({ memberId })` | `prisma.member.delete({ where: { id } })` |

### Métodos de Organização (Organization)

| Método AuthService | Equivalente Prisma |
|-------------------|-------------------|
| `findOrganizationById({ organizationId })` | `prisma.organization.findFirst({ where: { id } })` |
| `findOrganizationsByIds({ organizationIds })` | `prisma.organization.findMany({ where: { id: { in } } })` |
| `findOrganizationBySlug({ slug })` | `prisma.organization.findFirst({ where: { slug } })` |
| `findOrganizationBySlugWithMembers({ slug })` | `prisma.organization.findFirst({ include: { member: { include: { user } } } })` |

### Métodos Compostos (Otimizados)

| Método AuthService | Descrição |
|-------------------|-----------|
| `findUserOrganizations({ userId })` | Busca organizações do usuário via JOIN |
| `findActiveOrganization({ userId })` | Busca primeira organização do usuário via JOIN |
| `findNonMemberUsers({ organizationId })` | Busca usuários não membros via subquery |

---

## Tipos e Interfaces

### Entidades do Banco (Row Types)

```typescript
// Representa registros diretos do banco de dados (extends RowDataPacket)

// Usuário e Autenticação
interface UserEntity { /* ... */ }
interface AccountEntity { /* ... */ }
interface SessionEntity { /* ... */ }
interface TwoFactorEntity { /* ... */ }
interface VerificationEntity { /* ... */ }

// Organização
interface OrganizationEntity { /* ... */ }
interface OrganizationRoleEntity { /* ... */ }
interface MemberEntity { /* ... */ }
interface MemberWithUserEntity { /* ... */ }  // JOIN com user
interface InvitationEntity { /* ... */ }
interface InvitationWithInviterEntity { /* ... */ }  // JOIN com user

// Times
interface TeamEntity { /* ... */ }
interface TeamWithOrganizationEntity { /* ... */ }  // JOIN com organization
interface TeamMemberEntity { /* ... */ }
interface TeamMemberWithUserEntity { /* ... */ }  // JOIN com user
```

### DTOs (Data Transfer Objects)

```typescript
// Tipos limpos para uso na aplicação

// Usuário e Autenticação
interface User { /* ... */ }
interface Account { /* ... */ }
interface Session { /* ... */ }
interface TwoFactor { /* ... */ }
interface Verification { /* ... */ }

// Organização
interface Organization { /* ... */ }
interface OrganizationWithMembers { /* ... */ }
interface OrganizationRole { /* ... */ }
interface Member { /* ... */ }
interface MemberWithUser { /* ... */ }
interface Invitation { /* ... */ }
interface InvitationWithInviter { /* ... */ }

// Times
interface Team { /* ... */ }
interface TeamWithOrganization { /* ... */ }
interface TeamMember { /* ... */ }
interface TeamMemberWithUser { /* ... */ }
```

### Tipos de Resposta

```typescript
interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

interface ModifyResponse {
  success: boolean;
  affectedRows: number;
  error: string | null;
}
```

---

## Exemplos de Uso

### Buscar Usuário

```typescript
import { AuthService } from "@/services/db/auth/auth.service";

const response = await AuthService.findUserById({ userId: "user-123" });

if (response.success && response.data) {
  console.log(`Usuário: ${response.data.name}`);
} else {
  console.error(`Erro: ${response.error}`);
}
```

### Buscar Organizações do Usuário

```typescript
const response = await AuthService.findUserOrganizations({ userId: "user-123" });

if (response.success && response.data) {
  response.data.forEach((org) => {
    console.log(`Organização: ${org.name} (${org.slug})`);
  });
}
```

### Deletar Membro

```typescript
const result = await AuthService.deleteMember({ memberId: "member-456" });

if (result.success) {
  console.log(`Membro removido. Linhas afetadas: ${result.affectedRows}`);
} else {
  console.error(`Falha ao remover: ${result.error}`);
}
```

### Buscar Organização com Membros

```typescript
const response = await AuthService.findOrganizationBySlugWithMembers({
  slug: "minha-empresa",
});

if (response.success && response.data) {
  const org = response.data;
  console.log(`Organização: ${org.name}`);
  
  org.member.forEach((member) => {
    console.log(`- ${member.user.name} (${member.role})`);
  });
}
```

---

## Padrão de Resposta

Todos os métodos seguem o padrão de resposta unificado:

### Para operações de leitura (SELECT)

```typescript
{
  success: true,          // Indica se a operação foi bem sucedida
  data: User | null,      // Dados retornados (null se não encontrado)
  error: null             // Mensagem de erro (null se sucesso)
}
```

### Para operações de modificação (INSERT/UPDATE/DELETE)

```typescript
{
  success: true,          // Indica se a operação foi bem sucedida
  affectedRows: 1,        // Número de linhas afetadas
  error: null             // Mensagem de erro (null se sucesso)
}
```

---

## Tratamento de Erros

O AuthService possui classes de erro customizadas:

```typescript
// Erro de validação de parâmetros
class AuthValidationError extends AuthServiceError {
  constructor(message: string, field?: string);
}

// Erro genérico do serviço
class AuthServiceError extends Error {
  constructor(message: string, code: AuthErrorCode, originalError?: Error);
}

// Erro para recursos não encontrados
class AuthNotFoundError extends AuthServiceError {
  constructor(resource: string, identifier: string);
}
```

### Códigos de Erro

```typescript
type AuthErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";
```

---

## Conexão com Banco de Dados

O AuthService utiliza o `dbService` definido em `src/services/db/dbConnection.ts`:

```typescript
// Métodos disponíveis do dbService:
dbService.selectExecute<T>(query, params)  // SELECT com prepared statements
dbService.selectQuery<T>(query, params)    // SELECT simples
dbService.ModifyExecute(query, params)     // INSERT/UPDATE/DELETE
dbService.runInTransaction(callback)       // Operações transacionais
```

---

## Próximos Passos

1. ✅ Migrar server actions de `src/server/`
2. ⬜ Migrar outras partes do código que usam Prisma
3. ⬜ Remover dependência do Prisma quando migração completa
4. ⬜ Adicionar testes unitários para o AuthService
5. ⬜ Implementar cache com Redis (opcional)

---

## Changelog

### v1.0.0 (2026-01-01)

- ✅ Criação do `AuthService` com métodos para User, Member e Organization
- ✅ Criação do arquivo de tipos `auth.types.ts`
- ✅ Migração de `src/server/members.ts`
- ✅ Migração de `src/server/organizations.ts`
- ✅ Migração de `src/server/users.ts`
- ✅ Documentação completa da migração

### v1.1.0 (2026-01-01)

- ✅ Adicionados tipos para todos os modelos do Prisma:
  - `Account` / `AccountEntity` - Contas de autenticação (OAuth, credentials)
  - `Session` / `SessionEntity` - Sessões de usuário
  - `Invitation` / `InvitationEntity` - Convites para organizações
  - `Verification` / `VerificationEntity` - Verificações (email, reset)
  - `TwoFactor` / `TwoFactorEntity` - Autenticação de dois fatores
  - `Team` / `TeamEntity` - Times dentro de organizações
  - `TeamMember` / `TeamMemberEntity` - Membros de times
  - `OrganizationRole` / `OrganizationRoleEntity` - Roles customizadas
- ✅ Adicionadas funções de mapeamento para todos os novos tipos
- ✅ Atualizada documentação com lista completa de tipos
