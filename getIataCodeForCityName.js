var request = require('request');
var util = require('util');

XAPIX_API_KEY = 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp';

function getIataCodeForCityName(city, callback) {

    var xapix_options = {
        url: 'https://app.xapix.io/api/v1/thb16_travel_genius/iata_codes?filter%5Bcity%5D=' + city,
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

function getIataCodeForCityNameCallback(res) {
    //console.log(res);

    return res;
}

//getIataCodeForCityName('Berlin', getIataCodeForCityNameCallback);
