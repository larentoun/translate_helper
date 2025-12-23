import React, { useState, useEffect } from "react";
import axios from "axios";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import ImportModal from "./ImportModal";
import LowercaseModal from "./LowercaseModal";
import { TranslationEntry } from "./types";

type TagFilterMode = "include" | "exclude" | "neutral";

interface TagFilter {
	tag: string;
	mode: TagFilterMode;
}

function App() {
	const [entries, setEntries] = useState<TranslationEntry[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [editingEntry, setEditingEntry] = useState<TranslationEntry | null>(
		null
	);
	const [showAddModal, setShowAddModal] = useState<boolean>(false);
	const [showImportModal, setShowImportModal] = useState<boolean>(false);
	const [showLowercaseModal, setShowLowercaseModal] =
		useState<boolean>(false);

	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [tagFilters, setTagFilters] = useState<TagFilter[]>([]);

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
					signal,
				}
			);
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

	const filteredByStatus =
		statusFilter === "all"
			? entries
			: entries.filter((entry) => entry.status === statusFilter);

	const filteredByTags = filteredByStatus.filter((entry) => {
		const excludeFilters = tagFilters.filter((f) => f.mode === "exclude");
		for (const filter of excludeFilters) {
			if (entry.tags?.includes(filter.tag)) {
				return false;
			}
		}

		const includeFilters = tagFilters.filter((f) => f.mode === "include");
		if (includeFilters.length > 0) {
			return includeFilters.some((filter) =>
				entry.tags?.includes(filter.tag)
			);
		}

		return true;
	});

	const filteredEntries = filteredByTags.filter(
		(e) =>
			e.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
			e.nominative.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const allTags = Array.from(
		new Set(entries.flatMap((entry) => entry.tags || []))
	).sort();

	const setTagMode = (tag: string, mode: TagFilterMode) => {
		setTagFilters((prev) => {
			const existing = prev.find((f) => f.tag === tag);
			if (existing) {
				if (mode === "neutral") {
					return prev.filter((f) => f.tag !== tag);
				} else {
					return prev.map((f) =>
						f.tag === tag ? { ...f, mode } : f
					);
				}
			} else {
				if (mode !== "neutral") {
					return [...prev, { tag, mode }];
				} else {
					return prev;
				}
			}
		});
	};

	// <<< Функция для получения текущего режима тега >>>
	const getTagMode = (tag: string): TagFilterMode => {
		const filter = tagFilters.find((f) => f.tag === tag);
		return filter ? filter.mode : "neutral";
	};

	return (
		<div>
			<h1>Редактор переводов</h1>
			<div
				style={{
					display: "flex",
					gap: "10px",
					marginBottom: "10px",
					flexWrap: "wrap",
				}}
			>
				<input
					type="text"
					placeholder="Поиск по словам..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{ flex: 1, minWidth: "200px", maxWidth: "200px" }}
				/>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					style={{ minWidth: "120px" }}
				>
					<option value="all">Все статусы</option>
					<option value="good">Хорошие</option>
					<option value="incomplete">Неполные</option>
					<option value="conflict">Конфликты</option>
				</select>
				<div style={{ position: "relative", minWidth: "120px" }}>
					<button
						type="button"
						style={{
							width: "100%",
							textAlign: "left",
							padding: "4px 8px",
							border: "1px solid #ccc",
							background: "white",
						}}
						onClick={() => {
							const dropdown =
								document.getElementById("tag-dropdown");
							if (dropdown) {
								dropdown.style.display =
									dropdown.style.display === "block"
										? "none"
										: "block";
							}
						}}
					>
						{tagFilters.length > 0
							? `Теги: ${tagFilters.length}`
							: "Все теги"}
					</button>
					<div
						id="tag-dropdown"
						style={{
							position: "absolute",
							top: "100%",
							left: 0,
							right: 0,
							background: "white",
							border: "1px solid #ccc",
							zIndex: 10,
							display: "none",
							maxHeight: "200px",
							overflowY: "auto",
							minWidth: "200px",
						}}
					>
						{allTags.map((tag) => (
							<div
								key={tag}
								style={{
									padding: "4px 8px",
									display: "flex",
									alignItems: "center",
									gap: "5px",
								}}
							>
								<span
									style={{
										fontSize: "12px",
										minWidth: "100px",
										overflow: "hidden",
										textOverflow: "ellipsis",
									}}
								>
									{tag}
								</span>
								<button
									type="button"
									style={{
										background:
											getTagMode(tag) === "include"
												? "#4CAF50"
												: "#f0f0f0",
										border: "1px solid #ccc",
										padding: "2px 4px",
										fontSize: "10px",
										cursor: "pointer",
									}}
									onClick={() =>
										setTagMode(
											tag,
											getTagMode(tag) === "include"
												? "neutral"
												: "include"
										)
									}
								>
									+
								</button>
								<button
									type="button"
									style={{
										background:
											getTagMode(tag) === "exclude"
												? "#f44336"
												: "#f0f0f0",
										border: "1px solid #ccc",
										padding: "2px 4px",
										fontSize: "10px",
										cursor: "pointer",
										color:
											getTagMode(tag) === "exclude"
												? "white"
												: "black",
									}}
									onClick={() =>
										setTagMode(
											tag,
											getTagMode(tag) === "exclude"
												? "neutral"
												: "exclude"
										)
									}
								>
									−
								</button>
							</div>
						))}
					</div>
				</div>
				<div>Всего значений: {filteredEntries.length}</div>
			</div>
			<div style={{ marginBottom: "10px" }}>
				<button onClick={() => setShowAddModal(true)}>
					Добавить перевод
				</button>
				<button onClick={() => setShowImportModal(true)}>
					Импорт из файла
				</button>
				<button onClick={() => setShowLowercaseModal(true)}>
					Проверить lowercase ключи
				</button>
			</div>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<th
							style={{ border: "1px solid #ddd", padding: "8px" }}
						>
							Слово
						</th>
						<th
							style={{ border: "1px solid #ddd", padding: "8px" }}
						>
							Название
						</th>
						<th
							style={{ border: "1px solid #ddd", padding: "8px" }}
						>
							Источник
						</th>
						<th
							style={{ border: "1px solid #ddd", padding: "8px" }}
						>
							Теги
						</th>
						<th
							style={{ border: "1px solid #ddd", padding: "8px" }}
						>
							Статус
						</th>
						<th
							style={{ border: "1px solid #ddd", padding: "8px" }}
						>
							Действие
						</th>
					</tr>
				</thead>
				<tbody>
					{filteredEntries.map((entry) => (
						<tr key={entry.key}>
							<td
								style={{
									border: "1px solid #ddd",
									padding: "8px",
									maxWidth: "300px",
								}}
							>
								{entry.key}
							</td>
							<td
								style={{
									border: "1px solid #ddd",
									padding: "8px",
									maxWidth: "300px",
								}}
							>
								{entry.nominative}
							</td>
							<td
								style={{
									border: "1px solid #ddd",
									padding: "8px",
								}}
							>
								{entry.source}
							</td>
							<td
								style={{
									border: "1px solid #ddd",
									padding: "8px",
								}}
							>
								{entry.tags && entry.tags.length > 0 ? (
									<div
										style={{
											display: "flex",
											flexWrap: "wrap",
											gap: "2px",
										}}
									>
										{entry.tags.slice(0, 3).map((tag) => (
											<span
												key={tag}
												style={{
													background: "#f0f0f0",
													padding: "1px 4px",
													borderRadius: "3px",
													fontSize: "12px",
												}}
											>
												{tag}
											</span>
										))}
										{entry.tags.length > 3 && (
											<span
												style={{
													fontSize: "12px",
													color: "#666",
												}}
											>
												+{entry.tags.length - 3}
											</span>
										)}
									</div>
								) : (
									"-"
								)}
							</td>
							<td
								style={{
									border: "1px solid #ddd",
									padding: "8px",
								}}
							>
								{entry.status === "good"
									? "✅"
									: entry.status === "conflict"
									? "⚠️"
									: "❌"}
							</td>
							<td
								style={{
									border: "1px solid #ddd",
									padding: "8px",
								}}
							>
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
						fetchEntries();
					}}
				/>
			)}
			{showLowercaseModal && (
				<LowercaseModal
					onClose={() => {
						setShowLowercaseModal(false);
						fetchEntries();
					}}
				/>
			)}
		</div>
	);
}

export default App;
