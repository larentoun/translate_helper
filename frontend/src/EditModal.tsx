import React, { useState, ChangeEvent } from "react";
import { TranslationEntry } from "./types";

const VALID_GENDERS = ["male", "female", "neuter", "plural"] as const;

interface EditModalProps {
	entry: TranslationEntry;
	onSave: (updatedEntry: TranslationEntry) => Promise<void>;
	onClose: () => void;
}

function EditModal({ entry, onSave, onClose }: EditModalProps) {
	const initialTomlValue = `[${entry.key}]
nominative = "${entry.nominative}"
genitive = "${entry.genitive}"
dative = "${entry.dative}"
accusative = "${entry.accusative}"
instrumental = "${entry.instrumental}"
prepositional = "${entry.prepositional}"
gender = "${entry.gender}"
tags = [${entry.tags ? entry.tags.map((tag) => `"${tag}"`).join(", ") : ""}]`;

	const [tomlText, setTomlText] = useState<string>(initialTomlValue);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setTomlText(e.target.value);
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const lines = tomlText
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);

		let newEntry: Partial<TranslationEntry> = { ...entry };

		for (const line of lines) {
			if (line.startsWith("[") && line.endsWith("]")) continue;

			const [key, value] = line.split("=").map((s) => s.trim());
			if (!key || !value) continue;

			const fieldName = key as keyof TranslationEntry;
			if (
				[
					"nominative",
					"genitive",
					"dative",
					"accusative",
					"instrumental",
					"prepositional",
					"gender",
				].includes(fieldName)
			) {
				const fieldValue = value.replace(/"/g, "");
				if (
					fieldName === "gender" &&
					!VALID_GENDERS.includes(fieldValue as any)
				) {
					setError(
						`Поле gender должно быть одним из: ${VALID_GENDERS.join(
							", "
						)}`
					);
					return;
				}
				newEntry[fieldName] = fieldValue as any;
			} else if (key === "tags") {
				const tagsValue = value.trim();
				if (tagsValue.startsWith("[") && tagsValue.endsWith("]")) {
					const tagsContent = tagsValue
						.substring(1, tagsValue.length - 1)
						.trim();
					if (tagsContent) {
						const tagList = tagsContent
							.split(",")
							.map((tag) => tag.trim())
							.map((tag) => tag.replace(/"/g, ""))
							.filter((tag) => tag);
						newEntry.tags = tagList;
					} else {
						newEntry.tags = [];
					}
				}
			}
		}

		newEntry = {
			...entry,
			...newEntry,
		};

		await onSave(newEntry as TranslationEntry);
		onClose();
	};

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				background: "rgba(0,0,0,0.5)",
			}}
		>
			<form
				onSubmit={handleSubmit}
				style={{
					margin: "auto",
					marginTop: "100px",
					width: "600px",
					background: "white",
					padding: "20px",
				}}
			>
				<h3>
					Редактировать перевод: {entry.key} (источник: {entry.source}
					)
				</h3>
				<label>Введите TOML-блок:</label>
				<br />
				<textarea
					rows={10}
					cols={60}
					value={tomlText}
					onChange={handleChange}
					style={{ fontFamily: "monospace", fontSize: "12px" }}
				/>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<br />
				<button type="submit">Сохранить</button>
				<button type="button" onClick={onClose}>
					Отмена
				</button>
			</form>
		</div>
	);
}

export default EditModal;
