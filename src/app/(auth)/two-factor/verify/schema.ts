import { z } from "zod";

export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .min(6, "Code must be at least 6 characters"),
});

export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;
