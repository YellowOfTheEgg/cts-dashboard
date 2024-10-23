from fastapi.testclient import TestClient
from app.main import app

from io import BytesIO, StringIO
import os
import json

file_path = os.path.dirname(os.path.abspath(__file__))


client = TestClient(app)


def test_set_dataset():
    with open(
        f"{file_path}/test_data/outlier_detection_todits/input_data.csv", "rb"
    ) as fh:
        data_buf = BytesIO(fh.read())

    empty_file_response = client.post(
        "/api/v1/outlier-detection/todits/dataset",
        files={"file": ("empty.csv", BytesIO())},
    )
    assert empty_file_response.status_code == 200
    assert empty_file_response.json() == {
        "success": False,
        "message": "Uploaded file does not contain a dataset.",
    }

    response = client.post(
        "/api/v1/outlier-detection/todits/dataset",
        files={"file": ("input_data.csv", data_buf)},
    )
    assert response.status_code == 200
    assert response.json() == {"success": True, "message": "Dataset uploaded."}


def test_set_settings_dataset():
    response = client.post(
        "/api/v1/outlier-detection/todits/settings-dataset",
        json={
            "object_id": "object_id",
            "time": "time",
            "cluster_id": "cluster",
            "features": ["feature1", "feature2"],
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for dataset uploaded.",
    }

    response = client.get("/api/v1/outlier-detection/todits/settings-dataset")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for dataset available.",
        "data": {
            "object_id": "object_id",
            "time": "time",
            "features": ["feature1", "feature2"],
            "column_separator": ",",
            "cluster_id": "cluster",
        },
    }


def test_set_settings_todits():
    response = client.post(
        "/api/v1/outlier-detection/todits/settings-todits", json={"sigma": 1}
    )
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for TODITS uploaded.",
    }

    response = client.post(
        "/api/v1/outlier-detection/todits/settings-todits", json={"sigma": "a"}
    )
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "int_parsing",
                "loc": ["body", "sigma"],
                "msg": "Input should be a valid integer, unable to parse string as an integer",
                "input": "a",
            }
        ]
    }


def test_run():
    with open(
        f"{file_path}/test_data/outlier_detection_todits/input_data.csv", "rb"
    ) as fh:
        data_buf = BytesIO(fh.read())
        data_buf.seek(0)

    client.post(
        "/api/v1/outlier-detection/todits/dataset",
        files={"file": ("empty.csv", BytesIO())},
    )
    response = client.post("/api/v1/outlier-detection/todits/run")
    assert response.status_code == 200
    assert response.json() == {
        "success": False,
        "message": "Uploaded file does not contain a dataset.",
    }

    client.post(
        "/api/v1/outlier-detection/todits/dataset",
        files={"file": ("gen_clustered_test.csv", data_buf)},
    )
    response = client.post("/api/v1/outlier-detection/todits/run")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Outlier detection completed.",
    }


def test_get_result():
    with open(f"{file_path}/test_data/outlier_detection_todits/result.json", "r") as fh:
        test_result = json.load(fh)

    response = client.get("/api/v1/outlier-detection/todits/result")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Result available.",
        "data": test_result,
    }


def test_get_result_csv():
    import pandas as pd

    response = client.get("/api/v1/outlier-detection/todits/result-csv")

    assert response.status_code == 200
    json_response = response.json()

    assert json_response["success"] == True
    assert json_response["message"] == "Outlier detection result csv available."

    response_df = pd.read_csv(StringIO(json_response["data"]))

    test_df = pd.read_csv(
        f"{file_path}/test_data/outlier_detection_todits/result_csv.csv"
    )

    assert response_df.equals(test_df)


def test_rest():
    response = client.post("/api/v1/outlier-detection/todits/reset")
    assert response.status_code == 200
