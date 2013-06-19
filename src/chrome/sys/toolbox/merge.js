
define(["dualless/utils/rect"],
         function(Rect) {

    function merge(options,callback) {
        var windows = options.windows,
             viewport = options.viewport,
             master = windows[0], // master window ; which will be resized to max viewport size,
             tabs = [],// Tabs from other managed windows. All the tab inside will be moved to master window,
             rect;

        rect = viewport.size().toData();

        for (var i =1 ; i < options.windows.length;i++) {
            $(options.windows[i].tabs).each(function(idx,tab){
                tabs.push(tab.id);
            });
        }

        if (tabs.length > 0) {
              chrome.tabs.move(tabs,{windowId:master.id, index : master.tabs.length});
        }		

        chrome.windows.update(master.id,rect,callback);
    }

    return merge;
});
