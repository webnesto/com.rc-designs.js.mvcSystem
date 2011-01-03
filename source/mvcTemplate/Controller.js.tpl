ns.[replace]Controller = (function () {
	var _Parent = mvc.Controller
		, _ns = ns
		, _root = root
	; 
	
	function [replace]Controller(params) {
		_Parent.apply(this, arguments);
		this.constructor = _ns.[replace]Controller;
		
		var _this = this
			/*, _super = {
				show : _this.show 
			}
			 */ //OPTIONAL
		;
		
		_this.View = _root.views.[replace]View;

		//_this.Model = _root.models.[replace]Model; //OPTIONAL
	
		return _this;
	}

	[replace]Controller.prototype = new _Parent();
	
	return [replace]Controller;
})();