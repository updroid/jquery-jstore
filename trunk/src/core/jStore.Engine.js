/**
 * jStore Cache Object
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * 
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
(function($){
	
	this.StorageEngine = Class.extend({
		init: function(project, name){
			// Configure the project name
			this.project = project;
			// The JRI name given by the manager
			this.jri = name;
			// Cache the data so we can work synchronously
			this.data = {};
			// The maximum limit of the storage engine
			this.limit = -1;
			// Third party script includes
			this.includes = [];
			// Create an event delegate for users to subscribe to event triggers
			this.delegate = $('<a></a>')
				.bind('engine-ready', function(e, self){
					self.isReady = true;
				})
				.bind('engine-included', function(e, self){
					self.hasIncluded = true;
				});
			// If enabled, the manager will check availability, then run include(), then check again
			this.autoload = false; // This should be changed by the engines, if they have required includes
			// When set, we're ready to transact data
			this.isReady = false;
			// When the includer is finished, it will set this to true
			this.hasIncluded = false;
		},
		// Performs all necessary script includes
		include: function(){
			var self = this,
				total = this.includes.length,
				count = 0;
				
			$.each(this.includes, function(){
				$.ajax({type: 'get', url: this, dataType: 'script', cache: true, 
					success: function(){
						count++;
						if (count == total)	self.delegate.triggerHandler('engine-included', [self]);
					}
				})
			});
		},
		// This should be overloaded with an actual functionality presence check
		isAvailable: function(){
			return false;
		},
		/** Event Subscription Shortcuts **/
		ready: function(callback){
			if (this.isReady) callback({}, this);
			else this.delegate.bind('engine-ready', callback);
			return this;
		},
		included: function(callback){
			if (this.hasIncluded) callback({}, this);
			else this.delegate.bind('engine-included', callback);
			return this;
		},
		/** Cache Data Access **/
		get: function(key){
			return this.data[key] || null;
		},
		set: function(key, value){
			this.data[key] = value;
			return value;
		},
		rem: function(key){
			var beforeDelete = this.data[key];
			this.data[key] = null;
			return beforeDelete;			
		}
	});
	
})(jQuery);
