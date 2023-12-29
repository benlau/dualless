// Panel view

import { MergeOptions } from "../sys/mergeoptions.js";
import { SplitOptions } from "../sys/splitoptions.js";
var sheet = "<link  href='views/panel.css' rel='stylesheet'>";
$("head").append(sheet);

export function PanelView() {

    function Controller($scope,
        $location,
        $routeParams,
        $rootScope,
        WindowManager) {

        var arr = [];
        for (var i = 3; i <= 7; i++) {
            var pair = [i, 10 - i];
            arr.push(pair);
        }

        $scope.choices = arr;

        if ($routeParams.orientation) {
            $scope.orientation = $routeParams.orientation.toUpperCase();
        } else {
            $scope.orientation = localStorage.panelLastMode;
            if ($scope.orientation != "H" &&
                $scope.orientation != "V")
                $scope.orientation = "H";
        }

        localStorage.panelLastMode = $scope.orientation;

        $scope.split = function (param1, param2, position, link, event) {
            const splitOptions = new SplitOptions(
                param1, param2, position, $scope.orientation, window.screen);

            if (event.button == 1 ||
                (event.button == 0 && event.metaKey == true)) {
                // Middle key is pressed
                splitOptions.setDuplicate(true);
            } else if (link != undefined) {
                splitOptions.setOpenLink(link);
            }
            WindowManager.split(splitOptions);
        };

        $scope.merge = function () {
            const mergeOptions = new MergeOptions(window.screen);
            WindowManager.merge(mergeOptions);
        };

        $scope.showBookmark = function (orientation, param1, param2, position) {
            $location.path("/bookmark/" + orientation.toLowerCase() + "/" + param1 + "/" + param2 + "/" + position);
        }

        $rootScope.$watch(function (scope) {
            return scope.bookmark.links;
        }, function () {
            $scope.$evalAsync(function () {
                $scope.links = $rootScope.bookmark.links;
            });
        },
            true);
    };

    Controller.$inject = ["$scope",
        "$location",
        "$routeParams",
        "$rootScope",
        "WindowManager"
    ]

    // Factory for route provider
    return {
        templateUrl: "views/panel.html",
        controller: Controller
    }
}
