CREATE TABLE "chirps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"body" text NOT NULL,
	"userID" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_userID_users_id_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;