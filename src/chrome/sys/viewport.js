define(["dualless/utils/rect",
        "dualless/sys/os",
        "dualless/sys/toolbox",
        "dualless/utils/split"], 
		function sys(Rect,
                        os,
						toolbox,
						split) {
	
	/** Viewport controller
	 * 
	 * @constructor
	 * 
	 */
	
	function Viewport(options) {
		this._screen; // The detected screen size
		this._size; // The actual viewport size
		this._callbacks = $.Callbacks('memory');
		
  		this._os = os();

       this.reset();
	}
	
	/** Reset viewport to initialize status.
	 *
	 * @param scr The current screen object. It can not use window.screen for all case. The popup's window.screen can not provide correct information
	 */
	
	Viewport.prototype.reset = function(scr) {
	    if (scr == undefined){
	        scr = window.screen;
	    }
		var rect = new Rect({ top : scr.availTop,
			left : scr.availLeft,
			width : scr.availWidth,
			height : scr.availHeight	});
		this._screen = rect;
		this.setSize(rect);
	};
	
	/** Detect the current screen size, if it is changed. The viewport size will be set to the screen size automatically.
	 * 
	 * @param scr The current screen object. It can not use window.screen for all case. The popup's window.screen can not provide correct information   
	 */
	
	Viewport.prototype.detect = function(scr) {
	    if (scr == undefined)
	        scr = window.screen;
	    
		var rect = new Rect({top    : scr.availTop,
                			 left   : scr.availLeft,
                		  	 width  : scr.availWidth,
                			 height : scr.availHeight	});
                				
		if (!this._screen.equal(rect) ) {
			this._screen = rect;
			this.setSize(rect);
		}
	};
	
	/** Return TRUE if the viewport is already modified , which is different than screen size.
	 * 
	 */
	
	Viewport.prototype.isModified = function() {
		return !this._size.equal(this._screen);
	};
	
	/** Return TRUE if the viewport is detectable. The system can provide enough information
	 * to determine the viewport 
	 * 
	 */
	
	Viewport.prototype.isDetectable = function() {
	    var res = true;
	    
	    if (this._os == "Linux") {
	    	// The viewport detection from Ubuntu with Unity is known to fail.  
	        res = false;
	    }
	    
	    return res;
	};
	
	Viewport.prototype.size = function(){
		return this._size;
	};
	
	Viewport.prototype.setSize = function() {
		var newSize;
		if (arguments.length == 2) {
			newSize = arguments[0].unite(arguments[1]);
		} else if (arguments.length == 1){
			newSize = arguments[0];
		} else {
			throw "Viewport.setSize() - Invalid argument";
		}
		//console.log("Viewport.setSize()" , this._size , newSize);

		if (this._size == undefined || !newSize.equal(this._size) ){
			this._size = new Rect(newSize);
//			this._size = newSize;
			this._callbacks.fire(newSize);
		}
	};
	
	/** Calculate the viewport size based on two rectangles. The calculation is OS depended.
	 * 
	 * @param rect1
	 * @param rect2
	 */
	
	Viewport.prototype.calc = function(rect1,rect2) {
	    var newSize;
        newSize = rect1.unite(rect2);
//	    if (this._os == "MacOS") {
//	        newSize.height = newSize.height + newSize.top; 
//	    }
	    this.setSize(newSize);
	};
	
	/** Attach a handler to viewport's resize event
	 * @param callback
	 */
	
	Viewport.prototype.bind = function(callback) {
		this._callbacks.add(callback);
	};

	
	/** Deattach a handler from viewport's resize event
	 * @param callback
	 */

	Viewport.prototype.unbind = function(callback) {
		this._callbacks.remove(callback);
	};
	
	
	return Viewport;
});
