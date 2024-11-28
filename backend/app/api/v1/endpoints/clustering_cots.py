from typing import Annotated
from fastapi import APIRouter

from fastapi import File


from app.models.settings_dataset import SettingsDataset
from app.models.settings_clustering_cots import SettingsCots
from app.crud import store_data, retrieve_data, delete_data

from fastapi import Request

router = APIRouter()


@router.post("/dataset")
def set_dataset(file: Annotated[bytes, File()], request: Request):
    from io import BytesIO

    state = request.app.state.cots
    session = request.cookies.get("session")
    dataset = BytesIO(file)

    fsize = dataset.getbuffer().nbytes

    if fsize == 0:
        return {
            "success": False,
            "message": "Uploaded file does not contain a dataset.",
        }
    else:
        store_data(session, state, "dataset", dataset)
        return {"success": True, "message": "Dataset uploaded."}


@router.post("/settings-dataset")
def set_settings_dataset(settingsDataset: SettingsDataset, request: Request):
    state = request.app.state.cots
    session = request.cookies.get("session")
    store_data(session, state, "settings_dataset", settingsDataset)
    return {"success": True, "message": "Settings for dataset uploaded."}


@router.post("/settings-cots")
def set_settings_cots(settingsCots: SettingsCots, request: Request):
    state = request.app.state.cots
    session = request.cookies.get("session")
    store_data(session, state, "settings_cots", settingsCots)
    return {"success": True, "message": "Settings for COTS uploaded."}


@router.get("/settings-dataset")
def get_settings_dataset(request: Request):
    state = request.app.state.cots
    session = request.cookies.get("session")
    data = retrieve_data(session, state, "settings_dataset")
    if data:
        return {
            "success": True,
            "message": "Settings for dataset available.",
            "data": data.model_dump(),
        }

    else:
        return {"success": False, "message": "No settings for dataset uploaded."}


@router.post("/run")
def run(request: Request):

    import pandas as pd
    from app.engine.wrappers.cots import Cots

    state = request.app.state.cots
    session = request.cookies.get("session")
    data = retrieve_data(session, state)
    if not data:
        return {"success": False, "message": "Required information is missing."}

    if not "dataset" in data:
        return {"success": False, "message": "No dataset uploaded."}
    fsize = data["dataset"].getbuffer().nbytes
    if fsize == 0:
        return {
            "success": False,
            "message": "Uploaded file does not contain a dataset.",
        }
    if not "settings_dataset" in data:
        return {
            "response_type": "error",
            "message": "No settings for dataset uploaded.",
        }
    if not "settings_cots" in data:
        return {"response_type": "error", "message": "No settings for COTS uploaded."}

    settings_dataset = data["settings_dataset"]
    settings_cots = data["settings_cots"]

    object_id_col = settings_dataset.object_id
    time_col = settings_dataset.time
    feature_cols = settings_dataset.features
    delimiter = settings_dataset.column_separator
    dataset = data["dataset"]
    dataset.seek(0)

    dataset_df = pd.read_csv(dataset, encoding="utf-8", delimiter=delimiter)

    # check if the columns are in the dataset_df
    dataset_df_col_names = list(dataset_df.columns.values)
    if object_id_col not in dataset_df_col_names:
        return {"success": False, "message": "Object ID column not found in dataset"}
    elif time_col not in dataset_df_col_names:
        return {"success": False, "message": "Time column not found in dataset"}
    elif len(set(feature_cols) - set(dataset_df_col_names)) > 0:
        return {"success": False, "message": "Feature column(s) not found in dataset"}

    cots = Cots(dataset_df, settings_dataset, settings_cots)
    result_csv, result = cots.run()
    store_data(session, state, "clustering_result_csv", result_csv)
    store_data(session, state, "clustering_result", result)
    return {"success": True, "message": "Clustering completed."}


@router.get("/result")
def get_result(request: Request):
    state = request.app.state.cots
    session = request.cookies.get("session")
    clustering_result = retrieve_data(session, state, "clustering_result")
    if clustering_result:
        return {
            "success": True,
            "message": "Result available.",
            "data": clustering_result,
        }

    else:
        return {"success": False, "message": "No result available."}


@router.get("/result-csv")
def get_result_csv(request: Request):
    state = request.app.state.cots
    session = request.cookies.get("session")
    clustering_result_csv = retrieve_data(session, state, "clustering_result_csv")
    if clustering_result_csv:
        return {
            "success": True,
            "message": "Clustering result csv available.",
            "data": clustering_result_csv,
        }
    else:
        return {"success": False, "message": "No clustering result csv available."}


@router.post("/reset")
def reset(request: Request):
    session = request.cookies.get("session")
    delete_data(session, request.app.state.cots)
    return {"success": True, "message": "C(OTS)² successfully reset."}
