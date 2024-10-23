import { useContext, lazy } from "react";
import { Grid, Box, Alert } from "@mui/material";

import { CotsResultContext } from "@/context/cotsContext";

const ClusteringPlot3D = lazy(() => import("./ClusteringPlot3D"));
const ClusteringPlot2D = lazy(() => import("./ClusteringPlot2D"));
const ClusteringPlot1D = lazy(() => import("./ClusteringPlot1D"));

interface PlotAreaProperties {
  clusterings: number[][][][];
  objectLabels: string[][][];
  clusterLabels: number[][];
  currentPage: number;
  plotsPerPage: number;
  timeLabels: string[];
}

export const PlotArea = (props: PlotAreaProperties) => {
  const { selectedFeatures } = useContext(CotsResultContext);

  let content = [];
  const {
    clusterings,
    objectLabels,
    clusterLabels,
    timeLabels,
    plotsPerPage,
    currentPage,
  } = props;

  const breakCondition =
    plotsPerPage * (currentPage - 1) + plotsPerPage < clusterings.length
      ? plotsPerPage * (currentPage - 1) + plotsPerPage
      : clusterings.length;
  const numberOfFeatures = selectedFeatures.filter(Boolean).length;

  if (numberOfFeatures == 3) {
    for (let t = plotsPerPage * (currentPage - 1); t < breakCondition; t++) {
      const tpClustering = clusterings[t];
      const tpObjectLabels = objectLabels[t];
      const tpClusterLabels = clusterLabels[t];
      content.push(
        <ClusteringPlot3D
          key={t}
          tpClustering={tpClustering}
          tpObjectLabels={tpObjectLabels}
          tpClusterLabels={tpClusterLabels}
          timeLabels={timeLabels}
          timeIndex={t}
        />
      );
    }
  } else if (numberOfFeatures == 2) {
    for (let t = plotsPerPage * (currentPage - 1); t < breakCondition; t++) {
      const tpClustering = clusterings[t];
      const tpObjectLabels = objectLabels[t];
      const tpClusterLabels = clusterLabels[t];
      content.push(
        <ClusteringPlot2D
          key={t}
          tpClustering={tpClustering}
          tpObjectLabels={tpObjectLabels}
          tpClusterLabels={tpClusterLabels}
          timeLabels={timeLabels}
          timeIndex={t}
        />
      );
    }
  } else if (numberOfFeatures == 1) {
    for (let t = plotsPerPage * (currentPage - 1); t < breakCondition; t++) {
      const tpClustering = clusterings[t];
      const tpObjectLabels = objectLabels[t];
      const tpClusterLabels = clusterLabels[t];
      content.push(
        <ClusteringPlot1D
          key={t}
          tpClustering={tpClustering}
          tpObjectLabels={tpObjectLabels}
          tpClusterLabels={tpClusterLabels}
          timeLabels={timeLabels}
          timeIndex={t}
        />
      );
    }
  } else {
    content.push(
      <Grid item md={12} key="vis_error">
        <Box display="flex" justifyContent="left" alignItems="center">
          <Alert severity="error" sx={{ width: "100%" }}>
            Select one, two or three features in order to see the clustering
            result. Visualizations with more than three features are not
            supported yet.
          </Alert>
        </Box>
      </Grid>
    );
  }

  return <>{content}</>;
};
