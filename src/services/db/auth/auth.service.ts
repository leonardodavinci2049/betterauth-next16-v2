import type { RowDataPacket } from "mysql2/promise";
import { auth } from "@/lib/auth";
import { DatabaseService } from "@/services/db/dbConnection";

// Client/Person type
export interface ClientePessoa extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  // Add other fields according to your structure
}

// Count query result type
interface CountResult extends RowDataPacket {
  count: number;
}

const db = DatabaseService.getInstance();

/**
 * Get client data based on Better Auth session
 */
export async function getClienteBySession(
  headers: Headers,
): Promise<ClientePessoa | null> {
  try {
    const session = await auth.api.getSession({ headers });

    if (!session?.user?.email) {
      return null;
    }

    const result = await db.selectExecute<ClientePessoa>(
      "SELECT * FROM tbl_pessoa WHERE email = ?",
      [session.user.email],
    );

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching client by session:", error);
    return null;
  }
}

/**
 * Get client data by logged user email
 */
export async function getClienteByEmail(
  email: string,
): Promise<ClientePessoa | null> {
  try {
    const result = await db.selectExecute<ClientePessoa>(
      "SELECT * FROM tbl_pessoa WHERE email = ?",
      [email],
    );

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching client by email:", error);
    return null;
  }
}

/**
 * Create user in Better Auth when client registers
 */
export async function criarUserParaCliente(
  clienteId: number,
): Promise<boolean> {
  try {
    const cliente = await db.selectExecute<ClientePessoa>(
      "SELECT * FROM tbl_pessoa WHERE id = ?",
      [clienteId],
    );

    if (!cliente[0]) {
      return false;
    }

    // Create user in Better Auth (if not exists)
    // This would be done through the registration form
    // which is already integrated with Better Auth

    return true;
  } catch (error) {
    console.error("Error creating user for client:", error);
    return false;
  }
}

/**
 * Check if user has associated client
 */
export async function hasClienteAssociado(email: string): Promise<boolean> {
  try {
    const result = await db.selectExecute<CountResult>(
      "SELECT COUNT(*) as count FROM tbl_pessoa WHERE email = ?",
      [email],
    );

    return result[0].count > 0;
  } catch (error) {
    console.error("Error checking associated client:", error);
    return false;
  }
}
