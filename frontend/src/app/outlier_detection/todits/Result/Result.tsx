import React, { useEffect, useRef, useContext } from "react";
import { Pagination, Typography, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { Divider, CardHeader } from "@mui/material";
import Card from "@mui/material/Card";
import { PlotArea } from "./PlotArea";
import { Settings } from "./Settings";

import { ToditsContext } from "@/context/toditsContext";
import DownloadIcon from "@mui/icons-material/Download";
import { Conditional } from "@/components/Conditional";
import { gatewayApi } from "@/utils/api";
import { downloader } from "@/utils/downloader";

/*
Data format:
[object_id, time, f1, f2, f3, cluster_id]
[
<time>[
       <cluster id>[
            [f1,f1,f1]
            [f2,f2,f2]
            [f3,f3,f3]
        ],
        <cluster id>[
            [f1,f1,f1]
            [f2,f2,f2]
            [f3,f3,f3]
        ]
     ],
<time>[
       <cluster id>[
            [f1,f1,f1]
            [f2,f2,f2]
            [f3,f3,f3]
        ],
        <cluster id>[
            [f1,f1,f1]
            [f2,f2,f2]
            [f3,f3,f3]
        ]
     ],
]

*/

const resultEndpoint = "/outlier-detection/todits/result";
const resultCsvEndpoint = "/outlier-detection/todits/result-csv";
const plotsPerPage = 4;

export const Result = () => {
  const [numberPages, setNumberPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);

  const [clusterLabels, setClusterLabels] = React.useState([]);
  const [objectLabels, setObjectLables] = React.useState([]);
  const [clusterings, setClusterings] = React.useState([]);
  const [outliers, setOutliers] = React.useState([]);
  const [timeLabels, setTimeLabels] = React.useState([]);

  const resultRef = useRef<HTMLDivElement>(null);

  const { showClustering } = useContext(ToditsContext);

  useEffect(() => {
    gatewayApi
      .get(resultEndpoint, { withCredentials: true })
      .then((response) => {
        setClusterings(response.data["data"]["clusterings"]);
        setObjectLables(response.data["data"]["object_labels"]);
        setClusterLabels(response.data["data"]["cluster_labels"]);
        setOutliers(response.data["data"]["outlier_info"]);
        setTimeLabels(response.data["data"]["time_labels"]);
        setNumberPages(
          Math.ceil(response.data["data"]["clusterings"].length / plotsPerPage)
        );
      });

    if (resultRef.current) {
      resultRef.current.scrollIntoView();
    }
  }, []);

  const onPaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    if (resultRef.current) {
      resultRef.current.scrollIntoView();
    }
  };

  const onDownloadResult = () => {
    gatewayApi
      .get(resultCsvEndpoint, { withCredentials: true })
      .then((response) => {
        downloader(response, "todits_outlier_detection_result.csv");
      });
  };

  return (
    <Card ref={resultRef}>
      <CardHeader
        title="Clustering Result"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
        action={
          <IconButton aria-label="settings" onClick={onDownloadResult}>
            <DownloadIcon />
          </IconButton>
        }
      />

      <Divider textAlign="left" sx={{ "&:before": { width: 10 } }}>
        <Typography variant="body1">View Settings</Typography>
      </Divider>

      <CardContent>
        <Settings />
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Conditional showWhen={showClustering}>
            <PlotArea
              clusterings={clusterings}
              objectLabels={objectLabels}
              clusterLabels={clusterLabels}
              timeLabels={timeLabels}
              outlierInfo={outliers}
              currentPage={currentPage}
              plotsPerPage={plotsPerPage}
            />
          </Conditional>
          <Conditional showWhen={showClustering}>
            <Grid
              item
              md={12}
              justifyContent="center"
              alignItems="center"
              key="A"
            >
              <Pagination
                count={numberPages}
                defaultPage={currentPage}
                page={currentPage}
                sx={{ "& > .MuiPagination-ul": { justifyContent: "center" } }}
                onChange={onPaginationChange}
              />
            </Grid>
          </Conditional>
        </Grid>
      </CardContent>
    </Card>
  );
};
