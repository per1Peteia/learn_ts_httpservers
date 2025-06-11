import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
	api: APIConfig;
	db: DBConfig;
};

type APIConfig = {
	fileServerHits: number;
	port: number;
	platform: string;
	secret: string;
}

type DBConfig = {
	url: string;
	migrationConfig: MigrationConfig;
}

process.loadEnvFile();
const url = envOrThrow("DB_URL");
const port = Number(envOrThrow("PORT"));
const platform = envOrThrow("PLATFORM");
const migrationConfig: MigrationConfig = {
	migrationsFolder: "./src/lib/db/",
};
const secret = envOrThrow("SECRET");

export const config: Config = {
	api: {
		fileServerHits: 0,
		port: port,
		platform: platform,
		secret: secret,
	},
	db: {
		url: url,
		migrationConfig: migrationConfig,
	}
}

function envOrThrow(key: string) {
	const val = process.env[key];
	if (!val) {
		throw new Error(`environment variable ${key} is not set`);
	}
	return val;
}


