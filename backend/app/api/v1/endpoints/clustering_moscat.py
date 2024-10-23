from typing import Annotated
from fastapi import APIRouter

from fastapi import File
from io import BytesIO

from app.models.settings_dataset import SettingsDataset
from app.models.settings_clustering_dbscan import SettingsDbscan
from app.models.settings_clustering_kmeans import SettingsKmeans
from app.models.settings_clustering_incremental_kmeans import SettingsIncrementalKmeans
from app.models.settings_clustering_moscat import SettingsMoscat


from fastapi import Request

router = APIRouter()

clustering_name_list = ["DBSCAN", "K-Means", "Incremental K-Means"]
sq_name_list = ["Silhouette Score", "MSE", "DBCV"]
tq_name_list = ["Jaccard Score", "Centroid Shifting Score"]
weight_selection_strategy_list = ["Manual", "Closest to Optimum", "Maximum Stability"]


@router.post("/dataset")
def set_dataset(file: Annotated[bytes, File()], request: Request):
    from io import BytesIO

    state = request.app.state.moscat
    state.dataset = BytesIO(file)
    fsize = state.dataset.getbuffer().nbytes

    if fsize == 0:
        return {
            "success": False,
            "message": "Uploaded file does not contain a dataset.",
        }
    else:
        return {"success": True, "message": "Dataset uploaded."}


@router.post("/settings-dataset")
def set_settings_dataset(settingsDataset: SettingsDataset, request: Request):
    state = request.app.state.moscat

    state.settings_dataset = settingsDataset
    # datasettings check

    return {"success": True, "message": "Settings for dataset uploaded."}


@router.get("/settings-dataset")
def get_settings_dataset(request: Request):
    state = request.app.state.moscat
    if hasattr(state, "settings_dataset"):
        return {
            "success": True,
            "message": "Settings for dataset available.",
            "data": state.settings_dataset.model_dump(),
        }
    else:
        return {"success": False, "message": "No settings for dataset uploaded"}


@router.post("/settings-dbscan")
def set_settings_dbscan(settingsDbscan: SettingsDbscan, request: Request):
    state = request.app.state.moscat
    state.clustering_settings = settingsDbscan
    state.clustering_method = clustering_name_list[0]
    return {"success": True, "message": "Settings for DBSCAN uploaded."}


@router.post("/settings-kmeans")
def set_settings_kmeans(settingsKmeans: SettingsKmeans, request: Request):
    state = request.app.state.moscat
    state.clustering_settings = settingsKmeans
    state.clustering_method = clustering_name_list[1]
    return {"success": True, "message": "Settings for K-Means uploaded."}


@router.post("/settings-incremental-kmeans")
def set_settings_incremental_kmeans(
    settingsIncrementalKmeans: SettingsIncrementalKmeans, request: Request
):
    state = request.app.state.moscat
    state.clustering_method = clustering_name_list[2]
    state.clustering_settings = settingsIncrementalKmeans
    return {"success": True, "message": "Settings for Incremental K-Means uploaded."}


@router.post("/settings-moscat")
def set_settings_moscat(settingsMoscat: SettingsMoscat, request: Request):
    state = request.app.state.moscat
    state.settings_moscat = settingsMoscat

    return {"success": True, "message": "Settings for MOSCAT uploaded."}


@router.post("/run")
def run(request: Request):
    import pandas as pd
    from app.engine.wrappers.moscat import Moscat

    state = request.app.state.moscat

    if not hasattr(state, "dataset"):
        return {"success": False, "message": "No dataset uploaded."}
    fsize = state.dataset.getbuffer().nbytes
    if fsize == 0:
        return {
            "success": False,
            "message": "Uploaded file does not contain a dataset.",
        }
    if not hasattr(state, "settings_dataset"):
        return {
            "response_type": "error",
            "message": "No settings for dataset uploaded.",
        }
    if not hasattr(state, "clustering_settings"):
        return {
            "response_type": "error",
            "message": "No settings for clustering uploaded.",
        }
    if not hasattr(state, "clustering_method"):
        return {"response_type": "error", "message": "No clustering method selected."}
    if not hasattr(state, "settings_moscat"):
        return {"response_type": "error", "message": "No settings for MOSCAT uploaded."}

    feature_cols = state.settings_dataset.features
    time_col = state.settings_dataset.time
    object_id_col = state.settings_dataset.object_id
    delimiter = state.settings_dataset.column_separator

    state.dataset.seek(0)
    dataset_df = pd.read_csv(state.dataset, encoding="utf-8", delimiter=delimiter)
    dataset_df_col_names = list(dataset_df.columns.values)

    if object_id_col not in dataset_df_col_names:
        return {"success": False, "message": "Object ID column not found in dataset."}
    elif time_col not in dataset_df_col_names:
        return {"success": False, "message": "Time column not found in dataset."}
    elif len(set(feature_cols) - set(dataset_df_col_names)) > 0:
        return {"success": False, "message": "Feature column(s) not found in dataset."}

    moscat = Moscat(
        dataset_df,
        state.settings_dataset,
        state.clustering_method,
        state.clustering_settings,
        state.settings_moscat,
    )
    result_csv, result = moscat.run()
    state.clustering_result_csv = result_csv
    state.clustering_result = result
    return {"success": True, "message": "Clustering completed."}


@router.get("/result")
def get_result(request: Request):
    state = request.app.state.moscat
    if hasattr(state, "clustering_result"):
        return {
            "success": True,
            "message": "Result available.",
            "data": state.clustering_result,
        }

    else:
        return {"success": False, "message": "No result available."}


@router.get("/result-csv")
def get_result_csv(request: Request):
    state = request.app.state.moscat
    if hasattr(state, "clustering_result_csv"):
        return {
            "success": True,
            "message": "Result csv available.",
            "data": state.clustering_result_csv,
        }
    else:
        return {"success": False, "message": "No result csv available."}


@router.post("/reset")
def reset(request: Request):
    from starlette.datastructures import State

    request.app.state.moscat = State()
    return {"success": True, "message": "MOSCAT successfully reset."}
