define(["dualless/util/rect",
        "dualless/sys/os"], 
		function sys(Rect,
					  os) {
	
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
	 */
	
	Viewport.prototype.reset = function() {
		var rect = new Rect({ top : window.screen.availTop,
			left : window.screen.availLeft,
			width : window.screen.availWidth,
			height : window.screen.availHeight	});
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
	
	/** Layout the given windows according to the options.
	 * 
	 * @param options
	 * @param windows
	 * @param callback
	 */
	
	Viewport.prototype.layout = function(options,windows,callback) {
		
		var rects ; // The rectangles of window.
		var viewport = this;
		
		var retry = 0; // May retry for layout depend on the OS without resize the viewport
		var count = 2; // No. of windows waiting for resize
		var updatedWindows = []; // Result of processed windows
		var recalculated = false;
		
		this.detect(options.screen); // Detect the screen size and update viewport if needed
		
		if (viewport._os == "Linux") {
			retry = 1; // "Linux" should retry one for time without update the viewport.
			  	        // It is a dirty hack to resolve the issue with Unity
		}
		
		rects = this.split(options); // The rectangles of window.
		
		// Create a new tab on specific window.
		function createTab(winId,url,callback) {
			if (viewport._os == "Linux") {
				// Extra delay is needed for Ubuntu/Unity when there has only one single window and single tab 
				setTimeout(function(){
					chrome.tabs.create({windowId : winId,
										  url : url},
										  callback);					
				},100);
			} else {
				chrome.tabs.create({windowId : winId,
									  url : url},
									  callback);
			}
		}
		
		function validate() { // Validate the result
			var updatedWindowsRect = []; // The rect object of the updated window
			$(updatedWindows).each(function(idx,win) {
				var r = new Rect(win);
				updatedWindowsRect.push(r);
			});
			
			var intersected = updatedWindowsRect[0].intersect(updatedWindowsRect[1]);
			var imperfect = false; // The result is imperfect
			var accept = true; // TRUE if the result is accepted event it is imperfect. Call the callback function.
			
			if (intersected.size() > 0 ) { // Prove that it is intersected!
				imperfect = true;
				unite = updatedWindowsRect[0].unite(updatedWindowsRect[1]);
			}
			
			if (imperfect) {

				if (retry > 0) { // Just retry without touch the viewport size
					retry--;
					accept = false;
					arrange();
				} else if (!viewport.isModified()
				           && !viewport.isDetectable()
				           && !recalculated) {
					if (viewport._os == "Linux")
						retry = 1; // Reset retry count.
					recalculated = true;
					viewport.calc(updatedWindowsRect[0], updatedWindowsRect[1]);
					rects = viewport.split(options);
					accept = false;
					arrange();
				};
			
			}
		
			if (accept) {
				if (options.duplicate) {
					createTab(windows[1].id,options.tab.url,callback);
				} else {			
					if (callback!=undefined)
						callback();
				}
			}
		
		};
	
		
		function collector(win) { // Collect updated window
			updatedWindows.push(win);
			count--;
			if (count == 0) { // Start validation
				validate();
			}
		}
	
		function arrange() {
			count = 2;
			updatedWindows = [];
//			console.log(rects[0].__proto__.constructor.name);
			for (var i = 1 ; i >= 0 ; i--) {
				var updateInfo = {};
				$.extend(updateInfo,rects[i].toData());
				
				if (i == 0)
					updateInfo.focused = true;
//				console.log("Resize",windows[i].id,updateInfo,windows[i]);
				
				viewport.resize(updateInfo,windows[i],collector);
				// Call resize in parallel.
				// Nested call do not work well on windows. Moreover, the response time may be slow					
			}
			
		}
		
		arrange();
	};
	
	/** Merge windows
	 * 
	 * @param options
	 * @param callback
	 */
	
	Viewport.prototype.merge = function(options,callback){
		var rect;
		var master = options.windows[0]; // master window ; which will be resized to max viewport size
		var tabs = [];// Tabs from other managed windows. All the tab inside will be moved to master window
		
		this.detect(options.screen);
		
		rect = this._size.toData();
		
		for (var i =1 ; i < options.windows.length;i++) {
			$(options.windows[i].tabs).each(function(idx,tab){
				tabs.push(tab.id);
			});
		}

       if (tabs.length > 0) {
	    	  chrome.tabs.move(tabs,{windowId:master.id, index : master.tabs.length});
        }		

		chrome.windows.update(master.id,rect);
	};
	
	/** Resize a window
	 * 
	 * @param rect Rect object instance
	 * @param win
	 * @param callback
	 */
	
	Viewport.prototype.resize = function(rect,win,callback) {
		var updateInfo = {}; // The target rect
		var winId = win.id;
		
		$.extend(updateInfo,this._size.toData());
		
		if (rect.__proto__.constructor.name == "Rect"){
			$.extend(updateInfo,rect.toData());	
		} else {
			$.extend(updateInfo,rect);
		}
	
//		if (win.state == "maximized" || win.state == "minimized")
		
		updateInfo.state = "normal"; 
		/* Remarks:
		 * 
		 * Sometimes Chrome on Ubuntu/Unity may not report the current state correctly.
		 * So set to "normal" by default. Otherwise, it may not be able to resize maximized window
		 *  
		 */  
		
		if (this._os == "MacOS") {
			delete updateInfo.state; // Don't set normal in MacOS. The animation will be mad
		}	
		
		if (this._os == "Linux") {
			this._resizeOnLinux(winId,updateInfo,callback);
		} else {
			chrome.windows.update(winId, updateInfo , callback);
		}
		
	};
	
	/** A special resize function for Linux due to the #72369 bug for Chrome on Linux
	 * 
	 */
	
	Viewport.prototype._resizeOnLinux = function(winId,updateInfo,callback){
		var lastSize = new Rect();
		var newSize = new Rect();
		var targetSize = new Rect(updateInfo);

		function checker() { // Check is the resize frozen?
			chrome.windows.get(winId,function(result) {
				newSize = new Rect(result);
//				console.log("checker",winId,lastSize,newSize,targetSize);			
				
				if (lastSize.equal(newSize) || newSize.equal(targetSize)) {
					// Done!
					if (callback)
						callback(result);
				} else {
					lastSize = newSize;
					setTimeout(checker,100);
				}
			});
		}
		
		lastSize = new Rect();
		
		chrome.windows.update(winId, updateInfo , checker);
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
