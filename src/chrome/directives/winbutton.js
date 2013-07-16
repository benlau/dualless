
/* Window Button 
 * 
 * Represent the size of a window after the action.
 * 
 * Each window button is further divided into 4 grid,
 * it is used for bookmarked links.
 */

define(["module",
         "dualless/widgets/tooltip"],
         function(self,
                    Tooltip) {

    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	    

    var sheet = "<link  href='" + uri + "/../directives/winbutton.css' rel='stylesheet'>";
    $("head").append(sheet);
    
    var max = 3; // Max no. of links on a winbutton

    /** Collection of element */
    function Group () {
        this.elements = []
    }    
    
    Group.prototype.push = function(elem){
        this.elements.push(elem);
    }
    
    Group.prototype.css = function(attr,value) {
        $(this.elements).each(function(idx,elem){
            $(elem).css(attr,value);
        });
    }
    
    /** Grid - A divided sub-button within winbutton 
     */
    function Grid() {
        this.link = undefined;
        this.group = undefined;
    }

    Grid.prototype.color = function() {
        var color = "transparent";
        if (this.link &&
            this.link.color) {
            color = this.link.color;
        }
        return color;
    }
    
    /** Setup the grid 
     */
    Grid.prototype.setup = function(elem,parent,tooltip) {
        this.element = elem;
        this.parent = parent;
        
        var grid = this,
             link = grid.link || {},
             title = link.title || "";

        $(elem).hover(function(event) {
            if (grid.group === undefined) {
                $(parent).css("background-color","yellow");
            } else {
                grid.group.css("background-color","yellow");
            }
            
            if (title === "") {
                var hint = "Press 'middle' mouse key to duplicate current site";    
                $(elem).attr("title",hint);
            } else {
                event.preventDefault();
                
                var offset = $(elem).offset();
                tooltip.title(title);
                tooltip.position(offset.left, offset.top + $(elem).height());
                tooltip.show();
            }
            
        },function(event) { //unhover
            //event.preventDefault();
            if (grid.group === undefined) {
                $(parent).css("background-color","transparent");  
            } else {
                grid.group.css("background-color",grid.color());  
            }
            tooltip.hide();
        });

        $(elem).css("background-color",grid.color());  
        
    }
    
    function Controller($scope,$element,$timeout) {
        
        var tooltip = new Tooltip();
        
        //$scope.color = "transparent";        
        $scope.rendered = false;
        
        // The information of children grid
        $scope.grids = [];

        for (var i = 0 ; i < 4;i++){
            var grid = new Grid();
            $scope.grids.push(grid);
        }
        
        // Mapping of links to grids (depend on the no. of link)
        var map = [ [-1,-1,-1,-1],
                    [0,0,-1,-1],
                    [0,1,-1,-1],
                    [0,1,2,-1] ];
        
        $scope.setTooltipVisible = function(show){
            if (show) {
                tooltip.show();
            } else {
                tooltip.hide();
            }
        };
        
        $scope.$watch(function() {
            return {links : $scope.links,
                    rendered : $scope.rendered};
        },function() { // links -> grids.link,color of element
            if ($scope.links) {
                var count = $scope.links.length;
                if (count > max ) {
                    count = max;
                }
                
                var m = map[count];
                for (var i = 0 ; i < 4;i++){
                    var link = { color : "transparent" };
                    if (m[i] >= 0)
                        link = $scope.links[m[i]];
                    $scope.grids[i].link = link;
                }

                $($scope.element).children().each(function(idx,elem) {
                    $(elem).css("background-color",$scope.grids[idx].color());
                    var title = $scope.grids[idx].link.title;
                    var draggable = true;
                    if (title === undefined) { 
                        draggable = false;
                    }
                    $(elem).attr("draggable",draggable);
                });
            }
        },true);
        
        // links,rendered -> grids.group
        $scope.$watch(function(scope) { 
            return {
                links : scope.links,
                rendered : scope.rendered
            };
        },function() {
            if (!$scope.rendered || $scope.links === undefined)
                return;
            var count = $scope.links.length;
            if (count > max ) {
                count = max;
            }                

            var m = map[count];
            var groups = [];
            
            for (var i = -1 ; i < 4;i++) {
                groups[i] = new Group();
                for (var j in m) {
                    if (m[j] == i) {
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
            if ($scope.ratio === undefined ||
                $scope.orientation === undefined) 
                return;
            
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

        // Initialize the grid elements
        $scope.$watch(function(scope) {
            return { 
                orientation : scope.orientation,
                w: scope.element.width() ,
                h: scope.element.height(),
                rendered : scope.rendered 
            };
        }, function() {
            if (!$scope.rendered)
                return false;            
            
            $($scope.element).children().each(function(idx,elem) {
                if ($scope.orientation == "H") {
                   $(elem).width($scope.element.width()/2);
                   $(elem).height($scope.element.height()/2);
                } else {
                   $(elem).width($scope.element.width()/4);
                   $(elem).height($scope.element.height());                    
                }
                
                var grid = $scope.grids[idx];
                grid.setup(elem,parent,tooltip);
                
                // Setup the event for each grid
                (function(idx,parent) {
                    var grid = $scope.grids[idx],
                         link = grid.link || {},
                         title = link.title || "";
                    
                    $(elem).click(function(event) {
                        var link;

                        if ($scope.grids[idx].link !== undefined){
                            link = $scope.grids[idx].link;
                        }
                        event.preventDefault();
                        $scope.onClick({ $event :event, 
                                           $link : link
                                        });
                    });
                    
                    $(elem).on("dragstart",function(ev) {
                        var link;
                        link = $scope.grids[idx].link;
                        ev.originalEvent.dataTransfer.setData("application/json",JSON.stringify({
                            link : link
                        }));
                        
                        $scope.draging = {
                            index : idx,
                            link : link
                        };
                    });
                    
                    $(elem).on("dragover",function(ev) {
                        // Always true in testing.
                        // @TODO Prevent dragover on itself
                        // @TODO Prevent dragover on a button with full of grid.
                        ev.preventDefault();
                    });
                    
                    $(elem).on("drop",function(ev) {
                        // It is receiver of drag
                        ev.preventDefault();                        
                        var data = JSON.parse(ev.originalEvent.dataTransfer.getData("application/json"));
                        // @TODO : validation
                        $scope.$apply(function() {
                            if ($scope.links === undefined) 
                                $scope.links = [];
                            $scope.links.push(data.link);                            
                        });
                    });
                    
                    $(elem).on("dragend",function(ev) {
                        var draging = $scope.draging;
                        delete $scope.draging;
                        console.log("dragend",ev.originalEvent.dataTransfer.dropEffect);
                        if (ev.originalEvent.dataTransfer.dropEffect== "none") 
                            return;
                        $scope.$apply(function() {
                           console.log("splice",$scope.links,draging.index);
                           $scope.links.splice(draging.index , 1); 
                           console.log("splice",$scope.links,draging.index);
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
            template : "<div class='win-button'><div ng-repeat='i in [1,2,3,4]' style='float:left' on-repeat-finish='$parent.rendered = true' ></div></div>",
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

                $(element).addClass("split-panel-win");

                element.bind('contextmenu', function(event) {
                    scope.$apply(function(scope) {
                        event.preventDefault();
                        scope.setTooltipVisible(false);
                        scope.onRightClick();
                    });
                });                
            }
        };
        return def;
	}
    
    return factory;
});
