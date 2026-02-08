import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { projects } from "./project";

// Enum for OAuth providers (extensible)
export const oauthProviderEnum = pgEnum("oauth_provider", [
  "google",
  "github",
  "microsoft",
  "apple",
]);

export const authlyUsers = pgTable(
  "authly_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for email lookups
    index("authly_users_email_idx").on(table.email),
  ],
);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: oauthProviderEnum("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    authlyUserId: uuid("authly_user_id")
      .notNull()
      .references(() => authlyUsers.id, {
        onDelete: "cascade",
      }),
    // Note: We don't store provider access/refresh tokens
    // Authly only verifies identity via OAuth, then discards provider tokens
    // If you need to call provider APIs later, store encrypted tokens separately
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Prevent duplicate OAuth accounts (one provider account per user)
    uniqueIndex("oauth_accounts_provider_user_unique_idx").on(
      table.provider,
      table.providerUserId,
    ),
    // Index for finding user's OAuth accounts
    index("oauth_accounts_authly_user_id_idx").on(table.authlyUserId),
  ],
);

export const projectUsers = pgTable(
  "project_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
      }),
    authlyUserId: uuid("authly_user_id")
      .notNull()
      .references(() => authlyUsers.id, {
        onDelete: "cascade",
      }),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Prevent duplicate project user registrations
    uniqueIndex("project_users_project_authly_user_unique_idx").on(
      table.projectId,
      table.authlyUserId,
    ),
    // Index for project user lookups
    index("project_users_project_id_idx").on(table.projectId),
    // Index for user's projects
    index("project_users_authly_user_id_idx").on(table.authlyUserId),
  ],
);
