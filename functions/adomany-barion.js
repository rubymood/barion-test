exports.handler = function(event, context, callback) {

  const Barion = require('barion-nodejs');
  var barion = new Barion(BarionTest);
  var redirectUrl = "http://139.162.139.104:8888/barion-valasz"; 

  var BarionRequestBuilderFactory = barion.BarionRequestBuilderFactory;

  let params = new URLSearchParams(event.body);
  let amount = params.get('amount') || '1000';
  let POSKey = process.env.BARION_POSKEY;
  let Payee = process.env.BARION_PAYEE_EMAIL;
  let paymentStartRequestBuilder  = new BarionRequestBuilderFactory.BarionPaymentStartRequestBuilder();
  
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

  barion.startPayment(paymentStartOptionsWithObject, function(err, data) {
    if (err) {
      console.log(err);
      location = "/adomany-hiba";
    } else
      console.log(data);
      location = data.GatewayUrl;

    return callback(null, {
      statusCode: 302,
      headers: {
        Location: location,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(err || data)
    });
  });
}
