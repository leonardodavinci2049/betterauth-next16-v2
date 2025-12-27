import { z } from "zod";

const envsSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("PORT must be a positive number")),

  // SYSTEM
  APP_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("APP_ID must be a positive number")),
  SYSTEM_CLIENT_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("SYSTEM_CLIENT_ID must be a positive number")),
  STORE_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("STORE_ID must be a positive number")),
  ORGANIZATION_ID: z.string().min(1, "ORGANIZATION_ID is required"),
  MEMBER_ID: z.string().min(1, "MEMBER_ID is required"),
  USER_ID: z.string().min(1, "USER_ID is required"),
  PERSON_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("PERSON_ID must be a positive number")),
  TYPE_BUSINESS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("TYPE_BUSINESS must be a positive number")),

  // Database MySQL
  DB_MYSQL_HOST: z.string().min(1, "DB_MYSQL_HOST is required"),
  DB_MYSQL_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("DB_MYSQL_PORT must be a positive number")),
  DB_MYSQL_DATABASE: z.string().min(1, "DB_MYSQL_DATABASE is required"),
  DB_MYSQL_USER: z.string().min(1, "DB_MYSQL_USER is required"),
  DB_MYSQL_PASSWORD: z.string().min(1, "DB_MYSQL_PASSWORD is required"),

  // BETTER_AUTH
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),

  // OAuth
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Resend
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
});

// Inferir o tipo automaticamente a partir do schema
type EnvVars = z.infer<typeof envsSchema>;

// Só executar validação no servidor, nunca no cliente
let envVars: EnvVars;

if (typeof window === "undefined") {
  // Estamos no servidor - fazer validação completa
  const validationResult = envsSchema.safeParse(process.env);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${errorMessages}`);
  }

  envVars = validationResult.data;
} else {
  // Estamos no cliente - usar valores vazios ou default
  // Estas variáveis NÃO deve ser acessadas no cliente!
  envVars = {
    PORT: 0,
    APP_ID: 0,
    SYSTEM_CLIENT_ID: 0,
    STORE_ID: 0,
    ORGANIZATION_ID: "",
    MEMBER_ID: "",
    USER_ID: "",
    PERSON_ID: 0,
    TYPE_BUSINESS: 0,
    DB_MYSQL_HOST: "",
    DB_MYSQL_PORT: 0,
    DB_MYSQL_DATABASE: "",
    DB_MYSQL_USER: "",
    DB_MYSQL_PASSWORD: "",
    BETTER_AUTH_URL: "",
    BETTER_AUTH_SECRET: "",
    GITHUB_CLIENT_ID: "",
    GITHUB_CLIENT_SECRET: "",
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    RESEND_API_KEY: "",
  };
}

export const envs = {
  PORT: envVars.PORT,
  APP_ID: envVars.APP_ID,
  SYSTEM_CLIENT_ID: envVars.SYSTEM_CLIENT_ID,
  STORE_ID: envVars.STORE_ID,
  ORGANIZATION_ID: envVars.ORGANIZATION_ID,
  MEMBER_ID: envVars.MEMBER_ID,
  USER_ID: envVars.USER_ID,
  PERSON_ID: envVars.PERSON_ID,
  TYPE_BUSINESS: envVars.TYPE_BUSINESS,
  DB_MYSQL_HOST: envVars.DB_MYSQL_HOST,
  DB_MYSQL_PORT: envVars.DB_MYSQL_PORT,
  DB_MYSQL_DATABASE: envVars.DB_MYSQL_DATABASE,
  DB_MYSQL_USER: envVars.DB_MYSQL_USER,
  DB_MYSQL_PASSWORD: envVars.DB_MYSQL_PASSWORD,
  BETTER_AUTH_URL: envVars.BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: envVars.BETTER_AUTH_SECRET,
  GITHUB_CLIENT_ID: envVars.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: envVars.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envVars.GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY: envVars.RESEND_API_KEY,
};
