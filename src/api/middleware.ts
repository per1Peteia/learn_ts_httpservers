import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

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
	res.status(500).json({
		error: "Something went wrong on our end"
	});
}

