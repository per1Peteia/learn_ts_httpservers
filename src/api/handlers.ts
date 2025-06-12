import { Response, Request } from "express"
import { config } from "../config.js";
import { respondWithJSON } from "./json.js";
import { validChirp } from "./util.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createUser, deleteUsers, getUserByEmail, updateUser } from "../lib/db/queries/users.js";
import { createChirp, getChirpById, getChirps } from "../lib/db/queries/chirps.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "../auth.js";
import { NewUser } from "../lib/db/schema.js";
import { CreateRefreshToken, getUserFromRefreshToken, revokeRefreshToken } from "../lib/db/queries/auth.js";

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
	const userId = validateJWT(token, config.jwt.secret)

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
type LoginResponse = UserResponse & { token: string, refreshToken: string };

export async function handlerUserLogin(req: Request, res: Response): Promise<void> {
	type parameters = {
		password: string;
		email: string;
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

	const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

	const refreshToken = makeRefreshToken();
	const expDate = new Date(Date.now() + (1000 * 60 * 60 * 24 * 60))
	const ok = await CreateRefreshToken(refreshToken, user.id, expDate);
	if (!ok) {
		throw new Error(`could not add refresh token to db`);
	}

	respondWithJSON(res, 200, {
		id: user.id,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		email: user.email,
		token: accessToken,
		refreshToken: refreshToken,
	} satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response): Promise<void> {
	const refreshToken = getBearerToken(req);
	const result = await getUserFromRefreshToken(refreshToken);
	if (result.revoked) {
		throw new UnauthorizedError(`refresh token is revoked`);
	}
	if (!result.userId) {
		throw new UnauthorizedError(`no user found`);
	}

	const accessToken = makeJWT(result.userId, config.jwt.defaultDuration, config.jwt.secret);
	respondWithJSON(res, 200, { token: accessToken })
}

export async function handlerRevoke(req: Request, res: Response): Promise<void> {
	const refreshToken = getBearerToken(req);
	const ok = await revokeRefreshToken(refreshToken);
	if (!ok) {
		throw new Error(`could not update refresh token revoke time`);
	}
	res.status(204).send();
}

export async function handlerUpdateUserCreds(req: Request, res: Response): Promise<void> {
	const aToken = getBearerToken(req);
	const userId = validateJWT(aToken, config.jwt.secret)

	type parameters = {
		password: string;
		email: string;
	}

	const params: parameters = req.body;
	if (!params.password) {
		throw new BadRequestError(`missing password`);
	}
	if (!params.email) {
		throw new BadRequestError(`missing email`);
	}

	const hash = await hashPassword(params.password);
	const user = await updateUser(userId, hash, params.email);
	if (!user) {
		throw new Error(`could not update user creds`);
	}

	respondWithJSON(res, 200, {
		id: user.id,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		email: user.email,
	} satisfies UserResponse);
}
