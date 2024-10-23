from pydantic import BaseModel, Field, field_validator


class SettingsIncrementalKmeans(BaseModel):
    k: int = Field(default=2)

    max_iter: int = Field(default=10)

    @field_validator("k")
    def validate_k(cls, v):
        try:
            int(v)
        except:
            raise ValueError("k must be an integer.")
        try:
            assert v >= 0
        except:
            raise ValueError("k must be greater than 1")
        return v

    @field_validator("max_iter")
    def validate_max_iter(cls, v):
        try:
            int(v)
        except:
            raise ValueError("max_iter must be an integer.")
        try:
            assert v >= 1
        except:
            raise ValueError("max_iter must be greater than or equal to 1.")
        return v
