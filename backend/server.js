const express = require("express")
const app = express()
/*app.get("/", function(req, res) {
    res.send("Hello World")
})*/
app.get('', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.get('/artist*', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.get('/album*', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.get('/search*', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.get('/playlist*', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.get('/folder*', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.get('/genre*', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.use(express.static('public'));
app.listen(3000);