console.log("Start WRIO RESTFUL Web API");

var nconf = require('nconf'),
    fs = require('fs');
 
// Favor command-line arguments and environment variables.
nconf.env().argv();
 
// Check for a config file or the default location.
if (path = nconf.get('conf')) {
  nconf.file({file: path});
}
else if (fs.statSync('./lib/config.json')) {
//	nconf.file({file: './lib/config.json'});
	nconf.file('./lib/config.json');
	}
 



var express = require('express');
var url = 'api/stripe'
var bodyParser = require('body-parser')
var app = express();
var server = require('http').createServer(app).listen(1234);
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
	host: nconf.get('mysql:host'),
	user: nconf.get('mysql:user'),
	password: nconf.get('mysql:password'),
	database: nconf.get('mysql:database'),
});
// console.log(nconf.get('mysql:host') + " " + nconf.get('mysql:user') + " " + nconf.get('mysql:password') + " " + nconf.get('mysql:database') + " ");

var mailer = require('express-mailer');

mailer.extend(app, {
	from: nconf.get('mail:from'),
	host: nconf.get('mail:host'), // hostname
	secureConnection: nconf.get('mail:secureConnection'), // use SSL
	port: nconf.get('mail:port'), // port for secure SMTP
	transportMethod: nconf.get('mail:transportMethod'), // default is SMTP. Accepts anything that nodemailer accepts
	auth: {
		user: nconf.get('mail:user'),
		pass: nconf.get('mail:pass'),
	}
});

// console.log(nconf.get('mail:from') + " " + nconf.get('mail:host') + " " + nconf.get('mail:secureConnection') + " " + nconf.get('mail:port') + " " + nconf.get('mail:transportMethod') + " " + nconf.get('mail:user') + " " + nconf.get('mail:pass'));

// Add headers
app.use(function (request, response, next) {
	console.log(next);
	// Website you wish to allow to connect
	response.setHeader('Access-Control-Allow-Origin', 'http://telesens.cloudapp.net');

	// Request methods you wish to allow
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	response.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();

});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var stripe = require('stripe')('sk_test_4TXrVaIIQQTpzLk2lZ8YfHvp');
app.post(url + '/donate', function (request, response) {
	var chargeData = {
		amount: request.body.amount,
		currency: 'usd',
		card: request.body.stripeToken,
		description: 'Donatation for WRIO'
	}

	//console.log(chargeData);
	stripe.charges.create(chargeData, function (error, charge) {
		response.json(charge);
		var transactionId = "id" in charge;
		if (transactionId) {
			var query = 'INSERT INTO webRunes_webGold (TransactionId, Amount , Added, UserId ) values ( ?,?,NOW(),? )';
			connection.query(query, [charge.id, charge.amount, request.body.userid ], function (error, result) {
			});
		} else {
			response.json(error.message);
		}
	});
});

app.post(url + '/withdraw', function (request, response) {
	var query = 'INSERT INTO webRunes_webGold_withdraw (Amount , Added, UserId ) values (?,NOW(),? )';
	connection.query(query, [request.body.amount, request.body.userid ], function (error, result) {
	});
});

router.get(url+'/data',function(request, response){
    console.log("Inside data..");
});

app.set('view engine', 'jade');
app.post(url + '/sendemail', function (request, response) {
	//console.log(request.body)
	app.mailer.send('email', {
		to: request.body.to,// REQUIRED. This can be a comma delimited string just like a normal email to field.
		subject: request.body.subject,      // REQUIRED.
		message: request.body.message                 // All additional properties are also passed to the template as local variables.
	}, function (error) {
		if (error) {
			//console.log(error);
			response.send('There was an error sending the email');
			return;
		}
		response.send('Email Sent');
	});
});

console.log("Web application opened.");