/*!*
 * jStore - Persistent Client-Side Storage
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * 
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
(function($){
	
	// Setup the jStore namespace in jQuery for options storage
	$.jStore = {
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
			flash: 'jStore.swf'
		},
		// Boolean for ready state handling
		isReady: false,
		// Boolean for flash ready state handling
		isFlashReady: false,
		// An event delegate
		delegate: $('<a></a>')
			.bind('jStore-ready', function(e, engine){
				$.jStore.isReady = true;
				if ($.jStore.defaults.autoload)
					engine.connect();
			})
			.bind('flash-ready', function(){
				$.jStore.isFlashReady = true;
			})
	}
	
	// Enable ready callback for jStore
	$.jStore.ready = function(callback){
		if ($.jStore.isReady) callback({}, $.jStore.CurrentEngine);
		else $.jStore.delegate.bind('jStore-ready', callback);
	}
	
	// Enable ready callback for Flash
	$.jStore.flashReady = function(callback){
		if ($.jStore.isFlashReady) callback({}, $.jStore.CurrentEngine);
		else $.jStore.delegate.bind('flash-ready', callback);
	}
	
	// Enable and test an engine
	$.jStore.use = function(engine, project, identifier){
		project = project || $.jStore.defaults.project || location.hostname.replace(/\./, '-') || 'unknown';
		
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
			$.jStore.delegate.triggerHandler('jStore-ready', [e]);
		} else {
			if (!e.autoload)				// Not available
				throw 'JSTORE_ENGINE_UNAVILABLE';
			else { 							// The hard way
				e.included(function(){
					if (e.isAvailable()) { // Worked out
						$.jStore.Instances[name] = e;
						// If there is no current engine, use this one
						if (!$.jStore.CurrentEngine){
							$.jStore.CurrentEngine = e;
						} 
						$.jStore.delegate.triggerHandler('jStore-ready', [e]);
					}
					else throw 'JSTORE_ENGINE_ACTIVATION_FAILURE';
				}).include();
			}
		}
	}
	
	// Set the current storage engine
	$.jStore.setCurrentEngine = function(name){
		if (!$.jStore.Instances.length )				// If no instances exist, attempt to load one
			return $.jStore.FindEngine();
			
		if (!name && $.jStore.Instances.length >= 1) { // If no name is specified, use the first engine
			$.jStore.delegate.triggerHandler('jStore-ready', [$.jStore.Instances[0]]);
			return $.jStore.CurrentEngine = $.jStore.Instances[0];
		}
			
		if (name && $.jStore.Instances[name]) { // If a name is specified and exists, use it
			$.jStore.delegate.triggerHandler('jStore-ready', [$.jStore.Instances[name]]);
			return $.jStore.CurrentEngine = $.jStore.Instances[name];
		}
		
		throw 'JSTORE_JRI_NO_MATCH';
	}
	
	// Test all possible engines for straightforward useability
	$.jStore.FindEngine = function(){
		$.each($.jStore.EngineOrder, function(k){
			if ($.jStore.Availability[this]()){ // Find the first, easiest option and use it.
				$.jStore.use(this, $.jStore.defaults.project, 'default');
				return false;
			}
		})
	}
	
	// Provide a simple interface for storing/getting values
	$.store = function(key, value){
		if (!$.jStore.CurrentEngine) return false;
		
		if ( !value ) // Executing a get command
			return $.jStore.CurrentEngine.get(key);
		// Executing a set command
			return $.jStore.CurrentEngine.set(key, value);
	}
	// Provide a simple interface for storing/getting values
	$.remove = function(key){
		if (!$.jStore.CurrentEngine) return false;
		
		return $.jStore.CurrentEngine.rem(key);
	}
	
	// Provide a chainable interface for storing values/getting a value at the end of a chain
	$.fn.store = function(key, value){
		if (!$.jStore.CurrentEngine) return this;
		
		var result = $.store(key, value);
		
		return !value ? result : this;
	}
	
	// Provide a chainable interface for removing values
	$.fn.removeStore = function(key){
		$.remove(key);
		
		return this;
	}
	
	// Provide some useability for auto-setting and inline definition
	$(function(){
		if ($.jStore.defaults.engine)
			return $.jStore.use($.jStore.defaults.engine, $.jStore.defaults.project, 'default');

		var attrload = $('[engine]:first');
		
		if (attrload.length)
			return $.jStore.use(attrload.attr('engine'), attrload.attr('project'), attrload.attr('identifier'));
	
		// Attempt to find a valid engine, and catch any exceptions if we can't
		try {			
			$.jStore.FindEngine();
		} catch (e) {}
	})
	
})(jQuery);
