
define(["dualless/sys/toolbox/pair",
         "dualless/sys/toolbox/resize",
         "dualless/sys/toolbox/merge",
         "dualless/sys/toolbox/arrange"] , 
        function(pair,
                   resize,
                   merge,
                   arrange) {
            
            return {
                pair : pair,
                resize : resize,
                merge : merge,
                arrange : arrange
            }
});
