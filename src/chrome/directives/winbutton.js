
/* Window Button 
 * 
 * Represent the size of a window after the action.
 * 
 * Each window button is further divided into 4 grid,
 * it is used for bookmarked links.
 */

define(["module"],
         function(self) {
    
    function Controller($scope,$element,$timeout) {
        
        $scope.color = "transparent";        
        $scope.rendered = false;
        
        // The information of children grid
        $scope.grids = [];

        for (var i = 0 ; i < 4;i++){
            $scope.grids.push( { link : { color : "transparent"
                                    }
            });
        }
        
        // Mapping of links to grids (depend on the no. of link)
        var map = [ [-1,-1,-1,-1],
                    [0,0,-1,-1],
                    [0,1,-1,-1],
                    [0,1,2,-1] ];
        
        
        $scope.$watch("links",function() { // links -> grids.link
            if ($scope.links) {
                
                if ($scope.links[0] &&  $scope.links[0].color) {                   
                    var m = map[$scope.links.length];
                    for (var i = 0 ; i < 4;i++){
                        var link = { color : "transparent" };
                        if (m[i] >= 0)
                            link = $scope.links[m[i]];
                        $scope.grids[i].link = link;
                    }
                }
            }
        });
        
        $scope.$watch(function(scope) { // links,rendered -> grids.group
            return {
                links : scope.links,
                rendered : scope.rendered
            }
        },function() {
            if (!$scope.rendered || $scope.links == undefined)
                return;
            var m = map[$scope.links.length];
            var groups = [];
            
            for (var i = -1 ; i < 4;i++) {
                groups[i] = [];
                for (var j in m) {
                    if (m[j] == i) {
                        console.log(j);
                        groups[i].push($($scope.element).children()[j]);
                    }
                }
            }
            
            for (var i = 0 ; i < 4;i++) {
                $scope.grids[i].group = groups[m[i]];
            }
            
        },
        true);
        
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
        
        $scope.$watch(function(scope) {
            return { 
                orientation : scope.orientation,
                w: scope.element.width() ,
                h: scope.element.height(),
                rendered : scope.rendered 
            }
        }, function() {
            if (!$scope.rendered)
                return false;
            
            // Initialize the grid elements
            $($scope.element).children().each(function(idx,elem) {
                if ($scope.orientation == "H") {
                   $(elem).width($scope.element.width()/2);
                   $(elem).height($scope.element.height()/2);
                } else {
                   $(elem).width($scope.element.width()/4);
                   $(elem).height($scope.element.height());                    
                }
                
                (function(idx,parent) {
                    $(elem).hover(function(event) {
                        event.preventDefault();
                        if ($scope.grids[idx].group == undefined) {
                            $(parent).css("background-color","yellow");
                        }
                        $($scope.grids[idx].group).each(function(i,elem) {
                           $(elem).css("background-color","yellow");
                        });
                    },function(event) {
                        event.preventDefault();
                        if ($scope.grids[idx].group == undefined) {
                            $(parent).css("background-color",$scope.grids[idx].link.color);  
                        }
                        $($scope.grids[idx].group).each(function(i,elem) {
                           $(elem).css("background-color",$scope.grids[idx].link.color);  
                        });
                    });
                    $(elem).css("background-color",$scope.grids[idx].link.color);  
                    
                    $(elem).click(function(event) {
                        var link = undefined;

                        if ($scope.grids[idx].link.color != "transparent"){
                            link = $scope.grids[idx].link
                        }
                        event.preventDefault();
                        $scope.onClick({ $event :event, 
                                           $link : link
                                        });
                    });
                    
                })(idx,$scope.element);
        
            }); // End of watch
        },
        true);
    }
    
    Controller.inject = ["$scope","$element","$timeout"];
    
    function factory() {
        var def = {
            replace: true,
            transclude: false,
            template : "<div><div ng-repeat='i in [1,2,3,4]' style='float:left' on-repeat-finish='$parent.rendered = true' ></div></div>",
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
                
                /*
                $(element).hover(function() {
                    $(element).css("background-color","yellow");  
                },function() {
                    $(element).css("background-color","transparent");  
                });
                */

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
