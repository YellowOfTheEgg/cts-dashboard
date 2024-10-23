import { ResponseNotification } from "@/components/ResponseNotification";
import { Button, Grid, TextField } from "@mui/material";
import React from "react";
import { gatewayApi } from "@/utils/api";

const kmeansSettingsEndpoint = "/clustering/moscat/settings-kmeans";

export const KmeansSettings = () => {
  const [kFrom, setKFrom] = React.useState("");
  const [kTo, setKTo] = React.useState("");
  const [maxIterations, setMaxIterations] = React.useState("10");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [settingsRequestResult, setSettingsRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });
  const [requestNumber, setRequestNumber] = React.useState(0);

  function dtypesMatching() {
    const parsedKFrom = parseInt(kFrom);
    const parsedKTo = parseInt(kTo);
    const parsedMaxIterations = parseInt(maxIterations);
    if (isNaN(parsedKFrom) || parsedKFrom <= 0 || "" + parsedKFrom !== kFrom) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: K (from) must be an integer greater than 0.",
      });
      setAlertOpen(true);
      return false;
    } else if (isNaN(parsedKTo) || parsedKTo <= 0 || "" + parsedKTo !== kTo) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: K (to) must be an integer greater than 0.",
      });
      setAlertOpen(true);
      return false;
    } else if (parsedKFrom > parsedKTo) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: K (from) must be less than K (to).",
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
    if (!dtypesMatching()) {
      return;
    }
    setRequestNumber(requestNumber + 1);
    const kmeansSettings = {
      k_min: kFrom,
      k_max: kTo,
      max_iter: maxIterations,
    };
    gatewayApi
      .post(kmeansSettingsEndpoint, kmeansSettings)
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
      <Grid item xs={12} md={4} lg={4}>
        <TextField
          id="k_from"
          label="K (from)"
          variant="outlined"
          value={kFrom}
          onChange={(e) => setKFrom(e.target.value)}
          required
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <TextField
          id="k_to"
          label="K (to)"
          variant="outlined"
          value={kTo}
          onChange={(e) => setKTo(e.target.value)}
          required
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
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
