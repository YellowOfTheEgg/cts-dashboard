import * as React from "react";
import styled from "@emotion/styled";
import Typography from "@mui/material/Typography";
import Dropzone from "react-dropzone";
import {
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  Grid,
  CardHeader,
  List,
  ListItem,
  AlertTitle,
} from "@mui/material";
import { gatewayApi } from "@/utils/api";
import Alert from "@mui/material/Alert";
import { Conditional } from "@/components/Conditional";
import { ToditsContext } from "@/context/toditsContext";

const getBorderColor = (props: any) => {
  if (props.isDragAccept) {
    return "#00e676";
  }
  if (props.isDragReject) {
    return "#ff1744";
  }
  if (props.isDragActive) {
    return "#2196f3";
  }
  return "#eeeeee";
};
const FileUploadArea = styled("div")((probs) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: getBorderColor(probs), //'#eeeeee',
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
  //   marginBottom: '20px',
}));

// api endpoints used in this component
const fileUploadEndpoint = "outlier-detection/todits/dataset";
const fileSettingsEndpoint = "outlier-detection/todits/settings-dataset";

export const FileUpload = () => {
  const [columnSeparator, setColumnSeparator] = React.useState(",");
  const [objectIdColumn, setObjectIdColumn] = React.useState("object_id");
  const [timeColumn, setTimeColumn] = React.useState("time");
  const [featureColumns, setFeatureColumns] = React.useState("");
  const [clusterIdColumn, setClusterIdColumn] = React.useState("cluster_id");

  const dropMessage: string =
    "Drag 'n' drop a file here, or click to select file";
  const [fileName, setFileName] = React.useState(dropMessage);
  const [acceptedFile, setAcceptedFile] = React.useState<File | null>(null);
  const [isDragAccept, setIsDragAccept] = React.useState(false);
  const [isDragReject, setIsDragReject] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const { setShowResultCard } = React.useContext(ToditsContext);

  //request result
  const [settingsDatasetRequestResult, setSettingsDatasetRequestResult] =
    React.useState({ requestDone: false, success: true, message: "" });
  const [datasetRequestResult, setDatasetRequestResult] = React.useState({
    requestDone: false,
    success: true,
    message: "",
  });

  //alert state
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [requestNumber, setRequestNumber] = React.useState(0);

  function dtypesMatching() {
    // check if the columns are not empty
    let dtypesMatching = true;
    if (
      objectIdColumn === "" ||
      timeColumn === "" ||
      clusterIdColumn === "" ||
      featureColumns === ""
    ) {
      setSettingsDatasetRequestResult({
        requestDone: true,
        success: false,
        message: "Settings upload: all columns must be filled.",
      });
      setAlertOpen(true);
      dtypesMatching = false;
    }
    if (acceptedFile === null) {
      setDatasetRequestResult({
        requestDone: true,
        success: false,
        message: "Dataset upload: dataset for upload is missing.",
      });
      dtypesMatching = false;
    }

    return dtypesMatching;
  }

  const handleUploadDataset = () => {
    //create settings object
    setRequestNumber(requestNumber + 1);
    if (!dtypesMatching()) {
      return;
    }

    const settingsDataset = {
      object_id: objectIdColumn,
      time: timeColumn,
      cluster_id: clusterIdColumn,
      features: featureColumns.split(","),
      column_separator: columnSeparator,
    };

    gatewayApi
      .post(fileSettingsEndpoint, settingsDataset, { withCredentials: true })
      .then((outerResponse) => {
        // set this variable for the user to see the result of the request
        setShowResultCard(false);

        setSettingsDatasetRequestResult({
          requestDone: true,
          success: outerResponse.data["success"],
          message: outerResponse.data["message"],
        });
        setAlertOpen(true);
        // set headers and convert for file upload
        const headers = { "Content-Type": "multipart/form-data" };
        let formData = new FormData();
        formData.append("file", acceptedFile as Blob);

        gatewayApi
          .post(fileUploadEndpoint, formData, {
            headers: headers,
            withCredentials: true,
          })
          .then((innerResponse) => {
            // set this variable for the user to see the result of the request
            setDatasetRequestResult({
              requestDone: true,
              success: innerResponse.data["success"],
              message: innerResponse.data["message"],
            });
            setAlertOpen(true);
          })
          .catch((error) => {
            // set this variable for the user to see the result of the request
            setDatasetRequestResult({
              requestDone: true,
              success: false,
              message: "File upload: " + error.message,
            });
            setAlertOpen(true);
          });
      })
      .catch((error) => {
        // set this variable for the user to see the result of the request

        setSettingsDatasetRequestResult({
          requestDone: true,
          success: false,
          message: "Description upload: " + error.response.data.detail[0].msg,
        });
        setAlertOpen(true);
      });
  };

  const handleAcceptedDrop = (acceptedFiles: File[]) => {
    const acceptedFileName: string = String(
      acceptedFiles[0]["path" as keyof File]
    );

    setFileName(acceptedFileName);
    setAcceptedFile(acceptedFiles[0]);
    setIsDragReject(false);
    setIsDragAccept(true);
  };
  const handleRejectedDrop = () => {
    setFileName("Wrong file type. Please upload a .csv or .txt file.");
    setIsDragAccept(false);
    setIsDragReject(true);
  };

  const onAlertClose = () => {
    setAlertOpen(false);
  };

  const postRequestResult = () => {
    var severity: "error" | "info" | "success" | "warning" = "info";
    //create message var that is an array of strings
    var messages: string[] = [];

    if (
      settingsDatasetRequestResult["requestDone"] === true ||
      datasetRequestResult["requestDone"] === true
    ) {
      if (
        settingsDatasetRequestResult["success"] === true &&
        datasetRequestResult["success"] === true
      ) {
        severity = "success";
        messages.push(settingsDatasetRequestResult["message"]);
        messages.push(datasetRequestResult["message"]);
      } else {
        severity = "error";
        if (settingsDatasetRequestResult["success"] === false) {
          messages.push(settingsDatasetRequestResult["message"]);
        }
        if (datasetRequestResult["success"] === false) {
          messages.push(datasetRequestResult["message"]);
        }
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

  return (
    <Card>
      <CardHeader
        title="Dataset Upload"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
      />
      <CardContent>
        <Dropzone
          accept={{ "text/csv": [".csv"], "text/plain": [".txt"] }}
          onDropAccepted={(acceptedFiles) => handleAcceptedDrop(acceptedFiles)}
          onDropRejected={() => handleRejectedDrop()}
          multiple={false}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <FileUploadArea
                {...getRootProps({ isFocused, isDragAccept, isDragReject })}
              >
                <input {...getInputProps()} />
                <p>{fileName}</p>
              </FileUploadArea>
            </section>
          )}
        </Dropzone>
      </CardContent>
      <Divider sx={{ "&:before": { width: 10 } }}>
        <Typography variant="body1">Data Description</Typography>
      </Divider>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={3}>
            <TextField
              style={{ width: "100%" }}
              id="column_separator"
              value={columnSeparator}
              onChange={(e) => setColumnSeparator(e.target.value)}
              label="Column Separator"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <TextField
              style={{ width: "100%" }}
              id="object_id_column"
              value={objectIdColumn}
              onChange={(e) => setObjectIdColumn(e.target.value)}
              label="Object ID Column"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <TextField
              style={{ width: "100%" }}
              id="time_column"
              value={timeColumn}
              onChange={(e) => setTimeColumn(e.target.value)}
              label="Time Column"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <TextField
              style={{ width: "100%" }}
              id="cluster_id_column"
              value={clusterIdColumn}
              onChange={(e) => setClusterIdColumn(e.target.value)}
              label="Cluster ID Column"
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <TextField
              id="feature_columns"
              onChange={(e) => {
                setFeatureColumns(e.target.value);
              }}
              label="Feature Columns (comma separated)"
              variant="outlined"
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            {postRequestResult()}
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            <Button variant="contained" onClick={handleUploadDataset}>
              Upload Dataset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
