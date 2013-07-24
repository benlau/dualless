
/** Arrange the given windows according to the options.
 * 
 * @param options
 * @param windows
 * @param callback
 */

define(["dualless/sys/toolbox/resize",
         "dualless/utils/rect",
         "dualless/utils/taskrunner",
         "dualless/utils/split"
         ],
        function(resize,
                   Rect,
                   TaskRunner,
                   split) {

    function arrange(target,options,callback) {
        var windows = options.windows,
             viewport = options.viewport,
             os = options.os,
             updatedWindows = [], // Result of processed windows
             recalculated = false,
             runner = new TaskRunner(),
             rects ; // The rectangles of window.

        rects = split(target,options); // The rectangles of window.
//        console.log("arrange",target,rects);
       
        runner.step(function() {
            // Call resize in parallel.
            // Nested call do not work well on Windows and the response time may be slow					
            // p.s Nested call can not resolve the alignment / overlapping problem in Ubuntu/Unity

            var condition = [];
            updatedWindows = [];
            for (var i = 1 ; i >= 0 ; i--) {
                var updateInfo = {};
                $.extend(updateInfo,rects[i].toData());
                
                if (i === 0)
                    updateInfo.focused = true;
                
                (function(win) {		
                    var deferred = $.Deferred();
                    condition.push(deferred);
                    resize({window : win,
                            updateInfo : updateInfo,
                            os : os
                            },function(win) {
                               updatedWindows.push(win);
                               deferred.resolve();	
                            });
                })(windows[i]);
            }

            $.when.apply(null,condition).done(function() {
                runner.next();
            });
            
        });     

        runner.run(function() {
            // Calculate the result
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
                //unite = updatedWindowsRect[0].unite(updatedWindowsRect[1]);
            }
            
            callback({
                imperfect : imperfect,
                rects : updatedWindowsRect
            });
        });
        
    }
    
   return function(options,callback) {
            var windows = options.windows,
                 os = options.os,
                 viewport = options.viewport,
                 recalculated = false,
                 retry = 0; // May retry for layout depend on the OS without resize the viewport

            if (windows.length != 2) {
                console.error("Viewport.layout() - The input windows size must be 2.",windows);
                return;
            }

            //this.detect(options.screen); // Detect the screen size and update viewport if needed

            retry = 1; // Unlike v3.0, retry is not limited to Linux only. Since the retry mechanism
                       // is changed to solve the min size problem in Chrome window
            
            if (os == "Linux") {
                retry++;  
                // The first retry will handle the minimium window size problem in Chrome
                // The second retry is made for Ubuntu/Unity , 
                // somtimes the window may not on the correct position.
                // Try one more time should fix the problem.
            }

            function final(result) {
                var imperfect = result.imperfect,
                     rects = result.rects,
                     accept = true;

//                console.log("final",rects);

                if (imperfect) {

                    if (retry > 0) { // Retry with min window size set
                        retry--;
                        accept = false;
                        //arrange(rects[0].unite(rects[1]),options,final); 
                        
                        // Using united size as target is worse then before.
                        var minSize = {
                            width  : Math.min(rects[0].width,rects[1].width),
                            height : Math.min(rects[0].height,rects[1].height),
                        }
                        
                        var retryOptions = {};
                        $.extend(retryOptions,options);
                        retryOptions.minSize = minSize;
                        
                        arrange(options.viewport.size(),retryOptions,final);
                    } 
                    
                    // Ubuntu(Unity) unlike Mac or Window, the screen
                    // size is not equal to the view port size.
                    // 
                    // On Dualless v0.3 , a viewport detection is 
                    // made here. However, the result is not accuracy
                    // and sometimes may be wrong.                  
                    // Therefore the function is disabled. 
                    
                    /*
                    else if (!viewport.isModified()
                               && !viewport.isDetectable()
                               && !recalculated) {
                        if (viewport._os == "Linux")
                            retry = 1; // Reset retry count.
                        recalculated = true;
                        viewport.calc(rects[0], rects[1]);
                        //rects = viewport.split(options);
                        accept = false;
                        arrange(options,final);
                    };
                    */
                }
                
                if (accept) {
                    if (callback!==undefined)
                        callback();
                }
            };

            arrange(options.viewport.size(),options,final);
       
   };
    
});
