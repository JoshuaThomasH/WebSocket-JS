/**
 * @license
 * Copyright � 2015 Intuilab
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial ServerPortions of the Software.
 *
 * The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability,
 * whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.
 *
 * Except as contained in this notice, the name of Intuilab shall not be used in advertising or otherwise to promote the sale,
 * use or other dealings in this Software without prior written authorization from Intuilab.
 */
/**
 * Created by Seb Meunier on 16/07/2015.
 */

/**
 * Inheritance on EventEmitter base class
 * @type {EventEmitter}
 */
WebSocketJS.prototype = new EventEmitter();        // Here's where the inheritance occurs
WebSocketJS.prototype.constructor = WebSocketJS;

/**
 * @constructor
 */
function WebSocketJS() {

    //Properties of the WebSocket
    this.ServerHost = "127.0.0.1";
	this.ServerPort = 2975;
    //this.ServerHost = "echo.websocket.org";
    //this.ServerPort = 80;
    this.ServiceName = "echo";

    var _ActivateLogs = false;

    Object.defineProperty(this, 'ActivateLogs',{
        enumerable: true,
		get: function(){ return _ActivateLogs; },
        set: function(value){
            if(_ActivateLogs != value){
                _ActivateLogs = value;                
                this.emit('ActivateLogsChanged');
            }
        }
    });	

    //IA Properties
    this.LogText = "";
    

    var self = this;

    // on PLW [windows] websocket doesn't exist
    // make sure to run this check
    //
    //
    if (typeof WebSocket !== 'undefined') {

        var wsUri = "ws://" + this.ServerHost + ":" + this.ServerPort;

        this.refWS = new WebSocket(wsUri);
        this.refWS.onopen = function (event) {
            //TODO
            console.log("ON OPEN");
        }
        
        var self = this;
        this.refWS.onmessage = function (event) {
            console.log("MESSAGE: " + event.data);
            
            //Raise trigger with message
            self.emit('MessageReceived',[event.data]);

			if (self.ActivateLogs){
				self.LogText = event.data;
				self.emit('LogTextChanged', [this.ServerHostLogText]);
			}

        }

        this.refWS.onerror = function (event) {
            console.log("ERROR: " + event.data);
        }
    }
};


WebSocketJS.prototype.setServerHost= function (ServerHost) {
    if (this.ServerHost != ServerHost) {
        this.ServerHost = ServerHost;
        this.emit('ServerHostChanged', [this.ServerHost]);
    }
};

WebSocketJS.prototype.setServerPort= function (ServerPort) {
    if (this.ServerPort != ServerPort) {
        this.ServerPort = ServerPort;
        this.emit('ServerPortChanged', [this.ServerPort]);
    }
};


WebSocketJS.prototype.StartListening = function () {
    //no need to call connect here?
    console.log("Start Listening");

}

WebSocketJS.prototype.StopListening = function ()
{
    //this.refWS.close();
    console.log("Stop Listening");
}

WebSocketJS.prototype.SendMessage = function (message)
{
    this.refWS.send(message);
    console.log("Message sent: " + message);
}
