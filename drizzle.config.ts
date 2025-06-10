import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
	schema: "src/lib/db/schema.ts",
	out: "src/lib/db/",
	dialect: "postgresql",
	dbCredentials: {
		url: config.db.url,
	},
});
