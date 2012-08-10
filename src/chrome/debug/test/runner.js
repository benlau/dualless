
requirejs.config({
	paths : {
		"dualless" : ".."
	},
	baseUrl : ".."
});

define(["module",
        "dualless/util/taskrunner",
        "dualless/util/rect",
        "dualless/sys/viewport"],
		function runner(self,
						TaskRunner,
						Rect,
						Viewport) {

	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	manager.reset();
	
	/**
	 * closeAllOtherWindow(callback());
	 * closeAllOtherWindow(win,callback());
	 */
	
	function closeAllOtherWindow() { // Close all other window except the current one
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

	module("Preparation"); // Test case for test utility

	asyncTest("closeAllOtherWindow", function test_closeAllOtherWindow(){
		expect(2);
		var rect = {
				top : 0,
				left : 0,
				width : 400,
				height : 400
		};
		var runner = new TaskRunner();
		var current = undefined;
		
		runner.step(function() {
			manager.currentWindow(runner.listener());
		});
		
		
		runner.step(function(win){
			current = win;
			runner.next();
		});
		
		runner.step(function(){
			
		chrome.windows.create(rect,function(win) { // Create one more windows to make sure there has at least 2 windows available
			closeAllOtherWindow(current,function() { 
				// It must pass "current" to this function. Otherwise it will not works on MacOS
				
				chrome.windows.getAll({populate : true},function(windows) {
					ok(windows.length == 1 , 
					   "After called closeAllOtherWindow(). It should have only 1 window leave , Nnow has " + windows.length + " windows");
					
					closeAllOtherWindow(current,function() {
						ok(1, "closeAllOtherWindow() should also works with single window condition");
						runner.next();
					});

				});
			});
    	});			

		});

		runner.run(function() {
			QUnit.start();
		});
		
		
	});
	
	asyncTest("chrome.windows.update",function testChromeWindowUpdate(){
		// Test the behaviour of chrome.window.update()
		// Proof that the callback of chrome.window.update() is involved before the windows is resized completely.
		var runner = new TaskRunner;
		var currentWin;
		var target;
		runner.step(function(){
			manager.currentWindow(function(win){
				currentWin = win;
				target  = {
						top: 100,
						left: 100,
						width : 50,
						height : 50
				};
				
				chrome.windows.update(currentWin.id, target,runner.listener());
			});
		});
		
		runner.step(function(){
			setTimeout(runner.listener(),500); // Wait until it is resized
		});
		
		runner.step(function(){
			target  = {
					top: 70,
					left: 70,
					width : 1000,
					height : 750
			};
			
			chrome.windows.update(currentWin.id, target,runner.listener());			
		});
		
		
		runner.step(function(win) {
			var rect1 = new Rect(target);
			var rect2 = new Rect(win);
			console.log(target,win)
			if (manager.os() == "Linux") {
				ok(!rect1.equal(rect2), "The callback of chrome.windows.update is involved before the window is resized completely!!!!!");
			} else{
				ok(rect1.equal(rect2), "The callback of chrome.windows.update is involved after the window is resized completely for non-Linux system");				
			} 
			setTimeout(runner.listener(),500);
		});

		runner.step(function(win) {
			manager.currentWindow(function(win) {
				var rect1 = new Rect(target);
				var rect2 = new Rect(win);
				console.log(target,win)
				ok(rect1.equal(rect2));
				runner.next();
			});
		});

		runner.run(function() {
			QUnit.start();
		});
	});
	
	module("Utility");
	
	test("Rect",function testRect() {
		var r1 = new Rect({top: 345, left:65,width : 1983,height:807});
		var r2 = new Rect({top: 24, left:65,width : 1983,height:345});
		
		ok(r1.top == 345);
		ok(r2.width == 1983);
		
		var r3 = r1.intersect(r2);
		
		ok(r3.size() > 0);
		
		var r4 = new Rect({top: 345, left:65,width : 1983,height:24});
		ok(r3.equal(r4));
		
		r3 = r1.unite(r2);
		r4 = new Rect({top: 24, left:65,width : 1983,height: 807+345 -24});
		ok(r3.equal(r4));
		
		ok(r3.toString() === "[24,65,1983,1128]");
	});
	
	test("Rect Data #2", function testRect2(){
		/* Second set of test data */
		var r1 = new Rect({top: 24, left:65,width : 594,height:1128});
		var r2 = new Rect({top: 24, left:595,width : 1389,height:1128});
		var r3 = r1.intersect(r2);
		ok(r3.size() > 0 , "Intersected");
		console.log(r1,r2,r3);
		
	})
	
	module("Viewport");
	
	test("Basic" , function testViewportBasic() {
		var viewport = manager.viewport();
		ok(viewport.size().top != undefined,"Viewport.size() should return Rect object"); 		
		
		viewport = new Viewport();
		
		 /* Basic test */
		var rect = new Rect();
		rect.top = 40;
		rect.left = 40;
		rect.width = 400;
		rect.height = 400;
				
		viewport.setSize(rect);
				
		var rects = viewport.split({param1 : 3,
						   param2 : 7,
						   orientation : "H",
						   position : 0});			
		
		ok(rects.length == 2 , "After split should have two rectangles");
		ok(rects[0].height == 400);
		ok(rects[1].left == 161);
		
		var intersected = rects[0].intersect(rects[1]);
		ok(intersected.isNull() , "No intersection");
		var unite = rects[0].unite(rects[1]);
		ok(unite.width == 400);
			
		rect = new Rect(24,65,1983,1128);
		console.log(rect);
		viewport.setSize(rect);
		rects = viewport.split({param1 : 3,
			   param2 : 7,
			   orientation : "H",
			   position : 0});			
		
		console.log(rects);
		intersected = rects[0].intersect(rects[1]);
		ok(intersected.isNull() , "No intersection");
		
		viewport.reset();
		var calledOnResize = false;
		function onResize(){
			calledOnResize = true;
		};
		viewport.bind(onResize);
		
		viewport.setSize(rect);
		ok(calledOnResize,"Resize is called");
		
		calledOnResize = false;
		viewport.setSize(rect);
		ok(!calledOnResize,"Resize should not be called");
		
		viewport.reset();
		viewport.unbind(onResize);
		calledOnResize = false;
		
		viewport.setSize(rect);
		ok(!calledOnResize,"Test unbind");
	});
	
	asyncTest("ResizeWindow", function testViewportResize() {
		/* Test the Viewport.resize() */
		var runner = new TaskRunner;
		var currentWin;
		var target;
		var viewport = new Viewport({os: manager.os()});
		
		runner.step(function(){
			manager.currentWindow(function(win){
				currentWin = win;
				target  = {
						top: 100,
						left: 100,
						width : 500,
						height : 500
				};
				
				chrome.windows.update(currentWin.id, target,runner.listener());
			});
		});
		
		runner.step(function(){
			setTimeout(runner.listener(),500); // Wait until it is resized
		});
		
		runner.step(function(){
			target  = new Rect({
					top: 70,
					left: 70,
					width : 1000,
					height : 700
			});
			
			viewport.resize(target , currentWin, runner.listener());			
		});
		
		runner.step(function(win) {
			var rect1 = target;
			var rect2 = new Rect(win);
			console.log(target,win)
			ok(rect1.equal(rect2), "Viewport.resize() return when the window is updated completely");
//			setTimeout(runner.listener(),500);
			runner.next();
		});

		runner.run(function(){
			QUnit.start();
		});
		
	});

	
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
	
	asyncTest("Single Window with multiple tab",function testSingleWindowMultipleTab(){
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
	
	asyncTest("Arrange",function testArrange() {
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
			ok(runner.size() == 0);
			QUnit.start();
		});
		
	});
	
	asyncTest("Merge with multie windows",function() {
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
	
	QUnit.start();

});