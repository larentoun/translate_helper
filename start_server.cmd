#!/bin/bash

cd backend
pip install fastapi uvicorn toml
uvicorn main:app --reload