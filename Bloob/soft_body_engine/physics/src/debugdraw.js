var DEBUG = function() {
	Scarlet.log.apply(Scarlet, arguments);
};
printf = DEBUG;

var DebugDraw = function(world, options) {
	options = options || {};
	options.canvasId = options.canvasId || "bloobCanvas";
	options.canvasHeight = options.canvasHeight || 500;
	options.canvasWidth = options.canvaswidth || 500;
	options.backgroundColor = options.backgroundColor || "black";
	
	$("<canvas id='" + options.canvasId + "' width='" + options.canvasWidth + "' height='" + options.canvasHeight + "'></canvas>")
		.appendTo($("body"))
		.css("background-color", options.backgroundColor);

	this.canvas = document.getElementById(options.canvasId);
	this.context = this.canvas.getContext('2d');

	this.setColor();
	this.setLineWidth();
	
	this.scaleX = d3.scale.linear()
		.domain([world.mWorldLimits.Min.x, world.mWorldLimits.Max.x])
		.range([0, options.canvasWidth]);
	this.scaleY = d3.scale.linear()
		.domain([world.mWorldLimits.Min.y, world.mWorldLimits.Max.y])
		.range([options.canvasHeight, 0]);
	this.world = world;
};

DebugDraw.prototype.draw = function() {
	// clear canvas
	this.context.clearRect(
		0,
		0, 
		this.canvas.width,
		this.canvas.height
	);
	
	// drawBodies
	for(var i = 0; i < this.world.mBodies.length; i++) {
		this.drawBody(this.world.mBodies[i]);
	};
	
	// drawCollisionList
	this.drawCollisionList(this.world.mCollisionList);
};

/*
 * Body drawing
 */
DebugDraw.prototype.drawBody = function(body) {
	this.drawAABB(body.mAABB);
	//this.drawBaseShape(body.mBaseShape);
	this.drawGlobalShape(body.mGlobalShape);
	this.drawPointMasses(body.pointMasses);
	this.drawMiddlePoint(body);
};

DebugDraw.prototype.drawAABB = function(vAABB) {
	this.context.beginPath();
	this.drawPolyline([
		vAABB.Min,
		new Vector2(vAABB.Min.x, vAABB.Max.y),
		vAABB.Max,
		new Vector2(vAABB.Max.x, vAABB.Min.y),
		vAABB.Min
	]);
	this.context.lineWidth = 1;
	this.context.strokeStyle = 'red';
	this.context.stroke();
};

DebugDraw.prototype.drawBaseShape = function(vList) {
	vList = vList.mLocalVertices;
	this.setColor("gray", 1.0);
	this.setLineWidth(1);

	this.context.beginPath();
	
	// draw a polyline
	this.drawPolyline(vList);

	this.context.globalAlpha = this.opacity;
	this.context.strokeStyle = this.color;
	this.context.stroke();
	
	this.context.closePath();
};

DebugDraw.prototype.drawGlobalShape = function(vList) {
	this.setColor("gray", 0.5);
	this.setLineWidth(1);

	this.context.beginPath();
	
	// draw a polyline
	this.drawPolyline(vList);

	this.context.globalAlpha = this.opacity;
	this.context.strokeStyle = this.color;
	this.context.stroke();
	
	this.context.closePath();
};

DebugDraw.prototype.drawPointMasses = function(pMasses) {
	this.setColor("white", 1.0);
	this.setLineWidth(1);

	this.context.beginPath();
	
	// draw a polyline
	this.drawPolyline($.map(pMasses, function(pMass) {return pMass.Position; }));

	this.context.globalAlpha = this.opacity;
	this.context.strokeStyle = this.color;
	this.context.stroke();
	
	this.context.closePath();

	this.context.fillStyle = this.color;
	var size = 1;
	for(var i = 0; i <  pMasses.length; i++)
		this.drawRectangle(pMasses[i].Position, size++);
};


DebugDraw.prototype.drawMiddlePoint = function(body) {
};

/*
 * Draw Collisions
 */
DebugDraw.prototype.drawCollisionList = function(list) {
	for(var i = 0; i < list.length; i++) {
		this.drawCollision(list[i]);
	};
};

DebugDraw.prototype.drawCollision = function(collisionInfo) {
	this.setColor("lightgreen", 1.0);
	this.setLineWidth(1);

	this.context.beginPath();

	var hitPoint = collisionInfo.hitPt;
	var penetrationTill = collisionInfo.bodyA.pointMasses[collisionInfo.bodyApm].Position
	
	this.drawPlus(hitPoint);
	this.drawPolyline([hitPoint, penetrationTill])
	this.drawPlus(penetrationTill);

	this.context.globalAlpha = this.opacity;
	this.context.strokeStyle = this.color;
	this.context.stroke();
	
	this.context.closePath();
};

/*
 * Graphical primitives
 */
DebugDraw.prototype.drawRectangle = function(vec, size) {
	size = size || 2;
	this.context.fillStyle = this.color;
	this.context.fillRect(
		this.scaleX(vec.x) - size / 2,
		this.scaleY(vec.y) - size / 2,
		size,
		size
	);
};

DebugDraw.prototype.drawPolyline = function(vList) {
	// draw a polyline
	this.context.moveTo(
		this.scaleX(vList[0].x),
		this.scaleY(vList[0].y)
	);
	for(var i = 1; i < vList.length; i++)
		this.context.lineTo(
			this.scaleX(vList[i].x),
			this.scaleY(vList[i].y)
		);
	this.context.lineTo(
		this.scaleX(vList[0].x),
		this.scaleY(vList[0].y)
	);
};

DebugDraw.prototype.drawPlus = function(point, size) {
	size = size || 3
	
	// draw a polyline
	this.context.moveTo(
		this.scaleX(point.x) - size,
		this.scaleY(point.y)
	);
	this.context.lineTo(
		this.scaleX(point.x) + size,
		this.scaleY(point.y)
	);
	this.context.moveTo(
		this.scaleX(point.x),
		this.scaleY(point.y) - size
	);
	this.context.lineTo(
		this.scaleX(point.x),
		this.scaleY(point.y) + size
	);
};

/*
 * Configure Drawing
 */
DebugDraw.prototype.setColor = function(color, opacity) {
	this.color = color || this.opacity || "white";
	this.opacity = opacity || this.opacity || 1.0;
};

DebugDraw.prototype.setLineWidth = function(lineWidth) {
	this.lineWidth = lineWidth || this.lineWidth || 1;
};


