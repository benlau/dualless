
/* Information of known site
 */

define(["module"],
        function(self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	    
    
    $.getJSON(uri + "/site.json",function(data) {
       sites = data;
    });

    return {
        
      find : function(url) {
          var ret;
          for (var i in sites) {
              var s = sites[i];
              if (url.match(s.pattern)) {
                  ret = s;
                  break;
              }
          }
          return ret;
      }
      
        
    };
    
});
