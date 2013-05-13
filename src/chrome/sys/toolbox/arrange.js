
/** Arrange the given windows according to the options.
 * 
 * @param options
 * @param windows
 * @param callback
 */

define(["dualless/sys/toolbox/resize",
         "dualless/util/rect"],
        function(resize,
                   Rect) {
    
   return function(options,callback) {
       var windows = options.windows,
            viewport = options.viewport,
            os = options.os,
            retry = 0, // May retry for layout depend on the OS without resize the viewport
            count = 2, // No. of windows waiting for resize
            updatedWindows = [], // Result of processed windows
            recalculated = false,
            rects ; // The rectangles of window.

        if (windows.length != 2) {
            console.error("Viewport.layout() - The input windows size must be 2.",windows);
            return;
        }

        //this.detect(options.screen); // Detect the screen size and update viewport if needed

        if (os == "Linux") {
            retry = 1; // "Linux" should retry one for time without update the viewport.
                        // It is a dirty hack to resolve the issue with Unity
        }

        rects = viewport.split(options); // The rectangles of window.

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

        function arrange() {
            var condition = [];
            count = 2;
            updatedWindows = [];
        //			console.log(rects[0].__proto__.constructor.name);
            for (var i = 1 ; i >= 0 ; i--) {
                var updateInfo = {};
                $.extend(updateInfo,rects[i].toData());
                
                if (i == 0)
                    updateInfo.focused = true;
        //				console.log("Resize",windows[i].id,updateInfo,windows[i]);
                
                (function() {		
                    var deferred = $.Deferred();
                    condition.push(deferred);
                    resize({	window : windows[i],
                                        updateInfo : updateInfo,
                                        os : viewport._os
                                     },function(win) {
                                           updatedWindows.push(win);
                                           deferred.resolve();	
                                     });
                })();
                // Call resize in parallel.
                // Nested call do not work well on Windows. Moreover, the response time may be slow					
            }

            $.when.apply(null,condition).done(function() {
                validate();
            });
            
        }

        arrange();   
   } 
    
});
