
// Bookmark binding list data model

define(function() {

    function clone(obj) {
        function F() { }
        F.prototype = obj;
        return new F();
    }
    
    function BindingList() {
        this.push.apply(this,arguments);
    }
   
    BindingList.prototype = clone(Array.prototype);
    
    BindingList.prototype.find = function(cond) {
        var ret = [];
        for (var i in this) {
            var item = this[i];
            var match = true;
            for (var j in cond) {
                if (item[j] != cond[j]) {
                    match = false;
                    break;
                }
            }
            if (match)
                ret.push(item);
        }
        
        return ret;
    }
    
    return BindingList;
});
