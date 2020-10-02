exports.handler = (event, context, callback) => {
  const mongo = require("./mongo");
 // context.callbackWaitsForEmptyEventLoop = false;

  const Barion = require('barion-nodejs');
  var barion = new Barion(BarionTest);
  var response = "A támogatás küldése ";
  let params = new URLSearchParams(event.body);
  let POSKey = process.env.BARION_POSKEY;
  
  new Promise((resolve, reject)=> {
  barion.getPaymentState({ POSKey: POSKey, PaymentId: event.queryStringParameters.paymentId }, function(err, data) {
    if (!err && data.Status == 'Succeeded') {
      response += 'sikeres volt. Köszönöm, hogy adományával segíti a munkámat!';
	    resolve(data);
    } else {
      response += 'sikertelen volt.';
	    reject();
    }
  })}).then(async (data)=>{

	  const transactionData = data.Transactions[0]

	  await mongo.connect();
	  await mongo.updateTransaction({id: transactionData.TransactionId, status: transactionData.Status});
	  const dbResponse = await mongo.getCollection("transactions");
	  await mongo.close();
    return callback(null, {
      statusCode: 200,
      headers: {
	"Content-type": "charset=utf-8",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 
          'Origin, X-Requested-With, Content-Type, Accept'
      },
    body: JSON.stringify(dbResponse),
    //  body: "helo world"
  });
  }).catch((err)=> console.log(err));
}


