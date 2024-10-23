from fastapi.testclient import TestClient
from app.main import app

from io import BytesIO
import os


file_path = os.path.dirname(os.path.abspath(__file__))

client = TestClient(app)


def test_set_dataset():
    with open(
        f"{file_path}/test_data/clustering_evaluation_close/input_data.csv", "rb"
    ) as fh:
        data_buf = BytesIO(fh.read())

    empty_file_response = client.post(
        "/api/v1/clustering-evaluation/close/dataset",
        files={"file": ("empty.csv", BytesIO())},
    )
    assert empty_file_response.status_code == 200
    assert empty_file_response.json() == {
        "success": False,
        "message": "Uploaded file does not contain a dataset.",
    }

    response = client.post(
        "/api/v1/clustering-evaluation/close/dataset",
        files={"file": ("input_data.csv", data_buf)},
    )
    assert response.status_code == 200
    assert response.json() == {"success": True, "message": "Dataset uploaded."}


def test_set_settings_dataset():

    response = client.post(
        "/api/v1/clustering-evaluation/close/settings-dataset",
        json={
            "object_id": "object_id",
            "time": "time",
            "cluster_id": "cluster_id",
            "features": ["feature1", "feature2"],
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for dataset uploaded.",
    }


def test_set_settings_close():
    settings_close = {
        "quality_measure": "MSE",
        "minpts": 2,
        "jaccard_index": False,
        "weighting": False,
        "exploitation_term": False,
    }
    response = client.post(
        "/api/v1/clustering-evaluation/close/settings-close", json=settings_close
    )
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Settings for CLOSE uploaded.",
    }


def test_run():
    with open(
        f"{file_path}/test_data/clustering_evaluation_close/input_data.csv", "rb"
    ) as fh:
        data_buf = BytesIO(fh.read())
        data_buf.seek(0)

    client.post(
        "/api/v1/clustering-evaluation/close/dataset",
        files={"file": ("empty.csv", BytesIO())},
    )
    response = client.post("/api/v1/clustering-evaluation/close/run")
    assert response.status_code == 200
    assert response.json() == {
        "success": False,
        "message": "Uploaded file does not contain a dataset.",
    }

    client.post(
        "/api/v1/clustering-evaluation/close/dataset",
        files={"file": ("gen_clustered_test.csv", data_buf)},
    )
    response = client.post("/api/v1/clustering-evaluation/close/run")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Rating of clustering completed.",
    }


def test_get_result():
    response = client.get("/api/v1/clustering-evaluation/close/result")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Result available.",
        "data": 0.7451414494153175,
    }


def test_rest():
    response = client.post("/api/v1/clustering-evaluation/close/reset")
    assert response.status_code == 200
