from contextlib import asynccontextmanager
import traceback
import os
import random
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from app.dashboard import get_business_metrics, get_personal_recommendations
from app.schemas import (
    ClassificationResponse,
    ErrorResponse,
    BusinessMetricsResponse,
    BusinessMetricItem,
    PersonalRecommendationsResponse,
    PersonalRecommendationItem,
)

CLASSIFIER_URL = os.getenv("CLASSIFIER_URL", "")

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title='Veles API',
    version='1.0.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:5173',
        'http://localhost:5174',
        'https://frontend-liard-phi-13.vercel.app',
        'https://frontend-uhn6ubir9-jasenovichyukopilas-projects.vercel.app',
        'https://veles-lau00s35q-jasenovichyukopilas-projects.vercel.app',
    ],
    allow_methods=['POST', 'GET'],
    allow_headers=['*'],
)

@app.post(
    "/classify",
    response_model=ClassificationResponse,
    responses={422: {"model": ErrorResponse}},
)
async def classify_audio(file: UploadFile = File(...)) -> ClassificationResponse:
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=422,
            detail="El archivo debe ser de tipo audio.",
        )

    if CLASSIFIER_URL:
        import requests
        files = {"file": (file.filename, await file.read(), file.content_type)}
        resp = requests.post(f"{CLASSIFIER_URL}/classify", files=files, timeout=60)
        return resp.json()

    audio_bytes = await file.read()

    try:
        from app.classifier import classify
        return await run_in_threadpool(classify, audio_bytes)
    except ImportError:
        genres = ['Clásica', 'Electrónica', 'Hip-Hop', 'Jazz', 'Pop', 'Rock', 'Vallenato']
        genre = random.choice(genres)
        confidence = round(random.uniform(0.60, 0.95), 2)
        return ClassificationResponse(genre=genre, confidence=confidence)
    except Exception as e:
        print("=== ERROR CRÍTICO EN CLASIFICACIÓN ===")
        traceback.print_exc()
        print("======================================")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor. Revisa la consola de Uvicorn."
        )

@app.get(
    "/dashboard/business",
    response_model=BusinessMetricsResponse,
)
async def dashboard_business():
    data = get_business_metrics()
    return BusinessMetricsResponse(data=[BusinessMetricItem(**item) for item in data])

@app.get(
    "/dashboard/personal",
    response_model=PersonalRecommendationsResponse,
)
async def dashboard_personal(genre: str = Query(..., description="Género musical para filtrar recomendaciones")):
    data = get_personal_recommendations(genre)
    return PersonalRecommendationsResponse(data=[PersonalRecommendationItem(**item) for item in data])