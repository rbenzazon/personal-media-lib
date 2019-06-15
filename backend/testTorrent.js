const { spawn } = require('child_process')
let randomName = '';
while(randomName.length < 7){
    randomName = randomName + String.fromCharCode(65+Math.round(Math.random()*25));
}
const url = "magnet:?xt=urn:btih:0783de8676b4beab459650a1ff443e48331c3e50&dn=Weezer+-+Island+In+The+Sun+%28Version+1%29&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969";
async function run(){
    const child = spawn('aria2c', ['"'+url+'"','--dir=/home/rbenzazon/Music/'+randomName,'--summary-interval=1'],{ shell: true});

    child.on('exit', code => {
        console.log(`Exit code is: ${code}`);
    });

    child.stdout.on('data', function(data) {
        var str = data.toString(), lines = str.split(/(\r?\n)/g);
        for (var i=lines.length-1; i>=0; i--) {
            if(lines[i].charAt(0) === "["){
		let progress = "";
                let line = lines[i].slice(1,-1);
		let args = line.split(" "); let id = args[0];
		let bytesLoaded = args[1].split("/")[0];
		let bytesTotal = args[1].split("/")[1];
		let parenthesis = bytesTotal.indexOf("(");
		if(parenthesis!=-1 ){
			progress = bytesTotal.substring(parenthesis,bytesTotal.indexOf("%"));
			bytesTotal = bytesTotal.substring(0,parenthesis);
		}
		let connections = args[2].split(":")[1];
		let seeders = args[3].split(":")[1];
		let dl = args[4].split(":")[1];
                console.log(bytesLoaded,bytesTotal,connections,seeders,dl); // only prints one line
		continue;
            }
        }   
    });
    
    /*  // Async Iteration available since Node 10
    for await (const data of child.stdout) {
        console.log(`stdout from the child: ${data}`);
    };*/
}

run()
