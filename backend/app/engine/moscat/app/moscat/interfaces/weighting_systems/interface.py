from abc import ABC, abstractmethod


class IParetoStrategy(ABC):
    @abstractmethod
    def _calculate_distance(self, step_parameter_set):
        pass

    @abstractmethod
    def extract_optimal_score(self, pareto_front):
        pass
