var extend = require('extend');
var watson = require('watson-developer-cloud');
var vcapServices = require('vcap_services');
var config = require('../../env.json');


//JM01 export the token function
exports.token = function(req, res) {
  var sttConfig = extend(config.speech_to_text, vcapServices.getCredentials('speech_to_text'));
  var sttAuthService = watson.authorization(sttConfig);
//JM01 Call Watson Authorization module's getToken function to get token for S2Txt service
  sttAuthService.getToken({
      url: sttConfig.url
  }, function(err, token) {
      if (err) {
          console.log('Error retrieving token: ', err);
          res.status(500).send('Error retrieving token');
          return;
      }
      res.send(token);
  });
}
