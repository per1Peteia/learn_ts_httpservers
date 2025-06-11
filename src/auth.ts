import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./api/errors.js";
import { Request } from "express";

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
	const tokenStr = req.get("Authorization")
	if (!tokenStr) {
		throw new UnauthorizedError(`missing authorization token`);
	}
	const token = tokenStr.split(" ")[1];
	return token;
}
