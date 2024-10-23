from typing import List
from pydantic import BaseModel, Field, field_validator


class SettingsTodits(BaseModel):
    sigma: int = Field(default=1)

    @field_validator("sigma")
    def validate_sigma(cls, v):
        if v < 0:
            raise ValueError("sigma should be a positive integer.")

        return v
