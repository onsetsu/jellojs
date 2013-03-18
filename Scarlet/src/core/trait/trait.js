/**
 * Extend Scarlet with a convenient function to create stateless traits.
 * These traits can enhance objects or other traits.
 * Traits should be imported exposed or hidden.
 * Traits could be generated from objects.
 * 
 */
(function(Scarlet, undefined){

	Scarlet.Trait = function(methodObject)
	{
		// Iterate over all properties of the given object.
		var newProperties = Object.getOwnPropertyNames(methodObject);
		this.properties = {};
		for (propertyIndex in newProperties) {
			var propertyName= newProperties[propertyIndex];
			var propertyDescriptor = Object.getOwnPropertyDescriptor(methodObject, propertyName);
			this.properties[propertyName] = propertyDescriptor;
		};
	};

	Scarlet.inheritsFrom(Scarlet.Trait, Scarlet.Object);

	Scarlet.Trait.prototype.applyTo = function(){

	};

	var getErrorFunction = function(functionName) {
		return function()
		{
			Scarlet.log("ERROR");
			// throw an error here
		};
	};
	
	var addPropertyFromTo = function(propertyName, from, to)
	{
		if(typeof to[propertyName] === "undefined")
		{
			to[propertyName] = from[propertyName];
		}
		else
		{
			to[propertyName] = getErrorFunction(propertyName);
		};
	};
	
	Scarlet.Trait = function(/*list of behaviour objects or traits*/)
	{
		// process all arguments
		for(indexOfTraitOrObject in arguments)
		{
			var traitOrObject = arguments[indexOfTraitOrObject];
			// process all properties of given trait or object
			for(propertyName in traitOrObject)
			{
				addPropertyFromTo(propertyName, traitOrObject, this);
			};
		};
	};
	
	Scarlet.inheritsFrom(Scarlet.Trait, Scarlet.Object);

	Scarlet.Trait.prototype.addPropertiesTo = function(object)
	{
		for(propertyName in this)
		{
			addPropertyFromTo(propertyName, this, object);
		};
	};
	
	Scarlet.Trait.prototype.applyTo = function(object){
		this.addPropertiesTo(object);
	};

})(Scarlet);