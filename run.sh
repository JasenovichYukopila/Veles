#!/bin/bash

set -e

BASE_DIR=$(dirname "$(realpath "$0")")

echo "Iniciando backend..."
cd "$BASE_DIR/backend" || { echo "Error: Directorio backend no encontrado"; exit 1; }

if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
else
    echo "Advertencia: Archivo de activación del entorno virtual no encontrado."
fi

nohup uvicorn app.main:app --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend iniciado con PID: $BACKEND_PID"

echo "Iniciando frontend..."
cd "$BASE_DIR/frontend" || { echo "Error: Directorio frontend no encontrado"; exit 1; }

npm install
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend iniciado con PID: $FRONTEND_PID"

echo "-----------------------------------"
echo "Servicios iniciados correctamente."

echo "$BACKEND_PID" > "$BASE_DIR/backend.pid"
echo "$FRONTEND_PID" > "$BASE_DIR/frontend.pid"