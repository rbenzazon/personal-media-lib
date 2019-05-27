const mongoose = require('mongoose');
const nodeSchema = new mongoose.Schema({
	file:{
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'File' 
	},
	children:[{
		type: mongoose.Schema.Types.ObjectId,
		required: false,
		ref: 'Node' 
	}]
});
const autoPopulate = function(next) {
	this.populate('children');
	this.populate('file');
	next();
};

nodeSchema
.pre('findOne', autoPopulate)
.pre('find', autoPopulate);

module.exports = mongoose.model('Node',nodeSchema);