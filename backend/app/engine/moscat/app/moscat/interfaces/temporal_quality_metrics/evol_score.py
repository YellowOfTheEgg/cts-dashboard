from app.engine.moscat.app.moscat.interfaces.temporal_quality_metrics.interface import (
    ITemporalQualityMetric,
)
import numpy as np
from scipy.spatial.distance import cdist


class EvolScore(ITemporalQualityMetric):
    lower_bound = 0
    upper_bound = 1

    def define_data(self, data_definition):
        self.col_object_id = data_definition["object_id"]
        self.col_time = data_definition["time"]
        self.col_features = data_definition["features"]

    def _extract_centroids(self, tp_clustering, feature_names):
        centroid_map = {}  # key: cluster_id, value: centroid
        for cluster_id in np.unique(tp_clustering["cluster_id"]):
            cluster = tp_clustering[tp_clustering["cluster_id"] == cluster_id]
            cluster_points = cluster[feature_names]
            cluster_points = np.array(
                list(map(lambda tpl: np.array(list(tpl)), cluster_points))
            )
            centroid = cluster_points.mean(axis=0)
            centroid_map[cluster_id] = centroid

        centroids = np.array(
            list(
                map(
                    lambda cluster_id: centroid_map[cluster_id],
                    tp_clustering["cluster_id"],
                )
            )
        )
        return centroids

    def _sort_prev_centroids(self, prev_centroids, current_centroids):
        best_match_idx = cdist(current_centroids, prev_centroids).argmin(axis=1)
        return prev_centroids[best_match_idx]

    def _calculate_evol_temporal_score(self, prev_tpc_properties, current_tpc):
        prev_centroids = prev_tpc_properties.output_parameters["centroids"]
        current_centroids = current_tpc["output_parameters"]["centroids"]

        if len(prev_centroids) > len(current_centroids):
            best_match_idx = cdist(current_centroids, prev_centroids).argmin(axis=1)
            prev_centroids = prev_centroids[best_match_idx]
        elif len(prev_centroids) < len(current_centroids):
            best_match_idx = cdist(prev_centroids, current_centroids).argmin(axis=1)
            current_centroids = current_centroids[best_match_idx]

        sorted_prev_centroids = self._sort_prev_centroids(
            prev_centroids, current_centroids
        )
        dists = np.linalg.norm(current_centroids - sorted_prev_centroids, axis=1)
        hc = np.sum(dists) / len(dists)  # np.min(dists)
        return 1 - hc

    def calculate_score(self, prev_tpc_properties, current_tpc):
        if prev_tpc_properties is None:
            score = 0
        else:
            score = self._calculate_evol_temporal_score(
                prev_tpc_properties, current_tpc
            )
        return score
