var findflightfromIataXtoIataY = require('./findflightfromIataXtoIataY.js')
var getIataCodeForCityName = require('./getIataCodeForCityName.js')
var getHomeAwayHousesNearAdress = require('./getHomeAwayHousesNearAdress.js')

function printCallback(data) {
    console.log(data.length);
}

findflightfromIataXtoIataY('BER', 'NAP', '2016-03-29', '2016-04-01', printCallback);
getHomeAwayHousesNearAdress('Glynde, UK', 5, printCallback);
getIataCodeForCityName('Berlin', printCallback);
