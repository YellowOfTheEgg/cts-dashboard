from typing import List
from pydantic import BaseModel, Field, field_validator


class SettingsDact(BaseModel):
    tau: float = Field(default=0.5)

    @field_validator("tau")
    def validate_tau(cls, v):
        if v < 0 or v > 1:
            raise ValueError("tau must be between 0 and 1.")
        return v
