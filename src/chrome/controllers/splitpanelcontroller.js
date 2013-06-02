define(["module"],
        function(self) {

	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");


	var sheet = "<link  href='" + uri + "/../directives/splitpanel.css' rel='stylesheet'>";
	$("head").append(sheet);
    
    /** Creator of SplitPanelController
     * 
     * @params orientation Either of "H" or "V"
     */
    function create(orientation) {
        
        // update the arguments
        function update(args,link,event) {
            
            if (event.button == 1 ||
                (event.button == 0 && event.metaKey == true)) {
                    // Middle key is pressed
                args.action = {
                    duplicate : true
                }
                args.position = 1 - args.position;
            } else if (link != undefined) {
                // The button is binded with link from bookmark
                args.action = {
                    link : link
                }
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
            
            $scope.orientation = orientation;

            $scope.split = function (param1,param2,position,link,event) {
                var args = {param1: param1,
                            param2: param2,
                            position : position,
                            orientation : orientation};
                
                update(args,link,event);

                $scope.$emit("split",args);
            };

            $scope.merge = function() {
                $scope.$emit("merge");
            };
            
            $scope.showBookmark = function(orientation,param1,param2,position) {
                $location.path("/bookmark/" + orientation.toLowerCase() + "/" + param1 + "/" + param2 + "/" + position);
            }
            
        };
        
        Controller.$inject = ["$scope","$location"]
                
        return Controller
    }
    
    return create
});
