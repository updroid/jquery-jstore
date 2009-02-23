/**
 * jStore HTML5 Specification Storage Engine
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * 
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
(function($){
	
	// Set up a static test function for this instance
	var avilability = $.jStore.Availability.html5 = function(){
		return !!window.openDatabase
	}
	
	this.jStoreHtml5 = StorageEngine.extend({
		init: function(project, name){			
			// Call the parental init object
			this._super(project, name);
			
			// The type of storage engine
			this.type = 'HTML5';
			
			// Set the Database limit
			this.limit = 1024 * 200;
		},
		connect: function(){
			// Create our database connection
			var db = this.db = openDatabase('jstore-' + this.project, '1.0', this.project, this.limit);
			if (!db) throw 'JSTORE_ENGINE_HTML5_NODB';
			db.transaction(function(db){
				db.executeSql( 'CREATE TABLE IF NOT EXISTS jstore (k TEXT UNIQUE NOT NULL PRIMARY KEY, v TEXT NOT NULL)' );
			});
			
			// Cache the data from the table
			this.updateCache();
		},
		updateCache: function(){
			var self = this;
			// Read the database into our cache object
			this.db.transaction(function(db){
				db.executeSql( 'SELECT k,v FROM jstore', [], function(db, result){
					rows = result.rows;
					for (var i = 0; i < rows.length; ++i){
						var row = rows.item(i);
						self.data[row.k] = row.v;
					}
					
					// Fire our delegate to indicate we're ready for data transactions
					self.delegate.triggerHandler('engine-ready', [self]);
				});
			});
		},
		isAvailable: avilability,
		set: function(key, value){
			// Update the database
			this.db.transaction(function(db){
				db.executeSql( 'INSERT OR REPLACE INTO jstore(k, v) VALUES (?, ?)', [key,value]);
			});
			return this._super(key, value);
		},
		rem: function(key){
			// Update the database
			this.db.transaction(function(db){
				db.executeSql( 'DELETE FROM jstore WHERE k = ?', [key] )
			})
			return this._super(key);
		}
	})

	$.jStore.Engines.html5 = jStoreHtml5;

})(jQuery);
