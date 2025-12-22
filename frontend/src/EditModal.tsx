import React, { useState, ChangeEvent } from "react";
import { TranslationEntry } from "./types";

const VALID_GENDERS = ["male", "female", "neuter", "plural"] as const;

interface EditModalProps {
	entry: TranslationEntry;
	onSave: (updatedEntry: TranslationEntry) => Promise<void>;
	onClose: () => void;
}

function EditModal({ entry, onSave, onClose }: EditModalProps) {
	// Объединяем все поля в один TOML-блок
	const initialTomlValue = `[${entry.key}]
nominative = "${entry.nominative}"
genitive = "${entry.genitive}"
dative = "${entry.dative}"
accusative = "${entry.accusative}"
instrumental = "${entry.instrumental}"
prepositional = "${entry.prepositional}"
gender = "${entry.gender}"`;

	const [tomlText, setTomlText] = useState<string>(initialTomlValue);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setTomlText(e.target.value);
		setError(null); // Сброс ошибки при изменении
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// <<< Разбор TOML-блока >>>
		const lines = tomlText
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);

		let newEntry: Partial<TranslationEntry> = { ...entry };

		for (const line of lines) {
			if (line.startsWith("[") && line.endsWith("]")) continue; // Пропускаем [key]

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
				// Убираем кавычки
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
					return; // Не отправляем
				}
				newEntry[fieldName] = fieldValue as any;
			}
		}

		// Восстанавливаем недостающие поля
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
