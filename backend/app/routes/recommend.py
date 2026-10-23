"""
CircularTech AI — Recovery Recommendation API Route
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.schemas import DeviceAssessmentInput, RecommendationOutput
from backend.app.services.decision_engine import recommend_recovery

router = APIRouter(prefix="/api/v1", tags=["Recovery Recommendations"])

@router.post(
    "/recommend",
    response_model=RecommendationOutput,
    summary="Compute transparent recovery recommendation for a device assessment"
)
async def compute_recommendation(device: DeviceAssessmentInput):
    try:
        recommendation = recommend_recovery(device)
        return recommendation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Decision engine evaluation failed: {str(e)}"
        )
