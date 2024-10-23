from app.engine.moscat.app.moscat.interfaces.weight_selection_strategies.interface import (
    ISelectionStrategy,
)


class StaticWeight(ISelectionStrategy):
    def __init__(self, max_sq, max_tq, w):
        self.max_sq = max_sq
        self.max_tq = max_tq
        self.w = w
        return

    def run(self, pareto_front):
        return self.w
