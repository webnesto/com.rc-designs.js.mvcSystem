ns.uniqueNum = (function(){
	var _counter = 0
	;
	
	function uniqueNum() {
		return _counter++;
	}
	
	return uniqueNum;
})();