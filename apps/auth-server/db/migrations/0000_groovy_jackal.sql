CREATE TYPE "public"."verification_token_type" AS ENUM('email_verify', 'password_reset');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."oauth_provider" AS ENUM('google', 'github', 'microsoft', 'apple');--> statement-breakpoint
CREATE TYPE "public"."actor_type" AS ENUM('developer', 'user', 'system', 'api_key');--> statement-breakpoint
CREATE TYPE "public"."webhook_event" AS ENUM('user.created', 'user.updated', 'user.deleted', 'session.created', 'session.revoked', 'email.verified', 'password.changed');--> statement-breakpoint
CREATE TYPE "public"."project_key_type" AS ENUM('publishable', 'secret');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authly_user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"type" "verification_token_type" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "developers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"developer_id" uuid NOT NULL,
	"role" "organization_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "authly_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "authly_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "oauth_provider" NOT NULL,
	"provider_user_id" text NOT NULL,
	"authly_user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"authly_user_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"actor_type" "actor_type" NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" uuid,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" text NOT NULL,
	"event" "webhook_event" NOT NULL,
	"secret" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_auth_settings" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"enable_email_password" boolean DEFAULT true NOT NULL,
	"enable_google_oauth" boolean DEFAULT false NOT NULL,
	"enable_github_oauth" boolean DEFAULT false NOT NULL,
	"enable_microsoft_oauth" boolean DEFAULT false NOT NULL,
	"enable_apple_oauth" boolean DEFAULT false NOT NULL,
	"require_email_verification" boolean DEFAULT true NOT NULL,
	"allow_signup" boolean DEFAULT true NOT NULL,
	"access_token_ttl_minutes" integer DEFAULT 15 NOT NULL,
	"refresh_token_ttl_days" integer DEFAULT 7 NOT NULL,
	"min_password_length" integer DEFAULT 8 NOT NULL,
	"require_uppercase" boolean DEFAULT false NOT NULL,
	"require_numbers" boolean DEFAULT false NOT NULL,
	"require_special_chars" boolean DEFAULT false NOT NULL,
	"max_login_attempts" integer DEFAULT 5 NOT NULL,
	"lockout_duration_minutes" integer DEFAULT 15 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" "project_key_type" NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"name" text,
	"last_used_at" timestamp with time zone,
	"revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_developer_id" uuid NOT NULL,
	"organization_id" uuid,
	"allowed_origins" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_project_user_id_project_users_id_fk" FOREIGN KEY ("project_user_id") REFERENCES "public"."project_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_authly_user_id_authly_users_id_fk" FOREIGN KEY ("authly_user_id") REFERENCES "public"."authly_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_authly_user_id_authly_users_id_fk" FOREIGN KEY ("authly_user_id") REFERENCES "public"."authly_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_authly_user_id_authly_users_id_fk" FOREIGN KEY ("authly_user_id") REFERENCES "public"."authly_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_auth_settings" ADD CONSTRAINT "project_auth_settings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_keys" ADD CONSTRAINT "project_keys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_developer_id_developers_id_fk" FOREIGN KEY ("owner_developer_id") REFERENCES "public"."developers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_project_user_id_idx" ON "sessions" USING btree ("project_user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_refresh_token_hash_idx" ON "sessions" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "verification_tokens_token_hash_idx" ON "verification_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "verification_tokens_authly_user_id_idx" ON "verification_tokens" USING btree ("authly_user_id");--> statement-breakpoint
CREATE INDEX "verification_tokens_expires_at_idx" ON "verification_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "developers_email_idx" ON "developers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_org_dev_unique_idx" ON "organization_members" USING btree ("organization_id","developer_id");--> statement-breakpoint
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_developer_id_idx" ON "organization_members" USING btree ("developer_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "authly_users_email_idx" ON "authly_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_accounts_provider_user_unique_idx" ON "oauth_accounts" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "oauth_accounts_authly_user_id_idx" ON "oauth_accounts" USING btree ("authly_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_users_project_authly_user_unique_idx" ON "project_users" USING btree ("project_id","authly_user_id");--> statement-breakpoint
CREATE INDEX "project_users_project_id_idx" ON "project_users" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_users_authly_user_id_idx" ON "project_users" USING btree ("authly_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_project_id_idx" ON "audit_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_type_actor_id_idx" ON "audit_logs" USING btree ("actor_type","actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "webhooks_project_id_idx" ON "webhooks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "webhooks_project_event_active_idx" ON "webhooks" USING btree ("project_id","event","is_active");--> statement-breakpoint
CREATE INDEX "project_keys_key_hash_idx" ON "project_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "project_keys_project_id_idx" ON "project_keys" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_keys_project_id_revoked_idx" ON "project_keys" USING btree ("project_id","revoked");--> statement-breakpoint
CREATE INDEX "projects_owner_developer_id_idx" ON "projects" USING btree ("owner_developer_id");--> statement-breakpoint
CREATE INDEX "projects_organization_id_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");