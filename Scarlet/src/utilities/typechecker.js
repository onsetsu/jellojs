/**
 * Extend Scarlet with a typechecker mechanism.
 * 
 */
(function(Scarlet, undefined){
	// ------------
	// TypeChecking
	// ------------

	/* WIP: not relyable yet */
	
	/*
	I'm surprised that there isn't an Object.hasPrototype proposal for ES6 that does exactly what your function does. It just seems a natural complement Object.create as instanceof is to new Constructor. It could even accept a function as the second argument, which would use the function's prototype as the target.
	*/

	var isString = function(description) {
		return toString.call(description) == '[object String]';
	};
	
	var checkString = function(object, description) {
		return typeof object === description;
	};
	
	var check = function(object, description) {
		// check string condition
		if(isString(description)) {
			return checkString(object, description);
		};
		// check prototype chain
		return description.isPrototypeOf(object);
	};
	
	// TypeChecker for given object.
	var TypeChecker = Scarlet.Object.subclass(function(object) {
		this._object = object;
		this._wasTrue = false;
	});
	
	TypeChecker.prototype.if = function(description, callback) {
		if(check(this._object, description)) {
			callback();
			this._wasTrue = true;
		};
		return this;
	};

	TypeChecker.prototype.elseif = function(description, callback) {
		// only check condition if not already true.
		if(this._wasTrue)
			return this;
		// do the check
		if(check(this._object, description)) {
			callback();
			this._wasTrue = true;
		};
		return this;
	};
	TypeChecker.prototype.elsif = TypeChecker.prototype.elseif;
	TypeChecker.prototype.elif = TypeChecker.prototype.elseif;

	TypeChecker.prototype.else = function(callback) {
		if(!this._wasTrue)
			callback();
		return this;
	};

	// Grant access to typechecking functionality.
	Scarlet.checkType = function(object)
	{
		return new TypeChecker(object);
	};
})(Scarlet);
