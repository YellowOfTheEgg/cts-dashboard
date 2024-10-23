import { createContext, useState } from "react";
import {PropsWithChildren } from 'react'


export const CloseContext = createContext({
    showResultCard:false,
    setShowResultCard: (showResultCard: boolean)=>{},
})

export const CloseContextProvider = ({children}: PropsWithChildren<{}>)=>{
    const [showResultCard, setShowResultCard]=useState(false)
    return (
        <CloseContext.Provider value={{showResultCard,setShowResultCard}}>
            {children}
        </CloseContext.Provider>
    )
}