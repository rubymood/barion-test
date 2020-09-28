exports.handler = function(event, context, callback) {

  require('dotenv').config();

  const Barion = require('barion-nodejs');
  // AWS-en régebbi node van aminél nincs globálisan behívva az URL
  const {URLSearchParams} = require('url');

  if (process.env['NODE_ENV'] == 'development') {
    var barion = new Barion(BarionTest);
    var redirectUrl = "https://barion.specialyoga.hu/adomany-valasz"; 
    console.log("development");

  } else {
    var barion = new Barion();
    var redirectUrl = "https://specialyoga.hu/adomany-valasz"; 
    console.log("production");

  }

  var BarionRequestBuilderFactory = barion.BarionRequestBuilderFactory;

  let POSKey = "";
  let params = new URLSearchParams(event.body);
  let amount = params.get('amount') || '1000';
  let taxCertificateMsg = "Adóigazolást ";
  if (params.get('tax_certificate')) {
    taxCertificateMsg += "kér.";
    POSKey = process.env.ADOIGAZOLAS_BARION_POSKEY;
    Payee = process.env.ADOIGAZOLAS_BARION_EMAIL;
    redirectUrl += "?tax_certificate=1";
    console.log("kért adóigazolást");
  } else {
    taxCertificateMsg += "nem kér.";
    POSKey = process.env.BARION_POSKEY;
    Payee = process.env.BARION_EMAIL;
    console.log("nem kért adóigazolást");
  }
  let paymentStartRequestBuilder  = new BarionRequestBuilderFactory.BarionPaymentStartRequestBuilder();
  console.log(redirectUrl);
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
            Comment: taxCertificateMsg + " " + params.get("comment"),
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
