
/* Window Button 
 * 
 * Represent the size of a window after the action.
 * 
 * Each window button is further divided into 4 grid,
 * it is used for bookmarked links.
 */

define(["module",
         "dualless/widgets/tooltip",
         "dualless/lib/eventemitter"],
         function(self,
                    Tooltip,
                    EventEmitter) {

    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");	    

    var sheet = "<link  href='" + uri + "/../directives/winbutton.css' rel='stylesheet'>";
    $("head").append(sheet);
    
    var max = 3; // Max no. of links on a winbutton

    // Mapping of links to grids (depend on the no. of link)
    var map = [ [-1,-1,-1,-1],
                [0,0,-1,-1],
                [0,1,-1,-1],
                [0,1,2,-1] ];


    /** Collection of element */
    function Group () {
        this.elements = []
    };    
    
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
        this.events = new EventEmitter();
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
        
        var grid = this;

        $(elem).hover(function(event) {
             var link = grid.link || {},
                  title = link.title || "";

            grid.group.css("background-color","yellow");
            
            if (title === "") {
                var hint;
                switch (Math.floor((Math.random()*3))) { // Hint is not always show
                    case 0:
                        hint = "Press 'middle' click to duplicate current site";    
                        break;
                        
                    case 1:
                        hint = "Press 'right' click for bookmark management";    
                        break;
                }
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
            grid.group.css("background-color",grid.color());  
            tooltip.hide();
        });

        $(elem).click(function(event) {
            var link;

            if (grid.link !== undefined) {
                link = grid.link;
            }
            event.preventDefault();
            
            grid.events.emit("click",{ $event :event, 
                               $link : link
                            });
        });
                    
        $(elem).on("dragstart",function(ev) {
            var link = grid.link;
            tooltip.hide();
//            ev.originalEvent.dataTransfer.effectAllowed = 'move';
            ev.originalEvent.dataTransfer.setData("application/json",JSON.stringify({
                link : link
            }));           
        });
        
        $(elem).on("dragend",function(ev) {
            if (ev.originalEvent.dataTransfer.dropEffect== "none") 
                return;
            grid.events.emit("remove");
        });

        $(elem).css("background-color",grid.color());  
    }
    
    /** Window Button
     */
    
    function WinButton() {
        this._links = [];
        
        this.grids = [];

        this.events = new EventEmitter(); 
        
        var self = this;
        
        for (var i = 0 ; i < 4;i++){
            (function(idx) {
                
                var grid = new Grid();
                grid.events.on("click",function(data) {
                   self.events.emit("click",data); 
                });

                grid.events.on("remove",function(data) {
                    var count = self._links.length;
                    if (count >= max)
                        count = max - 1;
                    var m = map[count];
                    self._links.splice(m[idx],1);
                    self.events.emit("dragged");
                });
                
                self.grids.push(grid);
            })(i);
        }
    }
    
    WinButton.prototype.setup = function(elem) {
        this.element = elem;
        var self = this;
        
        $(elem).on("dragover",function(ev) {
            if (self._links.length < max) {
                ev.preventDefault();
            }
        });

        $(elem).on("drop",function(ev) {
            // It is receiver of drag
            if (self._links.length >= max) {
                return;
            }
            ev.preventDefault();
            var data = JSON.parse(ev.originalEvent.dataTransfer.getData("application/json"));
            self._links.push(data.link);
            self.events.emit("drop");
        });
    }
    
    /** Setup the links for a WinButton
     */
    
    WinButton.prototype.links = function(links) {
        if (arguments.length === 0) {
            return this._links;
        }      
       
        this._links = links;
        var count = links.length;
        if (count > max ) {
            count = max;
        }
        
        var m = map[count];
        var link;
        for (var i = 0 ; i < 4;i++){
            link = undefined;
            if (m[i] >= 0)
                link = links[m[i]];
            this.grids[i].link = link;
        }
        
        var groups = [];
        
        for (var i = -1 ; i < 4;i++) {
            groups[i] = new Group();
            for (var j in m) {
                if (m[j] == i) {
                    groups[i].push(this.grids[j].element);
                }
            }
        }
        
        for (var i = 0 ; i < 4;i++) {
            this.grids[i].group = groups[m[i]];
        }
    };
    
    /** Refresh the display according to the property changes
     */
    
    WinButton.prototype.refresh = function() {
        
        for (var i = 0 ; i < this.grids.length;i++) {
            var grid = this.grids[i],
                 elem = grid.element,
                 link = grid.link || {},
                 title = link.title ;
                 
            $(elem).css("background-color",grid.color());
            
            var draggable = true;
            if (title === undefined) { 
                draggable = false;
            }
            $(elem).attr("draggable",draggable);
        }
    };   
    
    function Controller($scope,$element,$timeout) {       
        var tooltip = new Tooltip(); // @TODO: Move tooltip into WinButton
        
        var winButton = new WinButton();
        
        winButton.events.on("click",function(data) {
           $scope.onClick(data); 
        });

        winButton.events.on("drop",function() {
            $scope.$apply(function() {
                $scope.links = winButton.links();
            });
        });
        
        winButton.events.on("dragged",function() {
            $scope.$apply(function() {
                $scope.links = winButton.links();
            });
        });
        
        $scope.rendered = false;
        // The information of children grid
        $scope.grids = winButton.grids;
        
        $scope.setTooltipVisible = function(show){
            if (show) {
                tooltip.show();
            } else {
                tooltip.hide();
            }
        };
        
        $scope.linkFunc = function(element) {
            winButton.setup(element);
            $scope.element = element;
        };
        
        $scope.$watch(function() {
            return $scope.disable;   
        },function() {
            if ($scope.disable) {

                $timeout(function() {
                    var mask = $("<div style='z-index:1;position:absolute;background:gray;opacity:0.4'></div>");
                    $("body").append(mask);
                    
                    var offset = $($scope.element).offset();
                    $(mask).css({top : offset.top, left : offset.left});
                    $(mask).width($($scope.element).width() + 2);
                    $(mask).height($($scope.element).height() +2 );
                    
                    $scope.$on("$destroy",function() {
                        $(mask).remove(); 
                    });
                });
           }
        });
        
        $scope.$watch(function() {
            return {links : $scope.links,
                     initialized :  $scope.initialized};
        },function() { // links -> grids.link,color of element
            var links = $scope.links;
            if (links === undefined) {
                links = [];
            }
            winButton.links(links);
            winButton.refresh();

        },true);
        
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

            var width = $scope.element.width();     
            var height = $scope.element.height();            
            
            var title = $($scope.element).find(".win-button-title");
            if (title) {
                if ($scope.orientation == "H") {
                    $(title).addClass("win-button-title-h");

                } else {
                    $(title).addClass("win-button-title-v");
                }                
                height = $scope.element.height() - title.height();
            }
            
            $($scope.element).find(".win-button-grid").each(function(idx,elem) {
                if ($scope.orientation == "H") {
                   $(elem).width(width/2);
                   $(elem).height(height/2);
                } else {
                   $(elem).width(width/4);
                   $(elem).height(height);                    
                }
                
                var grid = $scope.grids[idx];
                grid.setup(elem,parent,tooltip);               
                
                $scope.$evalAsync(function(scope) {
                   scope.initialized = true;
                });
        
            }); // End of watch
        },
        true);
    }
    
    Controller.inject = ["$scope","$element","$timeout"];
    
    function factory() {
        var def = {
            replace: true,
            transclude: false,
            template : "<div class='win-button'><div class='win-button-title'></div><div class='win-button-grid' ng-repeat='i in [1,2,3,4]' style='float:left' on-repeat-finish='$parent.rendered = true' ></div></div>",
            controller: Controller,
            restrict : 'E',
            require : "?ngModel",
            scope : {
                orientation : "@",
                ratio : "@",
                key : "@",
                disable : "=",
                links : "=links",
                onClick : "&",
                onRightClick : "&"
            },
            link : function(scope, element, attrs, ngModel) {
                scope.element = element;
                
                scope.linkFunc(element);

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
