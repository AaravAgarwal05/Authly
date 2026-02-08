import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { projects } from "./project";

// Enum for webhook events
export const webhookEventEnum = pgEnum("webhook_event", [
  "user.created",
  "user.updated",
  "user.deleted",
  "session.created",
  "session.revoked",
  "email.verified",
  "password.changed",
]);

// Enum for actor types in audit logs
export const actorTypeEnum = pgEnum("actor_type", [
  "developer",
  "user",
  "system",
  "api_key",
]);

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    event: webhookEventEnum("event").notNull(),
    secret: text("secret").notNull(), // For webhook signature verification
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for fetching project webhooks
    index("webhooks_project_id_idx").on(table.projectId),
    // Index for active webhooks by event
    index("webhooks_project_event_active_idx").on(
      table.projectId,
      table.event,
      table.isActive,
    ),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    actorType: actorTypeEnum("actor_type").notNull(),
    actorId: uuid("actor_id"), // Can be null for system actions
    action: text("action").notNull(),
    resourceType: text("resource_type"), // e.g., "user", "session", "project"
    resourceId: uuid("resource_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(), // Structured JSON instead of text
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Index for project audit logs
    index("audit_logs_project_id_idx").on(table.projectId),
    // Index for actor lookups
    index("audit_logs_actor_type_actor_id_idx").on(
      table.actorType,
      table.actorId,
    ),
    // Index for time-based queries (compliance, debugging)
    index("audit_logs_created_at_idx").on(table.createdAt),
    // Index for resource lookups
    index("audit_logs_resource_type_resource_id_idx").on(
      table.resourceType,
      table.resourceId,
    ),
  ],
);
