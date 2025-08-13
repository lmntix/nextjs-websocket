import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  out: "./src/db/migrations",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})
