define(["module"],
        function(self) {

	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");


	var sheet = "<link  href='" + uri + "/../directive/splitpanel.css' rel='stylesheet'>";
	$("head").append(sheet);
    
    /** Creator of SplitPanelController
     * 
     * @params orientation Either of "H" or "V"
     */
    function create(orientation) {
        
        function update(args,event) {
            if (event.button == 1 ||
                (event.button == 0 && event.metaKey == true)) {
                args.duplicate = true;
                args.position = 1 - args.position;
            }
        }

        function Controller($scope,$location) {
            var arr = [];
            for (var i = 3 ; i <=7;i++ ) {
                var pair = [i , 10-i];
                arr.push(pair);
            }	
                
            $scope.choices = arr;

            $scope.split = function (param1,param2,position,event) {
                var args = {param1: param1,
                            param2: param2,
                            position : position,
                            orientation : orientation};
                
                update(args,event);

                $scope.$emit("split",args);
            };

            $scope.merge = function() {
                $scope.$emit("merge");
            };
            
            $scope.showBookmark = function(param1,param2,position) {
                $location.path("/bookmark/h/3/7");
            }
            
        };
        
        Controller.$inject = ["$scope","$location"]
                
        return Controller
    }
    
    return create
});
