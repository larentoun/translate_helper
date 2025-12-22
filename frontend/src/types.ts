export interface TranslationEntry {
	key: string;
	language: string;
	nominative: string;
	genitive: string;
	dative: string;
	accusative: string;
	instrumental: string;
	prepositional: string;
	gender: string;
	status: boolean | "конфликт";
}
