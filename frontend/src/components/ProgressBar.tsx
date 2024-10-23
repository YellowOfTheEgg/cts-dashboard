import LinearProgress from '@mui/material/LinearProgress';


export const ProgressBar = ({progressType}: {progressType: number}) => {
    if(progressType===0){
        return <LinearProgress variant="determinate" value={0} />
    }
    else if (progressType===1){
        return <LinearProgress />           
    }else if (progressType===2){
        return <LinearProgress variant="determinate" value={100} />
    }      

}