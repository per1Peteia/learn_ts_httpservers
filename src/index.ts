import express from "express";
import { handlerReadiness, handlerMetrics, handlerReset, handlerValidateChirp } from "./api/handlers.js";
import { errorHandler, middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";

const app = express();
const port = 8080;


app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.post("/api/validate_chirp", express.json(), async (req, res, next) => {
	try {
		await handlerValidateChirp(req, res);
	} catch (e) {
		next(e);
	}
});

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.use(errorHandler);

app.listen(port, () => {
	console.log(`listening on localhost:${port}`);
});

