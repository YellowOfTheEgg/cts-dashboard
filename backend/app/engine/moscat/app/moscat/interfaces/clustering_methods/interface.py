from abc import ABC, abstractmethod
from typing import List, Dict


class IClusteringMethod(ABC):
    input_param_combs: List[Dict]

    @abstractmethod
    def do_clusterings(self, tp_data, prev_tpc_properties):
        pass

    @abstractmethod
    def generate_input_param_combs(self):
        pass

    @abstractmethod
    def define_data(self, data_definition):
        pass
