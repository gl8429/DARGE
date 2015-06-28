/*
 Team name: Drage
 Team members:
 Dichen Li, Yijie Qiu, Guangyu Lin, Yi Ding, Zhongyang Xiao
 App name: morning brief, and number trap game
 API used:
 new york times top stories API http://developer.nytimes.com/docs/top_stories_api/#h2-examples
 yahoo finance API https://www.enclout.com/api/v1/yahoo_finance
 mashape weather API https://www.mashape.com/fyhao/weather-13#
 Numbers API http://numbersapi.com/#42
*/

var unirest = require('unirest');
var http = require("http");
var https = require("https");

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function(options, onResult) {
    console.log("rest::getJSON");

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};

//getWeather();
//unirest.get("https://verticodelabs.p.mashape.com/newspaper/?newspaper_url=http%3A%2F%2Fcnn.com%2F")
//    .header("X-Mashape-Key", "BX2mTryaeEmshUK4TukbvzwTWmd8p19ymcWjsnM4Li601VCWqP")
//    .header("Accept", "application/json")
//    .end(function (result) {
//        console.log(result.status, result.headers, result.body);
//    });

var DateGetter = function() {
    this.date = new Date();
}

DateGetter.prototype.getDate = function() {
    return this.date.getDate();
}

DateGetter.prototype.getMonth = function() {
    return this.date.getMonth() + 1;
}

//function getNews(callback) {
//    getNewsList(function(articles) {
//        for (url in articles) {
//            console.log("url: " + url);
//            console.log(/^.*?\/06\/27\/.*$/.test(url));
//        }
//    });
//}


//function getNewsList(callback) {
//    unirest.get("https://verticodelabs.p.mashape.com/newspaper/?newspaper_url=http%3A%2F%2Fcnn.com%2F")
//        .header("X-Mashape-Key", "BX2mTryaeEmshUK4TukbvzwTWmd8p19ymcWjsnM4Li601VCWqP")
//        .header("Accept", "application/json")
//        .end(function (result) {
//            console.log(result.body['article_urls']);
//            callback(result.body['article_urls']);
//        });
//}

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * For additional samples, visit the Alexa Skills Kit developer documentation at
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event: " + JSON.stringify(event));
        console.log("context: " + JSON.stringify(context));
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
    } else if ("HistoryTodayIntent" === intentName) {
        getDayInThePastIntentHandler(intent, session, callback);
    } else if ("NewsIntent" === intentName) {
        getNewsIntentHandler(intent, session, callback);
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
    var speechOutput = "failed";
//    var speech = "To start the number trap game, please say, start number trap game. "
//        + "To tell a fact of today in history, say tell me about today in history"
//        + "To tell more news, say news";
//    speechOutput = speech;
    var repromptText = null;
    var shouldEndSession = false;
    getWeather(function(weatherText){
        getStock(function(stockText) {
            getDayInThePast(function(DayInThePast) {
                getNews(0, function(newsText, newsList) {
                    sessionAttributes = {
                        newsIndex: "" + 1
                    }
                    speechOutput = "Welcome to morning brief. " + weatherText + stockText + DayInThePast + newsText
                        + ". to here more news, say news";
                    console.log("start to populate session..." + speechOutput);
//                    speechOutput = "ha ha";
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
                });
            });
        });
    });
}

function getNewsIntentHandler(intent, session, callback) {
    var numberOfNews = 1;
    var newsIndex = 1;
    if (session && session.attributes) {
        newsIndex = parseInt(session.attributes.newsIndex);
    }

    console.log("new intent handler: " + newsIndex);
    var sessionAttributes = {};
    var speechOutput = "Top" + newsIndex + " news: ";
    var cardTitle = "News brief";
    var repromptText = null;
    var shouldEndSession = false;

    getNewsList(function(newsList) {
        if (newsIndex >= newsList.length) {
            newsIndex = 0;
        }
        for (var i = newsIndex;
            i < newsIndex + numberOfNews && i < newsList.length;
            i++) {

            speechOutput += (". " + newsList[i].title
                + ". " + newsList[i].abstract);
        }
        speechOutput += ". To hear more news, say news";
        sessionAttributes = {
            newsIndex: newsIndex + numberOfNews
        };
        console.log(speechOutput);
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
}

function getDayInThePastIntentHandler(intent, session, callback) {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var sessionAttributes = {};
    var speechOutput = "failed";
    var cardTitle = "fact of day";
    var repromptText = "To begin, please say, tell me about today in history";
    var shouldEndSession = false;
    unirest.get("https://numbersapi.p.mashape.com/"
        + month + "/" + day + "/date?fragment=true&json=true")
    .header("X-Mashape-Key", "BX2mTryaeEmshUK4TukbvzwTWmd8p19ymcWjsnM4Li601VCWqP")
    .header("Accept", "text/plain")
    .end(function (result) {
        speechOutput = result.body.text;
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
};

function getDayInThePast(callback) {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dayInThePastText = ". failed. ";
    var shouldEndSession = false;
    unirest.get("https://numbersapi.p.mashape.com/"
        + month + "/" + day + "/date?fragment=true&json=true")
        .header("X-Mashape-Key", "BX2mTryaeEmshUK4TukbvzwTWmd8p19ymcWjsnM4Li601VCWqP")
        .header("Accept", "text/plain")
        .end(function (result) {
            dayInThePastText = ". Today in history. " + result.body.text;
            callback(dayInThePastText);
        });
};

function getNewsList(callback) {
    var optionsNYT = {
        host: 'api.nytimes.com',
        port: 80,
        path: '/svc/topstories/v1/home.json?api-key=e900c3cd0f9061e3e21b76a826a05a48:4:72394500',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    exports.getJSON(optionsNYT, function(code, json) {
        callback(json.results);
    });
}

function getNews(index, callback) {
    getNewsList(function(newsList) {
//        var index = Math.floor((Math.random() * json.results.length));
//        console.log(json.results[index].title);
        var text = (". Today's top news. " + newsList[index].title
            + ". " + newsList[index].abstract);
        callback(text);
    });
}

function getStock(callback) {
    unirest.get("https://www.enclout.com/api/v1/yahoo_finance/show.json?auth_token=zxCxAcN7zXVHwBtn_XsE&text=AMZN")
        .header("X-Mashape-Key", "BX2mTryaeEmshUK4TukbvzwTWmd8p19ymcWjsnM4Li601VCWqP")
        .header("Accept", "application/json")
        .end(function (result) {
            var open = parseFloat(result.body[0].open);
            var close = parseFloat(result.body[0].close);
            var percentChange = (close - open) / open * 100;
            var upDown = percentChange < 0 ? " traded down " : " was up ";
            var stockText = ". Stock price. Amazon.com" + upDown + (Math.round(Math.abs(percentChange) * 100) / 100) + "% yesterday, at " + close + " dollars";
            callback(stockText);
        });
}

function getWeather(callback) {
    unirest.get("https://simple-weather.p.mashape.com/weather?lat=-122.3331&lng=47.6097")
        .header("X-Mashape-Key", "BX2mTryaeEmshUK4TukbvzwTWmd8p19ymcWjsnM4Li601VCWqP")
        .header("Accept", "text/plain")
        .end(function (result) {
            callback("The weather is: " + result.body.trim() + ". ");
        });
}

function speakNumber(low, high) {
    return "Number trap, " + low + " to " + high;
}

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
        numberTrap: Math.floor((Math.random() * DEFAULT_NUMBER) + 1),
//        numberTrap: 23,
        lowNumber: LOW_NUMBER,
        highNumber: HIGH_NUMBER
    };
    speechOutput = speakNumber(sessionAttributes.lowNumber, sessionAttributes.highNumber)
        + ", To guess a number, say, my guess number is twenty five";
    repromptText = speakNumber(sessionAttributes.lowNumber, sessionAttributes.highNumber)
        + ", To guess a number, say, my guess number is twenty five";

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function generatePunishment() {
    return "";
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