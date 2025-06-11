import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./api/errors";

export async function hashPassword(password: string) {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
	return bcrypt.compare(password, hash);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
	const issuedAt = Math.floor(Date.now() / 1000);
	const payload: payload = {
		iss: "chirpy",
		sub: userID,
		iat: issuedAt,
		exp: issuedAt + expiresIn,
	}

	return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
	try {
		const payload = jwt.verify(tokenString, secret);
		return payload.sub as string;
	} catch (e) {
		throw new UnauthorizedError(`401 Error: ${(e as Error).message}`);
	}
}
