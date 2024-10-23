import React, { useEffect } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
} from "@mui/material";
import { MoscatContext } from "@/context/moscatContext";
import { gatewayApi } from "@/utils/api";

const settingsDatasetEndpoint = "/clustering/moscat/settings-dataset";

export const Settings = () => {
  const {
    showClustering,
    setShowClustering,
    showResultCard,
    setShowResultCard,
    showLabels,
    setShowLabels,
    selectedFeatures,
    setSelectedFeatures,
    featureNames,
    setFeatureNames,
  } = React.useContext(MoscatContext);

  const [newSelectedFeatures, setNewSelectedFeatures] = React.useState(
    featureNames.map(() => true)
  );
  const [newShowLabels, setNewShowLabels] = React.useState(true);
  const checkboxIdToIndex = new Map(
    featureNames.map((name, index) => ["f" + index, index])
  );

  useEffect(() => {
    gatewayApi
      .get(settingsDatasetEndpoint)
      .then((response) => {
        setFeatureNames(response.data['data']["features"]);
        setNewSelectedFeatures(response.data['data']["features"].map(() => true));
      })      
  }, []);

  const onFeatureSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const newFeatureSelection: boolean[] = newSelectedFeatures.map(
      (value, index) => {
        return checkboxIdToIndex.get(event.target.id) === index
          ? checked
          : value;
      }
    );
    setNewSelectedFeatures(newFeatureSelection);
  };
  const onShowLabels = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setNewShowLabels(checked);
  };

  const onAplyFeatureSelection = () => {
    setSelectedFeatures(newSelectedFeatures);
    setShowClustering(true);
    setShowLabels(newShowLabels);
  };

  let content = [];
  for (let i = 0; i < featureNames.length; i++) {
    content.push(
      <FormControlLabel
        labelPlacement="bottom"
        key={"fcl" + i}
        control={
          <Checkbox
            key={"f" + i}
            id={"f" + i}
            checked={newSelectedFeatures[i]}
            onChange={onFeatureSelection}
          />
        }
        label={featureNames[i]}
      />
    );
  }

  return (
    <Stack direction="column" spacing={2}>
      <FormGroup
        sx={{
          position: "flex",
          flexDirection: "row",
          justifyContent: "left",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          labelPlacement="bottom"
          key={"plot_mode"}
          control={
            <Checkbox
              key={"plot_mode"}
              id={"plot_mode"}
              checked={newShowLabels}
              onChange={onShowLabels}
            />
          }
          label={"object labels"}
        />
        {content}
      </FormGroup>
      <Button variant="contained" onClick={onAplyFeatureSelection}>
        Display Clustering Result
      </Button>
    </Stack>
  );
};
