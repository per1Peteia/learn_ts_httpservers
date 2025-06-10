import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction): void {
	res.on("finish", () => {
		const status = res.statusCode;
		if (status !== 200) {
			console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status}`);
		}
	});
	next();
}

export function middlewareMetricsInc(_: Request, __: Response, next: NextFunction): void {
	config.fileServerHits++;
	next();
}

export function errorHandler(err: Error, _: Request, res: Response, __: NextFunction): void {
	const code = 500;
	const message = "Something went wrong on our end";
	console.error(err.message);
	respondWithError(res, code, message);
}

