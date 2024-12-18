

export function downloader (response: any, fileName: string) {
    const url = window.URL.createObjectURL(new Blob([response.data['data']]))
    const link = document.createElement('a')
    link.href = url   
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()

}