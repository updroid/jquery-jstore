/*!*
 * jStore IE Storage Engine
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 */
(function($){
	
	// Set up a static test function for this instance
	var avilability = $.jStore.Availability.ie = function(){
		return !!window.ActiveXObject;
	}
	
	this.jStoreIE = StorageEngine.extend({
		init: function(project, name){			
			// Call the parental init object
			this._super(project, name);
			
			// The type of storage engine
			this.type = 'IE';
			
			// Allow Autoloading on fail
			this.limit = 64 * 1024;
		},
		connect: function(){
			// Create a hidden div to store attributes in
			this.db = $('<div style="display:none;behavior:url(\'#default#userData\')" id="jstore-' + this.project + '"></div>')
						.appendTo(document.body).get(0);
			// Fire our delegate to indicate we're ready for data transactions
			this.delegate.triggerHandler('engine-ready', [this]);
		},
		isAvailable: avilability,
		get: function(key){
			this.db.load(this.project);
			return this.db.getAttribute(key);
		},
		set: function(key, value){
			this.db.setAttribute(key, value);
			this.db.save(this.project);
			return value;
		},
		rem: function(key){
			var beforeDelete = this.get(key);
			this.db.removeAttribute(key);
			this.db.save(this.project);
			return beforeDelete;
		}
	})

	$.jStore.Engines.ie = jStoreIE;
	
	// Store the ordering preference
	$.jStore.EngineOrder[ 4 ] = 'ie';

})(jQuery);