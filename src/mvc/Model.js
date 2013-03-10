/**
 * @class Abstract model implements core mvc view methods.
 * 
 * @requires utils.Array
 * @requires utils.Evint
 * @requires ns.CONST.EVENTS
 */

//TODO: remove all "forEach" for traditional for-loops - micro optimization.

ns.Model = (function ( ns, root ) {
	var 
		_uArray = utils.Array
	,	_uEvint = utils.Evint
	,	_EVENTS = ns.CONST.EVENTS
	,	_CHANGE_E = _EVENTS.CHANGE
	,	_TYPES = {
			STRING: "string"
		,	NUMBER: "number"
		,	BOOLEAN: "boolean"
		,	ARRAY: "array"
		,	FUNCTION: "function"
		,	OBJECT: "object"
		,	UNDEFINED: "undefined"
		,	NULL: "null"
		}
	,	_API = function ()/** Hash */{
			return {
				API: "API"
			,	GET: "get"
			,	SET: "set"
			,	ADD: "add"
			,	REMOVE: "remove"
			,	CHILDREN: "children"
			,	CHILD: "child"
				
			,	_VAL_: "_val_"
			,	_ATTRIBUTES_ : "_attributes_"
			,	_PARENT_ : "_parent_"
			,	_IS_SAFE_: "_isSafe_"
			};
		}
	;
	
	function _typeof(val){ /* http://javascript.crockford.com/remedial.html */
		var s = typeof val;
		
		if (s === _TYPES.OBJECT) {
			if (val) {
				if (typeof val.length === _TYPES.NUMBER &&
					!(val.propertyIsEnumerable('length')) &&
					typeof val.splice === _TYPES.FUNCTION) {
					s = _TYPES.ARRAY;
				}
			} else {
				s = _TYPES.NULL;
			}
		}
		return s;
	}
	

	var _Children = (function () { 
		
		function _Array() { 
			var 
				_array = _uArray.apply({}, arguments)
			, _this;
			; 
			
			_array.setThis = function(scope){
				_this = scope;
			};
			
			//Have to handle any array methods that modify the array to ensure we can monitor model state
			_array.pop = function () {
				_this.fire(_CHANGE_E);
				return [].pop.apply(_array, arguments);
			};
			_array.push = function () {
				_this.fire(_CHANGE_E);
				return [].push.apply(_array, arguments);
			};
			_array.reverse = function () {
				_this.fire(_CHANGE_E);
				return [].reverse.apply(_array, arguments);
			};
			_array.shift = function () {
				_this.fire(_CHANGE_E);
				return [].shift.apply(_array, arguments);
			};
			_array.sort = function () {
				_this.fire(_CHANGE_E);
				return [].sort.apply(_array, arguments);
			};
			_array.splice = function () {
				_this.fire(_CHANGE_E);
				return [].splice.apply(_array, arguments);
			};
			_array.unshift = function () {
				_this.fire(_CHANGE_E);
				return [].unshift.apply(_array, arguments);
			};
		
			return _array; 
		} 
		
		return _Array; 
		
	})();
	
	function _Model (
		initValue //:*
	, 	parent //:_Model
	) {
		
		var _this = this;
		this._val_;
		this._attributes_ = []; //array of childAttributes
		this._parent_ = parent || false;
		_uEvint.call(this, this._parent_); //mixin Event
		
		this.API = _API();

		/* init */
		//if(typeof(initValue)!=="undefined"){
			this.set(initValue);
		//}

		return this;
	}
	
	_Model.prototype._isSafe_ = function (
		attributeId //:String
	)//:Boolean
	{
		var _protected = _uArray(this.API, _uEvint.API).arrayify();
		if( _protected.indexOf(attributeId) == -1){
			return true;
		}
		return false;
	};
	
	_Model.prototype.set = function (
		value //:*
	)//:Boolean 
	{
		if(value === this._val_){
			return true; //already set;
		}
		switch(_typeof(value)){
			case _TYPES.ARRAY:
				this._val_ = _Children(value.map(function(
					item //:Array
				)//:_Model
				{
					if(item instanceof _Model){
						return item;
					}
					return new _Model(item);
				}));
				this._val_.setThis(this);
				this.fire(_CHANGE_E);
				return true;
			break;
			case _TYPES.OBJECT:
				var _obj = new _Model();
				//remove any attrib necessary
				for (var attrib in this){
					if(
						( this.hasOwnProperty(attrib) )
					&&( this._isSafe_(attrib) )
					&&( !(value[attrib]) )
					){
						//incoming doesn't have this value
						this.remove(attrib);
					}
				}
				if(value instanceof _Model){
					this._val_ = _obj;
					this.fire(_CHANGE_E);
					return true;
				} else {
					//set or add new attrib as necessary
					for (var attrib in value) {
						if (value.hasOwnProperty(attrib)) {
							if(this._isSafe_(attrib)){
								if(this[attrib]) {
									try{
										this[attrib].set(value[attrib]); 
									} catch (err) { 
										debug.error(attrib, this, "failed!", err); 
									}
								} else {
									var _value;
									if(value[attrib] instanceof _Model){
										_value = value[attrib];
									} else {
										_value = new _Model(value[attrib]);
									}
									//this._val_ = _value;
									_obj.add(attrib, _value);
									this.add(attrib, _obj[attrib]);
								}
							} else {
								//Gonna do nothing here for now... *might* throw an error later (see this.add()).
							}
						}
					}
					this._val_ = _obj;
					this.fire(_CHANGE_E);
					return true;
				}
			break;
			default:
			//case _TYPES.STRING:
			//case _TYPES.NUMBER:
			//case _TYPES.BOOLEAN:
			//case _TYPES.FUNCTION:
			//case _TYPES.UNDEFINED:
			//case _TYPES.NULL:
				this._val_ = value;
				this.fire(_CHANGE_E);
				return true;
			break;
		}
		
		return false; //should this be false, since thread shouldn't reach here?
	};

	_Model.prototype.get = function () {
		switch(_typeof(this._val_)){
			case _TYPES.ARRAY:
				return this._val_.map(function(item){
					return item.get();
				});
			break;
			default:
				if(this._val_ instanceof _Model){
					var _return = {};
					this._attributes_.forEach(function(item){
						_return[item] = this[item].get();
					}, this);
					return _return;//this._val_.get();
				}
				return this._val_;
			break;
		}
	};

	_Model.prototype.add = function (
		attributeId //@param String - TODO: consider what/how should happen if this is null... call to this.set instead of add?... could lead to infinite recursion if not careful
	,	child       //@param Object | _Model	
	)               //@returns Boolean 
	{
		var _child = (child instanceof _Model) ? child : new _Model(child);
		switch(_typeof(this._val_)){
			case _TYPES.ARRAY:
				this._val_.push(_child); //nothing is done with attributeId
				return true;
			break;
			case _TYPES.UNDEFINED:
				this.set({}); //Need to initialize this as "something"
			case _TYPES.OBJECT:
				if(this._isSafe_(attributeId)){
					if(this._attributes_.indexOf(attributeId)==-1){
						this._attributes_.push(attributeId);
					}
					this[attributeId] = _child;
					this.fire(_CHANGE_E);
					return true;
				}
				return false; //Should we through an error here to let the developer know they're attempting to overwrite a protected attribute?
			break;
			default:
				//Model already set as a data type that doesn't allow sub-attributes.
				return false;
			break;
		}
	};

	_Model.prototype.remove = function (
		attributeId //: String | null
	) {
		var 
			_attribute //:*
		;
		if(
			( this._isSafe_(attributeId) )
		&&( _typeof(this[attributeId]) != _TYPES.UNDEFINED )
		){
			_attribute = this[attributeId];
			if(delete this[attributeId]){
				this._attributes_ = this._attributes_.filter(function(item){
					return item != attributeId;
				});
				this.fire(_CHANGE_E);
				return _attribute;
			} else {
				return false;// should this be throwing an error instead?
			}
		}
		
		return _attribute;
	};

	_Model.prototype.children = function () {
		switch(_typeof(this._val_)){
			case _TYPES.ARRAY:
				return this._val_;
			break;
			default:
				return [];
			break;
		}
	};

	_Model.prototype.child = function (
		attributeId__childIndex //: String | Number
	) {
		switch(_typeof(this._val_)){
			case _TYPES.ARRAY:
				switch(_typeof(attributeId__childIndex)){
					case _TYPES.STRING:
						//iterate for array object member with childIdAttribute == attributeId
						// no... don't like this.  childIdAttribute is too cumbersome trying to remove.
					break;
					case _TYPES.NUMBER:
						return this._val_[attributeId__childIndex];
					break;
				}
			break;
			default:
				if(_typeof(attributeId__childIndex) == _TYPES.STRING){
					return this[attributeId__childIndex];
				} //TODO: else ??
			break;
		}
		
	};
	
	_Model.API = _API();
	
	return _Model;
})( ns, root );