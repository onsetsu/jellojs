/**
 * Extend Scarlet library with an asynchronous module system.
 * 
 */
// TODO: refactoring
// TODO: move Code to async...module.js
Scarlet.Module = (function() {
	// -------------------------------------
	// module dispatcher & dependency solver
	// -------------------------------------
	var moduleDispatcher = (function(){
		var invokedModules = [];
		var modulesToInvoke = [];

		// wrapper for the require method
		function require(libraryName) {
			// TODO: replace . with /
			Scarlet.include(libraryName);
		};
		
		function includeDependencies(moduleNameList) {
			for (i in moduleNameList) {
				require(moduleNameList[i]);
			};
		};
		
		function checkForSolvedDependencies() {
			var resolvedModuleIndex = undefined;
			for (moduleIndex in  modulesToInvoke) {
				var allIncluded = true;
				for (dependency in  modulesToInvoke[moduleIndex].dependencies) {
					// checks if a dependency is in invokedModules
					if(-1 ==  invokedModules.indexOf( modulesToInvoke[moduleIndex].dependencies[dependency])) {
						allIncluded = false;
					};
				};
				if(allIncluded) {
					resolvedModuleIndex = moduleIndex;
				};
			};
			
			if(typeof resolvedModuleIndex !== "undefined") {
				var resolvedModule =  modulesToInvoke[resolvedModuleIndex].module;
				 invokedModules.push(resolvedModule.moduleName);
				// cut the module from list
				 modulesToInvoke.splice(resolvedModuleIndex, 1);
				return resolvedModule;
			};
			return undefined;
		};
		
		// adds a module and try to solve dependency issues
		function addModuleToInvoke(moduleToInvoke) {
			// add given module to not invoked modules
			 modulesToInvoke.push(
				{
					"module": moduleToInvoke,
					"dependencies": moduleToInvoke.requiredModules
				}
			);
			
			// take and run modules as long as their dependencies are solved
			var resolvedModule = checkForSolvedDependencies();
			while(typeof resolvedModule !== "undefined") {
				// run module function
				runModule(resolvedModule);
				resolvedModule = checkForSolvedDependencies();
			};
		};
		
		// run module with resolved dependencies
		function runModule(resolvedModule) {
			(function(){
				var moduleInvokationContext = {
					"module": Scarlet.namespace(resolvedModule.moduleName)
					/* TODO: add more variables,
					   like dependent modules
					*/
				};
				resolvedModule.functionToRun.apply(moduleInvokationContext, []);
			})();
		};
		
		// return public API with given methods
		return {
			addModuleToInvoke: addModuleToInvoke,
			includeDependencies: includeDependencies
		};
	})();
	
	// -----------------------------------
	// define wrapper class for module API
	// -----------------------------------
	
	var DependencyCollector = function(moduleName) {
		//Scarlet.log("new DependencyCollector() called with", arguments);
		this.moduleName = moduleName;
	};

	DependencyCollector.prototype.require = function() {
		//Scarlet.log("require called with", arguments);
		this.requiredModules = arguments;
		return this;
	};

	DependencyCollector.prototype.run = function(functionToRun) {
		//Scarlet.log("run called with", arguments);
		this.functionToRun = functionToRun;
		moduleDispatcher.addModuleToInvoke(this);
		moduleDispatcher.includeDependencies(this.requiredModules);
	};

	// --------------------------
	// return module function API
	// --------------------------
	
	// forward module creation to DependencyCollector
	return function(moduleNamespace) {
		//Scarlet.log("Scarlet.Module called");
		return new DependencyCollector(moduleNamespace);
	};
})();