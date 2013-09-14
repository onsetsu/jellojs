var TriggerField = function(world, aabb) {
	this.aabb = aabb;
	world.addTriggerField(this);
};

TriggerField.prototype.scale = function(scale) {
	this.store.scale = scale;
	return this;
};

TriggerField.prototype.debugDraw = function(debugDraw) {
	this.aabb.debugDraw(debugDraw);
};
