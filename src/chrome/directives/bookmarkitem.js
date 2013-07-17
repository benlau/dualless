
define(["module"],
		function (self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");
    
    var sheet = "<link  href='" + uri + "/../directives/bookmarkitem.css' rel='stylesheet'>";
	$("head").append(sheet);
 
    function Controller($scope,$element) {
        
        $scope.$watch(function(scope) {
            return scope.link;
        }, function() {
            $scope.title = $scope.link.title;
            $scope.color = $scope.link.color;
        },
        true);
        
        $scope.$watch("pin",function() {
            $scope.$evalAsync(function() {
                $scope.link.pin = $scope.pin;
            });
        });
        
        $scope.remove = function($event) {
            $event.stopPropagation();
            $scope.onRemove({});
        };

        $scope.select = function($event) {
            $event.stopPropagation();
            $scope.onSelect({});
            $($element).addClass("bookmark-item-selected");
        };
        
        $scope.$on("selected",function(event,data) {
            if (data.code != $scope.code) {
                $($element).removeClass("bookmark-item-selected");                
            }
        });
    }
	
	function factory() {
		var def = {
            replace: true,
            transclude: false,
            templateUrl : uri + "/bookmarkitem.html",
            controller: Controller,
            restrict : 'E',
            scope : { link : "=",
                      code : "=",
                      onRemove : "&",
                      onSelect : "&"
                     },
            link : function(scope,iElement, iAttrs, controller) {
                
            }
		};
		return def;
	}
	
	return factory; 
});
