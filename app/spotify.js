var config = require('../config');
var cache = require('./cache');
var request = require('request');
var Youtube = require('./youtube');


function SpotifyService() {
    this.youtubeService = new Youtube();
    this.country = 'US';
    this.limit = 40;
}

SpotifyService.prototype.getAuth = function(callback) {
    var self = this;

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
            var token = body.access_token;
            // self.app.locals.token = token;
            cache.token = token;
            callback();
        }
    });
};

SpotifyService.prototype.getPlaylists = function() {
    var self = this;

    cache.playlistData = []; // Empty playlists.
    var date = formatLocalDate();

    var options = {
        url: 'https://api.spotify.com/v1/browse/featured-playlists',
        qs: {
            country: self.country,
            limit: self.limit,
            timestamp: date
        },
        headers: {
            //'Authorization': 'Bearer ' + self.app.locals.token
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    // Request featured-playlists.
    request.get(options, function(error, response, body) {
        var playlists = body.playlists.items;
        self.getTracks(playlists);
    });
}

SpotifyService.prototype.getTracks = function(playlists) {
    var self = this;

    for (var i = 0; i < playlists.length; i++) {
        cache.playlistData.push({
            playlist: playlists[i].name,
            image: playlists[i].images[0].url,
            tracks: []});


        // Request each playlist's tracks resource.
        self.getTrackData(playlists, i);
    }
}

SpotifyService.prototype.getTrackData = function(playlists, i) {
    var self = this;

    // Prepare request for each playlist resource.
    var options = {
        url: playlists[i].tracks.href,
        headers: {
            'Authorization': 'Bearer ' + cache.token
        },
        json: true
    };

    request.get(options, function(error, response, body) {

        for (var j = 0; j < body.items.length; j++) {
            if (cache.playlistData[i] !== undefined) {

                var trackName = body.items[j].track.name;
                var artistName = body.items[j].track.artists[0].name;
                var query = '{0} {1} {2}'
                    .replace('{0}', trackName)
                    .replace('{1}', artistName)
                    .replace('{2}', 'video');

                var order = j;


                // Search Youtube for track by name.
                self.youtubeService.searchYoutube(query, j, function(data) {
                    if (data !== null && data !== undefined) {
                        cache.playlistData[i].tracks.push(data);
                    }
                });
            }
        }
    });
}

function formatLocalDate() {
    var now = new Date(),
        tzo = -now.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return now.getFullYear()
        + '-' + pad(now.getMonth()+1)
        + '-' + pad(now.getDate())
        + 'T' + pad(now.getHours())
        + ':' + pad(now.getMinutes())
        + ':' + pad(now.getSeconds())
        + dif + pad(tzo / 60)
        + ':' + pad(tzo % 60);
}

module.exports = SpotifyService;
