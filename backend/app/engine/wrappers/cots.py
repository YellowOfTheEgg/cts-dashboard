import csv
import pandas as pd
from app.engine.close.ots_eval.clustering.cots import COTS


class Cots:
    def __init__(self, dataset, settings_dataset, settings_cots):
        self.dataset = dataset
        self.settings_dataset = settings_dataset
        self.settings_cots = settings_cots

    def run(self):

        object_id_col = self.settings_dataset.object_id
        time_col = self.settings_dataset.time
        feature_cols = self.settings_dataset.features

        dataset_df = self.dataset.copy()
        dataset_df = dataset_df[[object_id_col, time_col] + feature_cols]

        cots = COTS(dataset_df)
        min_cf = self.settings_cots.min_cf
        sw = self.settings_cots.sw
        ot_clustering = cots.get_clusters_df(min_cf=min_cf, sw=sw)
        times = ot_clustering[time_col].unique().tolist()
        times.sort()

        # save the clustering result as csv for download
        clustering_result_csv = ot_clustering.to_csv(
            quoting=csv.QUOTE_NONNUMERIC, index=False
        )

        # convert pd.dataframe to json for the frontend
        clusterings = []
        object_labels = []
        cluster_labels = []
        for t in times:
            tp_clustering = ot_clustering[ot_clustering[time_col] == t]

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
