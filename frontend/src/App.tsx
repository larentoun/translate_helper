import React, { useState, useEffect } from "react";
import axios from "axios";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import ImportModal from "./ImportModal";
import { TranslationEntry } from "./types";

function App() {
	const [entries, setEntries] = useState<TranslationEntry[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [editingEntry, setEditingEntry] = useState<TranslationEntry | null>(
		null
	);
	const [showAddModal, setShowAddModal] = useState<boolean>(false);
	const [showImportModal, setShowImportModal] = useState<boolean>(false);

	const fetchEntries = async () => {
		try {
			const res = await axios.get<{ entries: TranslationEntry[] }>(
				"http://localhost:8000/entries"
			);
			setEntries(res.data.entries);
		} catch (err) {
			console.error("Ошибка при загрузке переводов:", err);
		}
	};

	useEffect(() => {
		fetchEntries();
	}, []);

	const handleSave = async (updatedEntry: TranslationEntry) => {
		try {
			await axios.put(
				`http://localhost:8000/entries/${updatedEntry.key}`,
				updatedEntry
			);
			setEditingEntry(null);
			fetchEntries();
		} catch (err) {
			console.error(err);
		}
	};

	const handleAdd = async (newEntry: Omit<TranslationEntry, "status">) => {
		try {
			await axios.put(
				`http://localhost:8000/entries/${newEntry.key}`,
				newEntry
			);
			setShowAddModal(false);
			fetchEntries();
		} catch (err) {
			console.error(err);
		}
	};

	const handleImport = async (file: File, signal: AbortSignal) => {
		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await axios.post(
				"http://localhost:8000/upload",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
					signal, // <<< Передаём сигнал отмены
				}
			);
			// fetchEntries(); // Обновляем список после импорта
			return res.data;
		} catch (err) {
			if (axios.isCancel(err)) {
				console.log("Запрос отменён");
			} else {
				console.error(err);
			}
			throw err;
		}
	};

	const existingKeys = new Set(entries.map((e) => e.key));

	const filteredEntries = entries.filter(
		(e) =>
			e.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
			e.nominative.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div>
			<h1>Редактор переводов</h1>
			<input
				type="text"
				placeholder="Поиск по словам..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<button onClick={() => setShowAddModal(true)}>
				Добавить перевод
			</button>
			<button onClick={() => setShowImportModal(true)}>
				Импорт из файла
			</button>
			<table>
				<thead>
					<tr>
						<th>Слово</th>
						<th>Название</th>
						<th>Источник</th>
						<th>Статус</th>
						<th>Действие</th>
					</tr>
				</thead>
				<tbody>
					{filteredEntries.map((entry) => (
						<tr key={entry.key}>
							<td>{entry.key}</td>
							<td>{entry.nominative}</td>
							<td>{entry.source}</td>
							<td>
								{entry.status === true
									? "✅"
									: entry.status === "конфликт"
									? "⚠️ Конфликт"
									: "❌"}
							</td>
							<td>
								<button onClick={() => setEditingEntry(entry)}>
									Редактировать
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{editingEntry && (
				<EditModal
					entry={editingEntry}
					onSave={handleSave}
					onClose={() => setEditingEntry(null)}
				/>
			)}

			{showAddModal && (
				<AddModal
					onSave={handleAdd}
					onClose={() => setShowAddModal(false)}
					existingKeys={existingKeys}
				/>
			)}

			{showImportModal && (
				<ImportModal
					onImport={handleImport}
					onClose={() => {
						setShowImportModal(false);
						fetchEntries(); // <<< Обновляем список при закрытии
					}}
				/>
			)}
		</div>
	);
}

export default App;
