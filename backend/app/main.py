from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.classifier import classify, warmup
from app.schemas import ClassificationResponse, ErrorResponse

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
    allow_origins=['http://localhost:5173'],
    allow_methods=['POST'],
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