"use server";

import type { Role } from "@/db/schema";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "./permissions";

const roleMap: Record<Role, "owner" | "admin" | "member"> = {
  ADMIN: "admin",
  MEMBER: "member",
  BILLING: "member",
};

export const addMember = async (
  organizationId: string,
  userId: string,
  role: Role,
) => {
  try {
    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role: roleMap[role],
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to add member.");
  }
};

export const removeMember = async (memberId: string) => {
  const admin = await isAdmin();

  if (!admin) {
    return {
      success: false,
      error: "You are not authorized to remove members.",
    };
  }

  try {
    await prisma.member.delete({
      where: {
        id: memberId,
      },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to remove member.",
    };
  }
};
