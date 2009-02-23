/**
 * jStore Google Gears Storage Engine
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * 
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
(function($){
	
	// Set up a static test function for this instance
	var avilability = $.jStore.Availability.gears = function(){
		return !!(window.google && window.google.gears)
	}
	
	this.jStoreGears = StorageEngine.extend({
		init: function(project, name){			
			// Call the parental init object
			this._super(project, name);
			
			// The type of storage engine
			this.type = 'Google Gears';
			
			// Add required third-party scripts
			this.includes.push('http://code.google.com/apis/gears/gears_init.js');
			
			// Allow Autoloading on fail
			this.autoload = true;
		},
		connect: function(){
			// Create our database connection
			var db = this.db = google.gears.factory.create('beta.database');
			db.open( 'jstore-' + this.project );
			db.execute( 'CREATE TABLE IF NOT EXISTS jstore (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)' );
			
			// Cache the data from the table
			this.updateCache();
		},
		updateCache: function(){
			// Read the database into our cache object
			var result = this.db.execute( 'SELECT k,v FROM jstore' );
			while (result.isValidRow()){
				this.data[result.field(0)] = result.field(1);
				result.next();
			} result.close();
			
			// Fire our delegate to indicate we're ready for data transactions
			this.delegate.triggerHandler('engine-ready', [this]);
		},
		isAvailable: avilability,
		set: function(key, value){
			// Update the database
			var db = this.db;
			db.execute( 'BEGIN' );
			db.execute( 'INSERT OR REPLACE INTO jstore(k, v) VALUES (?, ?)', [key,value] );
			db.execute( 'COMMIT' );
			return this._super(key, value);
		},
		rem: function(key){
			// Update the database
			var db = this.db;
			db.execute( 'BEGIN' );
			db.execute( 'DELETE FROM jstore WHERE k = ?', [key] );
			db.execute( 'COMMIT' );
			return this._super(key);
		}
	})

	$.jStore.Engines.gears = jStoreGears;

})(jQuery);
