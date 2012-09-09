/* Split Panel Shared Resource */

define(["module"],
		function splitpanel(self) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");

	var sheet = "<link  href='" + uri + "/splitpanel.css' rel='stylesheet'>";
	$("head").append(sheet);

	return {
	    // Update the split arguments according to the event
	    update : function(args,event) {	
          
            if (event.button == 1 ||
                (event.button == 0 && event.metaKey == true)) {
                args.duplicate = true;
                args.position = 1 - args.position;
            }
	    }
	    
	};
});
