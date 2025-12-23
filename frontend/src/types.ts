export interface TranslationEntry {
	key: string;
	source: string;
	nominative: string;
	genitive: string;
	dative: string;
	accusative: string;
	instrumental: string;
	prepositional: string;
	gender: string;
	status: string;
	tags?: string[];
}

export const VALID_TAGS = ["cm13", "ss13"] as const;

export type ValidTag = (typeof VALID_TAGS)[number];
