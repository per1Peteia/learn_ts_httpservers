import { Response } from "express";

export function respondWithJSON(res: Response, code: number, payload: any) {
	res.header("Content-Type", "application/json");
	res.status(code).send(JSON.stringify(payload));
	res.end();
}

export function respondWithError(res: Response, code: number, message: string) {
	respondWithJSON(res, code, { error: message });
}
