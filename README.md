This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- 🔐 **Authentication with Better Auth** - Email/password and Google OAuth
- 🔒 **Two-Factor Authentication (2FA)** - TOTP and OTP support for enhanced security
- 👥 **Organization Management** - Create and manage organizations with role-based access
- 📧 **Email Verification** - Verify user emails with customizable email templates
- 🎨 **Modern UI** - Built with Tailwind CSS and Radix UI components
- 🌙 **Dark Mode** - Theme switching support

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Two-Factor Authentication

This project includes full two-factor authentication support to enhance account security.

### For Users

**Enabling 2FA:**
1. Navigate to Settings from the dashboard header
2. Enter your password
3. Click "Enable Two-Factor Authentication"
4. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
5. Save the backup codes in a secure location

**Logging in with 2FA:**
1. Enter your email and password on the sign-in page
2. You'll be redirected to enter your 6-digit verification code
3. Enter the code from your authenticator app or request one via email
4. Access your account after successful verification

**Disabling 2FA:**
1. Go to Settings
2. Enter your password
3. Click "Disable Two-Factor Authentication"

### Supported Methods
- **TOTP** (Time-based One-Time Password) via authenticator apps
- **OTP** (One-Time Password) via email
- **Backup codes** for account recovery

### Security Features
- Password required to enable/disable 2FA
- Automatic redirect to verification when 2FA is enabled
- One-time use backup codes
- Encrypted storage of TOTP secrets

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
