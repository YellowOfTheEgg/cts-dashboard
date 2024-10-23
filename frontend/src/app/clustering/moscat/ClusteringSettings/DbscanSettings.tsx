import { Button, Grid, TextField } from "@mui/material";
import React from "react";
import { gatewayApi } from "@/utils/api";
import { ResponseNotification } from "@/components/ResponseNotification";

const dbscanSettingsEndpoint = "/clustering/moscat/settings-dbscan";

export const DbscanSettings = () => {
  const [epsFrom, setEpsFrom] = React.useState("");
  const [epsTo, setEpsTo] = React.useState("");
  const [minSamplesFrom, setMinSamplesFrom] = React.useState("");
  const [minSamplesTo, setMinSamplesTo] = React.useState("");
  const [settingsRequestResult, setSettingsRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [requestNumber, setRequestNumber] = React.useState(0);

  function dtypesMatching() {
    const parsedEpsFrom = parseFloat(epsFrom);
    const parsedEpsTo = parseFloat(epsTo);
    const parsedMinSamplesFrom = parseInt(minSamplesFrom);
    const parsedMinSamplesTo = parseInt(minSamplesTo);
    if (
      isNaN(parsedEpsFrom) ||
      parsedEpsFrom < 0 ||
      "" + parsedEpsFrom !== epsFrom
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: eps (from) must be a number greater than 0.",
      });
      setAlertOpen(true);
      return false;
    } else if (
      isNaN(parsedEpsTo) ||
      parsedEpsTo < 0 ||
      "" + parsedEpsTo !== epsTo
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: eps (to) must be a number greater than 0.",
      });
      setAlertOpen(true);
      return false;
    } else if (parsedEpsFrom > parsedEpsTo) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: eps (from) must be less than eps (to).",
      });
      setAlertOpen(true);
      return false;
    } else if (
      isNaN(parsedMinSamplesFrom) ||
      parsedMinSamplesFrom < 0 ||
      "" + parsedMinSamplesFrom !== minSamplesFrom
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message:
          "Settings upload: min samples (from) must be an integer greater than 0.",
      });
      setAlertOpen(true);
      return false;
    } else if (
      isNaN(parsedMinSamplesTo) ||
      parsedMinSamplesTo < 0 ||
      "" + parsedMinSamplesTo !== minSamplesTo
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message:
          "Settings upload: min samples (to) must be an integer greater than 0.",
      });
      setAlertOpen(true);
      return false;
    } else if (parsedMinSamplesFrom > parsedMinSamplesTo) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message:
          "Settings upload: min samples (from) must be less than min samples (to).",
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

    const dbscanSettings = {
      minpts_min: minSamplesFrom,
      minpts_max: minSamplesTo,
      eps_min: epsFrom,
      eps_max: epsTo,
    };
    gatewayApi
      .post(dbscanSettingsEndpoint, dbscanSettings)
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
      <Grid item xs={12} md={3} lg={3}>
        <TextField
          id="eps_from"
          label="Eps (from)"
          variant="outlined"
          value={epsFrom}
          onChange={(e) => setEpsFrom(e.target.value)}
          required
          fullWidth
        />
      </Grid>

      <Grid item xs={12} md={3} lg={3}>
        <TextField
          id="eps_to"
          label="Eps (to)"
          variant="outlined"
          value={epsTo}
          onChange={(e) => setEpsTo(e.target.value)}
          required
          fullWidth
        />
      </Grid>
      <Grid item xs={12} md={3} lg={3}>
        <TextField
          id="min_samples_from"
          label="Min Samples (from)"
          value={minSamplesFrom}
          onChange={(e) => setMinSamplesFrom(e.target.value)}
          variant="outlined"
          required
          fullWidth
        />
      </Grid>
      <Grid item xs={12} lg={3} md={3}>
        <TextField
          id="min_samples_to"
          label="Min Samples (to)"
          value={minSamplesTo}
          onChange={(e) => setMinSamplesTo(e.target.value)}
          variant="outlined"
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
