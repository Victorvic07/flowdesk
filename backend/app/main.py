from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine

app = FastAPI(
    title="FlowDesk API",
    description="API corporativa para gerenciamento de chamados.",
    version="1.0.0",
)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {
        "status": "online",
        "service": "FlowDesk API",
    }


@app.get("/health/database", tags=["Health"])
def database_health_check() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "online",
        "database": "PostgreSQL",
    }