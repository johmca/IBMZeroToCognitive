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
var extend = require('extend');
var watson = require('watson-developer-cloud');
var vcapServices = require('vcap_services');
var config = require('../../env.json');

//Get Speech to Text Token and return to client
exports.stt_token = function(req, res) {
    var sttConfig = extend(config.speech_to_text, vcapServices.getCredentials('speech_to_text'));

    var sttAuthService = watson.authorization(sttConfig);

    sttAuthService.getToken({
        url: sttConfig.url
    }, function(err, token) {
        if (err) {
            console.log('Error retrieving speech to text token: ', err);
            res.status(500).send('Error retrieving speech to text token');
            return;
        }
        res.send(token);
    });
}

//Get Text to Speech Token and return to client
exports.tts_synthesize = function(req, res) {
  console.log("Hey John, server is now running tts_synthesize for your T2S request");
  var sttConfig = extend(config.text_to_speech, vcapServices.getCredentials('text_to_speech'));

  var sttAuthService = watson.authorization(sttConfig);

  sttAuthService.getToken({
      url: sttConfig.url
  }, function(err, token) {
      if (err) {
          console.log('Error retrieving text to speech token: ', err);
          res.status(500).send('Error retrieving text to speech token');
          return;
      }
      res.send(token);
  });
}

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
