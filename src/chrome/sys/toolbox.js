
define(["dualless/sys/toolbox/pair",
         "dualless/sys/toolbox/resize",
         "dualless/sys/toolbox/merge"] , 
        function(pair,
                   resize,
                   merge) {
            
            return {
                pair : pair,
                resize : resize,
                merge : merge
            }
});
