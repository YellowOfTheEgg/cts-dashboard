import os

from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
import uuid
from app.api.v1.config import api_router
from app.core import config
from starlette.datastructures import State

app = FastAPI(title="clustering-tools-backend")
app.include_router(api_router, prefix=config.API_STR)

# states per fastapi instance
app.state.cots = State()
app.state.moscat = State()
app.state.close = State()
app.state.doots = State()
app.state.dact = State()
app.state.todits = State()


app.state.cots.content = {}
app.state.moscat.content = {}
app.state.close.content = {}
app.state.doots.content = {}
app.state.dact.content = {}
app.state.todits.content = {}


origins = ["http://frontend:3000", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def some_middleware(request: Request, call_next):
    response = await call_next(request)
    session = request.cookies.get("session")
    if session:
        response.set_cookie(
            key="session", value=request.cookies.get("session"), httponly=True
        )
    else:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session", value=session_id, httponly=True)

    return response
