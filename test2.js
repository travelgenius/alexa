var findflightfromIataXtoIataY = require('./findflightfromIataXtoIataY.js')
var getIataCodeForCityName = require('./getIataCodeForCityName.js')
var getHomeAwayHousesNearAdress = require('./getHomeAwayHousesNearAdress.js')
var getSkyScannerHotelByDateAndLatLngAndGuestsAndRoom = require('./getSkyScannerHotelByDateAndLatLngAndGuestsAndRoom.js')

function printCallback(data) {
    console.log(data.length);
}

findflightfromIataXtoIataY('BER', 'NAP', '2016-03-29', '2016-04-01', printCallback);
getHomeAwayHousesNearAdress('Glynde, UK', 5, printCallback);
getIataCodeForCityName('Berlin', printCallback);
getSkyScannerHotelByDateAndLatLngAndGuestsAndRoom('52.519444444444', '13.406666666667', '2016-03-29', '2016-04-02', '2', '1', printCallback);
