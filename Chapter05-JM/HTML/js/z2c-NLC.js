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
// displayNLC results
//Args i) _display is the name of the html file containing the pop up window
//     ii) _source is an HTML element
//          - if called from classifySpeech button this willbe stt_out ()
//          - if called from classifyText button this will be the text are (#chat)
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
//displayNLC function is called above
// i)  _target is the HTML object (the table)
//ii)  _results is the data (returned from the POST)
function displayNLC(_target, _results)
{
  var target = _target;
  target.find("tr:not(:first)").remove(); //remove any existing rows from target
  indName = _results[0]["class_name"];
  var len = _results.length; //Work out number of rows required to display data
  _idx = 0;
  while (_idx < len) //Loop round each class returned and add rows to table
  {
    //Note - Bob says he used anonumous function here becuase Javascript will add
    //final row say 10 times???he seems to think its important
    (function(_idx, data)
      {  _className = data[_idx]["class_name"];//Get class name e.g. Defence or Aurospace
         _classConfidence = data[_idx]["confidence"];//Get confidence
      //Add HTML for a new row to target table (_cStr used here to make it shorter)
        target.append("<tr><td style='width: 60%'>"+_className +"</td><td>"+
        _classConfidence+"</td></tr>");
        })
      (_idx, _results)
    _idx++; //increment counter
  }
  target.append("</table>"); //Add closing HTML parenthesis

}
