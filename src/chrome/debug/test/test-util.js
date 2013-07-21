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
        "dualless/utils/split",
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
