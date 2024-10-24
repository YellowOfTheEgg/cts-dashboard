#!/usr/bin/env bash

#start the service
uvicorn app.main:app  --port 8000 --host 0.0.0.0 --reload