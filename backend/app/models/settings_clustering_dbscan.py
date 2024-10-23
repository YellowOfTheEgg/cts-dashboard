from pydantic import BaseModel, Field, field_validator


class SettingsDbscan(BaseModel):
    minpts_min: int = Field(default=3)
    minpts_max: int = Field(default=10)
    eps_min: float = Field(default=0.1)
    eps_max: float = Field(default=1.0)

    @field_validator("eps_min")
    def validate_eps_min(cls, v):
        try:
            float(v)
        except:
            raise ValueError("eps_min must be a float.")
        try:
            assert v >= 0
        except:
            raise ValueError("eps_min must be greater than or equal to 0.")
        return v

    @field_validator("eps_max")
    def validate_eps_max(cls, v):
        try:
            float(v)
        except:
            raise ValueError("eps_max must be a float.")
        try:
            assert v >= 0
        except:
            raise ValueError("eps_max must be greater than or equal to 0.")
        return v

    @field_validator("minpts_min")
    def validate_minpts_min(cls, v):
        try:
            int(v)
        except:
            raise ValueError("minpts_min must be an integer.")
        try:
            assert v >= 0
        except:
            raise ValueError("minpts_min must be greater than or equal to 0.")
        return v

    @field_validator("minpts_max")
    def validate_minpts_max(cls, v):
        try:
            int(v)
        except:
            raise ValueError("minpts_max must be an integer.")
        try:
            assert v >= 0
        except:
            raise ValueError("minpts_max must be greater than or equal to 0.")
        return v
