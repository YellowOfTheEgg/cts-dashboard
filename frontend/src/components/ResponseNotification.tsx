import { Alert, AlertTitle, List, ListItem } from "@mui/material"
import { Conditional } from "./Conditional"

interface requestResult{
    requestDone:boolean,
    success:boolean,
    message:string
}

interface responseNotificationProps{
    notificationOpen:boolean,    
    onClose:()=>void,
    requestNumber:number,
    requestResult:requestResult
}


export const ResponseNotification = (props:responseNotificationProps) => {

    const {notificationOpen,onClose,requestNumber,requestResult}=props

    var severity: 'error' | 'info' | 'success' | 'warning' = 'info'
    //create message var that is an array of strings
    var messages: string[] =[]

    if (requestResult['requestDone']===true){
    if (requestResult['success']===true){
        severity='success'
        messages.push(requestResult['message'])

    }else{
        severity='error'
        if (requestResult['success']===false){
            messages.push(requestResult['message'])
        }               
    }
    }

    const txtMessage=<List sx={{ listStyleType: 'disc', listStylePosition:'inside'}} dense={true} disablePadding={true}>{messages.map(el=>{return  <ListItem sx={{ display: 'list-item' }} key={el}>{el}</ListItem>})} </List>
    



    return(
        <Conditional showWhen={notificationOpen}>
            <Alert severity={severity} onClose={onClose}>
            <AlertTitle>{requestNumber}. Request</AlertTitle>
                {txtMessage}</Alert>
        </Conditional>
    )  

}