ALTER TABLE "chirps" RENAME COLUMN "userID" TO "userId";--> statement-breakpoint
ALTER TABLE "chirps" DROP CONSTRAINT "chirps_userID_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;