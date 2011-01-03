ns.[replace]View = (function () {
	var _Parent = mvc.View
		, _ns = ns
		, _root = root
	;
	
	function [replace]View () {
		_Parent.apply(this, arguments);
		this.constructor = _ns.[replace]View;
		
		var _this = this
		;
		
		//_this.Templates = _root.NAME + ".[replace]";
		
		return _this;
	}
	
	[replace]View.prototype = new _Parent();
	
	return [replace]View;
})();