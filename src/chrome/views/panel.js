
// Panel view

define(["module"],
        function(self) {

	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");

	var sheet = "<link  href='" + uri + "/panel.css' rel='stylesheet'>";
	$("head").append(sheet);
    
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

        function Controller($scope,
                                $location,
                                $routeParams,
                                $rootScope) {

            var arr = [];
            for (var i = 3 ; i <=7;i++ ) {
                var pair = [i , 10-i];
                arr.push(pair);
            }	
                
            $scope.choices = arr;
            
            $scope.orientation = $routeParams.orientation.toUpperCase();

            $scope.split = function (param1,param2,position,link,event) {
                var args = {param1: param1,
                            param2: param2,
                            position : position,
                            orientation : $scope.orientation};
                
                update(args,link,event);

                $scope.$emit("split",args);
            };

            $scope.merge = function() {
                $scope.$emit("merge");
            };
            
            $scope.showBookmark = function(orientation,param1,param2,position) {
                $location.path("/bookmark/" + orientation.toLowerCase() + "/" + param1 + "/" + param2 + "/" + position);
            }
            
            $rootScope.$watch(function(scope) {
                return scope.bookmarks.buttons;
            },function() {
                $scope.$evalAsync(function() {
                    $scope.buttons = $rootScope.bookmarks.buttons;
                });
            },
            true);
        };
        
        Controller.$inject = ["$scope",
                                "$location",
                                "$routeParams",
                                "$rootScope"
                                ]
    
    // Factory for route provider
    return {
        templateUrl : uri + "/panel.html",
        controller : Controller
    }
});
