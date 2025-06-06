import { Response, Request } from "express"
import { config } from "../config.js";

export async function handlerReadiness(_: Request, res: Response): Promise<void> {
	res.set("Content-Type", "text/plain; charset=utf-8");
	res.send("OK");
	res.end();
}

export async function handlerMetrics(_: Request, res: Response): Promise<void> {
	res.set("Content-Type", "text/plain; charset=utf-8");
	res.send(`Hits: ${config.fileServerHits}\n`);
	res.end();
}

export async function handlerReset(_: Request, res: Response): Promise<void> {
	config.fileServerHits = 0;
	res.set("Content-Type", "text/plain; charset=utf-8");
	res.send(`fileserver hits reset to 0\n`);
	res.end();

}
