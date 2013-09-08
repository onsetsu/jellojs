(function(window, undefined){
	
	// CODE HERE
	
	// define API for Jello
	window.ContactManager = ContactManager;
	window.InternalSpring = InternalSpring;
	window.CollisionCallback = CollisionCallback;
	window.Material = Material;
	window.MaterialPair = MaterialPair;
	window.MaterialManager = MaterialManager;
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
		
		InternalSpring: InternalSpring,
		BodyBluePrint: BodyBluePrint,
		BodyFactory: BodyFactory,
		Material: Material
	};
})(window);