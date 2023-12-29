requirejs.config({
    paths: {
        "dualless": "."
    }
});

import { windowManageServiceInstance } from "./sys/service.js";
import { PanelView } from "./views/panel.js";
import { WinButton } from "./directives/winbutton.js";
import { BookmarkList } from "./directives/bookmarklist.js";
import { BookmarkEditor } from "./directives/bookmarkeditor.js";
import { BookmarkItem } from "./directives/bookmarkitem.js";
import { Bookmark } from "./views/bookmark.js";
import { BookmarkDefaultData } from "./data/bookmarkdata.js";

require([
    "dualless/directives/colorpicker",
],
    function popup(
        colorPicker,
    ) {

        var app = angular.module("popup", []);

        app.config(['$routeProvider', function configRouteProvider($routeProvider) {
            $routeProvider.when("/panel", PanelView());
            $routeProvider.when("/panel/:orientation", PanelView());
            $routeProvider.when("/bookmark/:orientation/:param1/:param2/:position", Bookmark());
            // @TODO - Enable to remember the horizontal or vertical mode.
            $routeProvider.otherwise({ redirectTo: "/panel" });

        }]);

        app.directive('bookmarklist', BookmarkList());
        app.directive('bookmarkeditor', BookmarkEditor());
        app.directive('bookmarkitem', BookmarkItem());
        app.directive('winbutton', WinButton());
        app.directive('colorPicker', colorPicker);
        app.directive('onRepeatFinish', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last === true) {
                        scope.$evalAsync(attr.onRepeatFinish);
                    }
                }
            };
        });


        if (chrome === undefined || chrome.extension === undefined) {

            // It is not running as Chrome extenison
            // Resgier a mock WindowManager service so that the program can be tested 
            // just like a normal web page. (for verify the style)
            app.factory("WindowManager", function () {
                return {
                    split: function () { },
                    merge: function () { },
                    window: function () { },
                    tab: function () {
                        return {
                            title: "Test data",
                            url: "http://www.google.com"
                        };
                    }
                };
            });

        } else {
        }

        app.factory("WindowManager", function () {
            return windowManageServiceInstance;
        });

        app.run(function ($rootScope) {

            if (localStorage.bookmark === undefined) {
                // Initial data
                localStorage.bookmark = JSON.stringify(BookmarkDefaultData);
            }

            try {
                $rootScope.bookmark = JSON.parse(localStorage.bookmark);

                if ($rootScope.bookmark.links === undefined) // In case the data is corrupted
                    $rootScope.bookmark.links = {}

            } catch (e) {
                console.log("Loading bookmark fail : " + e);
                console.log("Create a empty bookmark");
                $rootScope.bookmark = {
                    links: {}
                }
            }

            $rootScope.$watch(function () { // Save bookmark to localStorage
                return $rootScope.bookmark;
            }, function () {
                localStorage.bookmark = JSON.stringify($rootScope.bookmark);
            }, true);
        });

        $(document).ready(function () {
            angular.bootstrap(document, ["popup"]);
        });
    });



