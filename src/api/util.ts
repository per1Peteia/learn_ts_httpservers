import { BadRequestError } from "./errors.js";

export function validChirp(body: string) {
	const maxChirpLength = 140;
	if (body.length > maxChirpLength) {
		throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
	}

	const cleaned = cleanChirp(body);
	return cleaned;
}

export function cleanChirp(body: string): string {
	const words = body.split(" ");

	const badWords = ["kerfuffle", "sharbert", "fornax"];
	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const loweredWord = word.toLowerCase();
		if (badWords.includes(loweredWord)) {
			words[i] = "****";
		}
	}
	return words.join(" ");
}
