const mongoose = require('mongoose');
const contextService = require('request-context');
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
/*
nodeSchema.static('findOnePopulate', function (options) {
	console.log(1+options);
	return Node.findOne(options).exec();
});
nodeSchema.static('findPopulate', function (options) {
	console.log(2+options);
	return Node.find(options).exec();
});*/
const autoPopulate = function(next) {

	console.log(3);
	this.recursive = contextService.get('request:recursive');
	//console.log(1+" "+this.recursive);
	//if(this.recursive)
	{
		//this.populate('children');
		this.populate('file');
	}
	next();
	
};
const autoPopulate2 = function(next) {

	//console.log(2+" "+this.recursive);
	
	//if(this.recursive)
	{
		//this.populate('children');
		this.populate('file');
	}
	next();
};

nodeSchema.pre('find', autoPopulate2);
//nodeSchema.pre('findOnePopulate',autoPopulate);

module.exports = mongoose.model('Node',nodeSchema);