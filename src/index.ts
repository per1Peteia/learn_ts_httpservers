import express from "express";
import { handlerReadiness, handlerMetrics, handlerReset, handlerCreateUser, handlerCreateChirp, handlerGetChirps, handlerGetChirp, handlerUserLogin, handlerRefresh, handlerRevoke, handlerUpdateUserCreds } from "./api/handlers.js";
import { errorHandler, middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(express.json());

app.post("/api/users", (req, res, next) => {
	Promise.resolve(handlerCreateUser(req, res)).catch(next);
});

app.post("/api/refresh", (req, res, next) => {
	Promise.resolve(handlerRefresh(req, res)).catch(next);
});

app.post("/api/revoke", (req, res, next) => {
	Promise.resolve(handlerRevoke(req, res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
	Promise.resolve(handlerUserLogin(req, res)).catch(next);
});

app.put("/api/users", (req, res, next) => {
	Promise.resolve(handlerUpdateUserCreds(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
	Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
	Promise.resolve(handlerGetChirps(req, res)).catch(next);
});

app.get("/api/chirps/:chirpID", (req, res, next) => {
	Promise.resolve(handlerGetChirp(req, res)).catch(next);
});

app.get("/api/healthz", (req, res, next) => {
	Promise.resolve(handlerReadiness(req, res)).catch(next)
});
app.get("/admin/metrics", (req, res, next) => {
	Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
	Promise.resolve(handlerReset(req, res)).catch(next);
});

app.use(errorHandler);

app.listen(config.api.port, () => {
	console.log(`listening on localhost:${config.api.port}`);
});

