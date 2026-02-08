import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Validate DATABASE_URL exists
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isProduction = process.env.NODE_ENV === "production";

// Production-ready connection configuration
const client = postgres(connectionString, {
  // SSL Configuration
  ssl: isProduction ? "require" : "prefer",

  // Connection Pool Settings
  max: isProduction ? 20 : 5, // Max connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Max connection lifetime (30 minutes)

  // Performance Optimizations
  prepare: true, // Use prepared statements for better performance

  // Connection handling
  onnotice: () => {}, // Suppress notice messages in production

  // Transform options for consistency
  transform: {
    undefined: null, // Transform undefined to null
  },
});

export const db = drizzle(client);

// Graceful shutdown handler for serverless/edge environments
export async function closeConnection() {
  await client.end();
}
