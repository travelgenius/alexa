var superagent = require('superagent');
var moment = require('moment');
var findflightfromIataXtoIataY = require('./findflightfromIataXtoIataY.js')
var getIataCodeForCityName = require('./getIataCodeForCityName.js')
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function(event, context) {
  try {
    // console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    /**
     * Uncomment this if statement and populate with your skill's application ID to
     * prevent someone else from configuring a skill that sends requests to this function.
     */
    /*
    if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
         context.fail("Invalid Application ID");
    }
    */

    if (event.session.new) {
      onSessionStarted({ requestId: event.request.requestId }, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request,
        event.session,
        function callback(sessionAttributes, speechletResponse) {
          context.succeed(buildResponse(sessionAttributes, speechletResponse));
        });
    } else if (event.request.type === "IntentRequest") {
      onIntent(event.request,
        event.session,
        function callback(sessionAttributes, speechletResponse) {
          context.succeed(buildResponse(sessionAttributes, speechletResponse));
        });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
    ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  console.log("onLaunch requestId=" + launchRequest.requestId +
    ", sessionId=" + session.sessionId);

  // Dispatch to your skill's launch.
  getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
  console.log("onIntent requestId=" + intentRequest.requestId +
    ", sessionId=" + session.sessionId);

  var intent = intentRequest.intent,
    intentName = intentRequest.intent.name;

  // Dispatch to your skill's intent handlers
  if ("MyColorIsIntent" === intentName) {
    setColorInSession(intent, session, callback);
  } else if ("WhatsMyColorIntent" === intentName) {
    getColorFromSession(intent, session, callback);
  } else if ("AMAZON.HelpIntent" === intentName) {
    getWelcomeResponse(callback);
  } else if ("SearchEventsByType" === intentName) {
    getEventsByType(intent, session, callback);
  } else if ("SelectEvent" === intentName) {
    selectEvent(intent, session, callback);
  } else if ("NotInterested" === intentName) {
    endSession(intent, session, callback);
  } else if ("FindCheapestFlight" === intentName) {
    findCheapestFlight(intent, session, callback);
  } else {
    throw "Invalid intent";
  }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
    ", sessionId=" + session.sessionId);
  // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
  // If we wanted to initialize the session to have some attributes we could add those here.
  var sessionAttributes = {};
  var cardTitle = "Welcome";
  var speechOutput = //"Welcome to Travel Genius. " +
    "Please tell me where you would like to go.";
  // + " If you didn't decide on a specific event yet, ask me which events are available at a certain time.";
  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  var repromptText = "Please tell me which kind of event you would like to attend by saying, " +
    "I want to go to a Jazz Festival";
  var shouldEndSession = false;

  callback(sessionAttributes,
    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function getColorFromSession(intent, session, callback) {
  var favoriteColor;
  var repromptText = null;
  var sessionAttributes = session.attributes || {};
  var shouldEndSession = false;
  var speechOutput = "";

  if (session.attributes) {
    favoriteColor = session.attributes.favoriteColor;
  }

  if (favoriteColor) {
    speechOutput = "Your favorite color is " + favoriteColor + ". Goodbye.";
    shouldEndSession = true;
  } else {
    speechOutput = "I'm not sure what your favorite color is, you can say, my favorite color " +
      " is red";
  }

  // Setting repromptText to null signifies that we do not want to reprompt the user.
  // If the user does not respond or says something that is not understood, the session
  // will end.
  callback(sessionAttributes,
    buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function endSession(intent, session, callback) {
  var sessionAttributes = session.attributes || {};
  var speechOutput = "Have a good Hackatlon.";
  var repromptText = null;
  var shouldEndSession = true;
  console.log("==================== ENDING SESSION ==================")
  callback(sessionAttributes,
    buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function getEventsByType(intent, session, callback) {
  var repromptText = null;
  var sessionAttributes = session.attributes || {};
  var shouldEndSession = false;
  var speechOutput = "";
  var eventType = intent.slots.EventType.value;

  if (!eventType) {
    speechOutput = "You have to specify at least an event type, like for example, Jazz or Techno.";
    repromptText = null;
    return callback(sessionAttributes,
      buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
  }

  sessionAttributes.eventType = eventType

  superagent
    .get('https://app.xapix.io/api/v1/thb16_travel_genius/events')
    .set('Accept', 'application/json')
    .set('Authorization-Token', 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp')
    .query({ 'filter[type]': eventType })
    .end(function(err, res) {
      if (err || !res.ok) {
        speechOutput = "I apologize, there was an error retrieving the events from the database.";
        repromptText = "Please try again.";
        return callback(sessionAttributes,
          buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
      }
      var events = res.body;
      var eventDate = intent.slots.EventDate.value || sessionAttributes.eventDate;
      var eventLocation = intent.slots.EventLocation.value || sessionAttributes.eventLocation;

      if (eventDate) {
        console.log('======================================')
        console.log("eventDate: ", eventDate)
        console.log('======================================')
        var eventDate = moment(eventDate);
        sessionAttributes.eventDate = eventDate
        events = events.filter(function(event) {
          var eventStart = moment(event.startdate);
          return eventStart.isBetween(eventDate) || eventStart.isSame(eventDate)
        });
      }

      if (eventLocation) {
        console.log('======================================')
        console.log("eventLocation: ", eventLocation)
        console.log('======================================')

        eventLocation = eventLocation.toLowerCase();
        sessionAttributes.eventLocation = eventLocation;
        events = events.filter(function(event) {
          return eventLocation === event.city.toLowerCase() || eventLocation === event.country.toLowerCase()
        });
      }

      // limit to 5
      events = events.slice(0, 5)

      var eventNames = events.map(function(event) { return event.title; });



      if (events.length === 0) {
        repromptText = null;
        speechOutput = "I didn't find any " + eventType + " events"
        if (eventLocation) {
          speechOutput += ' in ' + eventLocation;
        }
      } else {
        speechOutput = "I have found " + events.length + " " + eventType + " events ";
        if (eventLocation) {
          speechOutput += ' in ' + eventLocation;
        }
        // if (eventDate) {
        // speechOutput += ' ' + eventDate.from(moment());
        // }
        sessionAttributes.events = events;
        speechOutput += ' : ' + eventNames.join(', ') + ". Does any of these events sound appealing to you?";
        repromptText = "Would you like to know more about any of the events?";
      }

      callback(sessionAttributes,
        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));

    });


  // speechOutput = "I now know your favorite color is " + favoriteColor + ". You can ask me " +
  // "your favorite color by saying, what's my favorite color?";



  // Setting repromptText to null signifies that we do not want to reprompt the user.
  // If the user does not respond or says something that is not understood, the session
  // will end.
  // callback(sessionAttributes,
  // buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function selectEvent(intent, session, callback) {
  var repromptText = null;
  var sessionAttributes = session.attributes || {};
  var shouldEndSession = false;
  var speechOutput = "";

  var eventName = intent.slots.EventName.value;

  var findEventByName = function(name, events) {
    name = name.toLowerCase();
    events.forEach(function(event) {
      if (name === event.title.toLowerCase()) {
        sessionAttributes.event = event
        speechOutput = event.title + ' starts ' + moment().calendar(event.date) + ' in ' + event.city + ', ' + event.country;
        // speechOutput += "If you would like to arrange transportation to the event, just ask me."
      }
    });

    speechOutput = speechOutput || "I didn't find any event named " + name + ". Please try again."
    callback(sessionAttributes,
      buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
  }
  if (!eventName) {
    var speechOutput = "I didn't get the name of the event you would like to know more about.";
    return callback(sessionAttributes,
      buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));

  }
  superagent
    .get('https://app.xapix.io/api/v1/thb16_travel_genius/events')
    .set('Accept', 'application/json')
    .set('Authorization-Token', 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp')
    // .query({ 'filter[name]': eventName })
    .end(function(err, res) {
      if (err || !res.ok) {
        speechOutput = "I apologize, there was an error retrieving the events from the database.";
        repromptText = "Please try again.";
        callback(sessionAttributes,
          buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
      } else {
        var events = res.body
        findEventByName(eventName, events)
      }
    });
}

function findCheapestFlight(intent, session, callback) {
  var repromptText = null;
  var sessionAttributes = session.attributes || {};
  var shouldEndSession = false;
  var speechOutput = "";

  var event = sessionAttributes.event

  if (!event) {
    speechOutput = "You need to tell me where you would like to go first by asking information about an event."
    return callback(sessionAttributes,
      buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
  }


  getIataCodeForCityName(event.city, findFlight)
  console.log("city:", event.city)
  function findFlight (Iatacodes) {
    var IATA = Iatacodes[0].iata;
    console.log("IATA: ", IATA)
    findflightfromIataXtoIataY('BER', IATA, event.startdate, '', sendEmail);
  }
  function sendEmail (flights) {
    console.log("SENDEMAIL: ")

    var cheapest = flights[0];
    console.log(cheapest)
    speechOutput = "I found a few flights. The cheapest one costs " + cheapest.minprice + " euros."
    speechOutput += "I also found some accomodation options. Do you want me to send you an email with all the details ready to book?"
    return callback(sessionAttributes,
      buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));

  }
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    card: {
      type: "Simple",
      title: "SessionSpeechlet - " + title,
      content: "SessionSpeechlet - " + output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
}
