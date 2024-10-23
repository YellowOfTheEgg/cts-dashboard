from typing import List
from pydantic import BaseModel, Field, field_validator


class SettingsDataset(BaseModel):
    object_id: str = Field(default="object_id")
    time: str = Field(default="time")
    features: List[str] = Field(default=["feature1", "feature2", "feature3"])
    column_separator: str = Field(default=",")

    @field_validator("features")
    def validate_features(cls, v):
        v = [f.replace(" ", "") for f in v]
        if "" in v:
            raise ValueError("set names of feature columns.")

        return v

    @field_validator("object_id")
    def validate_object_id(cls, v):
        # if v.replace(" ","")=='' or v=='':
        v = v.replace(" ", "")
        if not v.strip():
            raise ValueError("set name of object_id column.")
        return v.strip()

    @field_validator("time")
    def validate_time(cls, v):
        v = v.replace(" ", "")
        if not v.strip():
            raise ValueError("set name of time column.")
        return v.strip()

    @field_validator("column_separator")
    def validate_column_separator(cls, v):
        v = v.replace(" ", "")
        if not v.strip():
            raise ValueError("set column sperator.")
        return v.strip()
