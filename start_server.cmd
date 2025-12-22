#!/bin/bash

cd backend
pip install fastapi uvicorn tomli toml python-multipart
uvicorn main:app --reload