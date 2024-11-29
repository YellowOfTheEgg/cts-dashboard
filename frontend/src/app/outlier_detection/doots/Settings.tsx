import * as React from "react";
import {
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { CardHeader } from "@mui/material";
import Card from "@mui/material/Card";

import { gatewayApi } from "@/utils/api";

import { ResponseNotification } from "@/components/ResponseNotification";

//api endpoints used in this component
const settingsDootsEndpoint = "/outlier-detection/doots/settings-doots";

export const Settings = () => {
  const [weighting, setWeighting] = React.useState(false);
  const [jaccardIndex, setJaccardIndex] = React.useState(false);
  const [tauValue, setTauValue] = React.useState("0.5");

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
    const parsedVal = parseFloat(tauValue);
    if (
      isNaN(parsedVal) ||
      parsedVal < 0 ||
      parsedVal > 1 ||
      "" + parsedVal !== tauValue
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message:
          "Settings upload: tau must be a positive number between zero and one.",
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
    const settings_doots = {
      weighting: weighting,
      jaccard: jaccardIndex,
      tau: tauValue,
    };
    gatewayApi
      .post(settingsDootsEndpoint, settings_doots, { withCredentials: true })
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
        title="DOOTS Settings"
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
              id="doots_tau"
              label="Tau"
              fullWidth
              value={tauValue}
              onChange={(e) => {
                setTauValue(e.target.value);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} lg={12} md={12}>
            <FormGroup
              sx={{
                position: "flex",
                flexDirection: "row",
                justifyContent: "left",
                alignItems: "center",
              }}
            >
              <FormControlLabel
                labelPlacement="bottom"
                id="close_jaccard_index"
                label={"Jaccard Index"}
                control={
                  <Checkbox
                    id="close_jaccard_index"
                    value={jaccardIndex}
                    onChange={() => {
                      setJaccardIndex(!jaccardIndex);
                    }}
                  />
                }
              />
              <FormControlLabel
                labelPlacement="bottom"
                id="close_weighting"
                label={"Weighting"}
                control={
                  <Checkbox
                    id="close_weighting"
                    value={weighting}
                    onChange={() => {
                      setWeighting(!weighting);
                    }}
                  />
                }
              />
            </FormGroup>
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
