var request = require('request');
var util = require('util');

XAPIX_API_KEY = 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp';

function getSkyScannerHotelByDateAndLatLngAndGuestsAndRoom(lat, lng, checkindate, checkoutdate, guests, rooms, callback) {
    market = 'DE';
    currency = 'EUR';
    locale = 'en-GB';

    var xapix_options = {
        url: 'https://app.xapix.io/api/v1/thb16_travel_genius/hotels?filter%5Bmarket%5D=' + market + '&filter%5Bcurrency%5D=' + currency + '&filter%5Blocale%5D=' + locale + '&filter%5Bentity_id%5D=' + lat + '%2C' + lng + '-latlong&filter%5Bcheckindate%5D=' + checkindate + '&filter%5Bcheckoutdate%5D=' + checkoutdate + '&filter%5Bguests%5D=' + guests + '&filter%5Brooms%5D=' + rooms,
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

            function compare(a, b) {
                if (a.popularity > b.popularity)
                    return -1;
                else if (a.popularity < b.popularity)
                    return 1;
                else
                    return 0;
            }

            info.sort(compare);
            //console.log(info);

            callback(info);
        }
    }
    request(xapix_options, xapix_callback);
}

//getSkyScannerHotelByDateAndLatLngAndGuestsAndRoom('52.519444444444', '13.406666666667', '2016-03-29', '2016-04-02', '2', '1', printCallback);

module.exports = getSkyScannerHotelByDateAndLatLngAndGuestsAndRoom
