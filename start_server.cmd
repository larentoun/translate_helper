#!/bin/bash

cd backend
pip install fastapi uvicorn toml python-multipart
uvicorn main:app --reload