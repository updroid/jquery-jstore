/*!
 * jStore Delegate Framework
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 */
(function($){
	
	this.jStoreDelegate = Class.extend({
		init: function(parent){
			// The Object this delgate operates for
			this.parent = parent;
			// Container for callbacks to dispatch.
			// eventType => [ callback, callback, ... ]
			this.callbacks = {};
		},
		bind: function(event, callback){
			if ( !$.isFunction(callback) ) return this;
			if ( !this.callbacks[ event ] ) this.callbacks[ event ] = [];
			
			this.callbacks[ event ].push(callback);
			
			return this;
		},
		trigger: function(){
			var parent = this.parent,
				args = [].slice.call(arguments),
				event = args.shift(),
				handlers = this.callbacks[ event ];

			if ( !handlers ) return false;
			
			$.each(handlers, function(){ this.apply(parent, args) });
			return this;
		}
	});
	
})(jQuery);