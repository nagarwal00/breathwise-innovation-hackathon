"""FastAPI application for BreatheWise — Personal Air-Quality Exposure Planner."""

import logging
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.config import (
    ARTIFACTS_DIR,
    BASE_DIR,
    CACHE_DATA_DIR,
    settings,
)
from backend.app.model.predict import predictor
from backend.app.routers import (
    backtest,
    cities,
    forecast,
    methodology,
    plan,
)

logger = logging.getLogger("breathewise.main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(
    title="BreatheWise API",
    description="Personal Air-Quality Exposure Planning & Optimization Engine",
    version="1.0.0",
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return typed error matching contract: {'error': '...', 'field': '...'}."""
    errors = exc.errors()
    first_err = errors[0] if errors else {}
    loc = first_err.get("loc", ["unknown"])
    field = str(loc[-1]) if loc else "body"
    msg = first_err.get("msg", "Validation error")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": f"{field}: {msg}", "field": field},
    )


# Mount API routers
app.include_router(cities.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(plan.router, prefix="/api")
app.include_router(backtest.router, prefix="/api")
app.include_router(methodology.router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint welcoming visitors and directing to interactive documentation."""
    return {
        "service": "BreatheWise API",
        "description": "Personal Air-Quality Exposure Planning & Optimization Engine",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "github_pages": "https://nagarwal00.github.io/breathwise-innovation-hackathon/",
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint indicating model status and cache volume."""
    cache_count = len(list(CACHE_DATA_DIR.glob("*.json")))
    model_ready = predictor.ml_model is not None

    return {
        "status": "healthy",
        "service": "BreatheWise",
        "version": "1.0.0",
        "model_loaded": model_ready,
        "cached_queries_count": cache_count,
        "cities_configured": len(settings.cities),
    }


# Static frontend mounting for single-service production deployment
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not capture API routes
        if full_path.startswith("api"):
            return JSONResponse(status_code=404, content={"error": "Not Found"})
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")

