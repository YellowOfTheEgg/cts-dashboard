from pydantic import BaseModel, Field, field_validator


class SettingsKmeans(BaseModel):
    k_min: int = Field(default=2)
    k_max: int = Field(default=3)
    max_iter: int = Field(default=10)

    @field_validator("k_min")
    def validate_k_min(cls, v):
        try:
            int(v)
        except:
            raise ValueError("k_min must be an integer.")
        try:
            assert v >= 0
        except:
            raise ValueError("k_min must be greater than or equal to 0.")
        return v

    @field_validator("k_max")
    def validate_k_max(cls, v):
        try:
            int(v)
        except:
            raise ValueError("k_max must be an integer.")
        try:
            assert v >= 0
        except:
            raise ValueError("k_max must be greater than or equal to 0.")
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
