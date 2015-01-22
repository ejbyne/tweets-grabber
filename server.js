var express = require('express');
var app = express();
var server = require('http').createServer(app);
var Twit = require('twit');
var fs = require('fs');

var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

server.listen(port, function() {
  console.log('Server listening on port ' + port);
});

var auth = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var insideM25 = ['-0.5804005', '51.2369701', '0.248181', '51.6543771'];

var stream = auth.stream('statuses/filter', { locations: insideM25 });

var count = 0

stream.on('tweet', function (tweet) {

  fs.appendFile("./tweets.txt", JSON.stringify(tweet) + "\n", function(err) {
    if(err) {
      console.log(err);
    } else {
      count++;
      console.log(count + ' ' + tweet.text);
    }
  });
});

module.exports = server;