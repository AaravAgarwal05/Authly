import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/**/*.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  // Only include dbCredentials if DATABASE_URL is set (not needed for generate)
  ...(process.env.DATABASE_URL && {
    dbCredentials: {
      url: process.env.DATABASE_URL,
    },
  }),
  // Production optimizations
  strict: true,
  verbose: true,
});
