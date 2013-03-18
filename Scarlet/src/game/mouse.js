/**
 * Extend Scarlet with a Qt-like signal and slot mechanism.
 * API was adjusted to provide chainability.
 * 
 */
(function(Scarlet, undefined){
	Scarlet.Mouse = Scarlet.Object.subclass(function(domElementId) {
		var that = this;
		
		//helpers:
		//http://js-tut.aardon.de/js-tut/tutorial/position.html
		function getElementPosition(element) {
			var elem=element, tagname="", x=0, y=0;
			while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
				y += elem.offsetTop;
				x += elem.offsetLeft;
				tagname = elem.tagName.toUpperCase();

				if(tagname == "BODY")
					elem=0;

				if(typeof(elem) == "object") {
					if(typeof(elem.offsetParent) == "object")
						elem = elem.offsetParent;
				}
			}
			return {x: x, y: y};
		};
		
		this.set("canvasPosition", getElementPosition(document.getElementById(domElementId)));
		
		document.addEventListener("mousedown", function(e) {
            that.set("isMouseDown", true);
            handleMouseMove(e);
            document.addEventListener("mousemove", handleMouseMove, true);
         }, true);
         
         document.addEventListener("mouseup", function() {
            document.removeEventListener("mousemove", handleMouseMove, true);
            that.set("isMouseDown", false);
            that.set("x", undefined);
            that.set("y", undefined);
         }, true);

		 this.rightClickHandler = [];
		document.addEventListener('contextmenu', function(e) {
			for(var i = 0; i < that.rightClickHandler.length; i++) {
				that.rightClickHandler[i](e);
			}
		});

         function handleMouseMove(e) {
            that.set("x", (e.clientX - that.get("canvasPosition").x) / 30);
            that.set("y", (e.clientY - that.get("canvasPosition").y) / 30);
         };
	}).addMethod("onRightClick", function(callback) {
		this.rightClickHandler.push(callback);
	});
})(Scarlet);
