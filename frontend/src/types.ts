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
	status: boolean | "конфликт";
}
