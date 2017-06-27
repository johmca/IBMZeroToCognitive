Zero T Cognitive Lecture Series - Chapter 05
============================================

 

About
-----

In chapter 05 we add the Natural Language Classifier service to our web page
that already has speech to text and text to speech capability.

 

A button is added to the web page to classify the text we type into the input
area. When pressed the text entered is sent to the NLC service and the output
(the classification) is displayed in a pop up window.

 

 

Additional Set Up
-----------------

1.  Set up an instance of NLC in Bluemix

2.  Retrieve service credentials and copy the credentials into the env.json file
    which now has an additional section for the new service (Note - add the
    credentials for STT and TTS again)

3.  Add the name of the Text to Speech service instance to manifest.yml (don’t
    need to unless you are pushing the node app up to run on Bluemix)

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
applications:
- path: .
  memory: 256M
  instances: 1
  domain: mybluemix.net
  name: Z2C
  host: Z2C
  disk_quota: 1024M
  services:
    - Speech to Text-jm
    - Text to Speech-jm
    - Natural Language Classifier-jm
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Install all modules defined in ../chapter05/package.json into Chapter05 project
folder (you did this in earlier chapters but each chapter is essentially its own
project in its own folder so do it again for Chapter05)

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
cd C:\Users\John\Desktop\IBM\ZeroToCognitive\Chapter05
npm install
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Set up Classifier
=================

There are two ways to create a new classifier

1) Use the REST APIs via CURL

2) There is a Beta toolkit available on the NLC service that can be used

 

I’ll stick with option (1) here but option (2) is really sef-evident. Just
upload your .csv file and wait till the classifier has finished then note the
classifier’s id.

 

OK to use CURL and the API

-   Replace username and password with credentials from your instance of the NLC

-   Specify your own .csv on training_data parm

-   Specify some description within metadata parm

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
curl -u "xxxxx":"yyyyy" -F training_data=@Documentation/industry.csv -F training_metadata="{\"language\":\"en\",\"name\":\"Industry 2016\"}" "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

This should take 10-25 mins depending on size of .csv to classify. Once the
classification is completed (by whatever method) we get a JSON back

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
{
  "classifier_id" : "359f3fx202-nlc-117822",
  "name" : "Industry 2016",
  "language" : "en",
  "created" : "2017-06-27T12:58:28.605Z",
  "url" : "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/359f3fx202-nlc-117822",
  "status" : "Training",
  "status_description" : "The classifier instance is in its training phase, not yet ready to accept classify requests"
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Note - the classifier is not yet ready to use  as it is still training

 

Take a note of the classifier ID from the JSON

 

To determine status use the following command (note thee classifier id is part
of this command)

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
curl -u "xxxxx":"yyyyyy"  "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/359f3fx202-nlc-117822"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Update our **classifier.js **file with our id in the line below

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Create instance of the classifier to use
var classifier_id_industry = process.env.NLC_CLASSIFIER_ID || "359f3fx202-nlc-117822";
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Server Changes
--------------

A new endpoint is added to the server app.

 

To do this we added a new route to the router.js file as follows...

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// classify using NLC

router.post('/api/understand/classifyInd*', classifier.classifyInd);

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

When a **POST** is received at the /**api/understand/classifyInd **endpoint we
execute method **classifier.classifyind()** which is defined in a new file
called **classifier.js **(it is sufficiently different from the text and speech
stuff to merit being kept somewhere different).

 

The new file **classifer.js** exports a single method **classifyInd** and uses a
private helper function to format the JSON coming back from NLC for printing

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Require libraries
var extend = require('extend'); //Extend one object by adding other objects
var cfenv = require('cfenv'); //Cloud Foundry environmen tlib
var watson = require('watson-developer-cloud'); //Watson SDK
//Require local files
var config = require("../../env.json"); //Local environment parms

var WATSON_NLC_SERVICE_NAME = "Watson-NLC-Service";

//Create application environment object from CF environment
var appEnv = cfenv.getAppEnv();

//Build service credentials - note use of config.watson_nlc - watson_nlc is the name of the
//NLC credentials section in our env.json
var serviceCreds = appEnv.getServiceCreds(WATSON_NLC_SERVICE_NAME) || process.env.NLC_CREDS || config.watson_nlc;

//Create instance of NLC passing our service creds
var natural_language_classifier = watson.natural_language_classifier(serviceCreds);
//Create instance of the classifier to use
var classifier_id_industry = process.env.NLC_CLASSIFIER_ID || "your classifier id goes inside these quote marks";

//Export the function which calls the NLC service so it can be referenced 
//by the router
//This function receives request and response obects from browser
exports.classifyInd = function(req, res) {
  console.log("Classifier entered");
  _text = req.body.cquery; //retrieve text from message body
  i_output = {};
  (function(_res) {
    //Call NLC classify function passing
    //i)  Object containing text and classifier to use
    //ii) A call back function to execute on completion
      natural_language_classifier.classify({
              text: _text,
              classifier_id: classifier_id_industry
          },
          //Callback function sends back sattus = 200 and formatted result
          function(err, response) {
              _res.writeHead(200, { "Content-Type": "text/plain" });
              _res.end(nlc_res("Industry", err, response));
          });
  })(res)
}

//This private function formats the results that come back from NLC for
//presentaiton in our pop up window
function nlc_res(classifier, err, response) {
  var _output = [];
  if (err) {
      console.log(classifier + ' error:', err);
      _output = { 'error': JSON.stringify(err, null, 2) };
  } else {
      _output = { results: JSON.stringify(response, null, 2) };
  }
  console.log("Printing from nlc_res");
  console.log(_output);
  return (JSON.stringify(_output, null, 2));
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

Client Changes
--------------

 

### HTML Changes

The **index.html** file has changed to add

-   A new button with id=”Classify Speech”

-   A new div called “modal” - initially empty

-   A new reference to a new JavaScript file at the end (z2c-NLC.js)

 

A new HTML page has been added called displayNLC.html

-   Div is named model_NLC and has class=modalDialog (we also have some CSS
    changes that instructs the browser how to present this class - see later)

-   There is a table named industryResult with 2 columns - Industry & confidence

-   A close button to get rid of the pop up window

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<div id="modal_NLC" class="modalDialog">
<div>
	<h2>Classified Text</h2>
	<div class="row">
		<div class="col-lg-12">
			<table class="table" id="industryResult">
					<thead> <tr> <th>Industry</th> <th>Confidence</th></tr> </thead>
					<tbody><tr></tr> </tbody></table>
			</div>
		</div>
		<div class="row">
			<center>
				<button type="button" id="close_NLC" class="btn btn-default" data-dismiss="modal">Close</button>
			</center>
		</div>
	</div>
</div>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

We changed **pageStyles.css** by adding the following

-   modalDialog defines the background appearance

-   modalDialog \> Div defines the table appearance

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.modalDialog {
	position: fixed;
	font-family: Arial, Helvetica, sans-serif;
	top: 0; right: 0; bottom: 0; left: 0;
	background: rgba(0,0,0,.8); color: #0F0F0F;
	z-index: 99999;
	opacity:1;
	-webkit-transition: opacity 400ms ease-in;
	-moz-transition: opacity 400ms ease-in;
	transition: opacity 400ms ease-in;
}

.modalDialog > div {
	width: 400px; position: relative; margin: 10% auto;
	padding: 5px 20px 13px 20px;
	border-radius: 10px;
	background: #fff;
	background: -moz-linear-gradient(#fff, #999);
	background: -webkit-linear-gradient(#fff, #999);
	background: -o-linear-gradient(#fff, #999);
}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

### JavaScript Changes

z2c-speech.js has been modified to specify that a function called displayNLC is
executed when we click on our new button.

Things to note

i) displayNLC calls checkNLC

ii) nlcPage specifies a new html page called displayNLC.

iii) stt_out is created elsewhere as the output from StT

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 displayNLC.on("click",  function()
    {
      var nlcPage = "displayNLC.html";
      checkNLC(nlcPage, stt_out);
    });
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Our new JavaScript file z2c-NLC.js contains two functions

- checkNLC is called when new Classify Speech button is pressed

- displayNLC is called to present results of NLC back to page

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

 

 

 

 

 

 

 

 

 

 

 
