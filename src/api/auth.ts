import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

export async function checkPasswordHash(password: string, hash: string) {
	return bcrypt.compare(password, hash);
}
