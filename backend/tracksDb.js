const router = require("express").Router();
const File = require("./model/File");
const Node = require("./model/Node");
const User = require('./model/User');
const FileList = require('./model/FileList');
const mongoose = require('mongoose');
const verify = require('./verifyToken');
var fs = require('fs');
var path = require('path');
const mm = require('music-metadata');
const pathToScan = './media';
var rootNode;


router.post('/getAllTracks',verify, async (req,res)=>{
    const rootFile = await File.findOne({title:"My media"}).exec();
    const populated = await Node.findOne({file:rootFile._id}).exec();
    const model = {};
    modelNodeStructure(populated,model);
    return res.send(model);
});

router.post('/getAlbum',verify, async (req,res)=>{
    
    const files = await File.find({album:req.body.albumName}).exec();
    //const populated = await Node.findOne({file:rootFile._id}).exec();
    /*const album = [];
    for(let file of files){
        let model = {};
        modelFile(file,model);
        album.push(model);
    }*/
    return res.send({album:req.body.albumName,files:files});
});

router.post('/getAlbumList',verify, async (req,res)=>{
    const albumList = await File.distinct("album").exec();
    return res.send(albumList);
});

router.post('/getArtistList',verify, async (req,res)=>{
    const artistList = await File.distinct("artist").exec();
    return res.send(artistList);
});

router.post('/getArtist',verify, async (req,res)=>{
    const files = await File.find({artist:req.body.artistName}).exec();
    return res.send({artist:req.body.artistName,files:files});
});

router.post('/getGenreList',verify, async (req,res)=>{
    const genreList = await File.distinct("genre").exec();
    return res.send(genreList);
});
router.post('/getGenre',verify, async (req,res)=>{
    const files = await File.find({genre:req.body.genreName}).exec();
    return res.send({genre:req.body.genreName,files:files});
});

router.post('/createFileList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id});
    if(!userExist){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing createFileList route without being logged as an existing user");
    }
    if(!req.body.fileListName){
        return res.status(400).send({message:"can't create a playlist without a name"});
    }
    const fileListExist = await FileList.findOne({name:req.body.fileListName,owner:userExist});
    if(fileListExist){
        return res.status(400).send({message:"already exists"});
        console.log("failed attempt at executing createFileList route with a playlist already existing");
    }
    new FileList({
        name:req.body.fileListName,
        owner:userExist,
    }).save();
    return res.send({created:true});
});

router.post('/removeFromFileList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id});
    if(!userExist){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing removeFromFileList route without being logged as an existing user");
    }
    if(!req.body.fileListName){
        return res.status(400).send({message:"can't remove from a playlist without a name"});
    }
    if(!req.body.fileId){
        return res.status(400).send({message:"can't remove from a playlist without a file id"});
    }
    const fileListExist = await FileList.findOne({name:req.body.fileListName,owner:userExist});
    if(!fileListExist){
        return res.status(400).send({message:"playlist not found"});
        console.log("failed attempt at executing removeFromFileList route without an existing playlist name");
    }
    const fileExist = await File.findOne({_id:req.body.fileId});
    if(!fileExist){
        return res.status(400).send({message:"file to add not found"});
        console.log("failed attempt at executing removeFromFileList route without an existing file id");
    }
    const fileIndex = fileListExist.files.indexOf(req.body.fileId);
    if(fileIndex != -1){
        fileListExist.files.splice(fileIndex,1);
    }
    await fileListExist.save();
    return res.send(fileListExist.files);
});

router.post('/addToFileList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id});
    if(!userExist){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing addToFileList route without being logged as an existing user");
    }
    if(!req.body.fileListName){
        return res.status(400).send({message:"can't add to a playlist without a name"});
    }
    if(!req.body.fileId){
        return res.status(400).send({message:"can't add to a playlist without a file id"});
    }
    const fileListExist = await FileList.findOne({name:req.body.fileListName,owner:userExist});
    if(!fileListExist){
        return res.status(400).send({message:"playlist not found"});
        console.log("failed attempt at executing addToFileList route without an existing playlist name");
    }
    const fileExist = await File.findOne({_id:req.body.fileId});
    if(!fileExist){
        return res.status(400).send({message:"file to add not found"});
        console.log("failed attempt at executing addToFileList route without an existing file id");
    }
    fileListExist.files.push(fileExist);
    await fileListExist.save();
    return res.send({files:fileListExist.files});
});

router.post('/getFileList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id});
    if(!userExist){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing getFileList route without being logged as an existing user");
    }
    if(!req.body.fileListName){
        return res.status(400).send({message:"can't get playlist without a name"});
    }
    const filesList = await FileList.findOne({owner:req.user._id,name:req.body.fileListName}).populate("files").exec();
    if(filesList){
        return res.send({files:filesList.files});
    }else{
        return res.status(400).send({message:'FileList not found'});
    }
    
});



//lists and filters files to scan
async function readFolder(folderPath){
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

async function scanRecursive (folderPath,nodes,files){
    let filesInPath = await readFolder(folderPath);
    let children = [];
    for (let i=0; i<filesInPath.length; i++) {
        const item = filesInPath[i];
        const isDirectory = item.isDirectory();
        let file;
        let node;
        if(isDirectory){
            file = new File({
                title: item.name
            })
            node = new Node({
                file:file,
            });
            file.node = node;
            node.children = await scanRecursive(folderPath+"/"+item.name,nodes,files);
            
        }else{
            const url = folderPath+"/"+item.name;
            const tags = await mm.parseFile(url);
            file = new File({
                title : tags.title?tags.title : item.name,
                url:url.substring(pathToScan.length),
            });
            mapToProps(file,tags.common);
            node = new Node({
                file:file,
            });
            file.node = node;
        }
        nodes.push(node);
        files.push(file);
        children.push(node);
    }
    //children.sort(sortFiles);
    return children;
}

async function scanFiles(pathToScan){
    let files = [];
    let nodes = [];
    const rootFile = new File({
        title: "My media",
    });
    rootNode = new Node({
        file: rootFile,
    });
    rootFile.node = rootNode;
    nodes.push(rootNode);
    files.push(rootFile);
    rootNode.children = await scanRecursive(pathToScan,nodes,files);
    return {nodes:nodes,files:files};
}
function modelNodeStructure(node,result){
    modelFile(node.file,result);
    if(node.children.length > 0){
        result.children = [];
        for(let child of node.children){
            childResult = {};
            result.children.push(childResult);
            modelNodeStructure(child,childResult);
        }
    }
}
function modelFile(file,result){
    for(let propName of legalFileProps){
        //console.log("propName "+propName);
        if(file[propName]){
            result[propName] = file[propName];
        }
    }
}
router.post('/scanToDb',verify, async (req,res)=>{
    //cleans the collections

    console.log("scanToDb Route");
    const userExist = await User.findOne({_id:req.user._id});
    if(!userExist || userExist.type !== 0){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing scanToDb route with insufficient privileges "+userExist);
    }

    try{
        await mongoose.connection.dropCollection("files");
    }catch(err){
        console.log("collection 'files' can't be dropped")
    }
    try{
        await mongoose.connection.dropCollection("nodes");
    }catch(err){
        console.log("collection 'nodes' can't be dropped")
    }
    
    console.log("collection are empty");

    const toSave = await scanFiles(pathToScan);
    console.log(toSave.files.length + " files scanned");
    await Node.collection.insertMany(toSave.nodes);
    await File.collection.insertMany(toSave.files);
    console.log("files and nodes are saved");
    return res.send({filesScanned:toSave.files.length});
});
const legalFileProps = [
    "title",
    "_id",
    'node',
    "url",
    "album",
    "year",
    "artist",
    "publisher",
    "track",
    "genre",
    "composer"
];

const props = [
    "album",
    "year",
    "artist",
    "publisher",
    "track",
    "genre",
    "composer"
];
const metaProps = [
    ["album"],
    ["year"],
    ["artist"],
    ["publisher"],
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
        }else if(typeof metaProp === "string"){
            metaProp = metaProp.replace("´","'");
            obj[propName] = metaProp;
        }
    }
}


module.exports = router;