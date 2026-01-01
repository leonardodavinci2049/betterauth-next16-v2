import "server-only";

import dbService, {
  ErroConexaoBancoDados,
  ErroExecucaoConsulta,
} from "@/services/db/dbConnection";

import {
  AUTH_TABLES,
  AuthValidationError,
  type Member,
  type MemberEntity,
  type MemberWithUserEntity,
  type ModifyResponse,
  mapMemberEntityToDto,
  mapMemberWithUserEntityToDto,
  mapOrganizationEntityToDto,
  mapUserEntityToDto,
  type Organization,
  type OrganizationEntity,
  type OrganizationWithMembers,
  type ServiceResponse,
  type User,
  type UserEntity,
} from "./types/auth.types";

// ============================================================================
// Funções Utilitárias Privadas
// ============================================================================

/**
 * Valida se o ID fornecido é válido
 */
function validateId(id: string, fieldName: string): void {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new AuthValidationError(
      `${fieldName} é obrigatório e deve ser uma string válida`,
      fieldName,
    );
  }
}

/**
 * Valida se o array de IDs é válido
 */
function validateIdArray(ids: string[], fieldName: string): void {
  if (!Array.isArray(ids)) {
    throw new AuthValidationError(`${fieldName} deve ser um array`, fieldName);
  }
}

/**
 * Trata erros e retorna resposta padronizada
 */
function handleError<T>(error: unknown, operation: string): ServiceResponse<T> {
  console.error(`[AuthService] Erro em ${operation}:`, error);

  if (error instanceof AuthValidationError) {
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }

  if (error instanceof ErroConexaoBancoDados) {
    return {
      success: false,
      data: null,
      error: "Erro de conexão com o banco de dados",
    };
  }

  if (error instanceof ErroExecucaoConsulta) {
    return {
      success: false,
      data: null,
      error: `Erro ao executar consulta: ${error.message}`,
    };
  }

  return {
    success: false,
    data: null,
    error: error instanceof Error ? error.message : "Erro desconhecido",
  };
}

/**
 * Trata erros para operações de modificação
 */
function handleModifyError(error: unknown, operation: string): ModifyResponse {
  console.error(`[AuthService] Erro em ${operation}:`, error);

  return {
    success: false,
    affectedRows: 0,
    error: error instanceof Error ? error.message : "Erro desconhecido",
  };
}

// ============================================================================
// Métodos de Usuário (User)
// ============================================================================

/**
 * Busca um usuário pelo ID
 *
 * Substitui: prisma.user.findUnique({ where: { id } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findUserById({ userId: "user-123" });
 * if (response.success && response.data) {
 *   console.log(response.data.name);
 * }
 * ```
 */
async function findUserById(params: {
  userId: string;
}): Promise<ServiceResponse<User>> {
  try {
    validateId(params.userId, "userId");

    const query = `
      SELECT 
        id, name, email, emailVerified, image, 
        createdAt, updatedAt, twoFactorEnabled, 
        role, banned, banReason, banExpires
      FROM ${AUTH_TABLES.USER}
      WHERE id = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<UserEntity>(query, [
      params.userId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapUserEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<User>(error, "findUserById");
  }
}

/**
 * Busca todos os usuários excluindo IDs específicos
 *
 * Substitui: prisma.user.findMany({ where: { id: { notIn: excludeIds } } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findUsersExcludingIds({
 *   excludeUserIds: ["user-1", "user-2"]
 * });
 * ```
 */
async function findUsersExcludingIds(params: {
  excludeUserIds: string[];
}): Promise<ServiceResponse<User[]>> {
  try {
    validateIdArray(params.excludeUserIds, "excludeUserIds");

    // Se o array estiver vazio, retorna todos os usuários
    if (params.excludeUserIds.length === 0) {
      const query = `
        SELECT 
          id, name, email, emailVerified, image, 
          createdAt, updatedAt, twoFactorEnabled, 
          role, banned, banReason, banExpires
        FROM ${AUTH_TABLES.USER}
        ORDER BY name ASC
      `;

      const results = await dbService.selectExecute<UserEntity>(query);
      return {
        success: true,
        data: results.map(mapUserEntityToDto),
        error: null,
      };
    }

    // Cria placeholders para os IDs a serem excluídos
    const placeholders = params.excludeUserIds.map(() => "?").join(", ");

    const query = `
      SELECT 
        id, name, email, emailVerified, image, 
        createdAt, updatedAt, twoFactorEnabled, 
        role, banned, banReason, banExpires
      FROM ${AUTH_TABLES.USER}
      WHERE id NOT IN (${placeholders})
      ORDER BY name ASC
    `;

    const results = await dbService.selectExecute<UserEntity>(
      query,
      params.excludeUserIds,
    );

    return {
      success: true,
      data: results.map(mapUserEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<User[]>(error, "findUsersExcludingIds");
  }
}

// ============================================================================
// Métodos de Membro (Member)
// ============================================================================

/**
 * Busca todos os membros de uma organização
 *
 * Substitui: prisma.member.findMany({ where: { organizationId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findMembersByOrganization({
 *   organizationId: "org-123"
 * });
 * ```
 */
async function findMembersByOrganization(params: {
  organizationId: string;
}): Promise<ServiceResponse<Member[]>> {
  try {
    validateId(params.organizationId, "organizationId");

    const query = `
      SELECT 
        id, organizationId, userId, role, createdAt, updatedAt
      FROM ${AUTH_TABLES.MEMBER}
      WHERE organizationId = ?
      ORDER BY createdAt ASC
    `;

    const results = await dbService.selectExecute<MemberEntity>(query, [
      params.organizationId,
    ]);

    return {
      success: true,
      data: results.map(mapMemberEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Member[]>(error, "findMembersByOrganization");
  }
}

/**
 * Busca o primeiro membro de um usuário
 *
 * Substitui: prisma.member.findFirst({ where: { userId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findFirstMemberByUser({
 *   userId: "user-123"
 * });
 * ```
 */
async function findFirstMemberByUser(params: {
  userId: string;
}): Promise<ServiceResponse<Member | null>> {
  try {
    validateId(params.userId, "userId");

    const query = `
      SELECT 
        id, organizationId, userId, role, createdAt, updatedAt
      FROM ${AUTH_TABLES.MEMBER}
      WHERE userId = ?
      ORDER BY createdAt ASC
      LIMIT 1
    `;

    const results = await dbService.selectExecute<MemberEntity>(query, [
      params.userId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapMemberEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Member | null>(error, "findFirstMemberByUser");
  }
}

/**
 * Busca todos os membros de um usuário
 *
 * Substitui: prisma.member.findMany({ where: { userId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findMembersByUser({
 *   userId: "user-123"
 * });
 * ```
 */
async function findMembersByUser(params: {
  userId: string;
}): Promise<ServiceResponse<Member[]>> {
  try {
    validateId(params.userId, "userId");

    const query = `
      SELECT 
        id, organizationId, userId, role, createdAt, updatedAt
      FROM ${AUTH_TABLES.MEMBER}
      WHERE userId = ?
      ORDER BY createdAt ASC
    `;

    const results = await dbService.selectExecute<MemberEntity>(query, [
      params.userId,
    ]);

    return {
      success: true,
      data: results.map(mapMemberEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Member[]>(error, "findMembersByUser");
  }
}

/**
 * Deleta um membro pelo ID
 *
 * Substitui: prisma.member.delete({ where: { id } })
 *
 * @example
 * ```typescript
 * const result = await AuthService.deleteMember({ memberId: "member-456" });
 * if (result.success) {
 *   console.log(`Linhas afetadas: ${result.affectedRows}`);
 * }
 * ```
 */
async function deleteMember(params: {
  memberId: string;
}): Promise<ModifyResponse> {
  try {
    validateId(params.memberId, "memberId");

    const query = `
      DELETE FROM ${AUTH_TABLES.MEMBER}
      WHERE id = ?
    `;

    const result = await dbService.ModifyExecute(query, [params.memberId]);

    return {
      success: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      error:
        result.affectedRows === 0
          ? "Membro não encontrado ou já deletado"
          : null,
    };
  } catch (error) {
    return handleModifyError(error, "deleteMember");
  }
}

// ============================================================================
// Métodos de Organização (Organization)
// ============================================================================

/**
 * Busca uma organização pelo ID
 *
 * Substitui: prisma.organization.findFirst({ where: { id } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationById({
 *   organizationId: "org-123"
 * });
 * ```
 */
async function findOrganizationById(params: {
  organizationId: string;
}): Promise<ServiceResponse<Organization | null>> {
  try {
    validateId(params.organizationId, "organizationId");

    const query = `
      SELECT 
        id, name, slug, logo, createdAt, metadata
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE id = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.organizationId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapOrganizationEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Organization | null>(error, "findOrganizationById");
  }
}

/**
 * Busca organizações pelos IDs
 *
 * Substitui: prisma.organization.findMany({ where: { id: { in: ids } } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationsByIds({
 *   organizationIds: ["org-1", "org-2"]
 * });
 * ```
 */
async function findOrganizationsByIds(params: {
  organizationIds: string[];
}): Promise<ServiceResponse<Organization[]>> {
  try {
    validateIdArray(params.organizationIds, "organizationIds");

    if (params.organizationIds.length === 0) {
      return {
        success: true,
        data: [],
        error: null,
      };
    }

    const placeholders = params.organizationIds.map(() => "?").join(", ");

    const query = `
      SELECT 
        id, name, slug, logo, createdAt, metadata
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE id IN (${placeholders})
      ORDER BY name ASC
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(
      query,
      params.organizationIds,
    );

    return {
      success: true,
      data: results.map(mapOrganizationEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Organization[]>(error, "findOrganizationsByIds");
  }
}

/**
 * Busca uma organização pelo slug
 *
 * Substitui: prisma.organization.findFirst({ where: { slug } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationBySlug({
 *   slug: "my-organization"
 * });
 * ```
 */
async function findOrganizationBySlug(params: {
  slug: string;
}): Promise<ServiceResponse<Organization | null>> {
  try {
    validateId(params.slug, "slug");

    const query = `
      SELECT 
        id, name, slug, logo, createdAt, metadata
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE slug = ?
      LIMIT 1
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.slug,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapOrganizationEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Organization | null>(error, "findOrganizationBySlug");
  }
}

/**
 * Busca uma organização pelo slug incluindo membros e seus usuários
 *
 * Substitui: prisma.organization.findFirst({
 *   where: { slug },
 *   include: { member: { include: { user: true } } }
 * })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findOrganizationBySlugWithMembers({
 *   slug: "my-organization"
 * });
 * if (response.success && response.data) {
 *   console.log(response.data.member); // Array de membros com usuários
 * }
 * ```
 */
async function findOrganizationBySlugWithMembers(params: {
  slug: string;
}): Promise<ServiceResponse<OrganizationWithMembers | null>> {
  try {
    validateId(params.slug, "slug");

    // Primeiro busca a organização
    const orgQuery = `
      SELECT 
        id, name, slug, logo, createdAt, metadata
      FROM ${AUTH_TABLES.ORGANIZATION}
      WHERE slug = ?
      LIMIT 1
    `;

    const orgResults = await dbService.selectExecute<OrganizationEntity>(
      orgQuery,
      [params.slug],
    );

    if (orgResults.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    const organization = mapOrganizationEntityToDto(orgResults[0]);

    // Depois busca os membros com usuários
    const membersQuery = `
      SELECT 
        m.id, m.organizationId, m.userId, m.role, m.createdAt, m.updatedAt,
        u.id as user_id, u.name as user_name, u.email as user_email,
        u.emailVerified as user_emailVerified, u.image as user_image,
        u.createdAt as user_createdAt, u.updatedAt as user_updatedAt,
        u.twoFactorEnabled as user_twoFactorEnabled, u.role as user_role,
        u.banned as user_banned, u.banReason as user_banReason,
        u.banExpires as user_banExpires
      FROM ${AUTH_TABLES.MEMBER} m
      INNER JOIN ${AUTH_TABLES.USER} u ON m.userId = u.id
      WHERE m.organizationId = ?
      ORDER BY m.createdAt ASC
    `;

    const memberResults = await dbService.selectExecute<MemberWithUserEntity>(
      membersQuery,
      [organization.id],
    );

    const membersWithUsers = memberResults.map(mapMemberWithUserEntityToDto);

    return {
      success: true,
      data: {
        ...organization,
        member: membersWithUsers,
      },
      error: null,
    };
  } catch (error) {
    return handleError<OrganizationWithMembers | null>(
      error,
      "findOrganizationBySlugWithMembers",
    );
  }
}

// ============================================================================
// Métodos Compostos (para operações complexas)
// ============================================================================

/**
 * Busca as organizações de um usuário através de suas memberships
 *
 * Combina:
 * - prisma.member.findMany({ where: { userId } })
 * - prisma.organization.findMany({ where: { id: { in: organizationIds } } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findUserOrganizations({
 *   userId: "user-123"
 * });
 * ```
 */
async function findUserOrganizations(params: {
  userId: string;
}): Promise<ServiceResponse<Organization[]>> {
  try {
    validateId(params.userId, "userId");

    // Query otimizada com JOIN
    const query = `
      SELECT DISTINCT
        o.id, o.name, o.slug, o.logo, o.createdAt, o.metadata
      FROM ${AUTH_TABLES.ORGANIZATION} o
      INNER JOIN ${AUTH_TABLES.MEMBER} m ON o.id = m.organizationId
      WHERE m.userId = ?
      ORDER BY o.name ASC
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.userId,
    ]);

    return {
      success: true,
      data: results.map(mapOrganizationEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<Organization[]>(error, "findUserOrganizations");
  }
}

/**
 * Busca a organização ativa de um usuário (primeira organização encontrada)
 *
 * Combina:
 * - prisma.member.findFirst({ where: { userId } })
 * - prisma.organization.findFirst({ where: { id: memberUser.organizationId } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findActiveOrganization({
 *   userId: "user-123"
 * });
 * ```
 */
async function findActiveOrganization(params: {
  userId: string;
}): Promise<ServiceResponse<Organization | null>> {
  try {
    validateId(params.userId, "userId");

    // Query otimizada com JOIN
    const query = `
      SELECT 
        o.id, o.name, o.slug, o.logo, o.createdAt, o.metadata
      FROM ${AUTH_TABLES.ORGANIZATION} o
      INNER JOIN ${AUTH_TABLES.MEMBER} m ON o.id = m.organizationId
      WHERE m.userId = ?
      ORDER BY m.createdAt ASC
      LIMIT 1
    `;

    const results = await dbService.selectExecute<OrganizationEntity>(query, [
      params.userId,
    ]);

    if (results.length === 0) {
      return {
        success: true,
        data: null,
        error: null,
      };
    }

    return {
      success: true,
      data: mapOrganizationEntityToDto(results[0]),
      error: null,
    };
  } catch (error) {
    return handleError<Organization | null>(error, "findActiveOrganization");
  }
}

/**
 * Busca usuários que não são membros de uma organização
 *
 * Combina:
 * - prisma.member.findMany({ where: { organizationId } })
 * - prisma.user.findMany({ where: { id: { notIn: memberUserIds } } })
 *
 * @example
 * ```typescript
 * const response = await AuthService.findNonMemberUsers({
 *   organizationId: "org-123"
 * });
 * ```
 */
async function findNonMemberUsers(params: {
  organizationId: string;
}): Promise<ServiceResponse<User[]>> {
  try {
    validateId(params.organizationId, "organizationId");

    // Query otimizada com subquery
    const query = `
      SELECT 
        u.id, u.name, u.email, u.emailVerified, u.image, 
        u.createdAt, u.updatedAt, u.twoFactorEnabled, 
        u.role, u.banned, u.banReason, u.banExpires
      FROM ${AUTH_TABLES.USER} u
      WHERE u.id NOT IN (
        SELECT m.userId 
        FROM ${AUTH_TABLES.MEMBER} m 
        WHERE m.organizationId = ?
      )
      ORDER BY u.name ASC
    `;

    const results = await dbService.selectExecute<UserEntity>(query, [
      params.organizationId,
    ]);

    return {
      success: true,
      data: results.map(mapUserEntityToDto),
      error: null,
    };
  } catch (error) {
    return handleError<User[]>(error, "findNonMemberUsers");
  }
}

// ============================================================================
// Namespace Export - AuthService
// ============================================================================

/**
 * AuthService - Serviço de acesso ao banco de dados para operações de autenticação
 *
 * Esta namespace serve como ponte entre os server actions e o banco de dados MySQL,
 * substituindo as operações do Prisma por queries diretas usando mysql2.
 *
 * @example
 * ```typescript
 * import { AuthService } from "@/services/db/auth/auth.service";
 *
 * // Buscar usuário por ID
 * const response = await AuthService.findUserById({ userId: "user-123" });
 *
 * // Buscar organizações do usuário
 * const orgs = await AuthService.findUserOrganizations({ userId: "user-123" });
 *
 * // Deletar membro
 * const result = await AuthService.deleteMember({ memberId: "member-456" });
 * ```
 */
export const AuthService = {
  // Métodos de Usuário
  findUserById,
  findUsersExcludingIds,

  // Métodos de Membro
  findMembersByOrganization,
  findFirstMemberByUser,
  findMembersByUser,
  deleteMember,

  // Métodos de Organização
  findOrganizationById,
  findOrganizationsByIds,
  findOrganizationBySlug,
  findOrganizationBySlugWithMembers,

  // Métodos Compostos
  findUserOrganizations,
  findActiveOrganization,
  findNonMemberUsers,
} as const;

// Export default para facilitar importação
export default AuthService;

// Re-export types para facilitar uso
export type {
  Member,
  MemberWithUser,
  ModifyResponse,
  Organization,
  OrganizationWithMembers,
  ServiceResponse,
  User,
} from "./types/auth.types";
