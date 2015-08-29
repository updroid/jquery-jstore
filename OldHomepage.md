## Looking for Help Testing ##
Hey guys, I've recently implemented a few fixes for some longstanding issues that have crept up on the project while I was on a Flex/Actionscript hiatus from jQuery. My time has not yet fully returned, so I'm hesitant to bang out a new release of wholly untested code.

**If you have some free time and would like to test the next release candidate for jStore, please contact me, or check it out from the source and let me know**.

Also, if anyone would like to throw together some test cases to automate this process for future development, it would really help development releases in the future.

## Default Engine Project ##
At the request of some users, we're working on putting together a list of the default engines on different browsers. To capture this info, I've created a wiki page listing these engines here: DefaultEngines

This list is currently very incomplete, and could use more entries. If you have a browser that's not currently on the list, please consider visiting http://eric.garside.name/jstore.html and following the instructions there. Thanks for your help!

## Update Log ##
**1.2.0** - _New Milestone_
  * Embedded the jQuery-Json plugin into the jStore project to help create and evaluate non-simple entities so they can be stored effectively.
  * Added two new embedded methods into jStore which will check the type of object which the user is requesting to store or retrieve, and either converts it to/from JSON. These are wrappers around the jQuery-Json plugin.
  * Added a new exception, JSTORE\_ENGINE\_NOT\_READY, which will be triggered if a user attempts to access a storage engine data transaction method (get/set/remove) before that engine is ready.
  * Added some new alias functions to jQuery and jStore for accessing data. Users can now get data by calling jQuery.jStore.get and jQuery(obj).getStore, and set data by calling jQuery.jStore.set and jQuery(obj).setStore
  * Fixed an error with capitalization in the Getting Started page of the documentation.
  * Added a new site, in the attempts of collecting a page of default engines for the wiki. If you would like to help out by reporting the default storage engine on a browser, go to this site: http://eric.garside.name/jstore.html The wiki page detailing the defaults is linked on the side.
**1.1.0**
  * Fixed a number of problems with the jStore Flash engine. These fixes have completely changed the way the Flash engine works (now includes an HTML file which embeds the .swf through an iFrame). Please refer to the project documentation (link to the right) for more.
  * Revamped the delegates which jStore uses for event registration. The events are no longer orphaned DOM Nodes which ambiguously trigger callbacks. Rather, the delegate system has been entirely redone to be a more efficient, more targeted system. Please refer to the project documentation for more.
  * Completely remove support for non-standard html attributes to configure jStore. Users can use the "defaults" property to store their preferences for loading.
  * Fixed a typo in the Flash engine.
  * Users may now call jQuery.jStore.fail(function(){ engine = this; }); to register a callback to handle the case that an engine with third party includes (like Gears) fails to enable itself after the inclusion of it's third-party files. (This should clear up problems of uncaught ENGINE\_UNAVAILABLE errors from being thrown and not caught, even with the code inside of a try ... catch block). This callback replaces the JSTORE\_ENGINE\_ACTIVATION\_FAILURE error event, which is now deprecated.
  * Fixed problems with jStore not functioning as expected in some browsers (ie6/7, both Flash and IE-specific storage should now work).
  * The Quick-Start guide on the Documentation site is now a complete HTML page, and should work out of the box.
**1.0.3**
  * Fixed a bug with the jQuery interface which caused jStore to improperly generate JRI's which contained periods in the name (such as a domain name, e.g. "something.example.com")
**1.0.2**
  * Fixed a bug with the jQuery interface which never passed the "set" value to the engine.
**1.0.1** `[Unreleased Milestone]`
  * Fixed Flash Engine bug involving the naming convention of a setter.
**1.0.0**
  * Initial Release