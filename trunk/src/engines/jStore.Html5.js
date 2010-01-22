/*!
 * jStore HTML5 Specification Storage Engine
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 */
(function($){
	
	// Set up a static test function for this instance
	var avilability = $.jStore.Availability.html5 = function(){
		if (!window.openDatabase)
        	return false;
        	
        // This function will create a valid database on all engines with HTML5
        // support which is unfortunate, but necessary for fixing a problem with
        // google chrome, which mistakenly thinks it can actually use HTML5
    	var db = openDatabase('jstore-accessibility-test', '1.0', "test", 10);
    	
    	return !!db;
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
					var rows = result.rows, i = 0, row;
					for (; i < rows.length; ++i){
						row = rows.item(i);
						self.data[row.k] = $.jStore.safeResurrect( row.v );
					}
					
					// Fire our delegate to indicate we're ready for data transactions
					self.delegate.trigger('engine-ready');
				});
			});
		},
		isAvailable: avilability,
		set: function(key, value){
			this.interruptAccess();
			// Update the database
			this.db.transaction(function(db){
				db.executeSql( 'INSERT OR REPLACE INTO jstore(k, v) VALUES (?, ?)', [key,$.jStore.safeStore(value)]);
			});
			return this._super(key, value);
		},
		rem: function(key){
			this.interruptAccess();
			// Update the database
			this.db.transaction(function(db){
				db.executeSql( 'DELETE FROM jstore WHERE k = ?', [key] )
			})
			return this._super(key);
		}
	})

	$.jStore.Engines.html5 = jStoreHtml5;

	// Store the ordering preference
	$.jStore.EngineOrder[ 0 ] = 'html5';

})(jQuery);
