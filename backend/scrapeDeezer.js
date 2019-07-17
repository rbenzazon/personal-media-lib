/*fetch("https://www.deezer.com//ajax/action.php", {
    "credentials":"include"
    ,"headers":{
        "accept":"*",
        "accept-language":"en,ro;q=0.9,en-US;q=0.8,fr;q=0.7,ru;q=0.6,es;q=0.5",
        "content-type":"application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with":"XMLHttpRequest"
    },
    "referrer":"https://www.deezer.com/en/login/email",
    "referrerPolicy":"no-referrer-when-downgrade",
    "body":"type=login&mail=raph151515%40hotmail.com&password=123456&checkFormLogin=jAnOmVC_hGtS.gZZskVgGjq3s8FTh1Q6&reCaptchaToken=03AOLTBLQw2xPmN8p01-369utEj8EoZsXP1yrCtMIiOyyMAo78fwguAcTSHclARJyvAb12jqF7kGOog3jr92URAfY3JnzBQTkwrFZWhbBb0FwsuwU7MgdQlX9UiwsHE9xoqp7o-Pa1QF4U7oi5rWzwRMZc-9NkUZCql1Zppfl_kdRhF0N2NiND0wtL_GEapUbhjRcGynAZpZ_zrMxT6e6gleU02UekwTD_PBDkOhAXeiuPyBzIRIBt7XBARHYusn_0l7AqV132r5x-pdxheiEnU7HagoZhJ3PAtoT4sImYPVYtDeT1yzIsXosf6MpotWwlv7hW2NJyVtRu",
    "method":"POST",
    "mode":"cors"
});*/
var TWEEN = require('@tweenjs/tween.js');


function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

async function scrapeDeezer(){
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({defaultViewport :{width:800,height:1000}});
    const page = await browser.newPage();
    var coords = { x: Math.round(Math.random()*200), y: Math.round(Math.random()*200) };
    page.mouse.move(coords.x, coords.y);
    await page.goto("https://www.deezer.com/en/login/email", { waitUntil: 'networkidle0' });
    /* Run javascript inside of the page */
    let data = await page.evaluate(async () => {
        /**/
    });
    console.log(page.url());
    await page.type('#login_mail', 'raph151515@hotmail.com', {delay: 20});
    await page.type('#login_password', '123456', {delay: 20});
    const loginButton = await page.$('#login_form_submit');
    console.log("loginButton");

    
    const rect = await page.evaluate((loginButton) => {
        const {top, left, bottom, right} = loginButton.getBoundingClientRect();
        return {top, left, bottom, right};
    }, loginButton);
    const submitWidth = rect.right - rect.left -1;
    const submitHeight = rect.bottom - rect.top -1;
    console.log("rect.left "+rect.left);
    console.log("rect.top "+rect.top);
    console.log("submitWidth "+submitWidth);
    console.log("submitHeight "+submitHeight);
    //var coords = { x: Math.round(Math.random()*200), y: Math.round(Math.random()*200) };
    console.log(coords.x);
    console.log(coords.y);
    let coordMouse = {x:0,y:0};
    const coordEnd = { x: Math.round(rect.left + (submitWidth * Math.random())), y: Math.round(rect.top + (submitHeight * Math.random()) )};
    var startTime = Date.now();
    function animate() {
        let time = Date.now();
        let elapsed = (time - startTime) / 423;
        if (elapsed >= 1) {
            console.log("end tween");
            clearInterval(tweenInterval);
            elapsed = 1;
        }
        let value = TWEEN.Easing.Quadratic.InOut(elapsed);
        coordMouse.x = Math.round(coords.x + (coordEnd.x - coords.x) * value);
        coordMouse.y = Math.round(coords.y + (coordEnd.y - coords.y) * value);
        page.mouse.move(coordMouse.x, coordMouse.y);
        //TWEEN.update(time);
    }
    var tweenInterval = setInterval(animate,30);
    /*var tween = new TWEEN.Tween(coords);
    
    console.log(coordEnd.x,coordEnd.y);
    tween.to(coordEnd,423);
    tween._valuesEnd = coordEnd;
    tween.easing(TWEEN.Easing.Quadratic.Out); // Use an easing function to make the animation smooth.
    tween.onUpdate(function() {
        console.log(coords);
        page.mouse.move(coords.x, coords.y);
    });
    tween.onComplete(function() {
        console.log("complete");
    });
    tween.start();*/
    //console.log(TWEEN.getAll()[0]);
    await sleep(800);
    console.log(coordMouse.x);
    console.log(coordMouse.y);
    await page.mouse.click(coordMouse.x,coordMouse.y,{delay :214});
    await sleep(600);
    const allChildren = await page.$$('iframe');

    var rcPopup;
    var popupParent;
    var popupGrandParent;
    for(let item of allChildren){
        const url = await page.evaluate((item) => {
            return item.src;
        }, item);
        if (url.includes('google.com/') && url.includes('bframe')){
            rcPopup = item;
            continue;
        }
    }
       
    
   //const rcPopup = await page.$('#recaptcha_login_container');
    if(rcPopup !== null){
        console.log("rcPopup"+rcPopup);
        const rcRect = await page.evaluate((rcPopup) => {
            const { left,top,right,bottom} = rcPopup.getBoundingClientRect();
            return {left,top,right,bottom};
        }, rcPopup);

        console.log("rcRect.left "+rcRect.left);
        console.log("rcRect.top "+rcRect.top);
        console.log("rcRect.right "+rcRect.right);
        console.log("rcRect.bottom "+rcRect.bottom);
        await page.screenshot({path: 'rcscreen.png',clip:{
            x:rcRect.left,
            y:rcRect.top,
            width:rcRect.right-rcRect.left,
            height:rcRect.bottom-rcRect.top,
        }});
    }
    //await page.mouse.up();
    //await page.waitForNavigation({ waitUntil: 'networkidle0' });
    //await (await page.$('#login_password')).press('Enter');
    //await page.click('#login_form_submit');
    await sleep(2234);
    console.log(page.url());
    await page.screenshot({path: 'buddy-screenshot.png'});
    /* Outputting what we scraped */
    
    await browser.close();
}
scrapeDeezer();