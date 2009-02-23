/**
 * jStore Flash Storage Engine
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * 
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 *
 * Flash file compliments of http://www.nuff-respec.com/
 */
(function($){
	
	// Set up a static test function for this instance
	var avilability = $.jStore.Availability.flash = function(){
		return !!(window.swfobject && swfobject.hasFlashPlayerVersion('8.0.0'));
	}
	
	this.jStoreFlash = StorageEngine.extend({
		init: function(project, name){			
			// Call the parental init object
			this._super(project, name);
			
			// The type of storage engine
			this.type = 'Flash';
			
			// Add required third-party scripts
			this.includes.push('http://ajax.googleapis.com/ajax/libs/swfobject/2.1/swfobject.js');
			
			// Allow Autoloading on fail
			this.autoload = true;
			
			// Bind our flashReady function to the jStore Delegate
			var self = this;
			$.jStore.flashReady(function(){ self.flashReady() });
		},
		connect: function(){
			var name = 'jstore-flash-' + this.project;
			
			// Create our dummy replaceable element for swf embed
			$('<div></div>').css('display', 'none').attr('id', name).appendTo(document.body);
			
			// Use the SWFEmbed to append the object.
			swfobject.embedSWF($.jStore.defaults.flash, name, 1, 1, '8.0.0');
		},
		flashReady: function(e){
			// Store the flash object as our database object
			this.db = $('#jstore-flash-' + this.project)[0];
			
			// Fire our delegate to indicate we're ready for data transactions
			this.delegate.triggerHandler('engine-ready', [this]);
		},
		isAvailable: avilability,
		get: function(key){
			var out = this.db.f_get_cookie(key);
			return out == 'null' ? null : out;
		},
		set: function(key, value){
			this.db.f_set_cookie(key, value);
			return value;
		},
		rem: function(key){
			var beforeDelete = this.get(key);
			this.flash_cookie.f_delete_cookie(key);
			return beforeDelete;
		}
	})

	$.jStore.Engines.flash = jStoreFlash;

})(jQuery);

// Callback fired when ExternalInterface is established
function flash_ready(){
	$.jStore.delegate.triggerHandler('flash-ready');
}

