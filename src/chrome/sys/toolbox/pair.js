/* Pair Display Tool */

define(function(){
    
	/*
	function PairDisplay() {
		this.frozen = false;
		this.lastWindowId = chrome.windows.WINDOW_ID_NONE ;
	}
	
	PairDisplay.prototype.start = function(manager){
		var display = this;
		this._manager = manager;
		
		if (manager.os() == "MacOS") // It is not needed for Mac!
			return;

		chrome.windows.onFocusChanged.addListener(function(winId) {
			if (localStorage.pairingModeEnabled > 0
				&& manager.windows().length == 2)
				display.pairingV1(winId);
		});
	};
    */

    var frozen = false;
	
	/** Freeze the pairing function for specific second. 
	 * 
	 * @param time
	 */
	function freeze(time) {
        // Prevent the action is called for multiple time. 
        // As the flow of focus change is not documented, 
		frozen = true;
		setTimeout(function() {
            frozen = false; 
       },time);
	};

	/* Version 1 pairing algorithm
	 * 
	 */
	
	function pair(winId,windows) {
	
		if (frozen || windows.length ==1 || winId == chrome.windows.WINDOW_ID_NONE)
			return;		
										
        var pos = 0;
        if (windows[1].id == winId){
            pos = 1;
        }
			
			/* Approach 1 */
			/* Original approach.
			  
			this.frozen = true;
			chrome.windows.update(windows[1 - pos].id , {focused: true , state:"normal"});
			chrome.windows.update(windows[pos].id , {focused: true , state:"normal"});
			
			setTimeout(function() {
                display.frozen = false; 
          },1000); // Un-freeze after 1000ms
          */
			
			/* Approach 2 */
			/* This method works better in Ubuntu/Unity */

			freeze(1000);

			/* Within Ubuntu/Unity , using alt-tab switching between two managed windows.
			 * The launcher icon will vibrate. It is annonying. Trying to freeze for a while.
			 * 
			 */
            
			chrome.windows.update(windows[1 - pos].id , {focused: true},function() {
				chrome.windows.update(windows[pos].id , {focused: true},function() {
				});
			});
			/* Remarks: Do not set state to "normal". If the window is maximized, it will force to rollback to previous
			 * size. It is quite annoying.  

			 */	
	};

	/** Pairing by using drawAttention
	 * (It don't work) 
	 * @param winId

	PairDisplay.prototype.pairingV2 = function(winId) {
		var manager = this._manager;
		var windows = manager.windows();

		if (manager.isManaged(winId) && 
					windows.length > 1) {
			
			$(windows).each(function(idx,win){
				chrome.windows.update(win.id , {drawAttention:true});	
			});
		}
		};
	 */	
	return pair;
});
