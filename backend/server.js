const express = require("express");
var cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(cors());
//import routes
const authRoutes = require('./auth.js');
const tracksRoutes = require('./tracksDb');
dotenv.config();

const verify = require('./verifyToken');

const mongoose = require('mongoose');

mongoose.connect(
    process.env.DB_CONNECT,
    {useNewUrlParser:true},
    (err)=>{
        if(err){
            console.log("can't connect to db err="+err);
        }else{
            console.log("db connected");
        }
    },
);

//Middleware
app.use(express.json());

/*app.get("/", function(req, res) {
    res.send("Hello World")
})*/

//add route middelware to app
app.use("/api",tracksRoutes);
app.use("/api/user",authRoutes);


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
app.get('/favorite', function(request, response){    
    response.sendFile(__dirname + '/public/index.html');
});
app.use(express.static('public'));
app.use(verify,express.static('media'));

app.listen(3001);