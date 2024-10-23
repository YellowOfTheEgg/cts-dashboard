import numpy as np
from sklearn.preprocessing import normalize
import math
from app.engine.moscat.app.moscat.interfaces.weight_selection_strategies.interface import (
    ISelectionStrategy,
)


class TOPSIS(ISelectionStrategy):
    def __init__(self, max_sq, max_tq):
        self.max_sq = max_sq
        self.max_tq = max_tq
        return

    def normalize_objectives(self, qualities):
        def normalize(row):
            return row[0] / self.max_sq, row[1] / self.max_tq

        normalized_qualities = np.apply_along_axis(normalize, 1, qualities)
        return normalized_qualities

    def calc_topsis(self, normalized_qualities):
        best = np.full((len(normalized_qualities), 2), 1)
        worst = np.full((len(normalized_qualities), 2), 0)

        dist_to_max = np.linalg.norm(normalized_qualities - best, axis=1)
        dist_to_min = np.linalg.norm(normalized_qualities - worst, axis=1)
        oq = dist_to_min / (dist_to_min + dist_to_max)
        return oq

    def extract_intersect(self, a1, a2, b1, b2):
        s = np.vstack([a1, a2, b1, b2])  # s for stacked
        h = np.hstack((s, np.ones((4, 1))))  # h for homogeneous
        l1 = np.cross(h[0], h[1])  # get first line
        l2 = np.cross(h[2], h[3])  # get second line
        x, y, z = np.cross(l1, l2)  # point of intersection
        if z == 0:  # lines are parallel
            return (float("inf"), float("inf"))
        return (x / z, y / z)

    def derive_weight(self, selected_solution):
        sq = selected_solution[0]
        tq = selected_solution[1]
        h = sq * self.max_tq - self.max_sq * self.max_tq + tq * self.max_sq
        if h > 0.5:
            intersec_point = self.extract_intersect(
                (sq, tq), (self.max_sq, self.max_tq), (0, self.max_tq), (self.max_sq, 0)
            )
        else:
            intersec_point = self.extract_intersect(
                (sq, tq), (0, 0), (0, self.max_tq), (self.max_sq, 0)
            )

        intersec_point = np.array(intersec_point)
        dist_to_tq_max = np.linalg.norm(intersec_point - (0, self.max_tq))
        h_len = math.sqrt(self.max_sq**2 + self.max_tq**2)
        weight = dist_to_tq_max / h_len
        return weight

    def run(self, pareto_front):
        qualities = []
        for step_parameter_set in pareto_front:
            sq = step_parameter_set.snapshot_quality
            tq = step_parameter_set.temporal_quality
            qualities.append(np.array((sq, tq)))
        qualities = np.array(qualities)
        normalized_qualities = self.normalize_objectives(qualities)
        scores = self.calc_topsis(normalized_qualities)
        max_idx = np.argmax(scores)
        return self.derive_weight(qualities[max_idx])
