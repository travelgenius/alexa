var request = require('request');
var util = require('util');
var nodemailer = require('nodemailer');
var swig = require('swig');

XAPIX_API_KEY = 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp';

function getEmailByName(name, callback) {
    market = 'DE';
    currency = 'EUR';
    locale = 'en-GB';

    var xapix_options = {
        url: 'https://app.xapix.io/api/v1/thb16_travel_genius/friends?filter%5Bname%5D=' + name,
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

            //console.log(info);

            callback(info);
        }
    }
    request(xapix_options, xapix_callback);
}

function sendEmailTo(email, yourname, tgevent, tgaccommondations, tgflight, tgskyscanner) {
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport('see slack');

    MAIL = swig.renderFile('mailToMe.html', {
        name: yourname,
        event: tgevent,
        accommondations: tgaccommondations,
        flight: tgflight,
        skyscanner: tgskyscanner,
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Travel Genius" <travelgenius@technotravel.com>', // sender address
        to: email, // list of receivers
        subject: 'TRAVEL GENIUS: We have some recommondations for going to ' + tgevent.title + '!', // Subject line
        text: 'Please activate HTML to see our recommondations.', // plaintext body
        html: MAIL // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
    //console.log(MAIL);
}

tgevent1 = { 'title': "Long Festival", 'startdate': '2016-03-28', 'enddate': '2016-04-01', 'city': 'Berlin', 'address': 'Hauptbahnhof', 'country': 'Germany', 'image': 'https://farm1.staticflickr.com/24/96601739_444032d6fa_z_d.jpg' };
tgevent2 = { 'title': "OneDay Festival", 'startdate': '2016-03-28', 'city': 'Berlin', 'address': 'Hauptbahnhof', 'country': 'Germany', 'image': 'https://farm1.staticflickr.com/24/96601739_444032d6fa_z_d.jpg' };

accommondations = [{
    headline: 'Facilities to include: Fishing, Hot Tub, Sauna, fitness suite and games room',
    accommodations: '2 BR, 1.0BA, Sleeps 4',
    bathrooms: 1,
    bedrooms: 2,
    bookwithconfidence: true,
    reviewaverage: 5,
    reviewcount: 1,
    minstayrange_0_minstaylow: 1,
    minstayrange_0_minstayhigh: 3,
    query_latitude: '50.8621493',
    query_longitude: '0.06862449999999999',
    max_distance_in_km: '5',
    listingurl: 'https://www.homeaway.co.uk/p1780006?uni_id=3491470',
    detailsurl: 'https://ws.homeaway.com/public/listing?id=1780006',
    regionpath: 'East Sussex > Lewes Bungalow #1780006',
    longitude: '0.10327966',
    latitude: '50.89458926',
    thumbnail_0_width: '133',
    thumbnail_0_uri: 'http://imagesus.homeaway.com/mda01/4829a683-ff1b-4b2a-b132-6ea2f1737b37.1.1',
    thumbnail_0_secureuri: 'https://imagesus-ssl.homeaway.com/mda01/4829a683-ff1b-4b2a-b132-6ea2f1737b37.1.1',
    thumbnail_0_imagesize: 'SMALL',
    thumbnail_0_height: '100',
    listingid: '1780006',
    web_api_endpoint_id: 118
}];

flight = {
    minprice: 228,
    inbound_partial_date: '',
    outbound_partial_date: '2016-03-29',
    destination_place: 'NAP',
    origin_place: 'BER',
    locale: 'en-EN',
    currency: 'EUR',
    market: 'DE',
    quotedatetime: '2016-03-04T07:03:00',
    inboundleg_0_departuredate: '2016-04-01T00:00:00',
    inboundleg_0_destinationid: '84892',
    inboundleg_0_originid: '69968',
    inboundleg_0_carrierids: '[858]',
    outboundleg_0_departuredate: '2016-03-29T00:00:00',
    outboundleg_0_destinationid: '69968',
    outboundleg_0_originid: '84892',
    outboundleg_0_carrierids: '[838]',
    direct: 'nil',
    quoteid: '2',
    web_api_endpoint_id: 133
};

skyscanner = { 'from': 'berl', 'to': 'napl', 'startdate': '160329', 'enddate': '160401' };



//getEmailByName('Christoph', printCallback);

module.exports = getEmailByName
