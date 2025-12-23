@echo off
start cmd /k "cd frontend && npm install && npm run dev"
start cmd /k "cd backend && pip install fastapi uvicorn tomli python-multipart && uvicorn main:app --reload"
start http://localhost:5173
