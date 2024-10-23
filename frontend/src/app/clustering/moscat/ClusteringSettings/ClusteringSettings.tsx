import * as React from "react";
import { TextField, MenuItem } from "@mui/material";
import { JSX } from "react";
import Grid from "@mui/material/Grid"; // Grid version 1
import CardContent from "@mui/material/CardContent";
import { CardHeader } from "@mui/material";
import Card from "@mui/material/Card";
import { DbscanSettings } from "./DbscanSettings";
import { KmeansSettings } from "./KmeansSettings";
import { IncKmeansSettings } from "./IncKmeansSettings";
import { MoscatSettingsContext } from "@/context/moscatSettingsContext";

const clusteringAlgorithms = ["DBSCAN", "K-Means", "Incremental K-Means"];

export const ClusteringSettings = () => {
  const [clusteringAlgorithm, setClusteringAlgorithm] = React.useState(
    clusteringAlgorithms[0]
  );
  const { selectedClusteringAlgorithm, setSelectedClusteringAlgorithm } =
    React.useContext(MoscatSettingsContext);

  function onClusteringAlgorithmChange(algorithm: string) {
    setClusteringAlgorithm(algorithm);
    setSelectedClusteringAlgorithm(algorithm);
  }

  let clusteringAlgorithmOptions: JSX.Element[] = [];
  clusteringAlgorithms.forEach((algorithm, index) => {
    clusteringAlgorithmOptions.push(
      <MenuItem
        key={index}
        value={algorithm}
        onClick={() => onClusteringAlgorithmChange(algorithm)}
      >
        {algorithm}
      </MenuItem>
    );
  });

  function selectClusteringOptionsSet() {
    if (clusteringAlgorithm === "DBSCAN") {
      return <DbscanSettings />;
    } else if (clusteringAlgorithm === "K-Means") {
      return <KmeansSettings />;
    } else if (clusteringAlgorithm === "Incremental K-Means") {
      return <IncKmeansSettings />;
    }
  }

  return (
    <Card>
      <CardHeader
        title="Underlying Clustering Settings"
        titleTypographyProps={{
          component: "h2",
          variant: "h6",
          color: "primary",
        }}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <TextField
              label="Clustering Algorithm"
              variant="outlined"
              fullWidth
              required
              select
              value={clusteringAlgorithm}
              InputLabelProps={{ htmlFor: "moscat_clustering_algorithm" }}
              InputProps={{ id: "moscat_clustering_algorithm" }}
            >
              {clusteringAlgorithmOptions}
            </TextField>
          </Grid>
          {selectClusteringOptionsSet()}
        </Grid>
      </CardContent>
    </Card>
  );
};
