
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
            // Nested call do not work well on Windows. Moreover, the response time may be slow					
            // Moreover, nested call can not resolve the alignment problem in Unity

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

            if (os == "Linux") {
                retry = 1; // "Linux" should retry one more time without update the viewport.
                            // It is a dirty hack to resolve the issue with Unity
            }

            function final(result) {
                var imperfect = result.imperfect,
                     rects = result.rects,
                     accept = true;
                
                if (imperfect) {

                    if (retry > 0) { // Just retry without touch the viewport size
                        retry--;
                        accept = false;
                        arrange(rects[0].unite(rects[1]),options,final);
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
                    if (callback!=undefined)
                        callback();
                }
            };

            arrange(options.viewport.size(),options,final);
       
   };
    
});
