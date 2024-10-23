import { Grid } from "@mui/material";
import React from "react";
import dynamic from "next/dynamic";
import { DactContext } from "@/context/dactContext";
import {
  getAllIndexes,
  getTuplesByIds,
  getStringsByIds,
} from "@/utils/arrayOperations";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface TpClustering {
  tpClustering: number[][][];
  tpObjectLabels: string[][];
  tpClusterLabels: number[];
  tpOutlierInfo: number[][];
  timeIndex: number;
  timeLabels: string[];
}

interface ObjectGroup {
  data: number[][];
  len: number;
}
interface ObjectLabelGroup {
  data: string[];
  len: number;
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

export const ClusteringPlot1D = (props: TpClustering) => {
  const { showLabels, selectedFeatures, featureNames } =
    React.useContext(DactContext);

  const {
    tpClustering,
    tpObjectLabels,
    tpClusterLabels,
    tpOutlierInfo,
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
    const outlierInfo = tpOutlierInfo[c];

    const color_index = c % colors.length;

    const nonOutlierIndices = getAllIndexes(outlierInfo, 1);
    const transitionOutlierIndices = getAllIndexes(outlierInfo, -1);
    const intuitiveOutlierIndices = getAllIndexes(outlierInfo, -2);
    const bothOutlierIndices = getAllIndexes(outlierInfo, -3);

    const transitionOutliers: ObjectGroup = getTuplesByIds(
      cluster,
      transitionOutlierIndices
    );
    const intuitiveOutliers: ObjectGroup = getTuplesByIds(
      cluster,
      intuitiveOutlierIndices
    );
    const bothOutliers: ObjectGroup = getTuplesByIds(
      cluster,
      bothOutlierIndices
    );
    const nonOutliers: ObjectGroup = getTuplesByIds(cluster, nonOutlierIndices);

    const transitionOutliersLabels = getStringsByIds(
      objectLabels,
      transitionOutlierIndices
    );
    const intuitiveOutliersLabels = getStringsByIds(
      objectLabels,
      intuitiveOutlierIndices
    );
    const bothOutliersLabels = getStringsByIds(
      objectLabels,
      bothOutlierIndices
    );
    const nonOutliersLabels = getStringsByIds(objectLabels, nonOutlierIndices);

    const symbols = ["circle", "diamond", "diamond-open", "square"];
    const groups = [
      nonOutliers,
      transitionOutliers,
      intuitiveOutliers,
      bothOutliers,
    ];
    const groupLabels = [
      "Non-Outliers",
      "Tr. Outliers",
      "Int. Outliers",
      "Tr. Int. Outliers",
    ];
    const groupName = "Cluster " + clusterLabel;
    const objectLabelsGrouped = [
      nonOutliersLabels,
      transitionOutliersLabels,
      intuitiveOutliersLabels,
      bothOutliersLabels,
    ];

    for (var i = 0; i < groups.length; i++) {
      const group: ObjectGroup = groups[i];
      const objectLabelsGroup: ObjectLabelGroup = objectLabelsGrouped[i];
      const data = group["data"];
      const len = group["len"];
      const symbol = symbols[i];
      const dataLabels = objectLabelsGroup["data"];

      if (len != 0) {
        const plotly_cluster: Plotly.Data = {
          x: data.map((item: number[]) => item[x_index]),
          y: Array(data.map((item: number[]) => item[x_index]).length).fill(
            0.1
          ), //cluster[y_index],

          legendgroup: groupName,
          name: "Cluster " + clusterLabel + ": <br>" + groupLabels[i],
          type: "scatter",
          mode: plotly_mode,
          text: dataLabels,
          textposition: "top center",
          marker: {
            color: colors[color_index],
            size: 8,
            symbol: symbol,
          },
        };
        plotly_data.push(plotly_cluster);
      }
    }
  }

  return (
    <Grid item xs={12} md={12} sm={12} lg={12} xl={6}>
      <Plot
        data={plotly_data}
        layout={{
          title: "Time: " + timeLabels[timeIndex],
          autosize: true,
          height: 350,
          xaxis: {            
            title: x_axis_name,
            showgrid: false,
            showline: true,
          },
          yaxis: {        
            title: y_axis_name,
            visible: false,
            range: [0, 1],
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
        style={{ width: "100%", height: "100%" }}
      />
    </Grid>
  );
};

export default ClusteringPlot1D;
