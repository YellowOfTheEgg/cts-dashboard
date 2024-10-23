from pydantic import BaseModel, Field, field_validator


class SettingsCots(BaseModel):
    min_cf: float = Field(default=0.015)
    sw: int = Field(default=3)

    @field_validator("min_cf")
    def validate_min_cf(cls, v):
        try:
            float(v)
        except:
            raise ValueError("min_cf must be a float.")
        try:
            assert v >= 0
        except:
            raise ValueError("min_cf must be greater than or equal to 0.")
        return v

    @field_validator("sw")
    def validate_sw(cls, v):
        try:
            int(v)
        except:
            raise ValueError("sw must be an integer.")
        try:
            assert v >= 0
        except:
            raise ValueError("sw must be greater than or equal to 0.")
        return v
