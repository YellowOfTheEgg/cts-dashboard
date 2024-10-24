#!/bin/bash
echo "CTS-Dashboard 1.0"

docker network create cts-dashboard

echo "Removing backend server..."
cd backend
docker compose down
cd ../

echo "Removing frontend server..."
cd frontend
docker compose down
cd ../

echo "Done!"