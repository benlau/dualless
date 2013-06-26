


define(["dualless/utils/rect"],
        function(Rect) {
    
    var split = function(rect,options) {
        var param1 = options.param1;
        var param2 = options.param2;
        var orientation = options.orientation;
        var position = options.position;
        
        var ratio = param1 / (param1 + param2);
//        console.log(ratio);
        
        var left = rect.left;
        var top = rect.top;
        var width = rect.width;
        var height = rect.height;
        
        var length; // The length of rect1 (depend on orientation)
        
        if (orientation == "H") {
            length = parseInt(width * ratio,10);
            width=length;
        } else {
            length = parseInt(height * ratio,10);
            height=length;        
        }
        
       var rect1 = new Rect({
            left : left,
            top : top,
            width : width,
            height : height
        });

       if (orientation == "H") {
                left = left + length +1;
                width = rect.width - length - 1;
       } else {
             top = top + length + 1;
             height = rect.height - length - 1;
        } 

       var rect2 = new Rect({
              left : left,
              top : top,
              width : width,
              height : height
          });
       
       var res = [rect1,rect2];
       if (position !== 0)
           res = [rect2,rect1];

//        console.log("Viewport.split",options,this._size,rect1,rect2);
       
       return res;
    };

    return split;
});
