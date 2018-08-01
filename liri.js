require("dotenv").config();
var request = require('request');
var fs = require('fs');
var twitter = require('twitter');
var requireSpotify = require('node-spotify-api');
var keys = require('./key.js');

var spotify = new requireSpotify(keys.spotify);
var twitterClient = new twitter(keys.twitter);

var userInput = process.argv[2];

// ************* CALLS FUNTION BASED ON USER INPUT **************** //
switch (userInput) {
  case 'my-tweets':
    callTwitter();
    break;

  case 'spotify-this-song':
    callSpotify();
    break;

  case 'movie-this':
    callOmdb();
    break;

  case 'do-what-it-says':
    callTheFile();
    break;
};

// ************* OMDB **************** //
function callOmdb(fileParam) {
    var movieTitle = process.argv[3] || fileParam;
    var omdbUrl = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy";
  
    request(omdbUrl, function(error, response, body) {
      if (!error && response.statusCode === 200){
        console.log(
          {'Movie Name: ': JSON.parse(body).Title},
          {'Release: ': JSON.parse(body).Year},
          {'IMDB Rating: ': JSON.parse(body).Ratings[0].Value},
          {'Rotten Tomatoes: ': JSON.parse(body).Ratings[1].Value},
          {'Country of Production: ': JSON.parse(body).Country},
          {'Language: ': JSON.parse(body).Language},
          {'Plot: ': JSON.parse(body).Plot},
          {'Featured Actors: ': JSON.parse(body).Actors}
        );
      }
    })
  };

// ************* SPOTIFY **************** //
function callSpotify(fileParam = 0) {
  var songTitle = process.argv[3]
  spotify.search({
    type: 'track',
    query: songTitle || fileParam
  }).then(function (response) {
    for (var i = 0; i < 5; i++) {
      console.log('Result ' + i + ':');
      console.log(
        {'Artist Name: ': response.tracks.items[i].artists[0].name},
        {'Preview URL: ': response.tracks.items[i].preview_url},
        {'Song Name: ': response.tracks.items[i].name},
        {'album: ': response.tracks.items[i].album.name}
      );
    };
  }).catch(function (err) {
      console.log(err);
  });
};

// ************* TWITTER **************** //
function callTwitter() {
  twitterClient.get('statuses/user_timeline', {
    screen_name: 'Liri75481009'
  }, function (error, tweets, response) {
    if (error) {
      console.log('there was an error');
      console.log(error);
    }
    console.log("Here are Liri Bots recent tweets:")
    for (var i = 0; i < tweets.length; i++) {
      console.log('Tweet ' + i + ": " + tweets[i].text)
    }
  })
};

// ************* FILE STORAGE **************** //
function callTheFile() {
  fs.readFile('random.txt', 'utf8', function (error, data) {
    if (error) {
      return console.log(error);
    };
    if (data.includes(',') === true) {
      var contentArray = data.split(",");
      console.log('it says: ' + contentArray[0] + contentArray[1]);
      if (contentArray[0].includes('spotify-this-song') === true) {
        var fileParam = contentArray[1];
        callSpotify(fileParam);
      }
      if (contentArray[0].includes('movie-this') === true) {
        var fileParam = contentArray[1];
        callOmdb(fileParam);
      }
    };
    if (data.includes(',') === false) {
      var contentArray = data;
      console.log('It says: ' + contentArray);

      if (contentArray.includes('my-tweets') === true) {
        callTwitter();
      } else {
        console.log('there was an error.');
      }
    }
  })
};