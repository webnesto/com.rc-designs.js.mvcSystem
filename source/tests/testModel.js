ns.testModel = function (className, classDef){
	with (jasmine) {
		describe(className + "Model", function(){
			var model;
			
			it('should allow you to initiate it with data', function(){
				model = new classDef({
					foo: "foo"
				});
				expect(
					( model.get().foo == "foo" )
				&&( model.foo.get() == "foo" )
				).toBeTruthy();
			});
		});
	}
};