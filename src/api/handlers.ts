import { Response, Request } from "express"
import { config } from "../config.js";

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
	let body = "";

	req.on("data", (chunk) => {
		body += chunk;
	});

	req.on("end", () => {
		try {
			const payload = JSON.parse(body);
			if (payload.body.length > 140) {
				throw new Error(`Chirp is too long`);
			}
			res.header("Content-Type", "application/json");
			res.status(200).send(JSON.stringify({ "valid": true }));
			res.end();
		} catch (e) {
			res.header("Content-Type", "application/json");
			res.status(400).send(JSON.stringify({ "error": `${(e as Error).message}` }));
			res.end();
		}
	});
}

