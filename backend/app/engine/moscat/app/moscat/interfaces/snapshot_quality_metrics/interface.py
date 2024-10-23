from abc import ABC, abstractmethod


class IQualityMetric(ABC):
    lower_bound: float
    upper_bound: float

    # tpc: dictionary with keys 'groups' and 'output_parameters'
    # contains clustering and output parameters of the clustering like centroids
    @abstractmethod
    def calculate_score(self, tpc):
        pass

    @abstractmethod
    def define_data(self, data_definition):
        pass
