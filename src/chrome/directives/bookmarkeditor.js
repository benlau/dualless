
define(["module"],
         function(self) {
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	

	var sheet = "<link  href='" + uri + "/../directives/bookmarkeditor.css' rel='stylesheet'>";
	$("head").append(sheet);

    function Controller($scope,$element) {
        $scope.title = "";
        $scope.url = "";
        
        $scope.colors = [];
        for (var i = 0 ; i < 18;i++){
            $scope.colors.push("#f4b400");
        }
        
        $scope.$watch(function(){
            return $scope.link;
        }, function() {
            if ($scope.link === undefined) {
                $($element).addClass("bookmark-editor-disabled");
                $($element).find(".bookmark-editor-input").attr("disabled","disabled");
            } else {
                $($element).removeClass("bookmark-editor-disabled");
                $($element).find(".bookmark-editor-input").attr("disabled","");                
            }
        },
        true);
    }

    function factory() {
        var def = {
            replace: true,
            transclude: false,
            templateUrl : uri + "/bookmarkeditor.html",
            controller: Controller,
            restrict : 'E',
            scope : {
                "link" : "=link"
            }
        };
        return def;
    }

    return factory;
});
