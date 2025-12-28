import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { createPool } from "mysql2/promise";
import { Resend } from "resend";

import VerifyEmail from "@/components/emails/verify-email";
import { envs } from "@/core/config/envs";


const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  secret: envs.BETTER_AUTH_SECRET,
  database: createPool({
    host: envs.DB_MYSQL_HOST,
    port: envs.DB_MYSQL_PORT,
    user: envs.DB_MYSQL_USER,
    password: envs.DB_MYSQL_PASSWORD,
    database: envs.DB_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }),


  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },


  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
        to: user.email,
        subject: "Verify your email",
        react: VerifyEmail({ username: user.name, verifyUrl: url }),
      });
    },
    sendOnSignUp: true,
  },


  plugins: [nextCookies()],
});
