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
   
   TabTracker.prototype.tabAsync = function(key,callback) {
       callback(this._tabs[key]);
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
   }
    
   return TabTracker; 
});
