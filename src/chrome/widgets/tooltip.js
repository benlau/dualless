
/** Tooltip - A implementation of tooltip
 * 
 */

define(["module"],
        function(self) {
    
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	    

    var sheet = "<link href='" + uri + "/tooltip.css' rel='stylesheet'>";
    $("head").append(sheet);
    
    var element = $("<div class='dualless-tooltip'></div>");
            
    function Tooltip() {
        this.element = element;
        $("body").append(this.element);
    }
    
    Tooltip.prototype.show = function() {
        $(this.element).css("display","block");
    }
    
    Tooltip.prototype.hide = function() {
        $(this.element).css("display","none");
    }
    
    Tooltip.prototype.position = function(x,y) {
        $(this.element).css({ top : y });
    }
    
    Tooltip.prototype.title = function(title) {
        $(this.element).html("<div class=dualless-tooltip-title>" + title + "</div>");
    }
   
    return Tooltip; 
});
