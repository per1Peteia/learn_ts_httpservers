import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
	api: APIConfig;
	db: DBConfig;
	jwt: JWTConfig;
};

type APIConfig = {
	fileServerHits: number;
	port: number;
	platform: string;
	apiKey: string;
}

type DBConfig = {
	url: string;
	migrationConfig: MigrationConfig;
}

type JWTConfig = {
	secret: string;
	defaultDuration: number;
	issuer: string;
}

process.loadEnvFile();
const url = envOrThrow("DB_URL");
const port = Number(envOrThrow("PORT"));
const platform = envOrThrow("PLATFORM");
const migrationConfig: MigrationConfig = {
	migrationsFolder: "./src/lib/db/",
};
const secret = envOrThrow("SECRET");
const apiKey = envOrThrow("POLKA_KEY");

export const config: Config = {
	api: {
		fileServerHits: 0,
		port: port,
		platform: platform,
		apiKey: apiKey,
	},
	db: {
		url: url,
		migrationConfig: migrationConfig,
	},
	jwt: {
		secret: secret,
		defaultDuration: 3600,
		issuer: "chirpy",
	},
};

function envOrThrow(key: string) {
	const val = process.env[key];
	if (!val) {
		throw new Error(`environment variable ${key} is not set`);
	}
	return val;
}


