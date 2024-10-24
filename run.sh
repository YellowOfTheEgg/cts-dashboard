#!/bin/bash
echo "CTS-Dashboard 1.0"

docker network create cts-dashboard

echo "Installing and starting backend server..."
cd backend
docker compose up -d
cd ../

echo "Installing and starting frontend server..."
cd frontend
docker compose up -d
cd ../

echo "Done! In order to access the web application, open your browser and go to http://localhost:3000"