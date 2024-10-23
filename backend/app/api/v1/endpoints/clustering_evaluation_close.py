from typing import Annotated
from fastapi import APIRouter

from fastapi import File


from app.models.settings_clustered_dataset import SettingsClusteredDataset

from app.models.settings_close import SettingsClose


from fastapi import Request

router = APIRouter()


@router.post("/dataset")
def set_dataset(file: Annotated[bytes, File()], request: Request):
    import pandas as pd
    from io import BytesIO

    state = request.app.state.close
    # state.dataset_df=pd.read_csv(BytesIO(file),encoding='utf-8')
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

    state = request.app.state.close

    state.settings_dataset = settingsDataset
    # datasettings check

    return {"success": True, "message": "Settings for dataset uploaded."}


@router.post("/settings-close")
def set_settings_close(settingsClose: SettingsClose, request: Request):

    state = request.app.state.close
    state.settings_close = settingsClose

    return {"success": True, "message": "Settings for CLOSE uploaded."}


@router.post("/run")
def run(request: Request):
    from app.engine.wrappers.close import Close
    import pandas as pd

    state = request.app.state.close

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
    if not hasattr(state, "settings_close"):
        return {"response_type": "error", "message": "No settings for CLOSE uploaded."}

    object_id_column = state.settings_dataset.object_id
    time_column = state.settings_dataset.time
    cluster_id_column = state.settings_dataset.cluster_id
    feature_columns = state.settings_dataset.features
    delimiter = state.settings_dataset.column_separator

    state.dataset.seek(0)
    dataset_df = pd.read_csv(state.dataset, encoding="utf-8", delimiter=delimiter)
    dataset_df_col_names = list(dataset_df.columns.values)

    if object_id_column not in dataset_df_col_names:
        return {"success": False, "message": "Object ID column not found in dataset."}
    if time_column not in dataset_df_col_names:
        return {"success": False, "message": "Time column not found in dataset."}
    if cluster_id_column not in dataset_df_col_names:
        return {"success": False, "message": "Cluster ID column not found in dataset."}
    if len(set(feature_columns) - set(dataset_df_col_names)) > 0:
        return {"success": False, "message": "Feature column(s) not found in dataset."}

    close = Close(dataset_df, state.settings_dataset, state.settings_close)
    state.evaluation_result = close.run()

    return {
        "success": True,
        "message": "Rating of clustering completed.",
    }


@router.get("/result")
def get_result(request: Request):
    state = request.app.state.close
    if hasattr(state, "evaluation_result"):
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
    from starlette.datastructures import State

    request.app.state.close = State()
