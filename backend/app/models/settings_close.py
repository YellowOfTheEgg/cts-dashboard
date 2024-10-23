from typing import List
from pydantic import BaseModel, Field, field_validator


class SettingsClose(BaseModel):
    quality_measure: str = Field(default="MSE")
    minpts: int = Field(default=2)
    jaccard_index: bool = Field(False)
    weighting: bool = Field(False)
    exploitation_term: bool = Field(False)
