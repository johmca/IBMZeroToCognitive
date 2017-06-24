var express = require('express');
var router = express.Router(); //JM01 router is an instance of Express router object
var speech_to_text = require('./features/speech_to_text');

//JM01 export the router object which I think is now the token
module.exports = router;

// speech-to-text
//JM01 This code defines an HTTP REST endpoint for GET
//JM01 at api/speech-to-text/token*
//JM01 When the client hits this endpoint with a GET it executes
//JM01 speech_to_text.token method (exported from speech_to_text.js)
//jm01 to get a token allowing access to the Sp2Txt service
router.get('/api/speech-to-text/token*',speech_to_text.token);

//JM01 I think once the server job has the token thats it. It waits
//JM01 for a client to connect and then uses the token when interacting
//with the S2Txt service. I'm guessing the interaction is direct from the client
//to the Watson service using the token and does not use the server app as
// a proxy
