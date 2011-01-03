/**
 * @requires utils.Evint
 * @requires utils.Array
 */

ns.Manager = (function(){
	var _ns = ns
	;
	
	function Manager(){
		utils.Evint.apply(this); // apply Event
		var _this = this
			, _controllers = utils.Array()
		;
		
		function _findById(idee) {
		  var _controller = _controllers.findFirst(function(controller){
		  	return (controller.idee() == idee);// ? controller : false;
		  });
		  return _controller;
		}
		
		function _findByClass(Controller, isFamily, include){
			var _instances = []
				, _include = (include) ? true : false
			;
			_controllers.forEach(function(controller){//TODO: convert to "filter"
				var _return = (!_include);
				if(_include){
					if(controller instanceof Controller){
						_return = _include;
					}
				} else {
					if(controller.constructor == Controller){
						_return = _include;
					}
				}
				if(_return){
					_instances.push(controller);
				}
			});
			return _instances;
		}
		
		function _register(instance){
			if(!instance instanceof _ns.Controller){ //TODO: Do we do this?  Or DuckType check? Or do anything at all?
				throw "I don't know how to be your manager!  You don't work for me!";
			}
			_controllers.push(instance);
			return instance;
		}
		
		function _destroyById(idee){
			for(var i=0, len=_controllers.length; i<len; i++){
				if(_controllers[i].idee() == idee) {
					_controllers.splice(i,1);
					i--;
				}
			}
			//TODO: More detailed scrubbing for references to controllers and removal thereof will be needed to really delete the controller and allow for garbage collection
		}

		_this.register = function ( controller ){
			if(_findById(controller.idee())){
				// return false; // Let's do nothing... who cares if you try to register twice?
				return controller;
			} else {
				return _register ( controller );
			}
			//return _this;
		};

		_this.get = function ( idee ) {
			return _findById(idee);
		};
		
		_this.getAll = function () {
			return _controllers.slice(); //copy of controllers returned (members may still be manipulated, but our private storage won't be hurt
		};
		
		_this.getAllVisible = function(){
			var _returnArray = [];
			_controllers.forEach(function(controller){//TODO: convert to "filter"
				if(controller.isVisible()){
					_returnArray.push(controller);
				}
			});
			return _returnArray;
		};
	
		_this.create = function(Controller){
			if(!Controller instanceof _ns.Controller){
				throw "I don't know how to create something I can't manage!"; //TODO: Do we do it this way?  Or Duck Typing?
			}
			return _register(new Controller());
		};
		
		_this.show = function(idee){
			var _controller = _findById(idee);
			if(!_controller){
				throw "How can I show that which does not exist?"; //TODO: Should this fail silently instead?
			}
			_controller.show();
		};
		
		/**
		 * 
		 */
		_this.showAll = function(){
		  _controllers.forEach(function(controller){
		  	controller.show();
		  });
		  return _this;
		};
		
		_this.hide = function(idee){
			var _controller = _findById(idee);
			if(!_controller){
				throw "How can I hide something that is not even there?"; //TODO: Should this fail silently instead?
			}
			_controller.hide();
		};
		
		_this.hideAll = function(){
		  _controllers.forEach(function(controller){
		  	controller.hide();
		  });
		  return _this;
		};
		
		_this.hideAllByClass = function(Controller, isFamily){
			var _instances = _findByClass(Controller, isFamily);
			_instances.each(function(controller){
				controller.hide();
			});
			return _this;
		};
		
		_this.hideAllExceptTheseIds = function(ids){
			var _ids = (typeof(ids)!== "undefined") ?  ids : [];
			_controllers.forEach(function(controller){
				if(_ids.indexOf(controller.idee())==-1){
					controller.hide();
				}
			});
		};
		
		_this.hideAllExceptTheseClasses = function(Controllers, isFamily){
			var _excludeFindings = true
				, _instances = _findByClass(Controller, isFamily, _excludeFindings)
			;
			_instances.forEach(function(controller){
				controller.hide();
			});
			
			return _this;
		};
		
		_this.destroy = function(idee){
			_destroyById(uniqueId);
		};
		
		//TODO: destroy by class?
		
		return _this;
	}
	
	return Manager;	
})();

