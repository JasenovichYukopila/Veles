from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.classifier import classify, warmup
from app.dashboard import get_business_metrics, get_personal_recommendations
from app.schemas import (
    ClassificationResponse,
    ErrorResponse,
    BusinessMetricsResponse,
    BusinessMetricItem,
    PersonalRecommendationsResponse,
    PersonalRecommendationItem,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    warmup()
    yield

app = FastAPI(
    title='Veles API',
    version='1.0.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://localhost:5174'],
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

    audio_bytes = await file.read()

    try:
        return classify(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e) or repr(e))

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