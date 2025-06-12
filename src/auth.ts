import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./api/errors.js";
import { Request } from "express";
import crypto from "crypto";

export async function hashPassword(password: string) {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
	return bcrypt.compare(password, hash);
}

const TOKEN_ISSUER = "chirpy";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + expiresIn;
	const token = jwt.sign(
		{
			iss: TOKEN_ISSUER,
			sub: userID,
			iat: issuedAt,
			exp: expiresAt,
		} satisfies payload,
		secret,
		{ algorithm: "HS256" },
	);

	return token;
}

export function validateJWT(tokenString: string, secret: string): string {
	let decoded: payload;
	try {
		decoded = jwt.verify(tokenString, secret) as JwtPayload;
	} catch (e) {
		throw new UnauthorizedError("Invalid token");
	}

	if (decoded.iss !== TOKEN_ISSUER) {
		throw new UnauthorizedError("Invalid issuer");
	}

	if (!decoded.sub) {
		throw new UnauthorizedError("No user ID in token");
	}

	return decoded.sub;
}

export function getBearerToken(req: Request): string {
	const header = req.get("Authorization")
	if (!header) {
		throw new UnauthorizedError(`malformed authorization header`);
	}
	const splitAuth = header.split(" ");
	if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
		throw new BadRequestError(`malformed authorization header`);
	}
	return splitAuth[1];
}

export function makeRefreshToken() {
	return crypto.randomBytes(32).toString('hex')
}
