from collections import defaultdict
from app.engine.moscat.app.moscat.interfaces.snapshot_quality_metrics.interface import (
    IQualityMetric,
)
import numpy as np


class EvolScore(IQualityMetric):
    lower_bound = 0
    upper_bound = 1

    def define_data(self, data_definition):
        self.col_features = data_definition["features"]

    def _calculate_evol_score(self, tpc):
        cluster_points = defaultdict(list)
        for row in tpc["groups"]:
            cluster_points[row["cluster_id"]] += [tuple(row[self.col_features])]

        centroids = tpc["output_parameters"]["centroids"]

        tp_scores = []
        for k, v in cluster_points.items():
            cluster_centroid = centroids[k]
            tp_scores += list(
                map(
                    lambda x: 1 - np.linalg.norm(cluster_centroid - x),
                    cluster_points[k],
                )
            )
        score = sum(tp_scores) / len(tp_scores)
        return score

    def calculate_score(self, tpc):
        evol_score = self._calculate_evol_score(tpc)
        return evol_score
