/*!
 * jStore Cookie Storage Engine
 * Copyright (c) 2010 Colin Carter (colin_carter@fmail.co.uk)
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 *
 * jQuery Cookie Plugin
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @Todo: Need to work out how many cookies per domain can be saved (not sure if that's possible)
 *
 */
(function($) {

  if (!jQuery.cookie) {

    /**
      * Cookie plugin
      *
      * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
      * Dual licensed under the MIT and GPL licenses:
      * http://www.opensource.org/licenses/mit-license.php
      * http://www.gnu.org/licenses/gpl.html
      *
      */
    jQuery.cookie = function(name, value, options) {
      if (typeof value != 'undefined') { // name and value given, set cookie
          options = options || {};
          if (value === null) {
              value = '';
              options.expires = -1;
          }
          var expires = '';
          if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
              var date;
              if (typeof options.expires == 'number') {
                  date = new Date();
                  date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
              } else {
                  date = options.expires;
              }
              expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
          }
          // CAUTION: Needed to parenthesize options.path and options.domain
          // in the following expressions, otherwise they evaluate to undefined
          // in the packed version for some reason...
          var path = options.path ? '; path=' + (options.path) : '';
          var domain = options.domain ? '; domain=' + (options.domain) : '';
          var secure = options.secure ? '; secure' : '';
          document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
      } else { // only name given, get cookie
          var cookieValue = null;
          if (document.cookie && document.cookie != '') {
              var cookies = document.cookie.split(';');
              for (var i = 0; i < cookies.length; i++) {
                  var cookie = jQuery.trim(cookies[i]);
                  // Does this cookie string begin with the name we want?
                  if (cookie.substring(0, name.length + 1) == (name + '=')) {
                      cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                      break;
                  }
              }
          }
          return cookieValue;
      }
    };

  }

  var avilability = $.jStore.Availability.cookie = function(){
		return !!(navigator.cookieEnabled);
	};


  this.jStoreCookie = StorageEngine.extend({
    init: function(project, name) {
      this._super(project, name);

      this.type = 'Cookie';

      // maximum number of cookies to save
      this.limit = 20;
    },

    connect: function() {
      this.db = this._cookieHandler;
      this.delegate.trigger('engine-ready');
    },

    get: function(key) {
      this.interruptAccess();
      return this.db.get(key);
    },
    set: function(key, value) {
      this.interruptAccess();
      this.db.set(key, value);
    },
    rem: function(key) {
      this.interruptAccess();
      this.db.rem(key);
    },
    isAvailable: avilability,

    _cookieHandler: function() {

      var cookieName = 'localStorage-',

          // default expires in days or a date object
          defaultExpires = 365*3,

          // Some cookie defaults
          defaultPath =  '/',
          defaultSecure = false,
          defaultDomain = '',

          // Each cookie has a maximum size (4K)
          // maxLength is set to a little below that to allow for
          // extra cookie information such as expires, path, domain, name, etc
          // If the length exceeds this, another cookie will be created
          maxLength = 4000,

          // Cookies will be stored as:
          // localStorage-n=name1:value1&name2:value2; expires=...
          nameValDelim = ':',
          itemDelim = '&',

          // Place to hold our local store which will reflect
          // the stored cookies
          store = {},

          // Shortcut to the jStore defaults store
          defaults = $.jStore.defaults;

      //
      // Reset (delete) the cookies so we can start with a clean slate
      //
      function resetCookies() {
        var str, n = 0, path = defaults.path || path;
        while ($.cookie(cookieName+n)) {
          $.cookie(cookieName+n, null, {path: path});
          n++;
        }
      }

      //
      // Save what's currently in store to the cookie
      // ensuring we don't exceed the maximum cookie size
      //
      function save() {
        var prop, str, nvp = {}, n = 0, len = 0,
            expires = defaults.expires || defaultExpires,
            path = defaults.path || defaultPath,
            secure = defaults.secure || defaultSecure,
            domain = defaults.domain || defaultDomain;

        // Don't save if there's nothing in our store
        if (store.length === 0) {
          return;
        }

        // Reset our cookies to a known state (nothing)
        resetCookies();

        // Assume at least one cookie
        nvp[(cookieName+n)] = [];

        for (prop in store) {
          if (store.hasOwnProperty(prop)) {

            // If we exceed the maximum size of a cookie
            // reset everything and move to the next cookie name
            if (len >= maxLength) {
              n++;
              len = 0;
              nvp[(cookieName+n)] = [];
            }

            // Create our name/value pair
            str = prop + nameValDelim + store[prop];

            // Update current length + a little for the nameValue delimiter
            len += (str.length + itemDelim.length);

            nvp[(cookieName+n)].push(str);
          }
        }

        // Now do the actual saving of cookies
        for (prop in nvp) {
          if (nvp.hasOwnProperty(prop)) {
            $.cookie(prop, nvp[prop].join(itemDelim),
                    {expires: expires, path: path, secure: secure, domain: domain});
          }
        }
      }

      function getAllCookies() {
        var n = 0, a, str = '', i, len;

        // Get the cookie value for the cookie name
        while (str = $.cookie(cookieName+n)) {

          // Split up into name/value pairs
          a = str.split(itemDelim);

          // Split up into name & value
          for (i = 0, len = a.length; i < len; i++) {
            a[i] = a[i].split(nameValDelim);
          }

          // Create object key:value items in the store object
          for (i = 0, len = a.length; i < len; i++) {
            store[a[i][0]] = a[i][1];
          }

          // Next cookie name
          n++;
        }
      }

      // Populate our store when we start
      getAllCookies();

      return {
        get: function(key) {
          return store[key] ? store[key] : null;
        },
        set: function(key, value) {
          store[key] = value;
          save();
        },
        rem: function(key) {
          if (store[key]) {
            delete store[key];
            save();
          }
        }
      }
    }()
  });

  $.jStore.Engines.cookie = jStoreCookie;

  $.jStore.EngineOrder[ 5 ] = 'cookie';

})(jQuery);
