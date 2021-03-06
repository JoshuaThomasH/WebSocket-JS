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

    this.FaceCount = 0;

    //this could also be an empty obj
    this.MainFace = new face();
    
    this.MinimumFaceSize = 100;

    //FPS Limiter
    this.DetectionUpdateFrequency = 100;

    this.IsMainFaceDetected = false;


    //this will mimic the collection
    this.FacesArray = [];
    this.Faces = this.FacesArray;
    //dict for dwell time
    //id: time, ...
    this.startTimeMap = {}

    //gettting rid of logs
    //var _ActivateLogs = false;

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
    //
    this.IsConnectedToFaceDetectionServer = false;
    this.ActivityLog = "";
    

    //var self = this;
    //try to add the interval here

    //this.timerInterval = setInterval(self.timerElapsed, this.DetectionUpdateFrequency);
    
    
    
    
    //console.log("this is the timer: " + this.timerInterval);

};


WebSocketJS.prototype.timerElapsed = function() {
    var self = this;
    console.log("timer!!!!!!!!!!!!!!!!!!!! " + self.MinimumFaceSize);
    //clearInterval(1);

}



WebSocketJS.prototype.setDetectionUpdateFrequency = function(freq) {

    if(this.DetectionUpdateFrequency != freq)
    {
        this.DetectionUpdateFrequency = parseInt(freq);
    }

}

//MinimumFaceSize setter
WebSocketJS.prototype.setMinimumFaceSize = function(minFaceSize) {
    
    if(this.MinimumFaceSize != minFaceSize) {
        
        this.MinimumFaceSize = parseInt(minFaceSize);

    }
}

//DetectionUpdateFrequency setter
WebSocketJS.prototype.setDetectionUpdateFrequency = function(updateFreq) {
    
    if(this.DetectionUpdateFrequency != updateFreq) {
        
        this.DetectionUpdateFrequency = parseInt(updateFreq);

    }
}

WebSocketJS.prototype.parseMessageData = function(message_in) {




    if(message_in != null && message_in != "")
    {   
        var maxHeadSize = 0;
        var mainFaceID = -1;
        
        var jsonMessage = JSON.parse(message_in);
        
        //this.FaceCount = parseInt(jsonMessage["Count"]);
        //this.emit('FaceCountChanged', [this.FaceCount]);

        //an array of faces
        //include faces?
        //console.log("faces length: " + jsonMessage["faces"].length + "\\n jsonmessage: " + jsonMessage);
        
        //should check if faces exist
        //parse all then deal with the array/main face distinction
        
        //this is re-created every loop
        var localFacesArray = [];


        for(var i = 0; i < jsonMessage["faces"].length; i++)
        {
            var faceJSON = jsonMessage["faces"][i];
           
            
            var j_id        = faceJSON.id;
            var j_gender    = faceJSON.gender;
            var j_age       = faceJSON.age;
            var j_age_range;
            if(j_age < 16){
                j_age_range = "child";
            }else if(j_age >= 16 && j_age < 30){
                j_age_range = "young adult";
            }else if(j_age >= 30 && j_age < 45){
                j_age_range = "middle-aged adult";
            }else{
                j_age_range = "old-aged adult";
            }
            var j_x         = faceJSON.location.x;
            var j_y         = faceJSON.location.y;
            var j_width     = faceJSON.location.width;
            var j_height    = faceJSON.location.height;

            j_x = j_x + j_width / 2;
            j_y = j_y + j_height / 2;

            var j_face_size = j_width * j_height * 100 * 100;
            var j_main_emotion = faceJSON.mainEmotion.emotion;
            var j_main_emotion_confidence = faceJSON.mainEmotion.confidence;

            var j_emotion_confidence = faceJSON.emotions;
            var j_head_pose = faceJSON.headpose;

            // console.log(
            //     "id: " + j_id + "\n" +
            //     "gender: " + j_gender + "\n" +
            //     "age: " + j_age + "\n" +
            //     "age range: " + j_age_range + "\n" +
            //     "face size: " + j_face_size + "\n" +
            //     "main emotion: " + j_main_emotion + "\n" +
            //     "emotion confidence: " + JSON.stringify(j_emotion_confidence)
            // );

            /**
             * Minimum face size: any face detected with a size below this minimum value 
             * will be discarded. Use this property to filter "small faces", meaning faces 
             * far from the camera, into the background. Face size is defined by width x height x 10000.
             * Default value is 100, corresponding to a face size of 0.1 x 0.1 (= 10% of the camera frame).
             */
            //this should be moved to the top of the loop
            //use default for now
            if(j_face_size < this.MinimumFaceSize) {
                continue;
            }
            
            //check for the largest head and assign local variables
            if(j_face_size > maxHeadSize)
            {
                maxHeadSize = j_face_size;
                mainFaceID = j_id;
            }

            var newFace = new face();
                newFace.Id = j_id;
                newFace.Gender = j_gender;
                newFace.Age = j_age;
                newFace.AgeRange = j_age_range;
                newFace.X = j_x;
                newFace.Y = j_y;
                newFace.Width = j_width;
                newFace.Height = j_height;
                //newFace.DwellTime
                newFace.FaceSize = j_face_size;
                newFace.MainEmotion = j_main_emotion;
                newFace.MainEmotionConfidence = j_main_emotion_confidence;
                newFace.EmotionConfidence = j_emotion_confidence;
                newFace.HeadPoseEstimation = j_head_pose;
            
            //add it to the local array of faces
            localFacesArray.push(newFace);

        }
        
        //compare the newly created (every loop) localFacesArray
        //with the globally available array of faces => this.FacesArray
        //-----------------------------------------------------------------

        localFacesArray = _.sortBy(localFacesArray, 'Id');
        

        var globalExceptLocal = _.difference(_.pluck(this.FacesArray, "Id"), _.pluck(localFacesArray, "Id"));
        var removedArray = _.filter(this.FacesArray, function(obj) {
            //return where statement
            return globalExceptLocal.indexOf(obj.Id) >= 0;
        });
        

        var localExceptGlobal = _.difference(_.pluck(localFacesArray, "Id"), _.pluck(this.FacesArray, "Id"));
        var addedArray =  _.filter(localFacesArray, function(obj) {
            return localExceptGlobal.indexOf(obj.Id) >= 0;
        });
        //-----------------------------------------------------------------

        /*  console.log(
                "removed arr: " + JSON.stringify(removedArray) + "\n" +
                "local arr: " + JSON.stringify(localFacesArray) + "\n" +
                "added arr: " + JSON.stringify(addedArray) 
            );  */


        //you're checking if the length is greater than 0
        //if 1 or more has been removed or added then fire
        //console.log("removed length: " + removedArray.length + "\nadded length: " + addedArray.length);

        if(removedArray.length > 0) {

            removedArray.forEach(element => {
                console.log("raise event===>>>face lost for: " + element.Id + " " + element.Gender);

                this.emit("FaceLost", [element.Id, element.Gender, element.Age, element.DwellTime]);
                //remove from the key/val startTimeMap

                

            });
        }

        if(addedArray.length > 0) {
            
            addedArray.forEach(element => {
                console.log("raise event===>>>face added for: " + element.Id + " " + element.Gender);

                this.emit("FaceDetected", [element.Id, element.Gender, element.Age]);
                //add to the key/val startTimeMap
                this.startTimeMap[element.Id] = Date.now();

            });
        }



        //make sure this is correct - then

        var newCount = localFacesArray.length;
        var oldCount = this.FacesArray.length;

        console.log("new count: " + newCount + " old count: " + oldCount);

        //raise count event changed
        //because I'm not yet adding the new to the global - this always fires
        if(newCount != oldCount) {
            //console.log("===>>>Face Count Has Changed<<<===");
            this.emit('FaceCountChanged', [newCount]);
        }
        //add new users
        if(newCount > oldCount) {

            for(var i = 0; i < newCount - oldCount; i++) {

                //add an element to the global list
                //it will be populated with the proper variables in another method

                this.FacesArray.push(localFacesArray[i]);

                console.log("===========>>> added user id:" + localFacesArray[i].Id);
                console.log("face arr: " + JSON.stringify(this.FacesArray));

                
            }//end for 
        }

        //remove
        else if(newCount < oldCount) {
            for(var i = newCount; i < oldCount; i++) {
                //remove element at provided index
                
                this.FacesArray.splice(i, 1);
                console.log("===========>>> removed user:" + i );
                console.log("face arr: " + JSON.stringify(this.FacesArray));

            }//end for
        }

        // copy the properties into the list updating the id and other parameters!!!
        var fEIndex = 0;
        localFacesArray.forEach(element => {

            //console.log("id, gender==>" + element.Id + ", " + element.Gender);
            this.FacesArray[fEIndex].Id             = element.Id;
            this.FacesArray[fEIndex].X              = element.X;
            this.FacesArray[fEIndex].Y              = element.Y;
            this.FacesArray[fEIndex].Width          = element.Width;
            this.FacesArray[fEIndex].Height         = element.Height;
            this.FacesArray[fEIndex].Gender         = element.Gender;
            this.FacesArray[fEIndex].Age            = element.Age;
            this.FacesArray[fEIndex].AgeRange       = element.AgeRange;

            console.log("::::dwell=========>" +  (Date.now() - this.startTimeMap[element.Id]) / 1000);
            this.FacesArray[fEIndex].DwellTime      = (Date.now() - this.startTimeMap[element.Id]) / 1000; //element.DwellTime;
            this.FacesArray[fEIndex].FaceSize       = element.FaceSize;
            this.FacesArray[fEIndex].MainEmotion    = element.MainEmotion;
            this.FacesArray[fEIndex].MainEmotionConfidence  = element.MainEmotionConfidence;
            this.FacesArray[fEIndex].EmotionConfidence      = element.EmotionConfidence;
            this.FacesArray[fEIndex].HeadPoseEstimation     = element.HeadPoseEstimation;



            fEIndex++;
        });

        this.FaceCount = this.FacesArray.length;
        this.emit('FaceCountChanged', [this.FaceCount]);

        //update 'main' face  
        if(this.FaceCount > 0)
        {
            //defaut or first - sort of
            var result = this.FacesArray.find(x => x.Id == mainFaceID);
            
            if(result == undefined) {
                //console.log("No Results For Main Face");
                //this if statement should never be entered
                //this.IsMainFaceDetected = false;
            }
            else{
                
                //console.log(JSON.stringify(result) + " @@@@@## you've somehow managed to get it right ##@@@@@@@@@");

                this.MainFace = result;
                //this.MainFace.DwellTime = Date.now(); //add the mapping to key/value
                //console.log("Main:::::" + JSON.stringify(this.MainFace));
                this.IsMainFaceDetected = true;
                this.emit('IsMainFaceDetectedChanged', [this.IsMainFaceDetected]);
                //need emit to update 
                this.emit('MainFaceChanged', [this.MainFace]);
            }

        }
        else {
            this.IsMainFaceDetected = false;
            this.emit('IsMainFaceDetectedChanged', [this.IsMainFaceDetected]);

            //update with blank
            this.MainFace = new face();
            this.emit('MainFaceChanged', [this.MainFace]);
        }



        //update array duplicate 
        this.emit('FacesChanged', [this.Faces]);



        console.log("from message method count: " + jsonMessage["Count"]);




    }//end if 
}//end parseMessageData function





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





WebSocketJS.prototype.ConnectToServer = function () {


    
    // on PLW [windows] websocket doesn't exist
    // make sure to run this check
    if (typeof WebSocket !== 'undefined') {

        var wsUri = "ws://" + this.ServerHost + ":" + this.ServerPort;

        this.refWS = new WebSocket(wsUri);
        
        var self = this;

        var listeningToWS = false;
        var timerInterval = setInterval(function(){
        
            console.log("inside interval: " + self.MinimumFaceSize)
            listeningToWS = true;
            //clearInterval(self.timerInterval);
    
        }, this.DetectionUpdateFrequency);

        

        this.refWS.onopen = function (event) {
            //TODO
            //console.log("ON OPEN");
            self.onWebSocketOpen(event);
        }
        
        
        this.refWS.onmessage = function(event) {
            //console.log("MESSAGE: " + event.data);
            
            //Raise trigger with message
            self.emit('MessageReceived',[event.data]);

            if(!listeningToWS)
            {
                console.log("we're not listening !!!!!!!  !!! !!! " + timerInterval)
                return;
            }
            
            listeningToWS = false;


            self.parseMessageData(event.data);
            
            //we need to parse the data and propagate the variables

            /*
			if (self.ActivateLogs) {
				self.LogText = event.data;
				self.emit('LogTextChanged', [this.ServerHostLogText]);
            }
            */

        }
        this.refWS.onclose = function(event) {
            console.log("ws built in close method fired");
            self.onWebSocketClose(event);

            clearInterval(timerInterval);

        }

        this.refWS.onerror = function(event) {
            //console.log("ERROR: " + event.data);
            //self.ActivityLog += "REMOVE VIEWER ERROR:" + event.data + "\n";
            self.onWebSocketError(event.data);
        }

    }//end if

}
WebSocketJS.prototype.DisconnectFromServer = function () {
    

    if(this.refWS == undefined)
    {
        this.ActivityLog += "Web socket not currently connected" + "\n";
        this.emit('ActivityLogChanged', [this.ActivityLog]);
        console.log("there is no web socket to close!!");

    }
    else if(this.refWS.OPEN == 1) {
        //close the connection if open
        this.refWS.close();
        //onWebSocketClose event will trigger
        //set to null
        this.refWS = null;
        //var self = this;
        console.log("it's closed!!");
    }
    else {

        console.log("how did you manage to read this message!!");
    }

}

WebSocketJS.prototype.onWebSocketError = function (messageIn) {

    this.ActivityLog += "REMOVE VIEWER ERROR:" + messageIn + "\n";
}
//mimic private methods
WebSocketJS.prototype.onWebSocketOpen = function(event) {

    this.IsConnectedToFaceDetectionServer = true;

    this.ActivityLog += "Web socket open on " + this.ServerHost + ":" + this.ServerPort + "\n";

    this.emit('ActivityLogChanged', [this.ActivityLog]);
    this.emit('IsConnectedToFaceDetectionServerChanged', [this.IsConnectedToFaceDetectionServer]);
}

WebSocketJS.prototype.onWebSocketClose = function(event) {

    this.IsConnectedToFaceDetectionServer = false;

    this.ActivityLog += "WebSocket Closed:" + event.wasClean + " code:" + event.code + " reason: " + event.reason  +  + "\n";
    this.emit('ActivityLogChanged', [this.ActivityLog]);
    this.emit('IsConnectedToFaceDetectionServerChanged', [this.IsConnectedToFaceDetectionServer]);

    //update with blank
    this.MainFace = new face();
    this.emit('MainFaceChanged', [this.MainFace]);

    //clear the array 



}



//---------------------------------------------------------
//will need to get rid of the methods below

WebSocketJS.prototype.StartListening = function () {
    //no need to call connect here?
    console.log("Start Listening");

}

WebSocketJS.prototype.StopListening = function () {

    //this.refWS.close();
    console.log("Stop Listening");
}

WebSocketJS.prototype.SendMessage = function (message) {

    this.refWS.send(message);
    console.log("Message sent: " + message);
}
