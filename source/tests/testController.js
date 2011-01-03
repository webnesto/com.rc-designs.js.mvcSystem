ns.testController = function (className, classDef){

	with (jasmine) {
  	
		describe(className + "Controller", function(){
  		var controller;
  		
  		beforeEach(function(){
  			this.addMatchers({
  				toBeInstanceOf: function(target){
  					return this.actual instanceof target;
  				},
  				wasConstructedBy: function(target){
  					return this.actual.constructor == target;
  				}
  			});
  			
  			controller = new classDef();
  		});
  		
  		it('should should be an instance of (at least) mvc.Controller and self', function(){
  			expect(controller).toBeInstanceOf(mvc.Controller);
  			expect(controller).toBeInstanceOf(classDef);
  		});
  		
  		it('should be constructed by self', function(){
  			expect(controller).wasConstructedBy(classDef);
  		});
		
			it('should have mixed in Evint', function(){
				//For now we'll just insure the methods are here... not that they're implemented correctly
				var _walksLikeAnEvint = true, _duckcalls = ["subscribe", "unsubscribe", "fire"];
				
				for (var i = 0, len = _duckcalls.length; i < len; i++) {
					var _duckcall = controller[_duckcalls[i]], _ducktype = typeof(_duckcall);
					
					if ((_ducktype === "undefined") || (_ducktype !== "function")) {
						_walksLikeAnEvint = false;
					}
				}
				expect(_walksLikeAnEvint).toBeTruthy();
			});
			
			it("shouldn't be prepped yet", function(){
				expect(controller.isPrepped()).toBeFalsy();
			});
			
			it("shouldn't be visible yet", function(){
				expect(controller.isVisible()).toBeFalsy();
			});
			
			it('should have idee based on number of instances of mvc.Controller', function(){
				var comparison = (Number(controller.idee().split(".")[2]) == (mvc.Controller.getInstances() - 1));
				expect(comparison).toBeTruthy();
			});
			
			it('should be preparable', function(){
				controller.prepare();
				expect(controller.isPrepped()).toBeTruthy();
			});
			
			it('should have a model', function(){
				expect(controller.model()).toBeInstanceOf(mvc.Model);
			});
			
			describe("prepared", function(){
				
				beforeEach(function(){
					controller.prepare();
				});
				
				it('should have a node', function(){
					var _nodeExists = (typeof(controller.node()) !== "undefined");
					expect(_nodeExists).toBeTruthy();
				});
				
				it('should be refreshable', function(){
					var _passed = true;
					try {
						controller.refresh();
					} 
					catch (err) {
						_passed = false;
					}
					expect(_passed).toBeTruthy();
				});
				
				it('should load', function(){
					spyOn(controller, "load");
					controller.refresh();
					expect(controller.load).toHaveBeenCalled();
				});
				
				it('should be showable', function(){
					controller.show();
					expect(controller.isVisible()).toBeTruthy();
				});
				
				it('should be hidable', function(){
					controller.show();
					controller.hide();
					expect(controller.isVisible()).toBeFalsy();
				});
				
				it('should be togglable', function(){
					var _toggled = true;
					controller.hide();
					controller.toggle();
					_toggled = (controller.isVisible()) ? _toggled : false;
					controller.show();
					controller.toggle();
					_toggled = (controller.isVisible()) ? false : _toggled;
					
					expect(_toggled).toBeTruthy();
				});
			
			});
			
		});
	
	}
};