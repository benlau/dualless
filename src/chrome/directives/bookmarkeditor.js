
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
        
        // link => title , url
        $scope.$watch(function(){
            return $scope.link;
        }, function() {

            if ($scope.link === undefined) {
                $($element).addClass("bookmark-editor-disabled");
                $($element).find(".bookmark-editor-input").attr("disabled","disabled");
                $scope.title = "";
                $scope.url = "";
            } else {
                $($element).removeClass("bookmark-editor-disabled");
                $($element).find(".bookmark-editor-input").removeAttr("disabled","");                
                $scope.title = $scope.link.title;
                $scope.url = $scope.link.url;
            }
        },
        true);
        
        // title , url => link;
        $scope.$watch(function(){
            return {
                title : $scope.title,
                url : $scope.url
            };
        },function() {
            if ($scope.link !== undefined) {
                $scope.link.title = $scope.title;
                $scope.link.url = $scope.url;                
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
