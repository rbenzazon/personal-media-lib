const router = require("express").Router();
const User = require('./model/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Joi = require("@hapi/joi");
const {registerValidation,loginValidation} = require('./validation');
const verify = require('./verifyToken');

router.post('/register',verify, async (req,res)=>{
    
    //validate
    const {error} = registerValidation(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
    //checking if existing user
    const emailExist = await User.findOne({email:req.body.email});
    if(emailExist) return res.status(400).send("email already exist");

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
        res.status(400).send(err)
    }
});
router.post('/login', async (req,res)=>{
    //validate
    const {error} = loginValidation(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
    //checking if existing user
    const user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send({message:"email or password invalid"});

    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.status(400).send({message:"email or password invalid"});
    
    //create token
    const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
    res.header('auth-token',token).cookie('auth-token',token,{ maxAge: 1000*60*60*24, httpOnly: true }).send({name:user.name});

    //return res.send('logged in');
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