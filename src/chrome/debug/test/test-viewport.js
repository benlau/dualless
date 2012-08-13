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

});