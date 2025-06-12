import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
	const [result] = await db
		.insert(chirps)
		.values(chirp)
		.returning()

	return result;
}

export async function getChirps() {
	const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
	return result;
}

export async function getChirpById(chirpId: string) {
	const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
	return result;
}

export async function deleteChirpById(chirpId: string) {
	const [result] = await db.delete(chirps).where(eq(chirps.id, chirpId)).returning();
	return result;
}
