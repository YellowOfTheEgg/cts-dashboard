import pandas as pd
from app.utilities.visualisations.twoDClustering.Plotter import Plotter
from app.utilities.visualisations.moscat_plotter.pareto_plotters import ReferenceVectors
import os


class MoscatPlotter:
    def __init__(self, moscat):

        self.moscat = moscat
        self.cluster_id_col = "cluster_id"  #

    def create_optimal_clustering_plot(self, img_path=""):
        timepoint_dfs = []
        for selected_tpc_properties in self.moscat.selected_tpcs_properties:
            df = pd.DataFrame.from_records(selected_tpc_properties.clustering)
            timepoint_dfs.append(df)
        df = pd.concat(timepoint_dfs)

        df_mapping = dict(
            time_col=self.moscat.data_definition["time"],
            object_id_col=self.moscat.data_definition["object_id"],
            f1_col=self.moscat.data_definition["features"][0],
            f2_col=self.moscat.data_definition["features"][1],
            group_col=self.cluster_id_col,
        )

        plotter = Plotter(df=df, df_mapping=df_mapping)
        fig = plotter.generate_fig()
        if img_path != "":

            if os.path.dirname(img_path) != "" and not os.path.exists(
                os.path.dirname(img_path)
            ):
                os.makedirs(os.path.dirname(img_path))
            fig.savefig(img_path)
        else:
            return fig

    def create_pareto_plots(self, img_path, strategy, **kwargs):
        if strategy == "reference_vectors":
            #  print(**kwargs)
            pareto_strategy = ReferenceVectors(self.moscat, **kwargs)
        pareto_strategy.create_plot(img_path=img_path)
