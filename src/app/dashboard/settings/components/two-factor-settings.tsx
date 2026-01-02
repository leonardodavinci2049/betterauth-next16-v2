"use client";

import QRCode from "qrcode";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";

interface TwoFactorSettingsProps {
  twoFactorEnabled: boolean;
}

export function TwoFactorSettings({
  twoFactorEnabled: initialEnabled,
}: TwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const handleEnable = async () => {
    if (!password) {
      toast.error("Please enter your password to enable 2FA");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.twoFactor.enable({
        password,
      });

      if (result.data) {
        // Generate QR code from TOTP URI
        const qrCodeDataUrl = await QRCode.toDataURL(result.data.totpURI);
        setQrCode(qrCodeDataUrl);
        setBackupCodes(result.data.backupCodes);
        setEnabled(true);
        setShowSetup(true);
        toast.success(
          "Two-factor authentication enabled! Scan the QR code with your authenticator app.",
        );
      }
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || "Failed to enable two-factor authentication");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const handleDisable = async () => {
    if (!password) {
      toast.error("Please enter your password to disable 2FA");
      return;
    }

    setLoading(true);
    try {
      await authClient.twoFactor.disable({
        password,
      });

      setEnabled(false);
      setQrCode(null);
      setBackupCodes([]);
      setShowSetup(false);
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      const e = error as Error;
      toast.error(e.message || "Failed to disable two-factor authentication");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Status</Label>
            <p className="text-sm text-muted-foreground">
              {enabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <Switch checked={enabled} disabled />
        </div>

        {!enabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password-enable">Your Password</Label>
              <Input
                id="password-enable"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleEnable} disabled={loading}>
              {loading ? "Enabling..." : "Enable Two-Factor Authentication"}
            </Button>
          </div>
        )}

        {enabled && !showSetup && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password-disable">Your Password</Label>
              <Input
                id="password-disable"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleDisable}
              disabled={loading}
              variant="destructive"
            >
              {loading ? "Disabling..." : "Disable Two-Factor Authentication"}
            </Button>
          </div>
        )}

        {showSetup && qrCode && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <h3 className="font-medium">Step 1: Scan the QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Use your authenticator app (Google Authenticator, Authy, etc.)
                to scan this QR code.
              </p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="QR Code" className="rounded-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Step 2: Save Your Backup Codes</h3>
              <p className="text-sm text-muted-foreground">
                Keep these codes in a safe place. You can use them to access
                your account if you lose your authenticator device.
              </p>
              <div className="rounded-md bg-muted p-4">
                <code className="text-sm">
                  {backupCodes.map((code) => (
                    <div key={code}>{code}</div>
                  ))}
                </code>
              </div>
              <Button onClick={copyBackupCodes} variant="outline" size="sm">
                Copy Backup Codes
              </Button>
            </div>

            <Button
              onClick={() => setShowSetup(false)}
              variant="outline"
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
