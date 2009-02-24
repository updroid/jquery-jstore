/*!
 * jStore Flash Storage Engine
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * jStore.swf Copyright (c) 2008 Daniel Bulli (http://www.nuff-respec.com)
 */
(function($){
	
	// Set up a static test function for this instance
	var avilability = $.jStore.Availability.flash = function(){
		return !!(window.swfobject && jQuery.hasFlash('8.0.0'));
	}
	
	this.jStoreFlash = StorageEngine.extend({
		init: function(project, name){			
			// Call the parental init object
			this._super(project, name);
			
			// The type of storage engine
			this.type = 'Flash';
			
			// Bind our flashReady function to the jStore Delegate
			var self = this;
			$.jStore.flashReady(function(){ self.flashReady() });
		},
		connect: function(){
			var name = 'jstore-flash-' + this.project;
			
			// Create our dummy replaceable element for swf embed
			$('<div></div>')
				.css({position: 'absolute', left: -1e5})
				.attr('id', name)
				.appendTo(document.body)
				.flash({src: $.jStore.defaults.flash, width: 1, height: 1}, {version: '8.0.0'});
		},
		flashReady: function(e){
			// Store the flash object as our database object
			this.db = $('embed', '#jstore-flash-' + this.project)[0];
			
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

/*
 * Flash (http://jquery.lukelutman.com/plugins/flash)
 * Copyright (c) 2006 Luke Lutman (http://www.lukelutman.com)
 * 
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
(function(){var B;B=jQuery.fn.flash=function(G,F,D,I){var H=D||B.replace;F=B.copy(B.pluginOptions,F);if(!B.hasFlash(F.version)){if(F.expressInstall&&B.hasFlash(6,0,65)){var E={flashvars:{MMredirectURL:location,MMplayerType:"PlugIn",MMdoctitle:jQuery("title").text()}}}else{if(F.update){H=I||B.update}else{return this}}}G=B.copy(B.htmlOptions,E,G);return this.each(function(){H.call(this,B.copy(G))})};B.copy=function(){var F={},E={};for(var G=0;G<arguments.length;G++){var D=arguments[G];if(D==undefined){continue}jQuery.extend(F,D);if(D.flashvars==undefined){continue}jQuery.extend(E,D.flashvars)}F.flashvars=E;return F};jQuery.hasFlash=B.hasFlash=function(){if(/hasFlash\=true/.test(location)){return true}if(/hasFlash\=false/.test(location)){return false}var E=B.hasFlash.playerVersion().match(/\d+/g);var F=String([arguments[0],arguments[1],arguments[2]]).match(/\d+/g)||String(B.pluginOptions.version).match(/\d+/g);for(var D=0;D<3;D++){E[D]=parseInt(E[D]||0);F[D]=parseInt(F[D]||0);if(E[D]<F[D]){return false}if(E[D]>F[D]){return true}}return true};B.hasFlash.playerVersion=function(){try{try{var D=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");try{D.AllowScriptAccess="always"}catch(E){return"6,0,0"}}catch(E){}return new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version").replace(/\D+/g,",").match(/^,?(.+),?$/)[1]}catch(E){try{if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){return(navigator.plugins["Shockwave Flash 2.0"]||navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g,",").match(/^,?(.+),?$/)[1]}}catch(E){}}return"0,0,0"};B.htmlOptions={height:240,flashvars:{},pluginspage:"http://www.adobe.com/go/getflashplayer",src:"#",type:"application/x-shockwave-flash",width:320};B.pluginOptions={expressInstall:false,update:true,version:"6.0.65"};B.replace=function(D){this.innerHTML='<div class="alt">'+this.innerHTML+"</div>";jQuery(this).addClass("flash-replaced").prepend(B.transform(D))};B.update=function(E){var D=String(location).split("?");D.splice(1,0,"?hasFlash=true&");D=D.join("");var F='<p>This content requires the Flash Player. <a href="http://www.adobe.com/go/getflashplayer">Download Flash Player</a>. Already have Flash Player? <a href="'+D+'">Click here.</a></p>';this.innerHTML='<span class="alt">'+this.innerHTML+"</span>";jQuery(this).addClass("flash-update").prepend(F)};function A(){var E="";for(var D in this){if(typeof this[D]!="function"){E+=D+'="'+this[D]+'" '}}return E}function C(){var E="";for(var D in this){if(typeof this[D]!="function"){E+=D+"="+encodeURIComponent(this[D])+"&"}}return E.replace(/&$/,"")}B.transform=function(D){D.toString=A;if(D.flashvars){D.flashvars.toString=C}return"<embed "+String(D)+"/>"};if(window.attachEvent){window.attachEvent("onbeforeunload",function(){__flash_unloadHandler=function(){};__flash_savedUnloadHandler=function(){}})}})();
