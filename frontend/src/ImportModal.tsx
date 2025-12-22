import React, { useState, useRef } from "react";

interface ImportModalProps {
	onImport: (
		file: File,
		signal: AbortSignal
	) => Promise<{
		conflicts: string[];
		imported_count: number;
		warning_count: number;
		message: string;
	}>;
	onClose: () => void;
}

function ImportModal({ onImport, onClose }: ImportModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);
	const [result, setResult] = useState<{
		conflicts: string[];
		imported_count: number;
		warning_count: number;
		message: string;
	} | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const hasBeenCancelledRef = useRef<boolean>(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) return;

		setUploading(true);
		const controller = new AbortController();
		abortControllerRef.current = controller;
		hasBeenCancelledRef.current = false;

		try {
			const res = await onImport(file, controller.signal);
			if (!hasBeenCancelledRef.current) {
				setResult(res);
			}
		} catch (err) {
			if (controller.signal.aborted) {
				console.log("Загрузка отменена");
			} else {
				console.error(err);
			}
		} finally {
			setUploading(false);
			abortControllerRef.current = null;
		}
	};

	const handleCancel = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			hasBeenCancelledRef.current = true;
		}
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
			<div
				style={{
					margin: "auto",
					marginTop: "100px",
					width: "600px",
					background: "white",
					padding: "20px",
				}}
			>
				<h3>Импорт переводов из файла</h3>
				<form onSubmit={handleSubmit}>
					<label>Выберите TOML-файл:</label>
					<input
						type="file"
						accept=".toml"
						onChange={handleFileChange}
						required
					/>
					<br />
					<button type="submit" disabled={!file || uploading}>
						{uploading ? "Загрузка..." : "Импортировать"}
					</button>
					<button type="button" onClick={handleCancel}>
						Отмена
					</button>
				</form>

				{result && (
					<div>
						<p>Импорт завершён!</p>
						<p>Импортировано: {result.imported_count}</p>
						<p>С предупреждениями: {result.warning_count}</p>
						{result.conflicts.length > 0 && (
							<div>
								<h4>Конфликты:</h4>
								<ul
									style={{
										maxHeight: "200px",
										overflowY: "auto",
										border: "1px solid #ccc",
										padding: "10px",
									}}
								>
									{result.conflicts.map((key) => (
										<li key={key}>{key}</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default ImportModal;
