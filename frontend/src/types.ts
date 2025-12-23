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

export const VALID_TAGS = ["nominative_only", "cm13", "ss13"] as const;

export type ValidTag = (typeof VALID_TAGS)[number];

export const VALID_GENDERS = ["male", "female", "neuter", "plural"] as const;

export const REQUIRED_FIELDS = [
	"nominative",
	"genitive",
	"dative",
	"accusative",
	"instrumental",
	"prepositional",
	"gender",
] as const;

export const NOMINATIVE_ONLY_FIELDS = ["nominative"] as const;
