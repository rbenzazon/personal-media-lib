const mongoose = require('mongoose');
const fileListSchema = new mongoose.Schema({
	name:{
		type:String,
		required:false,
		min:2,
		max:150,
	},
	owner:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	files:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'File' 
	}]
});

module.exports = mongoose.model('FileList',fileListSchema);