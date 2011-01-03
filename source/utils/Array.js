/**
 * @requires Array (ECMA 262 v5 compliant)
 */

ns.Array = (function () {
	var 
		_ns = ns
	, _type
	, _break = {}
	;
	
	_type = (function () { //do this instead of using _root.utils.type_of so that Array can be used elsewhere
		var 
			_undefined
		,	_TYPES = {
				STRING: typeof("")
			, NUMBER: typeof(1)
			, FUNCTION: typeof(function(){})
			, OBJECT: typeof({})
			, UNDEFINED: typeof(_undefined)
			, NULL: "null" //typeof returns "object" for nulls
			, ARRAY: "array" //typeof returns "object" for arrays
			}
		;
		
		function _type_of( val){ /* http://javascript.crockford.com/remedial.html */
			var s = typeof val;
			
			if ( s === _TYPES.OBJECT ) {
				if ( val ) {
					if (
						( typeof val.length === _TYPES.NUMBER ) 
					&&( !( val.propertyIsEnumerable('length') ) ) 
					&&( typeof val.splice === _TYPES.FUNCTION )
					){
						s = _TYPES.ARRAY;
					}
				} else {
					s = _TYPES.NULL;
				}
			}
			return s;
		}
	
		_type_of.TYPES = _TYPES;
	
		return _type_of;
	
	})();
	
	var _default = function (arg){
		return {
			is: function(default_value){
				return ( _type(arg) !== _type.TYPES.UNDEFINED ) ? arg : default_value;
			}
		};
	};
	
	function _findFirst(fn, scope) {
		var 
			_return = false;
		;
		this.each(function(item, i){
			if ( fn.call(scope, item, i) ){//isTruthy
				_return = item;
				throw _break;
			}
		}, scope);
		return _return;
	};
	
	function _A(){
		var 
			_scope = arguments
		, _this
		;
		/* initialize */
		if(
			( arguments.length == 1 )
		&&( _type( arguments[0] ) == _type.TYPES.ARRAY )
		){
			if( arguments[0].constructor != _A) {
				_scope = arguments[0];
			} else {
				return arguments[0]; //Already cast as an _A... no need to do it again.
			}
		}
		if( _scope.length == 0 ){
			_this = [];
		} else {
			_this = [].slice.call( _scope, 0 );
		}
		
		_this.constructor = _A;

		_this.each = function (fn, scope) {
			try {
				[].forEach.apply(_this, arguments);
			} catch (err) {
				if( err != _break ){
					throw err;
				}
			}
		};

		_this.findFirst = function (fn, scope) {
			return _findFirst.apply(_this, arguments);
		};
		

		/**
		 * converts each array member into an array (behavior varies on type).  Note: not recursive - only one-deep
		 * 
		 * @returns [namespace].Array
		 */
		_this.arrayify = function () {
			var _oldMe = _this.slice()
				, _return = _A()
			;
			//_this.splice(0,_this.length);
			for(var i=0, len=_oldMe.length; i<len; i++){
				var _member = _oldMe[i];
				switch(_type(_member)){
					case _type.TYPES.OBJECT: //Just attribute values.  If we want to do something else with the name/value pairs we can do that in another method
						for (var attrib in _member) {
							if (_oldMe[i].hasOwnProperty(attrib)) {
								_return.push(_member[attrib]);
							}
						}
					break;
					case _type.TYPES.ARRAY:
						[].push.apply(_return, _member);
					break;
					case _type.TYPES.STRING: //just words... if we decide to split up on characters, we can do that in another method.
						[].push.apply(_return, _member.split(" "));
					break;
					default:
						_return.push(_member);
					break;
				}
			}
			return _return;
		};
		

		//Have to handle any array methods that return copies of the originals to ensure they stay cast as _A
		_this.concat = function () {
			return _A([].concat.apply(this, arguments));
		};
		
		_this.slice = function () {
			return _A([].slice.apply(this, arguments));
		};

		return _this;
		
	}
	
	_A.each = function ( contextArray, fn, scope ){
		return _A(contextArray).each(fn, scope);
	};
	
	_A.$break = _break;
	
	return _A;
})();