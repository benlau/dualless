/* Testing Utilities */

/**
 * closeAllOtherWindow(callback());
 * closeAllOtherWindow(win,callback());
 */

define(["module",
        "dualless/utils/taskrunner",
        "dualless/utils/rect",
        "dualless/sys/viewport",
        "dualless/sys/os",
        "testlib"],
		function testUtil(self,
						TaskRunner,
						Rect,
						Viewport,
						os) {
	
	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	
	module("Utility and misc Test");
	
	test("os",function() {
		ok(os !== undefined);
		ok(typeof os == "function");
	});
	
	asyncTest("closeAllOtherWindow", function test_closeAllOtherWindow(){

        console.log("Test case : closeAllOtherWindow");
		
		// This test case is written in using $.Deferred()'s pipe() method
		// Show the different with task runner.
		
		expect(2);
		var rect = {
				top : 30,
				left : 30,
				width : 400,
				height : 400
		};
		var runner = new TaskRunner();
		var current = undefined;
		var d = $.Deferred();
		
		d.pipe(function() {

			var p = $.Deferred();
			manager.currentWindow(function(win) {
				current = win;
				p.resolve(win);
			});
			return p;
		}).pipe(function() {

			var p = $.Deferred();
			chrome.windows.create(rect,function() { // Create one more windows to make sure there has at least 2 windows available
				setTimeout(function() { 
					// Let's Window creation be visible to human
					p.resolve(); 					
				},300);
			});
			return p;

		}).pipe(function() {

			var p = $.Deferred();
			closeAllOtherWindow(current,function() { 
				p.resolve();
			});
			return p;
		}).pipe(function() {

			var p = $.Deferred();
			chrome.windows.getAll({populate : true},function(windows) {
				ok(windows.length == 1 , 
				   "After called closeAllOtherWindow(). It should have only 1 window leave , Now has " + windows.length + " windows");
				 p.resolve();
			});
			return p;
		}).pipe(function() {
			var p = $.Deferred();			
			closeAllOtherWindow(current,function() {
				ok(1, "closeAllOtherWindow() should also works with single window condition. No exception raised");
				p.resolve();
			});
			return p;
		}).done(function() {
            console.log("End of test case : closeAllOtherWindow");			
			QUnit.start();
		});

		d.resolve();

		
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
			console.log(target,win,manager.os())
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
				console.log(target,win,rect1,rect2)
				ok(rect1.equal(rect2),"The resize is completed");
				runner.next();
			});
		});
	
		runner.run(function() {
			QUnit.start();
		});
	});
	
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
		console.log(r3.toString());
		ok(r3.toString() == "[65,24 1983x1128]");
	});
	
	test("Rect Data #2", function testRect2(){
		/* Second set of test data */
		var r1 = new Rect({top: 24, left:65,width : 594,height:1128});
		var r2 = new Rect({top: 24, left:595,width : 1389,height:1128});
		var r3 = r1.intersect(r2);
		ok(r3.size() > 0 , "Intersected");
		console.log(r1,r2,r3);
		
	});

});
