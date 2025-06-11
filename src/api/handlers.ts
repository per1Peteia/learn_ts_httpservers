import { Response, Request } from "express"
import { config } from "../config.js";
import { respondWithJSON } from "./json.js";
import { validChirp } from "./util.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createUser, deleteUsers, getUserByEmail } from "../lib/db/queries/users.js";
import { createChirp, getChirpById, getChirps } from "../lib/db/queries/chirps.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, validateJWT } from "../auth.js";
import { NewUser } from "src/lib/db/schema.js";

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
    <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
  </body>
</html>
`);
	res.end();
}

export async function handlerReset(_: Request, res: Response): Promise<void> {
	if (config.api.platform !== "dev") {
		throw new ForbiddenError(`Not authorized`);
	}
	config.api.fileServerHits = 0;
	await deleteUsers();
	respondWithJSON(res, 200, { body: "fileserver hits reset, users deleted" });
}


export async function handlerCreateChirp(req: Request, res: Response): Promise<void> {
	type parameters = {
		body: string,
	};

	const params: parameters = req.body;

	if (!params.body) {
		throw new BadRequestError(`missing required fields`);
	}

	const token = getBearerToken(req)
	const userId = validateJWT(token, config.api.secret)

	const cleanBody = validChirp(params.body)
	if (!cleanBody) {
		throw new Error(`failed validation`);
	}

	const chirp = await createChirp({ body: cleanBody, userId: userId });
	if (!chirp) {
		throw new Error(`cannot create chirp`);
	}

	respondWithJSON(res, 201, chirp);
}

export async function handlerGetChirps(_: Request, res: Response): Promise<void> {
	const chirps = await getChirps();
	if (chirps.length === 0) {
		throw new Error(`could'nt get chirps`);
	}
	respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirp(req: Request, res: Response): Promise<void> {
	const id = req.params.chirpID
	const chirp = await getChirpById(id);
	if (!chirp) {
		throw new NotFoundError(`cannot find chirp`);
	}

	respondWithJSON(res, 200, chirp);
}

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
	type parameters = {
		password: string;
		email: string;
	};
	const params: parameters = req.body;

	if (!params.email || !params.password) {
		throw new BadRequestError(`missing required fields`)
	}

	const hash = await hashPassword(params.password);

	const user = await createUser({
		hashedPassword: hash,
		email: params.email
	} satisfies NewUser);

	if (!user) {
		throw new Error(`cannot create user`);
	}

	respondWithJSON(res, 201, {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	} satisfies UserResponse);
}

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUserLogin(req: Request, res: Response): Promise<void> {
	type parameters = {
		password: string;
		email: string;
		expiresInSeconds: number;
	}

	const params: parameters = req.body;

	if (!params.password || !params.email) {
		throw new BadRequestError(`missing required fields`);
	}

	const user = await getUserByEmail(params.email);
	if (!user) {
		throw new Error(`couldn't find user`);
	}

	if (!await checkPasswordHash(params.password, user.hashedPassword)) {
		throw new UnauthorizedError(`Incorrect email or password`);
	}

	let expiresIn = params.expiresInSeconds;
	if (!params.expiresInSeconds || params.expiresInSeconds > 3600) {
		expiresIn = 3600;
	}

	const token = makeJWT(user.id, expiresIn, config.api.secret);

	respondWithJSON(res, 200, {
		id: user.id,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		email: user.email,
		token: token,
	});
}
