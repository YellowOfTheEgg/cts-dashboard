
export const Conditional =({showWhen, children}: {showWhen: boolean, children: JSX.Element})=>{
    if (showWhen){
        return children;
    }
    return (<></>)
    }