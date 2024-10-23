from app.engine.moscat.app.moscat.interfaces.clustering_methods.interface import (
    IClusteringMethod,
)
import numpy as np
from app.engine.moscat.app.utilities.kmeans.incremental_kmeans import (
    IncrementalKmeans as IKmeans,
)


class IncrementalKmeans(IClusteringMethod):
    """
    Kmeans wrapper for a custom implementation of Kmeans

    Abbreviations:
        tpc(s): time point clustering(s)
        param(s): parameter(s)
        comb(s): combination(s)
    """

    def __init__(self, k_params, max_iter_params, init_point_index, halflife=1):
        self.k_params = k_params
        self.halflife = halflife
        self.max_iter_params = max_iter_params
        self.init_point_index = init_point_index
        self.input_param_combs = []
        self.generate_input_param_combs()

    def define_data(self, data_definition):
        self.data_definition = data_definition

    def _fields_view(self, array, fields):
        return array.getfield(
            np.dtype({name: array.dtype.fields[name] for name in fields})
        )

    def do_clusterings(self, tp_data, prev_tpc_properties=None):
        tpcs = []
        for clustering_params in self.input_param_combs:
            if prev_tpc_properties is None:
                initial_centroids = []
            else:
                initial_centroids = np.copy(
                    prev_tpc_properties.output_parameters["centroids"]
                )
            clustering = IKmeans(
                **clustering_params,
                halflife=self.halflife,
                initial_centroids=initial_centroids
            )
            clustering.define_data(self.data_definition)
            clustering.fit(tp_data)
            clustering_result = clustering.clustering_result
            output_parameters = clustering.output_parameters
            tpcs.append(
                {"groups": clustering_result, "output_parameters": output_parameters}
            )
        return tpcs

    def generate_input_param_combs(self):
        for k in self.k_params:
            for max_iter in self.max_iter_params:
                self.input_param_combs.append(
                    {
                        "n_clusters": k,
                        "max_iter": max_iter,
                        "init_point_index": self.init_point_index,
                    }
                )
