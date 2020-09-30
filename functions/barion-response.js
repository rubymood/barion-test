exports.handler = (event, context, callback) => {

 // context.callbackWaitsForEmptyEventLoop = false;
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "barion";

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


  const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true, });
  const db = client.db(DB_NAME);

  const dbResponse = await db.collection("teachers").find({}).toArray();
  await client.close();
  console.log(dbResponse);
    return callback(null, {
      statusCode: 200,
      headers: {
	"Content-type": "charset=utf-8",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 
          'Origin, X-Requested-With, Content-Type, Accept'
      },
    //body: JSON.stringify(dbResponse),
      body: response
  });
  }).catch(err=> console.log(err));;
}


