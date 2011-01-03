/**
 * @fileoverview This is to help proxy the different browsers console behaviors.
 */
/*
// Any debug.options defined here will be shown and rest will be hidden... unless this block isn't included, then all will be shown.
var debug = {
		options: {
			info: true
		}
}*/

var debug = (function(){
	var _this = {};
	
	//set default to avoid errors
	_this.info = function(){};
	_this.log = function(){};
	_this.debug = function(){};
	_this.warn = function(){};
	_this.error = function(){}; //function(msg){ alert(msg); };
	_this.assert = function(){};
	_this.profile = function(){};
	_this.profileEnd = function(){};
	_this.time = function(){};
	_this.timeEnd = function(){};
	
	var _defaultOptions = {};
	var 
		_defaultOptions = {
			info: true
		,	log: true
		,	debug: true
		,	warn: true
		,	error: true
		,	assert: true
		,	profile: true
		,	profileEnd: true
		,	time: true
		,	timeEnd: true
		}
	;
	var 
		_options = (debug ? debug.options : _defaultOptions) || _defaultOptions
	,	_winCon = (window.console) || false
	;

	// Determine Debug Mode
	if(_winCon && _winCon.debug) {
		/**
		 * Make Debug object a reference to console if we're in
		 * FireFox and the FireBug module exists or have fireBug Lite included on the page.
		 */ 
		_this = _winCon;
		_this.log = _this.debug;
		_this.options = _options;
		
	}	else if (_winCon && navigator.userAgent.toLowerCase().indexOf('webkit') > -1){
		// Webkit Debug Console
		function DebugWebKit() {}
		DebugWebKit.info = function (message, objects) {
			DebugWebKit.console('INFO', message, objects);
		};
		DebugWebKit.log = DebugWebKit.info;
		DebugWebKit.assert = function (message, objects) {
			DebugWebKit.console('ASSERT', Boolean(eval(message)), objects);
		};
		DebugWebKit.debug = function (message, objects) {
			DebugWebKit.console('DEBUG', message, objects);
		};
		DebugWebKit.warn = function (message, objects) {
				DebugWebKit.console('WARN', message, objects);
		};
		DebugWebKit.error = function (message, objects) {
			DebugWebKit.console('ERROR', message, objects);
		};
		DebugWebKit.console = function(type, message, objects) {
			var output = [type, ': ', message].join('');
			if(objects) {
				output = [output, ' Object ',  objects.toString()].join('');
			}
			_winCon.log(output);
		};
		DebugWebKit.profile = function(){};
		DebugWebKit.profileEnd = function(){};
		DebugWebKit.time = function(){};
		DebugWebKit.timeEnd = function(){};
		DebugWebKit.options = _this.options;
		
		_this = DebugWebKit;
		
	}	else if(_winCon) {
		_this = _winCon;

		_this.debug = function(){
			var _args = [].slice.call(arguments,0);
			_args.unshift("DEBUG: ");
			_winCon.warn(_args.join(", "));
		};
		_this.profile = function(){};
		_this.profileEnd = function(){};
		_this.time = function(){};
		_this.timeEnd = function(){};
	
	}
	
	/* Optional disabling of specific log types */
	if(!_options.showAll) {
		if(!_options.info) _this.info = function(){};
		if(!_options.log) _this.log = function(){};
		if(!_options.debug) _this.debug = function(){};
		if(!_options.warn) _this.warn = function(){};
		if(!_options.error) _this.error = function(){ };
		if(!_options.assert) _this.assert = function(){ };
		if(!_options.profile) _this.profile = function(){};
		if(!_options.profileEnd) _this.profileEnd = function(){};
		if(!_options.time) _this.time = function(){};
		if(!_options.timeEnd) _this.timeEnd = function(){};
	}

	return _this;
})();
debug.browser = (function(){
	var _this = {}
		, _initialized = false
		, _name
		, _os
		, _version
		, _CONST = {
			NAMES: {
				CHROME: "Chrome"
			, OMNIWEB: "OmniWeb"
			, SAFARI: "Safari"
			, OPERA: "Opera"
			, ICAB: "iCab"
			, KONQUEROR: "Konqueror"
			, FIREFOX: "Firefox"
			, CAMINO: "Camino"
			, NETSCAPE: "Netscape"
			, EXPLORER: "Explorer"
			, MOZILLA: "Mozilla"
			}
		, OS: {
				WINDOWS: "Windows"
			, MAC: "Mac"
			, IPHONE: "iPhone/iPod"
			, LINUX: "Linux"
			}
		}
	;
	function _init() {
		_name = _searchString(_dataBrowser) || "An unknown browser";
		_version = _searchVersion(navigator.userAgent)
			|| _searchVersion(navigator.appVersion)
			|| "an unknown version";
		_os = _searchString(_dataOS) || "an unknown OS";
		_initialized = true;
	}
	
	function _searchString(data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			_this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	}
	
	function _searchVersion(dataString) {
		var index = dataString.indexOf(_this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+_this.versionSearchString.length+1));
	}
	
	var _dataBrowser = [
		{
			string: navigator.userAgent
		,	subString: _CONST.NAMES.CHROME
		,	identity: _CONST.NAMES.CHROME
		}
	,	{ 	
			string: navigator.userAgent
		,	subString: _CONST.NAMES.OMNIWEB
		,	versionSearch: _CONST.NAMES.OMNIWEB+"/"
		,	identity: _CONST.NAMES.OMNIWEB
		}
	,	{
			string: navigator.vendor
		,	subString: "Apple"
		,	identity: _CONST.NAMES.SAFARI
		,	versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: _CONST.NAMES.OPERA
		}
	,	{
			string: navigator.vendor
		,	subString: _CONST.NAMES.ICAB
		,	identity: _CONST.NAMES.ICAB
		}
	,	{
			string: navigator.vendor
		,	subString: "KDE"
		,	identity: _CONST.NAMES.KONQUEROR
		}
	,	{
			string: navigator.userAgent
		,	subString: _CONST.NAMES.FIREFOX
		,	identity: _CONST.NAMES.FIREFOX
		}
	,	{
			string: navigator.vendor
		,	subString: _CONST.NAMES.CAMINO
		,	identity: _CONST.NAMES.CAMINO
		}
	,	{		// for newer Netscapes (6+)
			string: navigator.userAgent
		,	subString: _CONST.NAMES.NETSCAPE
		,	identity: _CONST.NAMES.NETSCAPE
		}
	,	{
			string: navigator.userAgent
		,	subString: "MSIE"
		,	identity: _CONST.NAMES.EXPLORER
		,	versionSearch: "MSIE"
		}
	,	{
			string: navigator.userAgent
		,	subString: "Gecko"
		,	identity: _CONST.NAMES.MOZILLA
		,	versionSearch: "rv"
		}
	,	{ 		// for older Netscapes (4-)
			string: navigator.userAgent
		,	subString: _CONST.NAMES.MOZILLA
		,	identity: _CONST.NAMES.NETSCAPE
		,	versionSearch: _CONST.NAMES.MOZILLA
		}
	];
	var _dataOS = [
		{
			string: navigator.platform
		,	subString: "Win"
		,	identity: _CONST.OS.WINDOWS
		}
	,	{
			string: navigator.platform
		,	subString: _CONST.OS.MAC
		,	identity: _CONST.OS.MAC
		}
	,	{
			string: navigator.userAgent
		,	subString: "iPhone"
		,	identity: _CONST.OS.IPHONE
	  }
	,	{
			string: navigator.platform
		,	subString: _CONST.OS.LINUX
		,	identity: _CONST.OS.LINUX
		}
	];
	_this.name = function(){
		if(!_initialized) {
			_init();
		}
		return _name;
	};
	_this.os = function(){
		if(!_initialized) {
			_init();
		}
		return _os;
	};
	_this.version = function(){
		if(!_initialized) {
			_init();
		}
		return _version;
	};
	
	_this.NAMES = _CONST.NAMES;
	_this.OS = _CONST.OS;
	
	return _this;
})();
