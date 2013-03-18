/**
 * Extend Scarlet with a Qt-like signal and slot mechanism.
 * API is designed to provide chainability.
 * 
 */
(function(Scarlet, undefined){
	// TODO: suppress all signals
	
	// ------
	// Signal
	// ------
	Scarlet.Signal = Scarlet.Object.subclass(function()
	{
		var slots = [];
		
		// Call all connected slots with given arguments.
		this.emit = function()
		{
			// save slot, if they would be disconnected during execution
			var tempSlots = [];
			for (var index in slots)
			{
				tempSlots.push(slots[index]);
			}
			
			for(var index in tempSlots) {
				try {
					tempSlots[index].execute.apply(tempSlots[index], arguments);
				} catch (e) {}
			}
			return this;
		};

		// Connect given slots if they are not already connected.
		this.connect = function()
		{
			for (slotIndex in arguments)
			{
				var slot = arguments[slotIndex];
				if (slots.indexOf(slot) === -1)
				{
					slots.push(slot);
				}
			}
			return this;
		};

		// Disconnect given slots if they are connected.
		this.disconnect = function()
		{
			for (slotIndex in arguments)
			{
				var slot = arguments[slotIndex];
				var index = slots.indexOf(slot);
				if(index !== -1)
				{
					slots.splice(index, 1);
				}
			}
			return this;
		};

		// Disconnect all connected slots.
		this.disconnectAll = function()
		{
			slots = [];
			return this;
		};
	});

	// ----
	// Slot
	// ----
	// TODO: add filter function
	Scarlet.Slot = Scarlet.Object.subclass(function(slotContext, slotMethod)
	{
		var callback = new Scarlet.Callback(slotContext, slotMethod);
		this.execute = function()
		{
			callback.execute.apply(this.callback, arguments);
		};
	});

})(Scarlet);
