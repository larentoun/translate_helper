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

def scan_translations(filepath):
    print(f"[DEBUG] Loading file: {filepath}")  # <<< Добавить
    if not os.path.exists(filepath):
        print("[ERROR] File does not exist!")
        return []
    
    data = toml.load(filepath)
    print(f"[DEBUG] Loaded data: {data}")  # <<< Добавить

    entries = []
    for key, value in data.items():
        entry = {
            "key": key,
            "nominative": value.get("nominative", ""),
            "genitive": value.get("genitive", ""),
            "dative": value.get("dative", ""),
            "accusative": value.get("accusative", ""),
            "instrumental": value.get("instrumental", ""),
            "prepositional": value.get("prepositional", ""),
            "gender": value.get("gender", ""),
        }
        entry["status"] = all(entry.get(f) for f in REQUIRED_FIELDS)
        entries.append(entry)

    print(f"[DEBUG] Parsed entries: {entries}")  # <<< Добавить
    return entries

def save_translation_entry(filepath, entry_key, new_data):
    with open(filepath, "r", encoding="utf-8") as f:
        data = toml.load(f)

    data[entry_key] = {k: v for k, v in new_data.items() if k != "key"}

    with open(filepath, "w", encoding="utf-8") as f:
        toml.dump(data, f)
