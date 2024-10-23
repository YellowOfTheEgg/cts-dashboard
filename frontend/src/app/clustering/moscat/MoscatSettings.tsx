import * as React from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { JSX } from "react";
import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { CardHeader } from "@mui/material";
import Card from "@mui/material/Card";

import { gatewayApi } from "@/utils/api";
import { ResponseNotification } from "@/components/ResponseNotification";
import { MoscatSettingsContext } from "@/context/moscatSettingsContext";

const weightSelectionStrategies = [
  "Manual",
  "Closest to Optimum",
  "Maximum Stability",
];
const snapshotQualityMetrics = ["Silhouette Score", "MSE", "DBCV"];
const temporalQualityMetrics = ["Jaccard Score", "Centroid Shifting Score"];

const moscatSettingsEndpoint = "/clustering/moscat/settings-moscat";

export const MoscatSettings = () => {
  const [snapshotQualityMetric, setSnapshotQualityMetric] = React.useState(
    snapshotQualityMetrics[0]
  );
  const [temporalQualityMetric, setTemporalQualityMetric] = React.useState(
    temporalQualityMetrics[0]
  );
  const [weightingStrategy, setWeightingStrategy] = React.useState(
    weightSelectionStrategies[0]
  );
  const [weight, setWeight] = React.useState("0.5");

  const [settingsRequestResult, setSettingsRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [requestNumber, setRequestNumber] = React.useState(0);

  const { selectedClusteringAlgorithm } = React.useContext(
    MoscatSettingsContext
  );

  let snapshotQualityMetricOptions: JSX.Element[] = [];
  let temporalQualityMetricOptions: JSX.Element[] = [];
  let weightSelectionStrategiesOptions: JSX.Element[] = [];

  snapshotQualityMetrics.forEach((metric, index) => {
    snapshotQualityMetricOptions.push(
      <MenuItem
        key={index}
        value={metric}
        onClick={() => setSnapshotQualityMetric(metric)}
      >
        {metric}
      </MenuItem>
    );
  });
  temporalQualityMetrics.forEach((metric, index) => {
    if (
      selectedClusteringAlgorithm === "DBSCAN" ||
      selectedClusteringAlgorithm === ""
    ) {
      if (metric !== "Centroid Shifting Score") {
        temporalQualityMetricOptions.push(
          <MenuItem
            key={index}
            value={metric}
            onClick={() => setTemporalQualityMetric(metric)}
          >
            {metric}
          </MenuItem>
        );
      }
    } else {
      temporalQualityMetricOptions.push(
        <MenuItem
          key={index}
          value={metric}
          onClick={() => setTemporalQualityMetric(metric)}
        >
          {metric}
        </MenuItem>
      );
    }
  });

  function dtypesMatching() {
    const parsedWeight = parseFloat(weight);
    if (
      isNaN(parsedWeight) ||
      parsedWeight < 0 ||
      parsedWeight > 1 ||
      "" + parsedWeight !== weight
    ) {
      setSettingsRequestResult({
        requestDone: true,
        success: false,
        message:
          "Settings upload: Weight must be a positive number between zero and one.",
      });
      setAlertOpen(true);
      return false;
    }
    return true;
  }

  weightSelectionStrategies.forEach((strategy, index) => {
    weightSelectionStrategiesOptions.push(
      <MenuItem
        key={index}
        value={strategy}
        onClick={() => setWeightingStrategy(strategy)}
      >
        {strategy}
      </MenuItem>
    );
  });

  const onUploadSettings = () => {
    setRequestNumber(requestNumber + 1);
    if (!dtypesMatching()) {
      return;
    }

    var weightAdjusted = weightingStrategy === "Manual" ? weight : 0;

    const moscatSettings = {
      sq_metric: snapshotQualityMetric,
      tq_metric: temporalQualityMetric,
      weighting_strategy: weightingStrategy,
      weight: weightAdjusted,
    };

    gatewayApi
      .post(moscatSettingsEndpoint, moscatSettings)
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
        title="MOSCAT Settings"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
      />

      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <TextField
              //id="weighting_strategy"// avoid duplicate id, it is a bugfix for an issue with material-ui
              label="Weighting Strategy"
              variant="outlined"
              fullWidth
              required
              select
              value={weightingStrategy}
              InputProps={{ id: "weighting_strategy" }}
              InputLabelProps={{ shrink: true, htmlFor: "weighting_strategy" }}
            >
              {weightSelectionStrategiesOptions}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <TextField
              id="weight"
              label="Weight"
              variant="outlined"
              fullWidth
              required
              disabled={weightingStrategy !== "Manual"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            ></TextField>
          </Grid>

          <Grid item xs={12} md={6} lg={6} xl={6}>
            <TextField
              // id="sq_metric"
              select
              fullWidth
              label="Snapshot Quality Metric"
              variant="outlined"
              required
              value={snapshotQualityMetric}
              InputProps={{ id: "sq_metric" }}
              InputLabelProps={{ shrink: true, htmlFor: "sq_metric" }}
            >
              {snapshotQualityMetricOptions}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <TextField
              // id="tq_metric"
              label="Temporal Quality Metric"
              variant="outlined"
              required
              fullWidth
              select
              value={temporalQualityMetric}
              InputProps={{ id: "tq_metric" }}
              InputLabelProps={{ shrink: true, htmlFor: "tq_metric" }}
            >
              {temporalQualityMetricOptions}
            </TextField>
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
