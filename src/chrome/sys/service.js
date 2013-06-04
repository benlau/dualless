/* WindowManager services
 */

define(function() {
  	var bg = chrome.extension.getBackgroundPage(),
         manager = bg.manager(),
	     scr = {}, // Clone of screen object
         win, // The current window
	     tab; // The current tab
         
	$.extend(scr,window.screen); // Make a copy of the screen object
    
    manager.currentWindowTab(function (val1,val2){
		win = val1;
		tab = val2;
	});
         
    function factory() {
        var service = {
            
            split : function(options) {
                var args = {};
                $.extend(args,options);
                args.window = win;
                args.tab = tab;
                args.screen = scr;
                
                manager.split(args); 
                // Unlike previous implementation, current window will
                // never been changed. So it do not need to update the 
                // current window
            },

            merge : function(options) {
                var args = {};
                args.window = win;
                args.tab = tab;
                args.screen = scr;
                
                manager.merge(args);
            },
            window : function() {
                return win;
            },
            tab : function() {
                return tab;
            }
        };
        
        return service;
    }
    
    return factory;
});
