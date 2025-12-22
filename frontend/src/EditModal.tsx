import React, { useState, ChangeEvent } from "react";
import { TranslationEntry } from "./types"; // Импорт интерфейса

interface EditModalProps {
	entry: TranslationEntry;
	onSave: (updatedEntry: TranslationEntry) => Promise<void>;
	onClose: () => void;
}

function EditModal({ entry, onSave, onClose }: EditModalProps) {
	// Убираем `status` из состояния, т.к. оно вычисляется на бэкенде
	const [data, setData] = useState<Omit<TranslationEntry, "status">>({
		...entry,
	}); // Omit status

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// Восстанавливаем `status` перед сохранением, т.к. бэкенд его сам посчитает
		await onSave(data as TranslationEntry); // Мы знаем, что `status` не нужно отправлять
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
				<h3>Редактировать перевод: {data.key}</h3>
				<label>nominative:</label>
				<input
					name="nominative"
					value={data.nominative}
					onChange={handleChange}
					required
				/>

				<label>genitive:</label>
				<input
					name="genitive"
					value={data.genitive}
					onChange={handleChange}
				/>

				<label>dative:</label>
				<input
					name="dative"
					value={data.dative}
					onChange={handleChange}
				/>

				<label>accusative:</label>
				<input
					name="accusative"
					value={data.accusative}
					onChange={handleChange}
				/>

				<label>instrumental:</label>
				<input
					name="instrumental"
					value={data.instrumental}
					onChange={handleChange}
				/>

				<label>prepositional:</label>
				<input
					name="prepositional"
					value={data.prepositional}
					onChange={handleChange}
				/>

				<label>gender:</label>
				<input
					name="gender"
					value={data.gender}
					onChange={handleChange}
				/>

				<button type="submit">Сохранить</button>
				<button type="button" onClick={onClose}>
					Отмена
				</button>
			</form>
		</div>
	);
}

export default EditModal;
