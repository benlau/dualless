


define(["dualless/utils/rect"],
        function(Rect) {

    /** If any rectangle is smaller than the minSize,
     * the result will be adjusted.
     * 
     */            
    function adjustByMinSize(viewport,rects,minSize) {
        var smallerCount = 0, // no. of rect which is less then the minSize
             min; // The min rectangle
        
        if (minSize === undefined)
            minSize = {width : 0 , height : 0};
        
        for (var i = 0 ; i < rects.length ;i++) {
            if (rects[i].width < minSize.width ||
                rects[i].height < minSize.height) {
                smallerCount++;
                min = rects[i];
            }
        }
        
        if (smallerCount == 1) { 

            // Ignore 0 or 2.
            // If the count is 2, it has no way to adjust.
            var dw = minSize.width - min.width,
                 dh = minSize.height - min.height;
            if (dw < 0)
                dw = 0;
            if (dh < 0)
                dh = 0;
            
            for (var i = 0 ; i < rects.length ;i++) {
                if (rects[i].width < minSize.width ||
                    rects[i].height < minSize.height) {
                        
                    rects[i].width += dw;
                    rects[i].height += dh;
                    
                    if (i === 1) { // It is on the right / bottom
                        rects[i].left -= dw;
                        rects[i].top -= dh;
                    }
                        
                } else {
                    rects[i].width -= dw;
                    rects[i].height -= dh;                   
                    
                    if (i === 1) { // It is on the right / bottom
                        rects[i].left += dw;
                        rects[i].top += dh;
                    }
                }
            }
        }

    }
    
    var split = function(rect,options,minSize) {
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
       
       adjustByMinSize(rect,res,minSize);
       
       if (position !== 0)
           res = [rect2,rect1];

//        console.log("Viewport.split",options,this._size,rect1,rect2);


        return res;
    };

    return split;
});
