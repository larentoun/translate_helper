import toml
from pathlib import Path

REQUIRED_FIELDS = [
    "genitive",
    "dative",
    "accusative",
    "instrumental",
    "prepositional",
    "gender",
]

def scan_all_translations(translations_dir: str):
    entries = []
    key_language_map = {}  # ключ -> список языков
    all_entries_raw = []

    for file_path in Path(translations_dir).glob("*.toml"):
        lang = file_path.stem
        print(f"[DEBUG] Loading file: {file_path}")
        try:
            data = toml.load(file_path)
        except Exception as e:
            print(f"[ERROR] Could not parse TOML {file_path}: {e}")
            continue

        for key, value in data.items():
            entry = {
                "key": key,
                "language": lang,
                "nominative": value.get("nominative", ""),
                "genitive": value.get("genitive", ""),
                "dative": value.get("dative", ""),
                "accusative": value.get("accusative", ""),
                "instrumental": value.get("instrumental", ""),
                "prepositional": value.get("prepositional", ""),
                "gender": value.get("gender", ""),
            }
            # Определяем статус: если все поля есть — OK, иначе — ❌, если конфликт — "конфликт"
            entry["status"] = all(entry.get(f) for f in REQUIRED_FIELDS)
            all_entries_raw.append(entry)

            # Собираем, в каких языках встречается каждый ключ
            if key not in key_language_map:
                key_language_map[key] = []
            key_language_map[key].append(lang)

    # Теперь проставляем статус "конфликт", если ключ встречается более чем в одном языке
    for entry in all_entries_raw:
        if len(key_language_map[entry["key"]]) > 1:
            entry["status"] = "конфликт"
        elif entry["status"]:
            entry["status"] = True  # ✅
        else:
            entry["status"] = False  # ❌

        entries.append(entry)

    print(f"[DEBUG] Total parsed entries: {len(entries)}")
    return entries


def save_translation_entry(filepath: str, entry_key: str, new_data: dict):
    # Убедимся, что файл существует
    if not os.path.exists(filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            pass  # Создаём пустой файл

    with open(filepath, "r", encoding="utf-8") as f:
        data = toml.load(f)

    data[entry_key] = {k: v for k, v in new_data.items() if k not in ("key", "language")}

    with open(filepath, "w", encoding="utf-8") as f:
        toml.dump(data, f)