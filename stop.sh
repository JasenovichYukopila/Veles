#!/bin/bash

set -e

BASE_DIR=$(dirname "$(realpath "$0")")

detener_proceso() {
    local SERVICIO=$1
    local PID_FILE="$BASE_DIR/${SERVICIO}.pid"

    echo "Deteniendo $SERVICIO..."

    if [ -f "$PID_FILE" ]; then
        local PID=$(cat "$PID_FILE")

        if kill -0 "$PID" 2>/dev/null; then
            kill -15 "$PID"
            
            sleep 5
            
            if kill -0 "$PID" 2>/dev/null; then
                echo "El proceso $PID no respondió. Forzando cierre..."
                kill -9 "$PID"
            fi
            echo "$SERVICIO detenido correctamente."
        else
            echo "Advertencia: El proceso con PID $PID ya no está en ejecución."
        fi

        rm "$PID_FILE"
    else
        echo "Advertencia: No se encontró el archivo de registro de proceso para $SERVICIO."
    fi
}

detener_proceso "backend"
detener_proceso "frontend"

echo "-----------------------------------"
echo "Secuencia de detención finalizada."