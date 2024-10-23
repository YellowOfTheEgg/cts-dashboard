import React from "react";
import Grid from "@mui/material/Grid"; // Grid version 1
import { Button } from "@mui/material";
import { CotsResultContext } from "@/context/cotsContext";
import { gatewayApi } from "@/utils/api";

import { ResponseNotification } from "@/components/ResponseNotification";
import { ProgressBar } from "@/components/ProgressBar";
//api endpoints used in this component
const runEndpoint = "/clustering/cots/run";

export const RunClustering = () => {
  const { setShowResultCard, setShowClustering } =
    React.useContext(CotsResultContext);
  const [runRequestResult, setRunRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });

  //alert state
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [requestNumber, setRequestNumber] = React.useState(0);
  const [progressType, setProgressType] = React.useState(0); //0 -> not triggered, 1-> triggered, 2->finished

  const onAlertClose = () => {
    setAlertOpen(false);
  };

  const onRunClustering = () => {
    setShowResultCard(false);
    setShowClustering(false);
    setAlertOpen(false);
    setProgressType(1);
    setRequestNumber(requestNumber + 1);
    gatewayApi.post(runEndpoint).then((response) => {
      setRunRequestResult({
        requestDone: true,
        success: response.data["success"],
        message: response.data["message"],
      });
      setAlertOpen(true);
      setProgressType(2);
      if (response.data["success"] === true) {
        setShowResultCard(true);
      }
    });
  };

  return (
    <Grid container spacing={2} sx={{ paddingBottom: "20px" }}>
      <Grid item xs={12} sm={12} md={12}>
        <ResponseNotification
          notificationOpen={alertOpen}
          onClose={onAlertClose}
          requestNumber={requestNumber}
          requestResult={runRequestResult}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={12}>
        <Button variant="contained" fullWidth onClick={onRunClustering}>
          Run Clustering
        </Button>
      </Grid>
      <Grid item xs={12} sm={12} md={12}>
        <ProgressBar progressType={progressType} />
      </Grid>
    </Grid>
  );
};
