var request = require('request');
var util = require('util');

GOOGLE_API_KEY = 'AIzaSyCbLWPBJBc3YPcCNvKX-ZdytwpHsiMCE2M';
XAPIX_API_KEY = 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp';

function getHomeAwayHousesNearAdress(address, distance, callback) {
    var google_options = {
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + GOOGLE_API_KEY,
        headers: {
            'User-Agent': 'request'
        }
    };

    function google_callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            //console.log(util.inspect(info, false, null));
            try {
                var gps = info.results[0].geometry.location;
                //console.log(gps);

                var xapix_options = {
                    url: 'https://app.xapix.io/api/v1/thb16_travel_genius/location_search_results?filter%5Bquery_latitude%5D=' + gps.lat + '&filter%5Bquery_longitude%5D=' + gps.lng + '&filter%5Bmax_distance_in_km%5D=' + distance,
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
                            if (a.reviewaverage > b.reviewaverage)
                                return -1;
                            else if (a.reviewaverage < b.reviewaverage)
                                return 1;
                            else
                                return 0;
                        }

                        info.sort(compare);

                        callback(info);
                    }
                }
                request(xapix_options, xapix_callback);

            } catch (ex) {
                info = {};
                callback(info);
            }


        }
    }
    request(google_options, google_callback);
}

//getHomeAwayHousesNearAdress('Glynde, UK', 5, reviewAverageCallback);

module.exports = getHomeAwayHousesNearAdress
