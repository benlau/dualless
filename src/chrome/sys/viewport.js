define(["dualless/util/rect",
        "dualless/sys/os",
        "dualless/sys/toolbox"], 
		function sys(Rect,
                        os,
						toolbox) {
	
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
	
	/** Given a split parameter. Return the rectangles of splitted windows.
	 * 
	 * @param options
	 */
	
	Viewport.prototype.split = function(options) {
		var param1 = options.param1;
		var param2 = options.param2;
		var orientation = options.orientation;
		var position = options.position;
		
		var ratio = param1 / (param1 + param2);
//		console.log(ratio);
		
		var left = this._size.left;
		var top = this._size.top;
		var width = this._size.width;
		var height = this._size.height;
		
		var length; // The length of rect1 (depend on orientation)
		
		if (orientation == "H") {
			length = parseInt(width * ratio);
			width=length;
		} else {
			length = parseInt(height * ratio);
			height=length;		
		}
		
       var rect1 = new Rect({
    		 left : left,
	        top : top,
	        width : width,
	        height : height
        });

       if (orientation == "H") {
    	   	 left = left + length +1;
    	   	 width = this._size.width - length - 1;
       } else {
        	 top = top + length + 1;
        	 height = this._size.height - length - 1;
        } 

       var rect2 = new Rect({
      		 left : left,
  	        top : top,
  	        width : width,
  	        height : height
          });
       
       var res = [rect1,rect2];
       if (position != 0)
    	   res = [rect2,rect1];

//		console.log("Viewport.split",options,this._size,rect1,rect2);
       
       return res;
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
