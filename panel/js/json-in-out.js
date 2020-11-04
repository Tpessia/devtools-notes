export function exportJson(obj, fileName) {
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', fileName + '.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export async function importJson(file) {
    return new Promise((res,rej) => {
        var reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsText(file);
    }).then(r => JSON.parse(r));
}