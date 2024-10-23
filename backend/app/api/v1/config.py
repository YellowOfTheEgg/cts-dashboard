from fastapi import APIRouter

from app.api.v1.endpoints import (
    clustering_cots,
    clustering_moscat,
    clustering_evaluation_close,
    outlier_detection_doots,
    outlier_detection_dact,
    outlier_detection_todits,
)

api_router = APIRouter()

api_router.include_router(
    clustering_cots.router, prefix="/clustering/cots", tags=["Clustering C(OTS)²"]
)
api_router.include_router(
    clustering_moscat.router, prefix="/clustering/moscat", tags=["Clustering MOSCAT"]
)
api_router.include_router(
    clustering_evaluation_close.router,
    prefix="/clustering-evaluation/close",
    tags=["Clustering Evaluation CLOSE"],
)
api_router.include_router(
    outlier_detection_doots.router,
    prefix="/outlier-detection/doots",
    tags=["Outlier Detection DOOTS"],
)
api_router.include_router(
    outlier_detection_dact.router,
    prefix="/outlier-detection/dact",
    tags=["Outlier Detection DACT"],
)
api_router.include_router(
    outlier_detection_todits.router,
    prefix="/outlier-detection/todits",
    tags=["Outlier Detection TODITS"],
)
