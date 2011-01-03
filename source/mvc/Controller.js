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
ns.Controller = (function () {
	/**#@+
	 * @private
	 * @memberOf mvc.Controller
	*/ //START CLASS PRIVATE
	var _ns = ns
		, _logger = function(){} // debug.log // 
		, _instances = 0
	;
	
	var Template = (function () {
		function _gsub(str, pattern, replacement) {
			var result = ''
				, source = str
				, match
			;
			replacement = _prepareReplacement(replacement);
	
			while (source.length > 0) {
				if (match = source.match(pattern)) {
					result += source.slice(0, match.index);
					result += (replacement(match)) || '';
					source  = source.slice(match.index + match[0].length);
				} else {
					result += source, source = '';
				}
			}
			return result;
		}
		
		function _prepareReplacement(replacement) {
			if (typeof(replacement) === "function") {
				return replacement;
			}
			var template = new View(replacement);
			return function(match) { return template.evaluate(match); };
		}
	
		function _load(data, views, templateName, parentData, iterator){
			var _finalObj = data
				, _parsed
				, _template = views[templateName]
				, _parentData = parentData || {}
				, _myData = {}
			;
			
			if(typeof(iterator)!=="undefined") _finalObj.iterator = iterator;
	
			function _handleArray(arry, newTemplateName){
				var _returnList = "";
				if (views[newTemplateName]) {
					for(var i=0; i<arry.length; i++){
						var _returnObj = _load(arry[i], views, newTemplateName, arry, i+1);
						_returnList += _returnObj;
					}
				}  
				return _returnList;
			}
			if(_finalObj instanceof Array) {
				_parsed = _handleArray(_finalObj, templateName);
				return(_parsed);
			} else {
				for (var attrib in _finalObj) {
					if (_finalObj.hasOwnProperty(attrib)) {
						if (_finalObj[attrib] instanceof Array) {
							_finalObj[attrib] = _handleArray(_finalObj[attrib], attrib);
						} else if (_finalObj[attrib] instanceof Object) {
							if (views[attrib]) {
								var _returnObj = _load(_finalObj[attrib], views, attrib, _finalObj, null);
								_finalObj[attrib] = _returnObj;
							}
						}
					}
				}
				return (_template && _template.evaluate) ? _template.evaluate(_finalObj) : "";
			}
		}
		
		function _Template(params) {
			var 
				_this = this
			, _view = 		(params && (typeof(params.view)!=="undefined")) ? params.view : ""
			, _name = 		(params && (typeof(params.name)!=="undefined")) ? params.name : ""
			,	_pattern = 	(params && (typeof(params.pattern)!=="undefined")) ? params.pattern : /(^|.|\r|\n)(#\{(.*?)\})/
			, _template
			, _children = {}//false
			, _childrenInitialzed = false
			;
			
			function _setTemplate (templateStr, name) {
				var _lookupname = name || (_name != "") ? _name : _ns.CONST.VIEW_DEFAULT;
				_template = templateStr.toString();
				_children[_lookupname] = _this;
			};
			
			_this.addChild = function (view) {
				_children[view.name()] = view;
			};
			
			_this.children = function(){
				if(_childrenInitialzed) return _children;
				var _tplContainer = document.getElementById(_view)
					, _templateNodes = (_tplContainer) ? _tplContainer.getElementsByTagName(_ns.CONST.VIEW_NODE_TAG) : [] 
				;
			
				for(var i=0, len=_templateNodes.length; i<len; i++){
					var _tplNode = _templateNodes[i];
					if(_tplNode.className == _name){
						_setTemplate(_tplNode.value);
					} else {
						_this.addChild(new _Template({
					  	template: _tplNode.value
					  ,	name: _tplNode.className
					  }));
					}
				}	
				_childrenInitialzed = true;
				return _children;
			};
			
			_this.setPattern = function (pattern) {
				_pattern = pattern;
			};
		
			_this.evaluate = function(object) {
				if ((typeof(object)!=="undefined") && (typeof(object.get)==="function")) {
					object = object.get();
				}
				
				var _output = _template;
				for(attrib in object){
					_output = _output.replace(eval("/#\{"+attrib+"\}/g"), object[attrib]);
				}
				return _output;
	
				return _gsub(_template, _pattern, function(match) {
					if (object == null) return '';
	
					var before = match[1] || '';
					if (before == '\\') return match[2];
	
					var ctx = object, expr = match[3];
					var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
					match = pattern.exec(expr);
					if (match == null) return before;
	
					while (match != null) {
						var comp = (match[1].indexOf('[')===0) ? _gsub(match[2], '\\\\]', ']') : match[1];
						ctx = ctx[comp];
						if (null == ctx || '' == match[3]) break;
						expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
						match = pattern.exec(expr);
					}
					var _ctx = ctx || '';
					return before + _ctx;
				});
			};
			
			_this.load = function (data) {
				return _load(data, _this.children(), _ns.CONST.VIEW_DEFAULT);
			};
			
			_this.name = function(str){
				if(_name != ""){ return _name; } //set once - can't be overwritten
				_name = str; 
			};
			
			/* init */
			if ((params) && (typeof(params.template)!=="undefined")) {
				_setTemplate(params.template);
			}
			
			return _this;
		}
		
		return _Template;
		
	})();
	
	/**#@-*/ //END CLASS PRIVATE
	function Controller(params) {
		
		var _this = this
			, _instance = _instances++
			, _parent = (params && params.parent) ? params.parent : false
			, _children = (params && params.children) ?  params.children : []
			//, _manager = (params) ? params.manager || _ns.manager : _ns.manager
			, _model = false
			, _container = (params && params.container) ? params.container : false
			, _useContainer = (params && params.useContainer) ? params.useContainer : false
			, _staticContent = (params && params.staticContent) ? params.staticContent : false
			, _tag = (params && params.tag) ? params.tag : _ns.CONST.NODE_TYPE_DEFAULT
			, _prepped = false
			, _visible = false
			
			
			, _template = false
			, _node = false
			, _container = (params && params.container) ? params.container : false
			, _pattern = ((params) && (typeof(params.pattern)!=="undefined")) ? params.pattern : /(^|.|\r|\n)(#\{(.*?)\})/
		;
		utils.Evint.call(_this, _parent); // mixin Event
		utils.Laundry.apply(_this); //mixin Laundry
		_this.constructor = Controller;
		
		function _monitorModel(){
			//if (_model && _view) {
	  		_model.subscribe(
					_ns.CONST.EVENTS.CHANGE
				, _this.isDirty
				, utils.Evint.CONST.PRIORITY_FIRST
				); //Note this view's need for washing since the data's gotten dirty (changed)
			//}
		}
		
		function _getTemplate() {
			if(_template){
				return _template;
			}
			_template = new Template({
	  		view: _this.View
			, pattern: _pattern
	  	});
			return _template;
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
				
				_this.node(); //call node to initialize it
				
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
			
			var _data = _this.model();
			if (!_staticContent) {
				if ((typeof(_this.model())!=="undefined") && (typeof(_this.model().get)==="function")) { 
					_data = _this.model().get();
				}
		  	_this.node().innerHTML = _getTemplate().load(_data);//, _this.children(), _ns.CONST.VIEW_DEFAULT);
		  	
		  	var _imagesToLoad = _this.node().select("img." + _ns.CONST.IMAGE_LOADER_CLASS);
		  	for (var i = 0, len = _imagesToLoad.length; i < len; i++) {
		  		new utils.imageLoader(_imagesToLoad[i]);
		  	}
		  }
			
			_this.isClean();
			
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
		  	if (_this.needWashing()) {
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
		
		_this.node = function () {
			if(_node){
				return _node;
			}
			_node = (_useContainer) ? _this.container() : _this.document().createElement(_tag);
			var _className = _this.View.replace(/\./g,"_").toUpperCase() + " " + _ns.CONST.VIEW_CLASS;
			_node.className = (_node.className == "") ? _className : _node.className + " " + _className;
	  	_node.style.display = "none";
	  	if (!_useContainer) {
	  		_this.container().appendChild(_node);
	  	}
			utils.sizzle.call(_node); //Provide selector capacity
		  return _node;
		};
		
		_this.container = function(container){
			if(_container){
				return _container;
			}else{
				_container = container || _this.document().body;
				return _container;
			}
		};
		
		_this.Model = _ns.Model; //Possible to be overwritten (Not required)
		
		_this.View = _ns.CONST.VIEWS_DEFAULT; //Should be overridden in most cases
		
		/* init */
		if(params && params.model){
			_this.model(params.model);
		}
	
		return _this;
	}
	
	Controller.prototype.document = function(){
		return document;
	};
	
	Controller.getInstances = function() {
		return _instances;	
	};
	
	return Controller;
})();