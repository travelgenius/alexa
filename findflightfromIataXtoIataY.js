var request = require('request');
var util = require('util');

XAPIX_API_KEY = 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp';

function findflightfromIataXtoIataY(iataX, iataY, outbound_partial_date, inbound_partial_date, callback) {
    market = 'DE';
    currency = 'EUR';
    locale = 'en-EN';

    var xapix_options = {
        url: 'https://app.xapix.io/api/v1/thb16_travel_genius/flight_quotes?filter%5Bmarket%5D=' + market + '&filter%5Bcurrency%5D=' + currency + '&filter%5Blocale%5D=' + locale + '&filter%5Borigin_place%5D=' + iataX + '&filter%5Bdestination_place%5D=' + iataY + '&filter%5Boutbound_partial_date%5D=' + outbound_partial_date + '&filter%5Binbound_partial_date%5D=' + inbound_partial_date,
        headers: {
            'Accept': 'application/json',
            'Authorization-Token': XAPIX_API_KEY
        }
    };
    //console.log(xapix_options.url);

    function xapix_callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            //console.log(util.inspect(info, false, null));
            callback(info);
        }
    }
    request(xapix_options, xapix_callback);

}

function minPriceCallback(res) {
    function compare(a, b) {
        if (a.minprice < b.minprice)
            return -1;
        else if (a.minprice > b.minprice)
            return 1;
        else
            return 0;
    }

    res.sort(compare);

    //console.log(res);

    return res;
}

findflightfromIataXtoIataY('BER', 'NAP', '2016-03-29', minPriceCallback);

//findflightfromIataXtoIataY('BER', 'NAP', '2016-03-29', '2016-04-01', minPriceCallback);
