
var Element = function(id, type){
	this.id = id;
	this.type = type;
	this.name = "";
	this.inComing = null;
	this.outGoing = null;
	this.previous = null;
	this.next = null;
}



Element.prototype.toString = function(){
	return "Element: " + this.type + " - [" + this.id + "]\n";
}


module.exports = Element;