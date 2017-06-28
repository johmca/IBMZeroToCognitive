Zero To Cognitive Lecture Series - Chapter 05 - JM Enhancement
==============================================================

 

About
-----

Thie JM version of the app is a modification of the Z2C Chapter05 app which adds
a button to classify any text input into the text area. The user can choose to
have Watson speak this text or classify this text. If speak is selected then the
text goes to Watson TtS as before. If classify is clicked then the text goes to
Watson NLC and the results are displayed in a pop up window same as for
classifying the spoken word as demonstrated in standard Chapter05.

 

After completing Chapter05 I simply copied the entire folder to Chapter05-jm.
This included all npm modules in node_modules folder so no need for another
init. There were no additional set up steps required to the run the Chapter05-jm
app simply naviagte to the project folder and execute

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
node index.js
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Then go to the browser and navigate to localhost: port number the server is
listening on to view the screen.

 

If running this sometime in the future then it is likely that the NLC service
instance referred to here will be long gone so you would need to follow the
steps in the Chapter05 JM notes to

1.  Create a new NLC service instance

2.  Obtain new service credentials and update the env.json file with these

3.  Create a new classifier using the industry.csv file, obtain the classifier
    id and update **classifier.js** (line 35) with the classifier id

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Create instance of the classifier to use

var classifier_id_industry = process.env.NLC_CLASSIFIER_ID || "359f3fx202-nlc-117822"; //Use the id of your classifier here
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Note - I think my changes break the capability to classify speech. This is
because of the way the app in Chapter05 was coded. The HTML element containing
the text gets passed into the checkNLC function and the text value of the
element is extracted there using the innerHTML property. Unfortunately when I
pass in the text area this no longer works and I need to use the value property
instead. This could be fixed I’m sure but I don’t have time and I won’t learn
anything of great value from doing it so I’m leaving it for now.

 

Server Changes
--------------

None were required

 

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

 

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  
  var classifyText = $("#classifyText"); //assign variable to new button
  var chat = $("#chat");                 //assign variable to input text area

  //Click on classifyText button - same as classifySpeech except we
  //simply pass the input text entered into the text area
  classifyText.on("click",()=>{
      var nlcPage = "displayNLC.html";
      checkNLC(nlcPage, chat);
  });
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

I need to make a change to checkNLC() because the innerHTML property that
contains the text for classification when executed from the Classify Speech
button no longer holds the text when executing from the Classify Text button and
I used .value instead.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function checkNLC(_display, _source)
{
  var options = {};
  options.cquery = _source[0].value; //Extract text entered into HTML and stick it in cquery property of object
  //Execute get(_display) and do a POST to the classify endpoint
  //When these things are done then execute our function pasing
  //  i)   _page which is the result from get(_display) and is essentially the HTML for our new screen
  //) ii)  _nlc_results is the result passed back on the POST from the NLC
  console.log(`Running client side checkNLC function..._source=${_source[0].value}, data sent=${options.cquery}`);
  $.when($.get(_display), $.post('/api/understand/classifyInd', options)).done(function(_page, _nlc_results){

    var _target= $("#modal"); //modal is the name of the empty div we added o index.html
    _target.append(_page); //add the HTML retirved by get(_display) above to the div
    _target.height($(window).height()); //set height of our div to height of main window (full screen)
    _target.show(); //Display it
    _data = _nlc_results[0]; //Use first row in results
    console.log('Data',_data);
    //Parse data twice becuase we did stringify twice
    //classes are key value pairs of industry and confidence
    _classes = JSON.parse(JSON.parse(_data).results).classes;
    //Call displayNLC fucntion passing ane of our table and classes array
    displayNLC($("#industryResult"), _classes);
    //Create close button within our div and define click function
    closeNLC=$("#close_NLC");
    closeNLC.on("click", function(){
      console.log("closeNLC clicked.")
      $("#modal").empty();
    });
  });

}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

 

 

 

 

 

 

 

 

 

 

 

 

 
