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
var classifier_id_industry = process.env.NLC_CLASSIFIER_ID || "359f3fx202-nlc-117822";

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
