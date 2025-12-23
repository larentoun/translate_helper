import React, { useState, ChangeEvent } from "react";
import { TranslationEntry, VALID_TAGS } from "./types";

const VALID_GENDERS = ["male", "female", "neuter", "plural"] as const;

interface AddModalProps {
	onSave: (newEntry: Omit<TranslationEntry, "status">) => Promise<void>;
	onClose: () => void;
	existingKeys: Set<string>;
}

function AddModal({ onSave, onClose, existingKeys }: AddModalProps) {
	const [key, setKey] = useState<string>("");
	const [tomlText, setTomlText] = useState<string>(`nominative = ""
genitive = ""
dative = ""
accusative = ""
instrumental = ""
prepositional = ""
gender = "male"`);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const handleChangeKey = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setKey(value);
		setError(null);
	};

	const handleChangeToml = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setTomlText(e.target.value);
		setError(null);
	};

	const handleAddTag = () => {
		if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
			setSelectedTags([...selectedTags, newTag.trim()]);
			setNewTag("");
		}
	};

	const handleRemoveTag = (tag: string) => {
		setSelectedTags(selectedTags.filter((t) => t !== tag));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!key.trim()) {
			setError("Ключ не может быть пустым");
			return;
		}

		if (!/^[a-z0-9_]+$/.test(key)) {
			setError(
				"Ключ должен состоять только из латинских букв в нижнем регистре, цифр и подчёркиваний"
			);
			return;
		}

		if (existingKeys.has(key)) {
			setError("Ключ уже существует, дубликаты запрещены");
			return;
		}

		const lines = tomlText
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);

		let newEntry: Partial<Omit<TranslationEntry, "status">> = {
			key: key.trim(),
			source: "unsorted",
			tags: selectedTags,
		};

		for (const line of lines) {
			if (line.startsWith("[") && line.endsWith("]")) continue;

			const [field, value] = line.split("=").map((s) => s.trim());
			if (!field || !value) continue;

			const fieldName = field as keyof Omit<TranslationEntry, "status">;
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
			}
		}

		const requiredFields = [
			"nominative",
			"genitive",
			"dative",
			"accusative",
			"instrumental",
			"prepositional",
			"gender",
		];
		for (const field of requiredFields) {
			if (
				!(field in newEntry) ||
				!newEntry[field as keyof typeof newEntry]?.toString().trim()
			) {
				setError(`Поле ${field} обязательно`);
				return;
			}
		}

		await onSave(newEntry as Omit<TranslationEntry, "status">);
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
				<h3>Добавить новый перевод</h3>
				<label>Ключ:</label>
				<input
					type="text"
					value={key}
					onChange={handleChangeKey}
					required
				/>
				<br />
				<label>TOML-блок:</label>
				<br />
				<textarea
					rows={10}
					cols={60}
					value={tomlText}
					onChange={handleChangeToml}
					style={{ fontFamily: "monospace", fontSize: "12px" }}
				/>
				<br />
				<label>Теги:</label>
				<br />
				<div
					style={{
						display: "flex",
						gap: "10px",
						marginBottom: "10px",
					}}
				>
					<select
						value={newTag}
						onChange={(e) => setNewTag(e.target.value)}
						style={{ flex: 1 }}
					>
						<option value="">Выберите тег</option>
						{VALID_TAGS.map(
							(tag) =>
								!selectedTags.includes(tag) && (
									<option key={tag} value={tag}>
										{tag}
									</option>
								)
						)}
					</select>
					<button
						type="button"
						onClick={handleAddTag}
						disabled={!newTag.trim()}
					>
						Добавить
					</button>
				</div>
				<div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
					{selectedTags.map((tag) => (
						<span
							key={tag}
							style={{
								background: "#e0e0e0",
								padding: "2px 6px",
								borderRadius: "4px",
								display: "flex",
								alignItems: "center",
							}}
						>
							{tag}
							<button
								type="button"
								onClick={() => handleRemoveTag(tag)}
								style={{
									background: "none",
									border: "none",
									marginLeft: "5px",
									cursor: "pointer",
									color: "red",
									fontSize: "12px",
								}}
							>
								×
							</button>
						</span>
					))}
				</div>
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

export default AddModal;
