from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from utils import scan_all_translations, save_translation_entry, parse_toml_file, check_and_fix_lowercase_keys
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRANSLATIONS_DIR = "./data"

class Entry(BaseModel):
    key: str
    source: str
    nominative: str
    genitive: str
    dative: str
    accusative: str
    instrumental: str
    prepositional: str
    gender: str
    tags: Optional[List[str]] = []

@app.get("/entries")
def get_entries():
    entries = scan_all_translations(TRANSLATIONS_DIR)
    return {"entries": entries}

@app.put("/entries/{entry_key}")
def update_entry(entry_key: str, entry: Entry):
    file_path = os.path.join(TRANSLATIONS_DIR, f"{entry.source}.toml")
    save_translation_entry(file_path, entry_key, entry.model_dump())
    return {"status": "success"}

@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".toml"):
        raise HTTPException(status_code=400, detail="File must be a .toml")

    content = file.file.read().decode("utf-8")
    imported_data = parse_toml_file(content)
    imported_data = {k.lower(): v for k, v in imported_data.items()}

    all_entries = scan_all_translations(TRANSLATIONS_DIR)
    existing_keys = {e["key"] for e in all_entries}

    conflicts = []
    imported_entries = []
    warning_entries = []

    for key, data in imported_data.items():
        if key in existing_keys:
            conflicts.append(key)
            continue

        entry = {
            "key": key,
            "nominative": data.get("nominative", ""),
            "genitive": data.get("genitive", ""),
            "dative": data.get("dative", ""),
            "accusative": data.get("accusative", ""),
            "instrumental": data.get("instrumental", ""),
            "prepositional": data.get("prepositional", ""),
            "gender": data.get("gender", ""),
            "tags": data.get("tags", []),
        }

        required_fields = ["nominative", "genitive", "dative", "accusative", "instrumental", "prepositional", "gender"]
        has_all_fields = all(entry.get(f) for f in required_fields)

        if has_all_fields:
            imported_entries.append(entry)
            save_translation_entry(
                os.path.join(TRANSLATIONS_DIR, "_imported.toml"),
                key,
                {**entry, "source": "_imported"}
            )
        else:
            warning_entries.append(entry)
            save_translation_entry(
                os.path.join(TRANSLATIONS_DIR, "_imported_warning.toml"),
                key,
                {**entry, "source": "_imported_warning"}
            )

    return {
        "conflicts": conflicts,
        "imported_count": len(imported_entries),
        "warning_count": len(warning_entries),
        "message": "Import completed"
    }

@app.post("/check-keys-lowercase")
def check_keys_lowercase():
    issues = check_and_fix_lowercase_keys(TRANSLATIONS_DIR, fix=False)
    return {
        "message": f"Found {len(issues)} keys that are not lowercase",
        "issues": issues
    }

@app.post("/fix-keys-lowercase")
def fix_keys_lowercase():
    issues = check_and_fix_lowercase_keys(TRANSLATIONS_DIR, fix=True)
    return {
        "message": f"Fixed {len(issues)} keys to lowercase",
        "fixed": issues
    }