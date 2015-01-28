var express = require('express');
var app = express();
var server = require('http').createServer(app);
var Twit = require('twit');
var fs = require('fs');
var mongoose = require('mongoose');
var Tweet = require('./app/tweetRepo.js');
var port = process.env.PORT || 3000;
var buffer;

mongoose.connect("mongodb://localhost:27017/tweets_production");

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  // response.sendFile(__dirname + '/views/index.html');
});

server.listen(port, function() {
  // console.log('Server listening on port ' + port);
});

var auth = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var insideM25 = ['-0.5804005', '51.2369701', '0.248181', '51.6543771'];

var stream = auth.stream('statuses/filter', { locations: insideM25 });

// var count = 0

stream.on('tweet', function(tweet) {

  var date = new Date();
  var today = date.getDay();

  fs.appendFile(today + ".txt", JSON.stringify(tweet) + "\n", function(err) {
    if(err) {
      console.log(err);
    } else {
      // count++;
      // console.log(count + ' ' + tweet.text);
    }
  });

  if (tweet.coordinates != null && latIsFine(tweet.coordinates.coordinates[1]) && longIsFine(tweet.coordinates.coordinates[0])) {
    var newTweetObject = new Tweet;
    var hourCreated = new Date(tweet.created_at).getHours();

    newTweetObject._id = tweet.id_str;
    newTweetObject.createdAt = tweet.created_at;
    newTweetObject.timeSlot = findTimeSlot(hourCreated);
    newTweetObject.content = tweet.text;
    newTweetObject.longitude = tweet.coordinates.coordinates[0];
    newTweetObject.latitude = tweet.coordinates.coordinates[1];
    newTweetObject.userId = tweet.user.id_str;
    newTweetObject.username = tweet.user.screen_name;
    newTweetObject.save();
  };
});

function latIsFine (latitude){
  return latitude >= 51.2369701 && latitude <= 51.6543771;
}

function longIsFine(longitude){
  return longitude >= -0.5804005 && longitude <= 0.248181;
}

function findTimeSlot(hourCreated) {
  return Math.floor(hourCreated / 4) + 1;
}

module.exports = server;
