from fastapi import FastAPI
from sqlalchemy import text
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.database.connection import engine
from app.api.tickets import router as tickets_router
from app.api.categories import router as categories_router


app = FastAPI(
    title="FlowDesk API",
    description="API corporativa para gerenciamento de chamados.",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(tickets_router)


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