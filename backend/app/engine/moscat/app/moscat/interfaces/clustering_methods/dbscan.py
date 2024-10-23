import numpy.lib.recfunctions as rfn
import numpy as np
from sklearn.cluster import DBSCAN as SLDBSCAN

from app.engine.moscat.app.moscat.interfaces.clustering_methods.interface import (
    IClusteringMethod,
)


class Dbscan(IClusteringMethod):
    """
    Dbscan wrapper for MOSCAT

    Abbreviations:
        tpc(s): time point clustering(s)
        param(s): parameter(s)
        comb(s): combination(s)
    """

    def __init__(self, eps_params, minpts_params):
        self.eps_params = eps_params
        self.minpts_params = minpts_params
        self.input_param_combs = []
        self.generate_input_param_combs()

    def _fields_view(self, array, fields):
        arr = array.getfield(
            np.dtype({name: array.dtype.fields[name] for name in fields})
        )
        return arr

    def define_data(self, data_definition):
        self.data_definition = data_definition

    def do_clusterings(self, tp_data, prev_tpc_properties=None):
        feature_data = list(
            map(
                lambda tpl: list(tpl),
                self._fields_view(tp_data, self.data_definition["features"]),
            )
        )
        tpcs = []
        for input_param_comb in self.input_param_combs:
            cluster_labels = SLDBSCAN(**input_param_comb).fit(feature_data).labels_
            clustering = rfn.append_fields(
                tp_data, "cluster_id", cluster_labels, dtypes="i4"
            )
            tpcs.append({"groups": clustering, "output_parameters": None})
        return tpcs

    def generate_input_param_combs(self):
        for minpts in self.minpts_params:
            for eps in self.eps_params:
                param_comb = {"eps": eps, "min_samples": minpts}
                self.input_param_combs.append(param_comb)
