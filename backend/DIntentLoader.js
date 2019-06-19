const { spawn } = require('child_process');
const DIntent = require('./model/DIntent');
const fs = require('fs-extra');
var runScan = require('./tracksDb').runScan;

var DLproc;
var fileDownloading = false;
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
        await fs.move(tmpPath,dest);
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

module.exports = {requestDIntent};
