import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { projectUsers, authlyUsers } from "./identity";

// Enum for verification token types (type safety + DB constraint)
export const verificationTokenTypeEnum = pgEnum("verification_token_type", [
  "email_verify",
  "password_reset",
]);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectUserId: uuid("project_user_id")
      .notNull()
      .references(() => projectUsers.id, {
        onDelete: "cascade",
      }),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for session lookups by user
    index("sessions_project_user_id_idx").on(table.projectUserId),
    // Index for cleanup of expired sessions
    index("sessions_expires_at_idx").on(table.expiresAt),
    // Index for token validation
    index("sessions_refresh_token_hash_idx").on(table.refreshTokenHash),
  ],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authlyUserId: uuid("authly_user_id")
      .notNull()
      .references(() => authlyUsers.id, {
        onDelete: "cascade",
      }),
    tokenHash: text("token_hash").notNull(),
    type: verificationTokenTypeEnum("type").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for token lookup during verification
    index("verification_tokens_token_hash_idx").on(table.tokenHash),
    // Index for user's pending verifications
    index("verification_tokens_authly_user_id_idx").on(table.authlyUserId),
    // Index for cleanup of expired tokens
    index("verification_tokens_expires_at_idx").on(table.expiresAt),
  ],
);
