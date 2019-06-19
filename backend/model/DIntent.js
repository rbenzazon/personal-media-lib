const mongoose = require('mongoose');
const dIntentSchema = new mongoose.Schema({
	magnet:{
		type:String,
		required:true,
		min:70,
		max:512,
	},
	title:{
		type:String,
		required:true,
		min:5,
		max:255,
	},
	path:{
		type:String,
		required:true,
		min:3,
		max:256,
	},
	owner:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required:true,
	},
	added:{
		type: Date,
		required:false,
		default: Date.now,
	},
	completed:{
		type: Date,
		required:false,
	},
	progress:{
		type:Number,
		default:0,
		required:false,
		min:0,
		max:100,
	},
	ariaId:{
		type:String,
		required:false,
		min:5,
		max:12,
	},
	bytesLoaded:{
		type:String,
		required:true,
		min:2,
		max:12,
	},
	bytesTotal:{
		type:String,
		required:true,
		min:2,
		max:12,
	},
	connections:{
		type:Number,
		default:0,
		required:false,
		min:0,
	},
	seeders:{
		type:Number,
		default:0,
		required:false,
		min:0,
	},
	speed:{
		type:String,
		required:true,
		min:2,
		max:20,
	},
});

module.exports = mongoose.model('DIntent',dIntentSchema);