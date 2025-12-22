@echo off
start cmd /k "cd frontend && npm install && npm run dev"
start cmd /k "cd backend && pip install fastapi uvicorn toml python-multipart && uvicorn main:app --reload"