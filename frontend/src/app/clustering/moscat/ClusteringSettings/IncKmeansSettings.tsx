import { ResponseNotification } from "@/components/ResponseNotification";
import { Button, Grid, TextField } from "@mui/material";
import React from "react";
import { gatewayApi } from "@/utils/api";

const kmeansSettingsEndpoint = "/clustering/moscat/settings-incremental-kmeans";

export const IncKmeansSettings = () => {
  const [k, setK] = React.useState("");
  const [maxIterations, setMaxIterations] = React.useState("10");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [settingsRequestResult, setSettingsRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });
  const [requestNumber, setRequestNumber] = React.useState(0);

  function dtypesMatching() {
    const parsedK = parseInt(k);
    const parsedMaxIterations = parseInt(maxIterations);
    if (isNaN(parsedK) || parsedK <= 0 || "" + parsedK !== k) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: K must be an integer greater than 0.",
      });
      setAlertOpen(true);
      return false;
    } else if (
      isNaN(parsedMaxIterations) ||
      parsedMaxIterations <= 0 ||
      "" + parsedMaxIterations !== maxIterations
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message:
          "Settings upload: Max Iterations must be an integer greater than 0.",
      });
      setAlertOpen(true);
      return false;
    }
    return true;
  }

  const onUploadSettings = () => {
    setRequestNumber(requestNumber + 1);
    if (!dtypesMatching()) {
      return;
    }

    const incKmeansSettings = {
      k: k,
      max_iter: maxIterations,
    };
    gatewayApi
      .post(kmeansSettingsEndpoint, incKmeansSettings, {
        withCredentials: true,
      })
      .then((response) => {
        setSettingsRequestResult({
          requestDone: true,
          success: response.data["success"],
          message: response.data["message"],
        });
        setAlertOpen(true);
      })
      .catch((error) => {
        setSettingsRequestResult({
          requestDone: true,
          success: false,
          message: "Settings upload: " + error.response.data.detail[0].msg,
        });
        setAlertOpen(true);
      });
  };

  return (
    <>
      <Grid item xs={12} md={6} lg={6}>
        <TextField
          id="k"
          label="K"
          variant="outlined"
          value={k}
          onChange={(e) => setK(e.target.value)}
          required
          fullWidth
        />
      </Grid>

      <Grid item xs={12} md={6} lg={6}>
        <TextField
          id="max_iterations"
          label="Max Iterations"
          variant="outlined"
          value={maxIterations}
          onChange={(e) => setMaxIterations(e.target.value)}
          required
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <ResponseNotification
          notificationOpen={alertOpen}
          onClose={() => {
            setAlertOpen(false);
          }}
          requestNumber={requestNumber}
          requestResult={settingsRequestResult}
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12} xl={12}>
        <Button variant="contained" onClick={onUploadSettings}>
          Upload Settings
        </Button>
      </Grid>
    </>
  );
};
