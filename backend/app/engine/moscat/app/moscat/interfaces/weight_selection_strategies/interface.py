from abc import ABC, abstractmethod


class ISelectionStrategy(ABC):
    @abstractmethod
    def run(self, pareto_front):
        pass
