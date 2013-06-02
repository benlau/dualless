
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
    
    return BindingList;
});
