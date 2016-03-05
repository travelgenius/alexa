var superagent = require('superagent');

var findflightfromIataXtoIataY = require('./findflightfromIataXtoIataY.js')
var getIataCodeForCityName = require('./getIataCodeForCityName.js')
var getHomeAwayHousesNearAdress = require('./getHomeAwayHousesNearAdress.js')

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
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

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
    var speechOutput = "Welcome to Travel Genius. " +
        "Please tell me which event you would like to attend. If you didn't decide on a specific event yet, ask me which events are available at a certain time.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me which kind of event you would like to attend by saying, " +
        "I want to go to a Jazz Festival";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function createFavoriteColorAttributes(favoriteColor) {
    return {
        favoriteColor: favoriteColor
    };
}

function getColorFromSession(intent, session, callback) {
    var favoriteColor;
    var repromptText = null;
    var sessionAttributes = {};
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

function getEventsByType(intent, session, callback) {
    var favoriteColor;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var eventTypeSlot = intent.slots.EventType;
    var eventDateSlot = intent.slots.DateType;

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    if (eventTypeSlot) {
        var eventType = eventTypeSlot.value;
        sessionAttributes = { eventType: eventType };

        superagent
            .get('https://app.xapix.io/api/v1/thb16_travel_genius/events')
            .set('Accept', 'application/json')
            .set('Authorization-Token', 'GT4oMmLgAKk5HPBO2s6i9bawtuIYcDlp')
            .query({ 'filter[type]': eventType })
            .end(function(err, res) {
                if (err || !res.ok) {
                    speechOutput = "I apologize, there was an error retrieving the events from the database.";
                    repromptText = "Please try again.";
                    callback(sessionAttributes,
                        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
                } else {
                    var month = ''
                    var eventNames = res.body.map(function(event) {
                        month = monthNames[parseInt(event.startdate.split('.')[1])]
                        return event.title + ' in ' + month;
                    });

                    speechOutput = "I have found the following events, " + eventNames.join(', ');
                    repromptText = "Which one would you like to go to?";
                    callback(sessionAttributes,
                        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
                }
            });


        // speechOutput = "I now know your favorite color is " + favoriteColor + ". You can ask me " +
        // "your favorite color by saying, what's my favorite color?";

    } else {
        speechOutput = "I'm not sure what your favorite color is. Please try again";
        repromptText = "I'm not sure what your favorite color is. You can tell me your " +
            "favorite color by saying, my favorite color is red";
        callback(sessionAttributes,
            buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));

    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    // callback(sessionAttributes,
    // buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function getHouse(intent, session, callback) {
    var favoriteColor;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var eventTypeSlot = intent.slots.EventType;
    var eventDateSlot = intent.slots.DateType;

    if (eventTypeSlot) {
        var eventType = eventTypeSlot.value;
        sessionAttributes = { eventType: eventType };

        function voiceCallback(data) {
            console.log(data.length);

            if (data.length != 0) {
                speechOutput = 'I have found ' + data.length + ' accommondations for you.';
                repromptText = "Which one would you like to go to?";
                callback(sessionAttributes,
                    buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));

            } else {
                speechOutput = 'I didnot find any accommondation!';
                repromptText = "What should i do now?";
                callback(sessionAttributes,
                    buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
            }
        }

        getHomeAwayHousesNearAdress('Glynde, UK', 5, voiceCallback);
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
