Zero T Cognitive Lecture Series - Chapter JM1
=============================================

 

About
-----

This is an enhanced version of Chapter04 which adds language translation to the
webpage. The web page will now translate between the input language and the
selected output language.

 

If using the speech to text capability then the your spoken input will be output
as text in the selected output language.

 

If using the text to speech capability then the text you enter will be spoken
back to you in the selected output language.

 

Additional Set Up
-----------------

1.  Set up an instance of Language Translator Service in Bluemix

2.  Retrieve user and pwd from the service credentials and copy the credentials
    into the env.json file which now has an additional section for the new
    service

3.  Update the env.json file with the LT service credentials from Bluemix

4.  Add the name of the LT service instance to manifest.yml (don’t need to
    unless you are pushing the node app up to run on Bluemix and I’m not because
    it costs money to run)

5.  Install all modules defined in **package.json **

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
npm install
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

Server Changes
--------------

The server functionality needs to be extended to also obtain a token for the
T**ext to Speech** service instance we are using.

 

To do this we added a new route to the router.js file as follows...

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//translate endpoint - execute translateIt to translate text
router.get('/api/translate*',speech_to_text.translate);
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

So when a **GET** was received at /**api/translate** endpoint it executes method
**speech_to_text.translate()** (defined in **/features/speech_to_text.js)**.

 

The **features/speech_to_text.js** file is also extended as follows....note the
new exported **tts_synthesize** function.

 

translate() is executed when a GET is received at the /api/traslate endpoint.
The GET request contains the text to translate in a URL query parameter named
text. It calls the Language Translator service and returns the translated text
to the client via res.send().

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Translate text between languages and return translated text to client
exports.translate = function(req, res) {
  console.log("Hey John, server is now running translation...");
  //Strip the untranslated text out of the request object's url text query parm
  console.log("Text to translate =",req.query.text);

  //Perform translation
  var language_translator = watson.language_translator({
    username: '18f1dfbb-6ee2-4b75-b81d-14436349e5bd',
    password: 'tl4XPHV1emlY',
    url: 'https://gateway.watsonplatform.net/language-translator/api/',
    version: 'v2'
  });

  language_translator.translate({
      text: req.query.text,
      source: 'en',
      target: 'es'
    }, function(err, translation) {
      if (err)
        console.log("Error calling language translation service....",err)
      else
        console.log('Translated text =',translation.translations[0].translation);
        res.send(translation.translations[0].translation)
  });

}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Note - Because of a migration from Language Translation to Language Translator I
needed to specify the URL endpoint for the new Translator service (it defauled
to the older Translation service and my user/pwd failed authorisation as a
result).

 

Note - I need to finesse this a bit to pick up the user and pwd from the env
file

 

Client Changes
--------------

 

### JavaScript Changes

We enhanced z2c-speech.js to translate the input text before it is sent to text
to speech.

 

We nest the logic

1.  We issue GET to the /api/translate endpoint passing the input text as a
    query string on the URL called ?text

2.  Once we get a response back we get the token for t2s from Watson

3.  Once we get the token back we invoke t2s

 

 

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
readText.on("click",  function() {

          //jm - get token for T2S from server and when done execute callback
          untranslatedText = $("#chat").val();
          console.log(`Hey John. Now initiating text-to-speech service...${untranslatedText}`);
          $.when($.get(`/api/translate/p?text=${untranslatedText}`)).done((translatedText)=>{
            $.when($.get('/api/text-to-speech/synthesize')).done(
              (token) => {
                console.log('Hey Im back with your token ');
                //var textString = $("#chat").val();
                textString = translatedText;
                var voice = 'es-ES_EnriqueVoice';
                audio = WatsonSpeech.TextToSpeech.synthesize({
                   text :textString, //Use text entered on screen
                   voice : voice,
                   token: token   //Use token passed back from server app
                 });
                //stream.on('error', function(err) { console.log(err); });
              });
            });
        });  
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

 

 

 

 

 

 

 

 

 

 

 
