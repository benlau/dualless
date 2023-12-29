
/* Information of known site
 */

const sites = [
    {
      "color": "#f4b400",
      "pattern": "drive.google.com/keep",
      "name": "Google Keep"
    },
    {
      "color": "#23658b",
      "pattern": "trello.com",
      "name": "Trello"
    },
    {
      "color": "#cf682f",
      "pattern": "plurk.com",
      "name": "Plurk"
    },
    {
      "color": "#da4835",
      "pattern": "plus.google.com",
      "name": "Google+"
    },
    {
      "color": "#000000",
      "pattern": "rememberthemilk.com",
      "name": "Remember the Milk"
    },
    {
      "color": "#3b5998",
      "pattern": "facebook.com",
      "name": "Facebook"
    },
    {
      "color": "#d93838",
      "pattern": "gmail.com",
      "name": "GMail"
    },
    {
      "color": "#d93838",
      "pattern": "mail.google.com",
      "name": "GMail"
    },
    {
      "color": "#00aeed",
      "pattern": "twitter.com",
      "name": "Twitter.com"
    },
    {
      "color": "#2c4762",
      "pattern": "tumblr.com",
      "name": "tumblr"
    },
    {
      "color": "#c7242c",
      "pattern": "pinterest.com",
      "name": "Pinterest"
    },
    {
      "color": "#2fb572",
      "pattern": "drive.google.com",
      "name": "Google Drive"
    },
    {
      "color": "#6cc655",
      "pattern": "feedly.com",
      "name": "Feedly"
    },
    {
      "color": "#479bf2",
      "pattern": "google.com/calendar",
      "name": "Google Calender"
    },
    {
      "color": "#000000",
      "pattern": "6wunderkinder.com",
      "name": "Wunderlist"
    },
    {
      "color": "#fc6100",
      "pattern": "blogspot.com",
      "name": "Blogspot"
    }
  ];

export class Site {
    static find(url) {
        return sites.find(function(s) {
            return url.match(s.pattern);
        })?.[0];
    }
}

// define(["module"],
//         function(self) {
            

//     var uri = self.uri;
//     var arr = uri.split("/");
//     arr.pop();
//     uri = arr.join("/");	    
    
//     $.getJSON(uri + "/site.json",function(data) {
//        sites = data;
//     });

//     return {
        
//       find : function(url) {
//           var ret;
//           for (var i in sites) {
//               var s = sites[i];
//               if (url.match(s.pattern)) {
//                   ret = s;
//                   break;
//               }
//           }
//           return ret;
//       }
      
        
//     };
    
// });
