ALTER TABLE "providers" ADD COLUMN "municipality" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "phone" text;