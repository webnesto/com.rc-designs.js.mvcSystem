/**
 * @requires utils.Evint
 * @requires utils.Array
 */

ns.Manager = ( function(){
	var 
		_ns = ns
	, _root = root
	;
	
	function Manager(){
		utils.Evint.apply( this ); // apply Event
		this._controllers = utils.Array();
		this._default;
		return this;
	}
	
	Manager.prototype.getByClass = function ( Controller, isFamily, include ){
		var _instances = []
			, _include = ( include ) ? true : false
		;
		this._controllers.forEach( function( controller ){//TODO: convert to "filter"
			var _return = ( !_include );
			if( _include ){
				if( controller instanceof Controller ){
					_return = _include;
				}
			} else {
				if( controller.constructor == Controller ){
					_return = _include;
				}
			}
			if( _return ){
				_instances.push( controller );
			}
		} );
		return _instances;
	};

	Manager.prototype.register = function ( controller ){
		if( this.get( controller.idee() )){
			// return false; // Let's do nothing... who cares if you try to register twice?
			return controller;
		} else {
			if( !( controller instanceof _ns.Controller ) ){ //TODO: Do we do this?  Or DuckType check? Or do anything at all?
				throw "I don't know how to be your manager!  You don't work for me!";
			}
			this._controllers.push( controller );
			return controller;
		}
	};
	
	Manager.prototype.defawlt = function (
		idee	//:String - Optional
	){
		if (typeof(idee) !== "undefined") {
			var _default = this.get( idee );
			if ( _default ) {
				this._default = _default;
			} //else ?  throw error?
		}
		return this._default || this._controllers[0];
	};


	Manager.prototype.get = function ( idee ) {
	  var _controller = this._controllers.findFirst( function( controller ){
	  	return ( controller.idee() == idee );// ? controller : false;
	  } );
	  return _controller;
	};
	
	Manager.prototype.getAll = function () {
		return this._controllers.slice(); //copy of controllers returned ( members may still be manipulated, but our private storage won't be hurt
	};
	
	Manager.prototype.getAllVisible = function(){
		var _returnArray = [];
		this._controllers.forEach( function( controller ){//TODO: convert to "filter"
			if( controller.isVisible() ){
				_returnArray.push( controller );
			}
		} );
		return _returnArray;
	};

	Manager.prototype.create = function( Controller ){
		if( !Controller instanceof _ns.Controller ){
			throw "I don't know how to create something I can't manage!"; //TODO: Do we do it this way?  Or Duck Typing?
		}
		return this.register( new Controller() );
	};
	
	Manager.prototype.show = function( idee ){
		var _controller = ( idee ) ? this.get( idee ) : this.defawlt();
		if( !_controller ){
			throw "How can I show that which does not exist?"; //TODO: Should this fail silently instead?
		}
		this.hideAllExceptTheseIds( _controller.idee() ); //TODO: make sure this works.
		_controller.show();
	};
	
	/**
	 * 
	 */
	Manager.prototype.showAll = function(){
	  this._controllers.forEach( function( controller ){
	  	controller.show();
	  } );
	  return _this;
	};
	
	Manager.prototype.hide = function( idee ){ //TODO: do we need this?  If it's just a pass-through, we've probably already got a ref to the view
		var _controller = ( idee ) ? this.get( idee ) : this.defawlt();
		if( !_controller ){
			throw "How can I hide something that is not even there?"; //TODO: Should this fail silently instead?
		}
		_controller.hide();
	};
	
	Manager.prototype.hideAll = function(){
	  this._controllers.forEach( function( controller ){
	  	controller.hide();
	  } );
	  return _this;
	};
	
	Manager.prototype.hideAllByClass = function( Controller, isFamily ){
		var _instances = this.getByClass( Controller, isFamily );
		_instances.each( function( controller ){
			controller.hide();
		} );
		return _this;
	};
	
	Manager.prototype.hideAllExceptTheseIds = function( ids ){
		var _ids = ( typeof( ids )!== "undefined" ) ?  ids : [];
		this._controllers.forEach( function( controller ){
			if( _ids.indexOf( controller.idee() )==-1 ){
				controller.hide();
			}
		} );
	};
	
	Manager.prototype.hideAllExceptTheseClasses = function( Controllers, isFamily ){
		var _excludeFindings = true
			, _instances = this.getByClass( Controller, isFamily, _excludeFindings )
		;
		_instances.forEach( function( controller ){
			controller.hide();
		} );
		
		return _this;
	};
	
	Manager.prototype.reset = function () {
		this.hideAllExceptTheseIds( [ this.defawlt().idee() ]);
		this.defawlt().show(); 
	};
	
	Manager.prototype.destroy = function( idee ){
		for( var i=0, len=this._controllers.length; i<len; i++ ){
			if( this._controllers[i].idee() == idee ) {
				this._controllers.splice( i,1 );
				i--;
			}
		}
		//TODO: More detailed scrubbing for references to controllers and removal thereof will be needed to really delete the controller and allow for garbage collection
	};
	
	//TODO: destroy by class?
	
	Manager.mixin = function() {
		Manager.apply(this);
		this.defawlt = Manager.prototype.defawlt;
	
		return this;
	};
	
	return Manager;	
} )();

