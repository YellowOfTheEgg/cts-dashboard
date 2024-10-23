import * as React from "react";
import { TextField, Button, MenuItem, Checkbox } from "@mui/material";
import { JSX } from "react";
import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { CardHeader, FormGroup, FormControlLabel } from "@mui/material";
import Card from "@mui/material/Card";
import { gatewayApi } from "@/utils/api";
import { ResponseNotification } from "@/components/ResponseNotification";

const distanceMeasures = ["MSE", "SSE", "MAE", "MAX", "DBI", "Exploit"];
const closeSettingsEndpoint = "/clustering-evaluation/close/settings-close";

export const Settings = () => {
  const [minPtsEnbabled, setMinPtsEnabled] = React.useState(false);

  const [qualityMeasure, setQualityMeasure] = React.useState(
    distanceMeasures[0]
  );
  const [minPts, setMinPts] = React.useState("3");
  const [jaccardIndex, setJaccardIndex] = React.useState(false);
  const [weighting, setWeighting] = React.useState(false);
  const [exploitationTerm, setExploitationTerm] = React.useState(false);

  const [settingsRequestResult, setSettingsRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });

  const [requestNumber, setRequestNumber] = React.useState(0);
  const [alertOpen, setAlertOpen] = React.useState(false);

  const onQualityMeasureChange = (measure: string) => {
    setQualityMeasure(measure);
    if (measure === "DBI" || measure === "Exploit") {
      setMinPtsEnabled(true);
    } else {
      setMinPtsEnabled(false);
    }
  };

  let distanceMeasureOptions: JSX.Element[] = [];
  distanceMeasures.forEach((measure, index) => {
    distanceMeasureOptions.push(
      <MenuItem
        key={index}
        value={measure}
        onClick={() => onQualityMeasureChange(measure)}
      >
        {measure}
      </MenuItem>
    );
  });

  function dtypesMatching() {
    if (qualityMeasure === "DBI" || qualityMeasure === "Exploit") {
      const minPtsInt = parseInt(minPts);
      if (isNaN(minPtsInt) || minPtsInt <= 0) {
        return false;
      } else {
        return true;
      }
    }
    return true;
  }

  const onUploadSettings = () => {
    setRequestNumber(requestNumber + 1);
    if (!dtypesMatching()) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: min. Points must be a positive integer.",
      });
      setAlertOpen(true);
      return;
    }
    const closeSettings = {
      quality_measure: qualityMeasure,
      minpts: minPts,
      jaccard_index: jaccardIndex,
      weighting: weighting,
      exploitation_term: exploitationTerm,
    };
    gatewayApi
      .post(closeSettingsEndpoint, closeSettings)
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
    <Card>
      <CardHeader
        title="Settings"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
      />

      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6} md={6}>
            <TextField
              //   id="close_quality_measure"
              label="Quality Measure"
              variant="outlined"
              fullWidth
              required
              select
              value={qualityMeasure}
              InputProps={{ id: "close_quality_measure" }}
              InputLabelProps={{
                shrink: true,
                htmlFor: "close_quality_measure",
              }}
            >
              {distanceMeasureOptions}
            </TextField>
          </Grid>
          <Grid item xs={12} lg={6} md={6}>
            <TextField
              id="close_minpts"
              label="Min. Points"
              variant="outlined"
              fullWidth
              required
              disabled={!minPtsEnbabled}
              InputLabelProps={{ shrink: true }}
              value={minPts}
              onChange={(e) => {
                setMinPts(e.target.value);
              }}
            >
              {distanceMeasureOptions}
            </TextField>
          </Grid>
          <Grid item xs={12} md={12} lg={12} xl={12}>
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
              <FormControlLabel
                labelPlacement="bottom"
                id="close_exploitation_term"
                label={"Exploitation Term"}
                control={
                  <Checkbox
                    id="close_exploitation_term"
                    value={exploitationTerm}
                    onChange={() => {
                      setExploitationTerm(!exploitationTerm);
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
          <Grid item xs={12} md={12} lg={12} xl={12}>
            <Button variant="contained" onClick={onUploadSettings}>
              Upload Settings
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
