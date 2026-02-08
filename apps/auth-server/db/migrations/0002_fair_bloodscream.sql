CREATE TYPE "public"."developer_oauth_provider" AS ENUM('google', 'github');--> statement-breakpoint
CREATE TABLE "developer_oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"developer_id" uuid NOT NULL,
	"provider" "developer_oauth_provider" NOT NULL,
	"provider_user_id" text NOT NULL,
	"provider_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "developers" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "developer_oauth_accounts" ADD CONSTRAINT "developer_oauth_accounts_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "developer_oauth_accounts_provider_user_unique_idx" ON "developer_oauth_accounts" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "developer_oauth_accounts_developer_id_idx" ON "developer_oauth_accounts" USING btree ("developer_id");