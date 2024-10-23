from fastapi.testclient import TestClient
from app.main import app

from io import BytesIO, StringIO
import os
import json

file_path = os.path.dirname(os.path.abspath(__file__))
client = TestClient(app)

api_path = "/api/v1/clustering/moscat"


def test_set_dataset():
    with open(f"{file_path}/test_data/clustering_moscat/input_data.csv", "rb") as fh:
        data_buf = BytesIO(fh.read())

    empty_file_response = client.post(
        f"{api_path}/dataset", files={"file": ("empty.csv", BytesIO())}
    )
    assert empty_file_response.status_code == 200
    assert empty_file_response.json() == {
        "success": False,
        "message": "Uploaded file does not contain a dataset.",
    }

    response = client.post(
        f"{api_path}/dataset", files={"file": ("input_data.csv", data_buf)}
    )
    assert response.status_code == 200
    assert response.json() == {"success": True, "message": "Dataset uploaded."}


def test_set_settings_dataset():
    response = client.post(
        f"{api_path}/settings-dataset",
        json={
            "object_id": "object_id",
            "time": "time",
            "features": ["feature1", "feature2"],
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for dataset uploaded.",
    }


def test_get_settings_dataset():
    response = client.get(f"{api_path}/settings-dataset")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for dataset available.",
        "data": {
            "object_id": "object_id",
            "time": "time",
            "features": ["feature1", "feature2"],
            "column_separator": ",",
        },
    }


def test_set_settings_kmeans():
    kmeans_settings = {"k_min": 2, "k_min": 3, "max_iter": 10}
    response = client.post(f"{api_path}/settings-kmeans", json=kmeans_settings)
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for K-Means uploaded.",
    }


def test_set_settings_incremental_kmeans():
    incremental_kmeans_settings = {"k_min": 2, "k_min": 3, "max_iter": 10}
    response = client.post(
        f"{api_path}/settings-incremental-kmeans", json=incremental_kmeans_settings
    )
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for Incremental K-Means uploaded.",
    }


def test_set_settings_dbscan():
    dbscan_settings = {"minpts_min": 2, "minpts_max": 4, "eps_min": 0.1, "eps_max": 0.3}
    response = client.post(f"{api_path}/settings-dbscan", json=dbscan_settings)
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for DBSCAN uploaded.",
    }


def test_set_settings_moscat():
    moscat_settings = {
        "sq_metric": "Silhouette Score",
        "tq_metric": "Jaccard Score",
        "weighting_strategy": "Closest to Optimum",
        "weight": 0,
    }
    response = client.post(f"{api_path}/settings-moscat", json=moscat_settings)
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for MOSCAT uploaded.",
    }


def test_run():
    client.post(f"{api_path}/dataset", files={"file": ("empty.csv", BytesIO())})
    response = client.post(f"{api_path}/run")
    assert response.status_code == 200
    assert response.json() == {
        "success": False,
        "message": "Uploaded file does not contain a dataset.",
    }

    with open(f"{file_path}/test_data/clustering_moscat/input_data.csv", "rb") as fh:
        data_buf = BytesIO(fh.read())
        data_buf.seek(0)
    client.post(
        f"{api_path}/dataset", files={"file": ("gen_clustered_test.csv", data_buf)}
    )
    response = client.post(f"{api_path}/run")
    assert response.status_code == 200
    assert response.json() == {"success": True, "message": "Clustering completed."}


def test_get_result():
    with open(f"{file_path}/test_data/clustering_moscat/result.json", "r") as fh:
        test_result = json.load(fh)
    response = client.get(f"{api_path}/result")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Result available.",
        "data": test_result,
    }


def test_get_result_csv():
    import pandas as pd

    response = client.get(f"{api_path}/result-csv")

    assert response.status_code == 200
    json_response = response.json()

    assert json_response["success"] == True
    assert json_response["message"] == "Result csv available."

    response_df = pd.read_csv(StringIO(json_response["data"]))

    test_df = pd.read_csv(f"{file_path}/test_data/clustering_moscat/result_csv.csv")

    assert response_df.equals(test_df)


def test_reset():
    response = client.post(f"{api_path}/reset")
    assert response.status_code == 200
