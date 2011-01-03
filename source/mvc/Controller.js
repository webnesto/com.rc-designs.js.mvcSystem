/**
 * @fileover
 * mvc views Abstract view implements core mvc view methods.
 * 
 * @author ernesto
 * @date 11/18/2009
 */

/**
 * @class Abstract view implements core mvc view methods.
 * 
 * @requires utils.Evint
 */
ns.Controller = (function () {
	/**#@+
	 * @private
	 * @memberOf mvc.Controller
	*/ //START CLASS PRIVATE
	var _ns = ns
		, _logger = function(){} // debug.log // 
		, _instances = 0
	;
	
	/**#@-*/ //END CLASS PRIVATE
	function Controller(params) {
		var _this = this
			, _instance = _instances++
			, _parent = (params && params.parent) ? params.parent : false
			, _children = (params && params.children) ?  params.children : []
			//, _manager = (params) ? params.manager || _ns.manager : _ns.manager
			, _view = false
			, _model = false
			, _container = (params && params.container) ? params.container : false
			, _useContainer = (params && params.useContainer) ? params.useContainer : false
			, _staticContent = (params && params.staticContent) ? params.staticContent : false
			, _tag = (params && params.tag) ? params.tag : _ns.CONST.NODE_TYPE_DEFAULT
			, _prepped = false
			, _visible = false
		;
		utils.Evint.call(this, _parent); // mixin Event
		
		function _monitorModel(){
			if (_model && _view) {
	  		_model.subscribe(
					_ns.CONST.EVENTS.CHANGE
				, _this.view().isDirty
				, utils.Evint.CONST.PRIORITY_FIRST
				); //Note this view's need for washing since the data's gotten dirty (changed)
			}
		}
		
		_this.idee = function(){
			return "_ns.Controller." + _instance;
		};
		
		_this.setParent = function(parent){
			if(_parent){
				throw "I already have a parent!  You can't adopt me!"; // TODO: potentially don't want to do this... might want to have multiple parents
			}
			_parent = parent;
			return _this;
		};
			
		_this.getParent = function(){
			return _parent;
		};	
		
		_this.addChild = function(child){
			_children.push(child);
			return _this;
		};
		
		_this.removeChild = function(unwanted){
			_children = _children.filter(function(child){
				return child != unwanted;
			});
			return _this;
		};
			
		//TODO: should we expose the children collection?	
			
		_this.isPrepped = function(){	
			return _prepped;	
		};
			
		_this.setPrepped = function(state){	
			_prepped = state;	
		};
			
		_this.isVisible = function(){ 
			return _visible;	
		};
			
		_this.setVisible = function(){ 
			_visible = true;		
		};
			
		_this.setNotVisible = function(){	
			_visible = false;	
		};
			
			
			
		_this.prepare = function(){
			//#ifdef debug
			_logger("Controller.prepare()", _this, _this.idee());
			//#endif
			if (!_prepped) {
				//#ifdef debug
				_logger("Controller.prepare() - creating node");
				//#endif
				/*
		  	var _newNode = (_useContainer) ? _this.container() : _this.document().createElement(_tag)
					, _className = _this.view().Templates.replace(/\./g,"_").toUpperCase() + " " + _ns.CONST.VIEW_CLASS //TODO: replace "view" with other exposed constant.
				;
				_newNode.className = (_newNode.className == "") ? _className : _newNode.className + " " + _className;
		  	_newNode.style.display = "none";
		  	if (!_useContainer) {
					_this.container().appendChild(_newNode);
				}
		  	_this.node = function(){
					utils.sizzle.call(_newNode); //Provide selector capacity
		  		return _newNode;
		  	};*/
				_this.node = _this.view().node;
				
		  	_this.setPrepped(true);
		  	
		  	_this.fire(_ns.CONST.EVENTS.PREP);
	  	}
			_children.forEach(function(controller){
				controller.prepare();
			});
			
			return _this;
		};
		
		_this.refresh = function(){
			//#ifdef debug
			_logger("Controller.refresh()", _this, _this.idee());
			//#endif
			if(!_prepped) _this.prepare();
  		// stop any observers
			//TODO:			_this.node().select("*").each(function(element){
			//TODO: Is this required?				Event.stopObserving(element);
			//});
			
			_this.view().refresh(_this.model());
			
			_this.fire(_ns.CONST.EVENTS.REFRESH);
			
			_this.load();
			
			_children.forEach(function(controller){
				controller.refresh();
			});
			
			return _this;
		};
		
		_this.load = function() {
			// This method should be extended/overwritten with real load content
		};

		_this.show = function() {
			//#ifdef debug
			_logger("Controller.show()", _this, _this.idee());
			//#endif
			if (!_this.isVisible()) {
		  	if (!_prepped) {
					_this.prepare();
				}
		  	if (_this.view().needWashing()) {
		  		_this.refresh();
		  	}
		  	_this.node().style.display = "";
		  	_this.setVisible();
		  	_this.fire(_ns.CONST.EVENTS.SHOW);
		  }
			
			_children.forEach(function(controller){
				controller.show();
			});
			
			return _this;
		};
		
		_this.hide = function(){
			//#ifdef debug
			_logger("Controller.hide()", _this, _this.idee());
			//#endif
			if(!_prepped){
				return _this;
			}
			if (_visible) {
		  	_this.node().style.display = "none";
		  	_this.setNotVisible();
		  	_this.fire(_ns.CONST.EVENTS.HIDE);
		  }
			_children.forEach(function(controller){
				controller.hide();
			});
			return _this;
		};
		
		_this.toggle = function(){
			//#ifdef debug
			_logger("Controller.toggle()", _this, _this.idee());
			//#endif
			if (_visible) {
		  	_action = _this.hide();
		  } else {
				_action = _this.show();
			}
			return _this;
		};
		
		
		
		_this.view = function(view){
			//#ifdef debug
			//debug.trace();
			_logger("Controller.view()" + (((!_view) && (view)) ? "set" : "get"), _this, _this.idee());
			//#endif
			if(_view){
				return _view;
			}else{
				_view = view || new _this.View({
					container: _container
				, useContainer: _useContainer
				, staticContent: _staticContent
				, tag: _tag	
				});
				_monitorModel();
				return _view;
			}
		};
	
		_this.node = function () {}; //Overridden by prepare maps to view().node()
		
		_this.model = function(model){
	  	if (_model && (typeof(model)=="undefined")) {
	  		return _model;
	  	}
	  	else {
				try {
		  		_model = model || new _this.Model();
					_monitorModel();
		  		return _model;
			  } catch(err){
					debug.error(err, _this, _this.idee());
				}
	  	}
		};
				
				
				
		_this.Model = _ns.Model; //Possible to be overwritten (Not required)
		
		_this.View = _ns.View; //Expected to be overwritten (Currently required... may be modified)
		
		
		if(params && params.model){
			_this.model(params.model);
		}
	
		return _this;
	}
	
	Controller.getInstances = function() {
		return _instances;	
	}
	
	return Controller;
})();