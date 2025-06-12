import { describe, it, expect, beforeAll, expectTypeOf } from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "./auth";
import { UnauthorizedError } from "./api/errors";

describe("Password Hashing", () => {
	const password1 = "correctPassword123!";
	const password2 = "anotherPassword456!";
	let hash1: string;
	let hash2: string;

	beforeAll(async () => {
		hash1 = await hashPassword(password1);
		hash2 = await hashPassword(password2);
	});

	it("should return true for the correct password", async () => {
		const result = await checkPasswordHash(password1, hash1);
		expect(result).toBe(true);
	});

});

describe("Validating JWTs", () => {
	const userID = "abc";
	const expiresIn = 3600;
	const secret = "shh";
	const badSecret = "huh";
	let validToken: string;

	beforeAll(async () => {
		validToken = makeJWT(userID, expiresIn, secret)
	});

	it("should validate a valid token", async () => {
		const result = validateJWT(validToken, secret);
		expect(result).toBe(userID);
	});

	it("should throw an error for an invalid token", async () => {
		expect(() => validateJWT("invalidToken", secret)).toThrow(UnauthorizedError);
	});

	it("should throw an error bc wrong secret", async () => {
		expect(() => validateJWT(validToken, badSecret)).toThrow(UnauthorizedError);
	});
});

describe("make refresh token", () => {
	let token: string;

	beforeAll(async () => {
		token = makeRefreshToken();
	})

	it("should return a string", async () => {
		expect(token).toBeTypeOf("string");
	});

	it("should be 32 bytes long", () => {
		expect(token).toHaveLength(64);
	});
});
