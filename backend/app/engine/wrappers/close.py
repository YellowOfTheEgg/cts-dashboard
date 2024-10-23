from app.engine.close.ots_eval.stability_evaluation.close import CLOSE
import warnings

warnings.simplefilter(action="ignore", category=FutureWarning)
import pandas as pd


class Close:
    def __init__(self, dataset, settings_dataset, settings_close):
        self.dataset = dataset
        self.settings_dataset = settings_dataset
        self.settings_close = settings_close

    def run(self):
        object_id_column = self.settings_dataset.object_id
        time_column = self.settings_dataset.time
        cluster_id_column = self.settings_dataset.cluster_id
        feature_columns = self.settings_dataset.features

        dataset_df = self.dataset.copy()
        restructured_df = dataset_df[
            [object_id_column, time_column, cluster_id_column] + feature_columns
        ]

        # prepare for CLOSE
        restructured_df[object_id_column] = restructured_df[object_id_column].astype(
            str
        )

        times = restructured_df[time_column].unique()
        without_noise = restructured_df[restructured_df[cluster_id_column] != -1]
        count = 0
        for time in times:
            without_noise.loc[without_noise["time"] == time, cluster_id_column] = (
                without_noise.loc[without_noise["time"] == time, cluster_id_column]
                + count
            )
            count += 1
        prepared_df = (
            pd.concat(
                [restructured_df.query(f"{cluster_id_column}==-1"), without_noise]
            )
            .sort_values(by=["time", "object_id"])
            .reset_index(drop=True)
        )

        rater = CLOSE(
            prepared_df,
            measure=self.settings_close.quality_measure,
            minPts=self.settings_close.minpts,
            jaccard=self.settings_close.jaccard_index,
            weighting=self.settings_close.weighting,
            exploitation_term=self.settings_close.exploitation_term,
        )
        evaluation_result = rater.rate_clustering()
        return evaluation_result
