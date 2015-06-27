

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * For additional samples, visit the Alexa Skills Kit developer documentation at
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
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
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        }  else if (event.request.type === "IntentRequest") {
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
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("GuessNumberIntent" === intentName) {
        guessNumber(intent, session, callback);
    } else if ("StartIntent" === intentName) {
        startGame(intent, session, callback);
    } else if ("HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the Alexa game, number trap, "
        + "To begin, please say, start the game";
    var repromptText = "To begin, please say, start";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function speakNumber(low, high) {
    console.log("speakNumber: " + low);
    return "Number trap, " + low + " to " + high;
};

var DEFAULT_NUMBER = 99;
var LOW_NUMBER = 1;
var HIGH_NUMBER = DEFAULT_NUMBER;
/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
function startGame(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    sessionAttributes = {
//        numberTrap: Math.floor((Math.random() * DEFAULT_NUMBER) + 1),
        numberTrap: 50,
        lowNumber: LOW_NUMBER,
        highNumber: HIGH_NUMBER
    };
    speechOutput = speakNumber(sessionAttributes.lowNumber, sessionAttributes.highNumber)
        + ", To guess a number, say, my guess number is twenty five";
    console.log("numberTrap: " + sessionAttributes.numberTrap);
    console.log(speechOutput);
    repromptText = speakNumber(sessionAttributes.lowNumber, sessionAttributes.highNumber)
        + ", To guess a number, say, my guess number is twenty five";

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function generatePunishment() {
    return ". Truth or dare, "
        + "Who was your first crush, or who is your current crush?";
};

function guessNumber(intent, session, callback) {
    var cardTitle = intent.name;
    var guessNumber;
    var numberTrap;
    var lowNumber;
    var highNumber;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (session.attributes) {
        numberTrap = parseInt(session.attributes.numberTrap);
        lowNumber = parseInt(session.attributes.lowNumber);
        highNumber = parseInt(session.attributes.highNumber);
    }
    console.log("session.attributes.numberTrap: " + parseInt(session.attributes.numberTrap));
    guessNumber = parseInt(intent.slots.Number.value);
    console.log(guessNumber);
    if (!highNumber || !lowNumber || !numberTrap) {
        speechOutput = "You didn't start the game. Please say, start";
        shouldEndSession = false;
    } else if (!guessNumber) {
        speechOutput = "I don't know what you said, please say, "
            + "my guess number is twenty five";
        shouldEndSession = false;
    } else if (guessNumber === numberTrap) {
        speechOutput = "ha ha ha ha, You hit the trap";
        speechOutput += generatePunishment();
        shouldEndSession = true;
    } else if (guessNumber > highNumber || guessNumber < lowNumber) {
        speechOutput = "Your number is invalid, please say a number between "
            + lowNumber + " and " + highNumber;
        shouldEndSession = false;
    } else {
        if (guessNumber > numberTrap) {
            speechOutput = speakNumber(lowNumber, guessNumber - 1);
            highNumber = guessNumber - 1;
            shouldEndSession = false;
        } else {
            speechOutput = speakNumber(guessNumber + 1, highNumber);
            lowNumber = guessNumber + 1;
            shouldEndSession = false;
        }
    }
    sessionAttributes = {
        highNumber: highNumber,
        lowNumber: lowNumber,
        numberTrap: numberTrap
    };
    console.log(speechOutput);
    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}