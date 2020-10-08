exports.handler = function(event, context, callback) {

  const Barion = require('barion-nodejs');
  var barion = new Barion(BarionTest);
  var redirectUrl = "http://172.105.82.236:8888/barion-valasz"; 
  const mongo = require("./mongo");


  let params = new URLSearchParams(event.body);
  let amount = params.get('amount') || '1000';
  let POSKey = process.env.BARION_POSKEY;
  let Payee = process.env.BARION_PAYEE_EMAIL;
  
  let  paymentStartOptionsWithObject = {
    POSKey: POSKey,
    PaymentType: "Immediate",
    GuestCheckOut: true,
    FundingSources: ["All"],
    PaymentRequestId: "fa-01",
    Locale: "hu-HU",
    Currency: "HUF",
    Transactions: [
        {
            POSTransactionId: "fa-01-01",
            Payee: Payee,
            Total: amount,
            Items: [
                {
                    Name: "Adomány",
                    Description: "Adomány küldése",
                    Quantity: 1,
                    Unit: "db",
                    UnitPrice: amount,
                    ItemTotal: amount
                }
            ]
        }
    ],
    RedirectUrl: redirectUrl
  };

  //barion.BarionRequestBuilderFactory.BarionPaymentStartRequestBuilder();
  new Promise((resolve, reject)=> {
  barion.startPayment(paymentStartOptionsWithObject, function(err, data) {
    if (err) {
      location = "/adomany-hiba";
	    reject();
    } else {
      location = data.GatewayUrl;
	    resolve(data);
    }
  })}).then(async (data)=>{

	  const transactionData = data.Transactions[0]

	  await mongo.connect();
	  await mongo.insertTransaction({id: transactionData.TransactionId, status: transactionData.Status});
//	  const dbResponse = await mongo.getCollection("transactions");
	  await mongo.close();

    return callback(null, {
      statusCode: 302,
      headers: {
        Location: location,
        'Cache-Control': 'no-cache',
      },
   //   body: JSON.stringify(dbResponse)
    });
  }).catch(err=> console.log(err));
}
