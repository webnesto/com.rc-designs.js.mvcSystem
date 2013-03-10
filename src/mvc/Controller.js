/**
 * @fileover
 * mvc views Abstract view implements core mvc view methods.
 * 
 * @author ernesto
 * @date 11/18/2009
 * 
 * 
 * @requires utils.Evint
 * @requires utils.Array
 * @requires utils.Laundry
 * @requires utils.imageLoader
 * @requires utils.sizzle
 * 
 */

/**
 * @class Abstract view implements core mvc view methods.
 * 
 * @requires utils.Evint
 */
ns.Controller = ( function () {
	/**#@+
	 * @private
	 * @memberOf mvc.Controller
	*/ //START CLASS PRIVATE
	var 
		_ns = ns
	, _instances = 0
	;
	
	/**#@-*/ //END CLASS PRIVATE
	function Controller( params ) {
		
		this._instance = _instances++;
		this._parent = ( params && params.parent ) ? params.parent : false;
		this._children = ( params && params.children ) ?  params.children : [];
		//, _manager = ( params ) ? params.manager || _ns.manager : _ns.manager;
		this._model = false;
		this._container = ( params && params.container ) ? params.container : false;
		this._useContainer = ( params && params.useContainer ) ? params.useContainer : false;
		this._staticContent = ( params && params.staticContent ) ? params.staticContent : false;
		this._tag = ( params && params.tag ) ? params.tag : _ns.CONST.NODE_TYPE_DEFAULT;
		this._prepped = false;
		this._visible = false;
		this._view = false;
		this._node = false;
		this._container = ( params && params.container ) ? params.container : false;
		this._pattern = ( (params ) && ( typeof( params.pattern )!=="undefined" )) ? params.pattern : /( ^|.|\r|\n )( #\{( .*? )\} )/;
		
		this.Model = _ns.Model; //Possible to be overwritten ( Not required )
		this.View = _ns.CONST.VIEWS_DEFAULT; //Should be overridden in most cases
		
		utils.Evint.call( this, this._parent ); // mixin Event
		utils.Laundry.apply( this ); //mixin Laundry
		
		/* init */
		if( params && params.model ){
			this.model( params.model );
		}
	
		return this;
	}
	
	Controller.prototype._getView = function () {
		if( this._view ){
			return this._view;
		}
		this._view = new _ns.View( {
  		view: this.View
		, pattern: this._pattern
  	} );
		return this._view;
	};
	
	Controller.prototype.document = function(){
		return document;
	};
	
	Controller.prototype.idee = function(){
			return "_ns.Controller." + this._instance;
		};
		
	Controller.prototype.setParent = function( parent ){
		if( this._parent ){
			throw "I already have a parent!  You can't adopt me!"; // TODO: potentially don't want to do this... might want to have multiple parents
		}
		this._parent = parent;
		return this;
	};
		
	Controller.prototype.getParent = function(){
		return this._parent;
	};	
	
	Controller.prototype.addChild = function( child ){
		this._children.push( child );
		return this;
	};
	
	Controller.prototype.removeChild = function( unwanted ){
		this._children = this._children.filter( function( child ){
			return child != unwanted;
		} );
		return this;
	};
		
	//TODO: should we expose the children collection?	
		
	Controller.prototype.isPrepped = function(){	
		return this._prepped;	
	};
		
	Controller.prototype.setPrepped = function( state ){	
		this._prepped = state;	
	};
		
	Controller.prototype.isVisible = function(){ 
		return this._visible;	
	};
		
	Controller.prototype.setVisible = function(){ 
		this._visible = true;		
	};
		
	Controller.prototype.setNotVisible = function(){	
		this._visible = false;	
	};
		
	Controller.prototype.prepare = function(){
		//#ifdef debug
		//debug.log( "Controller.prepare()", this, this.idee() );
		//#endif
		if ( !this._prepped ) {
			//#ifdef debug
			debug.log( "Controller.prepare() - creating node" );
			//#endif
			
			this.node(); //call node to initialize it
			
	  	this.setPrepped( true );
	  	
	  	this.fire( _ns.CONST.EVENTS.PREP );
  	}
		this._children.forEach( function( controller ){
			controller.prepare();
		} );
		
		return this;
	};
	
	Controller.prototype.refresh = function(){
		var
			_data
		,	_imagesToLoad
		, i //iterator
		, len //iterator check
		;
		
		//#ifdef debug
		//debug.log( "Controller.refresh()", this, this.idee() );
		//#endif
		if( !this._prepped ) this.prepare();
		// stop any observers
		//TODO:			this.node().select( "*" ).each( function( element ){
		//TODO: Is this required?				Event.stopObserving( element ); //it is required to support IE6 ( possibly later IE's as well )
		//} );
		_data = this.model();
		if ( !this._staticContent ) {
			if( 
				( typeof( this.model() ) !== "undefined" ) 
			&&( typeof( this.model().get ) === "function" )
			) { 
				_data = this.model().get();
			}
	  	this.node().innerHTML = this._getView().load( _data );//, this.children(), _ns.CONST.VIEW_DEFAULT );
	  	
	  	_imagesToLoad = this.node().select( "img." + _ns.CONST.IMAGE_LOADER_CLASS );
			
	  	for ( i = 0, len = _imagesToLoad.length; i < len; i++ ) {
	  		new utils.imageLoader( _imagesToLoad[i] );
	  	}
	  }
		
		this.isClean();
		
		this.fire( _ns.CONST.EVENTS.REFRESH );
		
		this.load();
		
		this._children.forEach( function( controller ){
			controller.refresh();
		} );
		
		return this;
	};
	
	Controller.prototype.load = function() {
		// This method should be extended/overwritten with real load content
	};

	Controller.prototype.show = function() {
		//#ifdef debug
		//debug.log( "Controller.show()", this, this.idee() );
		//#endif
		if ( !this.isVisible() ) {
	  	if ( !this._prepped ) {
				this.prepare();
			}
	  	if ( this.needWashing() ) {
	  		this.refresh();
	  	}
	  	this.node().style.display = "";
	  	this.setVisible();
	  	this.fire( _ns.CONST.EVENTS.SHOW );
	  }
		
		this._children.forEach( function( controller ){
			controller.show();
		} );
		
		return this;
	};
	
	Controller.prototype.hide = function(){
		//#ifdef debug
		//debug.log( "Controller.hide()", this, this.idee() );
		//#endif
		if( !this._prepped ){
			return this;
		}
		if ( this._visible ) {
	  	this.node().style.display = "none";
	  	this.setNotVisible();
	  	this.fire( _ns.CONST.EVENTS.HIDE );
	  }
		this._children.forEach( function( controller ){
			controller.hide();
		} );
		return this;
	};
	
	Controller.prototype.toggle = function(){
		//#ifdef debug
		//debug.log( "Controller.toggle()", this, this.idee() );
		//#endif
		if ( this._visible ) {
	  	_action = this.hide();
	  } else {
			_action = this.show();
		}
		return this;
	};
	
	Controller.prototype.model = function( model ){
  	if ( (this._model && this._model instanceof this.Model ) && ( typeof( model )=="undefined" )) {
  		return this._model;
  	}
  	else {
			try {
	  		this._model = model || new this.Model();
				this._model.subscribe(
					_ns.CONST.EVENTS.CHANGE
				, this.isDirty
				, utils.Evint.CONST.PRIORITY_FIRST
				); //Note this view's need for washing since the data's gotten dirty ( changed );
	  		return this._model;
		  } catch( err ){
				debug.error( err );
				//debug.error( err, this, this.idee() );
			}
  	}
	};
	
	Controller.prototype.node = function () {
		if( this._node ){
			return this._node;
		}
		this._node = ( this._useContainer ) ? this.container() : this.document().createElement( this._tag );
		var _className = this.View.replace( /\./g,"_" ).toUpperCase() + " " + _ns.CONST.VIEW_CLASS;
		this._node.className = ( this._node.className == "" ) ? _className : this._node.className + " " + _className;
  	this._node.style.display = "none";
  	if ( !this._useContainer ) {
  		this.container().appendChild( this._node );
  	}
		utils.sizzle.call( this._node ); //Provide selector capacity
	  return this._node;
	};
	
	Controller.prototype.container = function( container ){
		if( this._container ){
			return this._container;
		}else{
			this._container = container || this.document().body;
			return this._container;
		}
	};
	
	
	
	Controller.getInstances = function() {
		return _instances;	
	};
	
	return Controller;
} )();