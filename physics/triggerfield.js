var TriggerField = function(world, aabb) {
	this.aabb = aabb;
	world.addTriggerField(this);
};

TriggerField.prototype.update = function() {
	Scarlet.log("update");
};

TriggerField.prototype.debugDraw = function(debugDraw) {
	this.aabb.debugDraw(debugDraw);
};
