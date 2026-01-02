"use client";

import Form from "next/form";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { type TwoFactorVerifyState, verifyTwoFactorAction } from "../actions";

const initialState: TwoFactorVerifyState = {
  success: false,
  message: "",
};

export function TwoFactorVerifyForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [state, formAction] = useActionState(
    verifyTwoFactorAction,
    initialState,
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/dashboard");
      } else if (!state.errors) {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the verification code from your authenticator app or the code
            sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form action={formAction} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="code"
                    className={state.errors?.code ? "text-destructive" : ""}
                  >
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="000000"
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                    aria-describedby="code-error"
                    aria-invalid={!!state.errors?.code}
                  />
                  {state.errors?.code && (
                    <p
                      id="code-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {state.errors.code[0]}
                    </p>
                  )}
                </div>
              </div>
              <SubmitButton pendingText="Verifying...">Verify</SubmitButton>
            </div>
          </Form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/sign-in")}
              type="button"
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
