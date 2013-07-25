
define(["module"],
        function(self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	

    var initialData = {
        "links": {
            "H_60_40_1": [{
                "color": "#479bf2",
                "title": "Explore bookmark",
                "url": "http://dualless.blogspot.com/p/bookmark.html"
            }]
        }
    }

    return {
        data : function() {
            return initialData;
        }
    }
});
