import math
from app.engine.moscat.app.moscat.interfaces.weighting_systems.interface import (
    IParetoStrategy,
)


class NextToReferenceVectors(IParetoStrategy):
    def __init__(self, max_snapshot_quality, max_temporal_quality):
        self.max_snapshot_quality = max_snapshot_quality
        self.max_temporal_quality = max_temporal_quality

    def _is_point_over_hypothenuse(self, tpc_properties):
        max_x = self.max_snapshot_quality
        max_y = self.max_temporal_quality
        current_x = tpc_properties.snapshot_quality
        current_y = tpc_properties.temporal_quality
        hypothenuse_y = max_y - (max_y / max_x) * current_x
        return hypothenuse_y < current_y

    def _calculate_distance_over_hypothenuse(self, tpc_properties, w):
        x_max = self.max_snapshot_quality
        y_max = self.max_temporal_quality
        x_current = tpc_properties.snapshot_quality
        y_current = tpc_properties.temporal_quality

        nominator = abs(
            x_current * y_max * w
            + y_current * x_max * w
            - y_current * x_max
            - 2 * y_max * x_max * w
            + y_max * x_max
        )

        denominator = math.sqrt(
            (x_max**2) * w**2 - 2 * (x_max**2) * w + x_max**2 + (y_max**2) * (w**2)
        )
        return nominator / denominator

    def _calculate_distance_under_hypothenuse(self, tpc_properties, w):
        x_max = self.max_snapshot_quality
        y_max = self.max_temporal_quality
        x_current = tpc_properties.snapshot_quality
        y_current = tpc_properties.temporal_quality

        nominator = abs(
            -x_current * y_max * w + x_current * y_max - y_current * x_max * w
        )
        denominator = math.sqrt(
            (x_max**2) * (w**2) + (y_max**2) * (w**2) - 2 * (y_max**2) * w + (y_max**2)
        )

        return nominator / denominator

    def _calculate_distance(self, tpc_properties, w):
        over_hypothenuse = self._is_point_over_hypothenuse(tpc_properties)
        distance = None
        if over_hypothenuse:
            distance = self._calculate_distance_over_hypothenuse(tpc_properties, w)
        else:
            distance = self._calculate_distance_under_hypothenuse(tpc_properties, w)
        return distance

    def extract_optimal_score(self, pareto_front, w):
        weight = 1 - w  # w is the weight of the temporal quality
        tpcs_properties_distances = []
        for tpc_properties in pareto_front:
            distance = self._calculate_distance(tpc_properties, weight)
            tpcs_properties_distances.append((tpc_properties, distance))

        optimal_params = min(tpcs_properties_distances, key=lambda p: p[1])
        return optimal_params

    def extract_reference_vectors(self, w):
        weight = 1 - w
        vector_0 = [
            [0, 0],
            [
                weight * self.max_snapshot_quality,
                self.max_temporal_quality - self.max_temporal_quality * weight,
            ],
        ]

        vector_1 = [
            [
                weight * self.max_snapshot_quality,
                self.max_temporal_quality - self.max_temporal_quality * weight,
            ],
            [self.max_snapshot_quality, self.max_temporal_quality],
        ]
        return [vector_0, vector_1]

    def extract_orthogonal_line(self):
        return [[0, self.max_temporal_quality], [self.max_snapshot_quality, 0]]
