import express from "express";
import { handlerReadiness, handlerMetrics, handlerReset } from "./api/handlers.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";

const app = express();
const port = 8080;


app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(port, () => {
	console.log(`listening on localhost:${port}`);
});

