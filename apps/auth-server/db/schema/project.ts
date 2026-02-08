import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { developers, organizations } from "./developer";

// Enum for project key types
export const projectKeyTypeEnum = pgEnum("project_key_type", [
  "publishable",
  "secret",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // URL-friendly project identifier
    ownerDeveloperId: uuid("owner_developer_id")
      .notNull()
      .references(() => developers.id, { onDelete: "restrict" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }), // Optional org ownership
    allowedOrigins: text("allowed_origins").array().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for developer's projects
    index("projects_owner_developer_id_idx").on(table.ownerDeveloperId),
    // Index for organization's projects
    index("projects_organization_id_idx").on(table.organizationId),
    // Index for slug lookups
    index("projects_slug_idx").on(table.slug),
  ],
);

export const projectKeys = pgTable(
  "project_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
      }),
    type: projectKeyTypeEnum("type").notNull(),
    keyHash: text("key_hash").notNull(), // Store hashed version for security
    keyPrefix: text("key_prefix").notNull(), // Store prefix for identification (e.g., "pk_live_" or "sk_live_")
    name: text("name"), // Optional friendly name for the key
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revoked: boolean("revoked").default(false).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for key lookups during API authentication
    index("project_keys_key_hash_idx").on(table.keyHash),
    // Index for project's keys
    index("project_keys_project_id_idx").on(table.projectId),
    // Index for active keys only
    index("project_keys_project_id_revoked_idx").on(
      table.projectId,
      table.revoked,
    ),
  ],
);

export const projectAuthSettings = pgTable("project_auth_settings", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),

  // Auth method toggles
  enableEmailPassword: boolean("enable_email_password").default(true).notNull(),
  enableGoogleOAuth: boolean("enable_google_oauth").default(false).notNull(),
  enableGithubOAuth: boolean("enable_github_oauth").default(false).notNull(),
  enableMicrosoftOAuth: boolean("enable_microsoft_oauth")
    .default(false)
    .notNull(),
  enableAppleOAuth: boolean("enable_apple_oauth").default(false).notNull(),

  // Security settings
  requireEmailVerification: boolean("require_email_verification")
    .default(true)
    .notNull(),
  allowSignup: boolean("allow_signup").default(true).notNull(),

  // Token TTL (stored as integers for proper math operations)
  accessTokenTTLMinutes: integer("access_token_ttl_minutes")
    .default(15)
    .notNull(),
  refreshTokenTTLDays: integer("refresh_token_ttl_days").default(7).notNull(),

  // Password policy
  minPasswordLength: integer("min_password_length").default(8).notNull(),
  requireUppercase: boolean("require_uppercase").default(false).notNull(),
  requireNumbers: boolean("require_numbers").default(false).notNull(),
  requireSpecialChars: boolean("require_special_chars")
    .default(false)
    .notNull(),

  // Rate limiting
  maxLoginAttempts: integer("max_login_attempts").default(5).notNull(),
  lockoutDurationMinutes: integer("lockout_duration_minutes")
    .default(15)
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
