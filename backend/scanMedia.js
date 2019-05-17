var fs = require('fs');
var path = require('path');
const NodeID3 = require('node-id3');
const uuidv4 = require('uuid/v4');
 


var files = {tracks:{title:"My media",children:[]}};
 
if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory");
    process.exit(-1);
}
 
var pathToScan = process.argv[2];
if(pathToScan.substr(pathToScan.length-1,1) == "/"){
    pathToScan = pathToScan.substring(0,pathToScan.length-1);
}

readFolder = (folderPath) => {
    let files = [];
    let items = fs.readdirSync(folderPath,{withFileTypes:true});
    
    for (var i=0; i<items.length; i++) {
        let item = items[i];
        var ext = path.extname(item.name);
        if(ext == ".mp3" || item.isDirectory()){
            files.push(item);
        }
    }
    return files;
}

scanRecursive = (folderPath,children) =>{
    let files = readFolder(folderPath);
    for (let i=0; i<files.length; i++) {
        let item = files[i];
        let isDirectory = item.isDirectory();
        let itemDesc = {};
        if(!isDirectory){
            let url = folderPath+"/"+item.name;
            //let buffer = fs.readFileSync(url);
            let tags = NodeID3.read(url);
            itemDesc = {
                title:tags.title?tags.title:item.name,
                album:tags.album,
                year:tags.year,
                artist:tags.artist,
                genre:tags.genre,
                composer:tags.composer,
                publisher:tags.publisher,
                trackNumber:tags.trackNumber,
                url:url.substring(pathToScan.length),
            };
            if(tags.image && tags.image.imageBuffer){
                itemDesc.imageUrl = itemDesc.url+".jpg";
                var wstream = fs.createWriteStream(url+".jpg");
                wstream.write(tags.image.imageBuffer);
            }
        }
        if(isDirectory){
            itemDesc.title = item.name;
            itemDesc.children = [];
            scanRecursive(folderPath+"/"+item.name,itemDesc.children);
        }
        itemDesc.id = uuidv4();
        children.push(itemDesc);
    }
    children.sort((a,b) => {
        if(a.children && !b.children){
            return -1;
        }else if(!a.children && b.children){
            return 1;
        }else if(a.children && b.children){
            return a.title < b.title ? -1 : 1;
        }else if(a.album == b.album){
            return parseInt(a.trackNumber) < parseInt(b.trackNumber) ? -1 : 1;
        }else if(a.album && b.album){
            return a.album < b.album ? -1 : 1;
        }
    })
    return children;
}

scanRecursive(pathToScan,files.tracks.children);

var json = JSON.stringify(files);
console.log(json);
fs.writeFile(pathToScan+'/tracks.json', json, 'utf8',()=>{});