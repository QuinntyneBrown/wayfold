ALTER TABLE "users" ADD COLUMN "gta_area" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "home_church" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "show_home_church" boolean DEFAULT false NOT NULL;