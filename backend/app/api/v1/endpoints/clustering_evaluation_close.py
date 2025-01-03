from typing import Annotated
from fastapi import APIRouter
from fastapi import File
from app.models.settings_clustered_dataset import SettingsClusteredDataset
from app.models.settings_close import SettingsClose
from fastapi import Request
from app.crud import store_data, retrieve_data, delete_data

router = APIRouter()


@router.post("/dataset")
def set_dataset(file: Annotated[bytes, File()], request: Request):
    from io import BytesIO

    state = request.app.state.close
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
def set_settings_dataset(settingsDataset: SettingsClusteredDataset, request: Request):
    state = request.app.state.close
    session = request.cookies.get("session")
    store_data(session, state, "settings_dataset", settingsDataset)
    return {"success": True, "message": "Settings for dataset uploaded."}


@router.post("/settings-close")
def set_settings_close(settingsClose: SettingsClose, request: Request):
    state = request.app.state.close
    session = request.cookies.get("session")
    store_data(session, state, "settings_close", settingsClose)
    return {"success": True, "message": "Settings for CLOSE uploaded."}


@router.post("/run")
def run(request: Request):
    from app.engine.wrappers.close import Close
    import pandas as pd

    state = request.app.state.close
    session = request.cookies.get("session")
    data = retrieve_data(session, state)
    if not data:
        return {
            "success": False,
            "message": "Required information is missing. Re-upload all information and try again.",
        }

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
    if not "settings_close" in data:
        return {"response_type": "error", "message": "No settings for CLOSE uploaded."}

    settings_dataset = data["settings_dataset"]
    settings_close= data["settings_close"]
    object_id_column = settings_dataset.object_id
    time_column = settings_dataset.time
    cluster_id_column = settings_dataset.cluster_id
    feature_columns = settings_dataset.features
    delimiter = settings_dataset.column_separator
    dataset = data["dataset"]
    dataset.seek(0)

    dataset_df = pd.read_csv(dataset, encoding="utf-8", delimiter=delimiter)
    dataset_df_col_names = list(dataset_df.columns.values)

    if object_id_column not in dataset_df_col_names:
        return {"success": False, "message": "Object ID column not found in dataset."}
    if time_column not in dataset_df_col_names:
        return {"success": False, "message": "Time column not found in dataset."}
    if cluster_id_column not in dataset_df_col_names:
        return {"success": False, "message": "Cluster ID column not found in dataset."}
    if len(set(feature_columns) - set(dataset_df_col_names)) > 0:
        return {"success": False, "message": "Feature column(s) not found in dataset."}

    close = Close(dataset_df, settings_dataset, settings_close)
    close_score = close.run()
    store_data(session, state, "evaluation_result", close_score)

    return {
        "success": True,
        "message": "Rating of clustering completed.",
    }


@router.get("/result")
def get_result(request: Request):
    state = request.app.state.close
    session = request.cookies.get("session")
    evaluation_result = retrieve_data(session, state, "evaluation_result")
    if evaluation_result:
        return {
            "success": True,
            "message": "Result available.",
            "data": state.evaluation_result,
        }

    else:
        return {
            "success": False,
            "message": "No result available.",
        }


@router.post("/reset")
def reset(request: Request):
    session = request.cookies.get("session")
    delete_data(session, request.app.state.close)
    return {"success": True, "message": "CLOSE successfully reset."}
