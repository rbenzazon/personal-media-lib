const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
	name:{
		type:String,
		required:true,
		min:4,
		max:255,
	},
	email:{
		type:String,
		required:true,
		min:6,
		max:255,
	},
	password:{
		type:String,
		required:true,
		min:6,
		max:1024,
	},
	type:{
		type:Number,
		default:1,
		required:false,
		min:0,
		max:1,
	},
	created:{
		type:Date,
		default:Date.now,
	}
});

module.exports = mongoose.model('User',userSchema);