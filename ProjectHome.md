# Temporary Hosting for Docs #
Docs are currently available on http://twablet.com/docs.html?p=jstore for the time being.

# NEW RELEASE CANDIDATE FOR JSTORE 2.0 AVAILABLE #
So, I spent a little time today retooling jStore, removing some of the cruft that's crept into the project over time, and generally cleaning up the implementation of the entire system.

A new, drastically different version of jStore is up in the source repository for review. This is the 2.0 release candidate for jStore, and it changes up nearly every facet of jStore.

If you've used the library in the past, please check out the source, and take a look. Any comments about the implementation would be greatly appreciated! Thanks!

http://code.google.com/p/jquery-jstore/source/browse#svn/trunk

# 2.0 Important Changes #

A few major changes have been made to jStore with the 2.0 release. In terms of the code itself, it's been generally cleaned up, and given better more meaningful comments.

As for the functional changes, I'll highlight a couple of them here:

  * The delegate has been removed. jStore now has bind()/trigger() methods which mimic this functionality.
  * The project is now in a single file, in which all engines are defined. This is made possible because:
  * The StorageEngine class which all typed storage engines extend from has been cleaned up and tuned up. Additionally, the way in which the typed storage engines utilize the class has been streamlined, meaning each engine definition needs less code to function.
  * JSON has been made an integral part of the system, allowing for the persistence of everything from functions to arrays to objects to simple types like strings and numbers.
  * Session Storage has been removed from the specification, as it's not really persistent, and thus doesn't really belong within the scope of jStore's functionality.
  * Cookie Storage has been removed from the specification, for the same reason Session storage has. The cookie engine was inventive and novel, but it wasn't as reliable, and could pretty easily be corrupted by the end user by mistake.
  * Autoloading of 3rd party scripts has been removed. The only engine this should affect is google gears, which requires the user to have installed the gears plugin on their browser to activate it anyway. The gears engine is still available, but users must now explicitly include the gears\_init.js script google, and manually add the engine to the priority list.
  * Flash storage has been cleaned up a whooole bunch by a new project contributor, Jeff Lerman. The flash storage now auto-compresses your stored params, allow you to eek more storage space out while being transparent to the end user.
  * The entire initialization process of jStore has been cleaned up. You no longer need callbacks in callbacks in callbacks to use the plugin. jStore now has a direct engineReady() listener, which will activate whenever it's fully ready to transact data on whatever engine has been enabled.
  * jStore has been added to the window namespace, and still has a reference link in jQuery, allowing access through either window.jStore or window.jQuery.jStore.
  * jStore has better configuration provisions available, which run directly in line with the new init process.