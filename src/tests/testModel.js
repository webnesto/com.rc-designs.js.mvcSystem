ns.testModel = function (className, classDef){
	with (jasmine) {
		describe(className + "Model", function(){
			var model;

			it('should allow you to store an string', function(){
				
				model = new classDef("I'm a string");
				
				expect(
					( model.get() === "I'm a string" )
				&&( typeof model.get() === "string")
				).toBeTruthy();
				
			});
			
			it('should allow you to store an array', function(){
				
				model = new classDef([
				  "I'm"
				,	"an"
				,	"array"
				]);
				
				expect(
					( model.get()[0] === "I'm" )
				&&( model.children()[1].get() === "an")
				&&( model.child(2).get() === "array")
				).toBeTruthy();
				
			});
			
			it('should allow you to store a boolean', function(){
				
				model = new classDef(false);
				var model2 = new classDef(true);
				
				expect(
					( !model.get() )
				&&( model2.get() )	
				&&( typeof(model.get()) == "boolean" )
				).toBeTruthy();
				
			});
			
			it('should allow you to store a number', function(){
				model = new classDef(2);
				var model2 = new classDef(0);
				
				expect(
					( (model.get() + 3) === 5)
				&&( (model2.get() + 6) === 6)
				&&( typeof(model.get()) == "number" )
				).toBeTruthy();
			});

			it('should allow you to store a function', function(){
				model = new classDef(function(){
					return "foo";
				});
				var model2 = new classDef(function(){
					return {};
				});
				
				expect(
					( (typeof model.get()) === "function" )
				&&( (model.get()()) === "foo" )
				).toBeTruthy();
			});

			it('should allow you to store a null', function(){
				model = new classDef(null);
				
				expect(
					( (typeof model.get()) === "object" )
				&&( (model.get()) == null )
				).toBeTruthy();
			});
			
			it('should allow you to store an object', function(){
			
				model = new classDef({
					foo: "foo"
				});
				
				expect(
					( model.get().foo == "foo" )
				&&( model.foo.get() == "foo" )
				).toBeTruthy();
			
			});
			
			it('should allow you to store complex object', function(){
			
				model = new classDef({
					foo: "foo"
				, bar: [
				    1,3,5,8,20
				  ]
				, oof: [
				    {
				    	num: 1
				    , val: "first"
				    }
				  , {
				  		num: 2
				  	, val: "second"
				  	}
				  ]
				});
				
				expect(
					( model.get().foo == "foo" )
				&&( model.foo.get() == "foo" )
				&&( model.bar.get()[2] == 5 )
				&&( model.oof.child(0).val.get() == "first" )
				&&( model.oof.child(1).get().val == "second" )
				&&( model.get().oof[1].val == "second" )
				&&( model.oof.children()[1].val.get() == "second" )
				
				).toBeTruthy();
			
			});
			
			it('should allow you to set the value', function(){
				model = new classDef();
				model.set({
					foo: "foo"
				, bar: {
						cow: "cow"
					, dog: "dog"
					}
				});
				model.set({
					bar: {
						cow: "woc"
					, dog: "god"
					}
				});
				
				
				expect(
					( !model.foo )
				&&( model.bar.cow.get() == "woc" )
				).toBeTruthy();
			
			});
			

			it('should allow you to add values', function(){
				model = new classDef();
				model.add("foo", "foo");
				model.add( "bar", {
					cow: "woc"
				, dog: "god"
				});
				
				
				
				expect(
					( model.foo )
				&&( model.bar.cow.get() == "woc" )
				).toBeTruthy();
			
			});
			
			it('should let this work!', function(){
				var model = new classDef();
				;
	
				model.set({
					gallery : 0 // Currently selected gallery id
				, image : "" // Currently selected image id
				,	page : "" // Current page name
				, breadcrumbs : [] // History within site //TODO: populate on page change?
				});
				
				expect(
					model
				).toBeTruthy();
			});
			
		});
		
	}
	
};