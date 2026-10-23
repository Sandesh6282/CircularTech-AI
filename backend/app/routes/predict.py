"""
CircularTech AI — Image Category Prediction API Route
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, status
from backend.app.schemas import CategoryPredictionOutput
from backend.app.services.classifier import classifier_service

router = APIRouter(prefix="/api/v1", tags=["Vision Classification"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 # 15 MB

@router.post(
    "/predict-category",
    response_model=CategoryPredictionOutput,
    summary="Predict e-waste device category from image"
)
async def predict_device_category(file: UploadFile = File(...)):
    # Validate content type
    if file.content_type and file.content_type.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type '{file.content_type}'. Supported: JPEG, PNG, WEBP."
        )

    # Read image contents
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds 15MB limit. Please upload a compressed image."
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        prediction = classifier_service.predict(contents)
        return prediction
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification error: {str(e)}"
        )
