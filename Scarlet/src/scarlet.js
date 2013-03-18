/**
 * Scarlet library.
 * 
 */
window.Scarlet = (function scarlet() {
	var thisFileName = "scarlet.js";
	var source = (function getSource() {
		function endsWith(str, suffix) {
			return str.indexOf(suffix, str.length - suffix.length) !== -1;
		}
		function getElementByAttributeSuffix(tagName, attributeName, attributeValueSuffix) {
			var scriptTags = document.getElementsByTagName(tagName);
			for (var i = 0; i < scriptTags.length; i++)
			{
				if (scriptTags[i].hasAttribute(attributeName) && 
					endsWith(scriptTags[i].getAttribute(attributeName), attributeValueSuffix))
				{
					return scriptTags[i].getAttribute(attributeName);
				}
			}
			return undefined;			
		}

		var src = getElementByAttributeSuffix('script', "src", thisFileName);
		if(typeof src === "undefined") {
			throw thisFileName + " - file not found";
		} else {
			return src;
		};
	})();

	return {
		// TODO: Enable multiple arguments to include multiple
		include: function (libraryName) {
			// TODO: prevent multiple include of one module
			var jsName = source.replace(thisFileName, libraryName + ".js");
			try {
				//Scarlet.log("include", libraryName);
				// inserting via DOM fails in Safari 2.0, so brute force approach
				document.write('<script type="text/javascript" src="' + jsName + '"><\/script>');
			} catch (e) {
				// for xhtml+xml served content, fall back to DOM methods
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = jsName;
				document.getElementsByTagName('head')[0].appendChild(script);
			};
			
			return this;
		},

		log: function(){
			console.log.apply(console, arguments);
		}
	};
})();

// TODO: Only include core functionality
// dynamically add other functionality as modules
// TODO: Introduce core module (or no core module at all?)
// include core
Scarlet
	.include("core/namespace")
	.include("core/inheritance")
	.include("core/object")
	.include("core/mixin")
	.include("core/trait/trait")
	.include("core/asynchronousmodule")
	.include("core/integration/integration")
	.include("core/select")
	.include("core/callback")
	.include("core/signalslot");

// TODO: Move callback and signalslot to core
// include utility functions
Scarlet
	.include("utilities/using")
	.include("utilities/currying")
	.include("utilities/typechecker");

// include game
Scarlet
	.include("game/loop")
	.include("game/mouse");

// include d3js chart
//Scarlet.include("d3/bobbleview");

// include t3.js
//Scarlet.include("t3/t3");

// include physics.js
//Scarlet.include("physics/physics");

// include webgl
// Scarlet.include("webgl/webgl");