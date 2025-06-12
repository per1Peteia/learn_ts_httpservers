import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser) {
	const [result] = await db
		.insert(users)
		.values(user)
		.onConflictDoNothing()
		.returning();
	return result;
}

export async function deleteUsers() {
	await db.delete(users);
}

export async function getUserByEmail(email: string) {
	const [result] = await db.select().from(users).where(eq(users.email, email));
	return result;
}

export async function updateUser(id: string, hash: string, email: string) {
	const [result] = await db.update(users).set({ hashedPassword: hash, email: email }).where(eq(users.id, id)).returning();
	return result;
}

export async function updateUserToRed(id: string) {
	const [result] = await db.update(users).set({ isChirpyRed: true }).where(eq(users.id, id)).returning();
	return result;
}
