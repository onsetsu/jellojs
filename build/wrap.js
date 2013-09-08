(function(window, undefined){
	
	// CODE HERE
	
	// define API for Jello
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
		ParticleCannon: ParticleCannon,
		Ray: Ray,
		Vector2: Vector2,
		VectorTools: VectorTools,
		
		BodyBluePrint: BodyBluePrint,
		BodyFactory: BodyFactory
	};
})(window);