import { createContext, useContext, useState } from "react";
import { JSX,FC,ReactNode,PropsWithChildren } from 'react'


export const MoscatSettingsContext = createContext({ 
    selectedClusteringAlgorithm: '',
    setSelectedClusteringAlgorithm: (clusteringAlgorithm: string)=>{}
});

export const MoscatSettingsContextProvider = ({children}: PropsWithChildren<{}>)=>{     
    const [selectedClusteringAlgorithm, setSelectedClusteringAlgorithm] = useState('')
    return (
        <MoscatSettingsContext.Provider value={{selectedClusteringAlgorithm, setSelectedClusteringAlgorithm}}>
            {children}
        </MoscatSettingsContext.Provider>
    )
}