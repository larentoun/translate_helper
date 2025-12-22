import React, { useState, useEffect } from "react";
import axios from "axios";

interface LowercaseModalProps {
	onClose: () => void;
}

interface Issue {
	file: string;
	key: string;
	fixed_key: string;
}

function LowercaseModal({ onClose }: LowercaseModalProps) {
	const [issues, setIssues] = useState<Issue[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [fixed, setFixed] = useState<boolean>(false);

	useEffect(() => {
		const fetchIssues = async () => {
			try {
				const res = await axios.post(
					"http://localhost:8000/check-keys-lowercase"
				);
				setIssues(res.data.issues);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchIssues();
	}, []);

	const handleFix = async () => {
		try {
			await axios.post("http://localhost:8000/fix-keys-lowercase");
			setFixed(true);
			// Обновим список
			const res = await axios.post(
				"http://localhost:8000/check-keys-lowercase"
			);
			setIssues(res.data.issues);
		} catch (err) {
			console.error(err);
		}
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
				<h3>Проверка ключей на lowercase</h3>
				{loading ? (
					<p>Загрузка...</p>
				) : (
					<>
						{issues.length > 0 ? (
							<div>
								<p>
									Найдено {issues.length} ключей, не
									соответствующих lowercase:
								</p>
								<ul
									style={{
										maxHeight: "200px",
										overflowY: "auto",
										border: "1px solid #ccc",
										padding: "10px",
									}}
								>
									{issues.map((issue, index) => (
										<li key={index}>
											<strong>{issue.file}</strong>:{" "}
											<code>{issue.key}</code> →{" "}
											<code>{issue.fixed_key}</code>
										</li>
									))}
								</ul>
								{!fixed && (
									<button onClick={handleFix}>
										Исправить все ключи
									</button>
								)}
								{fixed && <p>Ключи исправлены!</p>}
							</div>
						) : (
							<p>Все ключи соответствуют lowercase.</p>
						)}
					</>
				)}
				<button onClick={onClose}>Закрыть</button>
			</div>
		</div>
	);
}

export default LowercaseModal;
