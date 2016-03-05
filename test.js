superagent = require('superagent')


var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

superagent
  // .get('http://requestb.in/xq0f4yxq')
  .get('https://app.xapix.io/api/v1/thb16_travel_genius/events')
  .set('Accept', 'application/json')
  .set('Authorization-Token', 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp')
  .query({'filter[type]': 'jazz'})
  .end(function(err, res){
    if (err || !res.ok) {
      console.log('Oh no! error');
      console.log(err);
    } else {
      var month = ''
      var eventNames = res.body.map(function (event) {
        month = monthNames[parseInt(event.startdate.split('.')[1])]
        return event.title + ' in ' + month;
      });
      eventNames.join(', ')
      console.log(eventNames)
    }
});
