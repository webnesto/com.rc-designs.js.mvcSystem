/*
 * You should (ideally) make ONE of these for a project - specifically configured for your AJAX library this example 
 * uses jQuery, and then extend for each dao as necessary
 */

ns.[replace]Dao = (function () {
	var _this = this
		, _ns = ns
		, _data = false
		, _transacting = false
	;
	
	//If properly configured these two values are all that should need to be modified on on each DAO
	_this.url = "someurl.action"; //Should be overwritten by the real action/url for data gather
	_this.args = {
			foo: "foo"
	}; //Could be overritten by a string for direct adding to query if necessary
	
	//This can (should) be overwritten by any extensions for any post request data processing necssary.
	_this.set = function(data) {
		_data = data;
	}
	
	//TODO: might want to have the capacity to force a fresh request (additional arg perhaps)
	_this.get = function (callBack) {
		if(_transacting) { return; }
		if(typeof(callBack) != "function") { return; }
		if(_data){ 
			callBack(_data);
			return;
		}
		_transacting = true;
		//TODO: This will need to be modified for your particular AJAX lib
		$.ajax({
			url: _this.url
		, data: _this.args
		, dataType: "json" //This may need to be modified if you're using a different data type
		, success: function(data){
				_transacting = false;
				try {
				_data = data;
					callBack(_data);
				} catch (err) {
					//for now calling back with no args - letting callback handle undefined data
					debug.debug(err);
					callBack();
				}
			}
		, error: function(reqStatus, textStatus, errorThrown){
			_transacting = false;
			//for now calling back with no args - letting callback handle undefined data
				debug.debug(reqStatus, textStatus, errorThrown);
				callBack();
			}
		});
	};
	
	return _this;
})();