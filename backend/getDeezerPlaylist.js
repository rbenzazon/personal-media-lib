
const fetch = require("node-fetch");

async function loadPlaylist(){
    
}


function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function scrapeDeezer(){
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({defaultViewport :{width:800,height:1000}});
    const page = await browser.newPage();
    let playlistReqUrl;
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if(interceptedRequest.url().includes('https://www.deezer.com/ajax/gw-light.php?method=playlist.getSongs')){
            // Here, is where you change the request method and 
            // add your post data
            var data = {
                'method': 'POST',
                'postData': '{"playlist_id":"6026395044","start":0,"nb":2000}',
            };
        }
        

        // Request modified... finish sending! 
        interceptedRequest.continue(data);
    });
    page.on('requestfinished',async (request) => {
        //console.log(request.url());
        if(playlistReqUrl == null && request.url().includes('https://www.deezer.com/ajax/gw-light.php?method=playlist.getSongs')){
            playlistReqUrl = request.url();
            //console.log(request.text());
        }
        
    });

    
    await page.goto("https://www.deezer.com/ro/playlist/6026395044", { waitUntil: 'networkidle0' });
    console.log(page.url());
    
    page.on('response', async resp => {
        //console.log(await resp.text());
        if (resp.ok && resp.url() === playlistReqUrl) {
            //console.log(resp.text().toString().substr(0,50))
            jsonResp = await JSON.parse(await resp.text());
            //console.log(jsonResp);
            trackList = jsonResp.results.data.map(track => {
               return {title:track.SNG_TITLE,artist:track.ART_NAME,album:track.ALB_TITLE};
            });
            console.log(trackList);
          //
        }
    });
    await sleep(1000);
    
    await page.goto(playlistReqUrl, { waitUntil: 'networkidle0' });
    console.log(page.url());
    await page.screenshot({path: 'playlist.png'});
    await browser.close();
    //await page.goto("playlistReqUrl", { waitUntil: 'networkidle0' });

    //console.log(page.url());

    //
    
    
    /* Outputting what we scraped */
    
    
}
scrapeDeezer();
//loadPlaylist();