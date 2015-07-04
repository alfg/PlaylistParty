var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var morgan = require('morgan');

var app = express();
var config = require('../config')
var routes = require('./api/routes');


var request = require('request');
var google = require('googleapis');
var youtube = google.youtube('v3');

var token;
var playlistData = [];

// getAuth();
// searchYoutube('in and out of love');

// configure app
app.use(morgan('dev')); // log requests to the console
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

app.get('/', function (req, res) {
    getAuth(function() {
        getPlaylists();
    })
    // searchYoutube('in and out of love', function(data) {
    //     res.json({data: data});
    // });
});

app.get('/data', function (req, res) {
    res.json({data: playlistData});
});

// register api v1 routes
app.use('/api', routes.index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

module.exports = app;

function searchYoutube(query, callback) {
    var params = {
        part: 'snippet',
        q: query,
        key: config.googleApiKey
    }
    youtube.search.list(params, function(result, data) {
        console.log(result, data.items[0].id.videoId);
        callback(data.items[0].id.videoId);
    });
};

function getAuth(callback) {
    // Request Authorization Options.
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(config.client_id + ':' + config.client_secret).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    // Request Authorization.
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            // Prepare Auth Bearer.
            token = body.access_token;
            callback();
        }
    });

};

function getPlaylists() {
    var options = {
        url: 'https://api.spotify.com/v1/browse/featured-playlists',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true
    };

    // Request featured-playlists.
    request.get(options, function(error, response, body) {
        var playlists = body.playlists.items;
        getTracks(playlists);
    });
};

function getTracks(playlists) {

    for (var i = 0; i < playlists.length; i++) {

        // Prepare request for each playlist resource.
        var options = {
            url: playlists[i].tracks.href,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            json: true
        };

        // Request each playlist's tracks resource.
        (function (i) {
            request.get(options, function(error, response, body) {
                // console.log('\n\n===================');
                // console.log(playlists[i].name);
                // console.log('===================\n');
                playlistData.push({playlist: playlists[i].name, tracks: []});

                for (var j = 0; j < body.items.length; j++) {
                    // console.log(body.items[j].track.name);
                    // playlistData[i].tracks.push(body.items[j].track.name);
                    if (playlistData[i] !== undefined) {
                        console.log(playlistData[i].tracks);
                        playlistData[i].tracks.push(body.items[j].track.name);
                    }

                };

            });
        })(i);
    };
};
