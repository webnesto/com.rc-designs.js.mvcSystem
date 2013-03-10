/**
 * 
 */

if( typeof( at ) !== "undefined" ){
	throw "Namespacing syntax requires use of global['at']";
}
var at = ( function ( global ) { 
	var 
		_spaces = []
	,	_at = {
			ns : {} 	//{Object} Pointer to current namespace
		, root : {} //{Object} Pointer to root of current namespace (one below global)
		}
	, _lastSet
	, _names = []
	;
	
	function _getNs( obj ) {
		var 
			_currns = global // defaults to "window" in browser environment
		, _lastns = false
		, _previousOwner = false
		,	_name = ""
		, _parent
		;
		
		if( 
			( _spaces.length == 1 )
		&&( typeof( global[ _spaces[0] ] ) != "undefined" )
		&&( !global[ _spaces[0] ]._made_by_at_ )
		) {
			_previousOwner = global[ _spaces[0] ];
			global[ _spaces[0] ] = {};
		}
		
		for( var i = 0, len=_spaces.length; i < len; i++ ) {
			var _init = {
				_name_: "" // { String } representation of namespace path - results in unique id (questionable coding use...) 
			, _parent_ : {}
			, _made_by_at_ : true
			};
			
			if( 
				( typeof( obj ) === "object" ) // Initial object has been provided
			&&( i == len-1 ) // We are on the last iteration
			) {
				if(
					( _currns[_spaces[i]] ) // Namespace is already defined
				&&( !_previousOwner ) 	// We don't have a previous owner of this namespace retained for resurrection
				) {
					throw "Cannot initialize " + _spaces.slice(0,i+1).join(".") + " it has already been initialized";
				}
				_init = obj;
			}
			_currns[_spaces[i]] = _currns[_spaces[i]] || _init; //don't overwrite existing namespace (unless being reserved)
			_currns = _currns[_spaces[i]];
			_name += (_name=="") ? "" : ".";
			_name += _spaces[i];
			_currns._name_ = _currns._name_ || _name; //don't overwrite existing "_name_" property
			if( _names.indexOf( _name ) === -1 ) {
				_names.push( _name );
			}
			if(_lastns){
				_currns._parent_ = _lastns; //don't overwrite existing "parent" property 
			}
			_currns._made_by_at_ = true;
			_lastns = _currns;
		}

		if( 
			( _previousOwner ) 
		) {
			global[_spaces[0]]._previous_ = _previousOwner;
		}
		
		_at.root = global[_spaces[0]];
		_at.ns = _currns;
		
		return _at;
	}
	
	_at.set = function ( 
		atNamespace 		// {String} with no modifiers will be added onto current ns (starting with global).  If "." in string, will be broken into parts.  If starts with "/", entire namespace will be reset.
	, obj 						// {Object} Optional to initialize namespace.  Throws error if namespace already initialized 
	) {
		
		var 
			_names = atNamespace.split(".")  	// {Array}[ {String} ] namespaces to set
		, _len = _names.length  						// {Number} depth of spaces to set
		, i = 0 														// {Number} Iterator
		;
		
		_lastSet = atNamespace;
		
		if( _names[0].match( /^\// ) ){
			_spaces = [];
			_names[0] = _names[0].slice(1);
		};
		
		for(i = 0; i < _len; i++){
			_spaces.push(_names[i]);
			// #ifdef debug
			debug.debug("@namespace: ", _spaces.slice().join("."));
			// #endif

		}

		_getNs( obj );

		return _at;
	};
	
	_at.unset = function (atNamespace){
		var
			_atSpace = ( typeof( atNamespace ) !== "undefined" ) ? atNamespace : _spaces[ _spaces.length - 1 ]
		, _names = ( typeof( _atSpace ) == "string" ) ? _atSpace.split(".") : [ _spaces[ _spaces.length - 1 ] ]
		,	_len = ( typeof( _atSpace ) == "string" ) ? _names.length : ( typeof( _atSpace ) == "number" ) ? _atSpace : 1
		, i = 0  /** {Number} Iterator */
		;
		
		for( i = 0; i < _len; i++ ){
			var _removed = _spaces.pop();
			if( _removed !== _names[i]){
				_spaces.push( _removed );
				var _nonspaces = _spaces.slice(0, _spaces.length-1);
				_nonspaces.push( _names[i] );
				throw "Cannot unset '" 
					+ _nonspaces.join(".") 
					+ "', current namespace is '" 
					+ _spaces.slice().join(".") 
					+ "'"
					;
			} else {
				// #ifdef debug
				debug.debug("@namespace: ", _spaces.slice().join("."));
				// #endif
			}
		}

		_getNs();
		
		_lastSet = _spaces.join( "." );
		
		return _at;
	};
	
	_at.names = function () {
		return _names.slice().sort();
	};
	/*TODO: maybe this would be better overridden by preprocessing?
	_at.config = function ( settings ) {
		_noName = settings.suppressNames ? true : false; //TODO: wrap names in boolean
		_noParent = settings.suppressParent ? true : false;
		_noPrevious = settins.suppressPrevious ? true : false;
		_noMadeBy = ( _noName && _noParent && _noPrevious ) ? true : false; //If all the others are overridden... this one can be too.
	}
	*/
	return _at;

} )( this );