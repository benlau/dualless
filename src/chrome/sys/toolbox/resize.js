
define(["dualless/util/rect"],
         function(Rect) {

  	/** Resize a window
	 * 
	 * @param options Options for resize
	 * @param callback
	 */
    
    function resize(options,callback) {
                
		var winId = options.window.id,
             info = options.updateInfo,
             os = options.os,
             updateInfo = {}; // The target rect
               
		// $.extend(updateInfo,viewport.size().toData());
		
        /*
		if (rect.__proto__.constructor.name == "Rect"){
			$.extend(updateInfo,rect.toData());	
		} else {
			$.extend(updateInfo,rect);
		} */
        
        $.extend(updateInfo,info);
        
		updateInfo.state = "normal"; 
		/* Remarks:
		 * 
		 * Sometimes Chrome on Ubuntu/Unity may not report the current state correctly.
		 * So set to "normal" by default. Otherwise, it may not be able to resize maximized window
		 *  
		 */  
		
		if (os == "MacOS") {
			delete updateInfo.state; // Don't set normal in MacOS. The animation will be mad
		}	
		
		if (os == "Linux") {
			_resizeOnLinux(winId,updateInfo,callback);
		} else {
			chrome.windows.update(winId, updateInfo , callback);
		}        
    }
    
    /** A special resize function for Linux due to the #72369 bug for Chrome on Linux
	 * 
	 */
	
	 function _resizeOnLinux(winId,updateInfo,callback){
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

    return resize; 
});
