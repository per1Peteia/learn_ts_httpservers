import express from "express";
import { handlerReadiness, handlerMetrics, handlerReset, handlerValidateChirp } from "./api/handlers.js";
import { errorHandler, middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";

const app = express();
const port = 8080;


app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(express.json());

app.post("/api/validate_chirp", (req, res, next) => {
	Promise.resolve(handlerValidateChirp(req, res)).catch(next);
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

app.listen(port, () => {
	console.log(`listening on localhost:${port}`);
});

