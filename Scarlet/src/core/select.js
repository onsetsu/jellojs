/**
 * Select.
 * 
 */
			/******************
			live update of selections!
			enter update exit! with callbacks
			************/
Scarlet = Scarlet || {};

(function(window, Scarlet) {
	Scarlet.LivingSelection = Scarlet.Object.subclass(function(from, elements) {
		this.from = from;
		this.elements = elements;
		var that = this;
		// mimic elements interface
		for(var i = 0; i < elements.length; i++) {
			var element = elements[i];
			for(var propertyKey in element) {
				if(element.hasOwnProperty(propertyKey)) {
					//if(typeof element[propertyKey] === "function") {
						that[propertyKey] = function() {
							for(var j = 0; j < that.elements.length; j++) {
								element[propertyKey].apply(element, arguments);
							};
						};
						/*} else {
							that[propertyKey] = function() {
								
							};
						};*/
				};
			};
		};
	}).addMethod("length", function() {
		return this.elements.length;
	}).addMethod("each", function(callback) {
		for(var i = 0; i < this.elements.length; i++) {
			callback(this.elements[i], i);
		};
	});
	
	Scarlet.select = function(descriptor, from)
	{
		from = from || Scarlet;
		
		// visitWhile
		// Iterate an object graph collecting all elements with positive check callback.
		var visit = function(startNode, callback) {
			// Cache already visited nodes to avoid cycles.
			var visitedNodes = [];
			
			// selectedNodes that pass the test.
			var selectedNodes = [];
			
			// Debug counter
			var counter = 0;
			
			// Next elements to examine.
			var toGo = [startNode];
			
			// As long as there are unvisited elements.
			while(toGo.length > 0) {
				try {
					while(toGo.length > 0) {
				
						// Test counter
						if(counter++ % 1000 === 0)
							Scarlet.log(counter);
							
						// Fetch first element
						var element = toGo.shift();
		
						// Visit all child nodes
						for(var propertyKey in element) {
							if(element.hasOwnProperty(propertyKey)) {
								// Only exermine if not already visited.
								if(-1 === visitedNodes.indexOf(element[propertyKey])) {
									// Add to visited nodes.
									visitedNodes.push(element[propertyKey]);
									
									// Add to nodes to examine.
									toGo.push(element[propertyKey]);
								};
							};
						}
						
						// Insert elements that pass the test.
						if(callback(element))
							selectedNodes.push(element);
					}
				} catch(e) {}
			}
			
			return selectedNodes;
		};
		
		var items = visit(from, descriptor);
		return new Scarlet.LivingSelection(from, items);
	};
})(window, window.Scarlet);