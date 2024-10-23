import numpy as np

from app.engine.moscat.app.moscat.interfaces.weighting_systems import (
    NextToReferenceVectors,
)
from app.engine.moscat.app.moscat.tpc_properties import _TPCProperties
from tqdm import tqdm


class Moscat:
    """
    Main class for the MOSCAT algorithm.

    Abbreviations:
        tpc: time point clustering
        tpcs: time point clusterings
    """

    def __init__(
        self,
        clustering_method,
        snapshot_quality_metric,
        temporal_quality_metric,
        weight_selection_strategy,
        log_tpcs_properties=False,
        tqdm_offset=0,
    ):
        self.clustering_method = clustering_method
        self.snapshot_quality_metric = snapshot_quality_metric
        self.temporal_quality_metric = temporal_quality_metric
        self.log_tpcs_properties = log_tpcs_properties
        self.weight_selection_strategy = weight_selection_strategy
        self.selected_tpcs_properties = []
        self.selected_tpcs_properties_distances = []
        self.logged_tpcs_properties = []
        self.weighting_system = NextToReferenceVectors(
            snapshot_quality_metric.upper_bound, temporal_quality_metric.upper_bound
        )
        self.tqdm_offset = tqdm_offset

    def define_data(self, data_definition):
        self.data_definition = data_definition
        self.snapshot_quality_metric.define_data(data_definition)
        self.temporal_quality_metric.define_data(data_definition)
        self.clustering_method.define_data(data_definition)

    def _calc_tpcs_properties(self, prev_tpc_properties, current_tpcs):
        result = []
        for i, current_tpc in enumerate(current_tpcs):
            snapshot_quality = self.snapshot_quality_metric.calculate_score(current_tpc)
            temporal_quality = self.temporal_quality_metric.calculate_score(
                prev_tpc_properties, current_tpc
            )
            result.append(
                _TPCProperties(
                    snapshot_quality,
                    temporal_quality,
                    self.clustering_method.input_param_combs[i],
                    current_tpc["groups"],
                    current_tpc["output_parameters"],
                )
            )
        return result

    def _extract_pareto_front(self, tpcs_properties):
        front = []
        for a_tpc_properties in tpcs_properties:
            dominated = False
            for b_tpc_properties in tpcs_properties:
                if (
                    a_tpc_properties.snapshot_quality
                    == b_tpc_properties.snapshot_quality
                    and a_tpc_properties.temporal_quality
                    < b_tpc_properties.temporal_quality
                ):
                    dominated = True
                    break
                elif (
                    a_tpc_properties.snapshot_quality
                    < b_tpc_properties.snapshot_quality
                    and a_tpc_properties.temporal_quality
                    == b_tpc_properties.temporal_quality
                ):
                    dominated = True
                    break
                elif (
                    a_tpc_properties.snapshot_quality
                    < b_tpc_properties.snapshot_quality
                    and a_tpc_properties.temporal_quality
                    < b_tpc_properties.temporal_quality
                ):
                    dominated = True
                    break

            if not dominated:
                front.append(a_tpc_properties)
        return front

    def _remove_redundant_tpcs_properties(self, tpcs_properties):
        unique_tpcs_properties = []
        for tpc_properties in tpcs_properties:
            if tpc_properties not in unique_tpcs_properties:
                unique_tpcs_properties.append(tpc_properties)
        with_sqs = [
            x
            for x in unique_tpcs_properties
            if x.snapshot_quality > self.snapshot_quality_metric.lower_bound
        ]
        if len(with_sqs) == 0:
            return unique_tpcs_properties
        else:
            return with_sqs

    # return unique_tpcs_properties

    def _log_steps(self, tpcs_properties, pareto_front):
        if self.log_tpcs_properties:
            self.logged_tpcs_properties.append(
                {
                    "tpcs_properties": tpcs_properties,
                    "pareto_front": pareto_front,
                }
            )

    def run(self, data):
        times = np.unique(data[self.data_definition["time"]])
        for time in tqdm(
            times, desc="Moscat: Progress", position=self.tqdm_offset, leave=False
        ):
            tp_data = data[data[self.data_definition["time"]] == time]
            if len(self.selected_tpcs_properties) == 0:
                tpcs = self.clustering_method.do_clusterings(
                    tp_data, prev_tpc_properties=None
                )
                tpcs_properties = self._calc_tpcs_properties(None, tpcs)
            else:
                tpcs = self.clustering_method.do_clusterings(
                    tp_data, self.selected_tpcs_properties[-1]
                )
                tpcs_properties = self._calc_tpcs_properties(
                    self.selected_tpcs_properties[-1], tpcs
                )
            tpcs_properties = self._remove_redundant_tpcs_properties(tpcs_properties)
            pareto_front = self._extract_pareto_front(tpcs_properties)
            self._log_steps(tpcs_properties, pareto_front)
            selected_weight = self.weight_selection_strategy.run(pareto_front)
            selected_tpc_properties, distance = (
                self.weighting_system.extract_optimal_score(
                    pareto_front, selected_weight
                )
            )
            self.selected_tpcs_properties.append(selected_tpc_properties)
            self.selected_tpcs_properties_distances.append(distance)

    def extract_clustering(self):
        ot_clustering = []
        for tpc_properties in self.selected_tpcs_properties:
            ot_clustering.append(tpc_properties.groups)
        r = np.concatenate(ot_clustering)
        return r
