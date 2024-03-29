
/** Bookmark view
 * 
 */

import { windowManageServiceInstance } from "../sys/service.js";
import { Site } from "../data/site.js";
import { SplitOptions } from "../sys/splitoptions.js";

export function Bookmark() {
    var sheet = "<link  href='views/bookmark.css' rel='stylesheet'>";
    $("head").append(sheet);

    function Controller($scope,
        $routeParams,
        $rootScope) {

        // var tab = WindowManager.tab();

        $scope.param1 = $routeParams.param1;
        $scope.param2 = $routeParams.param2;
        $scope.orientation = $routeParams.orientation.toUpperCase();
        $scope.position = $routeParams.position;

        $scope.key = buttonKey($scope.orientation,
            $scope.param1,
            $scope.param2,
            $scope.position
        );

        $scope.colors = ["#000000",
            "RGB(152,0,0)",
            "RGB(255,0,0)",
            "RGB(255,153,0)",
            "#d9c404",
            "#6cc655",
            "#23b8b8",
            "RGB(74,134,232)",
            "RGB(0,0,255)",
            "RGB(153,0,255)",
            "RGB(255,0,255)",
            "#f4b400" // Google Drive
        ];

        $scope.selectedLink = undefined;

        // The link of current browsing page. It is pending to add to bookmark
        $scope.pending = {
            title: "",
            url: ""
        };

        windowManageServiceInstance.currentTab().then(function (tab) {
            console.log({ tab });
            $scope.$apply(function () {
                $scope.pending = {
                    title: tab.title,
                    url: tab.url
                };
            });
        });


        // bookmark.links => links , buttons
        $rootScope.$watch(function (scope) {
            return scope.bookmark.links.length;
        }, function () {
            $scope.$evalAsync(function () {
                $scope.links = $rootScope.bookmark.links[$scope.key];
                if ($scope.links === undefined) {
                    $scope.links = [];
                }
                $scope.buttons = [{}, {}];
                $scope.buttons[$scope.position] = {
                    links: $scope.links,
                    disable: false
                };
                $scope.buttons[1 - $scope.position] = {
                    disable: true
                };
            });
        }, true);

        // links => bookmark.links        
        $scope.$watch(function (scope) {
            return scope.links;
        }, function () {
            $rootScope.$evalAsync(function () {
                $rootScope.bookmark.links[$scope.key] = $scope.links;
            });
        },
            true);

        // Add new link to bookmark
        $scope.add = function () {
            if ($scope.links === undefined)
                $scope.links = [];

            var color = $scope.colors[Math.floor(Math.random() * $scope.colors.length)];

            var site = Site.find($scope.pending.url);

            if (site) {
                color = site.color;
            }

            $scope.pending.color = color;
            $scope.links.push($scope.pending);
            delete $scope.pending;
        };

        $scope.back = function () {
            history.back();
            $scope.$evalAsync();
        };

        /** Open the selected link on new tab and split
         */
        $scope.open = function () {
            const options = new SplitOptions(
                parseInt($scope.param1),
                parseInt($scope.param2),
                parseInt($scope.position),
                $scope.orientation,
                window.screen
            );
            options.openLink = $scope.selectedLink;

            if ($scope.selectedLink !== undefined) {
                windowManageWorkerInstance.split(options);
            }
        }

    }

    Controller.inject = ["$scope",
        "$routeParams",
        "$rootScope",
        "WindowManager"];

    // Construction the key for a button    
    function buttonKey(o, p1, p2, pos) {
        return o.toUpperCase() + "_" + p1 * 10 + "_" + p2 * 10 + "_" + pos;
    }

    // Factory for route provider
    return {
        templateUrl: "views/bookmark.html",
        controller: Controller
    };
};
