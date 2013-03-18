/**
 * Extend Scarlet with a currying mechanism
 * to create easier, more fluent APIs.
 * 
 */
 
// TODO: implement API creator
(function(Scarlet, undefined){
	// --------
	// Currying
	// --------
	//Scarlet.log("Currying");

	// CurryAPI represents a fluent wrapper for complex function calls.
	Scarlet.CurryAPI = Scarlet.Object.subclass(function() {
		this._arguments = [];
	});
	
	// CurryCollector receives an API specification and returns a fluent CurryAPI.
	Scarlet.CurryCollector = Scarlet.Object.subclass(function() {
		this.api = new Scarlet.CurryAPI();
		this.currentIndex = 0;
	});

	Scarlet.CurryCollector.prototype.mandatory = function(functionName) {
		(function(api, funcName, index) {
			api[funcName] = function(arg) {
				this._arguments[index] = arg;
				return this;
			};
		})(this.api, functionName, this.currentIndex);
		this.currentIndex++;
		return this;
	};

	Scarlet.CurryCollector.prototype.trigger = function(triggerFunction) {
		this.api[triggerFunction] = function() {
			return this.callback.execute.apply(this, this._arguments);
		};
		return this;
	};
	
	Scarlet.CurryCollector.prototype.callback = function(callback) {
		this.api.callback = callback;
		return this;
	};

	Scarlet.CurryCollector.prototype.getAPI = function(functionName) {
		return this.api;
	};

	// Grant access to currying functionality.
	Scarlet.Currying = function()
	{
		return new Scarlet.CurryCollector();
	};

})(Scarlet);
