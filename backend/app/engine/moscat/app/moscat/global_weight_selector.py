from app.engine.moscat.app.moscat.interfaces import weight_selection_strategies
from app.engine.moscat.app.moscat.moscat import Moscat
import numpy as np
import os
from tqdm import tqdm


class GlobalWeightSelector:

    def __init__(
        self,
        data,
        data_definition,
        clustering_method,
        snapshot_quality_metric,
        temporal_quality_metric,
        weights,
    ):
        self.clustering_method = clustering_method
        self.snapshot_quality_metric = snapshot_quality_metric
        self.temporal_quality_metric = temporal_quality_metric
        self.weights = weights
        self.data = data
        self.data_definition = data_definition

    def do_moscat_clustering(self, w):
        weight_selection_strategy = weight_selection_strategies.StaticWeight(
            self.snapshot_quality_metric.upper_bound,
            self.temporal_quality_metric.upper_bound,
            w,
        )
        moscat = Moscat(
            clustering_method=self.clustering_method,
            snapshot_quality_metric=self.snapshot_quality_metric,
            temporal_quality_metric=self.temporal_quality_metric,
            weight_selection_strategy=weight_selection_strategy,
            log_tpcs_properties=True,
        )
        moscat.define_data(self.data_definition)
        moscat.run(self.data)
        return moscat

    def select_weight(self):
        w_distances = []
        for w in tqdm(self.weights, desc="weight", position=1, leave=False):
            moscat = self.do_moscat_clustering(w)
            distances = moscat.selected_tpcs_properties_distances
            w_distances.append(distances)
        w_distances = np.array(w_distances)
        # variances = np.var(w_distances,axis=1)
        dist_sum = np.sum(w_distances, axis=1)
        i = np.argmin(dist_sum)
        return self.weights[i]
