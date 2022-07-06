const express = require('express')
const bodyParser = require('body-parser');
const waafipay = require('waafipay-sdk-node').API("API-1901083745AHX", "1000297", "M0912269", { testMode: false }); // TestMode flag -->  true is production : false is test 

const app = express()
const port = 3333;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var charges;

app.post('/purchase', (req, res, next) => {
    const { accountNo, amount, currency, description } = req.body.userInfo;
    waafipay.apiPurchase({
        paymentMethod: "MWALLET_ACCOUNT",
        browserInfo: "sadfasdfasd",
        accountNo: accountNo,
        amount: amount,
        currency: currency,
        description: description
    }, function (err, res) {
        if (err) next(err);
        charges = res.params.merchantCharges;
        next();
    })
}, (req, res, next) => {
    const { restaurantName, restaurantAccount } = req.body;
    const { amount, currency, description } = req.body.userInfo;
    waafipay.getCreditAccount({
        paymentMethod: "MWALLET_ACCOUNT",
        accountNo: restaurantAccount,
        accountHolder: restaurantName,
        amount: amount - charges,
        currency: currency,
        description: "App name"
    }, function (err, data) {
        if (err) return next(err);
        res.json({responseCode: data.responseCode, responseMsg: data.responseMsg, params: data.params});
        next();
    })
})

app.get('/payment/:account/info', (req, res) => {
    const {account} = req.params;
    const {currency} = req.query;
    try {
        waafipay.getAccountInfo({
            paymentMethod: "MWALLET_ACCOUNT",
            accountNo: account,
            currency: currency,
         }, function(err, data){
            if (err) return next(err);
            res.json({responseCode: data.responseCode, responseMsg: data.responseMsg, params: data.params});
         })     
    } catch (error) {
        if (error) return next(error); 
    }
})
app.post('/payment/cancellation', (req, res) => {
    const {transactionId, description} = req.body;
    try {
        waafipay.preAuthorizeCancel({
            transactionId: transactionId,
            description: description,
         }, function(err, data){
            if (err) return next(err);
            res.json({responseCode: data.responseCode, responseMsg: data.responseMsg, params: data.params});
         })     
    } catch (error) {
        if (error) return next(error); 
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})