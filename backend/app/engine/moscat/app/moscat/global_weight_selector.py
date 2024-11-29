from app.engine.moscat.app.moscat.interfaces import weight_selection_strategies
from app.engine.moscat.app.moscat.moscat import Moscat
import numpy as np
from tqdm import tqdm
import math


class GlobalWeightSelector:

    def __init__(
        self,
        data,
        data_definition,
        clustering_method,
        snapshot_quality_metric,
        temporal_quality_metric,
        weights,
        log=False,
    ):
        self.clustering_method = clustering_method
        self.snapshot_quality_metric = snapshot_quality_metric
        self.temporal_quality_metric = temporal_quality_metric
        self.weights = weights
        self.data = data
        self.data_definition = data_definition
        self.log = log
        self.logged_elements = {}  # {'weights': w, 'tqs' ...}

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

    def _calc_av_dist_init(self, sq_tq_tples, opt):
        first_tpl = sq_tq_tples[0]
        second_tpl = sq_tq_tples[1]
        centriod = (first_tpl[0] + second_tpl[0]) / 2  # 1d centroid of sq values
        centriod_dist = np.linalg.norm(centriod - first_tpl[0])
        opt_dist = np.linalg.norm(first_tpl[0] - opt[0])
        av_dist_init = (centriod_dist + opt_dist) / (1.5 * opt[0])
        return av_dist_init

    def _calc_av_dist_after_init(self, sq_tq_tples, opt):
        after_init_tpls = sq_tq_tples[1:]
        centriod = np.average(after_init_tpls, axis=0)
        centr_dists = np.linalg.norm(sq_tq_tples - centriod, axis=1)

        sqtq_tpls_opt_diff = after_init_tpls - opt
        # weight second columns of tpls_to_opt_diff by tq_weight
        sqtq_tpls_opt_diff[:, 1] = sqtq_tpls_opt_diff[:, 1] * 0.5

        opt_dists = np.linalg.norm(sqtq_tpls_opt_diff, axis=1)

        sum_centr_dist = np.sum(centr_dists)
        sum_opt_dist = np.sum(opt_dists)
        max_possible_dist = math.sqrt(opt[0] ** 2 + opt[1] ** 2)
        av_dist_after_init = (sum_centr_dist + sum_opt_dist) / (1.5 * max_possible_dist)

        return av_dist_after_init

    def calc_score(self, sq_tq_tples, opt):
        av_dist_init = self._calc_av_dist_init(sq_tq_tples, opt)
        av_dist_after_init = self._calc_av_dist_after_init(sq_tq_tples, opt)
        n = len(sq_tq_tples)
        score = 1 - (1 / n) * (av_dist_init + av_dist_after_init)
        return score

    def select_weight(self):
        stability_score_per_weight = []
        sq_max = self.snapshot_quality_metric.upper_bound
        tq_max = self.temporal_quality_metric.upper_bound
        for w in tqdm(self.weights, desc="weight", position=1, leave=False):
            moscat = self.do_moscat_clustering(w)
            props_ot = []
            for tpc_properties in moscat.selected_tpcs_properties:
                tq = tpc_properties.temporal_quality
                sq = tpc_properties.snapshot_quality
                props_ot.append(np.array([sq, tq]))

            props_ot = np.array(props_ot)
            stability_score = self.calc_score(props_ot, np.array([sq_max, tq_max]))
            stability_score_per_weight.append(np.array([w, stability_score]))
        stability_score_per_weight = np.array(stability_score_per_weight)

        # get weight with max score from stability_score_per_weight. If multiple weights have the same max score, return the one with the lowest weight
        max_score = np.max(stability_score_per_weight[:, 1])
        max_stable_weight = np.min(
            stability_score_per_weight[stability_score_per_weight[:, 1] == max_score][
                :, 0
            ]
        )
        return max_stable_weight
