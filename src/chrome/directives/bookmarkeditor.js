
define(["module"],
         function(self) {
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	

	var sheet = "<link  href='" + uri + "/../directives/bookmarkeditor.css' rel='stylesheet'>";
	$("head").append(sheet);

    function Controller($scope) {
        $scope.colors = [];
        for (var i = 0 ; i < 18;i++){
            $scope.colors.push("#f4b400");
        }
    }

    function factory() {
        var def = {
            replace: true,
            transclude: false,
            templateUrl : uri + "/bookmarkeditor.html",
            controller: Controller,
            restrict : 'E',
            require : "?ngModel"
        }
        return def;
    }

    return factory;
});
