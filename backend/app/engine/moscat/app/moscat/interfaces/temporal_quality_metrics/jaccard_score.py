from app.engine.moscat.app.moscat.interfaces.temporal_quality_metrics.interface import (
    ITemporalQualityMetric,
)
import itertools


class JaccardScore(ITemporalQualityMetric):
    lower_bound = 0
    upper_bound = 1

    def define_data(self, data_definition):
        self.col_object_id = data_definition["object_id"]
        self.col_time = data_definition["time"]
        self.col_features = data_definition["features"]

    def _calculate_jaccard(self, prev_clustering, current_clustering):
        prev_object_id_groups = [
            set(map(lambda row: row["object_id"], v))
            for k, v in itertools.groupby(
                prev_clustering, lambda row: row["cluster_id"]
            )
        ]
        current_object_id_groups = [
            set(map(lambda row: row["object_id"], v))
            for k, v in itertools.groupby(
                current_clustering, lambda row: row["cluster_id"]
            )
        ]
        unique_transition_weights = []
        for prev_object_id_group in prev_object_id_groups:
            for current_object_id_group in current_object_id_groups:
                intersec_len = len(prev_object_id_group & current_object_id_group)
                if intersec_len > 0:
                    union_len = len(prev_object_id_group | current_object_id_group)
                    transition_weight = intersec_len / union_len
                    unique_transition_weights.append(transition_weight)
        transition_score = sum(unique_transition_weights) / len(
            unique_transition_weights
        )
        transition_score = round(transition_score, 2)
        return transition_score

    def calculate_score(self, prev_tpc_properties, current_tpc):
        if prev_tpc_properties is not None:
            score = self._calculate_jaccard(
                prev_tpc_properties.groups, current_tpc["groups"]
            )
        else:
            score = 0
        return score