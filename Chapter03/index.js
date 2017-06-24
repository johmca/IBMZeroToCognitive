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
 * Zero to Cognitive Chapter 3
 */
var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cfenv = require('cfenv');

var vcapServices = require('vcap_services');

var appEnv = cfenv.getAppEnv();

//JM01 app is an instance of express and we proceed to define properties of app
var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('appName', 'z2c-chapter03');
// disable the following line in Bluemix. App will start on port 6003 in Bluemix
app.set('port', process.env.PORT || 6003);
// enable the following line in Bluemix
// app.set('port', appEnv.port);

app.set('views', path.join(__dirname + '/HTML'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
//JM01 This line sets up app to serve up the static files HTML, CSS, .js from the /HTML folder
//JM01 so in this case index.html will be returned
app.use(express.static(__dirname + '/HTML'));

app.use(bodyParser.json());

// Define your own router file in controller folder, export the router, add it into the index.js.
// app.use('/', require("./controller/yourOwnRouter"));

//JM01 I think this specifies the .js file to run when an event is detected at
//JM01 the application's root endpoint.
//JM01 The technical way to say this is that router.js is being mounted at the app's root path
//JM01 so any requests to this will execute router.js
app.use('/', require("./controller/restapi/router"));

//JM01 Now create the server using the app object and inform the user
//Jm01 The server is listening on the defined port
//JM01 The server app has been set to serve up the contents of the HTML folder which means
//JM01 the index.html file.
//JM01 The server app has also been defined to run the code to obtain a token for the S2Txt
//JM01 service when a GET request is made to its /token endpoint
//JM01 The user then starts interacting with the web page via the client (browser)
//JM01 which runs various client side javascript functions staring with
//JM01 initPage (see z3c-speech.js).The button press logic first sends a GET request
//JM01 to the server app's /token endpoint and retrieves the token. It then
//JM01 sends the the streaming audio from the mic to Watson S2Txt alogn with the token
//JM01 It receives the text back and presents it int he text box.

http.createServer(app).listen(app.get('port'),
    function(req, res) {
        console.log(app.get('appName')+' is listening on port: ' + app.get('port'));
    });

function loadSelectedFile(req, res) {
    var uri = req.originalUrl;
    var filename = __dirname + "/HTML" + uri;
    fs.readFile(filename,
        function(err, data) {
            if (err) {
                res.writeHead(500);
                console.log('Error loading ' + filename + ' error: ' + err);
                return res.end('Error loading ' + filename);
            }
            res.setHeader('content-type', mime.lookup(filename));
            res.writeHead(200);
            res.end(data);
        });
}
