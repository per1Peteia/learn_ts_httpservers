import { Response, Request } from "express"
import { config } from "../config.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { cleanChirp } from "./util.js";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
	res.set("Content-Type", "text/plain; charset=utf-8");
	res.send("OK");
	res.end();
}

export async function handlerMetrics(_: Request, res: Response) {
	res.set("Content-Type", "text/html; charset=utf-8");
	res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileServerHits} times!</p>
  </body>
</html>
`);
	res.end();
}

export async function handlerReset(_: Request, res: Response): Promise<void> {
	config.fileServerHits = 0;
	res.set("Content-Type", "text/plain; charset=utf-8");
	res.send(`fileserver hits reset to 0\n`);
	res.end();
}

export async function handlerValidateChirp(req: Request, res: Response): Promise<void> {
	type parameters = { body: string };
	try {
		const params: parameters = req.body;

		if (params.body.length > 140) {
			throw new Error(`Chirp is too long`);
		}

		const result = cleanChirp(params.body);

		respondWithJSON(res, 200, { cleanedBody: result });
	} catch (e) {
		respondWithError(res, 400, (e as Error).message);
	}

	// this is an example of manual json streaming and parsing
	//
	// let body = "";
	//
	// req.on("data", (chunk) => {
	// 	body += chunk;
	// });
	//
	// req.on("end", () => {
	// 	try {
	// 		let params: parameters;
	//
	// 		try {
	// 			params = JSON.parse(body);
	// 		} catch (e) {
	// 			throw new Error(`Invalid JSON`);
	// 		}
	//
	// 		const maxChirpLength = 140;
	// 		if (params.body.length > maxChirpLength) {
	// 			throw new Error(`Chirp is too long`);
	// 		}
	//
	// 		respondWithJSON(res, 200, { valid: true })
	// 	} catch (e) {
	// 		respondWithError(res, 400, (e as Error).message)
	// 	}
	// });
}

