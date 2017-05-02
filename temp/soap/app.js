var soap = require('soap');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// var sslRootCAS = require('ssl-root-cas');
// sslRootCAS.addFile(__dirname + '/certificate.pem');

function querySafaricom() {
	var url = 'https://www.safaricom.co.ke/IPN/IpnWebRetrieval?wsdl';
	var args = { 'terminalMsisdn' : '254700369826', 'trxDate' : '2015-09-23', 'password' : 'cybercity1452' };


	soap.createClient(url, function (err, client) {
		if(err) {
			console.log(err.message);
		} else {
			client.retrieveTransactionsByDate(args, function(err, result) {
				if (err) {
					console.log(err.message);
				} else { 
					console.log(result);
				}
			});
		}

	});
}

function queryAirtel() {
	// Prod
	var url = 'https://41.223.56.58:44433/MerchantQueryService.asmx?wsdl';	
	var args = { userName: '9111627', passWord: 'xYber@2o15CT', timeFrom: '20160710110000', timeTo: '20160810140000' };
	
	// Test
	 //var url = 'https://41.223.56.58:7445/MerchantQueryService.asmx?wsdl';
	 //var args = { userName: '23545', passWord: '123456789', timeFrom: '20150923080000', timeTo: '20150923090000' };
	
	soap.createClient(url, function (err, client) {
		if(err) {
			console.log(err.message);
		} else {
			client.RequestTransactionByTimeInterval(args, function(err, result) {
				if (err) {
					console.log(err.message);
				} else { 
					console.log(result);
				}
			});
		}
	});

}

/*
var url = 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?wsdl';
var args = { 'ZIP' : '90071' };

soap.createClient(url, function (err, client) {
	//client.GetCityWeatherByZIP(args, function(err, result) {
	//	console.log(result);
	//});
	if(err) {
		console.log(err);
	} else {
		console.log(client);
	}
});
*/


//for (i = 0; i < 1; i++) {
//	console.log('Sending request ' + i + '\n');
//	querySafaricom();
//}

queryAirtel();
//querySafaricom();
