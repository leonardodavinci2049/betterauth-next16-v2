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

This project includes full two-factor authentication support. Users can enable 2FA from their settings page to add an extra layer of security to their accounts.

**Supported Methods:**
- TOTP (Time-based One-Time Password) via authenticator apps
- OTP (One-Time Password) via email
- Backup codes for account recovery

For detailed documentation, see [docs/TWO_FACTOR_AUTH.md](docs/TWO_FACTOR_AUTH.md).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
