import { adminAc, memberAc, ownerAc } from "better-auth/plugins/organization";

// Re-export the built-in organization access control roles from better-auth
export const owner = ownerAc;
export const admin = adminAc;
export const member = memberAc;
