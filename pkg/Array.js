
if(!Array.isArray){Array.isArray=function(a){var s=typeof a;if(s==="object"){if(s){if((typeof a.length==="number")&&(!(a.propertyIsEnumerable('length')))&&(typeof a.splice==="function")){return true;}}else{return false;}}
return false;};}
if(!Array.prototype.every){Array.prototype.every=function(fn,scope){switch(true){case(this===void 0||this===null):case(typeof fn!=="function"):throw new TypeError();break;}
for(var i=0,len=this.length;i<len;i++){if(i in this){if(!(fn.call(scope,this[i],i,this))){return false;}}}
return true;};}
if(!Array.prototype.filter){Array.prototype.filter=function(fn,scope){switch(true){case(this===void 0||this===null):case(typeof fn!=="function"):throw new TypeError();break;}
var _return=[];for(var i=0,len=this.length;i<len;i++){if(i in this){if(fn.call(scope,this[i],i,this)){_return.push(this[i]);}}}
return _return;};}
if(!Array.prototype.forEach){Array.prototype.forEach=function(fn,scope){switch(true){case(this===void 0||this===null):case(typeof fn!=="function"):throw new TypeError();break;}
for(var i=0,len=this.length;i<len;i++){if(i in this){fn.call(scope,this[i],i,this);}}};}
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(elt)
{var len=this.length;var from=Number(arguments[1])||0;from=(from<0)?Math.ceil(from):Math.floor(from);if(from<0)
from+=len;for(;from<len;from++)
{if(from in this&&this[from]===elt)
return from;}
return-1;};}
if(!Array.prototype.lastIndexOf){Array.prototype.lastIndexOf=function(elt)
{var len=this.length;var from=Number(arguments[1]);if(isNaN(from))
{from=len-1;}
else
{from=(from<0)?Math.ceil(from):Math.floor(from);if(from<0)
from+=len;else if(from>=len)
from=len-1;}
for(;from>-1;from--)
{if(from in this&&this[from]===elt)
return from;}
return-1;};}
if(!Array.prototype.map){Array.prototype.map=function(fn,scope){switch(true){case(this===void 0||this===null):case(typeof fn!=="function"):throw new TypeError();break;}
var _return=[];for(var i=0,len=this.length;i<len;i++){if(i in this){_return.push(fn.call(scope,this[i],i,this));}}
return _return;};}
if(!Array.prototype.some){Array.prototype.some=function(fn,scope){switch(true){case(this===void 0||this===null):case(typeof fn!=="function"):throw new TypeError();break;}
for(var i=0,len=this.length;i<len;i++){if(i in this){if((fn.call(scope,this[i],i,this))){return true;}}}
return false;};}