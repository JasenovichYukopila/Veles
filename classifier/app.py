from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File
from fastapi.concurrency import run_in_threadpool
import traceback

from classifier import classify, warmup


@asynccontextmanager
async def lifespan(app: FastAPI):
    warmup()
    yield


app = FastAPI(lifespan=lifespan)


@app.post("/classify")
async def classify_audio(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("audio/"):
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="El archivo debe ser de tipo audio.")

    audio_bytes = await file.read()

    try:
        genre, confidence = await run_in_threadpool(classify, audio_bytes)
        return {"genre": genre, "confidence": confidence}
    except Exception as e:
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Error interno en clasificación")