from app.engine.close.ots_eval.outlier_detection.doots import DOOTS
import csv
import warnings

warnings.simplefilter(action="ignore", category=FutureWarning)
import pandas as pd

# doots requires specific input format
# 1. No features in dataframe, only [object_id, time, cluster_id]
# 2. object_id must be a string
# 3. cluster_id must be unique for each time point (e.g. no cluster_id=2 at time=1 and time=2)


class Doots:
    def __init__(self, dataset, settings_dataset, settings_doots):
        self.dataset = dataset
        self.settings_dataset = settings_dataset
        self.settings_doots = settings_doots

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

        detector = DOOTS(
            restructured_df,
            weighting=self.settings_doots.weighting,
            jaccard=self.settings_doots.jaccard,
        )

        details = detector.calc_outlier_degree()
        outlier_result, details = detector.mark_outliers(tau=self.settings_doots.tau)
        outlier_result.drop(outlier_result.columns[2], inplace=True, axis=1)

        ot_clustering = pd.merge(
            dataset_df,
            outlier_result,
            on=[object_id_column, time_column],
            how="left",
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
