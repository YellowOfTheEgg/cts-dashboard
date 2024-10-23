import React from "react";
import Grid from "@mui/material/Grid"; // Grid version 1
import { Alert, AlertTitle, Button, List, ListItem } from "@mui/material";
import { MoscatContext } from "@/context/moscatContext";
import { gatewayApi } from "@/utils/api";
import { Conditional } from "@/components/Conditional";

import { ProgressBar } from "@/components/ProgressBar";
//api endpoints used in this component
const runEndpoint = "/clustering/moscat/run";

export const RunClustering = () => {
  const { setShowResultCard, setShowClustering } =
    React.useContext(MoscatContext);
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

  const postRequestResult = () => {
    var severity: "error" | "info" | "success" | "warning" = "info";
    //create message var that is an array of strings
    var messages: string[] = [];

    if (runRequestResult["requestDone"] === true) {
      if (runRequestResult["success"] === true) {
        severity = "success";
        messages.push(runRequestResult["message"]);
      } else {
        severity = "error";
        messages.push(runRequestResult["message"]);
      }
    }

    const txtMessage = (
      <List
        sx={{ listStyleType: "disc", listStylePosition: "inside" }}
        dense={true}
        disablePadding={true}
      >
        {messages.map((el) => {
          return (
            <ListItem sx={{ display: "list-item" }} key={el}>
              {el}
            </ListItem>
          );
        })}{" "}
      </List>
    );

    return (
      <Conditional showWhen={alertOpen}>
        <Alert severity={severity} onClose={onAlertClose}>
          <AlertTitle>{requestNumber}. Request</AlertTitle>
          {txtMessage}
        </Alert>
      </Conditional>
    );
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
        {postRequestResult()}
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
