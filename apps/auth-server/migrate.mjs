import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function runMigration() {
  try {
    const migrationPath = path.join(
      __dirname,
      "db/migrations/0002_fair_bloodscream.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("Running migration...");
    await sql.unsafe(migrationSQL);

    console.log("✓ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
