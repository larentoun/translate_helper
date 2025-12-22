from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from utils import scan_translations, save_translation_entry

app = FastAPI()

# <<< Настройка CORS >>>
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRANSLATIONS_DIR = "./translations"

class Entry(BaseModel):
    key: str
    nominative: str
    genitive: str
    dative: str
    accusative: str
    instrumental: str
    prepositional: str
    gender: str

@app.get("/entries")
def get_entries():
    file_path = os.path.join(TRANSLATIONS_DIR, "ru.toml")  # <<< Убедитесь в имени файла
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    entries = scan_translations(file_path)
    return {"entries": entries}

@app.put("/entries/{entry_key}")
def update_entry(entry_key: str, entry: Entry):
    file_path = os.path.join(TRANSLATIONS_DIR, "ru.toml")
    save_translation_entry(file_path, entry_key, entry.dict())
    return {"status": "success"}