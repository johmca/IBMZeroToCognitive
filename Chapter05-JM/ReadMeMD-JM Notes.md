Zero T Cognitive Lecture Series - Chapter 05
============================================

 

About
-----

This version of the app is a modification of Chapter05 app which adds a button
to classify any text input into the text area. The user can choose to have
Watson speak this text or classify this text. If speak is selected then the text
goes to Watson TtS as before. If classify is clicked then the text goes to
Watson NLC and the results are displayed in a pop up window same as for
classifying the spoken word as demonstrated in standard Chapter05.

 

After completing Chapter05 I simply copied the entire folder to Chapter05-jm.
There wereno additional set up steps required to the run the Chapter04-jm app
simply naviagte to the project folder and

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
node index.js
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

If running this sometime in the future then it is likley that the NLC service
instance referred to here will be long gone so you woudl need to follow the
steps in the Chapter05 JIM notes to

1.  Create a new NLC service instance

2.  Obtain service credentials and update the env.json file with these

3.  Create a new classifier using the industry.csv file, obtain the classifier
    id and update **classifier.js **(line 35) with the classifier id

 

 

Note - my changes break the capability to classify speech. This is because of
the way the app in Chapter05 was coded. The HTML element containing the text
gets passed into the checkNLC function and the text value of the element is
extracted there using the innerHTML property. Unfortunately when I pass in the
text area this no longer works and I need to use .value instead.

 

Server Changes
--------------

 

 

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

-   A new button with id=”Classify Text” copied from the “Classify Speech”
    button defined in Chapter05

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
<div class="row">

   <div class="col-md-6"><center><a id="classifyText" class="btn btn-primary" style="padding-left: 0.3em">Classify Text.</a></center></div>

</div>
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

### JavaScript Changes

z2c-speech.js has been modified to specify that a function called displayNLC is
executed when we click on our new “ClassifyText” button in exactly the same way
as “ClassifySpeech”.

 

Things to note

1.  displayNLC calls checkNLC

2.  nlcPage specifies a new html page called displayNLC.

3.  stt_out is created elsewhere and used as the output from StT

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 displayNLC.on("click",  function()
    {
      var nlcPage = "displayNLC.html";
      checkNLC(nlcPage, stt_out);
    });
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Our new JavaScript file z2c-NLC.js contains two functions

-   checkNLC is called when new Classify Speech button is pressed

-   displayNLC is called to present results of NLC back to page

 

 

 

 

 

 

 

 

 

 

 

 

 
