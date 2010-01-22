/**
 * jStore-jQuery Interface
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 */
(function($){
	
		// Regex to test if a value is JSON
	var rxJson,
		// Regex to test if string is function
		rxFunc = /function \(/;
	
	try {
		rxJson = new RegExp('^("(\\\\.|[^"\\\\\\n\\r])*?"|[,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t])+?$')
	} catch (e) {
		rxJson = /^(true|false|null|\[.*\]|\{.*\}|".*"|\d+|\d+\.\d+)$/
	}
	
	// Setup the jStore namespace in jQuery for options storage
	$.jStore = {};
	
	// Seed the object
	$.extend($.jStore, {
		EngineOrder: [],
		// Engines should put their availability tests within jStore.Availability
		Availability: {},
		// Defined engines should enter themselves into the jStore.Engines
		Engines: {},
		// Instanciated engines should exist within jStore.Instances
		Instances: {},
		// The current engine to use for storage
		CurrentEngine: null,
		// Provide global settings for overwriting
		defaults: {
			project: null,
			engine: null,
			autoload: true,
			flash: 'jStore.Flash.html'
		},
		// Boolean for ready state handling
		isReady: false,
		// Boolean for flash ready state handling
		isFlashReady: false,
		// An event delegate
		delegate: new jStoreDelegate($.jStore)
			.bind('jStore-ready', function(engine){
				$.jStore.isReady = true;
				if ($.jStore.defaults.autoload) engine.connect();
			})
			.bind('flash-ready', function(){
				$.jStore.isFlashReady = true;
			}),
		// Enable ready callback for jStore
		ready: function(callback){
			if ($.jStore.isReady) callback.apply($.jStore, [$.jStore.CurrentEngine]);
			else $.jStore.delegate.bind('jStore-ready', callback);
		},
		// Enable failure callback registration for jStore
		fail: function(callback){
			$.jStore.delegate.bind('jStore-failure', callback);
		},
		// Enable ready callback for Flash
		flashReady: function(callback){
			if ($.jStore.isFlashReady) callback.apply($.jStore, [$.jStore.CurrentEngine]);
			else $.jStore.delegate.bind('flash-ready', callback);
		},
		// Enable and test an engine
		use: function(engine, project, identifier){
			project = project || $.jStore.defaults.project || location.hostname.replace(/\./g, '-') || 'unknown';
		
			var e = $.jStore.Engines[engine.toLowerCase()] || null,
				name = (identifier ? identifier + '.' : '') + project + '.' + engine;
		
			if ( !e ) throw 'JSTORE_ENGINE_UNDEFINED';

			// Instanciate the engine
			e = new e(project, name);
		
			// Prevent against naming conflicts
			if ($.jStore.Instances[name]) throw 'JSTORE_JRI_CONFLICT';
		
			// Test the engine
			if (e.isAvailable()){
				$.jStore.Instances[name] = e;	// The Easy Way
				if (!$.jStore.CurrentEngine){
					$.jStore.CurrentEngine = e;
				}
				$.jStore.delegate.trigger('jStore-ready', e);
			} else {
				if (!e.autoload)				// Not available
					throw 'JSTORE_ENGINE_UNAVILABLE';
				else { 							// The hard way
					e.included(function(){
						if (this.isAvailable()) { // Worked out
							$.jStore.Instances[name] = this;
							// If there is no current engine, use this one
							if (!$.jStore.CurrentEngine){
								$.jStore.CurrentEngine = this;
							} 
							$.jStore.delegate.trigger('jStore-ready', this);
						}
						else $.jStore.delegate.trigger('jStore-failure', this);
					}).include();
				}
			}
		},
		// Set the current storage engine
		setCurrentEngine: function(name){
			if (!$.jStore.Instances.length )				// If no instances exist, attempt to load one
				return $.jStore.FindEngine();
			
			if (!name && $.jStore.Instances.length >= 1) { // If no name is specified, use the first engine
				$.jStore.delegate.trigger('jStore-ready', $.jStore.Instances[0]);
				return $.jStore.CurrentEngine = $.jStore.Instances[0];
			}
			
			if (name && $.jStore.Instances[name]) { // If a name is specified and exists, use it
				$.jStore.delegate.trigger('jStore-ready', $.jStore.Instances[name]);
				return $.jStore.CurrentEngine = $.jStore.Instances[name];
			}
		
			throw 'JSTORE_JRI_NO_MATCH';
		},
		// Test all possible engines for straightforward useability
		FindEngine: function(){
			$.each($.jStore.EngineOrder, function(k){
				if ($.jStore.Availability[this]()){ // Find the first, easiest option and use it.
					$.jStore.use(this, $.jStore.defaults.project, 'default');
					return false;
				}
			})
		},
		// Provide a way for users to call for auto-loading
		load: function(){
			if ($.jStore.defaults.engine)
				return $.jStore.use($.jStore.defaults.engine, $.jStore.defaults.project, 'default');
			
			// Attempt to find a valid engine, and catch any exceptions if we can't
			try {
				$.jStore.FindEngine();
			} catch (e) {}
		},
		// Parse a value as JSON before its stored.
		// Use the browser-implementation of JSON.stringify, suggested by Mark Gibson
		safeStore: function(value){
			switch (typeof value){
				case 'object': return JSON.stringify(value);
				case 'function': return value.toString();
				case 'number': case 'boolean': case 'string': case 'xml': return value;
				case 'undefined': default: return '';
			}
		},
		// Restores JSON'd values before returning
		// Use the browser-implementation of JSON.parse, suggested by Mark Gibson
		// Functions must be eval'd separately, as they aren't valid JSON.
		safeResurrect: function(value){
			return rxFunc.test(value) ? eval('(' + value + ')') 
			: (value != null && rxJson.test(value) ? JSON.parse(value) : value);
		},
		// Provide a simple interface for storing/getting values
		// Added null support. Thanks to Iansuda for the patch (http://code.google.com/u/iansuda/)
		store: function(key, value){
			if (!$.jStore.CurrentEngine) return false;

        	if ( typeof(value) == "undefined" ) { // Executing a get command
                return $.jStore.CurrentEngine.get(key);
        	} else if ( value === null ) {        //null argument explicitly passed, remove item
                return $.jStore.remove(key);
        	} else {                              // Executing a set command
                return $.jStore.CurrentEngine.set(key, value);
        	}
		},
		// Provide a simple interface for removing values
		remove: function(key){
			if (!$.jStore.CurrentEngine) return false;
		
			return $.jStore.CurrentEngine.rem(key);
		},
		// Alias access for reading
		get: function(key){
			return $.jStore.store(key);
		},
		// Alias access for setting
		set: function(key, value){
			return $.jStore.store(key, value);
		}
	})
	
	// Extend the jQuery funcitonal object
	$.extend($.fn, {
		// Provide a chainable interface for storing values/getting a value at the end of a chain
		store: function(key, value){
			if (!$.jStore.CurrentEngine) return this;
		
			var result = $.jStore.store(key, value);
		
			return !value ? result : this;
		},
		// Provide a chainable interface for removing values
		removeStore: function(key){
			$.jStore.remove(key);
		
			return this;
		},
		// Alias access for reading at the end of a chain.
		getStore: function(key){
			return $.jStore.store(key);
		},
		// Alias access for setting on a chanin.
		setStore: function(key, value){
			$.jStore.store(key, value);
			return this;
		}
	})
	
})(jQuery);
