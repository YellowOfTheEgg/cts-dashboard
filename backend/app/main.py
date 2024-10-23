import os

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

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
#origins = os.environ.get("ORIGINS", "*").split(" ")
origins=['*','http://frontend:3000','http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
