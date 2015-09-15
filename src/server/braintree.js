import {Router} from 'express';
import wrioLogin from './wriologin';
import nconf from './wrio_nconf';
import braintree from 'braintree';
import {sendEmail} from './wrio_mailer.js';
import db from './db';
import path from 'path';

const router = Router();

const TEMPLATE_PATH = path.resolve(__dirname, '../client/views/');
console.log(wrioLogin);

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: nconf.get("payment:braintree:merchantId"),
    publicKey: nconf.get("payment:braintree:publicKey"),
    privateKey: nconf.get("payment:braintree:privateKey")
});
console.log("Creating braintree object");

router.get("/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
        if (err) {
            console.log("client_token error",err);
            return;
        }
        res.send(response.clientToken);
    });
});

router.post("/payment-methods", function  (req, res)  {

    wrioLogin.loginWithSessionId(req.sessionID, function(err, User) {

        if (err) {
            console.log("User not found");
            return response.status(403).render('index.ejs', {"error": "Not logged in", "user": undefined});
        }

        var userId = User.userID;

        var nonce = req.body.payment_method_nonce;
        var webRunes_webGold = db.db.collection('webRunes_webGold');
        var amount = parseFloat(req.body.amount);
        if (isNaN(amount) || (amount < 0) || !nonce) {
            res.status(400).send({"error": "bad request"});
        }
        if (isNaN(amountWRG) || (amountWRG < 0)) {
            res.status(400).send({"error": "bad request"});
        }
        console.log("Got nonce", nonce);
        // Use payment method nonce here
        gateway.transaction.sale({
            amount: amount,
            paymentMethodNonce: nonce
        }, function (err, result) {
            if (err) {
                console.log("processing nonce error", err);
                res.sendFile(path.join(TEMPLATE_PATH, '/failure.html'));
                return;
            }
            console.log("processing transaction: ", result);
            res.sendFile(path.join(TEMPLATE_PATH, '/success.html'));
            var obj = {
                Amount: amountWRG,
                Added: $currentDate,
                UserId: userId
            };
            webRunes_webGold.insert(obj, function (error) {
                //connection.query(query, [charge.id, amountInWRG, userId], function(error, result) {
                return console.log(error);
            });
        });
    });
});



router.post('/add_funds', async (request, response) => {
    try {
/*        console.log(wrioLogin);
        let user = await wrioLogin.getLoggedInUser(request.sessionID);
        console.log(user);
        let token = await stripe.tokens.create({
            card: {
                number: request.body.creditCard,
                exp_month: request.body.month,
                exp_year: request.body.year,
                cvc: request.body.cvv
            }
        });
        let charge = await stripe.charges.create({
            amount: request.body.amount * 100,
            currency: 'usd',
            source: token.id
        });*/
        // TODO: set user email
        /*
         let info = await sendEmail({
         from: 'info@webrunes.com',
         to: 'useremail@gmail.com',
         subject: 'WebRunes payment was submited',
         html: '<b>Success</b>'
         });
         */
        response.status(200).send('Success');
    } catch(e) {
        console.log('Error:', e.message);
    }
});

router.post('/donate', function(request, response) {
    var webRunes_webGold = db.db.collection('webRunes_webGold');
    wrioLogin.loginWithSessionId(request.sessionID, function(err, User) {
        if (err) {
            console.log("User not found");
            return response.render('index.ejs', {"error": "Not logged in", "user": undefined});
        }

        var chargeData = {
            amount: request.body.amount * 100,
            currency: 'usd',
            card: request.body.stripeToken,
            description: 'Donatation for WRIO'
        }

        var userId = User.userID;
       /* stripe.charges.create(chargeData, function(error, charge) {
            if (error) {
                console.log("Create charge error: ", error);
                return response.json(error.message);
            }
            response.json(charge);
            var flagCharge = (charge != null);
            if (flagCharge) {
                var transactionId = "id" in charge;
                if (transactionId) {
                    //var query = 'INSERT INTO webRunes_webGold (TransactionId, Amount , Added, UserId ) values ( ?,?,NOW(),? )';
                    var amountInWRG = 100 * charge.amount / nconf.get('payment:WRGExchangeRate');
                    var obj = {
                        TranactionId: charge.id,
                        Amount: amountInWRG,
                        Added: $currentDate,
                        UserId: userId
                    };
                    webRunes_webGold.insert(obj,function(error) {
                        //connection.query(query, [charge.id, amountInWRG, userId], function(error, result) {
                        return console.log(error);
                    });
                } else {
                    return response.json(error.message);
                }
            } else {
                return response.json({"message": "Fail to charge."});
            }
        });*/
    });
});

router.post('/withdraw', function(request, response) {
    var webRunes_webGold_withdraw = db.db.collection('webRunes_webGold_withdraw');
    var ssid = request.sessionID;
    //var query = 'INSERT INTO webRunes_webGold_withdraw (Amount , Added, UserId ) values (?,NOW(),? )';
    //connection.query(query, [request.body.amount, ssid], function(error, result) {
    var obj = {
        Amount: request.body.amount,
        Added: $currentDate,
        UserId: ssid
    }
    webRunes_webGold_withdraw.insert(obj,function(error,result) {

    });
});

export default router;