/*!
 *  Demo Initialization
 *
 *  Copyright (c) 2010 Knewton
 *  Dual licensed under:
 *      MIT: http://www.opensource.org/licenses/mit-license.php
 *      GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */

"use strict";

/*global jQuery, jStore */

/*jslint white: true, browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 50, indent: 4 */

(function ($, jStore) {

    var configs = 
    {
        flash: '../src/jStore.Flash.html', 
        json: '../src/browser.json.js'
    };
    
    jStore.init('sandbox', configs, jStore.flavors.flash).engineReady(function (engine)
    {
        if (!engine.get('test'))
        {
            engine.set('test', 'demo');
        }
        else
        {
            alert(engine.get('test'));
        }
    });
    
}(jQuery, jStore));
