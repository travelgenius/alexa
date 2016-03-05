var findflightfromIataXtoIataY = require('./findflightfromIataXtoIataY.js')

findflightfromIataXtoIataY('BER', 'NAP', '2016-03-29', '2016-04-01', minPriceCallback);

function minPriceCallback (data) {
	console.log(data);
}
