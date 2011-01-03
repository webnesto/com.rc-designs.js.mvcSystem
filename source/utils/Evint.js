ns.Evint = (function(){
	var _ns = ns
		, _CONST = {
			PRIORITY_FIRST : "FIRST"
		, PRIORITY_LAST : "LAST"
		, API : {
				SUBSCRIBE: "subscribe"
			, UNSUBSCRIBE: "unsubscribe"
			, FIRE: "fire"
			}
		}
		, _listeners = {}
	;

	function _validateArgs(evintStr, listenter){
		// #ifdef debug
		try{
			if(
				(typeof(listener)!=="undefined")
			&& !(listener instanceof Function)
			)
				throw "Listener for " + evintStr + " is not a executable";
		} catch (err) {
			debug.error(err);
		}
		// #endif
	}
	
	function _Evint(parent){
		var _this = this
			, _parent = parent || false
		;
		
		_this.subscribe = function(evint, listener, priority){
			_validateArgs(evint, listener);
			
			if(typeof(_listeners[_this])==="undefined"){
				_listeners[_this] = {};
			}
			
			var _listenersForThis = _listeners[_this];
			
			if(typeof(_listenersForThis[evint])==="undefined"){
				_listenersForThis[evint] = [];
			}
			switch (priority) {
		  	case _CONST.PRIORITY_FIRST:
		  		_listenersForThis[evint].unshift(listener);
		  	break;
		  	case _CONST.PRIORITY_LAST:
		  		//TODO:
		  	break;
		  	default:
		  		_listenersForThis[evint].push(listener);
		  	break;
		  }
		};
		
		_this.unsubscribe = function(evint, listener){
			_validateArgs(evint, listener);
			var _eventListeners = _listeners[_this][evint];
			if( _eventListeners instanceof Array){
				for(var i=0, len=_eventListeners.length; i<len; i++) {
					if(_eventListeners[i]===listener){
				 		_eventListeners.splice(i,1);
						break;
					}
				}
			}
		};
		
		_this.fire = function(theEvent){
			var _type = (typeof(theEvent)==="string") ? theEvent : theEvent["type"];
			_validateArgs(_type);
			var _target = theEvent["target"] || this
				, _bubbles = theEvent["bubbles"] || false
				, _currentTarget = theEvent["currentTarget"] || this
				, _relatedTarget = theEvent["relatedTarget"] || null
				, _timestamp = theEvent["timestamp"] || new Date().getTime()
				, _memo = theEvent["memo"] || {}
				, _event = 
					{
						"type": _type
					, "target": _target
					, "currentTarget" : _currentTarget
					, "relatedTarget" : _relatedTarget
					, "timestamp" : _timestamp
					// NOTE: event attributes are designed to match native JS Event Obj. attributes - therefore future bubbling/other functionality is possible
					, "memo": _memo
					}
				, _currentParent = (typeof(this.getParent)=="function") ? this.getParent() : _parent
			;
			
			if (
				 _listeners[_this] 
			&& (_listeners[_this][_type] instanceof Array)
			){
				var _eventListeners =_listeners[_this][_type];
				for (var i=0, len=_eventListeners.length; i < len; i++){
					_eventListeners[i].call(_target, _event);
				}
	    }
			if(
				 _currentParent 
			&& _currentParent.fire 
			&& (typeof(_currentParent.fire)=="function")
			){
				return _parent.fire();
			}
		};

		return _this;
	}
	
	_Evint.CONST = _CONST;
	
	return _Evint;
	
})();