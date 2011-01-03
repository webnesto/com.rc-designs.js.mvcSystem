

Manager Lifecycle:
1. new() : create instance



Controller Lifecycle:

1. new() : create instance
	- if params.model 
	model(params.model) : initializes model

2. prepare() : ensures view object is initialized and controller has a reference to said view's domNode
	: recurses on children
	= best point in time to handle model data preparation previous to view instantiation
	
3. refresh() : calls refresh on view with stored model reference
	3.1 load() : executed during a successful refresh (before children recursed);
		= best used for setting up event listeners on domNode elements
	: recurses on children
	- if refresh called before prep, prep will be executed
	= best used for updating view when/if data has changed, but view is already visible (show will currently fail if already visible).  Note: currently will do nothing if view is not in need of washing

4. show() : sets view domNode to be visible by removing inline style display directive (thus, may be overriden by any applied css)
	- if show called before prep/refresh, both will be executed
	- if view() is in need of washing, refresh will be executed
	= if it's possible to setup controller such that no special handling for model or view required, show() may be the first call made to a controller (as prepare and refresh will be executed anyway);
	
	Notable methods:
	= node() - alias for view().node() (see below);
	
View Lifecycle:

1. new() : create instance
	Can only be defined at instantiation:
	- if params.container - set _container (defaults to document.body)
	- if params.tag = set _tag used for creation of node (see node());
	- if params.useContainer - set override on creation of node (see node());
	- if params.staticContent - set override on need for replacing contents of container with template evaluated with model data (when used in conjunction with useContainer, can default to use of existing html).
	- if params.name - name of instance is set
	Possible to define at instantiation or later:
	- if params.template - setTemplate()
	- if params.pattern - setPattern()
	
2. node() : on first call, creates node (unless overriden by _useContainer) for insertion of view HTML.
	2.1 node().select() - node is cast as a Sizzle object to allow for ".select()" calls to function as $('') would within the scope of the node.
	
3. refresh() : sets innerHTML of node to melding of passed model data plus template html, unless staticContent override set.
  = Can be used to force an HTML re-render of node, but as this bypasses the load method of the controller, it is not recommended to call this method directly

	Notable methods:
	= container() : getter for parentNode of node() (unless parentNode == node)
	= document() : when overriden, can be used to hold the document object for a different window (like an iframe), thus allowing scope references where necessary for the dom of the view nodes vs. the application
	

Model Lifecycle:

1. new() : create instance
	- if passed an object literal (or other Model instance) set(objectLiteral) called
	
2. set() : clears all current properties and then calls add() passing along argument object literal
	= When called will fire a "data changed" event (used by view to monitor laundry state)
	
3. add() : recurses passed object literal properties and creates appropriate model object as same attribute of self
	= Will overwrite any attributes currently set matching properties of passed object.
	
		Notable methods:
		= remove() : when passed a string or array of strings, will attempt to remove attributes off self by said name.  for example: model.remove("foo") will attempt to remove the foo property from model.
			NOTE: remove() returns the removed item - all Model attributes are either Models themselves, arrays of Models, or string modesl?? (TODO);
	
	
