
/* Window Button 
 * 
 * Represent the size of a window after the action
 */

define(["module"],
         function(self) {
    
    function Controller($scope,$element,$timeout) {
        
        $scope.color = "transparent";        
        
        $scope.$watch("links",function() {
            if ($scope.links) {
                if ($scope.links[0] &&  $scope.links[0].color) {
                    var link = $scope.links[0];
                    $scope.color = link.color;
                    $($scope.element).css("background-color",$scope.color);
                    $scope.link = link;
                }
            }
        });
        
        $scope.$watch(function(scope) {
            return scope.orientation + scope.ratio;
        },function() {
            if ($scope.ratio == undefined ||
                $scope.orientation == undefined) 
                return
            
            var cls = "",
                 ratio = $scope.ratio || "",
                 orientation = $scope.orientation;

            if (orientation == 'H') {
                cls = "hsplit-panel-win";
            } else {
                cls = "vsplit-panel-win";
            }

            $($element).addClass(cls);
            $($element).addClass(cls + ratio);            
        });      
    }
    
    Controller.inject = ["$scope","$element","$timeout"];
    
    function factory() {
        var def = {
            replace: true,
            transclude: false,
            template : "<div></div>",
            controller: Controller,
            restrict : 'E',
            require : "?ngModel",
            scope : {
                orientation : "@",
                ratio : "@",
                key : "@",
                links : "=links",
                onClick : "&",
                onRightClick : "&"
            },
            link : function(scope, element, attrs, ngModel) {
                scope.element = element;
                $(element).hover(function() {
                    $(element).css("background-color","yellow");  
                },function() {
                    $(element).css("background-color",scope.color);  
                });
                
                $(element).click(function(event) {
                    scope.onClick({ $event :event, 
                                      $link : scope.link
                                    });
                });

                $(element).addClass("split-panel-win");

                element.bind('contextmenu', function(event) {
                    scope.$apply(function(scope) {
                        event.preventDefault();
                        scope.onRightClick();
                    });
                });                
            }
        };
        return def;
	}
    
    return factory;
});
