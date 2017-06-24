Zero T Cognitive Lecture Series - Chapter 04
============================================

 

About
-----

In chapter 03 we created a web app in Node.js which started a server running.
When a browser client sends a GET request to the server a simple web page was
returned. The pages has a mic button, a stop button and a text box. When the mic
button is pressed a GET request is sent to the server app’s /token endpoint. The
server app interacts with Watson’s authorisation services, receives a token and
passes the token back to the client. The client then uses the token to interact
directly with Watson’s Speech to Text service and the words spoken to the
microphone appear in the text box on screen.

 

Chapter 04 extends this application by adding an input capable text box where
the user can write text and a button to send the text to Watson’s Text to Speech
service. The text is then spoken back to the user.

 

Additional Set Up
-----------------

1.  Set up an instance of Text to Speech in Bluemix

2.  Retrieve user and pwd from the service credentials and copy the credentials
    into the env.json file which now has an additional section for the new
    service

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
{    
"speech_to_text": {
        "version": "v1",
        "url": "https://stream.watsonplatform.net/speech-to-text/api",
        "password": "your watson speech to text password",
        "username": "your watson speech to text user name"
     },

    "text_to_speech": {
        "version": "v1",
        "url": "https://stream.watsonplatform.net/text-to-speech/api",
        "password": "your watson text to speech password",
        "username": "your watson text to speech user name"
    }
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1.  Update the env.json file with the T2S service credentials from Bluemix

2.  Add the name of the Text to Speech service instance to manifest.yml (don’t
    need to unless you are pushing the node app up to run on Bluemix and I’m not
    because it costs money to run)

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
applications:
- path: .
  memory: 128M
  instances: 1
  domain: mybluemix.net
  name: Z2C
  host: Z2C
  disk_quota: 1024M
  services:
    - Speech to Text-jm
    - Text to Speech-jm
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Install all modules defined in ..chapter04/package.json (you did this in
Chapter03 but its not global and those installs live under Chapter03 so do it
again for Chapter04)

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
npm install
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

Server Changes
--------------

The server functionality needs to be extended to also obtain a token for the
T**ext to Speech **service instance we are using.

 

To do this we made changes to the router.js file as follows...

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var express = require('express'); //Load express framework

var router = express.Router();    //Create express router

//Load S2T and T2S code
var speech_to_text = require('./features/speech_to_text'); 

module.exports = router; //export the router

//Define routes............

// speech-to-text
router.get('/api/speech-to- text/token*',speech_to_text.stt_token);

//text to speech
router.get('/api/text-to-speech/synthesize*',speech_to_text.tts_synthesize);
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

So previously this code told the server that when a **GET** was received at
/**api/speech-to-text/token** endpoint it was to execute method
**speech_to_text.stt_token() **(defined in **/features/speech_to_text.js)**.
This method obtained a token from Watson for the client to use for the S2T
service.

 

We have added another route now. This time if a **GET** is received at the
**/api/text-to-speech/synthesize\*** endpoint then the method **
speech_to_text.tts_synthesize() **is executed. This method obtains a token from
Watson for the client to use for the T2S service.

 

The **features/speech_to_text.js** file is  also extended as follows....note the
new exported **tts_synthesize** function.

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

exports.tts_synthesize = function(req, res) {
  
    console.log("Hey John, server is now running tts_synthesize for your T2S   request");

//get env variables for T2S from env
  var sttConfig = extend(config.text_to_speech, vcapServices.getCredentials('text_to_speech'));

  var sttAuthService = watson.authorization(sttConfig);

  sttAuthService.getToken({
      url: sttConfig.url          //url for token allocation comes from env
  }, function(err, token) {
      if (err) {
          console.log('Error retrieving text to speech token: ', err);
          res.status(500).send('Error retrieving text to speech token');
          return;
      }
      res.send(token); //Return the token tot he client
  });
}
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

Client Changes
--------------

 

### HTML Changes

The **index.html **file has changed to add a new input capable text box for the
user to enter some notes and a button to send the notes to Watson’s Text to
Speech service.

-   A new textArea widget has been added with **id=chat**

-   A new button **id=readText** has been added with caption = “Watson read
    this”

-   An audio control has been added **id=a_player**

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<div class="row"><div class="col-lg-12 col-md-12 col-sm-12">
                    <div class="audioParent">
                      <audio class="audio" id="a_player">
                      Your browser does not support the audio element.
                      </audio>
                    </div>
                </div></div><!-- row -->
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

### JavaScript Changes

From before we remember that the **z2c-speech.js** file holds the logic for the
web page including how the buttons behave and what happens when they are
clicked. In chapter 04 we add extra logic to process a click event on our new
readText button and we add another function for an audio control.

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  readText.on("click",  function() {
          console.log("Hey John. Now initiating text-to-speech service...",    $("#chat").val());

          //jm - get token for T2S from server and when done execute callback
          $.when($.get('/api/text-to-speech/synthesize')).done(
            (token) => {
              console.log('Hey John, I am back with your token ');
              var textString = $("#chat").val();
              var voice = 'en-US_AllisonVoice';
              audio = WatsonSpeech.TextToSpeech.synthesize({
                 text :textString, //Use text entered on screen
                 voice : voice, //Set Watson's voice
                 token: token   //Use token passed back from server app
               });
              //stream.on('error', function(err) { console.log(err); });
            });
          });
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

 

 

 

 

 

 

 

 

 

 

 

 
