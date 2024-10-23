import csv
from app.engine.todits.outlier_detector import OutlierDetector
import pandas as pd


class Todits:
    def __init__(self, dataset, settings_dataset, settings_todits):
        self.dataset = dataset
        self.settings_dataset = settings_dataset
        self.settings_todits = settings_todits

    def _combine_preoutliers_and_outliers(self, outlier_val, preoutlier_val):
        if outlier_val and preoutlier_val:
            return -3
        elif preoutlier_val:
            return -1
        elif outlier_val:
            return -2
        else:
            return 1

    def run(self):
        object_id_column = self.settings_dataset.object_id
        time_column = self.settings_dataset.time
        cluster_id_column = self.settings_dataset.cluster_id
        feature_columns = self.settings_dataset.features

        dataset_df = self.dataset.copy()
        dataset_df[object_id_column] = dataset_df[object_id_column].astype(str)
        times = dataset_df[time_column].unique()
        data_without_noise = dataset_df.query(f"{cluster_id_column}!=-1")
        count = 0
        for time in times:
            data_without_noise.loc[
                data_without_noise[time_column] == time, cluster_id_column
            ] = (
                data_without_noise.loc[
                    data_without_noise[time_column] == time, cluster_id_column
                ]
                + count
            )
            count += 1

        dataset_inc_cluster_df = (
            pd.concat(
                [dataset_df.query(f"{cluster_id_column}==-1"), data_without_noise]
            )
            .sort_values(by=[time_column, object_id_column])
            .reset_index(drop=True)
        )
        restructured_df = dataset_inc_cluster_df.drop(columns=feature_columns)

        restructured_df = restructured_df.rename(
            columns={
                cluster_id_column: "cluster_id",
                time_column: "time",
                object_id_column: "object_id",
            }
        )

        detector = OutlierDetector()
        outlier_result = detector.detect_outliers(
            restructured_df, self.settings_todits.sigma
        )

        outlier_result["outlier"] = outlier_result.apply(
            lambda x: self._combine_preoutliers_and_outliers(
                x["outlier"], x["preoutlier"]
            ),
            axis=1,
        )
        outlier_result.drop(columns=["preoutlier", "count", "cluster_id"], inplace=True)
        outlier_result.rename(
            columns={
                "object_id": object_id_column,
                "time": time_column,
            },
            inplace=True,
        )

        ot_clustering = pd.merge(
            dataset_df, outlier_result, on=[object_id_column, time_column], how="left"
        )

        times = ot_clustering[time_column].unique().tolist()
        times.sort()

        outlier_result_csv = ot_clustering.to_csv(
            quoting=csv.QUOTE_NONNUMERIC, index=False
        )

        clusterings = []
        object_labels = []
        cluster_labels = []
        outlier_info = []
        for t in times:
            tp_clustering = ot_clustering[ot_clustering[time_column] == t]

            cluster_ids = tp_clustering[cluster_id_column].unique().tolist()
            cluster_ids.sort()
            gk = tp_clustering.groupby(cluster_id_column)
            tp_obj_positions = []
            tp_object_ids = []
            tp_outliers = []
            tp_cluster_ids = cluster_ids
            for cluster_id in cluster_ids:
                cluster = gk.get_group(cluster_id)
                features = cluster[feature_columns].values.tolist()
                object_ids = cluster[object_id_column].values.tolist()
                outliers = cluster["outlier"].values.tolist()
                tp_object_ids.append(object_ids)
                tp_obj_positions.append(features)
                tp_outliers.append(outliers)

            clusterings.append(tp_obj_positions)
            object_labels.append(tp_object_ids)
            cluster_labels.append(tp_cluster_ids)
            outlier_info.append(tp_outliers)

        outlier_result = {
            "clusterings": clusterings,
            "object_labels": object_labels,
            "cluster_labels": cluster_labels,
            "outlier_info": outlier_info,
            "time_labels": times,
        }
        return outlier_result_csv, outlier_result
