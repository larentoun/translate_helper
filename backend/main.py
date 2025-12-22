from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from utils import scan_all_translations, save_translation_entry

app = FastAPI()

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
    source: str
    nominative: str
    genitive: str
    dative: str
    accusative: str
    instrumental: str
    prepositional: str
    gender: str

@app.get("/entries")
def get_entries():
    entries = scan_all_translations(TRANSLATIONS_DIR)
    return {"entries": entries}

@app.put("/entries/{entry_key}")
def update_entry(entry_key: str, entry: Entry):
    file_path = os.path.join(TRANSLATIONS_DIR, f"{entry.source}.toml")
    save_translation_entry(file_path, entry_key, entry.dict())
    return {"status": "success"}