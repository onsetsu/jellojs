window.onload = function() {
	// prepare stats
	var stats = new Stats();
	document.body.insertBefore(stats.domElement, document.body.firstChild);

	var world = initWorld();
	var debugDraw = new DebugDraw(world);
	
	var counter = 0;
	
	function update() {
	    requestAnimationFrame(update);

	    stats.update();
		world.update(1/60/3);
		world.update(1/60/3);
		world.update(1/60/3);
		debugDraw.draw();
	};
	
	update();
};

var initWorld = function() {
	var Utils = {
		"fillArray": function(value, length) {
			arr = [];
			for(var i = 0; i < length; i++)
				arr.push(value);
			return arr;
		}
	};

	var world = new Jello.World();

	// GROUND SHAPE
	var groundShape = new Jello.ClosedShape()
		.begin()
		.addVertex(new Jello.Vector2(-1,  1))
		.addVertex(new Jello.Vector2( 1,  1))
		.addVertex(new Jello.Vector2( 1, -1))
		.addVertex(new Jello.Vector2(-1, -1))
		.finish();
	
	var groundBody = new Jello.Body(
		world,
		groundShape,
		Utils.fillArray(0/*Number.POSITIVE_INFINITY*/, groundShape.getVertices().length),
		new Jello.Vector2(0, -15), // translate
		0, // rotate
		new Jello.Vector2(18, 3), // scale
		false
	);
	groundBody.aName = "ground";
	
	// BODIES

	var shape = new Jello.ClosedShape()
		.begin()
		.addVertex(new Jello.Vector2(-1, -1))
		.addVertex(new Jello.Vector2(-1,  1))
		.addVertex(new Jello.Vector2( 1,  1))
		.addVertex(new Jello.Vector2( 1, -1))
		.finish();
	
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 4; j++) {
			var body = new Jello.SpringBody(
				world,
				shape,
				1, // mass per point
				new Jello.Vector2(2*i, 2*j), // translate
				0, // rotate
				Jello.Vector2.One.copy().mulFloat(1.0), // scale
				false,
				
				// new:
				300.0, // float edgeSpringK,
				5.0, // float edgeSpringDamp,
				150.0, // float shapeSpringK,
				5.0 // float shapeSpringDamp,
			);
			body.aName = "Jelly";
							
			body.addInternalSpring(0, 2, 300, 10);
			body.addInternalSpring(1, 3, 300, 10);
		}
	};
	
	// preasure balls:
	
	var ball = new Jello.ClosedShape();
	ball.begin();
	for (var i = 0; i < 360; i += 20) {
		ball.addVertex(
			new Jello.Vector2(
				Math.cos(-i * (Math.PI / 180)),
				Math.sin(-i * (Math.PI / 180))
			)
		);
	}
	ball.finish();
	
	for (x = 10; x <= 10; x+=5) {
		for (y = 0; y <= 0; y+=8) {
			var pb = new Jello.PressureBody(
				world,
				ball,
				1.0,
				new Jello.Vector2(x, y),
				0,
				Jello.Vector2.One.copy().mulFloat(2.0),
				false,
				300.0,
				20.0,
				10.0,
				1.0,

				40.0 // gas pressure
			);
		}
	}

	// I:
	
	var shape = new Jello.ClosedShape()
		.begin()
		.addVertex(new Jello.Vector2(-1.5, 2.0))
		.addVertex(new Jello.Vector2(-0.5, 2.0))
		.addVertex(new Jello.Vector2(0.5, 2.0))
		.addVertex(new Jello.Vector2(1.5, 2.0))
		.addVertex(new Jello.Vector2(1.5, 1.0))
		.addVertex(new Jello.Vector2(0.5, 1.0))
		.addVertex(new Jello.Vector2(0.5, -1.0))
		.addVertex(new Jello.Vector2(1.5, -1.0))
		.addVertex(new Jello.Vector2(1.5, -2.0))
		.addVertex(new Jello.Vector2(0.5, -2.0))
		.addVertex(new Jello.Vector2(-0.5, -2.0))
		.addVertex(new Jello.Vector2(-1.5, -2.0))
		.addVertex(new Jello.Vector2(-1.5, -1.0))
		.addVertex(new Jello.Vector2(-0.5, -1.0))
		.addVertex(new Jello.Vector2(-0.5, 1.0))
		.addVertex(new Jello.Vector2(-1.5, 1.0))
		.finish();
	
	for (i = -5; i <= 25; i+=15) {

		var body = new Jello.SpringBody(
			world,
			shape,
			1,
			new Jello.Vector2(-8, i),
			0.0,
			Jello.Vector2.One.copy().mulFloat(2),
			false,
			150.0,
			5.0,
			300.0,
			15.0
		);

		body.addInternalSpring(0, 14, 300.0, 10.0);
		body.addInternalSpring(1, 14, 300.0, 10.0);
		body.addInternalSpring(1, 15, 300.0, 10.0);
		body.addInternalSpring(1, 5, 300.0, 10.0);
		body.addInternalSpring(2, 14, 300.0, 10.0);
		body.addInternalSpring(2, 5, 300.0, 10.0);
		body.addInternalSpring(1, 5, 300.0, 10.0);
		body.addInternalSpring(14, 5, 300.0, 10.0);
		body.addInternalSpring(2, 4, 300.0, 10.0);
		body.addInternalSpring(3, 5, 300.0, 10.0);
		body.addInternalSpring(14, 6, 300.0, 10.0);
		body.addInternalSpring(5, 13, 300.0, 10.0);
		body.addInternalSpring(13, 6, 300.0, 10.0);
		body.addInternalSpring(12, 10, 300.0, 10.0);
		body.addInternalSpring(13, 11, 300.0, 10.0);
		body.addInternalSpring(13, 10, 300.0, 10.0);
		body.addInternalSpring(13, 9, 300.0, 10.0);
		body.addInternalSpring(6, 10, 300.0, 10.0);
		body.addInternalSpring(6, 9, 300.0, 10.0);
		body.addInternalSpring(6, 8, 300.0, 10.0);
		body.addInternalSpring(7, 9, 300.0, 10.0);
	}
		
	return world;
};

