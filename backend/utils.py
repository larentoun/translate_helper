import toml
from pathlib import Path
import os

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
    key_source_map = {}  # ключ -> список источников (файлов)
    all_entries_raw = []

    for file_path in Path(translations_dir).glob("*.toml"):
        source = file_path.stem  # имя файла без .toml
        print(f"[DEBUG] Loading file: {file_path}")
        try:
            data = toml.load(file_path)
        except Exception as e:
            print(f"[ERROR] Could not parse TOML {file_path}: {e}")
            continue

        for key, value in data.items():
            entry = {
                "key": key,
                "source": source,
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

            # Собираем, в каких источниках встречается каждый ключ
            if key not in key_source_map:
                key_source_map[key] = []
            key_source_map[key].append(source)

    # Теперь проставляем статус "конфликт", если ключ встречается более чем в одном источнике
    for entry in all_entries_raw:
        if len(key_source_map[entry["key"]]) > 1:
            entry["status"] = "конфликт"
        elif entry["status"]:
            entry["status"] = True  # ✅
        else:
            entry["status"] = False  # ❌

        entries.append(entry)

    print(f"[DEBUG] Total parsed entries: {len(entries)}")
    return entries


def parse_toml_file(content: str):
    """
    Парсит содержимое TOML-файла и возвращает словарь {key: {field: value}}
    """
    try:
        data = toml.loads(content)
        return data
    except Exception as e:
        print(f"[ERROR] Could not parse TOML content: {e}")
        return {}


def save_translation_entry(filepath: str, entry_key: str, new_data: dict):
    # Убедимся, что файл существует
    if not os.path.exists(filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            pass  # Создаём пустой файл

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = toml.load(f)
        except:
            data = {}  # Если файл пуст или сломан

    # Обновляем только те поля, которые есть в new_data (кроме key и source)
    if entry_key not in data:
        data[entry_key] = {}

    for field in ["nominative", "genitive", "dative", "accusative", "instrumental", "prepositional", "gender"]:
        if field in new_data:
            data[entry_key][field] = new_data[field]

    # <<< Перезаписываем файл целиком >>>
    with open(filepath, "w", encoding="utf-8") as f:
        toml.dump(data, f)

def check_and_fix_lowercase_keys(translations_dir: str, fix: bool = False):
    """
    Проверяет и (опционально) исправляет ключи, которые не в нижнем регистре.
    Возвращает список проблем: [{"file": "file.toml", "key": "BadKey", "fixed_key": "badkey"}]
    """
    issues = []
    for file_path in Path(translations_dir).glob("*.toml"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                original_content = f.read()
            data = toml.loads(original_content)

            updated_data = {}
            has_changes = False

            for key, value in data.items():
                if key != key.lower():
                    new_key = key.lower()
                    issues.append({
                        "file": file_path.name,
                        "key": key,
                        "fixed_key": new_key
                    })
                    if fix:
                        updated_data[new_key] = value
                        has_changes = True
                    else:
                        updated_data[key] = value
                else:
                    updated_data[key] = value

            if fix and has_changes:
                with open(file_path, "w", encoding="utf-8") as f:
                    toml.dump(updated_data, f)

        except Exception as e:
            print(f"[ERROR] Could not process file {file_path}: {e}")

    return issues