import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";

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
	config.api.fileServerHits++;
	next();
}

export function errorHandler(err: Error, _: Request, res: Response, __: NextFunction): void {
	let code = 500;
	let message = "Something went wrong on our end";
	if (err instanceof BadRequestError) {
		code = 400;
		message = err.message;
	} else if (err instanceof UnauthorizedError) {
		code = 401;
		message = err.message;
	} else if (err instanceof ForbiddenError) {
		code = 403;
		message = err.message;
	} else if (err instanceof NotFoundError) {
		code = 404;
		message = err.message;
	}

	respondWithError(res, code, message);
}

