(function(window, undefined){
	
	// CODE HERE
	
	// define API for Jello
	window.Particle = Particle;
	window.ParticleCannon = ParticleCannon;
	window.PointMass = PointMass;
	window.QuadTree = QuadTree;
	window.Queue = Queue;
	window.SingleIntersection = SingleIntersection;
	window.RayIntersectionObject = RayIntersectionObject;
	window.Ray = Ray;
	window.SpringBuilder = SpringBuilder;
	window.Vector2 = Vector2;
	window.VectorTools = VectorTools;
	window.World = World;
	window.DistanceJoint = DistanceJoint;
	window.InterpolationJoint = InterpolationJoint;
	window.PinJoint = PinJoint;

	window.Jello = {
		//AABB: AABB,
		//BitMask: Bitmask,
		Body: Body,
		SpringBody: SpringBody,
		PressureBody: PressureBody,
		//BodyCollisionInfo: BodyCollisionInfo,
		ClosedShape: ClosedShape,
		//Contact: Contact,
		//ContactManager: ContactManager,
		InternalSpring: InternalSpring,
		CollisionCallback: CollisionCallback,
		Material: Material,
		
		BodyBluePrint: BodyBluePrint,
		BodyFactory: BodyFactory
	};
})(window);