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
const PATH_TO_SCAN = './media';
var rootNode;

router.post('/getFolder',verify, async (req,res)=>{
    //add id ref to root file from .env
    let parents = [];
    let targetFile = await File.findOne({title:"My media"}).exec();
    let targetNode = await Node.findOne({_id:targetFile.node});
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
    return res.send(await File.find({"url":{$exists:true}}));
});
router.post('/getSearch',verify, async (req,res)=>{
    const {searchKeyword} = req.body;
    //filters Files from url (folder don't have url)
    return res.send(await File.find({$or:[
        {"title":{ $regex : new RegExp(searchKeyword, "i") }},
        {"artist":{ $regex : new RegExp(searchKeyword, "i") }},
        {"album":{ $regex : new RegExp(searchKeyword, "i") }}
    ],"url":{$exists:true}}));
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
    return res.send({files:fileListExist.files});
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
    if(fileListExist.files.indexOf(req.body.fileId) !== -1){
        return res.send({files:fileListExist.files,message:"file already there"});
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
router.post('/getFileListList',verify, async (req,res)=>{
    const userExist = await User.findOne({_id:req.user._id});
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
    const userExist = await User.findOne({_id:req.user._id});
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
    rootNode = new Node({
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
function findChildNodeByFileName(node,fileName){
    console.log("looking for "+fileName+" in node="+node._id);
    for(let child of node.children) {
        if(child.file.title === fileName){
            console.log("found "+fileName+" in node="+node._id);
            return child;
        }
    }
    console.log("can't find "+fileName+" in node="+node._id);
    return null;
}

function findChildNodeByUrl(node,title){
    console.log("looking for "+title+" in node="+node._id);
    for(let child of node.children) {
        if(!child.file.url){
            continue;
        }
        const fileName = child.file.url.substring(child.file.url.lastIndexOf("/")+1);
        if(fileName === title){
            console.log("found "+title+" in node="+node._id);
            return child;
        }
    }
    console.log("can't find "+title+" in node="+node._id);
    return null;
}

async function removeOneNodeAndFile(node,child){
    if(child.populated("file")){
        child.depopulate("file");
    }
    const fileCheck = await File.findOneAndRemove({_id:child.file});
    if(fileCheck){
        console.log("file successfully deleted");
    }else{
        console.log("file deletion didn't work")
    }
    const previousLength = node.children.length;
    await node.children.remove(child._id);
    if(node.children.length === previousLength-1){
        console.log("child has been removed from node.children");
    }else{
        console.log("child has NOT been removed from node.children");
    }

    const nodeCheck = await Node.findOneAndRemove({_id:child._id});
    if(nodeCheck){
        console.log("node successfully deleted");
    }else{
        console.log("node deletion didn't work")
    }
}

async function removeRecursive(node){
    console.log("removeRecursive node="+node._id);
    await node.populate("children").execPopulate();
    let toRemove = [];
    while(node.children.length>0) {
        let child = node.children[0];
        console.log("iterating removeRecursive child="+child._id);
        console.log(child);
        await child.populate("file").execPopulate();
        console.log("child="+child.file.title);
        if(!child.file.url && child.children.length >=1){
            console.log("child is folder")
            await removeRecursive(child);
        }
        await removeOneNodeAndFile(node,child);
    }
}

async function scanUpdateRecursive (node,folderPath,nodes,files){
    console.log("sUR "+node._id+" "+folderPath+" "+nodes.length+" "+files.length);
    //populate child nodes inside the current node
    await node.populate("children").execPopulate();
    if(node.children.length >= 1 && node.children[0].file){
        console.log("node has populated children")
    }
    console.log("checking for deletion");
    for(let child of node.children) {
        console.log("iterating child node="+child._id);
        //populate with File data to check the node name
        let nodeWithFile = await child.populate("file").execPopulate();
        if(nodeWithFile.file.title){
            if(nodeWithFile.file.url){
                console.log("node child has populated file file="+nodeWithFile.file.url);
            }else{
                console.log("node child has populated file file="+nodeWithFile.file.title);
            }
        }
        let filePath = nodeWithFile.file.url? nodeWithFile.file.url.substring(1) : nodeWithFile.file.title;
        //file is still there, do nothin
        if(fs.existsSync(folderPath+"/"+filePath)){
            console.log("file found");
            continue;
        }
        else//file is gone, need to remove it from the db
        {
            if(!child.file.url && child.children.length >=1){
                await removeRecursive(child);
            }
            console.log("file is missing, deteling");
            await removeOneNodeAndFile(node,child);
        }
    }
    console.log("end deletion checking");
    console.log("addition checking folder"+folderPath);
    let filesInPath = await readFolder(folderPath);
    if(filesInPath.length>0){
        console.log("found "+filesInPath.length+" files");
    }
    //let children = [];
    for (let i=0; i<filesInPath.length; i++) {
        const item = filesInPath[i];
        //check if file is already referenced in the current node
        const isDirectory = item.isDirectory();
        console.log("fsfile="+item.name+" isDirectory="+isDirectory);
        //if file exists and not a folder, no need to continue
        let newFile;
        let newNode;
        if(isDirectory){
            const existingFolderChildNode = findChildNodeByFileName(node,item.name);
            if(existingFolderChildNode === null){
                console.log("this folder is not referenced, creating new file and node");
            }else{
                continue;
            }
            
            if(existingFolderChildNode === null){
                
                
                newFile = new File({
                    title: item.name
                })
                newNode = new Node({
                    file:newFile,
                });
                newFile.node = newNode;
            }else{
                newNode = existingFolderChildNode;
                console.log("this folder exists");
            }
            console.log("recursing");
            await scanUpdateRecursive(newNode,folderPath+"/"+item.name,nodes,files);
            
           /*if(existingFolderChildNode === null){
               node.children = tmpChildren;
            }*/
            //await node.children.push(newNode._id);
            await Node.findOneAndUpdate({_id:node._id},{ $push: { children: newNode } });
        }else { //redondent condition for clarity
            const existingFileChildNode = findChildNodeByUrl(node,item.name);
            if(existingFileChildNode === null){
                console.log("found fsfile not referenced");
            }else{
                continue;
            }
            const url = folderPath+"/"+item.name;
            const tags = await mm.parseFile(url);
            //
            
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
                    console.log("error reading image from file :"+url+"\\n"+err)
                }
            }
            mapToProps(newFile,tags.common);
            newNode = new Node({
                file:newFile,
            });
            newFile.node = newNode;
            console.log("created new file");
            await Node.updateOne({_id:node._id},{ $push: { children: newNode } }).exec();
            console.log("added new childnode to node");
            
        }
        
        nodes.push(newNode);
        files.push(newFile);
        
    }
    if(node.populated("children")){
        node.depopulate("children");
    }
    console.log("saving children");
    console.log(node.children);
    //await Node.updateOne({_id:node._id},{ $set: { children: { $each: node.children } } });
    //nodes.push(node);
}

async function scanUpdateFiles(pathToScan){
    let rootFile = await File.findOne({title:"My media"}).exec();
    if(!rootFile) {
        console.log("01 can't find root file");
        return;
    }
    console.log("01 rootFile = "+rootFile._id);
    let rootNode = await Node.findOne({_id:rootFile.node});
    if(!rootNode) {
        console.log("01 can't find root node");
        return;
    }
    console.log("01 rootNode = "+rootNode._id);
    let files = [];
    let nodes = [];
    await scanUpdateRecursive(rootNode,pathToScan,nodes,files);
    return {nodes:nodes,files:files};
}

router.post('/scanUpdateToDb',verify, async (req,res)=>{
    const toSave = await scanUpdateFiles(PATH_TO_SCAN);
    console.log(toSave.files.length + " files scanned");
    await Node.collection.insertMany(toSave.nodes);
    await File.collection.insertMany(toSave.files);
    console.log("files and nodes are saved");
    return res.send({filesScanned:toSave.files.length});
});

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

    const toSave = await scanFiles(PATH_TO_SCAN);
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


module.exports = router;