from typing import Annotated
from fastapi import APIRouter
from fastapi import File
from app.models.settings_clustered_dataset import SettingsClusteredDataset
from app.models.settings_dact import SettingsDact
from fastapi import Request
from app.crud import store_data, retrieve_data, delete_data

router = APIRouter()


@router.post("/dataset")
def set_dataset(file: Annotated[bytes, File()], request: Request):
    from io import BytesIO

    state = request.app.state.dact
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
    state = request.app.state.dact
    session = request.cookies.get("session")
    store_data(session, state, "settings_dataset", settingsDataset)
    return {"success": True, "message": "Settings for dataset uploaded."}


@router.get("/settings-dataset")
def get_settings_dataset(request: Request):
    state = request.app.state.dact
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


@router.post("/settings-dact")
def set_settings_dact(settingsDact: SettingsDact, request: Request):
    state = request.app.state.dact
    session = request.cookies.get("session")
    store_data(session, state, "settings_dact", settingsDact)
    return {"success": True, "message": "Settings for DACT uploaded."}


@router.post("/run")
def run(request: Request):
    from app.engine.wrappers.dact import Dact
    import pandas as pd

    state = request.app.state.dact
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
    if not "settings_dact" in data:
        return {"response_type": "error", "message": "No settings for DACT uploaded."}

    settings_dataset = data["settings_dataset"]
    settings_dact = data["settings_dact"]
    # restructure dataframe
    object_id_column = settings_dataset.object_id
    time_column = settings_dataset.time
    cluster_id_column = settings_dataset.cluster_id
    feature_columns = settings_dataset.features
    delimiter = settings_dataset.column_separator

    dataset = data["dataset"]
    dataset.seek(0)

    dataset_df = pd.read_csv(dataset, encoding="utf-8", delimiter=delimiter)
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

    dact = Dact(dataset_df, settings_dataset, settings_dact)
    outlier_result_csv, outlier_result = dact.run()
    store_data(session, state, "outlier_result_csv", outlier_result_csv)
    store_data(session, state, "outlier_result", outlier_result)
    return {"success": True, "message": "Outlier detection completed."}


@router.get("/result")
def get_result(request: Request):
    state = request.app.state.dact
    session = request.cookies.get("session")
    outlier_result = retrieve_data(session, state, "outlier_result")
    if outlier_result:
        return {
            "success": True,
            "message": "Result available.",
            "data": outlier_result,
        }
    else:
        return {"success": False, "message": "No result available."}


@router.get("/result-csv")
def get_result_csv(request: Request):
    state = request.app.state.dact
    session = request.cookies.get("session")
    outlier_result_csv = retrieve_data(session, state, "outlier_result_csv")
    if outlier_result_csv:
        return {
            "success": True,
            "message": "Outlier detection result csv available.",
            "data": outlier_result_csv,
        }
    else:
        return {
            "success": False,
            "message": "No outlier detection result csv available.",
        }


@router.post("/reset")
def reset(request: Request):
    session = request.cookies.get("session")
    delete_data(session, request.app.state.dact)
    return {"success": True, "message": "DACT successfully reset."}
