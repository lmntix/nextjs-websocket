import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import env from "@/env"
import * as schema from "./schema"

// Create postgres client
const client = postgres(env.DATABASE_URL)

// Create drizzle instance
export const db = drizzle(client, { schema })

export * from "./schema"
