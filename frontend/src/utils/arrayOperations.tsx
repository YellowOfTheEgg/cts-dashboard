



export function getAllIndexes(arr: number[], val:number) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
  }
  
 export function getTuplesByIds(cluster: number[][], ids:number[]) {
    //cluster example=[[0.1,0.2,0.15],[0.1,0.3,0.2],[0.05,0.25,0.2]] format: [[x,y,z],[x,y,z],[x,y,z]]
    let result=[], i
    let resultLen=0
    for (i=0; i<ids.length; i++){
      const id=ids[i]
      const el=cluster[id]
      result.push(el)
    }
    if (result.length==0){
      result.push([])
      resultLen=0
    }else{
      resultLen=result.length
    }
    return { data: result, len: resultLen }    
  }

  export function getStringsByIds(strArr: string[], ids:number[]) {
    //cluster example=[[0.1,0.2,0.15],[0.1,0.3,0.2],[0.05,0.25,0.2]] format: [[x,y,z],[x,y,z],[x,y,z]]
    let result=[], i
    let resultLen=0
    for (i=0; i<ids.length; i++){
      const id=ids[i]
      const el=strArr[id]
      result.push(el)
    }
    if (result.length==0){     
      resultLen=0
    }else{
      resultLen=result.length
    }
    return { data: result, len: resultLen }    
  }

  export function getElementsByIds(cluster: number[][], ids:number[]) {
    //cluster example=[[0.1,0.2,0.15],[0.1,0.3,0.2],[0.05,0.25,0.2]] format: [[x,y,z],[x,y,z],[x,y,z]]
    let result=[], i
    let resultLen=0
    for (i=0; i<ids.length; i++){
      const id=ids[i]
      const el=cluster[id]
      result.push(el)
    }
    if (result.length==0){
      result.push([])
      resultLen=0
    }else{
      resultLen=result.length
    }
    return { data: result, len: resultLen }
    
  }