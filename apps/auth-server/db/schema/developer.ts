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

// Enum for OAuth providers
export const developerOAuthProviderEnum = pgEnum("developer_oauth_provider", [
  "google",
  "github",
]);

// Enum for organization member roles
export const organizationRoleEnum = pgEnum("organization_role", [
  "owner",
  "admin",
  "member",
]);

export const developers = pgTable(
  "developers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for email lookups (login, password reset)
    index("developers_email_idx").on(table.email),
  ],
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // URL-friendly identifier
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("organizations_slug_idx").on(table.slug)],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    developerId: uuid("developer_id")
      .notNull()
      .references(() => developers.id, { onDelete: "cascade" }),
    role: organizationRoleEnum("role").default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Prevent duplicate memberships
    uniqueIndex("organization_members_org_dev_unique_idx").on(
      table.organizationId,
      table.developerId,
    ),
    // Index for fetching organization members
    index("organization_members_organization_id_idx").on(table.organizationId),
    // Index for fetching developer's organizations
    index("organization_members_developer_id_idx").on(table.developerId),
  ],
);

export const developerOAuthAccounts = pgTable(
  "developer_oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    developerId: uuid("developer_id")
      .notNull()
      .references(() => developers.id, { onDelete: "cascade" }),
    provider: developerOAuthProviderEnum("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    providerEmail: text("provider_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Prevent duplicate provider accounts
    uniqueIndex("developer_oauth_accounts_provider_user_unique_idx").on(
      table.provider,
      table.providerUserId,
    ),
    // Index for fetching developer's OAuth accounts
    index("developer_oauth_accounts_developer_id_idx").on(table.developerId),
  ],
);
