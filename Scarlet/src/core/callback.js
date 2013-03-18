/**
 * A callback holds a function and the context in which the given function should be executed.
 * 
 */
Scarlet.Callback = function(callbackContext, callbackFunction)
{
	this.callbackContext = callbackContext;
	this.callbackFunction = callbackFunction;
	
	var _this = this;
	
	this.execute = function(/* arguments */)
	{
		return _this.callbackFunction.apply(_this.callbackContext, arguments);
	};
};