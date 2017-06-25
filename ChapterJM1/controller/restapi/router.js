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
var express = require('express'); //Load express lib
var router = express.Router(); //Create express router
var speech_to_text = require('./features/speech_to_text'); //Load S2T and T2S logic

module.exports = router;

//DEFINE ROUTES....

// speech-to-text endpoint - execute stt_token to get stt token
router.get('/api/speech-to-text/token*',speech_to_text.stt_token);

//text to speech endpoint - execute tts_synthesize to get tts token
router.get('/api/text-to-speech/synthesize*',speech_to_text.tts_synthesize);

//translate endpoint - execute translateIt to translate text
router.get('/api/translate*',speech_to_text.translate);
