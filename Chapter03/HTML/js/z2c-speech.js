/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 /*
** z2c-speech.js
*/
//JM01 This stuff here is JQUERY. JQUERY appears to be a method by which javascript code
//JM01 can interact with the elements of the web page.
//JM01 Here we see the code adding and removing the classes mic_enabled and
//JM01 mic_disabled frm the mic and stop buttons. The css applies properties to
//JM01 these classes to grey out/ display normally
//JM01 We also define what to do when the microphone and stop buttons are pressed
//JM01 SO when we press the mic button we
//JM01 1. Grey mic button out by setting its class to mic_disabled
//JM01 2. Activate the stop button by setting its class to mic_enabled
//JM01 3. We fire a GET to the /token endpoint presneted by our server and we 
//JM01    WAIT (this is important) for a oken to be returned
//JM01 3. Call Watson Speech to Text's recogniseMicrophne function passing
//JM01    the token (obtained when the server started)
function initPage ()
{
  var _mic = $('#microphone'); var _stop = $("#stop");
    _mic.addClass("mic_enabled");
    _stop.addClass("mic_disabled");

  _mic.on("click", function ()
    {
      var _className = this.className;
      if(this.className == "mic_enabled")
      {
        _mic.addClass("mic_disabled");
        _mic.removeClass("mic_enabled");
        _stop.addClass("mic_enabled");
        _stop.removeClass("mic_disabled");
        $.when($.get('/api/speech-to-text/token')).done(
          function (token) {
            stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
               token: token,
               outputElement: '#speech' // CSS selector or DOM Element
             });
            stream.on('error', function(err) { console.log(err); });
          });
        }
      });

  _stop.on("click",  function() {
          console.log("Stopping text-to-speech service...");
          if (stream != undefined) {stream.stop(); }
          _mic.addClass("mic_enabled");
          _mic.removeClass("mic_disabled");
          _stop.addClass("mic_disabled");
          _stop.removeClass("mic_enabled");
        });
}
