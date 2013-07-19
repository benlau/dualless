/* WindowManager 
 * 
 * It is the core of Dualless that manages the split , merge , pairing and all windows related
 * operations. 
 * 
 * Events:
 * 
 * - removed        A managed tab is removed 
 * 
 * - focusChanged   The focus of window has been changed. 
 *                  If it is focus on a unmanaged window,
 *                  the window ID will be chrome.windows.WINDOW_ID_NONE
 * 
 * - tabCreated     A new tab is created by WindowManager.
 * 
 * */

define(["dualless/sys/viewport",
		 "dualless/sys/os",
		 "dualless/lib/eventemitter",
		 "dualless/sys/toolbox",
         "dualless/utils/taskrunner",
         "dualless/sys/tabtracker"
         ], 
		function sys(Viewport,
					   os,
					   EventEmitter,
					   toolbox,
                       TaskRunner,
                       TabTracker) {

	var WindowManager = function() {
        var manager = this;
        
		this._os = os();
		this._viewport = new Viewport();
		this._windows = []; // Managed windows
		
		this.events = new EventEmitter();
        
        this._tracker = new TabTracker();
        this._tracker.start();
		
		chrome.windows.onRemoved.addListener(function ( winId){
			if (manager.isManaged(winId)) {
                manager.take(winId);
                manager.events.emit("removed",winId);
			}
		});

		chrome.windows.onFocusChanged.addListener(function (winId){
			if (manager.isManaged(winId)) {
				manager.events.emit("focusChanged",winId);
			} else {
				manager.events.emit("focusChanged",chrome.windows.WINDOW_ID_NONE);
			}
		});		
	};
	
	/** Return the detected os
	 * 
	 * @returns {String}
	 */
	
	WindowManager.prototype.os = function() {
		return this._os;
	};
	
	WindowManager.prototype.viewport = function(){
		return this._viewport;
	};
	
	/** Check is a window maximized.
	 * @param win The window returned by chrome.windows.get()
	 * @returns
	 */
	WindowManager.prototype.isMaximized= function(win) {
		var res;
		
		if (win.state != undefined) { // Working method for new version of Chrome
			return win.state == "maximized";
		}

	    // Old version of Chrome do not provide any method to check window status.
		
		if (this._os == "Windows") {
			// Dirty hack for windows
			res = (win.left == -8 && win.top == -8 && win.width == window.screen.availWidth + 16);
		} else if (this._os == "MacOS") {
			res = false; // MacOS do not have the concept of maximize.
		} else {
			// It do not works for Unity
			res = (win.left == 0 && win.width == window.screen.availWidth);
		}
	    return res;
	};
	
	/** Get current window information
	 * 
	 * @param callback The callback parameter should specify a function that looks like this: (function callback(winidw) )
	 */
	
	WindowManager.prototype.currentWindow = function(callback) {

		chrome.windows.getCurrent({populate: true}, function(win){
			callback(win);
		});
	};
	
	/** Get the current window and tab
	 * 
	 * @param callback
	 */
	
	WindowManager.prototype.currentWindowTab = function(callback) {
	    chrome.tabs.getSelected(null,function(tab) {
	        chrome.windows.get(tab.windowId,{populate : true},function(win) {
	        	callback(win,tab);
	         });
	    });
	};
	
	/** Get managed windows list
	 * 
	 * @returns Array of managed windows 
	 */
	
	WindowManager.prototype.windows = function() {
        if (arguments.length > 0) {
            var windows = []
            for (var i =0 ; i < arguments.length && i < 2;i++) {
                windows.push(arguments[i]);
            }
            this._windows = windows;
        }
		return this._windows;
	};
    	
	/** Return true if the input window is managed by the Window Manager  
	 * 
	 * @param win Either the ID or a Chrome Window object.
	 */
	
	WindowManager.prototype.isManaged = function(win) {
		var id;
		if (typeof win == "number") {
			id = win;
		} else {
			id = win.id;
		}
		
		var res = false;
		$(this._windows).each(function(idx,w) {
			if (w.id == id) {
				res = true;
			}
		});
		return res;
	};
    
    /** Based on the input window id, find the another paired window. If no such pair was found, return undefined.
     */
            
    WindowManager.prototype.pair = function(winId) {
        var pos = -1,
            pwin;
        
        for (var i in this._windows) {
            var w = this._windows[i];
            if (w.id == winId) {
                pos = i;
                break;
            }
        }
        
        if (pos >= 0) {
            pwin = this._windows[1 - pos];    
        }
        
        return pwin;
    }
	
	/** Update the managed windows information. May purge record out if the windows is already destroyed.
	 * 
	 * @param options Options for update behaviour
	 * 
	 * options.window - If it is set , it will be always in the beginning of the return window list
	 * 
	 * @param callback It will be called when the operation is completed.
	 */	
	
	WindowManager.prototype.updateWindows = function(options,callback) {
		var manager = this;
		
		var setting = {
			// TRUE if the no. of managed window is not full. It find add another windows randomly
			autoMatching : false,
			// TRUE if the current windows list should be sorted(The focus window in the beginning)
			sort : false
		};
		
		$.extend(setting,options);
		options = setting;
		
		chrome.windows.getAll({populate : true},function(windows) {
			var list = [];
			$(windows).each(function(idx,w){
				if (manager.isManaged(w)){
					list.push(w);
				}
			});
			manager._windows = list;
			
			if (options.window != undefined) {
				var win = options.window;
				if (manager.isManaged(options.window.id)) {
					for (var i = 0 ; i < manager._windows.length;i++) {
						if (manager._windows[i].id == options.window.id) {
							win = manager._windows[i]; // Updated with tabs information
							manager._windows.splice(i,1);
							break;
						}
					}
				}
				manager._windows.unshift(win);
				while (manager._windows.length > 2)
					manager._windows.pop();
			}

			// Find another windows
			if (options.autoMatching
				&& manager._windows.length <2) {
				$(windows).each(function(idx,w) {
					if (!manager.isManaged(w)) {
						manager._windows.push(w);
					}
					if (manager._windows.length >=2)
						return false;
				});
			}
			
			if (setting.sort) {
				if (manager._windows.length >= 2 
					&& manager._windows[1].focused) {
					var tmp = manager._windows[0]; 
					manager._windows[0] = manager._windows[1];
					manager._windows[1] = tmp;
				}
			}
			
			if (callback!=undefined)
				callback(manager._windows);
		});
	};

	/** Reset the WindowManager to initialize state
	 * 
	 */
	
	WindowManager.prototype.reset = function() {
		this._windows = [];
		this._viewport.reset();
	};
		
	/** Split windows
	 * @params options Options for split
	 * 
	 * The basic parameter could be found in trySplit
	 * 
	 * Extra parameter:
	 *   options.window - The current window
	 * 
	 */
	
    WindowManager.prototype.split = function(options,callback) {
        var manager = this,
             runner = new TaskRunner();
        
        manager._viewport.detect(options.screen);
        $.extend(options,{ viewport: manager._viewport,
                             os : manager._os
                            });
	
        runner.step(function() {
            // Update the windows information.
		    manager.updateWindows({autoMatching: true,
                                      window : options.window},runner.listener());
        });
        
        runner.step(function(list) {
            // If the current tab is tracked , it should swap the position and remove the action
            var action = options.action || {},
                link = action.link;
            
            if (!link)
                runner.next(list);
            
            var trackedTab = manager._tracker.tab(link.url);
            manager.currentWindowTab(function(win,currentTab) {
                if (trackedTab && trackedTab.id == currentTab.id) {
                    options.position = 1 - options.position;   
                    delete options.action.link;
                }
                runner.next(list);
            });
        });

        runner.step(function(list) {
			$.extend(options,{ windows: list
                                });
                                
            if (list.length == 1) {
                manager.createPairedWindow(options,function(newWin) {
                    manager._windows.push(newWin);
                    options.windows = manager._windows;
                    runner.next(options);
                });
            } else {
                runner.next(options);
            }            
        });
        
        runner.step(function (options) {
            toolbox.arrange(options,runner.listener());			
        });
        
        // Post action handler
        runner.step(function() {
            var action = options.action || {},
                 duplicate = action.duplicate,
                 link = action.link;

            if (duplicate) {
                 chrome.tabs.create({windowId : options.windows[1].id,
                                       url : options.tab.url},
                                       runner.listener());
            } else if (link) {
                var tab = manager._tracker.tab(link.url),
                     info = {
                         windowId : options.windows[1].id
                     }
                if (tab) { // Find tracked tab. It should move it.
                    info.index = 0;
                    chrome.tabs.move(tab.id,info,function() {
                        chrome.tabs.update(tab.id,
                                            {active:true
                                            }
                                            ,function() {
                                                runner.next(tab);                       
                                            });
                    });
                } else {
                    info.url = link.url;
                    chrome.tabs.create(info,runner.listener());                    
                }

            } else {
                runner.next();   
            }
        });
        
        runner.step(function(tab) {
            var action = options.action || {},
                 link = action.link;

            if (tab != undefined) {
                manager.events.emit("tabCreated",tab);
                if (link)
                    manager._tracker.add(link.url,tab); // start tracking
            }
            runner.next();
        });
        
        runner.run(function () {
            if (callback)
                callback(manager._windows);            
        });
    
	};

	/** Create a new window as a pair of input window and move all the tab except the current tab 
	 * 
	 * @param rects
	 */
	
	WindowManager.prototype.createPairedWindow = function(options,callback) {
//		console.log("WindowManager._createAndMove",this._windows);
        var manager = this,
             win = options.window,
             tab = options.tab,
             action = options.action || {},
             link = action.link,
             newWin = undefined,
             tabs = [],
             skipTabsMoving = false,
             runner = new TaskRunner();
        
        runner.step(function() {
            // In case window and tab is not provided. Let's do auto detection.
           if (window == undefined || tab == undefined) {
               manager.currentWindowTab(function(p1,p2){
                  win = p1;
                  tab = p2; 
                  runner.next();
               });
           } else {
               runner.next();  
           }
        });
        
        runner.step(function() {
            for (var i in win.tabs) {
                if (win.tabs[i].id != tab.id) {
                    tabs.push(win.tabs[i].id);
                }
            }
            runner.next();
        });        

        runner.step(function() {
            // Pre-processing of action
            var createData = {
                 focused : false
            }
            
            if (action.duplicate) {
                createData.url = options.tab.url;
                delete options.action.duplicate;
                skipTabsMoving = true; 
            } else if (action.link) {
                               
                var tab = manager._tracker.tab(link.url);
                     
                if (tab) { // Find tracked tab. It should move it.
                    createData.tabId = tab.id
                } else {
                    createData.url = action.link.url;    
                }
                
                delete options.action.link;
                skipTabsMoving = true; 
            } else {
                // Prevent the creation of blank tab in new window
                var tabId = tabs.shift(); 
                createData.tabId = tabId;                    
            }

            chrome.windows.create(createData,runner.listener());
        });

        runner.step(function(win) {
            newWin = win;
            
            if (link) {
                manager.events.emit("tabCreated",win.tabs[0]);
                manager._tracker.add(link.url,win.tabs[0]);
            }
            
            if (tabs.length == 0 ||
                skipTabsMoving) {
                runner.next();
            } else {
                chrome.tabs.move(tabs,{ windowId : newWin.id,
                                           index : 0},runner.listener());
            }
        });

        runner.run(function() {
            if (manager._os == "Linux") {
                // Extra delay for Linux. Otherwise , the newly created window size may not be correct.
                setTimeout(function() {
                    callback(newWin);
                },100);
            } else {
                callback(newWin);
            }
        });
		
/*		
		if (options.window != undefined && options.tab != undefined) {
			create(options.window , options.tab);
		} else {
//		    console.log("WindowManager._createAndMove - window or tab is not passed. Auto-detect it.");
			manager.currentWindowTab(create);			
		}
*/		
	};



	/** Merge all managed windows into current window.
	 * 
	 * @param current The current window.
	 */
	
	WindowManager.prototype.merge = function(options) {
		var manager = this;
		manager._viewport.detect(options.screen);
		manager.updateWindows({window:options.window , 
								  autoMatching: true}, 
								  function (windows) {
			toolbox.merge({ windows: windows , 
			                  tab : options.tab,
			                  viewport : manager._viewport});
		});
	};
	
	/** Maximize the size of a window.
	 */
	
	WindowManager.prototype.maximize = function(winId) {
		var manager = this;
		chrome.windows.get(winId, function(win) {
			toolbox.merge({windows:[win],
						     viewport : manager._viewport 
							});
//			manager._viewport.merge({  , tab: []});
		});
	};
	
	/** Remove a window from managed window list
	 * 
	 */
	
    WindowManager.prototype.take = function(winId) {
        for (var i = 0 ; i < this._windows.length;i++) {
			if (this._windows[i].id == winId) {
				this._windows.splice(i,1);
				break;
			}
		}
	}
	
	return WindowManager;
});
