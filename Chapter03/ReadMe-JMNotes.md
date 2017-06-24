JM Node Skeleton App
====================

 

About
-----

This document deconstructs the app provided by IBM in Chapter 3 of their Zero to
Cognitive education which builds a web site connected to Watson Speech to Text
service,

 

The app has been built using Node.js and it illustrates the “direct”
architecture for connecting with Watson services where the server app obtains a
token for the Watson service and the client interacts directly with the Watson
service using this token (as opposed to an architecture where the client
interacts with the server app and the server app interacts with the Watson
Services).

 

By thoroughly understanding how Node has been used to interact with Watson in
these examples I can re-use the principles and the code for my own apps.

 

Run the App Locally
-------------------

Navigate to the root folder of the app and execute command

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Node index.js
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

So for example if we are runnign the version of the app in Chapter03

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
cd C:\Users\John\Desktop\IBM\ZeroToCognitive\Chapter03
node index.js
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

The app should start and inform you which port it is listening on.

 

Open a browser and enter URL as

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
localHost:YourPort
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

The web page will be displayed with buttons to interact with Watson Speech to
Text.

 

Note - The client is a user on a browser. The server is our node.js app running
locally or on the Cloud.

 

App Overview
------------

 

The app does the following:

1.  Starts a server listening on a port (set via an environment variable) and
    defines

    -   REST API endpoints

    -   Logic to execute when GET request is received at endpoints

     

2.  Open a browser and navigate to the URL and port on which the server app is
    listening. This issues a GET request to the server app root endpoint. The
    server app responds by sending a web page consisting of the HTML, CSS and js
    files from the HTML folder to the browser client. The web page provides some
    basic function that interacts with a Watson Service. If running the app
    locally

    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    localHost:YourPort
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

3.  When the user interacts with Watson the client (browser) requests a token
    from the server app by issuing a GET request to the /token endpoint

4.  On receiving a GET request to the /token endpoint the server app executes
    the necessary logic to get the token required to access the Watson service
    and this is returned to the client

5.  The client then uses this token on its future interactions with the Watson
    service

 

Folder Structure
----------------

The following skeleton folder structure was created under the app’s root

 

-   JMNodeSkeletonApp (app root folder)

    -   HTML (Holds client side HTML, css and js files)

        -   CSS (Put css files here)

        -   js (Put client js files here)

    -   Controller (Holds js used by the server app)

        -   Features

 

Set Up
------

1.  Set up an instance of Speech to Text in Bluemix and copy its credentials
    into the local env.json file

 

App Initiation
--------------

The app will be stared using the index.js file using the command below

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Node index.js
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Index.js does the following:

1.  Loads various libraries for use later including such as Express (web server
    functionality), cookie handling capability, file system access and Bluemix
    VCAP_Services (to help us get credentials from the Bluemix environment)

2.  Creates an the app as an instance of express and sets various properties of
    the app object

3.  Creates an HTTP server using the app object.

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Load various libraries including express
var express = require('express'); //Web app framework
var http = require('http');
var path = require('path');
var fs = require('fs'); //For interaction with local file system
var mime = require('mime');
var bodyParser = require('body-parser');    //Convert JSON body text to object
var cookieParser = require('cookie-parser');

//cfenv is a library for retrieving variables from a local env file
var cfenv = require('cfenv'); 

//Bluemix provides functions to get environment variables fromt the Bluemix //environment known as VCAP_SERVICES
var vcapServices = require('vcap_services'); 
var appEnv = cfenv.getAppEnv();

//Create app as an instance of express and proceed to define properties of the //express app object
//Note 1. app.use method binds "middleware" functions to the app object
//     2. app.set method allows us to add our own variables to the app object

var app = express();

//Add cookie functionality to the app
app.use(cookieParser());

// Add some other functionality to app - not sure what exactly ?????????
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Now set some properties/ variables in the app object use app.set method
app.set('appName', 'z2c-chapter03');

//These lines are needed to use EJS as the templating engine. At run-time EJS 
//applies a template to the static files for presentation??? needs further research
//To do this we set some properties of app and set the template enjine as EJS 
//Others templating engines are available such as PUG, JADE, ANGULAR etc.
app.set('views', path.join(__dirname + '/HTML'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile); 

//Set the port according to the environment we are running in - Bluemix or local
//When running locally app will start on 6003. Disable the following line when //running in Bluemix. 
app.set('port', process.env.PORT || 6003); 

// When running in Bluemix enable the following line and disable the previous one
// app.set('port', appEnv.port);

//Bind express.static method to app. This method serves up the static files from 
//the folder specified - HTML in this case - when a client sends a request
app.use(express.static(__dirname + '/HTML'));

//Bind the 'router.js' file to the app's root path
//Routing is the process by which we specify the actions to carry out when a client
//sends a request to a defined endpoint.
//router.js (and it's children) define the endpoints/ HTTP verbs and actions
app.use('/', require("./controller/restapi/router"));

//Now create the server job using the app object and inform the user that is is //listening. Because of the asynchronous nature of Node it just starts the server
//and moves on to sending the message
http.createServer(app).listen(app.get('port'), 
    function(req, res) {
           console.log(app.get('appName')+' is listening on port: ' +    app.get('port'));
    });
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Not sure how this function is used, when it is used or why yet??
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
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Routing
-------

*Routing* refers to determining how an application responds to a client request
to a particular endpoint, which is a URI (or path) and a specific HTTP request
method (GET, POST, and so on).

 

We defined our routing info in our routing.js file which we have bound to the
express app in index.js above.

 

Simple example will execute the function to send “Hello World” when a GET
request is made to the root

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var express = require('express')
var app = express()

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

In our index.js we executed the following:

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.use('/', require("./controller/restapi/router"));
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Here the require function is executed upon a GET request to the root level

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
require("./controller/restapi/router")
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

The require function loads the router.js file into memory. router.js is shown
below.

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Load express, load the express router object and load the speech_to_text.js file
var express = require('express');
var router = express.Router(); 
var speech_to_text = require('./features/speech_to_text');

//Make the router object available to other files
module.exports = router;

// Define a route. This route has endpoint at /api/speech-to-text/token and verb 
// GET. If a request is received matching this route then speech_to_text.js is
// executed by the server app. This code goes and gets a token to use the Watson 
// speech to text service. The token is passed back in the response to the client.

// REMEMBER - the speech_to_text logic is not executed now. We are only setting it
// up at the moment. The speech_to_text logic is used to get a token and is only 
// executed when a GET request is received at /api/speech-to-text/token and it 
// passes back the token to the client in the response at that time (run time if
// you like)
router.get('/api/speech-to-text/token*',speech_to_text.token);
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

token is an exported function from the speech_to_text.js file hence
speech_to_text.token is referred to in the last line above.

 

This means that when a GET request is received from the client at
/api/speech-to-text/token the function **speech_to_text.token** is executed (and
a token is returned to the client from the service).

 

Server Execution
----------------

The server job is running an instance of Express and listening on our port now.
It has been set up to serve the static file(s) from the HTML folder in response
to a GET request from a client. It has also been set to get a token for
accessing the Watson Speech to Text service when it receives a GET request at
/api/speech-to-text/token from the client.

 

Lets take a look at the speech_to_text.token function which executes when the
request to get a token is received by the server (GET /api/speech-to-text/token
). In this architecture (direct as opposed to proxy) this is ALL the server app
does!

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Load "extend" which is an npm package that provides similar extend() function from //JQuery. This allows us to extend an object with another?
var extend = require('extend');

//Load Watson Developer Cloud SDK libraries
var watson = require('watson-developer-cloud');

//Load Bluemix vcap_services libs
var vcapServices = require('vcap_services');

//Load env.json file and call it config
var config = require('../../env.json');

//Make the token function available to other files to use and define request and 
//response parameters
exports.token = function(req, res) {
//Extend the config object (env.json) by adding credentials for S2T service
//I'm not sure what it adds exactly but it must add further JSON variables
var sttConfig = extend(config.speech_to_text, vcapServices.getCredentials('speech_to_text'));

//Create an instance of Watson authorization function using the json object //constructed above
var sttAuthService = watson.authorization(sttConfig);

//Call Watson Authorization module's getToken function to get token for S2Txt //service - we pass the url defined in the env.json file which is
//https://stream.watsonplatform.net/speech-to-text/api to the API
  sttAuthService.getToken({
      url: sttConfig.url
  }, function(err, token) {
      if (err) {
          console.log('Error retrieving token: ', err);
          res.status(500).send('Error retrieving token');
          return;
      }

//Send the token back in the response object to the client  
    res.send(token);
  });
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

The env.json file is a json object...we add stuff to it using
**vcapServices.getCredentials('speech_to_text')**

...not sure exactly what is added in

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
{
    "speech_to_text": {
        "version": "v1",
        "url": "https://stream.watsonplatform.net/speech-to-text/api",
        "username": "5c35baae-b59b-4eb2-895f-91e2ff489e4e",
        "password": "sbTkhuVqIdQS"
    }
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Note - the URL passed to Watson’s authorization API should not be the URL of the
API itself. Services are either “regular” or “streaming”. A regular service will
use the <https://gateway.watsonplatform.net/authorization/api> while a streaming
API will use <https://stream.watsonplatform.net/authorization/api>. If “stream”
features in the API of the service itself use the latter.

 

Note - I don’t understand why our env.json contains the actual S2T service API
endpoint and not the authorization service endpoint!!!

 

Anyway the important thing is that the token to access the Speech to Text
service is obtained from Watson and returned to the client. And that is ALL the
server app does!

 

Client Execution
----------------

The client is our browser. It makes HTTP requests to the server (our app)

-   Upon receiving a GET request to the root the server is set up to present the
    static HTML file present in the HTML folder and to

-   Upon receiving a GET request to api/speech-to-text/token the server will
    obtain a token to access Watson Speech to Text and will pass this back to
    the client in the response.

 

The HTML file served up by the server in this case is index.html.

 

index.html contains HTML code to present a page with a heading, a microphone
button, a stop button and a text box.

 

The main points of interest in index.html are discussed below.

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
</head><body class="tutorial" onLoad="initPage()">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This line

-   Assigns class=tutorial to the overall page. This is used in the accompanying
    css to set colours etc. for the page.

-   Specifies that the initPage function should be loaded when the page loads.
    This is a function defined in one of the js files

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    <script src="js/jquery-3.1.0.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/watson-speech.js"></script>
    <script src="js/z2c-speech.js"></script>
    <link href="CSS/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="CSS/bootstrap.css" rel="stylesheet" type="text/css">
    <link href="CSS/pageStyles.css" rel="stylesheet" type="text/css">
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

These lines at the end of the HTML tell us which javascript and css files to
load.

 

**z2c-speech.js contains the initPage function referenced on the onLoad event**

 

If I look at the initPage function in z2c-speech.js I see the following

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function initPage ()
{
 //Create the variables representing the mic button and the stop button 
  var _mic = $('#microphone'); 
  var _stop = $("#stop");
//Associate initial display classes with the buttons i.e. mic is already on and 
//can't be pressed so is greyed out while Stop is available to use
  _mic.addClass("mic_enabled");
  _stop.addClass("mic_disabled");

//Define the function that is executed when the mic button is clicked
  _mic.on("click", function ()
    {
      var _className = this.className;
      if(this.className == "mic_enabled")
      {
//Reset the display status of the mic and stop buttons by adding and removing //classes to those objects
        _mic.addClass("mic_disabled");
        _mic.removeClass("mic_enabled");
        _stop.addClass("mic_enabled");
        _stop.removeClass("mic_disabled");

//And here we go....drum role.....

//Send a GET request to the /api/speech-to-text/token endpoint.
//The server app will pick this up and request a token that allows acess to the
//S2T service and it will return this in the response object as "token".
//Note the use of the when with the.done parameter which makes sure that the //callback function only executes "when done" as we absolutely need the token 
//before accessing the service

//Create a stream object using some Watson method that seems to be provided in
//WatsonSpeech.js which requires the token and we specify an output element
//from out HTML pages as the location for the results i.e. our text box

//Note - The recogniseMicrophone function used here is contained in the //WatsonSpeech.js file. My research indicates that this a browser javascript SDK //for Watson Speech services as opposed the Node SDK I getting used to. I suppose //thats why it can output direct to an HTML object on the page. The NPM package is //available here =>>>> //https://www.npmjs.com/package/watson-speech and can be 
//installed using npm install --save watson-speech although in this case he seems
//to have just included the WatsonSpeech.js file in with the source code on GitHub 
//so I didn't actually install a node package

//It contains functions for both Speech to Text and Text to Speech services.

//Documentation of the API methods is available here ==>
//https://www.npmjs.com/package/watson-speech

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

//If we click Stop then issue message, execute the stream object's stop
//emthod and toggle button availablity stuff
  _stop.on("click",  function() {
          console.log("Stopping text-to-speech service...");
          if (stream != undefined) {stream.stop(); }
          _mic.addClass("mic_enabled");
          _mic.removeClass("mic_disabled");
          _stop.addClass("mic_disabled");
          _stop.removeClass("mic_enabled");
        });
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

This script uses JQUERY.

 

JQUERY provides a means for js to interact with the elements of an HTML web
page.

 

Note - the project comes with various .js fles called JQUERY something or other
and its unclear to me if these are needed to allow JQuery to work and if so why
not use a Node package? One for later.

 

It creates an object corresponding to the mic button and stop buttons. It adds a
class to each button which is rendered as greyed out or not greyed out by the
css. It then makes two functions ready to run in response to user events. These
are a click on the mic button or a click on the stop button.

 

The click event on the mic button does the following

-   Adds and removes classes on the mic and stop buttons to disable the mic
    button and enable the stop button

    -   Sends a GET request to the **/api/speech-to-text/token endpoint** to get
        the token needed to access Watson S2T service from the server app. Note
        the “when” & “.done()” specified here. This makes sure that the function
        is called synchronously rather than asynchronously so that we have the
        token before we execute the response function.

    -   It then executes the recogniseMicrophone function from the
        WatsonSpeech.js file to create a stream object passing the token and the
        name of the HTML object on the page to receive the output.

 

Notes
=====

Because we are interacting directly from the browser client to the service we
don’t to use the Node SDK!!!

 

Instead we use a Node package that has been created for client side JavaScript
to interact with S2T and T2S called **Watson Speech** (IBM Watson Speech
Services for Web Browsers)

 

Find out more here=\>

//https://www.npmjs.com/package/watson-speech

 

In fact in this ZeroToCognitive/Chapter03 project the main .js file from the
package (WatsonSpeech.js) was actually provided in the source code under the
client side HTML folder. This meant we did not install the package and it is not
listed as a dependency in package.json.

 

I think if I was doing this myself I’d install the package and use it that way
via

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
npm install watson-speech --save 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

 

 

 

 

 

 
