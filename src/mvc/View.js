ns.View = (function () {
	var _ns = ns;
		
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
		var _view = new _View(replacement);
		return function(match) { return _view.evaluate(match); };
	}

	function _load(data, views, viewName, parentData, iterator){
		var _finalObj = data
			, _parsed
			, _view = views[viewName]
			, _parentData = parentData || {}
			, _myData = {}
		;
		
		if(typeof(iterator)!=="undefined") _finalObj.iterator = iterator;

		function _handleArray(arry, newViewName){
			var _returnList = "";
			if (views[newViewName]) {
				for(var i=0; i<arry.length; i++){
					var _returnObj = _load(arry[i], views, newViewName, arry, i+1);
					_returnList += _returnObj;
				}
			}  
			return _returnList;
		}
		if(_finalObj instanceof Array) {
			_parsed = _handleArray(_finalObj, viewName);
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
			return (_view && _view.evaluate) ? _view.evaluate(_finalObj) : "";
		}
	}
	
	function _View(params) {

		this._viewDefinition = 		(params && (typeof(params.view)!=="undefined")) ? params.view : "";
		this._name = 		(params && (typeof(params.name)!=="undefined")) ? params.name : "";
		this._pattern = 	(params && (typeof(params.pattern)!=="undefined")) ? params.pattern : /(^|.|\r|\n)(#\{(.*?)\})/;
		this._view;
		this._children = {};
		this._childrenInitialzed = false;
		
		this._setView = function (viewStr, name) {
			var _lookupname = name || (this._name != "") ? this._name : _ns.CONST.VIEW_DEFAULT;
			this._view = viewStr.toString();
			this._children[_lookupname] = this;
		};
		
		/* init */
		if ((params) && (typeof(params.view)!=="undefined")) {
			this._setView(params.view);
		}
		
		return this;
	}
	
	_View.prototype.addChild = function (view) {
		this._children[view.name()] = view;
	};
	
	_View.prototype.children = function(){
		if(this._childrenInitialzed) return this._children;
		var _tplContainer = document.getElementById(this._viewDefinition)
			, _viewNodes = (_tplContainer) ? _tplContainer.getElementsByTagName(_ns.CONST.VIEW_NODE_TAG) : [] 
		;
	
		for(var i=0, len=_viewNodes.length; i<len; i++){
			var _tplNode = _viewNodes[i];
			if(_tplNode.className == this._name){
				this._setView(_tplNode.value);
			} else {
				this.addChild(new _View({
			  	view: _tplNode.value
			  ,	name: _tplNode.className
			  }));
			}
		}	
		this._childrenInitialzed = true;
		return this._children;
	};
	
	_View.prototype.setPattern = function (pattern) {
		this._pattern = pattern;
	};

	_View.prototype.evaluate = function(object) {
		if ((typeof(object)!=="undefined") && (typeof(object.get)==="function")) {
			object = object.get();
		}
		
		var _output = this._view;
		for(attrib in object){
			_output = _output.replace(eval("/#\{"+attrib+"\}/g"), object[attrib]);
		}
		return _output;

		return _gsub(this._view, this._pattern, function(match) {
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
	
	_View.prototype.load = function (data) {
		return _load(data, this.children(), _ns.CONST.VIEW_DEFAULT);
	};
	
	_View.prototype.name = function(str){
		if(this._name != ""){ return this._name; } //set once - can't be overwritten
		this._name = str; 
	};
	
	return _View;
	
})();