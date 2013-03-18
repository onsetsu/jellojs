/**
 * Allows to create nested namespaces.
 * 
 */
if (typeof Scarlet === "undefined") {
	Scarlet = {};
}

// TODO: Enhance Namespace Function with options like context and put from core/integration/integration.
Scarlet.namespace = function(namespaceString)
{
	var namespaceParts = namespaceString.split('.');
	var currentRoot = Scarlet;
	var currentPart;
	
	// Skip "window" and "Scarlet", if they were the first namespaceParts
	if ("window" == namespaceParts[0])
	{
		namespaceParts.shift();
	}
	if ("Scarlet" == namespaceParts[0])
	{
		namespaceParts.shift();
	}
	
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