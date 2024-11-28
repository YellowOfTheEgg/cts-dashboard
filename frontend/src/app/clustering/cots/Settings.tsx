import * as React from "react";
import { TextField, Button } from "@mui/material";

import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { CardHeader } from "@mui/material";
import Card from "@mui/material/Card";

import { gatewayApi } from "@/utils/api";

import { ResponseNotification } from "@/components/ResponseNotification";

//api endpoints used in this component
const settingsCotsEndpoint = "/clustering/cots/settings-cots";

export const Settings = () => {
  const [minCf, setMinCf] = React.useState("0.3");
  const [sw, setSw] = React.useState("3");

  //request result
  const [settingsRequestResult, setSettingsRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });

  //alert state
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [requestNumber, setRequestNumber] = React.useState(0);

  function dtypesMatching() {
    const parsedMinCf = parseFloat(minCf);
    const parsedSw = parseInt(sw);
    if (
      isNaN(parsedMinCf) ||
      parsedMinCf < 0 ||
      parsedMinCf > 1 ||
      "" + parsedMinCf !== minCf
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message:
          "Settings upload: min cf must be a positive number between zero and one.",
      });
      setAlertOpen(true);
      return false;
    } else if (isNaN(parsedSw) || parsedSw < 0 || "" + parsedSw !== sw) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: sw must be a positive integer.",
      });
      setAlertOpen(true);
      return false;
    }

    return true;
  }

  function onUploadSettings() {
    setRequestNumber(requestNumber + 1);
    if (!dtypesMatching()) {
      return;
    }

    const settings_cots = { min_cf: minCf, sw: sw };
    gatewayApi
      .post(settingsCotsEndpoint, settings_cots,{ withCredentials: true })
      .then((outerResponse) => {
        setSettingsRequestResult({
          requestDone: true,
          success: outerResponse.data["success"],
          message: "Settings upload: " + outerResponse.data["message"],
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
  }

  return (
    <Card>
      <CardHeader
        title="C(OTS)² Settings"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
      />

      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={12} md={12}>
            <TextField
              id="min_cf"
              label="Min Cf"
              variant="outlined"
              fullWidth
              value={minCf}
              onChange={(e) => {
                setMinCf(e.target.value);
              }}
              required
            />
          </Grid>
          <Grid item xs={12} lg={12} md={12}>
            <TextField
              id="sw"
              label="Sliding Window Size"
              variant="outlined"
              fullWidth
              value={sw}
              onChange={(e) => {
                setSw(e.target.value);
              }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <ResponseNotification
              notificationOpen={alertOpen}
              onClose={() => {
                setAlertOpen(false);
              }}
              requestNumber={requestNumber}
              requestResult={settingsRequestResult}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={4} xl={4}>
            <Button variant="contained" onClick={onUploadSettings}>
              Upload Settings
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
