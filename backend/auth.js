const router = require("express").Router();
const User = require('./model/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Joi = require("@hapi/joi");
const {registerValidation,loginValidation} = require('./validation');
const verify = require('./verifyToken');

router.post('/register', verify, async (req,res)=>{
    //can't create account if not admin
    const userExist = await User.findOne({_id:req.user._id});
    if(!userExist && userExist.type !== 0){
        return res.status(400).send({message:'Access restricted'});
        console.log("failed attempt at executing register route with insufficient privileges "+userExist);
    }
    //validate
    const {error} = registerValidation(req.body);
    if(error){
        return res.status(400).send({message:error.details[0].message});
    }
    //checking if existing user
    const emailExist = await User.findOne({email:req.body.email});
    if(emailExist) return res.status(400).send({message:"email already exist"});
    
    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);

	const user = new User({
		name:req.body.name,
		email: req.body.email,
		password: hashPassword,
		type: req.body.type,
    });
    try{
        const savedUser = await user.save();
		res.send({user:savedUser._id});
    }catch(err){
        res.status(400).send({message:err})
    }
});
router.post('/login', async (req,res)=>{
    //validate
    console.log("login attempt");
    const {error} = loginValidation(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
    //checking if existing user
    console.log("searching user "+req.body.email);
    const user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send({message:"email or password invalid"});
    console.log("comparing pass");
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.status(400).send({message:"email or password invalid"});
    
    console.log(user.name+" logged in");
    //create token
    const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
    res.header('auth-token',token).cookie('auth-token',token,{ maxAge: 1000*60*60*24, httpOnly: true }).send({name:user.name,type:user.type});

    //return res.send('logged in');
});
router.post('/checkLogin', async (req,res)=>{
    let userToken;
    const token = req.header('auth-token') ? req.header('auth-token') : req.cookies['auth-token'];
    console.log("checkLogin");
    if(!token){
        console.log("no token found");
        return res.status(400).send('Access restricted');
    }
    try{
        userToken = jwt.verify(token,process.env.TOKEN_SECRET);
    }catch(error){
        console.log("token is not good");
        return res.status(400).send('Access restricted');
    }
    if(!userToken) {
        console.log("token doesn't good content");
        return res.status(400).send('Access restricted');
    }
    //checking if existing user
    const user = await User.findOne({_id:userToken._id})
    if(!user) {
        console.log("user not found");
        return res.status(400).send('Access restricted');
    }
    res.send({name:user.name,type:user.type});
});
router.post('/logoff', async (req,res)=>{
    const cookie = req.cookies['auth-token'];
    if(cookie){
        return res.cookie('auth-token','',{ maxAge: 0, httpOnly: true }).send("logged off");
    }else{
        return res.send("isn't logged in");
    }
});

module.exports = router;