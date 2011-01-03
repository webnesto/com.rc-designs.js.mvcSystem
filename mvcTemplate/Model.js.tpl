ns.[replace]Model = (function () {
	var _Parent = mvc.Model
		, _ns = ns
		, _root = root
	;
	
	function [replace]Model () {
		_Parent.apply(this, arguments);
		this.constructor = _ns.[replace]Model;
		
		var _this = this
		;
		
		return _this;
	}
	
	[replace]Model.prototype = new _Parent();
	
	return [replace]Model;
})();