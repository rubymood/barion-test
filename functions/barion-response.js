exports.handler = function(event, context, callback) {

  const Barion = require('barion-nodejs');
  const {URLSearchParams} = require('url');

    var barion = new Barion(BarionTest);

  var BarionRequestBuilderFactory = barion.BarionRequestBuilderFactory;
  var response = "A támogatás küldése ";
  var getPaymentStateRequestBuilder = new BarionRequestBuilderFactory.BarionGetPaymentStateRequestBuilder();
  let params = new URLSearchParams(event.body);
  let POSKey = process.env.BARION_POSKEY;
  
  var getPaymentStateOptionsWithObject = {
    POSKey      : POSKey,
    PaymentId   : event.queryStringParameters.paymentId
  };

  barion.getPaymentState(getPaymentStateOptionsWithObject, function(err, data) {
    if (!err && data.Status == 'Succeeded') {
      response += 'sikeres volt. Köszönöm, hogy adományával segíti a munkámat!';
    } else {
      response += 'sikertelen volt.';
    }

    return callback(null, {
      statusCode: 200,
      headers: {
	"Content-type": "charset=utf-8",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 
          'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: response
    });
  });

}


