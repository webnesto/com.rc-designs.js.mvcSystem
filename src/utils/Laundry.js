ns.Laundry = function (){
	var _clothes = this
		, _isDirty = true
	;

	_clothes.needWashing = function(){	
		return _isDirty;
	};
	
	_clothes.isClean = function(){	
		_isDirty = false;	
	};
	
	_clothes.isDirty = function(){	
		_isDirty = true;	
	};
	
	return _clothes;
};