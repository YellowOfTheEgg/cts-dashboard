from typing import Literal
from pydantic import BaseModel, Field, field_validator


class SettingsMoscat(BaseModel):
    sq_metric: Literal[
        "Silhouette Score", "MSE", "DBCV"
    ]  #'Silhouette Score', 'MSE', 'DBCV'
    tq_metric: Literal["Jaccard Score", "Centroid Shifting Score"]
    weighting_strategy: Literal["Manual", "Closest to Optimum", "Maximum Stability"]
    weight: float = Field()

    @field_validator("weight")
    def validate_weight(cls, v):
        try:
            float(v)
        except:
            raise ValueError("weight must be an integer.")
        try:
            assert 1 >= v >= 0
        except:
            raise ValueError(
                "weight must be greater than or equal to 0 and less than or equal to 1."
            )
        return v
