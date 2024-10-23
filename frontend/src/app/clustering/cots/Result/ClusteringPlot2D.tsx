import { Grid } from "@mui/material";
import React from "react";
import dynamic from "next/dynamic";
import { CotsResultContext } from "@/context/cotsContext";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface TpClustering {
  tpClustering: number[][][];
  tpObjectLabels: string[][];
  tpClusterLabels: number[];
  timeLabels: string[];
  timeIndex: number;
}

const colors = [
  "#1f77b4", // muted blue
  "#ff7f0e", // safety orange
  "#2ca02c", // cooked asparagus green
  "#d62728", // brick red
  "#9467bd", // muted purple
  "#8c564b", // chestnut brown
  "#e377c2", // raspberry yogurt pink
  "#7f7f7f", // middle gray
  "#bcbd22", // curry yellow-green
  "#17becf", // blue-teal]
];

export const ClusteringPlot2D = (props: TpClustering) => {
  const { showLabels, selectedFeatures, featureNames } =
    React.useContext(CotsResultContext);

  const {
    tpClustering,
    tpObjectLabels,
    tpClusterLabels,
    timeLabels,
    timeIndex,
  } = props;

  const selectedFeaturesIndices = selectedFeatures.flatMap((bool, index) =>
    bool ? index : []
  );
  const x_index = selectedFeaturesIndices[0];
  const y_index = selectedFeaturesIndices[1];
  const x_axis_name = featureNames[x_index];
  const y_axis_name = featureNames[y_index];

  let plotly_data: Plotly.Data[] = [];
  const plotly_mode = showLabels ? "text+markers" : "markers";

  for (let c = 0; c < tpClustering.length; c++) {
    const cluster = tpClustering[c];
    const objectLabels = tpObjectLabels[c];
    const clusterLabel = tpClusterLabels[c];

    const color_index = c % colors.length;
    const plotly_cluster: Plotly.Data = {
      x: cluster.map((item: number[]) => item[x_index]),
      y: cluster.map((item: number[]) => item[y_index]),
      name: "Cluster " + clusterLabel,
      type: "scatter",
      mode: plotly_mode,
      text: objectLabels,
      textposition: "top center",
      marker: {
        color: colors[color_index],
        size: 8,
      },
    };
    plotly_data.push(plotly_cluster);
  }

  return (
    <Grid item xs={12} md={12} sm={12} lg={12} xl={6}>
      <Plot
        data={plotly_data}
        layout={{
          title: "Time: " + timeLabels[timeIndex],
          autosize: true,
          xaxis: {
            title: x_axis_name,
          },
          yaxis: {
            title: y_axis_name,
          },
        }}
        config={{
          displayModeBar: true,
          modeBarButtonsToRemove: [
            "zoomIn2d",
            "zoomOut2d",
            "autoScale2d",
            "zoom2d",
            "pan2d",
            "orbitRotation",
            "tableRotation",
            "lasso2d",
            "select2d",
          ],
          scrollZoom: true,
          displaylogo: false,
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "650px" }}
      />
    </Grid>
  );
};

export default ClusteringPlot2D;