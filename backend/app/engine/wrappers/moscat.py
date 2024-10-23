from io import BytesIO
import numpy as np
from app.engine.moscat.app.moscat.moscat import Moscat as MOSCAT
import app.engine.moscat.app.moscat.interfaces.clustering_methods as clustering_methods
import app.engine.moscat.app.moscat.interfaces.snapshot_quality_metrics as snapshot_quality_metrics
import app.engine.moscat.app.moscat.interfaces.temporal_quality_metrics as temporal_quality_metrics
import app.engine.moscat.app.moscat.interfaces.weight_selection_strategies as weight_selection_strategies
from app.engine.moscat.app.moscat.global_weight_selector import GlobalWeightSelector
from app.engine.moscat.app.utilities.kmeans.kmeans import Kmeans
from scipy.spatial.distance import cdist
import pandas as pd


class Moscat:

    def __init__(
        self,
        dataset,
        settings_dataset,
        clustering_method,
        settings_clustering,
        settings_moscat,
    ):
        self.dataset = dataset
        self.clustering_method = clustering_method
        self.settings_dataset = settings_dataset
        self.clustering_settings = settings_clustering
        self.settings_moscat = settings_moscat
        self.clustering_name_list = ["DBSCAN", "K-Means", "Incremental K-Means"]
        self.sq_name_list = ["Silhouette Score", "MSE", "DBCV"]
        self.tq_name_list = ["Jaccard Score", "Centroid Shifting Score"]
        self.weight_selection_strategy_list = [
            "Manual",
            "Closest to Optimum",
            "Maximum Stability",
        ]

    def _calculate_sq(self, centroids, tp_data, feature_cols):
        clustered_points = np.array(tp_data[feature_cols].tolist())
        dists = cdist(centroids, clustered_points)
        snapshot_quality = np.sum(1 - dists.min(axis=0)) / len(clustered_points)
        return snapshot_quality

    def _extract_init_centroid_idx(
        self, tp_data, data_definition, n_clusters, max_iter=10
    ):
        init_centroid_idxs = range(0, len(np.unique(tp_data["object_id"])))
        sqs = []

        for init_centroid_idx in init_centroid_idxs:
            kmeans = Kmeans(n_clusters, init_centroid_idx, max_iter)
            kmeans.define_data(data_definition)
            kmeans.fit(tp_data)
            centroids = kmeans.output_parameters["centroids"]
            sq = self._calculate_sq(centroids, tp_data, kmeans.feature_cols)
            sqs.append(sq)
        max_sq_idx = np.argmax(sqs)
        return max_sq_idx

    def run(self):

        object_id_col = self.settings_dataset.object_id
        time_col = self.settings_dataset.time
        feature_cols = self.settings_dataset.features
        delimiter = self.settings_dataset.column_separator
        dataset_df = self.dataset.copy()

        restructured_df = dataset_df[[object_id_col, time_col] + feature_cols]
        bin_dataset = BytesIO(restructured_df.to_csv(index=False).encode())

        feat_dtypes = list(map(lambda f: (f, "d"), feature_cols))
        dtype = [(object_id_col, "U10"), (time_col, "i4")] + feat_dtypes
        dataset = np.genfromtxt(
            bin_dataset, delimiter=delimiter, skip_header=1, dtype=dtype
        )
        data_definition = {
            "object_id": object_id_col,
            "time": time_col,
            "features": feature_cols,
        }

        # select proper clustering method
        clustering_method = None
        if self.clustering_method == self.clustering_name_list[0]:
            eps_params = np.arange(
                self.clustering_settings.eps_min,
                self.clustering_settings.eps_max + 0.1,
                0.1,
            )
            minpts_params = np.arange(
                self.clustering_settings.minpts_min,
                self.clustering_settings.minpts_max + 1,
                1,
            )
            clustering_method = clustering_methods.Dbscan(
                eps_params=eps_params, minpts_params=minpts_params
            )
        elif self.clustering_method == self.clustering_name_list[1]:
            k_params = np.arange(
                self.clustering_settings.k_min, self.clustering_settings.k_max + 1
            )
            max_iter = np.arange(1, self.clustering_settings.max_iter + 1)
            # query dataset_df where time is min
            tp_data = dataset[dataset[time_col] == dataset[time_col].min()]
            object_ids = np.unique(tp_data[object_id_col])
            init_point_index_params = np.arange(0, len(object_ids))
            clustering_method = clustering_methods.CustomKmeans(
                k_params=k_params,
                max_iter_params=max_iter,
                init_point_index_params=init_point_index_params,
            )

        elif self.clustering_method == self.clustering_name_list[2]:
            k_param = self.clustering_settings.k
            max_iter_params = np.arange(1, self.clustering_settings.max_iter + 1)
            tp_data = dataset[dataset[time_col] == dataset[time_col].min()]

            init_centroid_idx = self._extract_init_centroid_idx(
                tp_data, data_definition, k_param, self.clustering_settings.max_iter + 1
            )
            clustering_method = clustering_methods.IncrementalKmeans(
                k_params=[k_param],
                max_iter_params=max_iter_params,
                init_point_index=init_centroid_idx,
            )

        # select proper snapshot quality metric
        if self.settings_moscat.sq_metric == self.sq_name_list[0]:
            snapshot_quality_metric = snapshot_quality_metrics.SilhouetteCoefficient()
        elif self.settings_moscat.sq_metric == self.sq_name_list[1]:
            if (
                self.clustering_method == self.clustering_name_list[1]
                or self.clustering_method == self.clustering_name_list[0]
            ):
                snapshot_quality_metric = snapshot_quality_metrics.MseScore()
            else:
                snapshot_quality_metric = snapshot_quality_metrics.EvolScore()

        elif self.settings_moscat.sq_metric == self.sq_name_list[2]:
            snapshot_quality_metric = snapshot_quality_metrics.DbcvScore()

        # select proper temporal quality metric
        if self.settings_moscat.tq_metric == self.tq_name_list[0]:
            temporal_quality_metric = temporal_quality_metrics.JaccardScore()
        elif self.settings_moscat.tq_metric == self.tq_name_list[1]:
            temporal_quality_metric = temporal_quality_metrics.EvolScore()

        # select proper weight selection strategy
        if (
            self.settings_moscat.weighting_strategy
            == self.weight_selection_strategy_list[0]
        ):
            weight_selection_strategy = weight_selection_strategies.StaticWeight(
                snapshot_quality_metric.upper_bound,
                temporal_quality_metric.upper_bound,
                self.settings_moscat.weight,
            )
        elif (
            self.settings_moscat.weighting_strategy
            == self.weight_selection_strategy_list[1]
        ):

            weight_selection_strategy = weight_selection_strategies.TOPSIS(
                snapshot_quality_metric.upper_bound, temporal_quality_metric.upper_bound
            )
        elif (
            self.settings_moscat.weighting_strategy
            == self.weight_selection_strategy_list[2]
        ):
            # weight_selection_strategy=weight_selection_strategies.MaximumStability()
            weights_to_check = np.arange(0, 1.1, 0.1)

            gws = GlobalWeightSelector(
                dataset,
                data_definition,
                clustering_method,
                snapshot_quality_metric,
                temporal_quality_metric,
                weights_to_check,
            )
            max_stable_weight = gws.select_weight()
            weight_selection_strategy = weight_selection_strategies.StaticWeight(
                snapshot_quality_metric.upper_bound,
                temporal_quality_metric.upper_bound,
                max_stable_weight,
            )

        moscat = MOSCAT(
            clustering_method=clustering_method,
            snapshot_quality_metric=snapshot_quality_metric,
            temporal_quality_metric=temporal_quality_metric,
            weight_selection_strategy=weight_selection_strategy,
            log_tpcs_properties=True,
        )

        moscat.define_data(data_definition)
        moscat.run(dataset)
        ot_clustering = moscat.extract_clustering()
        a = ot_clustering.tolist()
        columns = (
            [object_id_col, time_col] + self.settings_dataset.features + ["cluster"]
        )
        ot_clustering_df = pd.DataFrame(a, columns=columns)

        clustering_result_csv = ot_clustering_df.to_csv(index=False)

        # convert pd.dataframe to json for the frontend
        clusterings = []
        object_labels = []
        cluster_labels = []
        times = ot_clustering_df[time_col].unique().tolist()
        times.sort()
        feature_cols = self.settings_dataset.features

        for t in times:
            tp_clustering = ot_clustering_df[ot_clustering_df["time"] == t]

            cluster_ids = tp_clustering["cluster"].unique().tolist()
            cluster_ids.sort()
            gk = tp_clustering.groupby("cluster")
            tp_obj_positions = []
            tp_object_ids = []
            tp_cluster_ids = cluster_ids
            for cluster_id in cluster_ids:
                cluster = gk.get_group(cluster_id)
                features = cluster[feature_cols].values.tolist()
                object_ids = cluster[object_id_col].values.tolist()
                tp_object_ids.append(object_ids)
                tp_obj_positions.append(features)

            clusterings.append(tp_obj_positions)
            object_labels.append(tp_object_ids)
            cluster_labels.append(tp_cluster_ids)
        clustering_result = {
            "clusterings": clusterings,
            "object_labels": object_labels,
            "cluster_labels": cluster_labels,
            "time_labels": times,
        }
        return clustering_result_csv, clustering_result
