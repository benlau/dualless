
export function BookmarkItem() {
    var sheet = "<link  href='directives/bookmarkitem.css' rel='stylesheet'>";
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

        $scope.click = function($event) {
            $scope.onClick({});
        }
        
        $scope.$watch(function() {
            return $scope.selected;
        },function() {
            if ($scope.selected) {
                $($element).addClass("bookmark-item-selected");
            } else {
                $($element).removeClass("bookmark-item-selected");                                
            }
        });
        
        $scope.linkFunc = function(element) {
            var removeButton = $(element).find(".bookmark-item-remove-button");
            $(element).hover(function () {
                $(removeButton).css("visibility","visible");
            },function() {
                // unhover
                $(removeButton).css("visibility","hidden");                
            });
            $(removeButton).css("visibility","hidden");                
        }        

    }
	
	function factory() {
		var def = {
            replace: true,
            transclude: false,
            templateUrl : "directives/bookmarkitem.html",
            controller: Controller,
            restrict : 'E',
            scope : { link : "=",
                      selected : "=",
                      onRemove : "&",
                      onClick : "&"
                     },
            link : function(scope,iElement, iAttrs, controller) {
                scope.linkFunc(iElement);
            }
		};
		return def;
	}
	
	return factory; 
};
