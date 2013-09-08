Bloob.BodyFactory = function() {};

Bloob.BodyFactory.createBluePrint = function(targetClass) {
	return new BodyBluePrint(targetClass);
};
