/**
 * Scarlet.using().run() provides a way to shorten deeply nested namespaces
 * as well as decrease lookUp time.
 * 
 */
// TODO: "this" should refer to the original this in which context using was called
// TODO: usingNamespace

Scarlet.using = function(/* list of arguments */) {
	var args = arguments;
	return {
		run: function(innerFunction) {
			return innerFunction.apply(args[0],args);
		}
	};
};