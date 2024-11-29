import * as React from "react";
import { TextField, Button } from "@mui/material";

import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { CardHeader } from "@mui/material";
import Card from "@mui/material/Card";

import { gatewayApi } from "@/utils/api";

import { ResponseNotification } from "@/components/ResponseNotification";

//api endpoints used in this component
const settingsToditsEndpoint = "/outlier-detection/todits/settings-todits";

export const Settings = () => {
  const [sigmaValue, setSigmaValue] = React.useState("1");

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
    const parsedVal = parseInt(sigmaValue);
    if (isNaN(parsedVal) || "" + parsedVal !== sigmaValue || parsedVal < 0) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: Sigma must be a positive integer or zero.",
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

    const settings_todits = {
      sigma: sigmaValue,
    };
    gatewayApi
      .post(settingsToditsEndpoint, settings_todits, { withCredentials: true })
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
        title="TODITS Settings"
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
              id="todits_sigma"
              label="Sigma"
              //   type="number"
              fullWidth
              value={sigmaValue}
              onChange={(e) => {
                setSigmaValue(e.target.value);
              }}
              InputLabelProps={{
                shrink: true,
              }}
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
