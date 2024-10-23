from typing import Annotated
from fastapi import APIRouter

from fastapi import File
from app.models.settings_clustered_dataset import SettingsClusteredDataset
from app.models.settings_doots import SettingsDoots
from fastapi import Request


router = APIRouter()


@router.post("/dataset")
def set_dataset(file: Annotated[bytes, File()], request: Request):

    from io import BytesIO

    state = request.app.state.doots
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
def set_settings_dataset(settingsDataset: SettingsClusteredDataset, request: Request):

    state = request.app.state.doots

    state.settings_dataset = settingsDataset

    return {"success": True, "message": "Settings for dataset uploaded."}


@router.get("/settings-dataset")
def get_settings_dataset(request: Request):
    state = request.app.state.doots
    if hasattr(state, "settings_dataset"):
        return {
            "success": True,
            "message": "Settings for dataset available.",
            "data": state.settings_dataset.model_dump(),
        }
    else:
        return {"success": False, "message": "No settings for dataset uploaded."}


@router.post("/settings-doots")
def set_settings_doots(settingsDoots: SettingsDoots, request: Request):
    state = request.app.state.doots
    state.settings_doots = settingsDoots
    return {"success": True, "message": "Settings for DOOTS uploaded."}


@router.post("/run")
def run(request: Request):
    from app.engine.wrappers.doots import Doots
    import pandas as pd

    state = request.app.state.doots

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
    if not hasattr(state, "settings_doots"):
        return {"response_type": "error", "message": "No settings for DOOTS uploaded."}

    # restructure dataframe
    object_id_column = state.settings_dataset.object_id
    time_column = state.settings_dataset.time
    cluster_id_column = state.settings_dataset.cluster_id
    feature_columns = state.settings_dataset.features
    delimiter = state.settings_dataset.column_separator

    state.dataset.seek(0)
    dataset_df = pd.read_csv(state.dataset, encoding="utf-8", delimiter=delimiter)
    dataset_df_col_names = list(dataset_df.columns.values)

    dataset_df_col_names = list(dataset_df.columns.values)
    if object_id_column not in dataset_df_col_names:
        return {"success": False, "message": "Object ID column not found in dataset."}
    if time_column not in dataset_df_col_names:
        return {"success": False, "message": "Time column not found in dataset."}
    if cluster_id_column not in dataset_df_col_names:
        return {"success": False, "message": "Cluster ID column not found in dataset."}
    if len(set(feature_columns) - set(dataset_df_col_names)) > 0:
        return {"success": False, "message": "Feature column(s) not found in dataset"}
    if dataset_df.empty:
        return {"success": False, "message": "Something went wrong. Try again."}

    doots = Doots(dataset_df, state.settings_dataset, state.settings_doots)
    outlier_result_csv, outlier_result = doots.run()
    state.outlier_result_csv = outlier_result_csv
    state.outlier_result = outlier_result
    return {"success": True, "message": "Outlier detection completed."}


@router.get("/result")
def get_result(request: Request):
    state = request.app.state.doots

    if hasattr(state, "outlier_result"):
        return {
            "success": True,
            "message": "Result available.",
            "data": state.outlier_result,
        }

    else:
        return {
            "success": False,
            "message": "No result available.",
        }


@router.get("/result-csv")
def get_result_csv(request: Request):
    state = request.app.state.doots
    if hasattr(state, "outlier_result_csv"):
        return {
            "success": True,
            "message": "Outlier detection result csv available.",
            "data": state.outlier_result_csv,
        }
    else:
        return {
            "success": False,
            "message": "No outlier detection result csv available.",
        }


@router.post("/reset")
def reset(request: Request):
    from starlette.datastructures import State

    request.app.state.doots = State()