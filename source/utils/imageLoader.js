ns.imageLoader = function (targetimage){
	var _thisImage = this
		, _pathParts = targetimage.src.split("#")
		, _imagepath = (_pathParts[1]) ? _pathParts[1] : targetimage.src
	;
	_thisImage.targetimage = targetimage;
	_thisImage.tmpImage = new Image();
	_thisImage.tmpImage.onload = function(){
		_thisImage.targetimage.src = _thisImage.tmpImage.src;
	};
	_thisImage.tmpImage.src = _imagepath;
	
	return _thisImage;
};