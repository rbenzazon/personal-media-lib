const { spawn } = require('child_process');
const DIntent = require('./model/DIntent');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

let randomName = '';
while(randomName.length < 7){
    randomName = randomName + String.fromCharCode(65+Math.round(Math.random()*25));
}
//process.argv[0];
//const magnet = "magnet:?xt=urn:btih:0783de8676b4beab459650a1ff443e48331c3e50&dn=Weezer+-+Island+In+The+Sun+%28Version+1%29&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969";
const magnet = "magnet:?xt=urn:btih:38a9d3a7709094e883e677e999f9b8f03e908de5&dn=Kate.Plus.Date.S01E03.480p.x264-mSD%5Beztv%5D.mkv%5Beztv%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A80&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969";
const path = new String(__dirname +'/tmp/'+randomName).replace(/\\/g,"/");

var fileDownloading = false;
async function run(){
    try {
        await mongoose.connect(
            process.env.DB_CONNECT,
            {useNewUrlParser:true},
            ()=>console.log("db connected"),
        );
    } catch (err) {
        console.log('db error: ' + err);
    }
    let newDIntent = new DIntent({
        magnet:magnet,
        path:path,
        owner:"5ce84b042c84650504c2754b",
    });
    await DIntent.collection.insertOne(newDIntent);

    const child = spawn('aria2c', ['"'+magnet+'"','--dir='+path,'--summary-interval=3'],{ shell: true});

    

    child.on('exit', code => {
        console.log(`Exit code is: ${code}`);
    });

    child.stdout.on('data', async function(data) {
        var str = data.toString(), lines = str.split(/(\r?\n)/g);
        
        if(fileDownloading) {
            for (var i=lines.length-1; i>=0; i--) {
                if(lines[i].charAt(0) === "["){
                    let progress = "0";
                    let line = lines[i].slice(1,-1);//"[#ID 0B/0B(0%) CN:0 SD:0 DL:0B]"" => "#ID 0B/0B(0%) CN:0 SD:0 DL:0B"
                    console.log(line);
                    let args = line.split(" ");//["#ID","0B/0B(0%)","CN:0","SD:0","DL:0B"]
                    let ariaId = args[0];
                    let bytes = args[1].split("/");//"0B/0B(0%)" => ["0B","0B(0%)"]
                    let bytesLoaded = bytes[0];//"0B"
                    let bytesTotal = bytes[1];//"0B(0%)"
                    let parenthesis = bytesTotal.indexOf("(");//optionnal "(0%)"
                    if(parenthesis != -1){
                        progress = bytesTotal.substring(parenthesis+1,bytesTotal.indexOf("%"));//"0B(0%)" => "0" //0=>100
                        bytesTotal = bytesTotal.substring(0,parenthesis);
                    }
                    let connections = args[2].split(":")[1];//"CN:0" => ["CN","0"] => "0"
                    let seeders = args[3].split(":")[1];//"SD:0" => ["SD","0"] => "0"
                    let speed = "";
                    if(args.length >= 5){
                        speed = args[4].split(":")[1];//"DL:0" => ["DL","0"] => "0"
                    }
                    console.log(bytesLoaded,bytesTotal,connections,seeders,speed,progress ? progress : ""); //"0B","0B","0","0","0","0"
                    if(progress === "100"){
                        try{
                            await DIntent.updateOne({magnet:magnet},{
                                completed:Date.now(),
                                ariaId:ariaId,
                                progress:parseInt(progress),
                                bytesLoaded:bytesLoaded,
                                bytesTotal:bytesTotal,
                                connections:connections,
                                seeders:seeders,
                                speed:speed,
                            }).exec();
                            process.exit();
                        }catch(err){
                            console.log("couldn't update DIntent");
                            process.exit(1);
                        }
                    }else{
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
                            console.log("couldn't update DIntent err="+err);
                        }
                    }

                    break;
                }
            
            }
        }else{
            for (var i=lines.length-1; i>=0; i--) {
                if(lines[i].indexOf("FILE:") == 0 && lines[i].indexOf(path) != -1){
                    console.log("starting");
                    fileDownloading = true;
                }
            }  
        }
        
    });
    
    /*  // Async Iteration available since Node 10
    for await (const data of child.stdout) {
        console.log(`stdout from the child: ${data}`);
    };*/
}

run()
