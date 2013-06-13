
/* Information of known site
 */

define(function() {

    // @TODO. Read from JSON file    
    var sites = [
        { name : "Google Keep",
          pattern : "drive.google.com/keep",
          color : "#f4b400"
        },

        { name : "Trello",
          pattern : "trello.com",
          color : "#23658b"
        },


        { name : "Plurk",
          pattern : "plurk.com",
          color : "#cf682f"
        }
        
    ];

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