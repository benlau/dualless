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
						os,
                        split) {
	
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
    
    test("Split calculation",function () {
        var rect = {
            top : 24,
            left : 65,
            width : 2048 - 65,
            height : 1152 - 24
            },
            options = {
                param1 : 7,
                param2 : 3,
                position : 0,
                orientation : "H"
            },
            rects = [];
            
        rects = split(rect , options);
        console.log(rects);
        ok(rects.length == 2);
        ok(rects[1].width == 594);
        options.minSize = { width : 796 , 
                              height : 100} ; // Min size

        // Test min size
        rects = split(rect,options); 

        ok(rects.length == 2);
        console.log(rects);
        ok(rects[1].left == 1252);
        ok(rects[1].top == 24);
        ok(rects[1].width == 796 , "Min size should be 796");

        // Min size is larger than half. The split function
        // should ignore as it not achievable

        options.param1 = 5;
        options.param2 = 5;
        options.minSize = { width : 1050 , 
                              height : 100} ;
        
        rects = split(rect,options); 

        console.log(rects);
        ok(rects[0].width == 991);
        ok(rects[1].width == 991);

        
    });

});
