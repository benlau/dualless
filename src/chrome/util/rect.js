/* Rect class
 * 
 */

define(function util() {
	
	function Rect() {
		var fields = ["top","left","width","height"];
		var rect = this;
		
		$(fields).each(function (idx,field) {
			rect[field] = 0;
		});
		
		if (arguments.length == 1) {
			var ref = arguments[0];
			for (var i = 0 ; i < fields.length;i++) {
				var field = fields[i];
				if (ref[field] != undefined)
					rect[field] = ref[field];
				else
					rect[field] = 0;
			}
		} else if (arguments.length == 4) {
			for (var i = 0 ; i < arguments.length;i++) {
				rect[fields[i]] = arguments[i];
			}
		}	
	};
	
	Rect.prototype.isNull = function(){
		var res = this.top == 0 &&	this.left == 0 && 	this.width == 0 && this.height == 0;
		return res;
	};
	
	Rect.prototype.size = function() {
		return this.width * this.height;
	};
	
	/** Find the intersected rectangle between other
	 * 
	 * @param other
	 */
	
	Rect.prototype.intersect = function(other) {
		if (this.isNull() && other.isNull())
			return new Rect();
	
		var l1 = this.left;
		var r1 = this.left + this.width;
		
		var l2 = other.left;
		var r2 = other.left + other.width;
		
		if (l1 > r2 || l2 > r1) {
			return new Rect();
		}
		
		var t1 = this.top;
		var b1 = this.top + this.height;
		
		var t2 = other.top;
		var b2 = other.top + other.height;
		
		if (t1 > b2 || t2 > b1) {
			return new Rect();
		}
		
		var left =  Math.max(l1,l2);
		var top = Math.max(t1,t2);
		
		var right = Math.min(r1,r2);
		var bottom = Math.min(b1,b2);
		
		var width = right - left;
		var height = bottom - top;
		
		var res = new Rect( {top : top ,
							    left : left,
							    width : width,
							    height : height});
		
		return res;
	};
	
	Rect.prototype.unite = function(other) {
		var l1 = this.left;
		var r1 = this.left + this.width;
		
		var l2 = other.left;
		var r2 = other.left + other.width;
	
		var t1 = this.top;
		var b1 = this.top + this.height;
		
		var t2 = other.top;
		var b2 = other.top + other.height;

		var left =  Math.min(l1,l2);
		var top = Math.min(t1,t2);
		
		var right = Math.max(r1,r2);
		var bottom = Math.max(b1,b2);

		var width = right - left;
		var height = bottom - top;

		var res = new Rect( {top : top ,
		    left : left,
		    width : width,
		    height : height});

		return res;
	};
	
	Rect.prototype.equal = function(other) {
		return this.left == other.left && 
			   this.top == other.top && 
			   this.width == other.width && 
			   this.height == other.height;
	};
	
	Rect.prototype.toString = function() {
		var string = "[" + this.left + "," + this.top + " " + this.width + "x" + this.height + "]";
		return string;
	};
	
	Rect.prototype.toData = function() {
		var fields = ["top","left","width","height"];
		var obj = {};
		var rect = this;
		$(fields).each(function (idx,field) {
			obj[field] = rect[field]; 
		});
		return obj;
	};
	
	
	return Rect;
});