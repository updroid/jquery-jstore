Security.allowDomain("*");
import flash.events.*;
import flash.external.*;
import flash.net.*;
import flash.system.*;
import flash.utils.*;

var _so:SharedObject;
var _storage:Object;

var methods:Object = {};

methods.jstore_get = this.getValueOf;
methods.jstore_get_all = this.getItems;
methods.jstore_set = this.setItem;
methods.jstore_remove = this.removeItem;
methods.jstore_remove_all = this.clear;
methods.jstore_last_mod_dt = this.getModificationDate;
methods.jstore_current_size = this.calculateCurrentSize;
addCallbacks(methods);
initializeSharedObject();

//set key to value
function setItem(key:String, value) : Boolean
{
    var action:String = null;
    var origValue:Object = null;
	
    if (this._storage.hasOwnProperty(key))
    {
        if (this._storage[key] == value)
        {
			//nothing to do return true!
            return true;
        }
        origValue = this.getValueOf(key);
        this._storage[key] = value;
        action = "update";
    }
    else
    {
        action = "add";
        this._storage[key] = value;
    }
	
    var result:* = this.save();
	
    if (!result)
    {
        switch(action)
        {
            case "update":
            {
                this._storage[key] = origValue;
                break;
            }
            case "add":
            {
                delete this._storage[key];
                break;
            }
            default:
            {
                break;
            }
        }
    }
	
    return result;
}// end function

//value of item at key
function getValueOf(key:String)
{
    if (this._storage.hasOwnProperty(key))
    {
        return this._storage[key];
    }
    return null;
}// end function

//get all of the items in the storage
function getItems() : Object
{
    return this._storage;
}// end function

//remove item at key
function removeItem(key:String) : Boolean
{
		if (!this._storage ||  this._storage[key] == undefined) {
		   //nothing to do just bail out
		   			 return true;
					 }
    var value:* = this._storage[key];
    delete this._storage[key];
    var result:* = this.save();
    return result;
}// end function

//clear entire storage by sending in blank object
function clear() : Boolean
{
    this._so.clear();
    this._storage = {};
    var methods:Object = {type:"save"};
    sendEvent(methods);
    return true;
}// end function

//size of all the data
function calculateCurrentSize() : uint
{
    var methods:* = this._so.size;
    return methods;
}// end function

function getModificationDate() : Date
{
    var methods:* = new Date(this._so.data.modificationDate);
    return methods;
}// end function

function initializeSharedObject() : void
{
    var tempBytes:ByteArray;
    var bytes:ByteArray;
    var localPath:String;
	
	//makes more sense to use the same one everywhere..
    //var browser:* = loaderInfo.parameters.browser || "other";
    
    var key:* = "jStore";
    this._so = SharedObject.getLocal(key, "/");
	
    this._so.addEventListener(NetStatusEvent.NET_STATUS, this.onNetStatus);
    if (!this._so.data.hasOwnProperty("storage"))
    {
        this._storage = {}
    }
    else if (this._so.data.storage is ByteArray)
    {
        tempBytes = this._so.data.storage as ByteArray;
        bytes = new ByteArray();
        tempBytes.readBytes(bytes, 0, tempBytes.length);
        try
        {
            bytes.uncompress();
        }
        catch (error:Error)
        {
            sendEvent({type:"error", message:error.message});
        }
        this._storage = bytes.readObject();
    }
    else
    {
        this._storage = this._so.data.storage;
    }

    sendEvent({type:"ready"});
    return;
}// end function

function save() : Boolean
{
		var result:String;
    this.setTime(new Date().getTime());
	
	//compress it!
    bytes = new ByteArray();
    bytes.writeObject(this._storage);
    bytes.compress();
    this._so.data.storage = bytes;

    try
    {
        result = this._so.flush();
    }
    catch (e:Error)
    {
    }
	
    if (result == SharedObjectFlushStatus.FLUSHED)
    {
		return true;
		}
		
		return false;
}// end function

function setTime(new_time:Number) : void
{
    this._so.data.modificationDate = new_time;
    return;
}// end function

function onNetStatus(event:NetStatusEvent) : void
{
    var evt:Object = null;
    if (event.info.level == "error")
    {
        evt = {type:"error", info:"NetStatus Error: " + event.info.code, message:"Storage capacity requested exceeds available amount."};

			//Not sending any right now
				  //sendEvent(evt);
    }
    else
    {
        evt = {type:"success"};
			//Not sending any right now
        //sendEvent(evt);
    }
    return;
}// end function


function addCallbacks(methods:Object) : void
{
    var method:String = null;
    if (ExternalInterface.available)
    {
        for (method in methods)
        {
            
            ExternalInterface.addCallback(method, methods[method]);
            //trace("Added callback for " + methods[method] + " named " + method);
        }
        //this.sendEvent({type:"swf_ready"});
    }
    return;
}// end function

function sendEvent(e:Object) : void
{
    if (ExternalInterface.available)
    {
		var type = "jstore_" + e.type;
			var msg = e.message;
        trace("Sending event " + type);
        ExternalInterface.call(type,msg);
    }
    return;
}// end function
