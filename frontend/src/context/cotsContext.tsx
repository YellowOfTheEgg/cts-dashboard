import { createContext, useContext, useState } from "react";
import { JSX,FC,ReactNode,PropsWithChildren } from 'react'


export const CotsResultContext = createContext({
    selectedFeatures: [false],
    setSelectedFeatures: (selectedFeatures: boolean[]) => {},
    featureNames: [''],
    setFeatureNames: (featureNames: string[]) => {},
    showClustering:false,
    setShowClustering: (showClustering: boolean)=>{},
    showResultCard:false,
    setShowResultCard: (showResultCard: boolean)=>{},
    showLabels:true,
    setShowLabels: (showLabels: boolean)=>{},
});

export const CotsResultProvider = ({children}: PropsWithChildren<{}>)=>{    
    const [selectedFeatures, setSelectedFeatures] = useState([false]);
    const [featureNames, setFeatureNames] = useState(['']);
    const [showClustering, setShowClustering]=useState(false)
    const [showResultCard, setShowResultCard]=useState(false)
    const [showLabels, setShowLabels]=useState(true)
    return (
        <CotsResultContext.Provider value={{showClustering, setShowClustering,showResultCard,setShowResultCard,showLabels,setShowLabels,selectedFeatures, setSelectedFeatures, featureNames,setFeatureNames}}>
            {children}
        </CotsResultContext.Provider>
    )
}