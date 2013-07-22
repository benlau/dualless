/** TabTracker
 * 
 * Track a list of given tab identify by key.
 * 
 */

define(function() {
   
   function TabTracker() {
       this._tabs = {};
   }
   
   /** Add a tab with key for tracking
    */
   TabTracker.prototype.add = function(key,tab) {
       this._tabs[key] = tab;
   }
   
   TabTracker.prototype.remove = function(key) {
       delete this._tabs[key];
   }
   
   /** Find a tracking tab by the key
    */
   TabTracker.prototype.tab = function(key) {
       return this._tabs[key];
   }

   /** Find a tracking tab by the key and return in async operation
    */
   
   TabTracker.prototype.tabAsync = function(url,callback) {
        var tab = this._tabs[url];
       
        if (tab) {
            callback(tab);
            return;
        }
       
        chrome.windows.getAll({populate : true},function(windows) {
            $(windows).each(function(idx,w){
                
                $(w.tabs).each(function(idx,t) {
                     if (t.url == url) { // Assumption changed. Key is URL.
                         tab = t;
                         return false;
                     }
                });
                if (tab)
                    return false;
            });
            callback(tab);

        });

   }
   
   /** Find the key 
    */
   
   TabTracker.prototype.key = function(tabId) {
       var k;
       
       for (var i in this._tabs) {
            var tab = this._tabs[i];
            if (tab.id == tabId) {
                k = i;
                break;
            }
       }
       return k;
   }

   /**  Start the tracker
    */
   TabTracker.prototype.start = function() {
       var self = this;
       chrome.tabs.onRemoved.addListener(function(tabId) {
           var key = self.key(tabId);
           if (key) {
               delete self.remove(key);
           }
       });
       
       chrome.tabs.onAttached.addListener(function(tabId,info) {
           var key = self.key(tabId);
           if (key) {
               var tab = self.tab(key);
               tab.windowId = info.newWindowId;
               tab.index = info.newPosition;
           }
       });
       
       chrome.tabs.onUpdated.addListener(function(tabId, changeInfo,tab) {
           var key = self.key(tabId);

           if (!key || !changeInfo.url) 
               return;
           var a1 = document.createElement('a'),
               a2 = document.createElement('a');
           
           a1.href = changeInfo.url;
           a2.href = key;

           if (a1.hostname != a2.hostname) {
               self.remove(key);
           }
       });
       
   }
    
   return TabTracker; 
});
