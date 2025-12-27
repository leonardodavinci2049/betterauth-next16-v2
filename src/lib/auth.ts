import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { createPool } from "mysql2/promise";
import { envs } from "@/core/config/envs";

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

  plugins: [nextCookies()],
});
