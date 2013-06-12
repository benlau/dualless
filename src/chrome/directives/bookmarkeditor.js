
define(["module"],
         function(self) {
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	

	var sheet = "<link  href='" + uri + "/../directives/bookmarkeditor.css' rel='stylesheet'>";
	$("head").append(sheet);

    function Controller($scope,$element) {
        
        $scope.colors = ["RGB(152,0,0)",
                         "RGB(255,0,0)",
                         "RGB(255,153,0)",
                         "RGB(255,255,0)",
                         "RGB(0,255,0)",                         
                         "RGB(0,255,255)",                         
                         "RGB(74,134,232)",
                         "RGB(0,0,255)",                         
                         "RGB(153,0,255)",
                         "RGB(255,0,255)",
                         "#f4b400", // Google Drive
                         "black"];
                         
        $scope.setColor = function(color) {
            $scope.color = color;    
        };
        
        // link => title , url
        $scope.$watch(function(){
            return $scope.link;
        }, function() {

            if ($scope.link === undefined) {
                $($element).addClass("bookmark-editor-disabled");
                $($element).find(".bookmark-editor-input , .bookmark-editor-color-input").attr("disabled","disabled");
                $scope.title = "";
                $scope.url = "";
                $scope.color = "";
            } else {
                $($element).removeClass("bookmark-editor-disabled");
                $($element).find(".bookmark-editor-input , .bookmark-editor-color-input").removeAttr("disabled","");                
                $scope.title = $scope.link.title;
                $scope.url = $scope.link.url;
                $scope.color = $scope.link.color;
            }
        },
        true);
        
        // title , url => link;
        $scope.$watch(function(){
            return {
                title : $scope.title,
                url : $scope.url,
                color : $scope.color
            };
        },function() {
            if ($scope.link !== undefined) {
                $scope.link.title = $scope.title;
                $scope.link.url = $scope.url;
                $scope.link.color = $scope.color;
            }
        },
        true);
        
        $scope.$watch("color",function() {
           var color = $scope.color;
           if (color.match("^ *RGB")){
                var str = color.replace(/.*RGB.*\(/,"").replace(/\).*/,"");
                var token = str.split(",");
                $(token).each(function(idx,val) {
                   token[idx] = parseInt(val,0);
                });
                var hex = "#" + ((1 << 24) + (token[0] << 16) + (token[1] << 8) + token[2]).toString(16).slice(1);
                $scope.color = hex;
           }
        });
        
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
