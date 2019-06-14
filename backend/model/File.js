const mongoose = require('mongoose');
const FileList = require('./FileList');
const fileSchema = new mongoose.Schema({
	title:{
		type:String,
		required:false,
		min:4,
		max:100,
	},
	url:{
		type:String,
		required:false,
		min:4,
		max:150,
	},
	imageUrl:{
		type:String,
		required:false,
		min:7,
		max:150,
	},
	artist:{
		type:String,
		required:false,
		min:2,
		max:150,
	},
	album:{
		type:String,
		required:false,
		min:2,
		max:150,
	},
	genre:{
		type:String,
		required:false,
		min:2,
		max:150,
	},
	composer:{
		type:String,
		required:false,
		min:2,
		max:150,
	},
	publisher:{
		type:String,
		required:false,
		min:2,
		max:150,
	},
	track:{
		type:Number,
		required:false,
		min:1,
		max:4,
	},
	year:{
		type:Number,
		required:false,
		min:4,
		max:4,
	},
	created:{
		type:Date,
		default:Date.now,
	},
	node:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Node' 
	},
});

fileSchema.pre('findOneAndDelete', async function() {
	//var FileList = this.model('fileLists');/*
	try{
        await FileList.updateMany({}, { $pullAll: {"files": [this._id]}}).exec();
    }catch(err){
        console.log("error trying to remove file from fileLists files array err="+err);
    }
});

module.exports = mongoose.model('File',fileSchema);