/**
 * Extend Scarlet library with a convinient way to
 * integrate different JavaScript libraries without
 * polluting namespaces.
 * 
 */
(function(Scarlet, undefined){

Scarlet.from = (function() {
	//-------------------------------------------------
	// Namespace gemeshe
	//-------------------------------------------------
	// TODO: refactor into one single parametrized namespace function
	
	// returns object at given namespace
	var atStartingByGet = function(namespaceString, context)
	{
		var namespaceParts = namespaceString.split('.');
		var currentRoot = context;
		var currentPart;
		
		for(var index = 0; index < namespaceParts.length; index++)
		{		
			// This is the next element in the namespace hierarchy.
			currentPart = namespaceParts[index]; 
			// Add a new map for the currentPart to the root (if it does not exist yet). 
			currentRoot[currentPart] = currentRoot[currentPart] || {};
			// The currentPart will be the new root in the next loop.
			currentRoot = currentRoot[currentPart];
		}
		
		return currentRoot;
	};
	
	// insert given object at specific namespace
	var atStartingByPut = function(namespaceString, context, put)
	{
		var namespaceParts = namespaceString.split('.');
		var lastNamespacePart = namespaceParts.pop();
		var currentRoot = context;
		var currentPart;
		
		for(var index = 0; index < namespaceParts.length; index++)
		{		
			// This is the next element in the namespace hierarchy.
			currentPart = namespaceParts[index]; 
			// Add a new map for the currentPart to the root (if it does not exist yet). 
			currentRoot[currentPart] = currentRoot[currentPart] || {};
			// The currentPart will be the new root in the next loop.
			currentRoot = currentRoot[currentPart];
		}
		
		currentRoot[lastNamespacePart] = put;
		
		return currentRoot[lastNamespacePart];
	};
	
	var importsToLoad = [];
	
	//-------------------------------------------------
	// Import loader
	//-------------------------------------------------
	Scarlet.acceptIFrameLib = function acceptIFrameLib(index, iFrameWindow) {
		Scarlet.log("lib at " + index + " loaded");
		var imports = importsToLoad[index];
		
		// hook into iFrame
		var importAsList = imports.imports;
		for(var i = 0; i < importAsList.length; i++) {
			var importAs = importAsList[i];
			var temp = atStartingByGet(importAs.import, iFrameWindow);
			atStartingByPut(importAs.as, window, temp);
		};
		
		// execute callback (all dependencies are load now)
		imports.onload();
	};
	
	Scarlet.integrate = function integrate(imports) {
	
		var oneImport = imports[0];
		var uniqueIndex = importsToLoad.length;
		importsToLoad.push(oneImport);
		
		var iframe = document.createElement('iframe');
		var content = '<!DOCTYPE html>'
			+ '<head>'
				+ '<title>Dynamic iframe</title>'
			+ '</head>'
			+ '<body>'
				+ '<p>'
					+ 'Hallo iFrame'
				+ '</p>';
		
		// only take one from for now
		// TODO: synchronize later
		for(var i = 0; i < oneImport.libraries.length; i++) {
			var libraryPath = oneImport.libraries[i];
			// TODO: refer to lib relatively to scarlet.js
			content += '<script type="text/javascript" src="' + libraryPath + '"><\/script>';
		};
		content += '<script type="text/javascript">'
					+ 'parent.Scarlet.acceptIFrameLib(' + uniqueIndex + ', window);'
				+ '<\/script>'
			+ '</body>'
		+ '</html>';

		document.body.appendChild(iframe);

		iframe.contentWindow.document.open('text/html', 'replace');
		iframe.contentWindow.document.write(content);
		iframe.contentWindow.document.close();
	};
	
	//-------------------------------------------------
	// Collector API
	//-------------------------------------------------
	var ImportCollector = function() {
		var imports = [];
		var currentImport;
		var reset = function reset() {
			imports = [];
		};
		
		// set non conflicting libraries
		this.from = function from(/* list of library files */) {
			imports.push({
				libraries: arguments,
				imports: []
			});
			return this;
		};
		
		this.import = function import_(importString) {
			currentImport = importString;
			return this;
		};
		
		this.as = function as(asString) {
			imports[imports.length - 1].imports.push({
				"import": currentImport,
				"as": asString
			});
			return this;
		};
		
		this.onload = function onload(onloadFunction) {
			imports[imports.length - 1].onload = onloadFunction;
			Scarlet.integrate(imports);
			reset();
			return this;
		};
	};
	
	// define API for module integration
	return function(/* list of library files */) {
		var collector = new ImportCollector();
		return collector.from.apply(collector, arguments);
	};
	
})();

})(Scarlet);