/**
 * @class Abstract model implements core mvc view methods.
 * 
 * @requires utils.Array
 * @requires utils.Evint
 * 
 */
ns.Model = (function () {
	var _ns = ns
		, _root = root
		, _TYPES = {
				STRING: "string"
			, NUMBER: "number"
			, ARRAY: "array"
			, FUNCTION: "function"
			, OBJECT: "object"
			, UNDEFINED: "undefined"
			, NULL: "null"
			}
		, _API = {
				GET: "get"
			,	SET: "set"
			,	ADD: "add"
			,	REMOVE: "remove"
				
			,	CHILDREN: "children"
			,	RANK: "RANK"
			}
		;
	
	function _typeof(){ /* http://javascript.crockford.com/remedial.html */
		var s = typeof this.target
			,	_TYPES = {
					STRING: "string"
				, NUMBER: "number"
				, ARRAY: "array"
				, FUNCTION: "function"
				, OBJECT: "object"
				, UNDEFINED: "undefined"
				, NULL: "null"
				}
			;
		
		if (s === _TYPES.OBJECT) {
			if (this.target) {
				if (typeof this.target.length === _TYPES.NUMBER &&
					!(this.target.propertyIsEnumerable('length')) &&
					typeof this.target.splice === _TYPES.FUNCTION) {
					s = _TYPES.ARRAY;
				}
			} else {
				s = _TYPES.NULL;
			}
		}
		return s;
	}
	
	function _Model (initObjLit, childId, parent) {
		utils.Evint.apply(this); //mixin Event
		this.constructor = _ns.Model;
		
		var _this = this
			, _childId = childId || _root.CONST.MODEL_DEFAULT_ID
			, _vals = []
			, _parent = parent || false;
			;
		
		function _makeNew(initItem, attrib, _valIndex){
			switch(true) {
				case initItem instanceof _Model:
				case initItem instanceof _BoolObject:
				case initItem instanceof _StringObject:
				case initItem instanceof _ArrayObject:
				case initItem instanceof _FunctionObject:
					_this[attrib] = initItem;
				break;
				case initItem.constructor == String:
				case initItem.constructor == Number: //TODO: Make _NumberObject
					_this[attrib] = new _StringObject(initItem, attrib, _valIndex);
				break;
				case initItem.constructor == Boolean:
					_this[attrib] = new _BoolObject(initItem, attrib, _valIndex);
				break;
				case initItem instanceof Array:
					_this[attrib] = new _ArrayObject(initItem, attrib, _valIndex);
				break;
				case initItem instanceof Function:
					_this[attrib] = new _FunctionObject(initItem, attrib, _valIndex);
				break;
				case initItem instanceof Object:
					_this[attrib] = new _Model(initItem, _childId);
				break;
				default:
					//debug.debug("it's UNKNOWN!", initItem.constructor);
					// catch rest
				break;
			}
			try {
			_this[attrib].RANK = _valIndex;
			} catch (err) {
				debug.debug(initItem, attrib, _valIndex);
				debug.debug(err);
			}
			//_this[attrib].NAME = attrib;
		}
		
		function _resetRank(_arry) {
			for(var i=0; i<_arry.length; i++){
				var _obj;
				if(_arry[i].constructor === String){
					_obj = _this[_arry[i]];
				} else {
					_obj = _arry[i];
				}
				if(typeof(obj) !=="undefined"){
					_obj.RANK = i;
				}
			}
		}
		
		function _StringObject(initString, attrib, _valIndex){
			utils.Evint.apply(this);
			this.constructor = _StringObject;
			
			var _thisString = this
				, _val
				, _attrib = attrib
			;
			
			_thisString.set = function (val) { 
				switch(_typeof(val)){
					case _TYPES.OBJECT:
					case _TYPES.ARRAY:
					case _TYPES.FUNCTION:
					case _TYPES.BOOLEAN:
						_makeNew(val, _attrib, _valIndex);
						return true;
					break;
				}
				_val = val;
				_this.fire(_ns.CONST.EVENTS.CHANGE);
				return true;
			};
			
			_thisString.get = function () { 
				return _val || "";
			};
			
			/* init */
			_thisString.set(initString);

			return _thisString;
		}

		function _BoolObject(initBool, attrib, _valIndex){
			utils.Evint.apply(this);
			this.constructor = _BoolObject;
			
			var _thisBool = this
				, _val
				, _attrib = attrib
			;
			
			_thisBool.set = function (val) { 
				if (val.constructor!==Boolean) { //TODO: why was this causing infinite recursion?
					_makeNew(val, _attrib, _valIndex);
					return true;
				}
				_val = val;
				_this.fire(_ns.CONST.EVENTS.CHANGE);
				return true;
			};
			
			_thisBool.get = function () { 
				return _val;
			};
			
			/* init */
			_thisBool.set(initBool);

			return _thisBool;
		}

		function _ArrayObject(initArray, attrib, _valIndex){
			
			utils.Evint.apply(this);// mixin Event
			this.constructor = _ArrayObject;
			
			var _thisArray = this
			, _children = []
			, _isIded
			, _attrib = attrib
			;
			
			_thisArray.set = function (arry){
				if (arry.constructor !== Array) {
					_makeNew(arry, _attrib, _valIndex);
					return true;
				}
				if ((_children.length > 0) &&
				(_isIded == true)) { //TODO: why is this check here?
					for (var i=0; i<_children.length; i++){
						_thisArray.remove(i);
					}
				}
				_children = []; //Destroy reference to previous members
				_isIded = false;
				for (var i=0; i<arry.length; i++) {
					_thisArray.add(arry[i]);
				}
				_this.fire(_ns.CONST.EVENTS.CHANGE);
				return true;
			} ;
			
			_thisArray.children = function () {
				return _children || [];
			};
			
			_thisArray.get = function () {
				var _returnArry = [];
				var _arry = _children;
				
				for (var i=0; i< _arry.length; i++){
					_returnArry.push(_arry[i].get());
				}
				return _returnArry || [];
			};
			
			_thisArray.add = function (newMember) {
				var _child = new _Model(newMember, _childId);
				_child.RANK = _children.length;
				_children.push(_child); //Store an iterable reference to child
				if (_child[_childId]) {  //Store a hash reference to child if an ID has been provided
					_isIded = true;
					_thisArray[_child[_childId].get()] = _child;
				}
				_this.fire(_ns.CONST.EVENTS.CHANGE);
			};
			
			_thisArray.remove = function (indexOrId) {
				switch (indexOrId.constructor) {
					case Number:
						if(_children[indexOrId][_childId]){
							delete _thisArray[_children[indexOrId][_childId].get()];
						}
						var _removed = _children.splice(indexOrId, 1);
						_resetRank(_children);
						return _removed;
					break;
					case String:
						var _index = _thisArray[indexOrId].RANK;
						delete _thisArray[indexOrId];
						var _removed = _children.splice(_index, 1);
						_resetRank(_children);
						return _removed;
					break;
					default:
						return false;
					break;
				}
				_this.fire(_ns.CONST.EVENTS.CHANGE);
			};
			
			/* init */
			_thisArray.set(initArray);
			
			return _thisArray;
		}
		
		function _FunctionObject(initFunction, attrib, _valIndex){
			utils.Evint.apply(this); //mixin Event
			_this.constructor = _FunctionObject;
			
			var _thisFunction = this
				, _val
				, _attrib = attrib
			;
		
			_thisFunction.set = function (val) { 
				if (val.constructor!==(Function)) {
					_makeNew(val, _attrib, _valIndex);
					return true;
				}
				_val = val;
				
				_this.fire(_ns.CONST.EVENTS.CHANGE);
				
				return true;
			};
			
			_thisFunction.get = function () { 
				return _val();
			};
			
			/* init */
			_thisFunction.set(initFunction);
			
			return _thisFunction;
		}
		
		/* Public */
		
		_this.get = function () {
			if(_this["SELF"]){
				return _this["SELF"].get();
			}
			var _retObj = {};
			for (var i=0; i<_vals.length; i++) {
				try{ 
					_retObj[_vals[i]] = _this[_vals[i]].get(); 
				} catch (err) { 
					debug.error(_vals[i], _this, err);
				}
			}
			return _retObj;
		};
		
		_this.set = function(objLit){
			if(_vals.length > 0){
				for (var i=0; i<_vals.length; i++) {
					_this.remove(_vals[i]);
				}
			}
			_this.add(objLit);
		};
		
		_this.add = function (objLit) {
			var _protected = utils.Array(_API, utils.Evint.API).arrayify();
			switch(true){
				case objLit instanceof _Model:
					_this = objLit;//TODO: is this right?  It protects against unintentionaly pointer abuse, but doesn't allow implicit "binding"... yeah, this is right... otherwise var foo = new mvc.Model(bar);  is no different than foo = bar if bar is also a mvc.Model
					return true;
				break;
				case objLit.constructor == String:
				case objLit.constructor == Number: //TODO: Make _NumberObject
				case objLit.constructor == Boolean:
				case objLit instanceof Array:
				case objLit instanceof Function: 
					_this = new _Model({"SELF":objLit});
				break;
				default:
					for (var attrib in objLit) {
						if (objLit.hasOwnProperty(attrib)) {
							if(_protected.indexOf(attrib) == -1){
								if(_this[attrib]) {
									try{
										_this[attrib].set(objLit[attrib]); 
									} catch (err) { 
										debug.debug(attrib, _this, "failed!", err); 
									}
								} else {
									var _curIndex = _vals.length;
									_vals[_curIndex] = attrib;
									_makeNew(objLit[attrib], attrib, _curIndex);
								}
							} else {
								throw("you can't overwrite a property that's protected by the Array and Evint API");
							}
						}
					}
				break;
			}
		};
		
		_this.remove = function (idOrArray) {
			var _arry = (idOrArray.constructor === Array) ? idOrArray : [idOrArray]
				, _returnArray = []
			;
			
			function _remove(idStr){
				if(_this[idStr]){
					var _removed = _this[idStr]
						, _removedFromArray = _vals.splice(_removed.rank, 1)
					;
					delete _this[idStr];
					_resetRank(_vals);
					return _removed;
				}
			}
			
			for (var i=0; i<_arry.length; i++) {
				_returnArray.push(_remove(_arry[i]));
			}
			
			_this.fire(_ns.CONST.EVENTS.CHANGE);
			return _returnArray;
		};
		
		/* init */
		if(typeof(initObjLit)!=="undefined"){
			_this.set(initObjLit);
		}

		return _this;
	}
	
	return _Model;
})();