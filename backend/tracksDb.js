const router = require("express").Router();
const sharp = require('sharp');
const File = require("./model/File");
const Node = require("./model/Node");
const User = require('./model/User');
const FileList = require('./model/FileList');
const mongoose = require('mongoose');
const verify = require('./verifyToken');
var fs = require('fs');
var path = require('path');
const mm = require('music-metadata');
const { spawn } = require('child_process');
const DIntent = require('./model/DIntent');
const fsEx = require('fs-extra');


const PATH_TO_SCAN = './media';
var ROOT_TITLE = 'My media';
var DLproc;
var fileDownloading = false;


router.post('/getFolder',verify, async (req,res)=>{
    //add id ref to root file from .env
    let parents = [];
    let targetFile = await File.findOne({title:"My media"}).exec();
    let targetNode = await Node.findOne({_id:targetFile.node}).exec();
    parents.push(targetFile);
    //when looking for a folder name in a children list, if it's not found, status 400 and send error
    let notFound;
    //skip child folder selecting if request is on root node which is already selected
    if(req.body.path.length>=1){
        for (let folderName of req.body.path.split("/")){
            //for each current folder, populate node data to access children file
            await targetNode.populate("children").execPopulate();
            children = targetNode.children;
            found = false;
            for(let child of children) {
                //pass if not folder
                if(!child.children || !child.children.length > 0){
                    continue;
                }
                //populate with File data to check the node name
                let populated = await child.populate("file").execPopulate();
                if(child.file.title === folderName){
                    //set the main loop on a new Node instance
                    targetFile = child;
                    parents.push(targetFile.file);
                    targetNode = await Node.findOne({_id:targetFile.file.node}).exec();
                    //flag to not res status 400 after breaking
                    found = true;
                    break;
                }
            }
            //one of the folder in the path have not been found, sent the request as error
            if(!found){
                return res.status(400).send({message:"can't find "+folderName+" in "+targetFile.title});
            }
        }
    }
    //populate File data in the last target node of the path to get the children info to send
    await targetNode.populate("children").execPopulate();

    const model = {
        title:targetFile.file?targetFile.file.title:targetFile.title,
        _id:targetFile.file?targetFile.file._id:targetFile._id,
        children:[],
        parents:parents.slice(0,parents.length-1),
    };
    //filter the props
    modelNodeList(targetNode.children,model.children);
    return res.send(model);
});

router.post('/getAllTracks',verify, async (req,res)=>{
    //filters Files from url (folder don't have url)
    return res.send(await File.find({"url":{$exists:true}}).exec());
});
router.post('/getSearch',verify, async (req,res)=>{
    const {searchKeyword} = req.body;
    //filters Files from url (folder don't have url)
    return res.send(await File.find({$or:[
        {"title":{ $regex : new RegExp(searchKeyword, "i") }},
        {"artist":{ $regex : new RegExp(searchKeyword, "i") }},
        {"album":{ $regex : new RegExp(searchKeyword, "i") }}
    ],"url":{$exists:true}}).exec());
});
/*
router.post('/getAllTracksFromNode',verify, async (req,res)=>{
    //const rootFile = await File.findOne({title:"testFolder"}).exec();
    const allNotFolder = await Node.find({"children.0":{$exists:false}}).exec();
    //console.log(allNotFolder);
    allNotFolder.forEach(async element => {
        await element.populate("file");
    });
    console.log(allNotFolder);
    const model = [];
    modelNodeList(allNotFolder,model);
    return res.send(model);
});


router.post('/getCompleteTree',verify, async (req,res)=>{
    const rootFile = await File.findOne({title:"testFolder"}).exec();
    const populated = await Node.findOne({file:rootFile._id});
    const model = {};
    modelNodeStructure(populated,model);
    return res.send(model);
});
*/
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
    return res.send(albumList.filter(album => album !== ""));
});

router.post('/getArtistList',verify, async (req,res)=>{
    const artistList = await File.distinct("artist").exec();
    return res.send(artistList.filter(artist => artist !== ""));
});

router.post('/getArtist',verify, async (req,res)=>{
    const files = await File.find({artist:req.body.artistName}).exec();
    return res.send({artist:req.body.artistName,files:files});
});

router.post('/getGenreList',verify, async (req,res)=>{
    const genreList = await File.distinct("genre").exec();
    return res.send(genreList.filter(genre => genre !== ""));
});
router.post('/getGenre',verify, async (req,res)=>{
    const files = await File.find({genre:req.body.genreName}).exec();
    return res.send({genre:req.body.genreName,files:files});
});

router.post('/createFileList',verify, async (req,res)=>{
    console.log("createFileList");
    const userExist = await User.findOne({_id:req.user._id}).exec();
    if(!userExist){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing createFileList route without being logged as an existing user");
    }
    if(!req.body.fileListName){
        return res.status(400).send({message:"can't create a playlist without a name"});
    }
    const fileListExist = await FileList.findOne({name:req.body.fileListName,owner:userExist}).exec();
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
    const userExist = await User.findOne({_id:req.user._id}).exec();
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
    const fileListExist = await FileList.findOne({name:req.body.fileListName,owner:userExist}).exec();
    if(!fileListExist){
        return res.status(400).send({message:"playlist not found"});
        console.log("failed attempt at executing removeFromFileList route without an existing playlist name");
    }
    const fileExist = await File.findOne({_id:req.body.fileId}).exec();
    if(!fileExist){
        return res.status(400).send({message:"file to add not found"});
        console.log("failed attempt at executing removeFromFileList route without an existing file id");
    }
    const fileIndex = fileListExist.files.indexOf(req.body.fileId);
    if(fileIndex != -1){
        fileListExist.files.splice(fileIndex,1);
    }
    await fileListExist.save();
    return res.send({files:fileListExist.files});
});

router.post('/addToFileList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id}).exec();
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
    const fileListExist = await FileList.findOne({name:req.body.fileListName,owner:userExist}).exec();
    if(!fileListExist){
        return res.status(400).send({message:"playlist not found"});
        console.log("failed attempt at executing addToFileList route without an existing playlist name");
    }
    const fileExist = await File.findOne({_id:req.body.fileId}).exec();
    if(!fileExist){
        return res.status(400).send({message:"file to add not found"});
        console.log("failed attempt at executing addToFileList route without an existing file id");
    }
    if(fileListExist.files.indexOf(req.body.fileId) !== -1){
        return res.send({files:fileListExist.files,message:"file already there"});
    }
    fileListExist.files.push(fileExist);
    await fileListExist.save();
    return res.send({files:fileListExist.files});
});

router.post('/getFileList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id}).exec();
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
router.post('/getFileListList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id}).exec();
    if(!userExist){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing getFileList route without being logged as an existing user");
    }
    
    const filesListList = await FileList.find({owner:req.user._id,name:{ $ne: "favorite" }}).exec();
    if(filesListList){
        return res.send({files:filesListList});
    }else{
        return res.status(400).send({message:"can't find any playlist for this user"});
    }
    
});

router.post('/getFileListIds',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id}).exec();
    if(!userExist){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing getFileList route without being logged as an existing user");
    }
    if(!req.body.fileListName){
        return res.status(400).send({message:"can't get playlist without a name"});
    }
    const filesList = await FileList.findOne({owner:req.user._id,name:req.body.fileListName}).exec();
    if(filesList){
        return res.send({files:filesList.files});
    }else{
        return res.status(400).send({message:'FileList not found'});
    }
    
});

/**
 * Begin scanToDb
 */

const legalFileProps = [
    "title",
    "_id",
    'node',
    "url",
    "album",
    "year",
    "artist",
    "publisher",
    "imageUrl",
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
                title : tags.common.title?tags.common.title : item.name,
                url:url.substring(PATH_TO_SCAN.length),
            });
            if(tags.common.picture && tags.common.picture[0] && tags.common.picture[0].data){
                try{
                    sharp(tags.common.picture[0].data)
                    .resize(256,256,{fit:"inside"})
                    .toFile(url+".jpg");
                    file.imageUrl = file.url+".jpg";
                }catch(err){
                    console.log("error reading image from file :"+url+"\\n"+err)
                }
            }
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
    var rootNode = new Node({
        file: rootFile,
    });
    rootFile.node = rootNode;
    nodes.push(rootNode);
    files.push(rootFile);
    rootNode.children = await scanRecursive(pathToScan,nodes,files);
    return {nodes:nodes,files:files};
}

function modelNodeList(nodeList,result){
    for(let node of nodeList){
        let nodeModel = {}
        result.push(nodeModel);
        modelFile(node.file,nodeModel);
    }
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
        if(file[propName]){
            result[propName] = file[propName];
        }
    }
}

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
            //ugly, solves pb on one album title not recognized on theaudiodb.com
            metaProp = metaProp.replace("´","'");
            obj[propName] = metaProp;
        }
    }
}

router.post('/scanToDb',verify, async (req,res)=>{
    //cleans the collections

    console.log("scanToDb Route");
    const userExist = await User.findOne({_id:req.user._id}).exec();
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
    /*try{
        await mongoose.connection.dropCollection("fileLists");
    }catch(err){
        console.log("collection 'fileLists' can't be dropped")
    }*/
    try{
        await FileList.updateMany({}, { $set: {"files": []}}).exec();
    }catch(err){
        console.log("error trying to empty all fileLists err="+err);
    }
    
    console.log("collection are empty");

    const toSave = await scanFiles(PATH_TO_SCAN);
    console.log(toSave.files.length + " files scanned");
    await Node.collection.insertMany(toSave.nodes);
    await File.collection.insertMany(toSave.files);
    console.log("files and nodes are saved");
    return res.send({filesScanned:toSave.files.length});
});

/**
 * End scanToDb
 */


/**
 * Begin scanUpdateToDb
 */

 /**
  * returns the child Node document from @node corresponding to fileName
  * Works only on folder because title = filename for folder only
  * 
  * @param {Node} node node document containing children array of File documents ref. Children need to pe populated and their file property populated as well
  * @param {string} fileName 
  * @returns {Node} child node linking to File with .title equal to fileName
  */
function findChildNodeByFileName(node,fileName){
    for(let child of node.children) {
        if(child.file.title === fileName){
            return child;
        }
    }
    return null;
}

 /**
  * returns the child Node document from @node corresponding to fileName
  * Works only on file(not folder) because url = fileName for files only
  * 
  * @param {Node} node node document containing children array of File documents ref. Children need to pe populated and their file ref property populated as well
  * @param {string} fileName 
  * @returns {Node} child node linking to File with .url equals to fileName
  */
function findChildNodeByUrl(node,fileName){
    for(let child of node.children) {
        if(!child.file.url){
            continue;
        }
        const fileName = child.file.url.substring(child.file.url.lastIndexOf("/")+1);
        if(fileName === fileName){
            return child;
        }
    }
    return null;
}

/**
 * removes child Node document from Node parent and deletes it,
 * including its associated File documents
 * 
 * @param {Node} parentNode parent node from where to remove @childNode
 * @param {Node} childNode child node to remove from @parentNode
 */

async function removeOneNodeAndFile(parentNode,childNode){
    parentNode.children.remove(childNode);
    if(childNode.populated("file")){
        await childNode.depopulate("file");
    }
    try{
        await File.findOneAndDelete({_id:childNode.file}).exec();
    }catch(err){
        console.log("file deletion didn't work err="+err)
    }
    try{
        await Node.updateOne({_id:parentNode._id}, { $pull: {"children": { "_id":childNode.file}}}).exec();
    }catch(err){
        console.log("error trying to remove child from parent node err="+err);
    }
    try{
        await Node.findOneAndDelete({_id:childNode._id}).exec();
    }catch(err){
        console.log("node deletion didn't work err="+err);
    }
    
}

/**
 * removes every child node in one parent node, including their associated File ref
 * @param {Node} parentNode parent node from where to remove all the nodes
 */

async function removeChildrenRecursive(parentNode){
    parentNode = await parentNode.populate("children").execPopulate();
    while(parentNode.children.length>0) {
        let child = parentNode.children[0];
        let childWithFile = await child.populate("file").execPopulate();
        if(!childWithFile.file.url && child.children.length >=1){
            await removeChildrenRecursive(child);
        }
        await removeOneNodeAndFile(parentNode,child);
    }
}

/**
 * 
 * update the db where needed in one folder recursively, new Node and File
 * instances are not saved yet, it's needed to Model.insertMany nodes and files
 * after calling it.
 * 
 * Usually called with @node being the root node and @folderPath being the
 * root folder of the media lib, @nodes and @files being empty arrays
 * 
 * @param {Node} node existing root node from where to mount the folder @folderPath
 * @param {string} folderPath path to scan for updates
 * @param {*} nodes 
 * @param {*} files 
 */

async function scanUpdateRecursive (node,folderPath,nodes,files){
    //populate child nodes inside the current node
    await node.populate("children").execPopulate();
    //deletion
    for(let i=node.children.length-1;i>=0;i--) {
        let child = node.children[i];
        //populate with File data to check the node name
        let childWithFile = await child.populate("file").execPopulate();
        let filePath = childWithFile.file.url? childWithFile.file.url.substring(childWithFile.file.url.lastIndexOf("/")+1) : childWithFile.file.title;
        //file is still there, do nothin
        if(fs.existsSync(folderPath+"/"+filePath)){
            if(!childWithFile.file.url){
                await scanUpdateRecursive(child,folderPath+"/"+filePath,nodes,files);
            }
        }
        else//file is gone, need to remove it from the db
        {
            if(!childWithFile.file.url && child.children.length >=1){
                await removeChildrenRecursive(child);
            }
            await removeOneNodeAndFile(node,child);
        }
    }
    //addition
    let filesInPath = await readFolder(folderPath);
    for (let i=0; i<filesInPath.length; i++) {
        const item = filesInPath[i];
        //check if file is already referenced in the current node
        const isDirectory = item.isDirectory();
        //if file exists and not a folder, no need to continue
        let newFile;
        let newNode;
        if(isDirectory){
            const existingFolderChildNode = findChildNodeByFileName(node,item.name);
            if(existingFolderChildNode != null){
                console.log("this folder exists "+item.name);
                console.log("recursing");
                await scanUpdateRecursive(existingFolderChildNode,folderPath+"/"+item.name,nodes,files);
            }else{
                console.log("this folder doesn't exists");
                newFile = new File({
                    title: item.name
                })
                newNode = new Node({
                    file:newFile,
                });
                newFile.node = newNode;
                console.log("saving");
                await newNode.save();
                console.log("recursing");
                await scanUpdateRecursive(newNode,folderPath+"/"+item.name,nodes,files);
                files.push(newFile);
                try{
                    await Node.findOneAndUpdate({_id:node._id},{ $push: { children: newNode._id } }).exec();
                }catch(err){
                    console.log("can't push new folder node to its parent err="+err);
                    return;
                }
            }
        }else {
            const existingFileChildNode = findChildNodeByUrl(node,item.name);
            if(existingFileChildNode === null){
                console.log("found fsfile not referenced");
            }else{
                continue;
            }
            const url = folderPath+"/"+item.name;
            const tags = await mm.parseFile(url);
            
            newFile = new File({
                title : tags.common.title?tags.common.title : item.name,
                url:url.substring(PATH_TO_SCAN.length),
            });
            if(tags.common.picture && tags.common.picture[0] && tags.common.picture[0].data){
                try{
                    sharp(tags.common.picture[0].data)
                    .resize(256,256,{fit:"inside"})
                    .toFile(url+".jpg");
                    newFile.imageUrl = newFile.url+".jpg";
                }catch(err){
                    console.log("error reading image from file :"+url+"\\n"+err);
                    return;
                }
            }
            mapToProps(newFile,tags.common);
            newNode = new Node({
                file:newFile,
            });
            newFile.node = newNode;
            console.log("created new file");
            try{
                await Node.updateOne({_id:node._id},{ $push: { children: newNode } }).exec();
            }catch(err){
                console.log("can't push new file node to its parent err="+err);
                return;
            }
            console.log("added new childnode"+item.name+" to node "+node.file.title);
            nodes.push(newNode);
            files.push(newFile);
        }
    }
    if(node.populated("children")){
        node.depopulate("children");
    }
}

async function scanUpdateFiles(){
    try{
        var rootFile = await File.findOne({title:"My media"}).exec();
    }catch(err){
        console.log("can't find root file err="+err);
        return;
    }
    
    console.log("01 rootFile = "+rootFile._id);
    try{
        var rootNode = await Node.findOne({_id:rootFile.node}).exec();
    }catch(err){
        console.log("can't find root node err="+err);
        return;
    }
    console.log("rootNode = "+rootNode._id);
    let files = [];
    let nodes = [];
    await scanUpdateRecursive(rootNode,PATH_TO_SCAN,nodes,files);
    return {nodes:nodes,files:files};
}

async function runScan(){
    const toSave = await scanUpdateFiles();
    console.log(toSave.files.length + " new files scanned");
    if(toSave.nodes.length > 0){
        try{
            await Node.collection.insertMany(toSave.nodes);
        }catch(err){
            console.log("can't insert new nodes err="+err);
            return;
        }
    }
    if(toSave.files.length > 0){
        try{
            await File.collection.insertMany(toSave.files);
        }catch(err){
            console.log("can't insert new files err="+err);
            return;
        }
    }
    console.log("db has been updated");
    return toSave.files.length;
}

router.post('/scanUpdateToDb',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id}).exec();
    if(!userExist || userExist.type !== 0){
        console.log("failed attempt at executing scanToDb route with insufficient privileges "+userExist);
        return res.status(400).send({message:'Access restricted'});
    }
    let fileScanned = await runScan();
    
    return res.send({filesScanned:fileScanned});
});

/**
 * End scanUpdateToDb
 */

/**
 * Download handling
 */

 
router.post('/addDownload',verify,async (req,res)=>{
    console.log("addDownload Route");
    const userExist = await User.findOne({_id:req.user._id}).exec();
    if(!userExist || userExist.type !== 0){
        console.log("failed attempt at executing scanToDb route with insufficient privileges "+userExist);
        return res.status(400).send({message:'Access restricted'});
    }
    requestDIntent(req.body.magnet,req.user._id);
    return res.send(req.body);
});

router.post('/getDownloads',verify,async (req,res)=>{
    console.log("getDownloads Route");
    const userExist = await User.findOne({_id:req.user._id}).exec();
    if(!userExist || userExist.type !== 0){
        console.log("failed attempt at executing scanToDb route with insufficient privileges "+userExist);
        return res.status(400).send({message:'Access restricted'});
    }
    const downloads = await DIntent.find({},"title bytesLoaded bytesTotal progress completed path").lean().exec();
    return res.send({downloads:downloads});
});


/**
 * requires aria2c installed and added in PATH for windows
 * @param {string} magnet 
 * @param {string} ownerId 
 */
async function requestDIntent(magnet,ownerId){
    console.log(runScan);
    var path;
    //lifecycle, when called with arguments, prepare to abort if DLproc != undefined
    if(magnet != undefined){
        let alreadyExists;
        try{
            alreadyExists = await DIntent.findOne({magnet:magnet});
        }catch(err){
            console.log("child process can't query Dintent err="+err);
        }
        if(alreadyExists){
            console.log("child process error, you can't download twice the same torrent");
            return;
        }
        //create random folder name to store downloaded files
        /*let randomName = '';
        while(randomName.length < 7){
            randomName = randomName + String.fromCharCode(65+Math.round(Math.random()*25));
        }*/
        let magnetSearchParam = magnet.substring(magnet.indexOf("magnet:?")+8);
        let params = new URLSearchParams(magnetSearchParam);
        let title = params.get("dn");
        title = title.replace(/[^\w-]/ig, '');
        title = title.replace(/\//g,"");
        //replaces windows backslash with forward slash to have a platform independant script
        path = new String(__dirname +'/tmp/'+title).replace(/\\/g,"/");
        //title = title.replace(/./g,"");
        let newDIntent = new DIntent({
            title:title,
            magnet:magnet,
            path:path,
            owner:ownerId,
        });
        //lifecycle, saves in case of abort
        await DIntent.collection.insertOne(newDIntent);
    }

    //lifecycle, limits the child DLproc to unique
    if(DLproc){
        console.log("child process can't start 2 simultaneous downloads, returning");
        return;
    }

    //lifecycle, when called without argument, finds the next intent in DB or quits
    if(magnet === undefined){
        try{
            var runningIntent = await DIntent.findOne({completed: { $exists: false }}).exec();
        }catch(err){
            console.log("child process can't query existing DItent s err="+err);
            return;
        }
        if(runningIntent){
            magnet = runningIntent.magnet;
            owner = runningIntent.owner;
            path = runningIntent.path;
        }else{
            console.log("child process no more tasks, returning");
            return;
        }
    }
    console.log("aria2c "+magnet);
    DLproc = spawn('aria2c', ['"'+magnet+'"','--dir='+path,'--summary-interval=3'],{ shell: true});

    DLproc.on('exit', async code => {
        console.log(`child process exit code is: ${code}`);

        //lifecycle, empty process variable to let next call know it's free
        DLproc = null;

        let folderName = path.substring(path.lastIndexOf("/")+1);
        let dest = __dirname+"/media/download/"+folderName;
        if(process.platform == "win32" || process.platform == "win64"){
            tmpPath = path.replace(/\//g,"\\");
            dest = dest.replace(/\//g,"\\");
        }

        await fsEx.move(tmpPath,dest);
        try{
            await DIntent.updateOne({magnet:magnet},{
                path:dest,
            }).exec();
        }catch(err){
            console.log("child process couldn't update DIntent path after move err="+err);
        }
        await runScan();
        //lifecycle, RunDIntent again in case there is other intents to execute on DB
        requestDIntent();
    });

    //stdout reading, updates DB with progress and completion
    DLproc.stdout.on('data', async function(data) {
        var str = data.toString(), lines = str.split(/(\r?\n)/g);
        
        //aria2c send download progress to the console once for metadata first,
        // then for the downloaded file, so this if skips the metadata part
        if(fileDownloading) {
            for (var i=lines.length-1; i>=0; i--) {
                if(lines[i].charAt(0) === "["){
                    var progress;
                    if(lines[i].indexOf("SEED") != -1){
                        progress = "100";
                    }else{
                        //"[#ID 0B/0B(0%) CN:0 SD:0 DL:0B]"" => "#ID 0B/0B(0%) CN:0 SD:0 DL:0B"
                        var line = lines[i].slice(1,-1);
                        //["#ID","0B/0B(0%)","CN:0","SD:0","DL:0B"]
                        var args = line.split(" ");
                        var ariaId = args[0];
                        //"0B/0B(0%)" => ["0B","0B(0%)"]
                        var bytes = args[1].split("/");
                        //"0B"
                        var bytesLoaded = bytes[0];
                        //"0B(0%)"
                        var bytesTotal = bytes[1];
                        //optionnal "(0%)"
                        var parenthesis = bytesTotal.indexOf("(");
                        if(parenthesis != -1){
                            //"0B(0%)" => "0" //0=>100
                            progress = bytesTotal.substring(parenthesis+1,bytesTotal.indexOf("%"));
                            bytesTotal = bytesTotal.substring(0,parenthesis);
                        }
                        //"CN:0" => ["CN","0"] => "0"
                        var connections = args[2].split(":")[1];
                        //"SD:0" => ["SD","0"] => "0"
                        var seeders = args[3].split(":")[1];
                        var speed = "";
                        if(args.length >= 5){
                            //"DL:0" => ["DL","0"] => "0"
                            speed = args[4].split(":")[1];
                        }
                        //"0B","0B","0","0","0","0"
                        //console.log("child process DIntent ",bytesLoaded,bytesTotal,connections,seeders,speed,progress ? progress : ""); 
                    }
                    if(progress === "100"){
                        try{
                            await DIntent.updateOne({magnet:magnet},{
                                completed:Date.now(),
                                progress:parseInt(progress),
                            }).exec();
                        }catch(err){
                            console.log("child process couldn't update DIntent err="+err);
                        }
                        fileDownloading = false;
                        //DLproc.stdin.write("c\nc\n");
                        if(process.platform == "win32" || process.platform == "win64"){
                            //var spawn = require('child_process').spawn;    
                            spawn("taskkill", ["/pid", DLproc.pid, '/f', '/t']);
                        }else{
                            DLproc.kill();
                        }                        
                    }else{
                        if(isNaN(parseInt(progress))){
                            progress = 0;
                        }
                        try{
                            await DIntent.updateOne({magnet:magnet},{
                                ariaId:ariaId,
                                progress:parseInt(progress),
                                bytesLoaded:bytesLoaded,
                                bytesTotal:bytesTotal,
                                connections:connections,
                                seeders:seeders,
                                speed:speed,
                            }).exec();
                        }catch(err){
                            console.log("child process couldn't update DIntent err="+err);
                        }
                    }
                    break;
                }
            
            }
        }else{
            //finds when metadata loading stops and file download begins
            for (var i=lines.length-1; i>=0; i--) {
                if(lines[i].indexOf("FILE:") == 0 && lines[i].indexOf(path) != -1){
                    console.log("child process starting download");
                    fileDownloading = true;
                }
            }  
        }
    });
}

module.exports = router;