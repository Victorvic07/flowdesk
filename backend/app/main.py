from fastapi import FastAPI

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