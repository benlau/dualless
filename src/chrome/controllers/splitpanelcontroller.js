define(function() {
    
    /** Creator of SplitPanelController
     * 
     * @params orientation Either of "H" or "V"
     */
    function create(orientation) {
        
        function update(args,event) {
            if (event.button == 1 ||
                (event.button == 0 && event.metaKey == true)) {
                args.duplicate = true;
                args.position = 1 - args.position;
            }
        }

        function Controller($scope) {
            var arr = [];
            for (var i = 3 ; i <=7;i++ ) {
                var pair = [i , 10-i];
                arr.push(pair);
            }	
                
            $scope.choices = arr;

            $scope.split = function (param1,param2,position,event) {
                var args = {param1: param1,
                            param2: param2,
                            position : position,
                            orientation : orientation};
                
                update(args,event);

                $scope.$emit("split",args);
            };

            $scope.merge = function() {
                $scope.$emit("merge");
            };
            
        };
                
        return Controller
    }
    
    return create
});
