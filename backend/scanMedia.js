var fs = require('fs');
var path = require('path');
//const NodeID3 = require('node-id3');
const mm = require('music-metadata');
const uuidv4 = require('uuid/v4');
const sharp = require('sharp');
const util = require('util')


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
        if(ext == ".mp3" || ext == ".flac" || item.isDirectory()){
            files.push(item);
        }
    }
    return files;
}
const props = [
    "title",
    "album",
    "year",
    "artist",
    "publisher",
    "url",
    "track",
    "genre",
    "composer"
];
const metaProps = [
    ["title"],
    ["album"],
    ["year"],
    ["artist"],
    ["publisher"],
    ["url"],
    ["track","no"],
    ["genre"],
    ["composer"]
];
function mapToProps(obj,meta){
    for(let i=0;i<props.length;i++){
        let propName = props[i];

        let metaProp = meta;
        for(let metaPropName of metaProps[i]){
            if(metaProp[metaPropName] !== undefined && metaProp[metaPropName] !== null){
                metaProp = metaProp[metaPropName];
            }else{
                metaProp = null;
                continue;
            }
        }

        if(metaProp === null){
            continue;
        }
        if(metaProp.constructor === Array){
            obj[propName] = metaProp.join(",");
        }else{
            obj[propName] = metaProp;
        }
    }
}

async function scanRecursive (folderPath,children){
    let files = readFolder(folderPath);
    for (let i=0; i<files.length; i++) {
        const item = files[i];
        const isDirectory = item.isDirectory();
        let itemDesc = {};
        if(!isDirectory){
            const url = folderPath+"/"+item.name;
            const tags = await mm.parseFile(url);
            mapToProps(itemDesc,tags.common);
            /*itemDesc = {
                title:tags.common.title?tags.common.title:item.name,
                album:tags.common.album,
                year:tags.common.year,
                artist:tags.common.artist,
                publisher:tags.common.publisher,
            };*/
            itemDesc.url = url.substring(pathToScan.length);
            /*if(tags.common.track){
                itemDesc.track = tags.common.track.no;
            }
            if(tags.common.genre){
                itemDesc.genre = tags.common.genre.join(",");
            }
            if(tags.common.composer){
                itemDesc.composer = tags.common.composer.join(",");
            }*/
            if(tags.common.picture && tags.common.picture[0] && tags.common.picture[0].data){
                sharp(tags.common.picture[0].data)
                .resize(256,256,{fit:"inside"})
                .toFile(url+".jpg");
                itemDesc.imageUrl = itemDesc.url+".jpg";
                /*var wstream = fs.createWriteStream(url+".jpg");
                wstream.write(tags.image.imageBuffer);*/
            }
            console.log(itemDesc);
        }
        if(isDirectory){
            itemDesc.title = item.name;
            itemDesc.children = [];
            await scanRecursive(folderPath+"/"+item.name,itemDesc.children);
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
async function scanFiles(){
    files.tracks.children = await scanRecursive(pathToScan,files.tracks.children);

    var json = JSON.stringify(files);
    fs.writeFile('../frontend/personal-media/src/data.json', json, 'utf8',()=>{});
}
scanFiles();