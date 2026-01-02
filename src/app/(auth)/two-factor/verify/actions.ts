"use server";

import { auth } from "@/lib/auth";
import { twoFactorVerifySchema } from "./schema";

export type TwoFactorVerifyState = {
  success: boolean;
  message: string;
  errors?: {
    code?: string[];
  };
};

export async function verifyTwoFactorAction(
  _prevState: TwoFactorVerifyState,
  formData: FormData,
): Promise<TwoFactorVerifyState> {
  const rawData = {
    code: formData.get("code"),
  };

  // Validate with Zod
  const validatedFields = twoFactorVerifySchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { code } = validatedFields.data;

  try {
    await auth.api.verifyTOTP({
      body: {
        code,
      },
    });

    return {
      success: true,
      message: "Two-factor authentication verified successfully",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "Invalid verification code",
    };
  }
}
