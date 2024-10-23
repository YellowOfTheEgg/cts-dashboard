import { Grid } from "@mui/material";
import React from "react";
import dynamic from "next/dynamic";
import { ToditsContext } from "@/context/toditsContext";
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
  timeLabels: string[];
  tpOutlierInfo: number[][];
  timeIndex: number;
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

export const ClusteringPlot2D = (props: TpClustering) => {
  const { showLabels, selectedFeatures, featureNames } =
    React.useContext(ToditsContext);

  const {
    tpClustering,
    tpObjectLabels,
    tpClusterLabels,
    timeLabels,
    tpOutlierInfo,
    timeIndex,
  } = props;

  //const selectedFeatureNames= featureNames.filter((value,index)=>selectedFeatures[index]==true);
  const selectedFeaturesIndices = selectedFeatures.flatMap((bool, index) =>
    bool ? index : []
  );
  const x_index = selectedFeaturesIndices[0];
  const y_index = selectedFeaturesIndices[1];
  const x_axis_name = featureNames[x_index];
  const y_axis_name = featureNames[y_index];

  /*if (timeIndex==1){
    console.log('time: ',timeLabels[timeIndex])  
    console.log('tpClusteringLabels:')
    console.log(tpClusterLabels)
    console.log('tpObjectLabels:')
    console.log(tpObjectLabels[3])
    console.log('tpClustering:')
    console.log(tpClustering[3])
    console.log('tpOutlierInfo:')
    console.log(tpOutlierInfo[3])

  }*/

  let plotly_data: Plotly.Data[] = [];
  const plotly_mode = showLabels ? "text+markers" : "markers";

  for (let c = 0; c < tpClustering.length; c++) {
    const cluster = tpClustering[c];
    const objectLabels = tpObjectLabels[c];
    const clusterLabel = tpClusterLabels[c];
    const outlierInfo = tpOutlierInfo[c];
    const color_index = c % colors.length;

    const nonOutlierIndices = getAllIndexes(outlierInfo, 1);
    const preOutlierIndices = getAllIndexes(outlierInfo, -1);
    const outlierIndices = getAllIndexes(outlierInfo, -2);
    const bothOutlierIndices = getAllIndexes(outlierInfo, -3);

    const preOutliers: ObjectGroup = getTuplesByIds(cluster, preOutlierIndices);
    const outliers: ObjectGroup = getTuplesByIds(cluster, outlierIndices);
    const bothOutliers: ObjectGroup = getTuplesByIds(
      cluster,
      bothOutlierIndices
    );
    const nonOutliers: ObjectGroup = getTuplesByIds(cluster, nonOutlierIndices);

    const preOutliersLabels = getStringsByIds(objectLabels, preOutlierIndices);
    const outliersLabels = getStringsByIds(objectLabels, outlierIndices);
    const bothOutliersLabels = getStringsByIds(
      objectLabels,
      bothOutlierIndices
    );
    const nonOutliersLabels = getStringsByIds(objectLabels, nonOutlierIndices);

    const symbols = ["circle", "diamond", "diamond-open", "square"];
    const groups = [nonOutliers, preOutliers, outliers, bothOutliers];
    const groupLabels = [
      "Non-Outliers",
      "Pre-Outliers",
      "Outliers",
      "Outliers (Both)",
    ];
    const groupName = "Cluster " + clusterLabel;
    const objectLabelsGrouped = [
      nonOutliersLabels,
      preOutliersLabels,
      outliersLabels,
      bothOutliersLabels,
    ];

    for (var i = 0; i < groups.length; i++) {
      const group: ObjectGroup = groups[i];
      const objectLabelsGroup: ObjectLabelGroup = objectLabelsGrouped[i];
      const data = group["data"];
      const len = group["len"];

      const dataLabels = objectLabelsGroup["data"];

      const symbol = symbols[i];
      if (len != 0) {
        const plotly_cluster: Plotly.Data = {
          x: data.map((item: number[]) => item[x_index]),
          y: data.map((item: number[]) => item[y_index]),
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
    <Grid
      item
      xs={12}
      md={12}
      sm={12}
      lg={12}
      xl={6}
      style={{ textAlign: "center" }}
    >
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
