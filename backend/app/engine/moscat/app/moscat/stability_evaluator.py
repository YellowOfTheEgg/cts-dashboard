import numpy as np
from tqdm import tqdm
from app.engine.moscat.app.moscat.interfaces.weighting_systems import (
    NextToReferenceVectors,
)
from app.engine.moscat.app.moscat.tpc_properties import _TPCProperties
import math


class StabilityEvaluator:

    def __init__(
        self,
        clustered_data,
        clustered_data_description,
        snapshot_quality_metric,
        temporal_quality_metric,
    ):
        self.data = clustered_data
        self.data_description = clustered_data_description
        self.snapshot_quality_metric = snapshot_quality_metric
        self.temporal_quality_metric = temporal_quality_metric
        self.weighting_system = NextToReferenceVectors(
            snapshot_quality_metric.upper_bound, temporal_quality_metric.upper_bound
        )

    def _calc_qualities(self):
        times = np.unique(self.data[self.data_description["time"]])
        snapshot_qualities = []
        temporal_qualities = []

        for i, time in enumerate(
            tqdm(times, desc="Evaluation", position=0, leave=False)
        ):
            tpc = {
                "group": self.data[self.data[self.data_description["time"]] == time],
                "output_parameters": None,
            }
            prev_tpc = None
            if i > 0:
                prev_tpc = {
                    "group": self.data[
                        self.data[self.data_description["time"]] == times[i - 1]
                    ],
                    "output_parameters": None,
                }
            snapshot_quality = self.snapshot_quality_metric.calculate(tpc)
            temporal_quality = self.temporal_quality_metric.calculate(tpc, prev_tpc)
            snapshot_qualities.append(snapshot_quality)
            temporal_qualities.append(temporal_quality)
        return snapshot_qualities, temporal_qualities

    def calc_stability(self):
        weights = range(0, 1.1, 0.1)
        snapshot_qualities, temporal_qualities = self._calc_qualities()
        w_distances = []
        for w in weights:
            distances = []
            for i in enumerate(snapshot_qualities):
                sq = snapshot_qualities[i]
                tq = temporal_qualities[i]
                tpc_properties = _TPCProperties(sq, tq, None, None, None)
                tpc_properties, distance = self.weighting_system.extract_optimal_score(
                    [tpc_properties], w
                )
                distances.append(distance)
            w_distances.append(distances)
        w_distances = np.array(w_distances)
        variances = np.var(w_distances, axis=1)
        print(variances)
        return math.sqrt(np.min(variances))
