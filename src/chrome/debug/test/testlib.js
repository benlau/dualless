
/** Close all other window except the current one
 * 
 */

function closeAllOtherWindow() { 
	var current = undefined;
	var callback;
	var list = []; // list of window going to be removed.
	
	if (arguments.length == 2) {
		current = arguments[0];
		callback = arguments[1];
	} else if (arguments.length == 1){
		callback = arguments[0];
	} else {
		throw ("Invalid no. of argument for closeAllOtherWindow");
	}	
	
	function removeOneWindow() {
		if (list.length > 0) {
			var win = list.pop();
			chrome.windows.remove(win.id,removeOneWindow);
		} else {
			if (callback!=undefined) { 
				setTimeout(callback,100);
			}
		}
	}
	
	function removeWindows(callback) {
		chrome.windows.getAll({populate : true},function(windows) {
			$(windows).each( function(idx,win){
				if (win.id != current.id) {
					list.push(win);
				}
			});
			removeOneWindow();
		});
	}
	
	if (current == undefined) {
		manager.currentWindow(function (win) {
			current = win;
			removeWindows();
		});
	} else {
		removeWindows();
	}	
};

function closeAllOtherTab(callback) { 
   chrome.tabs.getCurrent(function(tab) {
      chrome.windows.getCurrent({populate:true},function(win) {
          var tabs = [];
          $(win.tabs).each(function(idx,t){
              if (t.id != tab.id)
                  tabs.push(t.id);
           });
          if (tabs.length > 0)
              chrome.tabs.remove(tabs,callback);
          else 
              callback();
       }); 
   });
}

define(function() {
	var current;
	var currentTab;
	
	function currentWindow(){
		if (arguments.length == 0) {
			return current;
		} else {
			current = arguments[0];
		}
	}

	function currentTab(){
	    if (arguments.length == 0) {
	        return currentTab;
	    } else {
	        currentTab = arguments[0];
	    }
	}
	
	chrome.windows.getCurrent({populate: true}, function(win){
		current = win;
	});
	
	chrome.tabs.getCurrent(function(tab){
	   currentTab = tab; 
	});
	
	return {
		currentWindow : currentWindow,
		currentTab : currentTab
	};
	
});
