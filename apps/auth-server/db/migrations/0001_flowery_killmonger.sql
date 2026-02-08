ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "access_token";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "refresh_token";--> statement-breakpoint
ALTER TABLE "oauth_accounts" DROP COLUMN "expires_at";