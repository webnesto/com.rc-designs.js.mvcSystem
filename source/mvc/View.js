/**
 * For creating/loading complex template sets extracted from PrototypeJS 1.6
 *
 * @requires utils.Evint
 * @requires utils.Array
 * @requires utils.Laundry
 * @requires utils.imageLoader
 * @requires utils.sizzle
 */

ns.View = (function(){
	var _ns = ns
		, _root = _root
	;
	
	//#ifdef debug
	debug.log("loading ns:"+ns.NAME+".View");
	//#endif
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
	
	function View( params ) {
		utils.Evint.apply(this); // mixin Event
		utils.Laundry.apply(this); //mixin Laundry
		var _this = this
			, _name = (params && (typeof(params.name)!=="undefined")) ? params.name : ""
			, _template
			, _children = {}//false
			, _childrenInitialzed = false
			, _node = false
			, _container = (params && params.container) ? params.container : false
			, _useContainer = (params && params.useContainer) ? params.useContainer : false
			, _staticContent = (params && params.staticContent) ? params.staticContent : false
			, _tag = (params && params.tag) ? params.tag : _ns.CONST.NODE_TYPE_DEFAULT
			, _pattern = ((params) && (typeof(params.pattern)!=="undefined")) ? params.pattern : /(^|.|\r|\n)(#\{(.*?)\})/
		;
		
		function _setTemplate (templateStr, name) {
			var _lookupname = name || (_name != "") ? _name : _ns.CONST.TEMPLATE_DEFAULT;
			_template = templateStr.toString();
			_children[_lookupname] = _this;
		};
		
		_this.addChild = function (view) {
			_children[view.name()] = view;
		};
		
		_this.children = function(){
			if(_childrenInitialzed) return _children;
			var _tplContainer = document.getElementById(_this.Templates)
				, _templateNodes = (_tplContainer) ? _tplContainer.getElementsByTagName(_ns.CONST.TEMPLATE_NODE_TAG) : [] 
			;
		
			for(var i=0, len=_templateNodes.length; i<len; i++){
				var _tplNode = _templateNodes[i];
				if(_tplNode.className == _name){
					_setTemplate(_tplNode.value);
				} else {
					_this.addChild(new View({
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
		
		_this.node = function () {
			if(_node){
				return _node;
			}
			_node = (_useContainer) ? _this.container() : _this.document().createElement(_tag);
			var _className = _this.Templates.replace(/\./g,"_").toUpperCase() + " " + _ns.CONST.VIEW_CLASS;
			_node.className = (_node.className == "") ? _className : _node.className + " " + _className;
	  	_node.style.display = "none";
	  	if (!_useContainer) {
	  		_this.container().appendChild(_node);
	  	}
			utils.sizzle.call(_node); //Provide selector capacity
		  return _node;
		};
		
		_this.refresh = function(model) {
			var _data = model;
			if (!_staticContent) {
				if ((typeof(model)!=="undefined") && (typeof(model.get)==="function")) { 
					_data = model.get();
				}
		  	_this.node().innerHTML = _load(_data, _this.children(), _ns.CONST.TEMPLATE_DEFAULT);
		  	
		  	var _imagesToLoad = _this.node().select("img." + _ns.CONST.IMAGE_LOADER_CLASS);
		  	for (var i = 0, len = _imagesToLoad.length; i < len; i++) {
		  		new utils.imageLoader(_imagesToLoad[i]);
		  	}
		  }
			_this.isClean();
			
			return true;
		};
		
		_this.container = function(container){
			if(_container){
				return _container;
			}else{
				_container = container || _this.document().body;
				return _container;
			}
		};
		
		_this.document = function(){
			return document;
		};
		
		_this.name = function(str){
			if(_name != ""){ return _name; } //set once - can't be overwritten
			_name = str; 
		};
		
		_this.gsub = _gsub;
		
		_this.Templates = _ns.CONST.TEMPLATES_DEFAULT; //Should be overridden in most cases
		
		/* init */
		if ((params) && (typeof(params.template)!=="undefined")) {
			_setTemplate(params.template);
		}
		
		return _this;
	}
	
	return View;
})();
