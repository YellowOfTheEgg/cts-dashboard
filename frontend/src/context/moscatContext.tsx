import { createContext, useState } from "react";
import { PropsWithChildren } from "react";

export const MoscatContext = createContext({
  selectedFeatures: [false],
  setSelectedFeatures: (selectedFeatures: boolean[]) => {},
  featureNames: [""],
  setFeatureNames: (featureNames: string[]) => {},
  showClustering: false,
  setShowClustering: (showClustering: boolean) => {},
  showResultCard: false,
  setShowResultCard: (showResultCard: boolean) => {},
  showLabels: true,
  setShowLabels: (showLabels: boolean) => {},
});

export const MoscatProvider = ({ children }: PropsWithChildren<{}>) => {
  const [selectedFeatures, setSelectedFeatures] = useState([false]);
  const [featureNames, setFeatureNames] = useState([""]);
  const [showClustering, setShowClustering] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  return (
    <MoscatContext.Provider
      value={{
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
      }}
    >
      {children}
    </MoscatContext.Provider>
  );
};
