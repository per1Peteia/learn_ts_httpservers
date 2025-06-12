import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";


export async function CreateRefreshToken(token: string, id: string, duration: Date) {
	const [result] = await db.insert(refreshTokens).values({ token: token, userId: id, expiresAt: duration }).returning()
	return result;
}

export async function getUserFromRefreshToken(token: string) {
	const [result] = await db
		.select({
			userId: users.id,
			token: refreshTokens.token,
			revoked: refreshTokens.revokedAt,
		})
		.from(users)
		.innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
		.where(eq(refreshTokens.token, token))
	return result;
}

export async function revokeRefreshToken(token: string) {
	const [result] = await db.update(refreshTokens).set({ updatedAt: new Date, revokedAt: new Date }).where(eq(refreshTokens.token, token)).returning();
	return result;
}
