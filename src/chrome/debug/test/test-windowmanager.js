define(["module",
        "dualless/util/taskrunner",
        "dualless/util/rect",
        "dualless/sys/viewport"],
		function testViewport(self,
						TaskRunner,
						Rect,
						Viewport) {

	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	manager.reset();

	module("WindowManager");
	
	asyncTest("WindowManager.updateWindows()",function testUpdateWindows() {
		expect(2);
		var rect = {
				top : 0,
				left : 0,
				width : 400,
				height : 400,
				url:"chrome://chrome/extensions/"
		};
		
		var runner = new TaskRunner();
		var current = undefined;
		var newWindows = [];
//		manager.reset();
		

		runner.step(function() {
			manager.currentWindow(function(win) {
				current = win;
				runner.next();
			});
		});
		
		// Create two windows. So that it has at least 3 windows available
		
		runner.step(function() {
			chrome.windows.create(rect,runner.listener()); 
		});

		runner.step(function(win) {
			newWindows.push(win);
			chrome.windows.create(rect,runner.listener()); 
		});
		
		runner.step(function(win) {
			console.log("Create 2 windows");
			newWindows.push(win);
			manager._windows = newWindows;
			manager.updateWindows({ autoMatching : true , 
								       window : current} , 
								       function(windows) {
				ok(windows.length == 2,"Expected to have 2 managed windows. Now has " + windows.length);
				if (windows.length == 2)
					ok(windows[0].id == current.id);
				runner.next();
			});
		});
		
		runner.run(function() {
			closeAllOtherWindow(current,function() { 
				QUnit.start();			
			});
		});
		
	});
	
	asyncTest("Split vertically",function testSplitVertically(){
		/** Condition: Single window , multiple tabs. The current tab should be moved into a new window.
		 *
		 */
		var runner = new TaskRunner();
		var currentWin;
		var currentTab;
		
		runner.step(function(){
			manager.currentWindowTab(function(win,tab) {
				currentWin = win;
				currentTab = tab;
				runner.next();
			});
		});

		runner.step(function() {
			manager.split({ param1 : 5 , param2 : 5 , 
							orientation :"V" , position:1,window: currentWin},
							runner.listener());
			// 3:7 Vertical split must overlap in MBA (1440 * 900) . So 5:5 is more friendly for MBA
		});
		
		runner.step(function(windows){
			ok(windows.length == 2);
			manager.updateWindows({window: currentWin}, runner.listener()); // Update again for latest information
		});
		
		runner.step(function(windows){
			ok(windows.length == 2);
			var current = windows[0];
			var paired = windows[1];
			ok(current.top > paired.top,"The current window should be in the bottom of screen");
			var rect1 = new Rect(windows[0]);
			var rect2 = new Rect(windows[1]);
			var intersect = rect1.intersect(rect2);
			
			ok(intersect.size() == 0,"It should have no intersect between managed windows. First window = " + 
													    rect1.toString() + 
													    ". Second Window = " + rect2.toString() +
													    ". Overlapped Window = " + intersect.toString());
			runner.next();
		});
		
		runner.step(function(){
		   chrome.windows.update(currentWin.id,{focused : true} , runner.listener());
		});
		
		runner.run(function(){
			ok(runner.size() == 0, "All the step is finished");
			QUnit.start();			
		});

	});
	
	asyncTest("Single Window with multiple tab. Split horizontally",function testSingleWindowMultipleTab(){
		/** Condition: Single window , multiple tabs. The current tab should be moved into a new window.
		 *
		 */
		var runner = new TaskRunner();
		var currentWin;
		var currentTab;
		
//		manager.reset();
		
		runner.step(function(){
			manager.currentWindowTab(function(win,tab) {
				currentWin = win;
				currentTab = tab;
				runner.next();
			});
		});
		
		runner.step(function() {
			closeAllOtherWindow(currentWin,runner.listener());
		});
			
		runner.step(function() {
			chrome.tabs.create({windowId: currentWin.id,url:"chrome://chrome/extensions/"},
								  runner.listener());// It has at least 2 tabs afterward.
		});
		
		runner.step(function() {
			// Highlight current tab
			chrome.tabs.highlight({windowId:currentWin.id , tabs: currentTab.index},runner.listener());
		});
		
		runner.step(function() {
			manager.updateWindows({autoMatching: true},function(windows) {
				console.log(windows.length);
				console.log(windows);
				ok(windows.length == 1,"Make sure there has only 1 window leave");
				runner.next();
			});
		});
		
		
		runner.run(function() {
			manager.split({ param1 : 3 , param2 : 7 , orientation :"H" , position:1},function(windows) {
				console.log("after split",windows);
				ok(windows != undefined,"split() should return the splited windows");
				
				if (windows != undefined ) {
					ok(windows.length == 2,"split() should return the splited windows");
				}
				setTimeout(function(){
					manager.updateWindows({sort: true},function (windows) {
						ok(windows.length == 2);
						var current = windows[0];
						ok(current.tabs.length == 1,"After split , the current tab should be the only tab in current window");
						ok(current.left > windows[1].left,"The current window should be in the right of screen");
						console.log(current);
						console.log(windows[1]);
						var rect1 = new Rect(windows[0]);
						var rect2 = new Rect(windows[1]);
						var intersect = rect1.intersect(rect2);
						
						ok(intersect.size() == 0,"It should have no intersect between managed windows. First window = " + 
																    rect1.toString() + 
																    ". Second Window = " + rect2.toString() +
																    ". Overlapped Window = " + intersect.toString());
						
						console.log("New viewport size" , manager.viewport().size());
						QUnit.start();
					});
				},500);
			});
		});
	});
	
	asyncTest("Two Windows , HSplit then VSplit",function testTwoWindowsHSplitVSplit() {
		/* Condition. Two windows. Arrange into a pair
		 * 
		 * */
		
		var runner = new TaskRunner();
		var currentWin = undefined;
		var currentTab = undefined;

		runner.step(function(){
			manager.currentWindowTab(function(win,tab) {
				currentWin = win;
				currentTab = tab;
				runner.next();
			});
		});
		
		runner.step(function(){
			closeAllOtherWindow(currentWin,runner.listener());
		});
		
		runner.step(function() {
			chrome.tabs.create({windowId: currentWin.id,
								url:"chrome://chrome/extensions/"},
				  				function() {
									chrome.tabs.highlight({windowId:currentWin.id , tabs: currentTab.index},
											runner.listener());
								});// It has at least 2 tabs afterward.
		});
		
		// Split from single window into two		
		runner.step(function() {
			manager.split({ param1 : 3 , param2 : 7 , orientation :"H" , position:1 , window: currentWin},function() {
				runner.next();
			});
		});
		
		runner.step(function() { // Test some basic information.
			ok(manager.windows().length == 2, "Two managed windows after splitted");
			chrome.windows.getAll({populate : true},function(windows) {
				var result = windows.length == 2;
				ok (result,"Two windows after splitted");
				if (result) {
					runner.next();
//					runner.stop();
				} else {
					runner.stop();
				};
			});
		});
		
		runner.step(function(){ // Update currentWin and Tab again. Because after the previous split , the tab is moved into a new window.
			manager.currentWindowTab(function(win,tab) {
				currentWin = win;
				currentTab = tab;
				runner.next();
			});
		});
		
		runner.step(function() {
			var options = {param1 : 3 , 
						   param2 : 7 , 
						   orientation :"V" , 
						   position:1 , 
						   window : currentWin,
						   tab : currentTab};
			
			manager.split(options,function(windows) {
				console.log("After VSplit",windows);
				ok(windows != undefined ,"manager.split() should return the splitted windows");
				if (windows == undefined) {
					runner.stop();
				}
				var result = windows.length == 2;
				ok(result, "It should have two managed windows after vertical split");
				
				if (result) {
					result = windows[0].id != windows[1].id;
					ok(result,"The managed windows ID should not be duplicated");
					if (!result) {
						runner.stop();
						return;
					}
				} else {
					runner.stop();
				}
								
				console.log(manager.windows());
				setTimeout(function(){
					manager.updateWindows({window : currentWin },function (windows) {
						console.log(windows);
						ok(windows.length == 2 , "It should have at least two windows after vertical split");
						console.log(windows);
						if (windows.length == 2) {
							var current = windows[0];
							ok(current.id == currentWin.id);
							ok(current.tabs.length == 1,"Make sure no extra tab is created accidently");
							ok(current.top > windows[1].top,"The current window should be located in the bottom part");
							console.log(current);
							console.log(windows[1]);
						}
						runner.next();						
					});
				},500);
				

			});
		});
		
		runner.run(function() {
			ok(runner.size() == 0, "Check is all the task finished.");
			QUnit.start();
		});
		
		
	}); // testArrange
	
	asyncTest("Single Window , Single Tab , split it",function testSingleWindowTabSplit() {
		var runner = new TaskRunner;
		var currentWin = undefined;
		var currentTab = undefined;

		runner.step(function(){
			manager.currentWindowTab(function(win,tab) {
				currentWin = win;
				currentTab = tab;
				runner.next();
			});
		});
		
		runner.step(function() {
			closeAllOtherWindow(currentWin, function() {
				var tabs = [];
				console.log(currentWin.tabs);
				$(currentWin.tabs).each(function(idx,tab) {
					if (tab.id != currentTab.id)
						tabs.push(tab.id);
				});
				console.log(tabs);
				chrome.tabs.remove(tabs,runner.listener());
			});
		});
		
		
		runner.step(function() {
			manager.currentWindow(function(win){
				ok(win.tabs.length == 1,"Only one tab leave");
				runner.next();
			});
		});
		
		runner.step(function() {
			manager.split({ param1 : 3,
						    param2 : 7,
						    orientation : "H",
						    position : 1  
						  },function(windows){
							  ok(windows.length == 2);
							  console.log(windows);
							  runner.next();
						  });
		});
		
		runner.step(function() {
			chrome.windows.getAll({populate : true},function(windows) {
				ok(windows.length == 2, "It should have two windows there.");
				runner.next();
			});
		});
		
		runner.run(function() {
			ok(runner.size() == 0, "All the step is finished");
			QUnit.start();
		});
		
	});
	
	asyncTest("Maximum Window , Split it", function testMaxWindowSplit(){
		var runner = new TaskRunner();
		var currentWin = undefined;
		var currentTab = undefined;

		runner.step(function(){
			manager.currentWindowTab(function(win,tab) {
				currentWin = win;
				currentTab = tab;
				runner.next();
			});
		});
		
		runner.step(function() {
			chrome.windows.update(currentWin.id,{state : "maximized"} , runner.listener());
		});	
		
		runner.step(function() {
			manager.split({window: currentWin,
							param1 : 3,
							param2 : 7,
							position : 1,
							orientation : "H"},runner.listener());
		});
		
		runner.step(function() {
			manager.updateWindows({},function (windows){
				ok(windows.length == 2,"Splitted into same window");
				var rect1 = new Rect(windows[0]);
				var rect2 = new Rect(windows[1]);
				$("#qunit-fixture").append("<p>" + rect1.toString() + "</p>")
				$("#qunit-fixture").append("<p>" + rect2.toString() + "</p>")
				
				ok(rect1.intersect(rect2).size() == 0, "Not intersect");
				runner.next();
			});
		});
		
		runner.run(function(){
			ok(runner.size() == 0, "All the step is finished");
			QUnit.start();			
		});
	});
	
	asyncTest("Merge with multie windows",function testMerge() {
		var runner = new TaskRunner();
		var currentWin = undefined;
		var currentTab = undefined;
		var count; // Count current no. of windows;

		runner.step(function(){
			manager.currentWindowTab(function(win,tab) {
				currentWin = win;
				currentTab = tab;
				runner.next();
			});
		});

		runner.step(function(){
			chrome.windows.getAll({populate : false},function(windows) {
				if (windows.length < 2)
					chrome.windows.create({},runner.listener()); // Make sure there has multiple windows.
				else
					runner.next();
			})
		});
		
		runner.step(function(){
			chrome.windows.getAll({populate : true},function(windows) {	
				count = windows.length;
				ok(count >= 2);
				runner.next();
			});
		});
		
		runner.step(function() {
			manager.merge({window : currentWin , tab : currentTab});
			setTimeout(runner.listener(),500);
		});

		runner.step(function(){
			chrome.windows.getAll({populate : true},function(windows) {	
				ok(windows.length == count-1 , "One of the window should be closed"); // One window is closed.
				runner.next();
			});
		});
		
		runner.run(function() {
			ok(runner.size() == 0);		
			QUnit.start();
		});
		
	});
	



});